---
title: "Qdrant 데이터 구조 — Collection·Point·Vector·Payload"
en: "Qdrant Collection, Point, Vector, Payload"
summary: "Collection 안에 ID·Vector·Payload로 된 Point를 저장, 벡터 차원과 거리 기준은 생성 시 고정"
importance: 2
order: 6
tags:
  - Qdrant
  - Vector DB
  - Payload
keypoints:
  - "Collection: 용도별 독립 저장소, 생성 시 벡터 차원(예: 1536)과 거리(COSINE·DOT) 고정"
  - "Point = ID(정수·UUID) + Vector(의미 좌표) + Payload(JSON 메타데이터)"
  - "Payload의 두 역할: 원문 텍스트 복원(LLM 프롬프트 재료) + 조건 필터링"
qa:
  - q: "Qdrant의 Point와 Payload는 무엇인가?"
    a: "Point는 컬렉션에 저장되는 데이터 한 건으로, 엑셀의 한 행처럼 고유 ID, 임베딩 벡터, payload로 구성된다. Payload는 벡터에 붙인 JSON 이름표로 원문 텍스트, 제목, 부서, 페이지, 작성 연도 같은 정보를 담는다. 벡터만으로는 원문을 알 수 없으므로 RAG에서는 검색된 포인트의 payload에서 원문을 꺼내 프롬프트에 넣고, 부서·연도 같은 조건 필터에도 payload를 쓴다."
  - q: "한 컬렉션에 서로 다른 임베딩 모델의 벡터를 섞을 수 있나?"
    a: "안 된다. 컬렉션은 만들 때 벡터 차원과 거리 기준을 고정하므로 1536차원 OpenAI 벡터용 컬렉션에 384차원 오픈소스 모델 벡터를 넣을 수 없다. 차원이 우연히 같더라도 모델이 다르면 좌표 공간이 달라 거리 비교가 무의미하니, 임베딩 모델을 바꾸면 컬렉션을 새로 만들고 전체를 다시 임베딩해야 한다."
related:
  - payload-filtering
  - similarity-metrics
  - rag-pipeline/vector-store-index
  - rag-pipeline/embedding-model-selection
source: "10/8 슬라이드 p.103–107 (Qdrant의 핵심 구성 요소), 실습1 (Collection 생성·CRUD·대시보드)"
---

```layers
Collection :: 엑셀 시트·DB 테이블 (company_manuals, customer_faq처럼 용도별 격리)
Point :: 데이터 1건 = 한 행
ID :: 주민번호 같은 고유 번호 (정수 또는 UUID)
Vector :: AI가 뽑은 의미 좌표 [0.0142, −0.0821, 0.1254, ...]
Payload :: JSON 이름표 {title, department, page, text}
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

client = QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="company_manuals",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),   # 차원·거리 고정
)
client.upsert(collection_name="company_manuals", points=[
    PointStruct(id=42, vector=embedding,
                payload={"title": "2026 연차 사용 가이드", "department": "인사팀", "page": 5,
                         "text": "미사용 연차는 최대 5일까지 이월이 가능합니다."}),
])
```

> [!warn] 실습 코드 안내
> 이 과목의 실습 노트북은 자료에 포함되지 않아, 위 코드는 슬라이드의 구성 요소 설명과 실습1 목표(컬렉션 생성·CRUD)를 qdrant-client 기본 API로 옮긴 예시.
