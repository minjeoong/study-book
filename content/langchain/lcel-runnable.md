---
title: "LCEL과 Runnable"
en: "LangChain Expression Language, Runnable"
summary: "파이프(|) 연산자로 프롬프트·모델·파서를 잇는 선언형 체인 문법과, 병렬·통과·함수·분기를 담당하는 Runnable 부품"
importance: 3
order: 7
tags:
  - LangChain
  - LCEL
  - Runnable
keypoints:
  - "chain = prompt | model | parser — 앞 컴포넌트의 출력이 다음 입력 (유닉스 파이프)"
  - "모든 체인이 invoke·stream·batch와 비동기 ainvoke·astream·abatch를 공통 지원"
  - "Runnable 4종: Parallel 병렬, Passthrough 통과, Lambda 함수, Branch 분기"
qa:
  - q: "LCEL이란? 장점은?"
    a: "LangChain Expression Language로, 프롬프트 | 모델 | 출력 파서처럼 파이프 연산자로 컴포넌트를 잇는 선언형 문법이다. 모든 구성 요소가 Runnable이라 같은 invoke, stream, batch 인터페이스를 가지므로 어떤 체인이든 동기, 비동기, 스트리밍, 배치로 바로 실행할 수 있다. 코드가 데이터 흐름 순서대로 읽혀 복잡한 LLM 워크플로우를 파악하고 부품을 재사용하기 쉽다."
  - q: "RAG 체인에서 RunnablePassthrough와 RunnableParallel은 어떻게 쓰이나?"
    a: "RAG 체인은 {'context': retriever | format_docs, 'question': RunnablePassthrough()} | prompt | llm 형태다. 맨 앞 딕셔너리가 RunnableParallel로 해석돼 같은 질문 문자열을 retriever와 Passthrough에 동시에 보내고, 결과를 context와 question 키로 묶어 프롬프트 변수에 맞춰 준다. Passthrough는 입력을 그대로 넘기고, .assign()을 쓰면 기존 입력을 유지한 채 새 키를 덧붙일 수 있다."
related:
  - langchain-chat-model
  - messages-prompt-template
  - structured-output
  - rag-pipeline/rag-pipeline-process
source: "Day1(9/9) 슬라이드 p.82–99, 실습 [3] 5장 (5-1~5-5)"
---

```flow
dict 입력 :: {"topic": "인공지능 모델의 학습 원리"}
PromptTemplate :: 변수를 채워 프롬프트 생성
ChatModel :: AIMessage 생성
StrOutputParser :: AIMessage에서 문자열만 추출
```

| Runnable | 하는 일 | 실습 예 |
| --- | --- | --- |
| RunnableParallel | 같은 입력을 여러 체인에 동시에 보내고 결과를 dict로 병합 | 수도 체인 + 면적 체인 → {capital, area} |
| RunnablePassthrough | 입력을 그대로 다음 단계로, `.assign()`으로 키 추가 | `{"num": 1}` → passed, extra(mult=3) |
| RunnableLambda | 사용자 정의 함수를 체인 부품으로 | 긍정·부정 답변을 합쳐 교정 프롬프트에 넣기 |
| RunnableBranch | 조건에 따라 다른 체인 실행 (if-else 라우팅) | 질문 분류 결과가 수학·과학·기타면 각각 다른 체인 |

```python
# 1) 분류 체인으로 topic을 만들고, 2) 원 질문은 그대로 통과시킨 뒤, 3) 분기
branch = RunnableBranch(
    (lambda x: "수학" in x["topic"].lower(), math_chain),
    (lambda x: "과학" in x["topic"].lower(), science_chain),
    general_chain,                                   # 기본 경로
)
full_chain = {"topic": classify_chain, "question": RunnablePassthrough()} | branch | StrOutputParser()
full_chain.invoke("미적분의 개념에 대해 말씀해 주세요.")   # → '파스칼선생님께서 말씀하시기를..'
```

> [!warn] 헷갈리기 쉬움
> `prompt | model`의 결과는 AIMessage라 `.content`로 꺼내야 하고, 뒤에 `StrOutputParser()`를 붙이면 바로 문자열이 나옴. 스트리밍 시에도 parser 유무에 따라 `chunk.content`와 `chunk`로 출력 코드가 달라짐.
