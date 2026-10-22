---
title: ChatClient
en: ChatClient Fluent API
summary: 모델을 부르는 표준 창구 — 기본값을 심은 빈을 만들고 prompt → call → content/entity로 호출
importance: 3
order: 3
tags:
  - Spring AI
  - ChatClient
  - Fluent API
keypoints:
  - ChatModel 위의 Fluent API — 프롬프트 구성부터 객체 변환까지 한 체인
  - 용도별 빈 — 추출은 온도 0, 상담은 0.7처럼 기본값이 다르면 나눈다
  - "종료 메서드 call()·stream()을 빠뜨리면 아무 일도 안 일어난다"
qa:
  - q: ChatClient와 ChatModel의 차이는?
    a: ChatModel은 call(Prompt)로 요청과 응답만 주고받는 저수준 추상화다. ChatClient는 그 위에 얹은 Fluent API로, .prompt().system().user().advisors().options().call()처럼 한 체인 안에서 프롬프트 구성·Advisor 적용·옵션 지정·결과의 객체 변환까지 처리한다. 실무에서는 대부분 ChatClient를 쓰고, ChatModel을 직접 쓸 일은 드물다.
  - q: ChatClient 빈을 용도별로 나누는 이유는?
    a: 하나의 ChatClient로 모든 일을 시키면 기본값이 충돌한다. 분류·추출처럼 흔들리면 안 되는 일은 온도 0과 '추측하지 말라'는 시스템 프롬프트를, 상담처럼 자연스러움이 중요한 일은 온도 0.7을 빈에 못 박아 두고 이름(@Qualifier 또는 파라미터 이름)으로 골라 주입한다. 호출부마다 옵션을 정하게 두면 누군가 기본값으로 부르는 순간 결과가 매번 달라진다.
  - q: 응답 메타데이터에서 무엇을 확인해야 하나?
    a: chatResponse()로 받으면 본문 외에 Usage(프롬프트·완성 토큰), finishReason, 모델명이 함께 온다. finishReason이 length면 maxTokens에서 답이 잘린 것이라 그대로 넘기면 잘린 JSON을 파싱하다 실패하거나 끊긴 문장이 나가므로 반드시 확인한다. Usage는 비용 계산의 근거이고, 모델명은 폴백이 걸렸는지 확인할 때 쓴다.
related:
  - spring-ai-abstractions
  - prompt-engineering
  - structured-output
  - streaming-sse
source: 슬라이드 p.74–93(4장 프로젝트 구조·빌더와 체이닝·ChatClient 빈·HelloAI·ChatClient vs ChatModel·세 가지 호출 방식·메시지 역할·응답 메타데이터·파라미터 바인딩), p.94–104(Day 1 실습) — Day 1 (08-18), 실습 04_말투바꾸기, ch03_chatclient, 과제 Day 1
---

```flow
prompt() :: 시작 — 빈의 기본 system·options·advisors를 물려받음
system / user :: 역할·규칙(매번 같음) + 이번 질문(매번 다름)
advisors / options :: 메모리·RAG 같은 공통 처리, 호출별 온도 덮어쓰기
call() / stream() :: 종료 메서드 — 여기서 비로소 모델 호출
content / entity :: 문자열, 자바 객체, 또는 chatResponse(메타데이터)
```

| 호출 방식 | 반환 | 적합 | 주의 |
| --- | --- | --- | --- |
| `.call().content()` | String | 짧은 답·분류·추출 | 긴 답은 수 초간 빈 화면 |
| `.call().entity(T.class)` | 객체 | 구조화 응답 API | 형식 실패 대비 |
| `.call().chatClientResponse()` | 응답 + Advisor 컨텍스트 | 출처·메타데이터 필요 | 정보가 가장 많음 |
| `.stream().content()` | Flux&lt;String&gt; | 채팅 UI·긴 생성 | 취소·타임아웃 필수 |

```java
@Configuration
class Lab1AiConfig {
    @Bean                                         // 요약 전용 — 매번 같은 답이어야 한다
    ChatClient summaryChatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("""
                주어진 주문 정보만 사용해 한국어 한 문장으로 요약한다.
                추측하지 않는다. 정보가 부족하면 "정보가 부족합니다"라고 답한다.
                """)
            .defaultOptions(ChatOptions.builder()
                .temperature(0.0)                 // 재현성
                .maxTokens(120)                   // 비용 상한
                .build())
            .build();
    }
}
// 호출: summaryChatClient.prompt().user(u -> u.text("{topic} 설명").param("topic", t)).call().content();
```

> [!tip] 내 실습에서 확인한 것
> 온도 0에서는 같은 요청 3회의 문장이 토씨 하나 같았고, 0.9로 올리자 문장 순서와 날짜 표기까지 매번 달라졌다. maxTokens를 20으로 내리면 문장이 중간에 잘렸다 — 상한은 "가장 긴 정상 응답이 몇 토큰인가"부터 가늠하고 정한다.
