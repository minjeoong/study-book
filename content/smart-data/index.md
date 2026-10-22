---
summary: "관계형 DB 설계(ERD·정규화)부터 SQL(JOIN·서브쿼리·윈도우 함수), 성능(인덱스·실행계획·트랜잭션), 운영(보안·백업·Cloud DB)까지 PostgreSQL로 실습한 4일 과정"
keywords: [ACID, WAL, PK, FK, ERD, 정규화, DDL, DML, GROUP BY, HAVING, JOIN, Anti-Join, 서브쿼리, EXISTS, CTE, Materialized View, 윈도우 함수, 인덱스, 실행계획, EXPLAIN ANALYZE, 격리 수준, MVCC, Deadlock, Stored Procedure, Trigger, OLTP, OLAP, SQL Injection, PITR, RPO, RTO]
materials:
  - file: slides-smart-data-sql.pdf
    title: "강의 슬라이드 — 스마트 데이터 이해 및 활용 (SQL)"
    type: slides
    date: 2026-07-27
  - file: submission-day1-sql-lab.pdf
    title: "과제 제출 — 종합실습 1"
    type: etc
    date: 2026-07-27
  - file: lab-day2-postgres-join-part1.sql
    title: "실습 — 종합실습 2 PostgreSQL JOIN 스크립트 1"
    type: lab
    date: 2026-07-28
  - file: lab-day2-postgres-join-part2.sql
    title: "실습 — 종합실습 2 PostgreSQL JOIN 스크립트 2"
    type: lab
    date: 2026-07-28
  - file: lab-day2-postgres-join-psql.sql
    title: "실습 — 종합실습 2 PostgreSQL JOIN 스크립트 (psql용)"
    type: lab
    date: 2026-07-28
  - file: lab-day2-postgres-join-hints.pdf
    title: "실습 — 종합실습 2 힌트"
    type: lab
    date: 2026-07-28
  - file: submission-day2-postgres-join.pdf
    title: "과제 제출 — 종합실습 2 (PostgreSQL JOIN)"
    type: etc
    date: 2026-07-28
  - file: lab-day3-hr-db-setup.sql
    title: "실습 — 종합실습 3 HR DB 환경설정 스크립트"
    type: lab
    date: 2026-07-29
  - file: lab-day3-hr-db-setup-psql.sql
    title: "실습 — 종합실습 3 HR DB 환경설정 스크립트 (psql용)"
    type: lab
    date: 2026-07-29
  - file: submission-day3-hr-db.pdf
    title: "과제 제출 — 종합실습 3 (HR DB)"
    type: etc
    date: 2026-07-29
  - file: lab-day4-ecom-schema.sql
    title: "실습 — 종합실습 4 이커머스 테이블 생성"
    type: lab
    date: 2026-07-30
  - file: lab-day4-ecom-seed.sql
    title: "실습 — 종합실습 4 이커머스 데이터 입력"
    type: lab
    date: 2026-07-30
  - file: submission-day4-ecom.pdf
    title: "과제 제출 — 종합실습 4 (이커머스 DB)"
    type: etc
    date: 2026-07-30
---

## 한눈에 보기

```flow
설계 :: 요구사항 → ERD → 정규화 → 테이블 (PK·FK·제약조건)
기본 SQL :: DDL로 만들고 DML로 넣고 SELECT로 조회
분석 SQL :: 집계 · JOIN · 서브쿼리 · CTE · 윈도우 함수
성능 :: 인덱스 → 실행계획 → 튜닝, 트랜잭션 격리 · Lock
운영 :: SP · 트리거, 보안 · 백업 · HA, Cloud · 분석 DB
```

- Day1은 "데이터를 어떤 구조로 저장할지"(ACID, 관계형 모델, ERD, 정규화)와 DDL·DML 기초, Day2는 "원하는 결과를 어떻게 꺼낼지"(집계, JOIN, 서브쿼리, 윈도우 함수)를 다룸
- Day3은 "왜 느리고 어떻게 빠르게 하나"(인덱스, 실행계획, 튜닝)와 동시성(MVCC, 격리 수준, Deadlock), Day4는 DB 프로그래밍·Cloud·보안·백업 등 운영 관점
- 매일 PostgreSQL 종합실습으로 마무리: 학사관리 설계 → JOIN 25문항 → HR DB 튜닝 → 이커머스 매출 분석
- 관통 메시지: 설계 단계 결정(정규화 수준, PK·인덱스)이 성능에 가장 큰 영향을 주고, 모든 개선은 EXPLAIN ANALYZE로 Before/After를 확인한다

