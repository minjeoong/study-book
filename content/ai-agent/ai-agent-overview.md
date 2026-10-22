---
title: "AI Agent = LLM + Tools"
en: AI Agent, Agentic AI
summary: "LLM 기반 추론으로 스스로 도구를 선택·실행해 목표를 완수하는 소프트웨어 시스템"
importance: 3
order: 1
tags: [AI Agent, Agentic AI, LLM]
keypoints:
  - "LLM은 두뇌(이해·기억·계획), Tools는 행동(외부 시스템과 상호작용)"
  - "Agent의 4대 능력: Memory, Planning, Tool Use, Autonomous Action"
  - "Agentic은 정도의 문제 — 최소 개입으로 얼마나 스스로 계획·판단·실행하나"
qa:
  - q: "AI Agent란 무엇이고, 일반 LLM 챗봇과 무엇이 다른가?"
    a: "AI Agent는 LLM 기반 추론으로 스스로 도구를 선택하고 실행해서 목표를 완수하는 소프트웨어 시스템이다. 챗봇은 질문에 텍스트로 답하고 끝나지만, 에이전트는 LLM이 계획을 세우고 검색·DB·API 같은 도구를 호출해 실제 행동을 한 뒤 그 결과를 보고 다음 행동을 정한다. LLM이 두뇌, 도구가 손발 역할이다."
  - q: "AI Agent와 Agentic AI는 어떻게 구분하나?"
    a: "AI Agent는 시스템을 가리킨다. 단일 에이전트는 MCP/API로 코드 실행·웹 브라우징·파일 시스템 같은 도구를 연동하고, 멀티 에이전트는 역할별 에이전트가 다단계 Task를 협업·조율한다. Agentic AI는 패러다임으로, 외부 자극에 반응하는 게 아니라 스스로 목표를 세우고 행동하는 자율성의 정도를 뜻한다. 그래서 에이전트냐 아니냐보다 얼마나 Agentic한가로 보는 것이 강의의 관점이다."
related: [workflow-vs-agent, llm-reasoning, tool-calling-react, prompt-context/context-engineering, prompt-context/harness-engineering]
source: "2026-10-06 · slides-ai-agent.pdf p.4–10 (AI Evolution, Hype Cycle, AI Agent 정의, LLM + Tools, Travel Agent 예시), p.13–16 (Prompt is Dead, Context·Harness Engineering, Prompt to Harness)"
---

```layers
LLM (두뇌) :: 의도 이해, 단기 기억(State)·장기 기억, 작업 계획(Task Decomposition), Self-Reflection
Tools (행동) :: DB·Cloud·인터넷 등 외부 시스템과 통합 — 일정 저장, RAG 검색, 코드 실행
Autonomous Action :: LLM 계획에 따라 도구를 순차 호출해 완수, 필요하면 사람 승인 후 진행
```

| 단계 | 시기 | 관점 | 다루는 것 |
| --- | --- | --- | --- |
| Prompt Engineering | ~2025 | What to Say | System/User Prompt, Template, Few-shot, Constraint |
| Context Engineering | 2025 | What to See | State/History, Memory, RAG, Tools·MCP 정의, Structured Output |
| Harness Engineering | 2026 H1 | Run it Reliably | Loop Control, Guardrails, Hooks, Eval & Gating, HITL, Retry, Subagents |

- "Prompt Engineering is Dead"(2025-06): 프롬프트를 손으로 다듬는 것은 확장되지 않음 → 잘 작동하는 에이전트/시스템 설계가 경쟁력
- Harness 목표: 확률적이고 불안정한 LLM을 Production에서 신뢰할 수 있게 Deterministic Environment 구축 (State·Tool 루프·HITL 제어, 권한 격리, 코드로 규칙 강제)

> [!tip] 예시로 설명하기
> "노르웨이 4박 5일, 예산 맞춰 호텔 예약" → 목적 파악(Chat) → 선호 분석(프로필·리뷰) → 일정 조건(캘린더) → 활동 추천(웹 검색) → 동선 최적화(지도 API) → 최종 스케줄·예약 → 날씨·교통 API로 실시간 조정. 단계마다 판단은 LLM, 실행은 서로 다른 도구.
