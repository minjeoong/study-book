---
title: "병렬 실행 — Fan-out / Fan-in"
en: Parallel Execution, Fan-out/Fan-in, Map-Reduce
summary: "독립 작업을 동시에 분기(Fan-out)했다가 결과를 모으는(Fan-in) 패턴 — 품질이 아니라 효율(지연 단축)을 위한 것"
importance: 2
order: 11
tags: [LangGraph, 병렬 처리, Multi-Agent]
keypoints:
  - "Task-level(한 에이전트의 여러 작업)과 Agent-level(여러 에이전트) 병렬"
  - "공유 키 Reducer, checkpointer, max_concurrency로 정합성·실패·동시성 통제"
  - "Fan-in은 도착 순서에 의존하지 않게, 브랜치별 타임아웃, 멱등한 재시도"
qa:
  - q: "LangGraph에서 Fan-out/Fan-in은 어떻게 구현하고 무엇을 조심하나?"
    a: "한 노드에서 여러 노드로 add_edge를 걸면 같은 upstream을 가진 downstream 노드가 자동으로 병렬 실행되고, 여러 노드를 한 노드로 모으면 모든 upstream이 끝나야 실행된다. 병렬 노드가 같은 State 키에 쓰면 Reducer 없이는 마지막 값이 덮어써 유실되므로 각 노드는 자기 키만 쓰거나 공유 키에 Reducer를 둔다. 한 브랜치가 실패하면 성공 브랜치 결과도 저장되지 않으므로 checkpointer로 보존해 실패 브랜치만 재시도하고, max_concurrency로 동시 실행 수를 제한해 Rate limit을 관리한다."
  - q: "멀티에이전트 최종 보고서가 부실하게 나오는 이유와 대책은?"
    a: "에이전트가 State에 쓸 때 LLM이 자연스럽게 요약하고, 파이프라인을 지날 때마다 2000 → 500 → 200 → 50 토큰처럼 정보가 누적 손실되며, 대화가 길어지면 자동 압축까지 일어나기 때문이다. 보고서 프롬프트가 'State 내용으로 작성해줘' 수준이면 더 나빠진다. 대책은 원본 보관 + 요약만 전달 방식으로, raw_findings는 압축 금지·누적만 하는 필드로 따로 두고 보고서 노드가 raw 데이터를 직접 참조하게 하며, 프롬프트에 분량을 명시하고 checkpointer로 중간 결과를 보존한다."
related: [langgraph-state-graph, multi-agent-patterns, agent-capstone-mcp/cost-latency]
source: "2026-10-07 · slides-ai-agent.pdf p.130–137 (Parallel Execution, Fan-out/Fan-in·Map-Reduce, Fan-out·Fan-in 설계 고려사항, LangChain RunnableParallel, LangGraph 예제), p.143–148 (SUMMARY, TIP Multi-Agent Output)"
---

```flow
Coordinator :: 입력을 받아 독립 작업으로 분기 (Fan-out)
Summary · Sentiment · Translation :: 같은 upstream을 가진 노드는 자동 병렬 실행
Aggregate :: 모든 upstream이 끝나야 실행 (Fan-in), 값이 없을 때 대비
END :: 최종 리포트
```

| # | 고려사항 | 문제 | 대응 |
| --- | --- | --- | --- |
| 1 | Reducer (병렬 정합성) | 같은 키에 쓰면 마지막 작성이 덮어씀 | 공유 키에 Reducer, 각 노드는 담당 키만 업데이트 |
| 2 | 부분 실패 처리 | 한 브랜치 실패 시 성공 결과도 미저장 | Checkpointer 필수, 재개 시 실패 브랜치만 재시도 |
| 3 | Concurrency 제어 | 순간 리소스 증가로 Rate limit | `{"configurable": {"max_concurrency": 10}}` |
| 4 | 부분 실패·재처리 | 응답 없는 브랜치 하나가 전체를 멈춤 | 브랜치별 타임아웃, 멱등성, 일부 성공 시 정책 |
| 5 | 결과 통합 | 완료 순서가 비결정적 | 도착 순서에 의존하지 않는 통합, 지연 실행(defer) |
| 6 | 관측성 | 가장 느린 브랜치가 전체 지연 결정 | 브랜치 단위로 실행·실패 추적, 병목 식별 |

```python
class AppState(TypedDict, total=False):      # total=False: 부분 업데이트 허용
    text: str; summary: str; sentiment: str; translation: str; report: str

graph = StateGraph(AppState)
graph.add_node("Coordinator", coordinator_node)
graph.add_node("Aggregate", aggregate_node)  # state.get("summary", "(missing)") 처럼 방어적으로
for name, fn in [("Summary", summary_node), ("Sentiment", sentiment_node), ("Translation", translation_node)]:
    graph.add_node(name, fn)
    graph.add_edge("Coordinator", name)      # Fan-out
    graph.add_edge(name, "Aggregate")        # Fan-in
graph.set_entry_point("Coordinator")
graph.add_edge("Aggregate", END)
out = await graph.compile().ainvoke({"text": "..."})
```

> [!note] 병렬 = 효율
> 한정식 코스를 요리사 1명이 순서대로 만들면 느리고, 여러 명이 동시에 만들면 빠르다. 품질이 아니라 Latency를 줄이는 기법. LangChain에서는 `RunnableParallel({"summary": ..., "sentiment": ..., "translation": ...})`로 같은 효과.