## 수업 흐름

**Day1 (7/27) DB 개요 · 관계형 모델 · SQL 기초** — 슬라이드 p.1–116

- DB 개요 — 파일 시스템 → 계층형 → RDBMS → NoSQL → NewSQL·Cloud, ACID, DBMS별 ACID 차이, WAL·Consensus, 격리 수준과 Phantom Read 미리보기
- 관계형 모델 — 테이블·PK·FK·UK, FK 옵션(CASCADE·SET NULL·RESTRICT), 관계 1:1·1:N·N:M, SQL vs NoSQL, 정규화 1NF~BCNF와 이상 현상
- ERD — 엔티티·속성·관계, 작성 단계, IE(까마귀발) 표기법, dbdiagram.io DBML
- 개념→논리→물리 설계 — 물리 설계 항목(타입·인덱스·파티셔닝), 낙관적/비관적 Lock, 약한 엔티티, N:M 교차 테이블
- 스키마 전략(Silo·Pool·Bridge) & RDBMS 비교 — MySQL·PostgreSQL·Oracle·SQL Server·Cloud DB, ANSI SQL 표준과 벤더별 문법
- SQL 기초 — CREATE DATABASE/TABLE, 데이터 타입, 제약조건, ALTER / INSERT·UPDATE·DELETE, SELECT 논리적 실행 순서, 문자열·날짜·NULL 함수, WHERE 패턴
- 종합실습 1 — 학사관리시스템 DB 설계 → 구축 → 조회

**Day2 (7/28) 집계 · JOIN · 서브쿼리 · 윈도우 함수** — 슬라이드 p.117–244

- Day1 복습, DBMS vs Data Warehouse vs Data Mining, MSA 환경 DB 연동(Kafka·Elasticsearch·Redis)
- 집계 — 집계 함수, GROUP BY·HAVING, ROLLUP·CUBE·GROUPING, FILTER 절, 집계 성능 포인트
- JOIN 알고리즘 — Nested Loop·Hash·Sort-Merge·BNL/BKA, DBMS별 엔진, EXPLAIN으로 확인
- JOIN 종류 — INNER·LEFT·RIGHT·FULL·SELF·CROSS, Anti-Join 3가지, 실무 집계 JOIN, 주의사항
- 서브쿼리 & 집합 연산 — 스칼라·인라인 뷰·상관 서브쿼리, EXISTS·IN·ANY·ALL, UNION·INTERSECT·EXCEPT
- CTE · View · Materialized View — WITH, 재귀 CTE, View vs MV vs CTE
- 윈도우 함수 — ROW_NUMBER·RANK·DENSE_RANK·NTILE, LAG·LEAD, 누적합·이동평균, 코호트, Gap & Island
- [참고] LATERAL, UPSERT, STRING_AGG·JSON_AGG, 트랜잭션 제어, Keyset 페이지네이션, ON vs WHERE, Semi-Join, PIVOT, ROWS vs RANGE, Top-N per Group, JSONB, pgvector 하이브리드 검색, 튜닝 안티패턴 미리보기
- 종합실습 2 — JOIN + 서브쿼리 + 윈도우 함수 25문항

**Day3 (7/29) 인덱스 · 실행계획 · 트랜잭션 · 고급 설계** — 슬라이드 p.245–346

- 인덱스 — 트레이드오프, B-Tree·Hash·GIN·GiST·BRIN, 복합·커버링·부분·함수 기반 인덱스, 선택도, 미사용 인덱스 정리
- 실행계획 — EXPLAIN vs EXPLAIN ANALYZE, 플랜 읽기, 노드 타입
- SQL 튜닝 — 안티패턴 8가지, Slow Query 수집(slow_query_log, pg_stat_statements), 파티셔닝, Before/After 비교
- MVCC & 격리 수준 — xmin·xmax와 Undo Log, RC·RR·Serializable 실습, 실무 적용 가이드
- Lock & Deadlock — Row Lock, FOR UPDATE·NOWAIT·SKIP LOCKED, 데드락 감지·해소(순서 통일, Advisory Lock, 재시도)
- 고급 DB 설계 — BCNF·4NF·5NF, 정규화 vs 반정규화, SCD, 샤딩, MSA DB 패턴(Saga·CQRS·Outbox)
- [참고] 백업·복구, VACUUM과 Table Bloat, pgBouncer, 모니터링 쿼리, 성능 최적화 4단계
- 종합실습 3 — HR DB 느린 쿼리 최적화

