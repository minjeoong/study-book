---
title: 구조화 출력 (.entity)
en: Structured Output, BeanOutputConverter, Multimodal
summary: record 타입을 주면 JSON Schema를 붙여 요청하고 응답을 객체로 돌려받는 기능 — 문자열 파싱이 사라진다
importance: 3
order: 6
tags:
  - Spring AI
  - 구조화 출력
  - JSON Schema
keypoints:
  - .entity(Record.class) 한 줄 — 스키마 첨부와 JSON → 객체 변환이 자동
  - enum으로 값 범위를 제한하고 UNKNOWN 같은 실패 대비 값을 둔다
  - 거의 성공이 운영에선 장애 — 온도 0 · 재요청 1회 · 안전한 기본값
qa:
  - q: 구조화 출력은 내부에서 어떻게 동작하나?
    a: .entity(Ticket.class)를 호출하면 BeanOutputConverter가 타입에서 JSON Schema를 만들어 형식 지시문으로 프롬프트에 덧붙이고, 모델이 돌려준 JSON 문자열을 다시 Ticket 객체로 변환한다. @JsonPropertyDescription으로 필드 설명을 넣으면 스키마도 프롬프트이므로 정확도가 오른다. 형식 지시문의 위치를 직접 정하고 싶으면 converter.getFormat()을 {format} 자리에 넣고 convert()로 변환한다.
  - q: 구조화 출력이 실패하면 어떻게 대비하나?
    a: 모델이 가끔 설명을 덧붙이거나 코드펜스로 감싸 파싱을 깨뜨리므로 세 겹으로 막는다. 1차로 온도 0을 쓰고, 실패하면 "JSON 객체만 출력하라"는 시스템 지시와 원문을 함께 줘서 형식만 다시 요청하고, 그래도 실패하면 Ticket("UNKNOWN", ...) 같은 안전한 기본값을 돌려 화면을 살린다. 타입이 맞아도 내용이 틀릴 수 있으니 중요한 값은 받은 뒤 자바 코드로 한 번 더 검증한다.
  - q: 날짜·숫자·enum 필드에서 자주 깨지는 이유는?
    a: 모델은 "2026년 7월 30일"이나 "약 3만원"도 날짜·숫자라고 생각하므로 설명에 yyyy-MM-dd, 숫자만·단위 제외처럼 형식을 명시해야 한다. enum은 목록에 없는 값을 지어내기 쉬워 UNKNOWN을 목록에 넣어 두는데, 없으면 억지로 아무 값이나 골라 잘못된 분류가 조용히 흘러간다. 중첩은 2단계까지로 두고 더 깊으면 호출을 쪼갠다.
related:
  - chatclient
  - prompt-engineering
  - rag-retrieval
  - llm-workflow-patterns
source: 슬라이드 p.130–150(6장 구조화 출력·entity·JSON Schema·중첩 레코드·BeanOutputConverter·목록·타입 함정·멀티모달·복구 전략·임베딩·긴 문서 Map-Reduce·토큰 비용·이미지·음성 모델) — Day 2 (08-19), 실습 06_별점카드, ch05_structured
---

```flow
타입 정의 :: record Ticket(String category, Priority priority, List<String> tags)
스키마 생성 :: BeanOutputConverter가 타입 → JSON Schema 문자열
프롬프트 첨부 :: 형식 지시문을 프롬프트 끝에 자동 추가
모델 응답 :: JSON 문자열
변환 :: JSON → Ticket 객체 (형식 위반이면 여기서 예외)
```

| 형식 강제 수단 | 강제력 | 비용 | 언제 |
| --- | --- | --- | --- |
| 말로 지시 ("JSON으로만 답하라") | 약함 | 없음 | 형식이 단순할 때 |
| Few-shot 예시 | 중간 | 토큰 증가 | 말로 설명하기 어려운 형식 |
| `.entity()` 구조화 출력 | 강함 | 없음 | 기본 선택 |
| 공급자 JSON 모드 | 가장 강함 | 공급자 종속 | 절대 깨지면 안 될 때 |

```java
enum 느낌 { 최고, 좋음, 보통, 별로 }                      // 보기를 제한
record 리뷰카드(String 제목, 느낌 감정, int 별점, List<String> 키워드) {}

리뷰카드 card = chat.prompt()
        .system("영화 감상문을 카드로 정리한다. 별점은 1~5 정수로 매긴다.")
        .user(text)
        .call()
        .entity(리뷰카드.class);                          // 파싱 코드 없음

// 여러 건은 제네릭 타입 정보를 넘긴다
List<Keyword> keywords = chat.prompt().user("핵심 키워드 5개를 점수와 함께: " + text)
        .call().entity(new ParameterizedTypeReference<List<Keyword>>() {});
```

> [!tip] 멀티모달도 같은 ChatClient로
> `.user(u -> u.text("이 영수증의 총액을 알려줘").media(MimeTypeUtils.IMAGE_PNG, image))`처럼 이미지를 함께 싣는다. 모델이 지원해야 하고 토큰을 많이 쓰며, 환각 가능성은 그대로라 중요한 판정에는 사람 확인을 둔다.
