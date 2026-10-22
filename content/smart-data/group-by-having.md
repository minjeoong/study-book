---
title: "집계 함수와 GROUP BY · HAVING"
en: Aggregation, GROUP BY, HAVING, ROLLUP
summary: "행을 그룹으로 묶어 COUNT·SUM·AVG로 요약하는 것. 집계 전 필터는 WHERE, 집계 후 필터는 HAVING"
importance: 3
order: 5
tags: [집계, GROUP BY, HAVING, ROLLUP, 페이지네이션]
keypoints:
  - WHERE는 집계 전 행 필터, HAVING은 집계 후 그룹 필터
  - COUNT(*)는 NULL 포함, COUNT(col)·SUM·AVG는 NULL 제외
  - ROLLUP은 계층 소계, CUBE는 모든 조합 소계, GROUPING()으로 구분
qa:
  - q: WHERE와 HAVING의 차이는?
    a: "WHERE는 GROUP BY 전에 개별 행을 거르고, HAVING은 GROUP BY 후 집계 결과로 그룹을 거릅니다. 그래서 'COUNT(*) >= 3' 같은 집계 조건은 HAVING에만 쓸 수 있습니다. 집계와 무관한 조건은 WHERE에 두어야 집계할 행 자체가 줄어 빠릅니다."
  - q: COUNT(*)와 COUNT(컬럼)의 차이는?
    a: "COUNT(*)는 NULL을 포함한 전체 행 수, COUNT(컬럼)은 그 컬럼이 NULL이 아닌 행 수입니다. 그래서 LEFT JOIN 후 고객별 주문 수를 셀 때는 COUNT(o.order_id)를 써야 주문 없는 고객이 1이 아니라 0으로 나옵니다. AVG도 NULL을 빼고 계산하므로 NULL을 0으로 볼지 먼저 정해야 합니다."
  - q: OFFSET 페이지네이션이 느린 이유와 대안은?
    a: "LIMIT 10 OFFSET 100000은 앞의 10만 행을 읽고 버린 뒤 10행을 돌려주므로 뒤 페이지일수록 느려집니다. 마지막으로 본 id를 기억해 WHERE id > :last_id ORDER BY id LIMIT 10으로 조회하는 Keyset(Cursor) 방식은 인덱스로 바로 찾아가 페이지와 무관하게 빠릅니다. 대신 임의 페이지로 점프하기 어려워 무한 스크롤에 맞고, 종합실습 3에서는 10.757ms가 0.035ms로 줄었습니다."
related: [sql-basics, join-types, window-functions]
source: Day2 (7/28) 슬라이드 p.118–122 (Day1 복습), p.123–130 (집계 함수, GROUP BY·HAVING, ROLLUP·CUBE, 집계 성능 포인트), p.182 (Keyset 페이지네이션), p.206 (DBMS별 집계 함수), p.232–233 (ONLY_FULL_GROUP_BY), 종합실습 2 문항 7·8·10·21, 힌트 PDF
---

```compare
WHERE | HAVING
시점 | GROUP BY 전 | GROUP BY 후
대상 | 개별 행 | 그룹 (집계 결과)
집계 함수 | 못 씀 | 씀 (COUNT(*) >= 3)
예 | hire_date >= '2020-01-01' | AVG(salary) >= 5000
```

```sql
-- 종합실습 2-21: 학과별 · GPA 구간별 인원 + 학과 소계 + 전체 합계를 한 번에
SELECT CASE GROUPING(major)    WHEN 1 THEN '전체' ELSE major    END AS major,
       CASE GROUPING(gpa_tier) WHEN 1 THEN '소계' ELSE gpa_tier END AS gpa_tier,
       COUNT(*) AS cnt, AVG(gpa)::NUMERIC(4,2) AS avg_gpa
FROM (SELECT *, CASE WHEN gpa < 3.0 THEN 'C' WHEN gpa <= 3.5 THEN 'B' ELSE 'A' END AS gpa_tier
      FROM student) t
GROUP BY ROLLUP(major, gpa_tier)
ORDER BY GROUPING(major), major, GROUPING(gpa_tier), gpa_tier;   -- 소계 행은 아래로
```

- ROLLUP(region, product): (지역, 상품) → 지역 소계 → 전체 합계 / CUBE는 상품별 소계까지 모든 조합 (느림)
- 소계 행의 NULL은 `GROUPING(col) = 1`로 실제 NULL과 구분해 '전체'·'소계' 라벨을 붙임
- 조건부 집계: PostgreSQL `COUNT(*) FILTER (WHERE score >= 80)`, 다른 DBMS는 `SUM(CASE WHEN score >= 80 THEN 1 ELSE 0 END)`
- SELECT에는 GROUP BY 키나 집계 함수만 (MySQL `ONLY_FULL_GROUP_BY` 에러, PostgreSQL은 PK로 묶으면 그 테이블 컬럼 허용)
- 문자열 집계: `STRING_AGG`(PG·SQL Server), `GROUP_CONCAT`(MySQL), `LISTAGG`(Oracle)
- 자주 쓰는 대용량 집계는 집계 테이블이나 Materialized View로 미리 계산

> [!warn] 헷갈리기 쉬움
> 1:N 조인 뒤 집계하면 행이 늘어난 만큼 숫자가 부풀려진다. 종합실습 4에서는 orders × order_items 조인 후 주문 수를 `COUNT(DISTINCT o.order_id)`로 셌다.