**Day4 (7/30) DB 프로그래밍 · Cloud · 보안 · 운영** — 슬라이드 p.347–481

- Stored Procedure & 함수 — SP vs 함수, 4개 DBMS 문법, DEFINER·INVOKER, IMMUTABLE·DETERMINISTIC, 에러 처리
- Trigger & 이벤트 — 감사 로그, row·statement 트리거, DBMS 비교, 배치·알림·CDC, Event Trigger, LISTEN/NOTIFY
- Cloud DB — On-Prem vs DBaaS, RDS vs Aurora, Cloud SQL·Azure, 선택 프레임워크 / 서버리스·분산(Aurora Serverless v2, Spanner, Cosmos DB, Neon)
- 데이터 웨어하우스 — OLTP vs OLAP, 파티션·컬럼 프루닝, 벡터화 실행, 스타 스키마, BigQuery·Snowflake·ClickHouse
- 트렌드 — NewSQL(CockroachDB·TiDB), TimescaleDB, Vector DB와 pgvector RAG, 목적별 DB 선택
- 보안 — 인증·인가, Role·GRANT, Row-Level Security, SQL Injection, TLS·TDE·컬럼 암호화, 최소 권한
- 백업·복구 & HA — 백업 유형, PITR, Streaming Replication, Failover, RPO·RTO / 모니터링 — TPS·QPS·Latency, Prometheus·Grafana, 알람
- 종합실습 4 — 이커머스 매출 분석 + 실행계획 개선

## 실습 정리

**종합실습 1 (7/27) — 학사관리시스템 DB 설계 · 구축 · 조회**

- 환경: Homebrew PostgreSQL 17 + DBeaver, `skala_db` 생성, `app`·`audit` 스키마
- 설계: professors · courses · students · registration 4테이블. 교수-강좌 1:N, registration이 학생-강좌 N:M을 푸는 교차 테이블
- 제약조건으로 규칙을 DB가 강제: 학점 1~3·학년 1~4 CHECK, 담당 강좌가 남은 교수는 삭제 불가(ON DELETE RESTRICT), 수강신청은 (student_id, course_id) 복합 PK + CASCADE, 점수는 NULL(미채점) 또는 0~100
- 조회: WHERE·ORDER BY, COALESCE('이메일 미등록'), CASE WHEN 학년 라벨, AGE·EXTRACT 재학연수, registration 중심 4테이블 JOIN

```sql
SELECT name, admission_date,
       EXTRACT(YEAR FROM AGE(CURRENT_DATE, admission_date)) AS 재학연수
FROM students;
```

**종합실습 2 (7/28) — PostgreSQL JOIN · 서브쿼리 · 윈도우 함수 25문항**

- 데이터(`lab` 스키마): student 1,000명(CS·EE·ME·CE·BIO, 981~1000번은 HR) / enroll 학생당 0~3건(10의 배수 학번은 수강 없음) + 고아 수강 2건(1001, 1010) / customers 500 · orders 3,000 / emp CEO 1 → Mgr 10 → Dev 300
- 1–13: INNER·LEFT·RIGHT·FULL OUTER, Anti-Join(LEFT JOIN + IS NULL), SELF JOIN(직원-매니저), CROSS JOIN 추천 후보 100건, course_owner 매핑 리포트
- 14–20: 스칼라·WHERE·상관 서브쿼리, EXISTS / NOT EXISTS, 비등가 Self Join(`ABS(hr.gpa - ot.gpa) < 0.1`), UNION
- 21–25: ROLLUP + GROUPING 소계, WITH RECURSIVE 조직 트리(depth·path), 학과별 Top3(ROW_NUMBER·RANK·DENSE_RANK), LAG로 성적 변화, 누적합·3개 이동평균

