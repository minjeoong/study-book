---
title: AI는 어느 계층에 두나
en: Layered Architecture for AI Features
summary: AI는 새 계층이 아니라 기존 계층에 얹히는 관심사 — 컨트롤러는 AI를 모르고 호출은 서비스에서
importance: 3
order: 1
tags:
  - Spring Boot
  - 계층 구조
  - 설계
keypoints:
  - 위에서 아래로만 호출 — 계층 분리의 목적은 변경의 파급을 가두는 것
  - 컨트롤러는 ChatClient를 모른다, AI 호출·프롬프트 조립은 Service
  - 권한 조건은 쿼리 안에, 엔티티 대신 DTO, 예외는 한 곳에서 응답으로
qa:
  - q: AI 기능은 어느 계층에 두어야 하나?
    a: ChatClient를 컨트롤러에서 직접 부르는 것이 가장 흔한 실수다. 컨트롤러는 요청을 받아 서비스에 넘기기만 하고, 어떤 프롬프트·도구를 쓸지 같은 업무 판단은 Service가, ChatClient와 Advisor 조립은 config가, 로깅·안전·메모리 같은 공통 관심사는 Advisor가 맡는다. 이렇게 나누면 모델이나 프롬프트를 바꿔도 웹 계층은 그대로 남는다.
  - q: 남의 주문을 조회하지 못하게 하려면 어디서 막나?
    a: findById로 꺼낸 뒤 자바 코드에서 소유자를 비교하면 한 곳만 빠뜨려도 새어 나가므로, findByIdAndOwnerId처럼 소유자 조건을 쿼리 자체에 넣는다. 또 남의 주문과 없는 주문에 똑같이 404와 같은 메시지를 돌려줘, 존재하는 주문번호를 훑는 공격에 힌트를 주지 않는다. Day 1 실습에서 99999(user2 소유)와 00000(없음)이 같은 응답을 받는 것으로 확인했다.
  - q: AI 호출이 실패하면 화면은 어떻게 해야 하나?
    a: 요약 같은 AI 기능은 부가 정보이므로 실패해도 화면 전체가 실패하면 안 된다. 예외를 응답으로 바꾸는 일은 @RestControllerAdvice 한 곳에서 하고, 사용자에게는 안전한 문구와 추적 ID만, 상세는 로그에만 남긴다. 실습에서는 모델 호출을 try-catch로 감싸 실패하면 상품명과 상태로 만든 폴백 문구를 돌려줬다.
related:
  - chatclient
  - observability-fallback
  - spring-rest/layered-dto-validation
  - spring-rest/ioc-di-bean
source: 슬라이드 p.10–41(1장 Spring Boot 기초 — 계층·어노테이션 지도·빈·DTO·@Configuration·AOP·예외 처리·Swagger·프로파일·테스트·로깅·AI 배치), p.94–104(Day 1 실습 주문 요약 API) — Day 1 (08-18), 실습 01_간식추천_3계층, 07_계층위에AI얹기_주문요약
---

```flow
web/ChatController :: 인증 확인, 질문·세션 ID만 서비스로 — AI를 모른다
advisor :: 감사(order 0) → 입력 차단 → 메모리 (차단은 저장보다 먼저)
rag/RetrievalService :: 질문으로 문서 검색 → 근거를 프롬프트에
service :: 프롬프트 조립 → 모델 호출, 필요하면 tools 호출 (권한은 아래 계층에서)
dto :: 답변 + 출처 + 도구 사용 여부로 조립해 반환
```

| 패키지 | 책임 | 바뀌는 이유 |
| --- | --- | --- |
| config | ChatClient·Advisor 조립, 기본 옵션 | 모델·공급자 교체 |
| service | 업무 흐름, 프롬프트 조립 | 업무 규칙 변경 |
| rag | 인제스트·검색·근거 구성 | 문서와 검색 품질 |
| tools | 모델이 부를 수 있는 행동 | 연동 시스템 추가 |
| advisor | 로깅·안전·메모리 같은 공통 관심사 | 정책·감사 요구 |
| web | REST·SSE, AI를 모름 | 화면 요구 |

```java
@Service
@Transactional(readOnly = true)
public class OrderSummaryService {
    private final OrderRepository orders;
    private final ChatClient summaryChat;          // config에서 만든 요약 전용 빈

    public SummaryResponse summarize(String orderId, String userId) {
        Order order = orders.findByIdAndOwnerId(orderId, userId)   // 권한은 쿼리 안에
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        String summary = summaryChat.prompt()
                .user(u -> u.text("주문번호 {id} · 상품 {item} · 상태 {status}\n한 문장으로 요약해 줘.")
                        .param("id", order.getId()).param("item", order.getItem())
                        .param("status", order.getStatus().label()))
                .call().content();
        return new SummaryResponse(order.getId(), summary);
    }
}
```

> [!tip] 면접 팁
> "실패는 계층마다 다른 얼굴로 나타난다 — 400은 검증(Controller), 404는 업무 규칙(Service), 500은 SQL·연결(Repository), 503·타임아웃은 모델 호출"처럼 계층과 상태 코드를 짝지어 말하면 설계 이해도가 드러난다.
