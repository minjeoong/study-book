---
title: Context Engineering
summary: "프롬프트 문장을 넘어 컨텍스트 윈도우에 들어가는 모든 정보를 전략적으로 설계·제어하는 기술"
importance: 3
order: 13
tags:
  - Context
  - AI Agent
keypoints:
  - "프롬프트는 '무슨 말을 할까', 컨텍스트는 '무엇을 알려줄까'의 설계"
  - "구성 요소: System Prompt, 메모리·히스토리, 도구·외부 지식, Few-shot·포맷"
  - "Context Rot: 컨텍스트가 길수록 중요 정보를 놓쳐 성능 저하 (n² 연산)"
qa:
  - q: "Prompt Engineering과 Context Engineering의 차이는?"
    a: "Prompt Engineering은 단일 턴에서 효과적인 프롬프트 문장을 쓰는 데 집중한다. Context Engineering은 프롬프트 외에 LLM 추론에 들어가는 모든 정보, 즉 최적의 토큰 집합을 큐레이션하고 유지하는 전략이다. 에이전트가 여러 턴에 걸쳐 루프를 돌면 시스템 프롬프트, 도구, MCP, 외부 데이터, 대화 기록이 계속 쌓이기 때문에 프롬프트를 잘 쓰는 것만으로는 해결되지 않는다."
  - q: "Context Rot이란? 어떻게 대응하나?"
    a: "컨텍스트가 길어질수록 LLM이 중요한 정보를 놓치거나 오래되고 불필요한 정보에 오염되어 추론 품질이 떨어지는 현상으로, 정도 차이는 있지만 모든 모델에서 나타난다. Transformer는 n개 토큰에 대해 n² 관계를 계산하므로 길어질수록 계산 비용이 급증하고 관계 포착 능력도 감소한다. 그래서 중요한 정보는 요약·압축하고, RAG로 관련성 높은 정보만 선택적으로 넣어 노이즈를 최소화한다."
related:
  - prompt-engineering
  - harness-engineering
  - rice-framework
  - llm-hallucination
  - llm-transformer/self-attention
source: 슬라이드 p.87–91
---

```layers
System Prompt 설계 :: AI의 역할·목적·제약, 페르소나, 톤, 금지 사항
메모리 & 히스토리 :: 대화 맥락을 얼마나·어떻게 유지할지, 중요 정보는 요약·압축
도구 & 외부 지식 :: RAG, 검색, API 결과를 선택적으로 주입, 관련성 높은 정보만
Few-shot & 포맷 :: 출력 형식과 예시로 일관된 응답, 구조화된 템플릿
User Message :: 이번 턴의 요청
```

```compare
Prompt Engineering | Context Engineering
범위 | 단일 프롬프트 텍스트 | 컨텍스트 윈도우 전체 (토큰 집합)
상호작용 | 단일 턴, 필요한 정보를 한 프롬프트에 | 멀티턴, 에이전트 루프
핵심 질문 | 무슨 말을 할까 | 어떤 정보를 어떤 순서·형태·양으로 줄까
등장 | ChatGPT 대중화 이후, 2023 직군화 | 2025년 중반, PE의 자연스러운 진화형
```

> [!warn] Context는 많을수록 좋은 게 아니다
> 좋은 AI 시스템 = 좋은 Context 설계. 컨텍스트가 너무 많으면 오히려 성능이 나빠진다(Context Rot). "다 넣기"가 아니라 "골라 넣기, 줄여 넣기"가 핵심. (참고: Anthropic, Effective context engineering for AI agents)
