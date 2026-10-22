---
title: "에이전트 단기 메모리와 장기 메모리"
en: "Short-term Memory (Checkpointer), Long-term Memory (Store)"
summary: "한 스레드 안의 맥락은 checkpointer와 thread_id로, 세션을 넘는 사용자 정보는 Store에 저장해 주입"
importance: 3
order: 10
tags:
  - Agent
  - Memory
  - LangChain
keypoints:
  - "단기: InMemorySaver checkpointer가 thread_id별 State(messages)를 저장·복원"
  - "같은 thread_id면 대화가 이어지고, 다른 thread_id면 처음 보는 사용자"
  - "장기: Store에 namespace(user::app) + id 키로 Document 저장, 미들웨어·도구로 조회해 주입"
qa:
  - q: "단기 메모리와 장기 메모리의 차이는?"
    a: "단기 메모리는 하나의 채팅방, 즉 스레드 안에서만 이어지는 대화 기록으로, checkpointer가 thread_id별로 State를 저장하고 다시 꺼내 온다. 장기 메모리는 직업, 선호 말투, 알레르기처럼 어느 채팅방에서든 유지돼야 하는 정보로, 별도 Store에 사용자와 앱 단위 namespace로 저장한다. ChatGPT 개인 맞춤 설정에 직업을 적어 두면 새 채팅에서도 반영되는 것이 장기 메모리의 예다."
  - q: "장기 메모리를 에이전트에 어떻게 반영했나?"
    a: "두 방식을 실습했다. 첫째는 Store에 미리 저장한 사용자 정보를 wrap_model_call 미들웨어에서 runtime.context의 user_id로 조회해 system prompt에 주입하는 방식이다. 둘째는 save_user_info, get_user_info 도구를 만들어 모델이 대화에서 사용자 정보를 인지하면 uuid 키로 저장하고, 질문받으면 도구로 꺼내 답하게 하는 방식이다."
related:
  - create-agent
  - middleware
  - llm-api-basics
  - prompt-context/context-engineering
source: "Day1(9/9) 슬라이드 p.119–121, Day2(9/10) 슬라이드 p.159–169, 실습 [4] 2장, 실습 [5] 4장"
---

```compare
단기 메모리 | 장기 메모리
범위 | 한 스레드(채팅방) 안 | 세션을 넘어 영구
저장소 | checkpointer (InMemorySaver) | Store (InMemoryStore, 운영은 DB 기반)
키 | thread_id | namespace(user_id::app) + id
내용 | 대화 State(messages, 도구 결과) | 이름, 선호, 생활 습관 등 Document
주입 방식 | 같은 thread_id로 invoke하면 자동 | wrap_model_call로 system prompt에 주입 또는 조회 도구
```

```python
agent = create_agent(model, tools, checkpointer=InMemorySaver())

cfg = {"configurable": {"thread_id": "thread_1"}}
agent.invoke({"messages": [{"role": "user", "content": "안녕하세요. 저는 Jumany입니다."}]}, cfg)
agent.invoke({"messages": [{"role": "user", "content": "제 이름이 뭐죠?"}]}, cfg)        # → Jumany
agent.invoke({"messages": [{"role": "user", "content": "제 이름이 뭐죠?"}]},
             {"configurable": {"thread_id": "thread_2"}})                                # → 모름
```

> [!warn] 메모리가 길어지면
> 단기 메모리는 대화가 길수록 매 호출 토큰이 늘어남. `SummarizationMiddleware(trigger=("messages", 5), keep=("messages", 3))`로 오래된 대화를 요약하고 최근 메시지만 원문 유지 (checkpointer 필수).
