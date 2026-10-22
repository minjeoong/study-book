---
title: "Naive RAG의 한계와 Advanced RAG"
en: "Naive RAG Limitations, Advanced RAG, Query Transformation"
summary: "Naive RAG의 한계를 Indexing·Pre-Retrieval·Retrieval·Post-Retrieval 단계별로 정교화한 구조"
importance: 3
order: 11
tags:
  - RAG
  - Advanced RAG
  - Query Rewriting
keypoints:
  - "Naive 한계: 의미 유사도 ≠ 의도 적합성, 정보 과잉이 부르는 환각, 단일 쿼리·고정 청크"
  - "Pre-Retrieval: Query Rewriting·Routing·Expansion·Transformation(분해)"
  - "Advanced도 여전히 Linear 구조 — 되돌아가 고치는 흐름은 Self-RAG·Modular로"
qa:
  - q: "Naive RAG의 한계는?"
    a: "'BERT와 GPT의 차이점은?'을 물으면 GPT만 설명한 문서가 0.91로 가장 유사하게 잡히고 비교에 필요한 BERT 문서는 0.76으로 밀리는 것처럼, 의미적 유사성이 질문 의도 적합성과 같지 않다. 검색된 청크를 다 넣으면 중복과 노이즈 때문에 LLM이 핵심을 못 골라 환각 위험이 오히려 커진다. 단일 쿼리, 단일 벡터DB, 고정 청크 구조라 복합 질의, 멀티소스 확장, 정답 피드백 반영도 어렵다."
  - q: "Query Rewriting, Routing, Expansion, Transformation의 차이는?"
    a: "Rewriting은 모호한 구어체 질문을 검색에 맞는 질의로 다시 쓰는 것이고, Routing은 질문을 어떤 데이터 소스나 인덱스로 보낼지 정하는 것이다. Expansion은 EV, charging station처럼 관련 키워드를 덧붙여 recall을 높이고, Transformation은 '삼성과 애플 3년 실적 비교'를 회사별 하위 질의로 분해하듯 질문 형태 자체를 바꾼다. 실습에서 재작성만으로 원 질문 검색과 겹치지 않는 새 청크 3개가 들어왔다."
related:
  - hybrid-search
  - reranker
  - rag-evaluation
  - agentic-rag
  - chunking-strategies
source: "Day1(9/18) 슬라이드 p.96–110, RAG 논문 정리 노트(9/21) Advanced RAG, 실습 15-RAG/02-RAG-Advanced B-2, 15-RAG/04-Summary"
---

```layers
A. Indexing :: 검색 준비 단계 — Hierarchical Structure(제목→소제목→문단), Semantic Chunking
B. Pre-Retrieval :: 검색 전 질문 다듬기 — Query Rewrite·Routing·Expansion·Transformation
C. Retrieval :: 검색 방식 강화 — Hybrid(Keyword + Semantic), Multi-hop(문서1 결과로 문서2 검색)
D. Post-Retrieval :: LLM 입력 정제 — Reranker, Context Reorder, Compressor
```

```python
rewrite_prompt = ChatPromptTemplate.from_template(
    "다음 사용자 질문을 벡터 검색에 더 적합하도록 핵심 키워드 중심의 검색 질의로 다시 작성하세요. "
    "검색 질의만 한 줄로 출력.\n\n질문: {question}\n검색 질의:"
)
rewrite_chain = rewrite_prompt | llm | StrOutputParser()
search_question = rewrite_chain.invoke({"question": "그 수출 통제 얘기 결국 어떻게 됐더라?"})
docs = retriever.invoke(search_question)
```

> [!warn] 재작성 결과도 검증 대상
> 실습에서 재작성 질의 끝에 질문과 무관한 외국어 토큰이 섞여 나온 적이 있음. LLM이 만든 쿼리를 그대로 믿지 말고 원 질문 검색 결과와 합집합을 쓰거나 형식을 검사.

> [!tip] 요약 기반 검색
> 긴 문서는 요약문을 메타데이터(summary)로 함께 저장해 요약과 질문을 비교하는 전략도 있음. 요약 방식은 Stuff(통째로), Map-Reduce(청크별 병렬 요약 후 결합), Map-Refine(순차 누적 개선), Chain of Density(엔티티를 추가하며 정보 밀도를 높이는 반복 요약).
