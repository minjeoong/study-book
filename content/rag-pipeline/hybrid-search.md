---
title: "Hybrid Search (Sparse + Dense)"
en: "Hybrid Retrieval, BM25, Reciprocal Rank Fusion"
summary: "키워드 일치에 강한 Sparse(BM25)와 의미 유사도에 강한 Dense 임베딩 검색을 합쳐 서로의 빈틈을 메우는 검색"
importance: 3
order: 8
tags:
  - RAG
  - Hybrid Search
  - BM25
  - RRF
keypoints:
  - "Sparse: 역색인·단어 빈도(TF-IDF, BM25), 고유명사·코드·품번 같은 정확 매칭에 강함"
  - "Dense: 임베딩 의미 거리, 동의어·표현 차이에 강함"
  - "병합은 점수 대신 순위로 합치는 RRF, LangChain은 EnsembleRetriever(weights)"
qa:
  - q: "Dense 검색만으로 부족해서 Hybrid를 쓰는 이유는?"
    a: "임베딩 검색은 '스마트폰 고장'과 '휴대폰 액정 파손'처럼 표현이 달라도 뜻이 같으면 찾지만, 품번·고유명사·약어처럼 정확히 일치해야 하는 키워드에는 약하다. BM25 같은 Sparse 검색은 정확한 단어 매칭에 강하고 CPU만으로 빠르며 왜 그 문서가 뽑혔는지 설명도 된다. 둘을 합치면 정밀도와 커버리지가 함께 올라가 엔터프라이즈 RAG에서 Dense + Sparse + Reranking 조합이 표준으로 자리 잡고 있다."
  - q: "RRF(Reciprocal Rank Fusion)란?"
    a: "여러 검색기 결과를 점수가 아닌 순위로 합치는 방법으로, 문서마다 각 검색기에서의 순위 r에 대해 1/(k+r)을 더해 최종 순위를 낸다. BM25 점수와 코사인 유사도처럼 스케일이 다른 점수를 정규화 없이 합칠 수 있는 것이 장점이다. KV cache 평가 과제 코드에서도 FAISS와 BM25 결과를 k=60인 RRF로 융합했다."
related:
  - retriever-mmr
  - reranker
  - advanced-rag
  - vector-db/text-vectorization
  - vector-db/dense-embedding-models
source: "Day1(9/18) 슬라이드 p.19, p.69–71, p.108, 실습 14-Retriever/04-EnsembleRetriever·04a-SPLADE·08-Kiwi-BM25, 15-RAG/02-RAG-Advanced B-1"
---

```compare
Sparse Retriever | Dense Retriever
표현 | 어휘 크기 차원, 대부분 0 | 저차원 조밀 벡터
입력 처리 | 토크나이저로 단어 분해 | 인코더로 임베딩
인덱스 | 역색인 (단어 → 문서) | 벡터 인덱스 (HNSW 등)
점수 | 단어 일치·빈도 (TF-IDF, BM25) | 의미 거리 (cosine), BGE-M3 등
강점 | 정확한 키워드, 빠름, 설명 가능 | 동의어, 뉘앙스, 복잡한 질의
약점 | 단어가 다르면 못 찾음 (vocabulary mismatch) | 정확 일치·고유명사에 약함
```

```formula
RRF(d) = Σᵣ 1 ÷ (k + rankᵣ(d)) :: 검색기마다 순위의 역수를 더함, k는 보통 60
```

```python
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever

bm25 = BM25Retriever.from_documents(split_docs)      # 한국어는 Kiwi 형태소 토크나이저 권장
bm25.k = 4
dense = vectorstore.as_retriever(search_kwargs={"k": 4})
hybrid = EnsembleRetriever(retrievers=[bm25, dense], weights=[0.5, 0.5])
```

> [!tip] 실습 결과와 BM25 개선
> 검색기 평가(질문 20개)에서 Kiwi BM25 + FAISS 앙상블이 MRR 0.975로 1위, Kiwi BM25 단독 0.95, 영문 토크나이저 BM25+FAISS 0.90. 한국어는 형태소 분석이 Sparse 성능을 좌우. BM25로 baseline을 먼저 깔고, 어휘 불일치가 심하면 SPLADE(BERT MLM으로 단어 확장한 learned sparse)나 BGE-M3 sparse를 검증.
