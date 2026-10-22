---
summary: "ICT 운영 지원 에이전트를 MCP Server → FastAPI 통합 → SSE 스트리밍 UI → Supervisor 멀티에이전트 → 운영(관측·에러·비용·세션)까지 한 시스템으로 쌓아 올리는 캡스톤"
keywords:
  - MCP
  - FastMCP
  - Tool
  - Resource
  - Prompt
  - MCP Inspector
  - JSON-RPC
  - stdio
  - System Boundary
  - FastAPI
  - LangGraph
  - langchain-mcp-adapters
  - thread_id
  - Checkpointer
  - SSE
  - Event Schema
  - Next.js
  - Vercel AI SDK
  - Supervisor
  - Observability
  - LangSmith
  - Graceful Degradation
  - AsyncPostgresSaver
materials:
  - file: slides-agent-capstone.pdf
    title: "강의 슬라이드 — AI Agent Capstone"
    type: slides
    date: 2026-10-21
  - file: submission-mcp.zip
    title: "과제 제출 — MCP (워크시트, 코드, 캡처)"
    type: lab
    date: 2026-10-21
  - file: submission-fastapi-initial.zip
    title: "과제 제출 — FastAPI (첫 제출본)"
    type: lab
    date: 2026-10-21
  - file: submission-fastapi.zip
    title: "과제 제출 — FastAPI (코드, 결과, 캡처)"
    type: lab
    date: 2026-10-21
  - file: submission-streaming-prev-design.zip
    title: "과제 제출 — Streaming (이전 디자인)"
    type: lab
    date: 2026-10-22
  - file: submission-streaming.zip
    title: "과제 제출 — Streaming (코드, 결과, 캡처)"
    type: lab
    date: 2026-10-22
  - file: submission-multiagent.zip
    title: "과제 제출 — Multi-agent (코드, 결과, 캡처)"
    type: lab
    date: 2026-10-22
---

## 한눈에 보기

```layers
Frontend · Next.js :: 채팅 UI, Tool call 카드, Plan·Task 뷰 — SSE 수신, thread_id는 localStorage
Backend · FastAPI :: `/health`, `/chat`, `/chat/stream`, `/chat/supervisor/stream` — 요청 검증, 이벤트를 SSE로 번역
AI Agent · LangGraph :: ReAct 에이전트(graph.py)와 Supervisor 그래프(planning → research·writing), checkpointer
MCP Server · FastMCP (stdio subprocess) :: ict-operations-support — Tool 4 · Resource 1 · Prompt 1
Data :: runbook·모니터링 데이터, Jira API(미설정 시 mock), State Store(in-memory → PostgreSQL)
```

- 장애 대응을 돕는 "ICT 운영 지원 에이전트" 하나를 아래 계층부터 위로 쌓는다. 매 단계 모듈 연결도와 서비스 흐름도로 어느 계층에 무엇이 추가되는지 확인하고, 결과를 캡처·`results.md`로 제출.
- 핵심 질문은 "기술적으로 가능한가"가 아니라 "어디에 둘 것인가" — retrieval 주체(Agent Tool Calling), MCP 위치(stdio subprocess), 세션 저장(checkpointer), 에러 처리 계층을 근거를 갖고 고르는 통합 아키텍처 설계.
- 에이전트 루프 자체는 ReAct(LLM 판단 → MCP Tool 호출 → 결과 관찰 → 응답)이고, 그 위에 스트리밍·멀티에이전트·운영 관점이 더해진다.

## 수업 흐름

페이지는 `slides-agent-capstone.pdf` 기준. 매 장은 Callback(DONE/YET) → 개념 → SUMMARY → Notion 가이드 Hands-On 순서.

**Day 1 (2026-10-21) — MCP Server, FastAPI 통합**

1. **MCP 설계 및 개발** (p.3–20) — System Diagram(5계층), MCP Host·Client·Server Recap, `client.py`·`server.py` 프로세스와 JSON-RPC 2.0, Resource·Tool·Prompt 결정 주체, "일단 Tool로" 안티패턴, 의사결정 워크플로우(Function → Capability → Responsibility), MCP Inspector와 점검 체크리스트, Hands-On MCP Server
2. **통합 아키텍처** (p.21–42) — 시스템 경계(Responsibility·Interface·Data), 핵심 결정 4가지(Retrieval 1A/1B, MCP 위치 2A/2B/2C, Session 3A/3B/3C, 에러 4A/4B/4C), Capstone 선택(1B·2B·3C·4A), Thread와 Checkpointer, Thread Owner(Backend vs Frontend), UUID v4, Hands-On FastAPI 통합

**Day 2 (2026-10-22) — Streaming, Multi-Agent Streaming**

3. **Streaming** (p.43–68) — Stream vs Streaming, 3가지 차원(Transport·Content·Lifecycle), SSE 동작·한계, Multi-Event Streaming, Event Schema, Keep-alive·Disconnect·Backpressure, Streamlit vs React vs Next.js, Vercel AI SDK, Hands-On Streaming, Multi-Agent Streaming(Supervisor)

