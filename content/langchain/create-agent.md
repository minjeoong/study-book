---
title: "create_agent 기본 에이전트"
en: "Basic Agent with create_agent"
summary: "모델과 도구 목록만 넘기면 model → tools → model 루프를 돌며 스스로 도구를 호출하는 LangChain v1 에이전트"
importance: 3
order: 9
tags:
  - Agent
  - LangChain
  - Tool
keypoints:
  - "모델 판단 → tool_calls → 도구 실행 → ToolMessage 관찰을 답이 나올 때까지 반복"
  - "도구 없는 에이전트는 '현재 한국 날씨'에 답하지 못하고, 도구를 주면 스스로 호출"
  - "system_prompt로 '사칙연산은 무조건 도구 호출' 같은 행동 규칙을 부여"
qa:
  - q: "create_agent 에이전트가 질문 하나를 처리하는 흐름은?"
    a: "질문이 HumanMessage로 들어오면 모델이 직접 답할지 도구가 필요한지 판단한다. 도구가 필요하면 tool_calls가 담긴 AIMessage를 내고, 런타임이 도구를 실행해 결과를 ToolMessage로 돌려준다. 모델은 이 관찰 결과를 보고 도구를 더 쓸지 최종 답을 낼지 다시 정하고, tool_calls 없는 최종 AIMessage가 나오면 종료한다."
  - q: "에이전트가 계산 도구를 쥐고도 암산해 버린다면?"
    a: "모델은 쉬운 계산을 내부 지식으로 처리하려는 경향이 있어 도구가 있어도 부르지 않을 수 있다. 실습에서 system_prompt에 '사칙연산할 때 무조건 도구를 호출하세요'를 넣자 '42 + 3 * 23'을 multiply(3, 23)로 69를 얻고 add(42, 69)로 111을 내는 순서로 도구를 썼다. 도구 docstring을 명확히 쓰고, response['messages']를 순회해 실제 호출 이력을 확인한다."
related:
  - tool-calling
  - ai-agent-react
  - agent-memory
  - middleware
  - structured-output
source: "Day1(9/9) 슬라이드 p.104–118, 실습 [4] Basic Agent 1장 (날씨·사칙연산·알라딘·챗봇)"
---

```flow
Request :: 사용자 질문 (HumanMessage)
Model :: 요청 해석, 도구 필요 여부 판단
Action :: 도구 호출 명령 (AIMessage.tool_calls)
Tools :: 날씨 API·계산기 등 실제 실행
Observation :: 결과를 모델에 전달 (ToolMessage), 필요하면 다시 Model로
Result :: 결과를 종합한 최종 답변 (AIMessage)
```

```python
from langchain.agents import create_agent

agent = create_agent(
    model,
    tools=[add, substract, multiply, divide],
    system_prompt="당신은 사칙연산할 때 무조건 도구를 호출하세요",
)
result = agent.invoke({"messages": [{"role": "user", "content": "42 + 3 * 23은 뭔가요?"}]})

for msg in result["messages"]:            # human → ai(tool_calls) → tool → ai(tool_calls) → tool → ai
    print(msg.type, msg.content)
```

> [!tip] 개발 단계에서 쓰는 LLMToolEmulator
> 이메일 API처럼 아직 없거나 호출이 비싼 도구는 `LLMToolEmulator` 미들웨어로 LLM이 그럴듯한 가짜 결과를 만들게 해 전체 흐름을 먼저 검증함. 실서비스에서는 반드시 제거.
