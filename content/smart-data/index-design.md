---
title: 인덱스 설계
en: Index (B-Tree, Composite, Covering, Partial)
summary: "정렬된 별도 구조로 Full Scan(O(N)) 대신 O(log N)으로 행을 찾게 하는 객체. 읽기는 빨라지고 쓰기는 느려진다"
importance: 3
order: 9
tags: [인덱스, B-Tree, 복합 인덱스, 커버링 인덱스, 선택도]
keypoints:
  - 읽기는 빨라지지만 INSERT·UPDATE·DELETE마다 인덱스도 갱신된다
  - 복합 인덱스는 선두 컬럼부터, 등호(=) 조건 → 범위 조건 순서로
  - 컬럼에 함수·타입 변환·앞 와일드카드가 걸리면 인덱스를 못 탄다
qa:
  - q: 인덱스는 어떻게 동작하고, 많이 만들면 왜 안 되나요?
    a: "기본인 B-Tree는 모든 리프가 같은 깊이인 균형 트리라 O(log N)으로 찾고, 리프끼리 연결돼 있어 범위 검색에도 강합니다. 하지만 데이터가 바뀔 때마다 인덱스도 함께 갱신해야 해서 쓰기가 느려지고 저장 공간도 듭니다. 그래서 WHERE·JOIN·ORDER BY에 자주 쓰이고 선택도가 높은 컬럼 위주로 만들고, idx_scan이 0인 미사용 인덱스는 지웁니다."
  - q: 복합 인덱스의 컬럼 순서는 어떻게 정하나요?
    a: "복합 인덱스는 선두 컬럼부터 순서대로 조건이 있어야 쓰입니다. (customer_id, order_date) 인덱스는 customer_id 조건이 있을 때 타고, order_date만으로는 못 탑니다. 보통 등호 조건 컬럼을 앞에, 범위 조건 컬럼을 뒤에 두고, 정렬 컬럼까지 맞추면 Sort 단계도 없앨 수 있습니다."
  - q: 커버링 인덱스란?
    a: "쿼리에 필요한 컬럼이 모두 인덱스에 들어 있어 테이블(Heap)을 읽지 않고 인덱스만으로 답하는 것입니다. PostgreSQL에서는 INCLUDE로 반환용 컬럼을 덧붙이고, 실행계획에 Index Only Scan과 Heap Fetches 0이 나오면 성공입니다. SELECT *를 피해야 하는 이유 중 하나가 이것입니다."
related: [explain-tuning, relational-model-erd]
source: Day3 (7/29) 슬라이드 p.246–261 (트레이드오프, 설계 원칙, 종류 비교, 복합·커버링·부분·함수 기반 인덱스, DBMS별 차이, 선택도, 사용률 모니터링, B-Tree 구조), Day1 p.63–64 (물리 설계), 종합실습 3 LAB A–D
---

```formula
선택도 = 고유값 수 ÷ 전체 행 수 :: 1에 가까울수록 인덱스 효과가 큼 (email ≈ 1 좋음, 성별 0.5 나쁨)
```

| 인덱스 | 구조 | 잘 맞는 조건 |
| --- | --- | --- |
| B-Tree | 균형 트리 (기본) | =, 범위, `LIKE 'abc%'`, ORDER BY |
| Hash | 해시 테이블 | = 만 (범위 불가) |
| GIN | 역인덱스 | JSONB, 배열, 전문 검색, pg_trgm 중간 일치 |
| GiST | 일반화 검색 트리 | 지리정보(PostGIS), 범위 타입 |
| BRIN | 블록 범위 min·max | 물리적으로 쌓인 대용량 시계열 |
| Clustered | 데이터 자체를 키 순서로 저장 | PK 범위 스캔 (InnoDB, SQL Server) |

```sql
-- 복합: 선두 컬럼 원칙 (customer_id 없이 order_date만으로는 못 탐)
CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date DESC);
-- 커버링: 인덱스만으로 응답 → Index Only Scan
CREATE INDEX idx_email_cover ON users (email) INCLUDE (id, name);
-- 부분: 필요한 행만 인덱싱 → 크기·쓰기 비용 감소
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'PENDING';
-- 함수 기반: 종합실습 3 LAB A, lower(email) 검색 11.070ms → 0.027ms
CREATE INDEX idx_employees_lower_email ON employees ((lower(email)));
```

- 인덱스를 못 타는 패턴: `WHERE YEAR(order_date) = 2024`(→ 범위 조건으로), `WHERE int_col = '123'`(타입 변환), `LIKE '%gmail.com'`(→ reverse 함수 인덱스, pg_trgm GIN), 선두 컬럼 누락
- 실습 3 접미사 검색: `reverse()`를 IMMUTABLE 함수로 감싸 인덱스 생성 → `LIKE 'moc.liamg%'` 형태의 접두사 검색으로 변환
- B-Tree 키가 작을수록 노드당 항목이 많아 트리가 얕음 (UUID 16바이트 > BIGINT 8바이트), UPDATE가 잦으면 fillfactor를 낮춰 페이지 분할 감소
- 미사용 인덱스 확인: `pg_stat_user_indexes WHERE idx_scan = 0`, 재구성은 `REINDEX ... CONCURRENTLY`

> [!warn] 헷갈리기 쉬움
> PK는 인덱스가 자동으로 생기지만 FK는 PostgreSQL에서 자동 생성되지 않는다(MySQL InnoDB는 자동). JOIN과 ON DELETE CASCADE 성능을 위해 FK 컬럼 인덱스는 직접 만든다.
