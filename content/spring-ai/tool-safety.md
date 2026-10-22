---
title: 도구 안전 — 감사·권한·승인 게이트
en: Tool Audit Logging, Authorization, Human-in-the-loop, Agent Loop Limits
summary: 행동하는 AI는 통제가 핵심 — 감사 로그, 코드로 강제한 권한, 되돌릴 수 없는 일은 사람 승인
importance: 3
order: 12
tags:
  - Spring AI
  - 보안
  - Agent
  - HITL
keypoints:
  - 자율성의 크기는 되돌릴 수 있는 정도에 맞춘다 — 조회는 넓게, 쓰기는 좁게
  - 환불·삭제는 도구가 PENDING 접수까지만, 승인 API는 도구 목록에 없다
  - 에이전트 루프엔 횟수·토큰·시간 상한, 같은 호출 반복이면 중단
qa:
  - q: 승인 게이트(Human-in-the-loop)는 어떻게 구현하나?
    a: 환불·삭제·발송처럼 되돌리기 어려운 행동은 도구가 실행하지 않고 PENDING 상태의 티켓만 만들어 "접수되었습니다, 담당자 승인 후 처리됩니다"라고 모델에 돌려준다. 실제 처리는 @PreAuthorize("hasRole('ADMIN')")가 걸린 별도 관리자 API로 사람이 누르는데, 이 API는 도구로 등록하지 않아 모델은 존재조차 모르고 구조적으로 부를 수 없다. 접수 사실도 감사 로그에 남긴다.
  - q: 도구 호출 감사 로깅은 어떻게 하나?
    a: 도구마다 로그 코드를 넣지 않고 @Around("@annotation(org.springframework.ai.tool.annotation.Tool)") Aspect로 모든 @Tool 호출을 가로채 도구명·인자·사용자·성공 여부·소요 시간을 기록한다. 실패도 남기고 인자의 주민번호·카드번호는 마스킹하며, traceId를 함께 찍어 한 요청의 컨트롤러·검색·도구·모델 로그를 이어 볼 수 있게 한다. 과제에서는 모델이 실제로 도구를 불렀고 도구가 status=FAIL로 막았다는 것을 이 로그로 증명했다.
  - q: 에이전트가 폭주하지 않게 하려면?
    a: 에이전트는 스스로 멈추지 않을 수 있으므로 반복 횟수·토큰·시간에 모두 예산을 걸고, 같은 도구를 같은 인자로 다시 부르면 진전이 없는 것으로 보고 중단한다. 도구가 '다시 시도해 보세요'를 반환하면 모델이 곧바로 같은 도구를 또 부르므로, 재시도는 우리 코드 안에서 횟수를 정해 하고 모델에게는 결과만 알린다. 도구가 5~7개를 넘어 선택 정확도가 떨어질 때 비로소 역할별 멀티 에이전트를 검토한다.
related:
  - tool-calling-mcp
  - advisors-memory
  - observability-fallback
  - spring-rest/proxy-aop
source: 슬라이드 p.259–275(11장 감사 로깅 AOP·@PreAuthorize·승인 게이트·Tool 설계 원칙·루프 제어·최적화·반환값·멀티 에이전트·도구 테스트·간식 주문 승인 실습), p.297–308(Day 3 실습 상담 에이전트·권한 시나리오·레드팀) — Day 3 (08-20), 실습 11_승인게이트, ch10_toolsafe, 과제 Day 3·종합 실습
---

```flow
모델 :: "12345 환불해 줘" → requestRefund 도구 호출 결정
도구 (접수만) :: 소유자 검증 → 티켓 PENDING 생성 → 감사 로그 → "접수되었습니다"
대기 목록 :: GET /admin/tickets/pending — 사람이 확인
사람 승인 :: POST /admin/tickets/{no}/approve — @PreAuthorize(ADMIN), 도구 목록에 없음
처리 :: APPROVED, decidedBy=admin 기록
```

| 장치 | 무엇을 막나 | 구현 지점 |
| --- | --- | --- |
| 감사 로깅 | 무슨 일이 있었는지 모르는 상황 | @Tool 대상 @Around Aspect 또는 가장 바깥 Advisor |
| 마스킹 | 로그에 쌓이는 개인정보 | 인자 정규식 치환 |
| 권한 제어 | 도구를 통한 권한 우회 | ToolContext + 쿼리 조건, @PreAuthorize |
| 승인 게이트 | 되돌릴 수 없는 자동 실행 | 도구는 접수만, 처리는 사람 |
| 입력 검증 | 모델이 넘긴 이상한 값 | 허용 목록으로 좁힘 |
| 반환값 설계 | 토큰 낭비·내부 구조 노출 | 엔티티 대신 필요한 필드만 담은 문장·record |

```java
@Test
void 타인_주문은_차단된다() {                        // 모델 없이 도구를 직접 호출
    String result = tools.getOrder("99999", new ToolContext(Map.of("userId", "user1")));
    assertThat(result).isEqualTo("해당 주문을 찾을 수 없습니다.");
}

@Test
void 환불은_접수까지만_된다() {
    var view = tools.requestRefund("12345", "단순 변심", ctx("user1"));
    assertThat(tickets.find(view.no()).status()).isEqualTo(TicketStatus.PENDING);
}
```

> [!warn] 프롬프트는 예의, 코드는 권한
> 레드팀(지시 무시, 권한 우회, 도구 오용, 간접 인젝션, 반복 유도, 비용 공격)에서 한 번이라도 뚫린 경로는 프롬프트가 아니라 코드로 막는다. 응답 문구가 "정보가 없습니다"여도 도구가 아예 안 불려서 우연히 막힌 것일 수 있으니, toolsUsed·감사 로그로 실제 실행 내역을 확인한다.
