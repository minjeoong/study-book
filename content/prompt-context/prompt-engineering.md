---
title: Prompt Engineering 개요
en: Prompt Engineering
summary: "LLM이 다음 토큰 예측을 잘 하도록 지시·맥락·입력을 설계하고 다듬는 과정 — 재학습 없이 성능을 끌어올리는 방법"
importance: 3
order: 4
tags:
  - 프롬프트
keypoints:
  - "재학습 없이 입력(지시·맥락·예시) 설계만으로 성능을 끌어올림"
  - "System Prompt는 역할·맥락으로 일관성, User Prompt는 구체적 요청"
  - "효과는 모델마다 다르고 sLLM에선 약하며, 성능 향상이 선형적이지 않음"
qa:
  - q: "Prompt Engineering이란?"
    a: "LLM이 연속적인 토큰 예측을 잘 해서 정확한 결과를 내도록 안내하는 고품질 프롬프트를 설계하는 과정이다. 최적의 프롬프트를 찾기 위한 수정, 길이 최적화, 글쓰기 스타일 지정이 포함된다. 사전학습이 끝난 모델의 성능을 비용 부담 없이 빠르게 끌어올릴 수 있는 방법이다."
  - q: "System Prompt와 User Prompt의 차이는?"
    a: "System Prompt는 시스템이나 개발자가 미리 정하는 초기 지침으로, 모델의 역할과 맥락, 응답 스타일을 고정해 일관성과 신뢰성을 높인다. User Prompt는 사용자가 매번 전달하는 질문·요청으로, 구체적이고 명확하게 써야 원하는 방향의 응답이 나온다. 예를 들어 System에 'You are a professional chef.', User에 '오늘 저녁 간단한 요리 추천'을 주면 두 프롬프트가 상호작용해 답이 만들어진다."
  - q: "Prompt Engineering의 한계는?"
    a: "경량 모델(sLLM)에서는 잘 작동하지 않을 수 있고, 같은 프롬프트라도 모델마다 효과가 다르다. 또 프롬프트를 다듬는 만큼 성능이 선형적으로 오르지 않는다. 그래서 멀티턴·에이전트 환경에서는 Context Engineering으로 관점을 넓힌다."
related:
  - token
  - rice-framework
  - few-shot
  - context-engineering
source: 슬라이드 p.32–34, p.47, 실습 TODO 5, 18
---

```layers
System Prompt :: 역할·맥락 설정 → 일관성, 신뢰성 (You are a professional chef.)
Instruction :: 무엇을 하라는 지시
Context :: 참고할 배경 정보
User Input :: 이번 요청 (오늘 저녁 간단한 요리 추천해 주세요)
Pre-trained LLM :: 수십억 파라미터, 다음 토큰을 반복 예측
Output :: LLM이 생성한 응답
```

| 프롬프트 구성 | 요약 과제 | 감성 분류 과제 |
| --- | --- | --- |
| Task description | This is an article followed by a summary written in informal language: | This is a movie review sentiment classifier. |
| Examples | — | I loved this movie! → Positive / What a waste of time. → Negative |
| Current input | (기사 본문) | I enjoyed the movie. |
| Output indicator | In summary: | This review is: |

> [!tip] 면접 팁
> "LLM은 순차 텍스트를 입력받아 다음 토큰을 예측하는 작업을 반복한다 → 그 예측의 조건(입력)을 설계하는 것이 Prompt Engineering"으로 동작 원리와 연결해서 설명하면 깔끔하다.
