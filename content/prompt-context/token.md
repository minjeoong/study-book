---
title: Token과 Tokenizer
en: Token
summary: "LLM이 텍스트를 처리하는 기본 단위 — 요금, 응답 길이, 입력 한도가 모두 토큰으로 계산된다"
importance: 2
order: 3
tags:
  - LLM
  - Token
keypoints:
  - "토큰 = 단어, 단어 일부, 공백·구두점까지 될 수 있는 텍스트 조각"
  - "API 요금(입력+출력 토큰)과 응답 길이 제한이 토큰 기준"
  - "영어 1,000토큰 ≈ 750단어, 한글은 더 잘게 쪼개져 토큰이 더 듦"
qa:
  - q: "LLM에서 토큰이 왜 중요한가?"
    a: "대부분의 LLM API는 입력 토큰과 출력 토큰 수를 기준으로 요금을 매기고, 모델마다 한 번에 응답할 수 있는 토큰 양에 제한이 있다. 그래서 같은 내용을 더 적은 토큰으로 전달하는 것이 비용, 응답 속도, 컨텍스트 여유에 바로 연결된다."
  - q: "같은 의미인데 한국어가 영어보다 토큰을 더 쓰는 이유는?"
    a: "토크나이저가 한글을 영어보다 더 잘게 분리하는 경우가 많아서다. 슬라이드 예시로 'I love AI.'는 4토큰·10글자, '나는 AI를 좋아한다.'는 6토큰·12글자였다. 토큰 수는 글자 수나 단어 수와 일치하지 않고 언어와 토크나이저 방식에 따라 달라진다."
related:
  - llm-hallucination
  - sampling-controls
  - context-engineering
  - llm-transformer/word-embedding
source: 슬라이드 p.30–31
---

```compare
I love AI. | 나는 AI를 좋아한다.
토큰 수 | 4 | 6
글자 수 | 10 | 12
분리 방식 | 단어 단위에 가까움 | 조사·어미까지 잘게 분리
```

| 토큰이 영향을 주는 곳 | 내용 |
| --- | --- |
| 비용 | OpenAI 등 대부분의 API는 입력 토큰 + 출력 토큰으로 과금 |
| 응답 길이 | 모델마다 한 번에 생성할 수 있는 토큰 수 제한 (Max tokens) |
| 토큰량 산출 | 영어 1,000토큰 ≈ 750단어(경험치), 토큰은 단어가 아닌 Subword |

> [!tip] 직접 확인
> OpenAI Tokenizer(platform.openai.com/tokenizer)에서 GPT-5.x / GPT-4 / GPT-3 토크나이저별로 같은 문장의 토큰 수가 다르게 나온다.
