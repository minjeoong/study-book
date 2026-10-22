---
title: Agent Streaming과 SSE
en: Server-Sent Events, Multi-Event Streaming
summary: "LangGraph 실행 이벤트를 token·tool_call·done 같은 타입 이벤트로 바꿔 SSE로 브라우저까지 흘려보내는 것"
importance: 3
order: 5
tags: [Streaming, SSE, FastAPI, Next.js]
keypoints:
  - "stream()은 프로세스 안 Source, Streaming은 경계를 넘는 전달"
  - "3가지 결정: Transport(SSE), Content(멀티 이벤트), Lifecycle"
  - "모든 이벤트에 type 필드 + 타입별 payload, done·error로 종료를 명시"
qa:
  - q: "AI 채팅 스트리밍에 왜 WebSocket보다 SSE를 많이 쓰나?"
    a: "SSE는 HTTP 위에서 동작해 기존 인프라와 자연스럽게 호환되고, AI 채팅은 요청 후 응답을 받는 패턴이라 서버에서 클라이언트로의 단방향이면 충분하다. event와 data 형식으로 token, tool_call, error 같은 여러 이벤트를 자연스럽게 구분할 수 있고 구현도 간단하다. 다만 단방향이라 스트림 중 사람이 끼어들기 어렵고, HTTP/1.1에서는 도메인당 연결 6개 제한과 일부 프록시·로드밸런서의 버퍼링 이슈가 있다."
  - q: "에이전트 스트리밍에서 토큰만 보내면 안 되는 이유는?"
    a: "도구 호출 중에는 토큰이 나오지 않아 사용자는 멈췄다고 느끼고, 일부 프록시는 idle 스트림을 끊는다. 그래서 token 외에 tool_call_start·tool_call_end, 상태 변화, 토큰 사용량 같은 메타데이터, 에러를 함께 보내는 Multi-Event Streaming으로 에이전트의 단계를 보여 준다. 30초 이상 걸리는 도구라면 tool_call_start 이벤트, ': keepalive' 주석 heartbeat, '검색 중… N초 경과' 같은 진행 이벤트로 연결을 유지한다."
  - q: "클라이언트가 중간에 끊기면 서버는 어떻게 해야 하나?"
    a: "선택지마다 트레이드오프가 있다. 끊김을 감지해 작업을 취소하면 리소스와 비용은 아끼지만 부분 응답이 사라져 재시도 시 처음부터 해야 한다. 끝까지 진행하면 사용자가 돌아왔을 때 이어 갈 수 있지만 보지 않을 답에도 비용을 쓴다. 부분 응답을 thread state에 저장한 뒤 취소하는 방법은 깔끔하지만 구현이 복잡하다."
related: [thread-checkpointer, integration-architecture, error-handling, ai-agent/multi-agent-patterns]
source: "2026-10-22 · slides-agent-capstone.pdf p.43–59 (Mockup, Callback, Stream vs Streaming, 3가지 차원, Transport, SSE 동작, Content, Event Schema, Lifecycle, Keep-alive·Disconnect·Backpressure, Frontend 비교, Next.js, Vercel AI SDK), p.60–62 SUMMARY, p.63–68 (Streaming·Multi-Agent Streaming Hands-On) · submission-streaming.zip, submission-multiagent.zip"
---

```flow
agent.astream :: stream_mode = messages · updates (LangGraph, 프로세스 내부)
event_converter.py :: 복잡한 내부 기록 중 화면에 필요한 것만 — token, tool_call_start/end(결과 200자), done
sse_formatter.py :: 표준 SSE 형식으로 포장 → POST /chat/stream 응답
transport.ts :: SSE를 열어 아이템을 꺼냄, thread.ts가 localStorage thread_id 관리
components :: ToolCallView(도구 사용 중 → 도구 완료), ChatMessage에 토큰 이어 붙이기
```

| Transport | 방향 | 특징 | 주요 용도 |
| --- | --- | --- | --- |
| HTTP Streaming (chunked) | 단방향 | 가장 단순, 이벤트 구조화 약함 | 단순 응답 스트리밍 |
| SSE | 단방향 | HTTP 위, Event-based 구조 | AI Chat, Notification |
| WebSocket | 양방향 | Stateful 연결, 프록시·LB 호환성 주의 | 실시간 협업, 게임 |
| gRPC streaming | 양방향 가능 | HTTP/2, Protocol Buffers, 브라우저는 gRPC-Web 필요 | Microservices 간 통신 |

```json
{"type": "token", "content": "안녕하세요"}
{"type": "tool_call_start", "tool_name": "search_manual", "args": {}}
{"type": "tool_call_end", "tool_name": "search_manual", "results": {}}
{"type": "done", "finish_reason": "stop"}
{"type": "error", "code": "timeout", "message": "..."}
```

- 나쁜 예는 `{"data": "안녕하세요"}`처럼 타입 구분이 없는 것. 좋은 Event Schema = type 필드 명확, type별 payload 구조화, Pydantic·TypeScript로 Type-Safe, 새 type이 추가돼도 기존 Client가 안 깨지는 Forward-Compatible
- Multi-Agent Streaming(`/chat/supervisor/stream`): `plan_created`·`task_list_created` → task마다 `task_started` → `sub_agent_token` → `task_completed` → 최종 token·done. 화면은 Plan 카드 → Task 목록(대기·진행 중·완료) → 최종 응답
- Frontend: Streamlit은 PoC·Demo, React는 UI 자유도, Next.js는 풀스택 + Vercel AI SDK(`useChat`, SSE 기반 표준 stream protocol, tool parts, Provider 추상화)

> [!note] 실습 관찰
> Tool 박스가 답변 글자보다 먼저 "도구 사용 중"으로 뜨고, 완료 후 토큰이 점진적으로 나타남. 후속 질문("그 절차의 첫 단계")은 같은 thread 기록만으로 답해 Tool 호출이 없었음. Backend를 kill하면 `[에러 발생: network error]`만 뜨고 재시도는 없음(`ERR_INCOMPLETE_CHUNKED_ENCODING`).
