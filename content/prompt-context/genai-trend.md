---
title: 생성형 AI 트렌드와 AI Agent
en: Generative AI Trend
summary: "답변하는 AI → 근거를 찾아 답하는 AI(RAG) → 스스로 실행하는 AI(Agent)로 진화하는 흐름과 기업 도입 관점"
importance: 2
order: 1
tags:
  - 트렌드
  - AI Agent
  - RAG
keypoints:
  - "AI는 답변하는 존재 → 지시를 따르는 존재 → 목표를 달성하는 존재로 진화"
  - "약한 모델 + Agent 구조(95.1%)가 강한 모델 단독(67.0%)을 이김"
  - "LLM 시대엔 '문제를 푸는 법'보다 '문제를 설명하는 법'이 중요"
qa:
  - q: "기업이 LLM을 도입할 때 겪는 대표적인 허들은?"
    a: "세 가지가 대표적이다. 사내 정보나 전문 영역의 폐쇄적 정보는 학습되지 않았거나 신뢰도가 낮고, 학습 시점 이후 정보가 없어 최신성이 떨어진다. 또 웹 데이터로 학습한 구조상 그럴듯한 거짓말(Hallucination)을 할 수 있어 RAG와 검증 체계로 보완한다."
  - q: "모델 성능만큼 Agent 구조가 중요하다고 하는 이유는?"
    a: "코딩 벤치마크에서 GPT-3.5 zero-shot은 48.1%, GPT-4 zero-shot은 67.0%였지만, GPT-3.5에 에이전틱 워크플로를 붙이면 95.1%까지 올라갔다. 계획·도구 사용·반복 검토 구조가 붙으면 약한 모델도 강한 모델을 이길 수 있다는 뜻이다. 그래서 모델 선택과 함께 워크플로 설계가 경쟁력이 된다."
  - q: "기존 지도학습 방식과 LLM 방식의 차이는?"
    a: "지도학습은 문제 정의, 데이터셋 준비와 라벨링, 모델 설계·학습, 테스트를 과제마다 반복한다. LLM 방식은 사전학습된 범용 모델에 풀어야 할 문제를 프롬프트로 자연어 설명하고 바로 해결한다. 별도 데이터 준비와 모델링이 없는 대신 문제를 얼마나 잘 설명하느냐가 성능을 좌우한다."
related:
  - llm-hallucination
  - prompt-engineering
  - context-engineering
  - llm-transformer/software-3-0
  - llm-transformer/transfer-learning
source: 슬라이드 p.3–20
---

```flow
답변하는 AI :: AI가 답을 한다는 것에 놀라던 시기 — Prompt Engineering
근거를 찾아 답하는 AI :: 외부 지식과 함께 답을 잘 받아내는 시기 — RAG
스스로 실행하는 AI :: 시킨 일을 알아서 다 하는 Actor — AI Agent
```

```compare
지도학습 방식 | LLM 시대의 Task 방식
시작 | 문제 정의 (정형화된 포맷) | 문제 설명 (Prompt, 자연어)
데이터 | 충분한 양 + 목적별 Labeling | 별도 준비 없음
모델 | 특정 Task용 모델 설계·학습 | Pre-trained 범용 LLM 그대로
핵심 역량 | 문제를 푸는 법 | 문제를 설명하는 법
```

- 생성형 AI가 잘하는 Task: **생성**(보고서 초안) · **검색**(근거 수집) · **요약**(회의 정리) · **추론**(원인 분석, 다음 행동 제안)

| Gartner Use Case | 특징 | 리스크 |
| --- | --- | --- |
| Quick Win (Productivity) | 도입 쉬운 업무 도우미, 다른 프로세스와 통합해 경쟁우위 유지 | 차별화 효과는 작음 |
| Differentiation | 사내 데이터로 맞춤형 애플리케이션 개발 | 예측 어려운 비용, 대신 방어 가능한 경쟁우위 |
| Transformation (Innovation) | 새로운 BM으로 신규 수익 창출 | 높은 비용, 기술 실현 가능성 |

> [!tip] Hype Cycle 흐름
> 2014 Big Data·Data Science → 2018 Deep Learning 정점 → 2023 생성형 AI 정점 → 2024 Prompt Engineering·RAG가 정점 근처 → 2025 AI Agents가 정점, 생성형 AI는 환멸 단계(옥석 가리기) 진입.