```sql
-- 25: 누적 주문금액이 전체 합의 50%를 처음 넘는 order_id
WITH cum AS (
  SELECT order_id,
         SUM(amount) OVER (ORDER BY order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_total,
         SUM(amount) OVER () AS total_sum
  FROM orders
)
SELECT order_id FROM cum
WHERE cum_total >= total_sum * 0.5
ORDER BY order_id LIMIT 1;
```

**종합실습 3 (7/29) — HR DB 느린 쿼리 최적화 (employees 5만 건)**

- 데이터(`hr` 스키마): locations 50 · departments 200 · jobs 40 · employees 50,000(20%는 최근 1년 입사, 5%는 INACTIVE) · job_history
- 방법: 같은 쿼리를 2번 실행해 콜드 캐시 영향을 빼고, 실행시간과 Buffers(shared hit)를 함께 비교

| 문항 | 튜닝 방법 | Before → After |
| --- | --- | --- |
| lower(email) 검색 | 함수 기반 인덱스 `((lower(email)))` | 11.070ms → 0.027ms (Seq Scan → Index Scan) |
| 같은 조건, 다른 방법 | 생성 컬럼(STORED) + B-Tree | 6.039ms → 0.029ms |
| `LIKE '%gmail.com'` | IMMUTABLE reverse() 함수 인덱스 | 6.961ms → 4.469ms |
| OFFSET 12000 페이지 | Keyset (`employee_id > :last_id`) | 10.757ms → 0.035ms |
| 최근 1년 · ACTIVE · 급여 Top100 | 복합 인덱스 (status, salary DESC) | 14.379ms → 0.486ms (Sort 제거) |
| 같은 조건, 다른 방법 | 부분 인덱스 `WHERE status = 'ACTIVE'` | 14.444ms → 6.177ms, 인덱스 1,576kB → 1,056kB |
| `dept = 10 OR job IN (3,4,5)` | 단일 인덱스 2개 → BitmapOr | 6.488ms → 1.156ms |

**종합실습 4 (7/30) — 이커머스 매출 분석 (`ecom` 스키마)**

- 스키마: customers 3,000 · products 600 · 카테고리 트리 14개 · orders · order_items(`line_total` 생성 컬럼) · product_prices(SCD2 이력 + EXCLUDE 제약으로 기간 겹침 방지) · inventory · reviews · payments · shipments
- Q1–Q11: 실매출 = paid·shipped·delivered, 월별 주문 수·매출·AOV, 최근 90일 카테고리 Top10, 제품 누적매출 RANK Top20, RFM, 첫 구매 후 30일 재구매율, 재고 임계치, 효자상품(HAVING 리뷰 50개↑ · 평점 4.5↑), 쿠폰 사용 AOV 비교, 상위 1%(NTILE(100)) 최근 60일 매출, safe_div 함수
- 조인 전략 강제 비교(enable_hashjoin 등 off): Hash 15.98ms·467 buffers / Merge 18.03ms·575 / Nested Loop + Memoize 34.34ms·49,374 → 기본 플랜(Hash)이 최적
- Materialized View `mv_daily_gmv`: 원본 JOIN+SUM 14.480ms → MV 조회 0.042ms, 유니크 인덱스 + 매일 15시 `REFRESH ... CONCURRENTLY`
- 복습 메모: orders Seq Scan 병목(필터로 10,149행 버림)에는 `(order_status, order_ts)` 복합 인덱스가 직접적인 처방

```sql
-- Q2: 월별 주문 수 · 매출 · AOV (1:N 조인으로 늘어난 행은 DISTINCT로 세기)
SELECT to_char(date_trunc('month', o.order_ts), 'YYYY-MM') AS order_month,
       COUNT(DISTINCT o.order_id) AS order_cnt,
       SUM(oi.line_total)         AS total_revenue,
       ROUND(SUM(oi.line_total) / NULLIF(COUNT(DISTINCT o.order_id), 0), 2) AS aov
FROM ecom.orders o
JOIN ecom.order_items oi ON oi.order_id = o.order_id
WHERE o.order_status IN ('paid', 'shipped', 'delivered')
GROUP BY date_trunc('month', o.order_ts)
ORDER BY order_month;
```
