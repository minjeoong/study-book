---
title: MCP와 A2A
en: Model Context Protocol, Agent2Agent Protocol
summary: "MCP는 에이전트와 외부 도구·데이터를, A2A는 에이전트와 에이전트를 잇는 개방형 표준 프로토콜"
importance: 3
order: 5
tags: [MCP, A2A, Agent Protocol]
keypoints:
  - "MCP는 AI의 USB-C — Host·Client·Server 구조, Client와 Server는 1:1"
  - "Server가 주는 3요소: Resources(데이터), Tools(액션), Prompts(템플릿)"
  - "A2A는 MCP의 대체가 아닌 보완 — Agent Card로 역량 광고, Task 상태로 협업"
qa:
  - q: "MCP의 Host, Client, Server 역할은?"
    a: "Host는 사용자와 직접 상호작용하는 애플리케이션으로 LLM과 통합해 전체 데이터 흐름을 조율하고 여러 서버의 응답을 모아 모델에 전달하는 팀장 역할이다. Client는 Host 내부에서 동작하며 MCP Server와 1:1로 연결되어 세션 관리, 프로토콜 협상, 기능 교환, 메시지 라우팅을 맡는다. Server는 부서처럼 특정 업무를 맡아 Resources, Tools, Prompts를 노출하고 로컬 파일·DB나 원격 API와 연결한다."
  - q: "Native Tool Calling과 MCP는 언제 각각 쓰나?"
    a: "Native Tool Calling은 도구 코드를 에이전트 안에 직접 구현하는 강한 결합이라 실행 과정과 에러 처리를 코드 수준에서 세밀하게 통제하고 통신 오버헤드가 없다. 그래서 보안 로직이 중요한 사내 DB/API 연동 같은 목적형 에이전트에 맞다. MCP는 서버가 도구 목록을 동적으로 제공하는 느슨한 결합이라 코드 수정 없이 서버 연결만으로 도구를 늘리고 여러 에이전트가 같은 서버를 재사용할 수 있어 SaaS·로컬 파일 등 외부 생태계 통합이 잦은 범용 에이전트에 맞다."
  - q: "MCP와 A2A의 관계는?"
    a: "MCP는 에이전트가 외부 도구·데이터와 연결되는 통로이고, A2A는 서로 다른 플랫폼·벤더의 에이전트끼리 협업하는 Machine-to-Machine 통신 프로토콜로 둘은 상호 보완한다. A2A에서 에이전트는 JSON Agent Card로 역량과 인터페이스를 광고하고, 작업은 Submitted, Working, Input_Required 같은 Task 상태로 관리하며, HTTP 위에서 JSON-RPC 2.0, gRPC, HTTP+REST 바인딩과 SSE 스트리밍을 쓴다. 내부 프롬프트나 상태를 노출하지 않는 블랙박스 연결이라는 점도 특징이다."
related: [tool-calling-react, multi-agent-patterns, agent-capstone-mcp/mcp-server-design, agent-capstone-mcp/mcp-connection-transport, prompt-context/context-engineering]
source: "2026-10-06 · slides-ai-agent.pdf p.30–38 (Agent Protocol, MCP 목적·Architecture·Host-Client-Server·Sequence Diagram·필요성·LLM vs MCP·Tool Calling vs MCP), p.39–43 (A2A 개요·기능·고려사항·Adoption·필요성), p.49–53 SUMMARY"
---

```layers
MCP Host :: 사용자와 만나는 앱(에이전트) — LLM 통합, 여러 서버 응답을 취합·정제해 모델에 전달
MCP Client :: Host 안에서 서버마다 1:1 연결 — 세션 관리, 프로토콜 협상, 기능 교환, 메시지 라우팅
MCP Server :: 특정 업무 담당 — Resources(File·DB 등 읽는 데이터), Tools(실행 액션), Prompts(작업 템플릿)
```

```compare
Native Tool Calling | MCP
결합도 | 강한 결합 — 에이전트 앱 안에 도구 코드 직접 구현 | 느슨한 결합 — Client(Agent)와 Server(Tools)를 프로토콜로 분리
도구 정의 | 개발자가 스키마를 명시, LLM 프롬프트에 직접 반영 | Server가 도구 목록을 동적으로 제공, 에이전트가 탐색
장점 | 세밀한 제어, Low Latency(통신 오버헤드 없음) | 코드 수정 없이 확장, 하나의 서버를 여러 에이전트가 재사용
Best For | 목적형 에이전트, 보안 로직이 중요한 사내 DB/API | 범용 에이전트, SaaS·로컬 파일 등 외부 생태계 통합
```

- MCP 필요성 4가지: 연결 파편화 해소(서비스마다 커넥터 개발 → 표준 1개로 Plug & Play), 로직 분리(하드코딩 → 독립 서버), 표준 규격 통합, 보안·권한 제어(모델에 인프라 권한을 주지 않고 Server가 통제)
- 동작 예: "내 PC의 매출 PDF를 읽고 관련 뉴스를 검색해 요약" → 연결된 서버의 Capability 확인 → [Resource] 로컬 파일 읽기 → [Tool] `search_web` 호출 → Host가 종합해 답변
- 타임라인: 2024.11 Anthropic 공개(Python/TS SDK) → 2025 H1 다언어 SDK·커뮤니티 서버 → 2025 H2 Cursor·VS Code, LangChain·LlamaIndex 네이티브 통합

> [!warn] A2A의 "경계 넘기" 비용
> A2A는 프로세스·조직·벤더 경계를 넘기 때문에 Agent Card 스키마 공백(형식만 호환), 지속 연결·타임아웃·웹훅 인증 같은 운영 부담, Retry·Circuit Breaker는 클라이언트 몫, 하위 에이전트에 큰 토큰을 그대로 넘기면 권한이 커지는 문제(Delegation Downscoping)가 남는다. 전체 추적은 W3C Trace Context + OpenTelemetry 전제.
