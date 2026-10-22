---
title: "Reranker와 Two-Stage Retrieval"
en: "Reranker, Bi-Encoder vs Cross-Encoder, Lost in the Middle"
summary: "1차 검색으로 넉넉히 뽑은 후보를 Cross-Encoder가 질문과 함께 읽어 다시 줄 세우는 2단계 검색"
importance: 3
order: 9
tags:
  - RAG
  - Reranker
  - Post-Retrieval
keypoints:
  - "Lost in the Middle: LLM은 컨텍스트 앞·뒤 정보는 잘 쓰고 가운데는 놓침"
  - "Bi-Encoder는 따로 임베딩해 빠름, Cross-Encoder는 쌍으로 읽어 정확·느림"
  - "Post-Retrieval 3종: Rerank(순위), Context Reorder(배치), Compressor(압축)"
qa:
  - q: "Bi-Encoder와 Cross-Encoder의 차이는?"
    a: "Bi-Encoder는 질문과 문서를 각각 따로 벡터로 만들어 코사인 유사도로 비교하므로, 문서 벡터를 미리 계산해 두고 대규모 집합에서 빠르게 찾는다. Cross-Encoder는 질문과 문서를 한 쌍으로 모델에 함께 넣어 관련성 점수를 계산해 의미 관계를 정밀하게 보지만, 호출 시점에 쌍마다 계산해야 해 느리다. 그래서 Bi-Encoder로 Top-K 후보를 뽑고 Cross-Encoder로 재정렬하는 2단계 구조를 쓴다."
  - q: "Lost in the Middle 문제와 대응은?"
    a: "2023년 논문에서 문서 20개를 넣었을 때 정답 문서가 맨 앞이나 맨 뒤에 있으면 정확도가 높고 가운데 있으면 크게 떨어지는 U자 패턴이 나왔다. 그래서 Reranker로 정말 중요한 문서를 상위로 올리고, LongContextReorder로 관련도 높은 문서를 앞뒤에, 낮은 문서를 가운데에 둔다. Compressor로 필요 없는 문장을 잘라 컨텍스트 자체를 줄이는 것도 방법이다."
related:
  - retriever-mmr
  - hybrid-search
  - rag-evaluation
  - prompt-context/context-engineering
source: "Day1(9/18) 슬라이드 p.72–78, p.109, 실습 14-Retriever/05-ContextualCompressionRetriever·06-LongContextReorder"
---

```flow
1단계 Retrieval :: Bi-Encoder로 대규모 문서에서 후보 Top-K를 빠르게 추출
2단계 Rerank :: Cross-Encoder가 (질문, 문서) 쌍마다 관련성 점수 계산
재정렬 :: 점수 순으로 상위 N개만 남김
LLM :: 정제된 컨텍스트로 답변 생성
```

```compare
Retriever (Bi-Encoder) | Reranker (Cross-Encoder)
목적·우선순위 | 대용량에서 관련 문서를 빠르게 (속도) | 후보 안에서 정확한 순위 (정확도)
처리 | 각각 임베딩 → Cosine Similarity | 쿼리-문서 쌍 의미 비교 → Relevance Score
출력 | 후보 문서 집합 | 후보 내 순위와 점수
모델 | BGE, E5, Jina-Embedding | Cohere-Reranker, bge-reranker, Jina-Reranker
단점 | 의미 정확도가 떨어질 수 있음 | 느리고 계산 비용 높음
```

> [!tip] 숫자로 기억하기
> 2024 벤치마크: bge-large 임베딩에 bge-m3-reranker를 붙이면 MRR 0.8227 → 0.878(+0.055), Cohere-v3 + Cohere-Reranker v3는 0.8364 → 0.872. 임베딩이 이미 강하면(JinaAI-Base) 개선 폭은 +0.004로 작음 — 효과는 조합에 따라 다름.
