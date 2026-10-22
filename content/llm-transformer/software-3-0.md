---
title: "Software 3.0과 LLM의 한계"
en: "Software 3.0"
summary: "사람이 목표를 자연어로 정의하면 LLM이 스스로 사고하고 결과를 만드는 새 개발 패러다임"
importance: 2
order: 1
tags:
  - LLM
  - 패러다임
  - Hallucination
keypoints:
  - "SW 1.0 규칙 코딩 → 2.0 데이터 학습 → 3.0 자연어 지시"
  - "Task-specific AI에서 General-purpose AI로 전환"
  - "LLM 한계 4가지 — Black Box, Bias, Hallucination, 비결정성"
qa:
  - q: "Software 1.0, 2.0, 3.0의 차이는?"
    a: "1.0은 사람이 규칙을 코드로 직접 작성하고, 2.0은 데이터를 주고 신경망 가중치를 학습시킨다. 3.0은 사람이 자연어로 목표와 역할을 정의하면 LLM 기반 에이전트가 코드나 결과를 생성한다. 2.0은 문제마다 모델을 새로 만들어야 했지만, 3.0은 하나의 범용 모델을 프롬프트만 바꿔 여러 업무에 쓴다."
  - q: "LLM에서 Hallucination이 생기는 이유는?"
    a: "LLM은 정답을 찾는 모델이 아니라 다음 토큰을 가장 그럴듯하게 예측하는 모델이기 때문이다. 근거가 없거나 불확실한 내용도 확률적으로 자연스러운 문장을 만들어 내므로 존재하지 않는 논문·수치·코드를 자신 있게 생성한다. 그래서 RAG로 근거 문서를 함께 주거나 출처 검증 단계를 둬서 보완한다."
related:
  - transfer-learning
  - llm-landscape
  - prompt-context/llm-hallucination
  - prompt-context/genai-trend
source: "Day1 슬라이드 p.3–24"
---

```compare
Software 1.0 | Software 2.0 | Software 3.0
만드는 방식 | 사람이 규칙을 코드로 작성 | 데이터로 신경망 가중치 학습 | 자연어 지시로 AI 에이전트가 생성
입력 | 코드 | 데이터 + NN 구조 | 프롬프트 + 데이터
한계 | 복잡한 사고·판단 구현 어려움 | 문제마다 모델 새로 개발, 재사용 어려움 | Black Box, Hallucination
```

| LLM의 한계 | 내용 |
|---|---|
| Black Box | 수십억 파라미터가 왜 그 답을 냈는지 설명·추적이 어려움 (2.0의 한계 계승) |
| Bias | 웹 데이터의 편향·오래된 정보까지 학습, 프롬프트로도 완전히 제거 안 됨 |
| Hallucination | 다음 토큰을 그럴듯하게 예측할 뿐이라 가짜 출처·틀린 코드를 자연스럽게 생성 |
| Non-deterministic | 같은 프롬프트에도 매번 조금씩 다른 결과 |

> [!tip] 한 줄 요약
> "이제 소프트웨어의 인터페이스는 API가 아니라 언어다." 개발자의 역할이 코드 작성자에서 문제 정의자로 이동함. 지향점은 AI가 사람을 대체하는 것이 아닌 증강지능(Augmented Intelligence).
