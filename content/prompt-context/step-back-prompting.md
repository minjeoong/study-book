---
title: Step-back Prompting
summary: "본 질문 전에 한 발 물러서 일반적·근본적인 질문을 먼저 던져 배경 지식을 활성화한 뒤 답하게 하는 기법"
importance: 2
order: 9
tags:
  - 프롬프트
  - 추론
keypoints:
  - "1단계 일반 질문(Step-back)으로 배경 지식·원칙 활성화 → 2단계 본 질문"
  - "너무 빨리 구체화하거나 잘못된 프레임에서 최적화하는 실수를 막음"
  - "증상(Symptom)이 아닌 근본 원인(Root Cause)을 보게 만듦"
qa:
  - q: "Step-back Prompting은 무엇이고 언제 쓰나?"
    a: "과업과 관련된 일반적인 질문을 먼저 해서 배경 지식과 추론 과정을 활성화하고, 그 결과를 이어지는 본 질문에 넣어 수행 능력을 높이는 기법이다. 문제를 너무 빨리 구체화하거나 프레임 자체가 잘못된 상태에서 최적화하는 경우에 특히 유용하다. 질문의 전제와 암묵적 가정, 문제 설정의 타당성을 흔들어 더 근본적인 답을 유도한다."
  - q: "일반 프롬프트와 Step-back 프롬프트의 결과는 어떻게 달랐나?"
    a: "'LLM 기반 논문 추천 시스템'의 목적과 기능을 바로 물었을 때는 키워드 검색 한계를 넘는 의도 기반 추천이라는 무난한 기획이 나왔다. Step-back으로 연구자가 겪는 근본 문제부터 묻자 '논문이 부족한 게 아니라 너무 많다'는 정보 과잉을 근본 원인으로 짚었다. 그 결과 주제가 Information Retrieval에서 Research Reasoning, 즉 AI Research Copilot으로 재정의됐다."
related:
  - chain-of-thought
  - devils-advocate-multi-persona
  - meta-prompting-markdown
source: 슬라이드 p.60–62, 실습 TODO 5, 17
---

```compare
General Prompt | Step-back Prompt
질문 | 본 연구의 목적, 주요 기능, 활용 방안 및 기대효과를 제안해줘 | 답하기 전 한 단계 물러나서 근본 문제부터 생각하라
관점 | 증상 (원하는 논문을 찾기 어렵다) | 근본 원인 (Information Overload)
결과 | 연구 의도 기반 논문 추천 시스템 | 지식 발견을 지원하는 AI Research Copilot
```

```
[Step-back]
연구 주제: "LLM 기반 논문 추천 시스템 개발"

답변하기 전에 한 단계 물러나서 생각하라.
1. 연구자가 논문 탐색 과정에서 겪는 가장 근본적인 문제는 무엇인가?
2. 기존 검색 및 추천 시스템이 이 문제를 충분히 해결하지 못한 이유는 무엇인가?
3. 위 내용을 바탕으로 본 연구가 기여할 수 있는 새로운 연구 방향을 제안하라.
```

> [!tip] 실습 적용
> 시장조사 Human Prompt에 "한 발 물러서서 더 큰 그림을 봐주세요", 최종 보고서 System Prompt에 위 3단 질문을 드론 배송 시장 버전으로 넣어 "근본 문제 → 기존 한계 → 새 방향" 순서의 분석을 유도했다.
