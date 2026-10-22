---
title: "서브쿼리 · CTE · View"
en: Subquery, EXISTS vs IN, CTE, View, Materialized View
summary: "쿼리 안의 쿼리(서브쿼리), 중간 결과에 이름을 붙이는 CTE, 쿼리를 저장해 재사용하는 View·Materialized View"
importance: 3
order: 7
tags: [서브쿼리, EXISTS, 집합 연산, CTE, 재귀 CTE, View, Materialized View]
keypoints:
  - NOT IN은 서브쿼리에 NULL이 하나만 있어도 빈 결과 → NOT EXISTS
  - 상관 서브쿼리는 행마다 반복 실행 → CTE·JOIN·윈도우 함수로 대체
  - View는 저장 안 함(항상 최신), MV는 결과 저장(빠름, REFRESH 필요)
qa:
  - q: EXISTS와 IN의 차이는? NOT IN은 왜 위험한가요?
    a: "IN은 서브쿼리 결과 목록에 값이 들어 있는지 보고, EXISTS는 조건에 맞는 행이 하나라도 있는지만 확인하고 멈춥니다. NOT IN은 목록에 NULL이 하나라도 있으면 비교가 모두 UNKNOWN이 되어 결과가 빈 집합이 됩니다. 그래서 '없는 것 찾기'는 NULL에 안전한 NOT EXISTS를 권장하고, 실행계획에서는 Anti Join으로 최적화됩니다."
  - q: View와 Materialized View의 차이는?
    a: "View는 쿼리 정의만 저장해서 조회할 때마다 원본에서 다시 실행하므로 항상 최신이지만 무거운 집계는 느립니다. Materialized View는 결과를 디스크에 저장해 인덱스도 걸 수 있고 빠르지만 REFRESH 전까지는 옛 데이터입니다. 종합실습 4에서 일별 매출 mv_daily_gmv로 조회가 14.48ms에서 0.042ms로 줄었고, 유니크 인덱스를 만들어 REFRESH CONCURRENTLY로 조회를 막지 않고 갱신하도록 설계했습니다."
  - q: CTE는 언제 쓰나요?
    a: "WITH 절로 중간 결과에 이름을 붙여 복잡한 쿼리를 단계별로 나눌 때 씁니다. 같은 집계를 여러 번 참조하거나, WITH RECURSIVE로 조직도·카테고리 트리 같은 계층을 탐색할 때 특히 유용합니다. 재귀 CTE에는 깊이 제한 같은 종료 조건을 함께 두어 무한 재귀를 막습니다."
related: [join-types, window-functions, explain-tuning]
source: Day2 (7/28) 슬라이드 p.146–150 (서브쿼리 유형, EXISTS·IN·ANY·ALL, UNION·INTERSECT·EXCEPT), p.151–156 (CTE, 재귀 CTE, View·MV 비교), p.177 (집합 연산자 DBMS 비교), p.191–196 (상관 서브쿼리 최적화, CTE MATERIALIZED, PIVOT, 선택 기준), 종합실습 2 문항 14–22, 종합실습 4 Materialized View
---

```compare
View | Materialized View | CTE
저장 | 정의만 | 결과를 디스크에 | 안 함 (쿼리 안 임시)
최신성 | 항상 최신 | REFRESH 시점까지 | 실행 시점
인덱스 | 불가 | 가능 | 불가
재사용 | 여러 쿼리 | 여러 쿼리 | 그 쿼리 안에서만
용도 | 권한 제어, 인터페이스 고정 | 대시보드, 집계 캐시 | 복잡한 쿼리 분해, 재귀
```

```sql
-- 종합실습 2-22: CEO → 매니저 10 → 개발자 300 조직 트리
WITH RECURSIVE org_tree AS (
  SELECT emp_id, name, manager_id, 0 AS depth, name::TEXT AS path
  FROM emp WHERE manager_id IS NULL                         -- Anchor: CEO
  UNION ALL
  SELECT e.emp_id, e.name, e.manager_id, t.depth + 1, t.path || ' > ' || e.name
  FROM emp e JOIN org_tree t ON t.emp_id = e.manager_id     -- 재귀 단계
)
SELECT emp_id, name, depth, path FROM org_tree ORDER BY path;
```

- 서브쿼리 위치: 스칼라(SELECT 절, 값 1개, 행마다 실행) / 인라인 뷰(FROM 절, 임시 테이블처럼) / WHERE 절(=, IN, ANY, ALL, EXISTS) / 상관(바깥 컬럼 참조)
- `> ANY (…)` = 최솟값보다 크다, `> ALL (…)` = 최댓값보다 크다
- 상관 서브쿼리 "학과 평균보다 높은 학생"은 행 수 × 내부 쿼리 비용 → 학과 평균을 CTE로 한 번 집계 후 JOIN, 또는 `AVG() OVER (PARTITION BY)`
- 집합 연산: UNION(중복 제거 = 정렬·해시 비용) vs UNION ALL(빠름), INTERSECT(교집합), EXCEPT(차집합, Oracle은 MINUS)
- PostgreSQL 12+ CTE는 기본 인라인(NOT MATERIALIZED), 여러 번 참조하는 비싼 집계는 `AS MATERIALIZED`로 한 번만 실행
- MV 갱신은 자동이 아님 → pg_cron이나 외부 스케줄러, `REFRESH ... CONCURRENTLY`는 유니크 인덱스 필요

> [!tip] 면접 팁
> 선택 기준을 한 줄로: 단순 존재 확인은 EXISTS, 단계가 3겹 이상이거나 재사용·재귀면 CTE, 원래 행을 유지한 채 집계가 필요하면 윈도우 함수, 두 테이블 컬럼을 함께 보려면 JOIN.
