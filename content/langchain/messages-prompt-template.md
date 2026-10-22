---
title: "Message와 Prompt Template"
en: "Messages, PromptTemplate, ChatPromptTemplate, MessagesPlaceholder"
summary: "대화의 기본 단위인 메시지 객체(System·Human·AI·Tool)와, 변수 자리를 비워 둔 재사용 프롬프트 템플릿"
importance: 2
order: 5
tags:
  - LangChain
  - Prompt
  - Message
keypoints:
  - "SystemMessage 역할·규칙, HumanMessage 질문, AIMessage 답변, ToolMessage 도구 결과"
  - "딕셔너리보다 메시지 객체 권장 — 벤더 구조 혼선 방지, 타입 체크, 멀티모달 확장"
  - "문자열은 PromptTemplate, 대화는 ChatPromptTemplate, 기록 주입은 MessagesPlaceholder"
qa:
  - q: "PromptTemplate과 ChatPromptTemplate의 차이는?"
    a: "PromptTemplate은 '{country}의 수도는 어디인가요?'처럼 변수가 있는 하나의 문자열 템플릿이다. ChatPromptTemplate은 (role, message) 튜플 리스트로 system, human, ai 메시지를 순서대로 구성하는 대화형 템플릿이라 Chat Model 입력 형식에 맞는다. 둘 다 체인의 invoke에 넘긴 딕셔너리 키로 변수가 치환되므로 키 이름이 템플릿 변수와 같아야 한다."
  - q: "MessagesPlaceholder는 언제 쓰나?"
    a: "이전 대화 기록처럼 개수가 정해지지 않은 메시지 리스트를 프롬프트의 특정 위치에 통째로 넣을 때 쓴다. 일반 {input} 변수에는 문자열만 들어가지만 MessagesPlaceholder(variable_name='chat_history')에는 HumanMessage, AIMessage 객체 리스트를 넣을 수 있다. 보통 system 메시지와 이번 질문 사이에 둬서 멀티턴 맥락을 유지한다."
related:
  - langchain-chat-model
  - lcel-runnable
  - prompt-context/few-shot
  - prompt-context/rice-framework
source: "Day1(9/9) 슬라이드 p.68–76, 실습 [3] 2–3장, 실습 데이터 capital.yaml·fruit_color.yaml"
---

```layers
SystemMessage :: 역할과 규칙 ("당신은 가상 RPG 게임의 친절한 안내원입니다")
MessagesPlaceholder("chat_history") :: 이전 Human·AI 메시지 리스트가 통째로 들어갈 자리
HumanMessage("{input}") :: 이번 턴의 사용자 질문
AIMessage :: 모델이 생성할 답변 (도구를 쓰면 ToolMessage가 사이에 끼어듦)
```

| 만드는 방법 | 형태 | 쓰임 |
| --- | --- | --- |
| `PromptTemplate.from_template(t)` | 문자열 템플릿, 변수 자동 추출 | 단일 지시문 |
| `PromptTemplate(template=t, input_variables=[...])` | 변수 명시 | 변수 검증이 필요할 때 |
| `load_prompt("capital.yaml")` | 파일에 저장된 템플릿 | 코드와 프롬프트 분리·재사용 |
| `ChatPromptTemplate.from_messages([...])` | (role, message) 튜플 리스트 | Chat Model 대화 입력 |

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 가상 RPG 게임의 친절한 안내원 '모험가 가이드'입니다."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
])
chain = prompt | model
chain.invoke({
    "chat_history": [HumanMessage("내 캐릭터 이름은 '용사키우기'야."),
                     AIMessage("반갑습니다, '용사키우기'님!")],
    "input": "내 이름을 기억하고 있니?",
})
```

> [!tip] 왜 딕셔너리 대신 메시지 객체인가
> `{"role": "huamn"}` 같은 오타는 실행 전까지 못 잡지만 객체는 IDE 자동완성·타입 체크가 됨. Gemini의 parts 구조, Anthropic의 구조 차이도 표준 래퍼가 흡수하고, 이미지·도구 결과 같은 멀티모달 메타데이터도 객체 단위로 다룸.
