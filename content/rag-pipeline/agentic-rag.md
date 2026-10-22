---
title: "Self-RAG·Corrective RAG·Modular RAG·Agentic RAG"
en: "Self-RAG, CRAG, Adaptive-RAG, Modular RAG, Agentic RAG"
summary: "검색 필요성·문서 관련성·답변 근거를 스스로 판단해 재검색·재생성하는 비선형 RAG로의 확장, LangGraph로 구현"
importance: 3
order: 12
tags:
  - RAG
  - Agentic RAG
  - LangGraph
  - Self-RAG
keypoints:
  - "Self-RAG: Reflection Token으로 검색 필요·관련성·근거·유용성을 자기 검증"
  - "CRAG: 검색 품질이 나쁘면 질의 재작성 + 웹 검색 + 지식 정제"
  - "Modular는 레고식 모듈·패턴 조합, Agentic은 에이전트가 검색 전략을 동적 선택"
qa:
  - q: "Self-RAG와 Corrective RAG의 차이는?"
    a: "Self-RAG는 생성 흐름에 Reflection Token을 넣어 검색이 필요한지, 문서가 관련 있는지, 답이 문서로 뒷받침되는지, 답이 유용한지를 모델이 스스로 판단하며 재검색과 재생성을 한다. Corrective RAG는 검색 결과의 품질 평가에 초점을 맞춰, Correct면 그대로 쓰고 Incorrect나 Ambiguous면 질의를 재작성해 웹 검색으로 보강한다. 또 문서를 문장 단위 strip으로 쪼개 질문과 관련된 부분만 남기는 지식 정제를 한다."
  - q: "Agentic RAG란? 설계할 때 주의할 점은?"
    a: "에이전트가 질문마다 어떤 도구와 데이터 소스가 적절한지 판단하고, 라우팅, 질의 재작성, 문서 관련성 평가, 환각 검사를 루프로 돌며 RAG 파이프라인을 도구처럼 동적으로 호출하는 구조다. Multi-Agent, Hierarchical(Supervisor), Corrective, Adaptive 아키텍처가 있다. 반복 재질문과 재생성은 시간과 비용을 늘리므로 종료 조건과 최대 재시도 횟수를 명확히 두고, 어떤 경로로 답이 나왔는지 추적 가능하게 설계해야 한다."
related:
  - advanced-rag
  - rag-evaluation
  - langchain/create-agent
  - langchain/tool-calling
source: "Day2(9/21) RAG 논문 정리 노트, 슬라이드 p.98–147 (3장 RAG 확장 전략, LangGraph Quick Start), 실습 langgraph-v1/20-RAG, langchain-v1/15-RAG/03-AgenticRAG"
---

```flow
Router :: 질문 유형별 경로 분기 (바로 답 / 검색)
Retrieve :: 벡터DB 검색
Grade Documents :: 관련 없으면 Query Rewrite 후 재검색
Generate :: 답변 생성
Hallucination? :: 근거 없으면 재생성
Answer Relevant? :: 질문에 맞으면 종료, 아니면 재작성
```

| 방식 (연도) | 핵심 아이디어 |
| --- | --- |
| Naive RAG (2020) | 파라미터 + 비파라미터 기억 결합, Flat Chunk Top-K |
| Advanced RAG (2023.12) | Pre·Post-Retrieval로 검색 품질 개선 (Rerank, Dense, Multi-hop) |
| Self-RAG (2023.10) | Reflection Token으로 검색 필요성·근거 충실도 자기 평가 |
| Corrective RAG (2024.01) | 검색 품질이 낮으면 웹 검색으로 전환, 지식 정제 |
| Adaptive-RAG (2024.03) | 질문 복잡도 분류기로 검색·생성 전략 선택 |
| Graph RAG (2024.04) | 엔티티·관계 지식 그래프, multi-hop·전역 요약 |
| Modular RAG (2024.07) | 레고처럼 모듈 조합, Routing·Branching·Loop 패턴 |
| Agentic RAG (2025.01) | 에이전트가 검색 전략·도구를 동적으로 선택, 다중 에이전트 협업 |

```python
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "llm_answer")
workflow.add_edge("llm_answer", "relevance_check")
workflow.add_conditional_edges("relevance_check", is_relevant, {
    "grounded": END,                # 근거 있으면 종료
    "notGrounded": "llm_answer",    # 없으면 다시 생성
    "notSure": "llm_answer",
})
```

> [!tip] LangGraph 최소 개념 (상세는 AI Agent 과목)
> State: 노드 간 공유 메모리(TypedDict). Reducer가 없는 키는 덮어쓰기, `Annotated[list, add_messages]`·`operator.add`는 누적. Node: state를 받아 바뀐 키만 dict로 반환. Edge·Conditional Edge: 판단 함수의 반환값이 매핑 키와 정확히 같아야 연결됨. 루프에는 반드시 종료 조건(recursion limit).
