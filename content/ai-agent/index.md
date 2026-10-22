---
summary: "LLM(두뇌)에 도구(행동)를 붙여 스스로 계획·실행·검증하는 에이전트를 설계하는 법 — Reasoning·ReAct·MCP부터 Goal→Plan→Execute→Reflect 설계, 멀티에이전트 패턴, LangGraph 구현, 평가·Harness까지"
keywords:
  - AI Agent
  - Agentic AI
  - Augmented LLM
  - Workflow vs Agent
  - Reasoning
  - Tool Calling
  - ReAct
  - MCP
  - A2A
  - Success Criteria
  - State Schema
  - Supervisor
  - Orchestrator-Workers
  - Agent-as-Tool
  - Swarm
  - Evaluator-Optimizer
  - Agentic RAG
  - LangChain 1.0
  - create_agent
  - Middleware
  - HITL
  - LangGraph
  - Reducer
  - Fan-out/Fan-in
  - PassK
  - Harness Engineering
materials:
  - file: slides-ai-agent.pdf
    title: "강의 슬라이드 — AI Agent 설계 및 구축"
    type: slides
    date: 2026-10-06
---

## 한눈에 보기

```flow
AI Agent 이해 :: Agent = LLM(두뇌) + Tools(행동), Workflow ↔ Agent 스펙트럼
핵심 요소 :: Reasoning, Tool Calling·ReAct, MCP·A2A 프로토콜
Agentic Workflow 설계 :: Goal → Plan → Execute → Reflect, 협업 패턴, Agentic RAG
AI Agent 구현 :: LangChain 1.0 `create_agent`·Middleware, LangGraph State·Node·Edge, Fan-out/Fan-in
평가 :: 결과·도구·정책·운영 4축, Regression Test와 PassK
Harness :: 판정은 확률에 맡기고 게이트·권한·Loop 종료·Retry는 코드로 강제
```

- 에이전트는 LLM이 계획하고 도구로 행동한 뒤 결과를 관찰해 다음 행동을 정하는 루프(Thought → Action → Observation). 이 루프를 누가 통제하느냐(코드 vs 모델)가 Workflow와 Agent를 가른다.
- 강의의 관통 메시지는 "Agent는 사고 구조 설계에서 시작한다" — 판정 가능한 Success Criteria, State Schema, 실패·종료 정책, 협업 구조를 먼저 정하고 구현한다.
- 구현은 표준 패턴이면 `create_agent` + Middleware, 비선형 분기·멀티에이전트면 LangGraph로 직접 조립. 마지막으로 확률적인 LLM을 평가와 Harness(결정론적 경계)로 감싸 운영한다.

## 수업 흐름

슬라이드 한 벌(`slides-ai-agent.pdf`, 171쪽)로 이틀 진행. 자료에 Day 경계 표시가 없어 장 구성(각 장 끝 SUMMARY, 3장 끝 TODAY QUIZ)으로 나눔. 페이지는 PDF 기준.

**Day 1 (2026-10-06, 추정) — 이해 · 핵심 요소 · 설계**

1. **AI Agent 이해** (p.3–16) — ANI → G.AI → AGI, Gartner 2026 Agentic AI 정점, AI Agent(System) vs Agentic AI(Paradigm), LLM + Tools, 여행 에이전트 예시, AI Service Spectrum(Augmented LLM, Workflow·Agent·Hybrid), Prompt → Context → Harness Engineering
2. **AI Agent 핵심 요소** (p.17–53) — Inference vs Reasoning, GSM-Symbolic, LLM Reasoning 역할·보완 방식, Built-in/Custom Tools, Tool Calling, ReAct와 확장(Supervisor 기원 HuggingGPT·AutoGen), `create_agent` 프로세스, MCP(Host-Client-Server, 3요소, Tool Calling vs MCP), A2A
3. **AI Agentic Workflow** (p.54–100) — Andrew Ng Agentic Workflow(GPT-3.5 48.1% → 루프 95.1%), Design Framework(Goal·Success Criteria·Task Decomposition·State Schema·Control Strategy·Collaboration Structure), Supervisor·Router·Orchestrator·Agent-as-Tool·Swarm·Evaluator-Optimizer·Hybrid, TODAY QUIZ, Reflection, MAS 3대 실패 범주, Agentic RAG·Analytics, WebSearch TIP

