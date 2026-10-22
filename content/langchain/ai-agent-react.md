---
title: "AI Agent와 ReAct"
en: "AI Agent, ReAct (Reasoning and Acting)"
summary: "목표를 받아 스스로 추론·계획하고 도구로 환경과 상호작용하는 시스템, 생각 → 행동 → 관찰 사이클을 반복"
importance: 3
order: 2
tags:
  - Agent
  - ReAct
  - Tool
keypoints:
  - "Agent의 다섯 요소: 자율성, 목표 지향성, 추론 능력, 환경 인식, 도구 활용"
  - "ReAct: 생각(Thought) → 행동(Act) → 관찰(Observe)을 답이 나올 때까지 반복"
  - "LLM은 두뇌(계획·판단), Tool은 손발(실시간 데이터·실제 작업)"
qa:
  - q: "LLM과 Agent의 차이는?"
    a: "LLM은 입력 뒤에 올 토큰을 예측해 텍스트를 만드는 모델 자체다. Agent는 LLM을 두뇌로 삼아 목표를 이룰 때까지 계획을 세우고, 검색·계산·API 같은 도구를 골라 호출하고, 결과를 보고 다음 행동을 정하는 시스템이다. 즉 Agent는 LLM에 도구, 반복 루프, 기억을 붙인 실행 주체다."
  - q: "ReAct 패턴을 설명하면?"
    a: "Reasoning과 Acting을 번갈아 하는 패턴이다. 모델이 무엇을 해야 할지 먼저 생각하고(Thought), 도구를 호출하고(Act), 그 결과를 관찰(Observe)한 뒤 다시 생각하는 사이클을 반복한다. LangChain의 create_agent도 model → tools → model을 최종 답이 나올 때까지 도는 같은 구조다."
related:
  - create-agent
  - tool-calling
  - ai-application-evolution
  - guardrails
source: "Day1(9/9) 슬라이드 p.19–25 (Google·Nvidia·IBM·AWS 정의, Hugging Face Agents Course, ReAct)"
---

```flow
Thought :: 지금 무엇이 필요한지 추론 (예: 날씨를 모르니 조회가 필요)
Act :: 도구 호출 (get_weather(location='서울'))
Observe :: 도구 결과를 관찰 ('오늘 서울은 비')
반복 또는 종료 :: 더 필요하면 다시 Thought, 충분하면 최종 답변
```

| 출처 | 정의 (요지) |
| --- | --- |
| Google | 세상을 관찰하고 사용 가능한 도구로 행동해 목표를 달성하려는 애플리케이션 |
| Nvidia | 높은 수준의 목표에 따라 복잡한 작업을 자율적으로 추론·계획·실행하는 AI 시스템 |
| IBM | 사용자나 다른 시스템을 대신해 워크플로를 스스로 설계하고 도구로 작업을 수행 |
| AWS | 환경과 상호작용하며 데이터를 모아 목표 달성에 필요한 작업을 스스로 결정 |

> [!warn] 자율성의 그림자
> AI만 글을 쓰는 SNS(몰트북), AI가 사람을 고용해 현실 업무를 시키는 RentAHuman 같은 사례는 감시·보안·윤리·책임 소재 문제를 드러냄. 자율성이 클수록 가드레일과 사람 승인(HITL)이 필요함.
