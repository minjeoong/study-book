---
title: Tool Calling과 ReAct
en: Tool Calling, ReAct (Reasoning + Acting)
summary: "모델이 필요한 도구를 골라 호출하고 결과를 관찰해 다음 행동을 정하는 Thought → Action → Observation 루프"
importance: 3
order: 4
tags: [Tool Calling, ReAct, LangChain]
keypoints:
  - "Custom Tool은 @tool + 명확한 Type Hint·Docstring이 필수"
  - "ReAct: Thought → Action → Observation 반복, 정보가 충분하면 Answer"
  - "LangChain 1.0은 create_agent(model, tools, prompt)로 구성"
qa:
  - q: "ReAct 프레임워크를 설명해 달라."
    a: "ReAct는 Reasoning과 Acting을 하나의 시스템으로 결합한 2022년 Princeton·Google Research 연구로, 이후 Tool-use, Memory, Multi-Agent 프레임워크의 토대가 됐다. 질문을 받으면 다음에 무엇을 할지 생각(Thought)하고, 도구 호출·데이터 검색·외부 API 호출 같은 행동(Action)을 실행한 뒤 결과를 관찰(Observation)한다. 정보가 충분한지, 추가 행동이 필요한지, 종료 조건인지 판단해 루프를 다시 돌거나 최종 답을 낸다."
  - q: "커스텀 도구를 만들 때 주의할 점은?"
    a: "LLM은 함수 본문이 아니라 이름, 설명, 파라미터 스키마를 보고 언제 어떤 인자로 호출할지 결정한다. 그래서 @tool 데코레이터로 함수를 도구로 바꿀 때 명확한 Type Hint와 Docstring을 반드시 작성해야 한다. 설명이 모호하거나 비슷한 도구가 여러 개면 도구 선택이 흔들린다."
related: [llm-reasoning, mcp-a2a-protocol, multi-agent-patterns, langchain-middleware, agent-capstone-mcp/mcp-server-design]
source: "2026-10-06 · slides-ai-agent.pdf p.24–29 (Tools, Tool Calling, ReAct Framework, ReAct 확대/발전, Supervisor 기원, Tool Calling Process), p.47–48 SUMMARY"
---

```flow
Question :: 사용자 요청 이해
Thought :: 어떤 도구를 써야 할까? (Reasoning)
Action :: RAG, 웹 검색, 코드 실행 등 도구 호출
Observation :: 도구 결과 분석 — 정보 충족성, 추가 액션 필요성, 종료 조건
Answer :: 충분하면 최종 응답, 아니면 Thought로 복귀
```

```python
from langchain_core.tools import tool
from langchain.agents import create_agent

@tool
def search_web(query: str) -> str:
    """최신 정보가 필요할 때 웹을 검색한다."""   # 설명이 곧 도구 선택 기준
    ...

agent = create_agent(
    model=llm,
    tools=[search_web, retrieve_docs],            # 여러 도구는 리스트로
    system_prompt="You are a helpful assistant. Answer the user's question using the provided tools.",
)
result = agent.invoke({"messages": [{"role": "user", "content": user_input}]})  # 또는 stream
print(result["messages"][-1].content)
```

- Built-in Tools/Toolkit: LangChain이 미리 정의한 도구(단일 기능)와 목적별 도구 묶음
- ReAct 이후 확장(2024~): Hierarchical·Handoff·Supervisor 같은 Orchestration, 순환·조건부 엣지를 갖는 Graph 협업(LangGraph), 단기 메모리(Checkpointer)·장기 메모리(별도 DB)

> [!note] Supervisor 패턴의 기원
> 개념적 기원은 HuggingGPT(2023.03) — LLM이 직접 풀지 않고 관리자로서 전문 모델에 일을 시킴. 구조적 기원은 AutoGen(2023.08) — 멀티에이전트 협업·순서 제어를 프레임워크로 구현한 첫 사례.
