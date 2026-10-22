---
title: "Retriever와 MMR"
en: "Retriever, Cosine Similarity, Maximal Marginal Relevance"
summary: "질문 벡터와 가까운 청크를 찾아오는 검색기 — 코사인 유사도로 관련성을, MMR로 다양성까지 고려"
importance: 3
order: 7
tags:
  - RAG
  - Retriever
  - MMR
keypoints:
  - "검색 흐름: 질문 벡터화(문서와 같은 모델) → 유사도 비교 → 상위 k개 → 내용·메타데이터 반환"
  - "MMR = λ·질문과의 유사도 − (1−λ)·이미 뽑은 문서와의 최대 유사도"
  - "단일 사실 질의는 유사도 Top-k, 여러 관점이 필요한 질의는 MMR"
qa:
  - q: "MMR이란? 언제 쓰나?"
    a: "Maximal Marginal Relevance로, 후보 문서마다 질문과의 유사도에서 이미 뽑은 문서와의 최대 유사도를 빼서 점수를 매기고 가장 높은 것을 하나씩 추가한다. 관련성은 높지만 서로 비슷한 문서가 상위를 독점하는 것을 막아 다양성을 높인다. 단일 사실을 묻는 질의엔 코사인 유사도 Top-k, 여러 관점을 모아야 하는 질의엔 MMR이 적합하다."
  - q: "MMR을 쓰면 항상 검색이 좋아지나?"
    a: "아니다. 실습 검색기 평가에서 FAISS MMR(k=5, fetch_k=20, lambda_mult=0.5)의 MRR은 0.739로 기본 유사도 검색 0.833보다 낮았다. 정답 청크가 하나인 사실 질의에서는 다양성을 챙기느라 정답과 비슷한 후보를 밀어내기 때문이다. 그래서 λ와 k를 바꿔 가며 우리 데이터의 평가 지표로 확인해야 한다."
related:
  - hybrid-search
  - reranker
  - vector-store-index
  - vector-db/similarity-metrics
source: "Day1(9/18) 슬라이드 p.65–68, 구현 노트 14-Retriever, 실습 13-VectorStore/01-FAISS(Retriever 변환), 14-Retriever/10-Retriever-Evaluation"
---

```formula
cos(A, B) = (A · B) ÷ (‖A‖ ‖B‖) :: 1 같은 방향, 0 무관(직교), −1 반대
MMR(Dᵢ) = λ · Sim(Dᵢ, Q) − (1 − λ) · max Sim(Dᵢ, Dⱼ) :: Dⱼ는 이미 선택된 문서, λ=1 유사도만, λ=0 다양성만
```

| LangChain Retriever | 하는 일 |
| --- | --- |
| VectorStoreRetriever | 기본, `as_retriever(search_type=...)` |
| ParentDocumentRetriever | 작은 child 청크로 검색 → 큰 parent 문서 반환 (문맥 보강) |
| MultiQueryRetriever | LLM이 질문을 여러 표현으로 바꿔 검색 후 합집합 (recall↑) |
| EnsembleRetriever | Sparse + Dense 결과 결합 (Hybrid) |
| ContextualCompressionRetriever | 검색 결과에서 필요한 부분만 압축·필터 |
| LongContextReorder | 관련도 높은 문서를 앞·뒤로 재배치 |

```python
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 4})
retriever = vectorstore.as_retriever(search_type="mmr",
                                     search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.5})
retriever = vectorstore.as_retriever(search_type="similarity_score_threshold",
                                     search_kwargs={"score_threshold": 0.8})
```

> [!tip] MMR 쉽게 말하기
> Marginal은 "얼마나 관련 있나"가 아니라 "이미 가진 것에 얼마나 새로운 걸 더하나". 쿼리와 가장 가까운 1개를 고른 뒤, 남은 후보는 (쿼리와 가까운 정도 − 이미 고른 것과 가까운 정도)로 점수를 매겨 k개가 될 때까지 반복.
