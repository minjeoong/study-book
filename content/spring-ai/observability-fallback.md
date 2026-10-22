---
title: 관찰 가능성과 폴백
en: Observability (Micrometer, Token Meter, Trace ID), Fallback, Retry
summary: 토큰·지연·도구 호출을 지표와 traceId로 보이게 하고, 모델이 실패해도 폴백으로 서비스를 살린다
importance: 2
order: 14
tags:
  - Spring AI
  - 운영
  - Micrometer
  - 장애 대응
keypoints:
  - 셋만 재도 시작 — 토큰 · 지연 · 도구 호출, 태그를 붙여 기능별로
  - 한 요청은 traceId로 컨트롤러 → 검색 → 도구 → 모델까지 따라간다
  - 일시적 오류는 재시도, 지속 실패는 예비 모델·정형 응답으로 폴백
qa:
  - q: LLM 서비스를 운영할 때 무엇을 모니터링하나?
    a: 비용은 토큰을 따라가므로 Usage의 프롬프트·완성 토큰을 Micrometer 카운터로 쌓고, 지연은 타이머로, 도구 호출은 도구명·성공 여부 태그를 붙여 기록한다. 이 계측을 가장 바깥 order의 TokenMeterAdvisor 한 곳에서 하면 모든 호출이 빠짐없이 잡히고 /actuator/metrics로 확인할 수 있다. 최종 과제에서 19회 호출에 50,182토큰(약 0.0082달러)이 쓰였는데 프롬프트 토큰이 완성 토큰의 약 32배여서, 비용의 대부분이 답변이 아니라 RAG 근거·도구 정의·대화 이력 같은 컨텍스트에서 나온다는 것을 확인했다.
  - q: 모델 호출이 실패하면 어떻게 대응하나?
    a: AI는 외부 네트워크 의존이라 실패·지연·한도 초과(429)가 정상 범주이므로 타임아웃과 폴백을 기본으로 설계한다. 일시적 오류는 @Retryable이나 spring.ai.retry로 지수 백오프 재시도하고, 그래도 실패하면 @Recover에서 예비 모델(다른 공급자)이나 캐시·정형 문구로 넘긴다. 폴백 응답은 정상 응답과 같은 스키마에 degraded 플래그와 추적 ID를 담아 화면이 깨지지 않게 한다.
  - q: 프롬프트 원문을 로그에 남기면 왜 안 되나?
    a: 고객이 말한 주문번호·전화번호·주민번호가 그대로 로그에 쌓이고, 로그는 보존 기간이 길고 접근 범위가 넓어 개인정보 유출 경로가 된다. 운영 프로파일에서는 spring.ai.chat.observations.log-prompt를 false로 끄고, 로그에는 추적 ID·식별자·원인만 남기며 필요한 인자는 마스킹한다. 대화 이력 저장소도 보존 기간과 삭제 절차를 저장소를 고르는 시점에 함께 정한다.
related:
  - advisors-memory
  - tool-safety
  - llm-workflow-patterns
  - streaming-sse
source: 슬라이드 p.35(로깅), p.86(응답 메타데이터) — Day 1 (08-18); p.123(에러 핸들링과 Retry), p.144(토큰 비용) — Day 2 (08-19); p.284(토큰 사용량 Advisor), p.288–292(관찰 가능성·모델 폴백·ChatMemory 저장소·메모리와 개인정보), p.304(Day 3 실습 Step 6 관찰) — Day 3 (08-20), 실습 13_병목과캐시(FallbackLab·CostLab), 14_SSE와추적ID, 종합 실습 TokenMeterAdvisor·HelpDeskService
---

```compare
Metrics | Tracing | Logging
무엇 | 토큰 · 지연 · 에러율 · 도구 호출 수 | 한 요청의 단계별 경로 | 이벤트 상세
도구 | Micrometer 카운터·타이머 → /actuator/metrics, Prometheus | traceId(MDC) · X-Trace-Id 헤더 | 구조화 로그, 감사 로그
답하는 질문 | 얼마나 쓰고 얼마나 느린가 | 어디서 느린가 | 무슨 일이 있었나
운영 주의 | 기능·모델 태그를 붙여 쪼개 보기 | 응답에 traceId를 돌려 문의 시 검색 | 프롬프트 원문 로깅은 끈다
```

```java
@Component
class TokenMeterAdvisor implements CallAdvisor {
    private final MeterRegistry registry;

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        long started = System.nanoTime();
        ChatClientResponse response = chain.nextCall(request);       // 안쪽 체인 실행
        Usage usage = response.chatResponse().getMetadata().getUsage();
        registry.counter("ai.tokens", "type", "prompt").increment(usage.getPromptTokens());
        registry.counter("ai.tokens", "type", "completion").increment(usage.getCompletionTokens());
        registry.timer("ai.latency").record(System.nanoTime() - started, TimeUnit.NANOSECONDS);
        return response;
    }
    @Override public String getName() { return "tokenMeter"; }
    @Override public int getOrder()   { return 10; }                  // 가장 바깥 — 모든 호출을 잰다
}
```

> [!tip] 폴백은 일부러 깨 봐야 안다
> 종합 과제에서는 장애 주입 스위치를 두고 결함을 넣어 HTTP 200 + degraded=true가 나오는지 확인했다. 재시도 정책과 스트리밍 폴백은 코드만 있고 장애를 재현하지 못해 "부분 검증"으로 남겼다 — 측정하지 않은 것은 통과라고 쓰지 않는다.
