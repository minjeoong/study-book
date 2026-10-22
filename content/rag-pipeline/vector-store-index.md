---
title: "Vector DB와 벡터 인덱스 (Flat·IVF·HNSW·PQ)"
en: "Vector Store, ANN Index (Flat, IVF, HNSW, PQ)"
summary: "벡터와 메타데이터를 함께 저장·검색하는 저장소와, 전부 비교하지 않고 근사 최근접 이웃을 빨리 찾는 인덱스 전략"
importance: 3
order: 6
tags:
  - Vector DB
  - ANN
  - HNSW
  - FAISS
keypoints:
  - "Vector DB = vector + meta, Collection(테이블)·Point(행)·Payload(메타) 구조"
  - "Flat 정확·느림, IVF 클러스터만 탐색(nprobe), HNSW 그래프·빠르고 정밀·메모리↑, PQ 압축·정확도↓"
  - "Recall·Latency·Memory는 동시에 최적화 불가 — 서비스 요구사항으로 선택"
qa:
  - q: "ANN 인덱스 Flat, IVF, HNSW, PQ를 비교하면?"
    a: "Flat은 모든 벡터와 거리를 계산해 정확도는 100%지만 데이터가 커지면 느려 소규모 테스트에 쓴다. IVF는 벡터를 클러스터링하고 가까운 클러스터 안에서만 찾으며 nprobe로 속도와 정확도를 조절한다. HNSW는 다층 그래프를 타고 이동해 빠르고 정밀해 실시간 검색에 쓰이지만 인덱스 메모리가 크고 삽입이 느리며, PQ는 벡터를 압축해 메모리를 크게 줄이는 대신 정확도가 떨어진다."
  - q: "Vector DB는 어떻게 고르나?"
    a: "무엇이 최고인지보다 목적과 환경에 맞는 선택이 중요하다. 로컬 프로토타입은 Chroma나 FAISS, 수억 건 이상은 Milvus나 Vespa, 메타데이터 조건 필터와 벡터 검색 결합이 중요하면 Qdrant나 Weaviate, 운영 부담 없는 SaaS는 Pinecone을 검토한다. FAISS는 Meta의 인덱싱 라이브러리라 DB로서의 운영 기능은 없지만 중소규모에서는 로컬 벡터 스토어처럼 쓰인다."
related:
  - embedding-model-selection
  - retriever-mmr
  - vector-db/ann-hnsw
  - vector-db/qdrant-data-model
source: "Day1(9/18) 슬라이드 p.50–64, 구현 노트 13-VectorStore, 실습 13-VectorStore/01-FAISS·02-Chroma"
---

```layers
Collection :: 벡터를 묶는 저장 단위 (RDB의 Table), 데이터셋·주제별 관리
Point :: 벡터 하나의 데이터 단위 (RDB의 Row) = ID + Vector + Payload
ID :: 각 Point의 고유값, 주로 UUID
Vector :: 다차원 임베딩, 유사도 검색의 핵심
Payload (metadata) :: 원문·출처·필터용 정보 (명칭은 제품마다 다름: Chroma Document–Metadata, Pinecone Vector–Metadata, Weaviate Object–Properties)
```

| 인덱스 | 원리 | 장점 | 단점 | 대표 |
| --- | --- | --- | --- | --- |
| Flat | 모든 벡터와 직접 거리 계산 (Exhaustive) | 정확도 100% | 느림, 대규모 비효율 | FAISS IndexFlatL2 |
| IVF | 클러스터링 후 가까운 클러스터 안만 탐색 | 빠름, 검색 공간 축소 | 정밀도↓, nprobe 튜닝 | Pinecone, FAISS, Milvus |
| HNSW | 다단계 계층 그래프 탐색 | 빠르고 정밀, 실시간 | 인덱스 메모리 큼, 삽입 느림 | Qdrant, Weaviate, Vespa |
| PQ | 벡터를 압축 저장, 근사 거리 | 메모리 매우 작음 | 압축 손실로 정확도↓ | FAISS, Annoy |

- **FAISS** (Meta, 2017): 인덱싱 라이브러리, GPU 고속 검색, 직접 운영 구현 필요
- **Milvus** (Zilliz, 2019): 대규모 서버형, K8s 분산 확장, 운영 복잡
- **Qdrant** (2021): 벡터 + 조건 필터 하이브리드, Rust, REST·gRPC
- **Chroma** (2023): 개발·실험용, Python API로 간단, 대규모 부적합
- **Pinecone** (2021): 클라우드 SaaS, 자동 확장, 비용 발생

> [!tip] Recall – Latency – Memory 삼각형
> Recall(정답이 후보에 들 확률)↑, Latency↓, Memory↓를 동시에 얻을 수 없음. FLAT은 Recall 최고·느림, IVF는 공간을 나눠 Latency를 줄이고 nprobe로 Recall 조절, HNSW는 메모리를 써서 속도·Recall 동시 확보, PQ는 Recall을 희생해 메모리·연산을 극단적으로 줄임.
