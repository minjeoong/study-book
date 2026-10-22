---
title: "임베딩과 임베딩 모델 선택"
en: "Embedding, Embedding Model Selection, Vector Dimension"
summary: "청크와 질문을 같은 벡터 공간의 좌표로 바꾸는 단계 — 한 번 고르면 인덱스 전체가 묶이므로 비용 이상의 의사결정"
importance: 3
order: 5
tags:
  - RAG
  - Embedding
  - MTEB
keypoints:
  - "고려사항: 언어(한국어 비중)·도메인 용어·최대 입력 토큰·차원·비용(쿼리 시에도 발생)"
  - "모델 교체 = 전체 재임베딩·재색인 — 리더보드는 후보 탐색용, 내 데이터로 테스트 후 확정"
  - "차원↑ 표현력↑ but 저장·연산↑·차원의 저주 — 일반 QA·RAG는 768~1024"
qa:
  - q: "임베딩 모델은 어떤 기준으로 고르나?"
    a: "한국어 비중과 다국어 필요성, 제조·통신 같은 도메인 전문 용어 반영도, 문서 길이를 감당할 최대 입력 토큰, 차원 수에 따른 인덱스 규모, 그리고 전처리뿐 아니라 매 쿼리에도 드는 비용을 본다. 모델을 중간에 바꾸면 전체 문서를 다시 임베딩하고 인덱스를 재구성해야 해 처음 선택이 중요하다. MTEB 리더보드로 후보를 좁히되 최종 결정은 우리 데이터로 검색 평가를 돌려서 한다."
  - q: "임베딩 차원이 높으면 무조건 좋은가?"
    a: "차원이 높을수록 더 많은 관점에서 의미를 표현하지만, 벡터 하나당 저장 공간과 거리 계산 비용이 커지고 검색이 느려진다. 고차원에서는 모든 벡터가 비슷하게 멀어 보여 거리 기반 유사도의 신뢰도가 떨어지는 차원의 저주도 생긴다. 그래서 표현력과 효율의 균형으로 고르며, 일반 QA·RAG는 보통 768~1024차원, 코드·표가 섞인 복합 문서는 1024~1536차원을 쓴다."
related:
  - chunking-strategies
  - vector-store-index
  - vector-db/dense-embedding-models
  - llm-transformer/word-embedding
source: "Day1(9/18) 슬라이드 p.44–56, 구현 노트 12-Embedding, 실습 12-Embedding/01-OpenAIEmbeddings·02-CacheBackedEmbeddings"
---

```layers
Token :: 문자 조각 ("I love Orange" → I, love, Orange), 숫자가 아님
Embedding :: 토큰마다 고정된 의미 벡터 (정적 의미 공간)
Encoding :: 위치·문맥까지 반영한 표현, 같은 'love'도 문장마다 다른 벡터
문장 임베딩 :: RAG 검색용, 청크·질문 하나를 벡터 하나로 (예: 1536차원)
```

| 용도 | 일반적인 차원 범위 |
| --- | --- |
| 추천 시스템 | 64~128 |
| 간단한 텍스트 유사도, 실시간 경량 검색 | 128~512 |
| 이미지 검색·인식 | 256~2048 |
| 일반 Q&A, RAG | 768~1024 |
| 복합 문서 (코드·표·수식) | 1024~1536 |
| 멀티모달 (텍스트 + 이미지) | 1024~2048+ |

```python
from langchain_classic.embeddings import CacheBackedEmbeddings
from langchain_classic.storage import LocalFileStore

embedding = OpenAIEmbeddings(model="text-embedding-3-small")
cached = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings=embedding,
    document_embedding_cache=LocalFileStore("./cache/"),   # 텍스트 해시 → 벡터 캐시
    namespace=embedding.model,                             # 모델별로 캐시 분리
)
db = FAISS.from_documents(documents, cached)   # 두 번째 실행부터는 API 호출 없이 캐시 사용
```

> [!tip] 과제의 오픈소스 임베딩 선정
> KV cache 평가 과제는 오픈소스 임베딩 필수, "리더보드 상위 랭크"는 부적절한 근거로 감점. 팀은 한국어 질문 ↔ 영어 논문 교차언어 검색, 최대 32K 입력, 로컬 실행 크기, Apache 2.0을 이유로 Qwen3-Embedding-0.6B를 골랐고, BGE-M3(Sparse 기능 미활용)·multilingual-e5(512토큰 제한)는 비교 후 제외.