**Day 2 (2026-10-07, 추정) — 구현 · 평가 · Harness**

4. **AI Agent 구현** (p.101–148) — LangChain 0.x 한계, LangChain 1.0(`create_agent`, Middleware, HITL), LangGraph State(Overwrite·Reducer·Single/Layered State)·Node·Edge·Command, Node vs Agent, Parallel Execution(Fan-out/Fan-in, Map-Reduce), Multi-Agent Output 부실 TIP
5. **[Appx. A] AI Agent 평가** (p.149–155) — LangSmith Trace, RAG vs Agent 평가, Regression Test·PassK, 평가 방법론(Trigger → Setting → Eval Metric → Release Gate → Feedback Loop), 4축 Eval Metric
6. **[Appx. B] Harness Engineering** (p.156–170) — Agent = Model + Harness, Deterministic Boundary(Judge vs Gate), State Schema 검증, 설계 고려사항 5가지(권한·게이트·컨텍스트·Loop 종료·Retry), Harness 과잉

## 실습 정리

- 별도 노트북 자료는 없음. 슬라이드 속 코드 예제(Key blocks, Middleware, LangGraph, Fan-out)가 실습 역할을 하고, 실제 구현은 이어지는 캡스톤(`agent-capstone-mcp`)에서 MCP Server + FastAPI + LangGraph로 진행함.

| 주제 | 슬라이드 | 핵심 API |
| --- | --- | --- |
| 도구·에이전트 생성 | p.29 | `@tool`, `create_agent(model, tools, system_prompt)`, `invoke`/`stream` |
| 멀티에이전트 Key blocks | p.76–78 | Supervisor handoff tool + `Command(goto=..., graph=Command.PARENT)`, Orchestrator `Send`, `create_handoff_tool`·`create_swarm` |
| Middleware | p.107–116 | `@before_agent`, `@after_model`, `@wrap_model_call`, `ModelCallLimitMiddleware`, `HumanInTheLoopMiddleware` |
| LangGraph | p.117–127 | `TypedDict` + `Annotated[list, add_messages]`, `add_node`, `add_conditional_edges`, `Command` |
| 병렬 실행 | p.134–137 | `RunnableParallel`, 같은 upstream을 가진 노드 자동 병렬, `ainvoke` |
| Harness | p.164–168 | 도구 노출 필터, `judge_node` → `gate`, `recursion_limit`, 멱등 Retry + checkpointer |

```python
# 위험한 도구만 사람 승인을 받는 에이전트 (p.109, p.112)
agent = create_agent(
    model=model,
    tools=[search_tool, send_email_tool, delete_database_tool],
    middleware=[
        HumanInTheLoopMiddleware(interrupt_on={
            "send_email_tool": True,        # 민감 작업: 승인 필요
            "delete_database_tool": True,
            "search_tool": False,           # 안전 작업: 자동 승인
        }),
        ModelCallLimitMiddleware(thread_limit=5, run_limit=2, exit_behavior="end"),
    ],
    checkpointer=InMemorySaver(),           # Pause/Resume은 State 저장이 전제
)
config = {"configurable": {"thread_id": "some_id"}}
agent.invoke({"messages": [{"role": "user", "content": "..."}]}, config=config)
agent.invoke(Command(resume={"decisions": [{"type": "approve"}]}), config=config)
```

```python
# 판정(확률)과 라우팅(결정론)을 분리한 품질 게이트 (p.166)
THRESHOLD, MAX_ATTEMPTS = 0.8, 3

def judge_node(state):                       # LLM Judge: 확률적 판정
    return {"judge_score": llm_judge(state["draft"]).score}

def gate(state) -> Literal["pass", "fix", "fail"]:   # 순수 함수: 결정론적 분기
    if state["judge_score"] >= THRESHOLD: return "pass"
    if state["attempts"] < MAX_ATTEMPTS:  return "fix"
    return "fail"

g.add_conditional_edges("judge", gate, {"pass": END, "fix": "writer", "fail": END})
```
