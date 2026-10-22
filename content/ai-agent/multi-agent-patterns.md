---
title: 멀티에이전트 협업 패턴
en: Supervisor, Orchestrator-Workers, Agent-as-Tool, Swarm, Evaluator-Optimizer
summary: "책임과 의사결정 권한을 어디에 둘지 설계 — Chaining, Routing/Delegation, Hand-off, Feedback Loop"
importance: 3
order: 7
tags: [Multi-Agent, Supervisor, Swarm, LangGraph]
keypoints:
  - "Supervisor는 매 스텝 다음 담당을 정하고, Orchestrator는 실행 전 일괄 분해 후 병렬"
  - "Agent-as-Tool은 서브에이전트를 함수처럼, Swarm은 중앙 없이 직접 Hand-off"
  - "MAS 실패 원인: 역할 명세 약 40%, 에이전트 간 정렬 약 35%, 검증·종료 약 20%"
qa:
  - q: "Supervisor와 Orchestrator-Workers의 차이는?"
    a: "Supervisor는 매 결과를 받아 다음에 누구를 부를지 반복 판단하고, 하위 에이전트는 작업 후 매번 Supervisor로 복귀하며 종료 판단과 최종 종합도 Supervisor가 한다. Orchestrator-Workers는 실행 전에 전체 작업을 N개 하위 작업으로 한 번에 분해해 병렬(Fan-out)로 돌리고 Synthesis에서 취합한다. Replan이 잦아질수록 Orchestrator는 Supervisor에 가까워진다."
  - q: "멀티에이전트는 언제 쓰고, 왜 실패하나?"
    a: "먼저 단일 에이전트로 충분한지 보고, 에이전트를 늘릴 때 따라오는 비용·추적·fallback·지연 부담을 따진다. 실패의 약 40%는 모호한 역할 정의 같은 명세 실패, 약 35%는 데이터 교환 형식 불일치나 오염된 Global State 같은 에이전트 간 정렬 실패, 약 20%는 종료 조건·검증 부재다. 그래서 역할을 겹치지 않게 나누고, State로 형식을 통일하고 Agent Scoping을 하며, 최대 반복·검증 단계·관측성을 갖춘다."
  - q: "메인 에이전트가 대화를 주도하다가 사내 데이터가 필요할 때만 DW 쿼리 전문 에이전트를 부르고, 보안상 필요한 파라미터만 넘긴다면 어떤 패턴인가?"
    a: "Agent-as-Tool이다. 상위 에이전트가 tool-calling으로 서브에이전트를 함수처럼 호출하고, 서브에이전트는 내부에 자체 판단 루프를 갖되 밖으로는 입출력 스키마만 노출한다. 필요한 데이터만 넘기는 State Isolation과 캡슐화(재사용, 내부 변경 격리, 오염 방지)가 장점이고 관측성 저하와 Context Loss가 트레이드오프다."
related: [agentic-design-framework, parallel-fan-out-fan-in, langgraph-state-graph, agent-capstone-mcp/sse-streaming]
source: "2026-10-06 · slides-ai-agent.pdf p.69–80 (Collaboration Structure, Supervisor, Router, Orchestrator, Agent-as-Tool, Swarm, Key blocks, Evaluator-Optimizer, Hybrid), p.81–85 (TODAY QUIZ), p.87 (설계 유의사항), p.99 SUMMARY"
---

| 패턴 | 구조 | 제어권·루프 | 맞는 상황 |
| --- | --- | --- | --- |
| Pipeline (Chaining) | A → B → C 고정 순차 | 런타임 결정 없음, 복귀 없음 | 규정으로 단계가 정해진 처리 (계약서 컴플라이언스) |
| Supervisor | 중앙이 매 스텝 다음 담당 선택 | 작업 후 Supervisor 복귀, 종료·종합도 중앙 | Branch가 많고 품질·종료를 중앙 통제 (요금·기술·해지방어팀 라우팅) |
| Router | 입력 분류 후 한 곳으로 분기 | 1회 결정, 분기하면 끝 (Stateless) | 질문 유형별 경로 분기 |
| Orchestrator-Workers | 실행 전 N개로 분해 → 병렬 → Synthesis | Replan 시에만 반복 | 독립 하위작업 동시 처리 (경쟁사 5곳 조사 리포트) |
| Agent-as-Tool | 서브에이전트를 도구처럼 호출 | 상위가 계속 주도 | 필요할 때만 전문 에이전트, 파라미터만 전달 (DW 쿼리) |
| Swarm (Hand-off) | 에이전트끼리 직접 제어권 이관 | 넘긴 쪽은 빠짐, State의 active_agent | 대화 주제가 자주 바뀜 (요금 → 장애 → 환불) |
| Evaluator-Optimizer | Generator ⇄ Evaluator(Rubric 게이트) | 미달 시 피드백 재생성, 최대 반복 필수 | 검증 기준이 명확한 코드·번역·기술문서 |
| Hybrid | 계획 → Orchestrator → 동적 Sub-Agent → 검증·전달 | 계층·상황별 권한 배분 | 대규모·다단계 (Manus류), 설계 난이도 최고 |

```python
# Swarm Key block (p.78): 각 에이전트가 Handoff 도구를 자기 도구로 보유
to_math = create_handoff_tool(agent_name="math_agent",
                              description="계산·수치 분석이 필요하면 math_agent에게 제어를 넘긴다.")
research_agent = create_agent(model="gpt-4.1", tools=[web_search, to_math], name="research_agent",
                              system_prompt="You are a research specialist in a DECENTRALIZED swarm ...")

workflow = create_swarm([research_agent, math_agent],
                        default_active_agent="research_agent")   # 시작 활성 에이전트 지정
app = workflow.compile(checkpointer=InMemorySaver())             # active_agent를 대화 간 유지
# 내부적으로 Command(goto=대상, update={"active_agent": 대상})로 라우팅
```

> [!note] TODAY QUIZ 정리 (정답은 슬라이드에 없음, 패턴 정의로 판단)
> DW 쿼리 전문 에이전트를 필요할 때만 호출 → Agent-as-Tool / 매 단계 팀 위임 후 복귀, 중앙이 종료 판단 → Supervisor / 실행 전 N개 분해 후 병렬 취합 → Orchestrator-Workers / 주제 바뀌면 직접 넘기고 빠짐 → Swarm / 규정대로 앞 단계 산출물을 다음 단계로 → Pipeline
