---
title: MCP 연결 구조, Transport, Inspector
en: MCP Client-Server, stdio vs HTTP/SSE, MCP Inspector
summary: "Client가 Server와 1:1로 JSON-RPC 2.0 메시지를 주고받는 구조 — stdio(하위 프로세스)냐 HTTP/SSE(네트워크)냐로 배치가 갈림"
importance: 2
order: 2
tags: [MCP, JSON-RPC, stdio, Inspector]
keypoints:
  - "Host가 Tool 결정, Client는 Server와 1:1, Server가 3요소 제공"
  - "배치: In-process, Subprocess(stdio), 별도 Service(HTTP/SSE)"
  - "Inspector로 에이전트 연결 전에 목록·직접 호출·JSON-RPC 메시지·에러를 검증"
qa:
  - q: "MCP Server는 어디에 두나? stdio와 HTTP/SSE transport의 차이는?"
    a: "세 가지 선택지가 있다. Agent와 같은 Python 프로세스에서 도구 함수를 import해 직접 부르면 MCP 프로토콜 통신이 없어 사실상 MCP를 쓰지 않는 것이다. Backend가 MCP Server를 subprocess로 띄워 stdio로 통신하면 같은 머신에서 함께 운영할 수 있고, 캡스톤은 이 방식을 택했다. MCP Server를 독립 서비스로 배포해 HTTP/SSE로 통신하면 다른 머신에서 여러 Backend가 공유하고, 다른 팀이 운영하며 독립적으로 배포·확장할 수 있다."
  - q: "MCP Inspector로 무엇을 점검하나?"
    a: "AI가 도구를 못 쓰는 문제보다 사람이 도구를 AI가 쓰기 어렵게 만든 문제가 많아서, 에이전트를 붙이기 전에 서버를 직접 검증한다. 노출된 Tool·Resource·Prompt 목록이 빠짐없이 보이는지, Tool 설명이 언제 쓰는지를 말하는지, 입력 필드마다 Field(description=...)가 있는지 보고, Tool은 인자로 실행, Resource는 URI로 조회, Prompt는 인자로 렌더링해 결과를 확인한다. 존재하지 않는 URI나 인자 누락 시 의도한 에러가 나는지, History에서 JSON-RPC 메시지도 확인한다."
related: [mcp-server-design, integration-architecture, ai-agent/mcp-a2a-protocol]
source: "2026-10-21 · slides-agent-capstone.pdf p.6–7 (MCP Architecture Recap, MCP 구성 요소), p.12–14 (Hands-On, MCP Inspector, 점검 체크리스트), p.18–20 (모듈 연결도, 서비스 흐름도), p.27 (MCP Server 위치 2A–2C) · submission-mcp.zip (Inspector 캡처 A–F)"
---

```flow
Connect (stdio) :: Inspector(Client)가 `server.py`를 하위 프로세스로 실행
Capability 목록 :: `tools/list`, `resources/templates/list`, `prompts/list` → Tool 4 · Resource 1 · Prompt 1
tools/call :: `get_monitoring_status("auth-service")` → degraded, alerts, output schema 검증
resources/read :: `runbook://incident-response/db-down` → runbook 본문(markdown)
prompts/get :: `incident_analysis_prompt(service, symptom)` → 표준 진단 절차 메시지
```

```compare
(2A) In-process | (2B) Subprocess · stdio | (2C) Network · HTTP/SSE
배치 | Agent와 같은 Python 프로세스 | 같은 서버, 별도 프로세스 (sidecar) | 별도 서비스, 다른 머신 가능
호출 | 도구 함수를 직접 import | Backend가 MCP Server를 subprocess로 띄움 | 네트워크로 MCP 메시지 송수신
특징 | MCP 프로토콜 통신 없음 | MCP 운영을 같은 머신에서 관리 | 여러 Backend가 공유, 독립 배포·확장
언제 | 단순 PoC | 캡스톤 선택 | 다른 팀이 운영, Production 확장
```

```bash
# Inspector가 Client 역할 — server.py를 하위 프로세스(stdio)로 실행
npx @modelcontextprotocol/inspector@v1-latest \
  uv run python mcp-server/server.py
```

- 메시지는 JSON-RPC 2.0 요청/응답. `mcp = FastMCP(...)`는 서버 실물(인스턴스) 하나를 만드는 코드이고, 이후 `@mcp.tool()` 등으로 기능을 등록
- 에이전트 쪽(FastAPI 실습)은 `mcp_client.py`가 lifespan에서 MCP Server를 subprocess로 실행하고 Tool 목록을 LangChain Tool로 변환해 그래프에 넘김 (langchain-mcp-adapters)

> [!note] Tool annotation도 Inspector에서 보인다
> 실습 서버의 조회 Tool은 Read-only·Idempotent, `search_jira_tickets`는 외부 Jira를 부르므로 Open-world, `create_jira_ticket`은 Read-only도 Idempotent도 아닌 Open-world로 표시됐다. 재시도·HITL 정책을 정할 때 이 힌트가 근거가 된다.
