---
title: AI Agent 통합 아키텍처와 시스템 경계
en: System Boundary, Integration Architecture
summary: "Frontend·Backend·Agent·MCP·Data 계층에서 retrieval·MCP 위치·세션·에러를 어디서 맡을지 정하는 의도적 결정의 집합"
importance: 3
order: 3
tags: [Architecture, System Boundary, FastAPI, RAG]
keypoints:
  - "같은 동작이라도 경계를 어떻게 긋느냐에 따라 운영·디버깅·확장이 달라짐"
  - "4대 결정: Retrieval 주체, MCP Server 위치, Session/State 관리, 에러 처리 위치"
  - "캡스톤 선택: 1B Agent 검색, 2B stdio, 3C State DB, 4A 계층 처리"
qa:
  - q: "Retrieval을 Backend가 미리 할지, Agent가 도구로 할지 어떻게 정하나?"
    a: "Backend가 항상 검색해 context를 넣어 주면 Agent는 추론만 하면 되고 결정이 단순해서, 지연이 중요한 제품, 비용 예측이 중요한 엔터프라이즈, 검색이 필수인 의약·법률 도메인, 사용자별 검색 범위가 다른 경우에 맞다. Agent가 Retrieval Tool을 필요할 때 호출하게 하면 multi-step 추론 중 여러 번 검색할 수 있어 매뉴얼 검색 + Jira 조회 + 실시간 모니터링처럼 여러 소스를 상황에 따라 조합하는 업무에 맞다. 캡스톤은 후자(1B)를 택했다."
  - q: "에러는 어느 계층에서 처리해야 하나?"
    a: "정답은 없고 제품에 따라 근거로 고른다. 가장 가까운 계층에서 잡아 'no results found'처럼 넘기면(4A) 사용자 경험은 매끄럽지만 진짜 문제가 숨을 수 있다. 최상위로 전파해 일괄 처리하면(4B) 디버깅은 쉽지만 사용자 경험이 어색하고, 계층별 Retry/Fallback(4C)은 안정성은 높지만 프로세스가 복잡하고 mock 같은 fallback 답이 나갈 수 있다."
  - q: "시스템 경계란 무엇이고 왜 먼저 정해야 하나?"
    a: "시스템 경계는 무엇이 시스템 안에 속하고 밖에 속하는지, 경계를 지나는 입출력과 책임 범위를 정하는 선이다. SW에서는 컴포넌트의 책임 경계(단일 책임 원칙), 인터페이스 경계(API Spec, Message Schema), 데이터 경계(Data Ownership, Read/Write 권한)로 나뉜다. 어디서 retrieval하고 어디서 도구 호출을 결정하고 어디서 세션을 관리하느냐는 한 번 정하면 나중에 바꾸기 매우 어려워서 Trade-off를 따져 의도적으로 정한다."
related: [mcp-connection-transport, thread-checkpointer, error-handling, sse-streaming, ai-agent/workflow-vs-agent]
source: "2026-10-21 · slides-agent-capstone.pdf p.4 (System Diagram), p.21–31 (시스템 경계, 핵심 결정 사항, Retrieval 1A/1B, MCP 위치 2A–2C, Session 3A–3C, 에러 4A–4C, Capstone System Diagram), p.36–37 SUMMARY, p.39–42 (FastAPI 통합 Hands-On) · submission-fastapi.zip"
---

```layers
Presentation · Frontend :: Next.js, React, Streamlit — HTTP / SSE / WebSocket
Application · Backend :: FastAPI, Spring, Django — 요청 수신, 양식 검사, Agent 호출
Orchestration · AI Agent :: LangChain, LangGraph + LLM Provider(OpenAI, Google, Anthropic)
Tool · MCP Server :: Python or External, 또는 Direct Tool Integration
Data :: State Store(In-memory, PostgreSQL, Redis), Vector DB(Qdrant, Chroma), External APIs(Jira, Slack, GitHub)
```

| 결정 | 선택지 | 캡스톤 |
| --- | --- | --- |
| 1. Retrieval은 누가? | 1A Backend가 항상 검색 후 전달 / 1B Agent가 Tool로 필요할 때 | 1B Agent·Tool Calling |
| 2. MCP Server 위치 | 2A In-process / 2B Subprocess(stdio) / 2C 별도 서비스(HTTP/SSE) | 2B stdio |
| 3. Session/State 관리 | 3A Frontend가 전체 History 전송(Backend Stateless) / 3B Backend in-memory dict(재시작 시 손실) / 3C Backend + State DB(checkpointer) | 3C State DB |
| 4. 에러 처리 위치 | 4A 가장 가까운 계층, 위로 graceful 메시지 / 4B 최상위에서 일괄 / 4C 계층별 Retry·Fallback | 4A Layer Handling |

- FastAPI 담당 범위: 요청 받기(`main.py`의 `/chat`, `/health`) → 양식 검사(`schemas/chat.py` ChatRequest) → Agent에 넘기기(`ainvoke`). 응답은 `ChatResponse {thread_id, message, tool_calls}`
- 서버 시작 시 1회(lifespan): `build_agent()` → `mcp_client.py`가 MCP Server를 subprocess로 실행 → Tool 목록을 LangChain Tool로 변환

> [!tip] 면접 팁
> "두 시스템이 똑같이 동작해도 경계가 어떻게 그어졌는가에 따라 완전히 다른 시스템"이라는 문장과 함께, 4가지 결정마다 "우리 제품은 왜 이 선택인가"를 근거(지연, 비용 예측, 소스 조합, 운영 R&R)로 말하면 된다.
