---
title: "MCP Server 설계 — Tool, Resource, Prompt"
en: MCP Server Capabilities
summary: "기능을 Tool(모델 제어)·Resource(앱 제어)·Prompt(사용자 제어)로 나눠 노출하는 MCP Server 설계"
importance: 3
order: 1
tags: [MCP, FastMCP, Tool, Resource, Prompt]
keypoints:
  - "핵심 차이: Agent가 판단해 호출하는가(Tool), 미리 노출되어 있는가(Resource·Prompt)"
  - "Action은 Tool, 사용자 템플릿은 Prompt, 동적 조회는 Tool, 고정 자료는 Resource"
  - "'일단 Tool로' 안티패턴: 도구 선택 지연, 판단 모호, 토큰 비용, 재사용성 저하"
qa:
  - q: "MCP의 Tool, Resource, Prompt는 어떻게 구분하나?"
    a: "결정 주체가 다르다. Tool은 모델이 판단해서 호출하는 액션(Model-controlled)으로 읽기·쓰기 모두 가능하고, Resource는 URI로 식별되는 정적이거나 천천히 변하는 읽기 전용 데이터로 Client가 자유롭게 list·read한다(Application-controlled). Prompt는 사용자가 골라 쓰는 정적 템플릿(User-controlled)이다. 조회성이면 Resource, 능동적 실행이 필요하면 Tool, 사용자 호출 패턴을 위한 것이면 Prompt로 둔다."
  - q: "실습에서 기능 6개를 어떻게 분류했나?"
    a: "ICT 운영 지원 에이전트 기준으로 Jira 티켓 생성은 쓰기 Action이라 Tool, 운영 매뉴얼 검색·Jira 검색·모니터링 상태 조회는 검색어나 시점마다 결과가 달라 조회 전용 Tool로 뒀다. 장애 유형별 runbook은 내용이 고정이고 runbook://incident-response/db-down처럼 유형 이름만으로 주소가 정해져 Resource, 장애 진단 표준 절차는 사용자가 서비스명·증상만 넣어 쓰는 지시문 틀이라 Prompt다. Jira 검색과 생성은 자주 함께 쓰이지만 읽기와 쓰기의 위험도가 달라 단일 책임 원칙에 따라 분리했다."
  - q: "도구를 많이 만들면 어떤 문제가 생기나?"
    a: "의미가 비슷한 도구(search_docs, find_documents, query_manuals)가 여러 개거나 설명·입력 스키마가 모호하면 에이전트의 도구 선택이 느려지고 판단이 흐려지며 디버깅도 어려워진다. 도구 명세는 시스템 프롬프트에 들어가 토큰 비용도 늘어난다(OpenAI는 일정 길이 이상 자동 캐싱, Anthropic은 cache_control 명시 필요). 그래서 Resource나 Prompt로 뺄 수 있는 것은 빼고 쪼갤지 합칠지를 단일 책임 원칙으로 점검한다."
related: [mcp-connection-transport, integration-architecture, ai-agent/mcp-a2a-protocol, ai-agent/tool-calling-react]
source: "2026-10-21 · slides-agent-capstone.pdf p.5–11 (Callback, MCP Architecture Recap, MCP 구성 요소, Server 구성 요소, Anti-pattern, 의사결정 워크플로우, 함께 해봅시다), p.15–17 SUMMARY · submission-mcp.zip (Design Worksheet, Inspector 캡처 A–F)"
---

```compare
Resource | Tool | Prompt
역할 | File·API·DB 등 모델이 읽는 Data Context | 외부 시스템에 개입하는 액션 (함수 호출) | 작업을 쉽게 시작하는 프롬프트 템플릿
Actor | Application(Client)-controlled | Model-controlled | User-controlled
Type | Read-Only, URI로 식별, 정적이거나 천천히 변함 | Read 또는 Write (tool annotation), 시점마다 결과가 달라 URI로 표현 어려움 | 정적 템플릿
코드 | `@mcp.resource()` | `@mcp.tool()` | `@mcp.prompt()`
예시 | `runbook://incident-response/db-down` | `create_jira_ticket` | `incident_analysis_prompt`
```

```flow
Step 1 Function :: 필요한 기능을 분류 고민 없이 자연어로 모두 적기
Step 2 Capability :: Action 필요? → Tool / 사용자가 부르는 템플릿? → Prompt / 시점마다 결과가 다름? → 조회 Tool, 아니면 Resource
Step 3 Responsibility :: 한 Tool이 여러 책임? 쪼개기 / 늘 같이 호출? 합치기 / 이 서버 범위인가? 도메인 경계·호출 빈도로 판단
```

```python
# 구조 스케치 — Inspector 캡처에 보인 이름·인자·annotation 기준 (실제 제출 코드 아님)
mcp = FastMCP(name="ict-operations-support")

@mcp.tool(annotations={"readOnlyHint": True, "idempotentHint": True})
def get_monitoring_status(
    system_name: Annotated[str, Field(description="조회할 서비스 이름 (예: auth-service)")],
) -> SystemStatus:          # system_name, status, cpu_percent, memory_percent, alerts, last_checked
    """장애 신고나 이상 징후를 진단할 때, 해당 서비스의 현재 모니터링 상태를 조회한다."""

@mcp.tool(annotations={"readOnlyHint": False, "idempotentHint": False, "openWorldHint": True})
def create_jira_ticket(summary: str, description: str, priority: str = "Medium", service: str | None = None) -> JiraTicketCreated:
    """진단 결과 새 incident 기록이 필요하고 사용자가 확인했을 때 한 번만 호출한다. (재시도 시 중복 생성)"""

@mcp.resource("runbook://incident-response/{incident_type}")
def get_incident_runbook(incident_type: str) -> str: ...

@mcp.prompt()
def incident_analysis_prompt(service: str, symptom: str) -> str: ...

mcp.run()   # 기본 stdio transport
```

> [!tip] 설명은 "Z 상황에서 X를 한다"
> 도구 description은 "X를 한다"가 아니라 "언제 쓰는가"를 말해야 한다. 실습 서버도 "장애 신고나 이상 징후를 진단할 때 … 조회한다", "incident 유형을 아직 모르거나 여러 문서를 훑어봐야 할 때 사용한다"처럼 사용 상황을 앞에 썼다.
