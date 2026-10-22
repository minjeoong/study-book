---
title: "AI 애플리케이션 개발과 AI 제품 6단계 진화"
en: "AI Application Development, 6 Stages of AI Products"
summary: "개발은 규칙 기반 SW → AI 앱 → 자율 에이전트로, 제품은 백그라운드 ML → Agent2Agent로 진화"
importance: 2
order: 1
tags:
  - AI Application
  - Agent
  - RAG
  - LangChain
keypoints:
  - "전통 SW는 규칙 기반, AI 앱은 문맥 기반, Agent는 목표 기반으로 스스로 계획·실행"
  - "제품 진화: 백그라운드 ML → 채팅 → RAG → Foreground·Background Agent → A2A"
  - "LLM 한계(환각·지식 차단·실행력 부족)를 Prompt·FT·RAG·Tool·LangChain·LangGraph로 보완"
qa:
  - q: "전통적인 소프트웨어 개발과 AI Agent 개발은 무엇이 다른가?"
    a: "전통 SW는 개발자가 명시한 IF-THEN 규칙대로만 움직이는 결정론적 구조다. LLM 앱은 프롬프트, RAG 검색, API 연동을 개발자가 설계한 파이프라인으로 묶어 주어진 문맥 안에서 유연하게 답한다. Agent는 목표만 주면 Perceive, Plan, Act, Reflect 루프를 돌며 어떤 도구를 쓸지 스스로 정한다. 그래서 운영도 DevOps, MLOps, LLMOps를 거쳐 무한 루프 방지와 도구 호출 성공률을 보는 AgentOps로 바뀐다."
  - q: "LLM의 태생적 한계와 이를 보완하는 기술을 짝지으면?"
    a: "모호한 지시 이해는 Prompt Engineering, 범용 모델의 전문성 부족은 Fine-tuning, 지식 차단과 환각은 RAG로 보완한다. 말만 하고 실행하지 못하는 한계는 Function·Tool Calling, 벤더마다 파편화된 개발 복잡성은 LangChain, 한 방향으로만 흐르는 파이프라인의 한계는 상태 기반 순환 그래프인 LangGraph로 보완한다."
related:
  - ai-agent-react
  - rag-pipeline/rag-overview
  - prompt-context/genai-trend
  - llm-transformer/software-3-0
source: "Day1(9/9) 슬라이드 p.5–18, p.28, p.38 (PDF 페이지 기준)"
---

```flow
1단계 백그라운드 ML (2016~2022) :: 번역·추천처럼 UI 뒤에서 조용히 동작
2단계 채팅 (2022 말) :: ChatGPT, 대화 자체가 제품
3단계 RAG (2023) :: 외부 문맥을 붙여 환각을 줄이고 비즈니스 활용 입증
4단계 Foreground 에이전트 (2024~) :: 계획·도구 사용, 사용자가 중간에 방향 조정 (Mindtrip)
5단계 Background 에이전트 (2025~) :: 자는 사이 작업, 사람은 작업자에서 검토자로 (Devin)
6단계 Agent2Agent (진화 중) :: 서로 다른 앱의 에이전트가 직접 대화·협상 (Google A2A)
```

| 비교 | 전통 SW | AI 모델 개발 | AI 애플리케이션 | AI Agent |
| --- | --- | --- | --- | --- |
| 패러다임 | 규칙 기반, 결정론적 | 데이터 기반, 패턴 학습 | 문맥 기반, 모델 통합 | 목표 기반, 자율 실행 루프 |
| 판단력 | 분기문대로만 | 정해진 확률 출력 | 문맥 안에서 유연 | 실패 시 대안 탐색, 도구 사용 여부 결정 |
| 외부 도구 | 코드로 지정한 기능만 | 직접 호출 불가 | 설계된 파이프라인대로 | 상황 보고 스스로 선택 |
| 운영 | DevOps | MLOps (드리프트·재학습) | LLMOps (토큰 비용·환각률) | AgentOps (무한 루프·호출 성공률) |
| 도구 | Spring, React | PyTorch, Hugging Face | LangChain, LlamaIndex, Chroma | LangGraph, AutoGen, CrewAI |

> [!tip] 이 과정의 로드맵
> LangChain(LCEL·구조화 출력·Tool·메모리로 선형 파이프라인) → RAG(ETL·벡터DB·고급 검색·리랭킹) → LangGraph(상태 기반 순환 그래프·인터럽트·멀티 에이전트). 이번 과목은 첫 단계, 9/18 RAG Pipeline과 10/6 AI Agent 과목으로 이어짐.
