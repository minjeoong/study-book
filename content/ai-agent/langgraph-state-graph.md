---
title: LangGraph — State, Node, Edge
en: LangGraph StateGraph
summary: "에이전트 실행 흐름을 State(공유 작업 메모리)·Node(작업)·Edge(연결·분기)의 그래프로 설계하고 실행하는 런타임"
importance: 3
order: 10
tags: [LangGraph, State, Reducer, Conditional Edge]
keypoints:
  - "Chain은 한 방향 1회 통과, Graph는 반복(Loop)·조건 분기·중단 후 재개"
  - "Reducer 없는 키는 덮어쓰기, add_messages·operator.add는 누적"
  - "Node는 변경된 키만 담은 dict 반환, 분기는 Conditional Edge 또는 Command"
qa:
  - q: "LangGraph를 왜 쓰나? create_agent와는 어떻게 고르나?"
    a: "복잡한 문제는 결과 확인, 검토, 재검색 같은 반복과 조건 분기가 필요한데 Chain은 한 방향으로 한 번 통과하고 끝난다. LangGraph는 State·Node·Edge로 순환과 분기를 표현하고, State를 저장해 중간에 끊겨도 이어서 실행하며 HITL로 일시정지할 수 있다. 모델 호출 → 도구 실행 반복 같은 표준 패턴이면 create_agent에 미들웨어를 얹고, 비선형 분기·다중 에이전트·세밀한 State 설계가 필요하면 LangGraph로 직접 조립한다."
  - q: "State의 Reducer는 무엇인가?"
    a: "Reducer는 필드 업데이트를 기존 값과 어떻게 합칠지 정하는 fold 함수다. Reducer가 없으면 노드가 반환한 값으로 덮어쓰고(last-write-wins), messages: Annotated[list, add_messages]처럼 지정하면 새 메시지를 이어 붙인다. 병렬 노드가 같은 키에 쓰면 Reducer 없이는 데이터가 유실되므로 공유 키에는 Reducer를 둔다."
  - q: "Conditional Edge와 Command의 차이는?"
    a: "Conditional Edge는 노드가 상태만 바꾸고 다음 노드는 노드 밖 판별 함수가 정해서 작업과 분기가 분리되고 흐름이 잘 보인다. Command는 노드가 update와 goto를 함께 반환해 상태 갱신과 분기를 한 번에 처리하므로 '내 결과는 여기, 다음은 저 에이전트' 같은 Handoff에 편하다. 대신 분기가 노드 안에 숨으므로 Command[Literal[...]] 반환 타입으로 갈 수 있는 노드를 선언해야 그래프가 경로를 인식한다."
related: [langchain-middleware, parallel-fan-out-fan-in, agentic-design-framework, agent-capstone-mcp/thread-checkpointer]
source: "2026-10-07 · slides-ai-agent.pdf p.104–105 (LangGraph, LangChain vs LangGraph), p.117–129 (구성 요소, State·Overwrite·Reducer·State Implementation·Single/Layered State, Node, Edge, Command, Node vs Agent), p.140–142 SUMMARY"
---

| 구성 요소 | 목적 | 역할·주의 |
| --- | --- | --- |
| State | 현재 상태 저장·전달 | 노드 간 공유 작업 메모리. `TypedDict`로 스키마 선언, 키 이름이 정확히 일치해야 공유 |
| Node | 수행할 작업 정의 | State를 받아 변경된 키만 dict로 반환 → LangGraph가 병합. 한 노드에 여러 책임 금지 |
| Edge | 다음 실행 노드 연결 | `add_edge(A, B)` 순차 흐름 |
| Conditional Edge | 조건 분기 | 판별 함수 반환값 = 매핑 딕셔너리 키. 반복 흐름엔 exit 조건 필수(무한루프 → 토큰 낭비) |

```python
class GraphState(TypedDict):
    messages: Annotated[list, add_messages]   # Reducer: 메시지 누적
    question: str                             # Reducer 없음: 덮어쓰기
    context: str
    answer: str
    score: str

def retrieve_document(state: GraphState) -> dict:
    docs = pdf_retriever.invoke(state["question"])
    return {"context": format_docs(docs)}     # 바뀐 키만 반환

workflow = StateGraph(GraphState)
workflow.add_node("retrieve", retrieve_document)
workflow.add_node("llm_answer", llm_answer)
workflow.add_node("relevance_check", relevance_check)
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "llm_answer")
workflow.add_edge("llm_answer", "relevance_check")
workflow.add_conditional_edges("relevance_check", is_relevant, {
    "grounded": END,                  # 근거 있으면 종료
    "notGrounded": "llm_answer",      # 없으면 다시 생성
})
```

- Node vs Agent: Node는 HOW(단일 기능, 사전 정의된 엣지로 결정론적, 실패는 국소적), Agent는 WHAT·WHEN(노드를 조합·제어, 런타임에 LLM이 판단, 실패 파급이 넓음). 1:1 대응이 아님 — Node = Agent, 여러 Node = 1 Agent(Plan → Execute → Review), Node = Tool(LLM 없는 ToolNode)
- Layered State: Orchestrator는 워커가 같은 키를 동시에 쓰므로 커스텀 Reducer 필수, Supervisor는 한 번에 한 워커라 `operator.add`로 충분하지만 왕복 루프라 `step_count`·`max_steps` 필수

> [!tip] State는 컨테이너가 아니라 Read/Write Contract
> 노드는 자기가 읽고 쓸 키만 안다(State Ownership). 실패를 고려해 `status`(SUCCESS·FAILED·INTERRUPTED), `retry_count`, `last_error`를 두고, 대용량 원문은 외부 저장소 참조 ID로 둔다. Optional·Nested 필드로 확장성 확보.
