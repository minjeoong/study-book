---
title: LangChain 1.0 create_agent와 Middleware
en: create_agent, Middleware, Human-in-the-Loop
summary: "표준 에이전트 루프(create_agent) 실행 경계에 Hook을 끼워 정책·컨텍스트·운영 통제를 주입하는 구조"
importance: 2
order: 9
tags: [LangChain, Middleware, HITL, Guardrail]
keypoints:
  - "0.x는 사고 구조·운영 정책이 섞임 → 1.0은 Agent와 통제 계층 분리"
  - "Node-style 훅은 State 갱신, Wrap-style 훅은 호출 자체를 감쌈"
  - "HITL = interrupt + checkpointer + thread_id"
qa:
  - q: "LangChain 1.0에서 무엇이 바뀌었나?"
    a: "2025년 10월 GA로, 기존 AgentExecutor 대신 LangGraph 런타임 위에서 도는 create_agent가 표준 상위 API가 됐다. 에이전트 루프 각 단계 전후에 개입하는 미들웨어 시스템이 들어와 HITL, Summarization, PII 마스킹을 기본 제공한다. 구조화 출력이 메인 루프에 통합돼 별도 LLM 호출이 없어졌고, 레거시는 langchain-classic으로 옮겨졌으며, 모델별 반환 형식은 content_blocks로 표준화됐다."
  - q: "미들웨어는 왜 필요하고 어떤 종류가 있나?"
    a: "0.x에서는 비용·토큰 제한, 정책에 맞지 않는 도구 호출 차단, 트레이싱·감사 같은 운영 로직이 체인 안에 섞여 설계가 복잡하고 재사용성이 떨어졌다. 미들웨어는 이런 정책을 에이전트 실행 경계에서 주입한다. Node-style 훅(before_agent, before_model, after_model, after_agent, dynamic_prompt)은 정해진 지점에서 State를 보고 갱신하고, Wrap-style 훅(wrap_model_call, wrap_tool_call)은 모델·도구 호출 자체를 감싸 재시도, 폴백, 캐싱, 특정 도구 차단을 한다."
  - q: "Human-in-the-Loop는 어떻게 구현하나?"
    a: "HumanInTheLoopMiddleware의 interrupt_on에 메일 발송·DB 삭제처럼 위험한 도구는 True, 검색 같은 안전한 도구는 False로 지정한다. 해당 도구 호출 직전에 실행이 멈추고, 사람이 APPROVE·EDIT·REJECT 중 하나를 고르면 Command(resume=...)로 같은 thread_id에서 재개한다. 멈췄다 이어가려면 실행 상태 저장이 전제라 checkpointer와 thread_id가 필수다."
related: [tool-calling-react, langgraph-state-graph, agent-eval-harness, agent-capstone-mcp/thread-checkpointer]
source: "2026-10-07 · slides-ai-agent.pdf p.102–107 (LangChain 0.x 한계, LangChain 1.0, LangGraph, LangChain vs LangGraph, Architecture, Middleware), p.108–116 (@before_agent, Pseudo Code, Prebuilt Middleware, HITL, Custom Middleware), p.139 SUMMARY"
---

```layers
Application Layer :: API Endpoint, Service Orchestration, User session 관리
Reasoning Layer (Agent) :: create_agent 표준 루프 — 필요하면 Node+Edge, Explicit State로 직접 조립
Middleware (Runtime Governance) :: Governance(정책 검증·PII·tool access), Observability, Operational(retry·timeout·cost), Transformation
LLM / Tool Invocation :: 실제 모델·도구 호출
Infrastructure Layer :: LLM Provider, Tool Runtime
```

| 구분 | Hook·Middleware | 시점·용도 |
| --- | --- | --- |
| Node-style | `@before_agent` / `@after_agent` | 시작 전·완료 후 1회 — 메모리 로드, 입력 검증(금지어 차단 후 `jump_to: "end"`) / 결과 저장·알림 |
| Node-style | `@before_model` / `@after_model` | 매 모델 호출 직전·직후 — PII 마스킹, 로깅 / 응답 검증, 가드레일, 출력 변환 |
| Wrap-style | `@wrap_model_call` / `@wrap_tool_call` | 호출 전체를 감쌈 — 캐싱, 재시도, 폴백, 도구 변경 / 컨텍스트 주입, 특정 도구 차단 |
| Prebuilt | Summarization, PII, HumanInTheLoop | 히스토리 자동 요약, 민감정보 Block·Redact·Mask·Hash, 위험 도구 전 승인 |
| Prebuilt | ModelCallLimit, ToolCallLimit, ModelFallback, ModelRetry, ToolRetry | 비용 상한, 대체 모델 폴백, 실패 재시도 |

```python
@wrap_model_call
def retry_model(request: ModelRequest, handler) -> ModelResponse:
    for attempt in range(3):            # 모델 호출을 감싸 최대 3회 재시도
        try:
            return handler(request)
        except Exception:
            if attempt == 2:
                raise

agent = create_agent(
    model=model,
    tools=[get_weather],
    middleware=[log_before_agent, log_before_model, validate_output,   # 단일 훅은 데코레이터,
                retry_model, personalized_prompt, log_after_agent],    # 여러 훅이면 클래스 기반
)
```

> [!tip] 면접 팁
> "Reasoning → [Middleware] → LLM": 호출 흐름(`agent.invoke`)은 그대로 두고 운영 정책만 경계에 끼운다는 점이 핵심. HITL 결정은 APPROVE(진행), EDIT(State 수정 후 재개), REJECT(Rollback 또는 END) 세 갈래.
