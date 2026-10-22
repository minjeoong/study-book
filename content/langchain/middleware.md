---
title: "Runtime·State와 Middleware"
en: "Agent Runtime, State, Middleware (Node-style, Wrap-style)"
summary: "에이전트 실행 전후와 모델·도구 호출 지점에 끼어들어 흐름을 제어·변형·검증하는 훅"
importance: 3
order: 11
tags:
  - Agent
  - Middleware
  - Context Engineering
keypoints:
  - "Runtime은 실행 중 안 변하는 환경(context·store), State는 쌓이는 messages"
  - "Node-style은 지점별 확인·차단, Wrap-style은 호출을 감싸 프롬프트·모델 변형"
  - "Built-in: 도구 에뮬레이터, TodoList, HITL, PII 탐지, 대화 요약"
qa:
  - q: "Node-style과 Wrap-style 미들웨어의 차이는?"
    a: "Node-style은 before_agent, before_model, after_model, after_agent처럼 정해진 지점에서 순서대로 실행되고 state와 runtime을 받아 상태 확인, 로깅, 입력 검증에 쓴다. 조건에 걸리면 jump_to='end'로 모델 호출 전에 흐름을 끊을 수 있다. Wrap-style은 wrap_model_call, wrap_tool_call로 호출 자체를 감싸 request와 handler를 받기 때문에, request.override로 시스템 프롬프트를 동적으로 넣거나 질문 길이에 따라 모델을 바꾸는 등 흐름을 변형할 수 있다."
  - q: "Human-in-the-loop 미들웨어는 언제, 어떻게 쓰나?"
    a: "이메일 발송이나 결제 승인처럼 되돌리기 어려운 행동을 에이전트가 마음대로 하지 못하게 사람 승인을 거치게 할 때 쓴다. interrupt_on에 도구별로 allowed_decisions(approve, edit, reject)를 지정하고, 읽기처럼 안전한 도구는 False로 자동 승인한다. 실행을 멈췄다가 같은 thread_id로 재개해야 하므로 반드시 checkpointer와 함께 쓴다."
  - q: "Runtime의 context와 State는 어떻게 구분하나?"
    a: "context는 한 번 실행되는 동안 바뀌지 않는 사용자 신분증 같은 정보로 user_id, 권한, 앱 설정이 들어가며 dataclass로 context_schema를 정의해 invoke 때 넘긴다. State는 대화가 진행되며 계속 쌓이는 단기 메모리로, 사용자 메시지, AI 답변, 도구 결과가 messages에 기록된다. 권한처럼 모델이 바꾸면 안 되는 값은 context에 두어 보안과 통제를 지킨다."
related:
  - guardrails
  - agent-memory
  - create-agent
  - prompt-context/context-engineering
source: "Day2(9/10) 슬라이드 p.128–150, 실습 [5] Advanced Agent 1–2장"
---

```flow
before_agent :: 에이전트 시작 전 1회, 입력 검증·차단 (jump_to end)
before_model :: 모델 호출 직전, 상태 로깅·요약
wrap_model_call :: 모델 호출을 감쌈, 프롬프트 주입·모델 교체
after_model :: 모델 응답 직후, 출력 검사
wrap_tool_call :: 도구 호출을 감쌈, 인자 검증·재시도·에뮬레이션
after_agent :: 최종 결과 직전, 출력 가드레일
```

| Built-in 미들웨어 | 역할 | 메모 |
| --- | --- | --- |
| LLMToolEmulator | 도구 응답을 LLM이 흉내 | 미완성·고비용 API의 프로토타이핑, 특정 도구만 지정 가능 |
| TodoListMiddleware | 복잡한 요청을 할 일 목록으로 계획·추적 | write_todos 도구로 pending → in_progress → completed |
| HumanInTheLoopMiddleware | 위험한 도구 호출 전 사람 승인 | approve·edit·reject, checkpointer 필수 |
| PIIMiddleware | 개인정보 탐지 | email·credit_card·ip 등 + 정규식 커스텀, block·redact·mask·hash |
| SummarizationMiddleware | 긴 대화 자동 요약 | trigger·keep·trim_tokens_to_summarize, checkpointer 필수 |

```python
@wrap_model_call
def dynamic_model_selector(request, handler):
    msg_len = len(request.messages[-1].content)
    name = "gpt-5-nano" if msg_len < 10 else "gpt-5-mini" if msg_len < 30 else "gpt-5"
    return handler(request.override(model=init_chat_model(model=name)))   # 비용 최적화 라우팅

agent = create_agent(model="gpt-5-mini", tools=[], middleware=[dynamic_model_selector])
```

> [!tip] Advanced Agent = 컨텍스트 엔지니어링의 구현
> "Context Window에 어떤 정보를, 언제, 얼마나 넣고 뺄 것인가"를 미들웨어로 구현함. 필요한 기억만 주입(wrap_model_call), 위험한 정보는 차단(PII·가드레일), 작업에 맞는 모델로 분배(동적 모델 선택).
