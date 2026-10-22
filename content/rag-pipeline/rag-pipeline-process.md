---
title: "RAG 파이프라인 8단계"
en: "RAG Pipeline: Preprocessing and Runtime"
summary: "미리 Load·Split·Embed·Store로 지식 베이스를 만들고, 질문마다 Retrieve·Prompt·LLM으로 답을 생성"
importance: 3
order: 2
tags:
  - RAG
  - LangChain
  - Pipeline
keypoints:
  - "Preprocessing은 미리: 문서 로드 → 분할 → 임베딩 → 벡터DB 저장 (Indexing)"
  - "Runtime은 질문마다: 검색 → 프롬프트 조립 → LLM 생성 → 체인으로 묶기"
  - "질문 임베딩은 문서 임베딩과 같은 모델, 프롬프트엔 '모르면 모른다' 지시"
qa:
  - q: "RAG 파이프라인을 단계별로 설명하면?"
    a: "전처리 단계에서 Document Loader로 PDF 등을 읽고, Text Splitter로 청크를 나누고, 임베딩 모델로 벡터로 바꿔 Vector DB에 저장한다. 런타임에는 질문을 같은 모델로 임베딩해 Retriever가 유사한 상위 k개 청크를 찾고, 프롬프트에 질문과 청크를 넣어 LLM이 답하게 한다. LangChain에서는 런타임 과정을 retriever, prompt, llm, parser를 잇는 체인 하나로 만든다."
  - q: "RAG 프롬프트에 꼭 넣는 지시는?"
    a: "검색된 context만 근거로 답하라는 지시와, context에서 답을 못 찾으면 모른다고 답하라는 지시다. 실습에서 '제공된 문서에서 답을 찾을 수 없습니다'라고만 답하게 했더니 '2030년 화성 기지 예산' 같은 질문에 지어내지 않았다. 답변 끝에 [p.N]처럼 출처 페이지를 달게 하면 근거를 추적할 수 있다."
related:
  - rag-overview
  - document-parsing
  - chunking-strategies
  - retriever-mmr
  - langchain/lcel-runnable
source: "Day1(9/18) 슬라이드 p.25–28, p.79–84, 실습 langchain-v1/15-RAG/01-RAG-Basic, 02-RAG-Advanced A"
---

```flow
Load :: Document Loader, 필요한 책을 책장에서 꺼내기
Split :: Text Splitter, 처리 가능한 청크로 분할
Embed :: 청크를 의미 벡터로 수치화
Store :: Vector DB에 벡터 + 메타데이터 저장
Retrieve :: 질문 벡터와 가까운 Top-k 청크 검색
Generate :: Prompt 조립 → LLM 답변, Chain으로 묶음
```

| 단계 | LangChain 구성 요소 (실습) |
| --- | --- |
| ① Document Loader | `PyMuPDFLoader("SPRi AI Brief_2026_08.pdf")` → 29페이지 |
| ② Text Splitter | `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)` → 100청크 |
| ③ Embedding | `OpenAIEmbeddings(model="text-embedding-3-small")` |
| ④ Vector DB | `FAISS.from_documents(split_documents, embeddings)` |
| ⑤ Retriever | `vectorstore.as_retriever()` (기본 k=4) |
| ⑥ Prompt | Context만 사용, 모르면 모른다, 출처 표기 |
| ⑦ LLM | `ChatOpenAI(model="gpt-4.1-nano", temperature=0.1)` |
| ⑧ Chain | 아래 LCEL 체인 |

```python
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
chain.invoke("미국 상무부 Mythos 수출 통제 해제 일자는?")
```

> [!tip] 답과 근거를 함께 돌려주기
> `RunnableParallel(context=retriever, question=RunnablePassthrough()).assign(answer=answer_chain)`으로 답변과 검색 문서를 한 결과에 담으면 어떤 청크에서 나온 답인지 추적 가능 (실습 02-RAG-Advanced A. 신뢰성).