**Day 3 (2026-10-23, 예정) — 통합 환경의 운영**

4. **통합 환경의 운영** (p.69–105) — Observability(Trace·Span·Metrics·Metadata)와 Eval(Dataset·Evaluator·Score), Error 분류·계층별 책임·Retry 정책·Graceful Degradation, Cost & Latency vs Quality, 병렬 실행 조건, Stateful → Stateless Session(AsyncPostgresSaver, lifespan, checkpointer 외부 주입), Hands-On 4종
- 목차의 "5. Agent 확장"은 슬라이드에 내용이 없음. Day 3 노트는 슬라이드 기준이며 제출물은 아직 없음.

## 실습 정리

**도메인**: ICT 운영 지원 에이전트 (gpt-4o, MCP 도구 4개). 장애 신고 → 모니터링 확인 → runbook 확인 → 유사 Jira 티켓 검색 → 필요 시 티켓 생성.

| Hands-On | 만든 것 | 확인한 결과 (제출 `results.md`·캡처) |
| --- | --- | --- |
| MCP Server (10/21 오전) | `mcp-server/server.py` FastMCP 서버 `ict-operations-support` + 설계 워크시트 | Inspector(STDIO)로 Tool 4개·Resource Template 1개·Prompt 1개 직접 호출, output schema 검증 통과 (A–F 캡처) |
| FastAPI 통합 (10/21 오후) | `backend/main.py`(`/health`, `/chat`), `schemas/chat.py`, `agent/graph.py`, `agent/mcp_client.py` | T1 매뉴얼 검색, T2 auth-service degraded, T3 같은 thread_id로 "그 시스템" → auth-service 인식. E1 `chmod 000 server.py` → `McpError: Connection closed` → HTTP 500 원인 미표시, E2 미등록 시스템은 정상 안내 |
| Streaming (10/22 오전) | `streaming/event_converter.py`·`sse_formatter.py`, `POST /chat/stream`, Next.js `lib/transport.ts`·`thread.ts`, `ToolCallView` | Tool 박스("도구 사용 중" → "도구 완료") 후 토큰 점진 표시, 새로고침 후 thread 유지·기억, "새 대화"는 새 thread. Backend kill 시 `[에러 발생: network error]`, 재시도 없음 |
| Multi-Agent Streaming (10/22 오후) | `agent/supervisor_graph.py`, `POST /chat/supervisor/stream`, `PlanView`·`TaskListView`, 모드 토글 | Single 1.7초(되묻기) vs Multi 11.2초(Plan → Task 3개 research·research·writing → 최종 응답), 비교 질문은 Task 4개, "안녕하세요"는 writing 1개(2.7초) |

**MCP 설계 결과** (워크시트 `Design Worksheet – MCP Server`)

| 기능 | 분류 | 이름 (Inspector) | 근거 |
| --- | --- | --- | --- |
| 운영 매뉴얼 절차 검색 | Tool (조회) | `search_operations_manual(query, top_k)` | 검색어마다 결과가 달라 고정 URI 불가 |
| incident 유형별 runbook | Resource | `runbook://incident-response/{incident_type}` | 유형 이름으로 주소가 정해지는 고정 문서 |
| Jira 티켓 검색 | Tool (조회, Open-world) | `search_jira_tickets(query, status, max_results)` | 티켓이 계속 바뀌어 시점마다 결과 다름 |
| Jira 티켓 생성 | Tool (Action) | `create_jira_ticket(summary, description, priority, service)` | 외부 시스템에 쓰기, 재시도 시 중복 위험 (Idempotent 아님) |
| 모니터링 상태 조회 | Tool (조회) | `get_monitoring_status(system_name)` → `SystemStatus` | 실시간으로 바뀌는 상태 |
| 장애 진단 표준 절차 | Prompt | `incident_analysis_prompt(service, symptom)` | 사용자가 골라 쓰는 지시문 틀 (상태 → runbook → 티켓 → 분석 → 생성 제안) |

```python
# 스트리밍 Endpoint 흐름 (p.64–65 서비스 흐름도 기준 스케치, 실제 제출 코드 아님)
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    config = {"configurable": {"thread_id": req.thread_id}}       # Frontend가 만든 thread_id
    async def events():
        async for mode, chunk in agent.astream(
            {"messages": [("user", req.message)]}, config, stream_mode=["messages", "updates"]
        ):
            for item in convert(mode, chunk):                      # event_converter: token / tool_call_start / tool_call_end
                yield sse(item)                                    # sse_formatter: "event: ...\ndata: {...}\n\n"
        yield sse({"type": "done", "thread_id": req.thread_id})
    return StreamingResponse(events(), media_type="text/event-stream")
```

> [!warn] 실습에서 드러난 한계
> 에러 처리가 아직 없어서 MCP Server가 죽으면 사용자에게는 원인 없는 `Internal Server Error`(비스트리밍)나 `[에러 발생: network error]`(스트리밍)만 보이고, 진행 중이던 Tool 카드는 "도구 사용 중"으로 멈춘다. Day 3의 Error Handling(계층별 책임, Retry, ErrorEvent)이 이 지점을 다룬다.
