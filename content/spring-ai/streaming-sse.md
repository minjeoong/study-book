---
title: 스트리밍과 SSE
en: Streaming Response, Server-Sent Events
summary: 답을 다 만들 때까지 기다리지 않고 토큰이 오는 대로 Flux로 흘려 SSE로 보내, 첫 글자까지의 시간을 줄이는 방식
importance: 2
order: 5
tags:
  - Spring AI
  - 스트리밍
  - SSE
  - Reactor
keypoints:
  - call()은 완성 후 한 번에, stream()은 Flux<String>으로 조각마다
  - 총 시간은 같아도 첫 토큰 시간(TTFT)이 체감 속도를 정한다
  - 스트리밍엔 timeout·doOnCancel·onErrorResume을 반드시 붙인다
qa:
  - q: 스트리밍 응답은 왜 쓰고 어떻게 구현하나?
    a: 긴 답변을 동기로 받으면 완성될 때까지 수 초간 빈 화면이지만, 스트리밍은 0.5초 무렵부터 글자가 흘러 같은 3초라도 빠르다고 느낀다. Spring AI에서는 chatClient.prompt().user(q).stream().content()가 Flux<String>을 돌려주고, 컨트롤러가 produces = TEXT_EVENT_STREAM_VALUE로 이 Flux를 반환하면 SSE로 브라우저에 바로 전달된다. 단, 출처나 구조화 응답이 필요하면 동기 호출이 다루기 쉽다.
  - q: 스트리밍에서 취소와 타임아웃을 챙겨야 하는 이유는?
    a: 사용자가 창을 닫아도 호출은 계속되고 토큰 비용은 그대로 나가므로, doOnCancel로 이탈을 감지해 정리하고 timeout으로 전체 시간 상한을 둔다. 실패하면 onErrorResume으로 "응답이 지연되어 중단했습니다" 같은 대체 문구를 마지막 이벤트로 보내 연결을 깔끔히 끝낸다. 토큰 사용량은 보통 마지막 조각에만 실려 오므로 계측은 doFinally 같은 종료 훅에서 한다.
  - q: SSE와 WebSocket의 차이는?
    a: SSE는 HTTP 위에서 서버가 클라이언트로 텍스트 이벤트를 한 방향으로 계속 보내는 방식이라 LLM 토큰 스트리밍처럼 서버 → 클라이언트 흐름에 단순하고 잘 맞는다. WebSocket은 양방향 연결이라 채팅 메시지를 서로 주고받는 실시간 협업에 맞지만 구현과 인프라가 더 복잡하다. 과정에서는 token 이벤트를 흘린 뒤 마지막에 sources나 done 이벤트를 붙이는 SSE 패턴을 썼다.
related:
  - chatclient
  - observability-fallback
  - prompt-engineering
source: 슬라이드 p.82(세 가지 호출 방식), p.119–123(5장 스트리밍·SSE·취소·타임아웃·Retry), p.126–128(미니 실습·첫 글자까지 시간 측정), p.321(Phase 6 SSE) — Day 1·2 (08-18, 08-19), 실습 05_이모지요약기, 14_SSE와추적ID, 종합 실습 HelpDeskService.stream()
---

```compare
call() | stream()
반환 | String · 객체 (완성 후 한 번) | Flux<String> (토큰 조각)
체감 | 3초 동안 빈 화면 | 0.5초부터 글자가 흐름
웹 전송 | 일반 JSON 응답 | SSE (text/event-stream)
잘 맞는 곳 | 짧은 답·분류·구조화 응답·출처 | 채팅 UI·긴 생성
챙길 것 | 타임아웃·폴백 | 취소·타임아웃·종료 훅·마지막 이벤트
```

```java
@PostMapping(value = "/lab14/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> stream(@RequestBody Ask req) {
    return chat.prompt().user(req.question()).stream().content()
            .map(t -> ServerSentEvent.builder(t).event("token").build())     // 토큰 이벤트
            .concatWith(Flux.just(ServerSentEvent.builder("[DONE]").event("done").build()))
            .timeout(Duration.ofSeconds(60))                                // 전체 상한
            .doOnCancel(() -> log.info("클라이언트 취소 — 스트림 종료"))
            .onErrorResume(e -> Flux.just(
                    ServerSentEvent.builder("일시적인 오류가 발생했습니다.").event("error").build()));
}
// 확인: curl -N 으로 호출 (-N이 없으면 버퍼링되어 한꺼번에 나온다)
```

> [!warn] 헷갈리기 쉬움
> CallAdvisor만 구현한 Advisor는 스트리밍 경로에서 그냥 건너뛴다. 감사·토큰 계측처럼 빠지면 안 되는 Advisor는 StreamAdvisor도 함께 구현해야 스트리밍 호출에서도 기록이 남는다.
