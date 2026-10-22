---
title: "Payload Filtering — 조건 필터 + 벡터 검색"
en: "Payload Filtering, Pre-filtering vs Post-filtering vs Single-stage"
summary: "'인사팀 문서 중에서만'처럼 메타데이터 조건과 의미 검색을 함께 거는 기능, Qdrant는 HNSW 탐색 중에 조건을 동시에 검사"
importance: 3
order: 7
tags:
  - Qdrant
  - Payload Filtering
  - HNSW
keypoints:
  - "실무 질문엔 도메인·권한·날짜·카테고리 조건이 붙음 — 조건 없으면 엉뚱한 부서 문서가 섞임"
  - "Post-filtering은 결과가 텅 빔(recall 급감), Pre-filtering은 인덱스를 못 타서 느림"
  - "Qdrant Single-stage: 그래프 이동마다 payload 검사 → 조건 100% 만족 + ms 속도"
qa:
  - q: "벡터 검색에 메타데이터 필터를 거는 방식들의 장단점은?"
    a: "사후 필터링은 의미가 가까운 100개를 먼저 뽑고 조건으로 거르는데, 그 안에 조건을 만족하는 문서가 1~2개뿐이면 결과가 거의 비는 recall 문제가 생긴다. 사전 필터링은 조건에 맞는 문서를 먼저 고른 뒤 그 안에서만 벡터를 비교하는데, 미리 만든 HNSW 인덱스를 못 타고 전수 조사를 해서 느려진다. Qdrant는 HNSW 그래프에서 이웃으로 이동할 때마다 payload 조건을 함께 검사해, 조건을 만족하는 노드만 징검다리 삼아 정확도와 속도를 모두 지킨다."
  - q: "RAG에서 payload 필터는 어디에 쓰나?"
    a: "권한 관리와 범위 제한에 쓴다. '내가 접근 권한을 가진 영업본부 문서 중에서', '2025년 이후 작성된 규정 중에서'처럼 사용자 권한, 부서, 날짜, 문서 유형 조건을 걸어 의미상 그럴듯한 다른 부서 문서가 섞이는 것을 막는다. 이를 위해 청크를 저장할 때 부서, 작성자, 날짜 같은 메타데이터를 payload로 함께 넣어 둬야 한다."
related:
  - qdrant-data-model
  - ann-hnsw
  - rdbms-vs-vector-db
  - rag-pipeline/document-parsing
source: "10/8 슬라이드 p.82–84, p.108–111 (실무 필수 기능, 조건 필터링), 실습3, 종합실습"
---

```compare
Post-filtering | Pre-filtering | Qdrant Single-stage
순서 | 벡터 검색 100개 → 조건으로 거름 | 조건으로 10만 건 거름 → 벡터 비교 | HNSW 탐색 중 노드마다 조건 동시 검사
문제 | 조건 맞는 게 1~2개면 결과가 텅 빔 | HNSW 인덱스가 깨져 전수 조사, 수 초 지연 | 없음 (조건 100% + ms 속도)
비유 | 다 뽑고 나서 골라내기 | 먼저 골라내고 하나씩 비교 | 고속도로 달리며 톨게이트 검문
```

```python
from qdrant_client.models import FieldCondition, Filter, MatchValue

hits = client.query_points(
    collection_name="company_manuals",
    query=embed("연차 사용 방법"),                       # 의미 검색
    query_filter=Filter(must=[FieldCondition(key="department",
                                             match=MatchValue(value="인사팀"))]),   # 조건 필터
    limit=3,
).points
context = "\n".join(h.payload["text"] for h in hits)    # payload 원문 → 프롬프트
```

> [!tip] 종합실습 흐름
> 사내 FAQ·규정을 문맥 단위로 쪼개 부서명·작성자 메타데이터 부착 → 임베딩해 Qdrant에 일괄 적재 → "인사팀 규정 중 '연차 사용 방법'과 가장 가까운 문단 3개" 필터 검색 함수 → 검색 문단으로 질문-답변 프롬프트 완성. (위 코드는 실습 목표를 qdrant-client API로 옮긴 예시)
