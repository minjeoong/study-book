---
title: LLM 호출 설계 — 테스트·캐시·라우팅
en: Mock Testing, Caching, Router, Workflow Patterns, Evaluator-Optimizer
summary: 비결정적인 LLM 호출을 Mock·골든셋으로 테스트하고, 캐시·라우팅·호출 쪼개기로 비용과 품질을 함께 잡는 실무 패턴
importance: 2
order: 7
tags:
  - Spring AI
  - 테스트
  - 비용 최적화
  - 워크플로
keypoints:
  - 답 내용은 단정하지 않는다 — 모킹 · 계약 검증 · 골든셋 세 층으로 테스트
  - 가장 싼 호출은 부르지 않는 호출 — 캐시, 쉬운 건 작은 모델로 라우팅
  - 정확도가 안 나오면 프롬프트를 늘리지 말고 호출을 쪼갠다
qa:
  - q: 매번 답이 달라지는 AI 코드는 어떻게 테스트하나?
    a: 세 층으로 나눈다. 매 커밋 CI에서는 ChatModel을 Mock으로 바꿔 정해진 응답을 주고 우리 로직(프롬프트 조립, 후처리, 예외 처리)만 검증하고, 배포 전에는 실제 모델을 소량 불러 형식·필수 필드·값 범위 같은 계약을 검증한다. 프롬프트나 모델을 바꿀 때는 골든셋 30문항 내외로 통과율을 재 품질 회귀를 막고, 답 문장을 isEqualTo로 단정하는 테스트는 만들지 않는다.
  - q: LLM 호출 비용과 지연을 줄이는 방법은?
    a: 반복되는 질문은 @Cacheable로 모델 호출 자체를 없애되, 개인화·실시간 데이터가 섞인 질문은 캐시하지 않는다. 공급자의 프롬프트 캐싱은 반복되는 앞부분을 싸게 처리하므로 시스템 프롬프트·공통 지침·예시처럼 고정된 것을 앞에, 날짜·질문 같은 가변값은 뒤에 둔다. 분류·추출은 소형 모델에 온도 0, 복잡한 추론만 대형 모델로 보내는 라우팅과 컨텍스트 축소도 함께 쓴다.
  - q: Router 패턴과 Evaluator-Optimizer 패턴을 설명하라.
    a: Router는 값싼 모델로 질문 유형(FAQ, 문서 질문, 복잡 추론)을 먼저 분류하고 유형별로 작은 모델·RAG·큰 모델 같은 다른 경로로 보내 비용·품질·지연을 함께 잡는다. Evaluator-Optimizer는 초안을 만들고 평가자가 통과 여부와 피드백을 주면 반영해 다시 쓰는 루프로, 호출이 2~3배 늘어 품질이 비용보다 중요할 때만 쓴다. 교정 루프는 while이 아니라 횟수 상한을 둔 if로 만들어야 모델이 끝없이 고치지 않는다.
related:
  - prompt-engineering
  - structured-output
  - observability-fallback
  - rag-advanced
source: 슬라이드 p.151–171(7장 Mock 테스트·모델 선택·결정론적 테스트·호출 최적화 파이프라인·응답 캐시·프롬프트 캐싱·Router·워크플로 패턴·병렬 처리·CoT 심화·enum 검증·Evaluator-Optimizer·배치 처리·라우터와 교정 실습), p.143–144(긴 문서 Map-Reduce·토큰 비용) — Day 2 (08-19), 실습 07_라우터와교정, ch06_advanced, 13_병목과캐시
---

```flow
요청 :: 사용자 질문
캐시 확인 :: 같은 질문이면 모델을 부르지 않고 즉시 반환
난이도별 라우팅 :: 분류기(소형·온도 0) → FAQ / 문서(RAG) / 복잡(대형·에이전트)
컨텍스트 축소 :: 필요한 근거만, 긴 대화는 요약
모델 호출 :: 이 작업에 충분한 모델로
```

| 워크플로 패턴 | 형태 | 언제 |
| --- | --- | --- |
| Chaining | 단계1 → 단계2 → 단계3 | 앞 결과가 뒤의 입력일 때, 실패 지점이 보임 |
| Parallel | 작업 A·B·C 동시 → 집계 | 독립 작업 여러 건 (지연만 줄고 비용은 그대로, 전용 스레드 풀로 상한) |
| Routing | 분류기 → 전용 경로 | 유형별로 처리 방식이 다를 때 |
| Orchestrator-Workers | 오케스트레이터 → Worker N개 → 합성 | 작업 개수를 미리 모를 때 |
| Evaluator-Optimizer | 초안 → 평가 → 피드백 재작성 | 품질이 비용보다 중요할 때, 반복 상한 필수 |

```java
@Test
void 요약_서비스가_모델_응답을_반환한다() {
    ChatModel model = mock(ChatModel.class);                 // 가짜 모델 — 비용·비결정성 없음
    given(model.call(any(Prompt.class))).willReturn(chatResponseOf("요약본"));
    var service = new SummaryService(ChatClient.create(model));

    assertThat(service.summarize("긴 글")).isEqualTo("요약본"); // 우리 로직만 검증
}
// 실제 모델 계약 검증은 내용이 아니라 형식으로
// assertThat(ticket.category()).isIn("BILLING", "DELIVERY", "REFUND", "ETC");
```

> [!warn] 헷갈리기 쉬움
> 시스템 프롬프트에 `LocalDate.now()`를 넣으면 날짜가 바뀔 때마다 앞부분이 달라져 프롬프트 캐시가 통째로 무효가 된다. 고정된 것만 앞에, 가변값은 사용자 메시지 쪽으로 보낸다.
