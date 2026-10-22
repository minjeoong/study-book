---
title: "RDBMS vs Vector DB, 그리고 Qdrant"
en: "RDBMS vs Vector Database, Why Qdrant"
summary: "RDBMS는 정확 일치·범위 비교, Vector DB는 의미 좌표의 가까운 이웃 탐색 — Qdrant는 Rust 기반 경량 엔진"
importance: 2
order: 5
tags:
  - Vector DB
  - Qdrant
  - RDBMS
keypoints:
  - "RDBMS: =, <, LIKE로 정확 일치 — '아이폰 화면 깨짐'으로 '스마트폰 액정 파손'을 못 찾음"
  - "Vector DB: 텍스트를 의미 벡터로 바꿔 ANN 탐색, 오타·모호한 질문도 의도로 매칭"
  - "Qdrant: Rust(GC 멈춤 없음), 단일 바이너리·Docker, 웹 대시보드, Single-stage 필터링"
qa:
  - q: "RDBMS의 LIKE 검색이 있는데 왜 Vector DB가 필요한가?"
    a: "LIKE '%스마트폰%'은 글자가 똑같이 적힌 행만 찾기 때문에 '아이폰 화면 깨짐'으로 검색하면 '스마트폰 액정 파손' 문서를 놓친다. Vector DB는 텍스트를 임베딩해 의미 좌표로 저장하고, 질문 좌표와 가장 가까운 이웃을 ANN으로 찾아 글자가 겹치지 않아도 뜻이 통하는 문서를 가져온다. 다만 user_id나 가격 같은 정형 조건은 RDBMS가 정확하므로 대체 관계가 아니라 용도가 다르고, Vector DB도 payload 필터로 조건을 함께 건다."
  - q: "여러 Vector DB 중 Qdrant를 쓰는 이유는?"
    a: "Rust로 작성돼 가비지 컬렉터로 인한 멈춤이 없고 CPU와 메모리를 효율적으로 쓰며, 단일 바이너리나 가벼운 Docker 이미지 하나로 노트북부터 클러스터까지 같은 방식으로 띄운다. 내장 웹 대시보드에서 컬렉션, 포인트 수, payload를 바로 확인하고 REST 쿼리를 테스트할 수 있다. 무엇보다 HNSW 탐색 도중에 payload 조건을 함께 검사하는 single-stage 필터링으로 조건 검색에서도 속도와 recall을 지킨다."
related:
  - qdrant-data-model
  - payload-filtering
  - text-vectorization
  - rag-pipeline/vector-store-index
source: "10/8 슬라이드 p.78–84 (일반 RDBMS와 Vector DB의 차이점)"
---

```compare
RDBMS (MySQL, PostgreSQL) | Vector DB (Qdrant)
비교 방식 | 글자·숫자가 똑같은가 (Exact Match, 범위) | 의미 좌표가 가까운가 (ANN)
쿼리 예 | WHERE user_id = 100, price <= 50000, title LIKE '%스마트폰%' | "주말에 가볍게 웃으며 볼 영상" → 코미디 줄거리
강점 | 정확한 조건 필터, 정렬, 집계 | 표현이 달라도 의도·뉘앙스로 매칭, 오타에 강함
약점 | 동의어·다른 표현을 못 찾음 | 정확 일치는 payload 필터로 보완 필요
```

> [!tip] Qdrant 대시보드
> Docker로 Qdrant를 띄우고 `http://localhost:6333/dashboard`에 접속하면 컬렉션·포인트 수를 실시간 확인하고, payload를 JSON으로 열람하고, 콘솔에서 REST 검색 쿼리를 바로 날려 볼 수 있음 (실습1).
