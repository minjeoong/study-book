---
title: 에러 처리와 Graceful Degradation
en: Error Responsibility, Retry Policy, Graceful Degradation
summary: "에러를 종류별로 나눠 계층마다 책임을 정하고, 일부가 실패해도 남은 기능으로 최대 가치를 주는 설계"
importance: 2
order: 7
tags: [Error Handling, Retry, 운영]
keypoints:
  - "분류 3축: 일시/영구, 복구 가능/불가, 사용자/시스템"
  - "하위는 무엇이 잘못됐는지 명확히 전달, 상위는 맥락에서 판단, Frontend는 표현 책임"
  - "Retry는 Transient만, 상한·점진적 대기, Action Tool 중복과 계층별 곱셈 주의"
qa:
  - q: "Retry 정책은 어떻게 설계하나?"
    a: "Network timeout, Rate limit, 503 같은 일시적(Transient) 에러만 재시도하고 인증 실패·404·잘못된 요청 같은 영구 에러는 바로 실패 처리한다. 횟수 상한을 명시하고 대기 시간을 0.5초에서 1.5초처럼 점점 늘려 외부 시스템이 회복할 시간을 주고 요청 쏠림을 막으며, 끝내 실패하면 표준 에러로 바꿔 상위 계층에 넘긴다. create_jira_ticket 같은 Action 도구를 재시도하면 티켓이 중복 생성될 수 있고, Data 계층 3회와 Tool 계층 3회가 겹치면 최대 9회가 되므로 재시도 위치를 정해야 한다."
  - q: "Graceful Degradation이란?"
    a: "시스템 일부가 실패해도 남은 부분으로 사용자에게 최대한의 가치를 전달하는 설계 패턴이다. 동작하거나 안 하거나의 이분법 대신 정상, 부분 동작, 제한된 동작, 동작 불가 같은 여러 상태를 두고 각 상태에 맞는 경험을 준다. 예를 들어 웹 검색 도구가 실패해도 내부 RAG 도구로 정보를 모아 부분 응답을 주고, 실패한 부분은 에러 내역으로 표시한다."
related: [integration-architecture, observability-eval, cost-latency, sse-streaming, ai-agent/agent-eval-harness]
source: "2026-10-23(예정) · slides-agent-capstone.pdf p.29 (에러 처리 위치 4A–4C), p.76–79 (Error 분류, Error Responsibility, Retry 정책, Graceful Degradation), p.91 SUMMARY, p.97–99 (Error Handling Hands-On) · submission-fastapi.zip E1–E2, submission-streaming.zip E2"
---

| 축 | 종류 | 예시 | 대응 |
| --- | --- | --- | --- |
| Error Solving | Transient | Network timeout, Rate limit, 503 | 재시도로 해결 |
| Error Solving | Permanent | Auth Failure, 404, Invalid Request | 재시도 무의미, 바로 실패 |
| Recovery | Recoverable | 웹 검색 실패 → 내부 RAG로 수집 | 대안(fallback)으로 부분 동작 |
| Recovery | Non-recoverable | LLM Provider 다운, 인증 실패 | 사용자에게 통보 |
| User vs System | User Error | 잘못된 입력 | 명확히 안내해 재입력 유도 |
| User vs System | System Error | 내부 문제 | 간단히 안내, 로그는 상세히 |

```layers
Presentation (Frontend) :: 사용자에게 명확하게 전달, Retry UX, Disconnection 처리 — ErrorBanner
Application (Backend) :: HTTP 응답 형식화, 스트림 중간 에러를 ErrorEvent로
Orchestration (Agent) :: Sub-agent·Tool 실패 시 fallback 결정, Partial result를 줄 가치 판단
Tool (MCP Server) :: Connection 복구·Timeout, Tool 단위 실패 내용을 위로 (ToolError 변환)
Data :: 외부 통신 에러 시 1차 Retry, 자체 해결 불가면 Error Type을 위로
```

- Hands-On 구조: `backend/error_handling/retry.py`·`classification.py`, `mcp_client.py`가 실패를 ToolError로 변환, Supervisor 그래프가 Task 실패 시 Retry 또는 부분 응답, 스트림에는 `ErrorEvent`, Frontend는 `task_completed`의 성공·실패와 `ErrorBanner` 표시

> [!note] 실습에서 본 "에러 처리 없음"의 모습
> `chmod 000 mcp-server/server.py` 후 검색 요청 → 서버 로그 `McpError: Connection closed`, 사용자는 원인 없는 HTTP 500만 받음. 반면 도구가 필요 없는 질문은 에이전트가 되물어 장애가 드러나지 않았음. 미등록 시스템 조회는 Tool이 `status: unknown`과 조회 가능 목록을 돌려줘 정상 응답 — 도구 수준의 graceful 처리 예.
