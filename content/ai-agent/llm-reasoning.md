---
title: LLM Reasoning
en: Inference vs Reasoning
summary: "단순 응답 생성이 아니라 목표 달성을 위해 다음 행동을 판단·계획하는 사고 과정"
importance: 2
order: 3
tags: [Reasoning, LLM, AI Agent]
keypoints:
  - "Inference는 확률적 토큰 예측의 결과, Reasoning은 전제 → 사고 → 결론의 과정"
  - "에이전트에서 Reasoning 역할: 행동 판단, 작업 계획, 결과 검토, 목표 일치 판단"
  - "보완 방식은 4층: Model, Context, Tool, Harness"
qa:
  - q: "Inference와 Reasoning의 차이는?"
    a: "Inference는 학습된 모델로 새 입력의 출력을 만드는 단계로, LLM에서는 확률적으로 가장 가능성 높은 다음 토큰을 예측하는 과정이다. Reasoning은 전제에서 논리를 따라 결론에 이르는 사고 과정이다. 그래서 LLM의 inference 자체를 논리적 reasoning과 같다고 보기 어렵고, Apple의 GSM-Symbolic 연구에서도 같은 수학 문제의 숫자만 바꿔도 성능이 크게 흔들렸다."
  - q: "LLM의 추론 능력을 보완하는 방법은?"
    a: "모델 차원에서는 Inference-time Scaling, 전문가 추론 궤적 SFT와 보상 모델 RL을 쓰는 Reasoning Tuning, 큰 모델의 사고 경로를 작은 모델로 옮기는 Reasoning Distillation이 있다. 컨텍스트 차원에서는 Scratchpad, Chain-of-Thought, Self-Consistency, 도구 차원에서는 계산기·검색·코드 실행기 연동과 Agentic RAG가 있다. Harness 차원에서는 실행 피드백으로 계획을 다시 세우는 Feedback Loop와 생성자-평가자 Cross-Validation으로 환각을 제어한다."
related: [ai-agent-overview, tool-calling-react, prompt-context/chain-of-thought, prompt-context/llm-hallucination]
source: "2026-10-06 · slides-ai-agent.pdf p.18–23 (Inference vs Reasoning, Inference, GSM-Symbolic, Reasoning, LLM Reasoning, 전략적 도구), p.45–46 SUMMARY"
---

```compare
Inference | Reasoning
뜻 | 증거·추론으로 도달한 결론 그 자체 | 결론·판단에 이르기 위해 논리적으로 사고하는 행위
LLM에서 | 확률적으로 가장 그럴듯한 다음 토큰 예측 (모델 실행) | 단계를 나누고 다음 행동을 결정하는 과정 (Process of Planning)
예 | "한국의 수도는?" → 패턴 응답 (non-reasoning) | "A > B, B > C, 가장 무거운 것은?" → 논리 전개
```

| Agent 역할 | 내용 |
| --- | --- |
| 행동 판단 | 도구를 쓸지, 바로 응답할지 결정 |
| 작업 계획 | 단계를 나누고 처리 순서 구상 |
| 결과 검토·수정 | 행동 결과를 평가하고 재추론해 행동 수정 |
| 목표 일치 판단 | 현재 정보가 사용자 목표를 충족하는지 확인 |

| 층 | 보완 방식 |
| --- | --- |
| Model | Inference-time Scaling, Reasoning Tuning(SFT + RL), Reasoning Distillation |
| Context | Scratchpad, Chain-of-Thought, Self-Consistency Decoding(다수결) |
| Tool | Tool Augmentation(계산기·검색·코드 실행), Agentic RAG(쿼리 재작성·결과 평가·재검색) |
| Harness | Feedback Loop(실행 피드백으로 재계획), Cross-Validation(생성자 vs 평가자) |

> [!note] System 1 vs System 2
> System 1은 빠르고 본능적인 패턴 매칭(2023년 LLM), System 2는 느리고 논리적인 추론·계획. 지금의 추론 모델은 강화학습 기반 내부 사고 과정(System 2)을 통합한 형태로 확장됨.
