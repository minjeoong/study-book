---
title: 실행계획과 SQL 튜닝
en: EXPLAIN ANALYZE, Join Algorithms, Query Tuning
summary: "옵티마이저가 고른 스캔·조인 방식을 EXPLAIN ANALYZE로 확인하고, 병목을 인덱스·쿼리 구조로 고치는 과정"
importance: 3
order: 10
tags: [실행계획, EXPLAIN, Hash Join, Nested Loop, SQL 튜닝, 파티셔닝]
keypoints:
  - EXPLAIN은 예상 계획만, EXPLAIN ANALYZE는 실제로 실행하고 측정
  - 작은 쪽 × 인덱스 있는 큰 쪽은 Nested Loop, 대형 × 대형 등가 조인은 Hash
  - 예상 rows와 actual rows가 크게 다르면 ANALYZE로 통계 갱신
qa:
  - q: 쿼리가 느릴 때 어떻게 분석하나요?
    a: "먼저 pg_stat_statements나 slow query log로 느린 쿼리를 찾고, EXPLAIN (ANALYZE, BUFFERS)로 실행계획을 봅니다. 큰 테이블의 Seq Scan, 예상 rows와 actual rows의 큰 차이, Sort나 Hash Batches > 1 같은 메모리 Spill을 확인해 인덱스 추가, 쿼리 재작성, 통계 갱신 중 무엇을 할지 정합니다. 고친 뒤에는 같은 조건에서 실행시간과 Buffers를 Before/After로 비교합니다."
  - q: Nested Loop, Hash, Merge Join의 차이는?
    a: "Nested Loop는 바깥 행마다 안쪽을 탐색하므로 바깥이 작고 안쪽 조인 키에 인덱스가 있을 때 좋습니다. Hash Join은 작은 쪽으로 해시 테이블을 만들고 큰 쪽을 한 번 훑으며 맞춰 보는 방식이라 대용량 등가 조인에 강합니다. Merge Join은 양쪽을 정렬해 병합하므로 이미 정렬돼 있을 때 유리합니다. 종합실습 4에서 강제로 바꿔 보니 Hash 15.98ms, Merge 18.03ms, Nested Loop 34.34ms였습니다."
  - q: 인덱스가 있는데도 안 타는 대표적인 경우는?
    a: "WHERE YEAR(order_date) = 2024처럼 컬럼에 함수를 씌우거나, 정수 컬럼을 '123' 문자열과 비교해 타입 변환이 일어나거나, LIKE '%gmail.com'처럼 앞에 와일드카드가 있을 때입니다. 범위 조건으로 바꾸거나 함수 기반 인덱스를 만들고, 접미사 검색은 reverse 함수 인덱스나 pg_trgm GIN 인덱스로 해결합니다. 테이블의 상당 부분을 읽는 쿼리라면 옵티마이저가 일부러 Seq Scan을 고르기도 합니다."
related: [index-design, join-types, subquery-cte-view]
source: Day2 (7/28) 슬라이드 p.131–137 (JOIN 알고리즘, DBMS별 엔진, 튜닝 체크리스트), p.208–213 (최적화 원칙 미리보기), Day3 (7/29) p.262–269 (실행계획, EXPLAIN 읽기, 노드 타입), p.270–288 (안티패턴 8가지, Slow Query, 파티셔닝, 튜닝 체크리스트, Before/After), 종합실습 3 LAB A–E, 종합실습 4 조인 전략 비교
---

```flow
수집 :: pg_stat_statements, slow_query_log (예 1초 이상)
분석 :: EXPLAIN (ANALYZE, BUFFERS) — Seq Scan, rows 오차, Spill
인덱스 :: WHERE·JOIN·ORDER BY 컬럼, 복합 순서, 커버링
쿼리 개선 :: 함수 제거, 서브쿼리 → JOIN·CTE, N+1 → JOIN 한 번
아키텍처 :: Materialized View, 파티셔닝, Read Replica
```

| 노드 | 의미 | 판단 |
| --- | --- | --- |
| Seq Scan | 테이블 전체 순차 스캔 | 큰 테이블에서 소수 행만 찾으면 인덱스 검토 |
| Index Scan | 인덱스 탐색 + 테이블 랜덤 접근 | 좋음 |
| Index Only Scan | 인덱스만으로 처리 | 최고 (커버링 인덱스) |
| Bitmap Heap Scan | 인덱스로 비트맵 생성 후 블록 단위 접근 | 여러 인덱스 OR·AND 조합 (BitmapOr) |
| Hash / Nested Loop / Merge Join | 조인 방식 | 데이터 크기와 인덱스에 따라 |
| Sort | 결과 정렬 | ORDER BY 컬럼 인덱스로 제거 가능 |

- 숫자 읽기: `cost=시작..총` 예상 비용(단위 없음), `rows` 예상 행 수 vs `actual rows`, `Buffers: shared hit`(메모리) / `read`(디스크), `Rows Removed by Filter`가 크면 낭비
- 튜닝 안티패턴 8: SELECT *, 컬럼에 함수, 암묵적 타입 변환, `LIKE '%…'`, N+1 쿼리, NOT IN, DISTINCT 남용, 대용량 OFFSET
- MySQL은 인덱스 없는 조인에 BNL·BKA(join_buffer_size), 8.0.18부터 Hash Join / SQL Server는 실행 중 NL↔Hash를 바꾸는 Adaptive Join
- 파티셔닝(Range·List·Hash): WHERE에 파티션 키가 있으면 해당 파티션만 스캔(Pruning), 오래된 파티션은 DROP으로 즉시 삭제
- 파티셔닝 vs 샤딩: 한 인스턴스 안 논리 분할(JOIN 가능) vs 여러 인스턴스로 물리 분산(수평 확장, Cross-shard JOIN 어려움)
- DML을 EXPLAIN ANALYZE 하면 실제로 실행됨 → `BEGIN; … ROLLBACK;`으로 감싸기

> [!warn] 헷갈리기 쉬움
> OR 조건을 UNION ALL로 재작성하면 두 조건을 모두 만족하는 행이 두 번 세진다. 종합실습 3에서 dept=10(266건) + job IN (3,4,5)(3,733건) = 3,999건이지만 OR 결과는 3,981건. 결과가 같은지 먼저 검증하고, 컬럼별 인덱스가 있으면 BitmapOr가 OR를 그대로 최적화한다.
