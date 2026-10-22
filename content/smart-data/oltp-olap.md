---
title: "OLTP vs OLAP과 DB 선택"
en: OLTP vs OLAP, SQL vs NoSQL, Data Warehouse
summary: "거래 처리(OLTP)와 대량 분석(OLAP)은 스키마·저장 방식·DB가 다르다. 데이터 성격에 맞춰 RDBMS·NoSQL·DW를 고른다"
importance: 2
order: 13
tags: [OLTP, OLAP, NoSQL, 데이터 웨어하우스, 스타 스키마, Cloud DB]
keypoints:
  - OLTP는 정규화·행 저장·짧은 트랜잭션, OLAP은 반정규화·컬럼 저장·대량 스캔
  - SQL은 엄격한 ACID와 관계, NoSQL은 유연한 스키마와 수평 확장
  - 분석 DB는 파티션·컬럼 프루닝으로 읽는 양을 줄인다 → SELECT * 금지
qa:
  - q: OLTP와 OLAP의 차이는?
    a: "OLTP는 주문·결제처럼 짧은 읽기·쓰기 트랜잭션을 실시간으로 처리하는 운영 DB로, 정규화된 행 지향 저장과 B-Tree 인덱스, 강한 ACID가 핵심입니다. OLAP은 매출 분석처럼 대량 데이터를 스캔해 집계하는 분석 DB로, 스타 스키마 같은 반정규화와 컬럼 지향 저장, 파티션 프루닝으로 처리량을 높입니다. PostgreSQL·MySQL이 OLTP, BigQuery·Snowflake·Redshift가 OLAP의 대표입니다."
  - q: RDBMS와 NoSQL은 어떻게 선택하나요?
    a: "데이터 일관성과 복잡한 조인, 엄격한 ACID가 필요한 주문·결제·회원 정보는 RDBMS가 맞습니다. 스키마가 자주 바뀌거나 대량 트래픽을 수평 확장으로 받아야 하고 일부 불일치를 허용할 수 있으면 NoSQL이 유리합니다. 요즘은 세션은 Redis, 검색은 Elasticsearch, 임베딩은 pgvector처럼 목적별로 섞어 쓰고, SQL과 수평 확장을 함께 원하면 NewSQL도 선택지입니다."
  - q: 스타 스키마란?
    a: "가운데 매출액·수량 같은 측정값과 FK만 가진 팩트 테이블을 두고, 사용자·상품·날짜·지역 디멘전 테이블이 별 모양으로 둘러싼 DW 기본 구조입니다. 조인 깊이가 얕아 집계가 빠르고, 디멘전 이력은 SCD Type 2로 관리합니다. 디멘전을 다시 정규화하면 스노우플레이크 스키마입니다."
related: [normalization, index-design, python-data/polars-duckdb-arrow, llm-transformer/vector-similarity]
source: Day1 (7/27) 슬라이드 p.35–37 (SQL vs NoSQL), p.74–90 (스키마 전략, RDBMS 비교, ANSI SQL), Day2 (7/28) p.121–122 (DBMS vs DW vs Data Mining, MSA 연동), Day3 (7/29) p.317–323 (SCD, 샤딩, MSA DB 패턴), Day4 (7/30) p.375–412 (Cloud DB, 서버리스·분산 DB, DW·분석 DB, NewSQL, 시계열·Vector DB, 목적별 DB)
---

```compare
OLTP (운영 DB) | OLAP (분석 DB · DWH)
목적 | 주문·결제·재고 처리 | 매출 등 다차원 분석·집계
워크로드 | 잦은 단건 읽기·쓰기, 낮은 지연 | 대량 스캔, 높은 처리량
스키마 | 정규화 (3NF) | 반정규화 (스타, 스노우플레이크)
저장 | 행 지향 | 컬럼 지향 (Parquet, ORC)
최적화 | 인덱스, 조인 순서 | 파티션·컬럼 프루닝, 벡터화 실행
예 | PostgreSQL, MySQL, Oracle | BigQuery, Snowflake, Redshift, ClickHouse
```

| 데이터 성격 | DB 예시 | 이유 |
| --- | --- | --- |
| 트랜잭션 (주문, 결제, 회원) | PostgreSQL, MySQL | ACID, 관계 무결성 |
| 세션, 캐시, 장바구니 | Redis | 인메모리, 초저지연 |
| 상품 검색, 로그 분석 | Elasticsearch | 역인덱스, 전문 검색 |
| IoT 센서, 메트릭 | TimescaleDB, InfluxDB | 시간 파티션, 집계 최적화 |
| 임베딩 (RAG, 추천) | pgvector, Qdrant | ANN 인덱스, 유사도 검색 |
| 관계 탐색 (SNS, 사기 탐지) | Neo4j | 그래프 경로 쿼리 |
| BI 대시보드, 데이터마트 | BigQuery, Snowflake | 컬럼형 대량 스캔 |

- NoSQL 모델링은 반대 방향: RDBMS는 테이블 설계 후 쿼리 작성, NoSQL은 필요한 쿼리 결과를 먼저 정하고 그에 맞게 설계
- NewSQL(CockroachDB, TiDB, Spanner): SQL + ACID + 수평 확장, Raft·Paxos 합의, 멀티리전 쓰기는 지연 증가
- Cloud: RDS는 엔진 그대로 관리형, Aurora는 컴퓨트·스토리지 분리 + 3AZ 6중 복제 / DBaaS여도 스키마·인덱스·쿼리 최적화는 고객 책임
- 분석 DB 3기술: 파티션 프루닝(필요한 날짜만), 컬럼 프루닝(SELECT한 컬럼만, 스캔 바이트 과금이라 비용 직결), 벡터화 실행(컬럼 묶음을 SIMD로)
- SCD: Type 1 덮어쓰기(이력 없음) / Type 2 `valid_from · valid_to · is_current`로 이력 행 추가 (실습 4 product_prices)
- MSA: Database per Service, Saga(로컬 트랜잭션 + 보상 트랜잭션), CQRS(읽기·쓰기 모델 분리), Outbox + CDC(이벤트 발행 보장)
