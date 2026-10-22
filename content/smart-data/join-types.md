---
title: "JOIN 종류와 ON vs WHERE"
en: INNER, OUTER, SELF, CROSS, Semi · Anti Join
summary: "조건으로 두 테이블을 잇는 연산. 매칭만 남기는 INNER, 한쪽을 보존하는 OUTER, 존재만 확인하는 Semi·Anti"
importance: 3
order: 6
tags: [JOIN, OUTER JOIN, Anti-Join, SELF JOIN, Semi-Join]
keypoints:
  - INNER는 교집합, LEFT는 왼쪽 전부 + 짝이 없으면 NULL
  - LEFT JOIN 후 WHERE로 오른쪽을 거르면 사실상 INNER JOIN
  - 1:N 조인은 행이 N배로 늘어난다 → 집계 후 조인 또는 EXISTS
qa:
  - q: INNER JOIN과 LEFT OUTER JOIN의 차이는?
    a: "INNER JOIN은 양쪽에 모두 매칭되는 행만 반환합니다. LEFT JOIN은 왼쪽 테이블의 모든 행을 유지하고 오른쪽에 짝이 없으면 NULL로 채웁니다. 종합실습 2에서 수강 기록이 없는 학생까지 보려면 student LEFT JOIN enroll을 썼고, 수강 없는 학생만 고를 때는 여기에 WHERE e.student_id IS NULL을 붙였습니다."
  - q: OUTER JOIN에서 조건을 ON에 쓰는 것과 WHERE에 쓰는 것은 어떻게 다른가요?
    a: "ON 조건은 조인하는 과정에 적용되어 왼쪽 행은 그대로 보존되고 짝만 NULL이 됩니다. WHERE는 조인이 끝난 뒤 행을 거르므로, 오른쪽 컬럼 조건을 WHERE에 쓰면 NULL 행이 모두 빠져 사실상 INNER JOIN이 됩니다. 모든 학생을 보면서 특정 과목 성적만 붙이려면 ON e.student_id = s.id AND e.course_id = 1처럼 ON에 넣어야 합니다."
  - q: 한 번도 수강하지 않은 학생은 어떻게 찾나요?
    a: "LEFT JOIN 후 IS NULL, NOT EXISTS, NOT IN 세 가지가 있습니다. 권장은 NOT EXISTS로, 존재 여부만 확인해 빠르고 NULL에 안전합니다. NOT IN은 서브쿼리 결과에 NULL이 하나라도 있으면 전체 결과가 빈 집합이 되는 함정이 있습니다."
related: [subquery-cte-view, explain-tuning, group-by-having, python-data/pandas-essentials]
source: Day2 (7/28) 슬라이드 p.138–145 (JOIN 종류, SELF·CROSS·Anti-Join, 실무 집계 JOIN, 주의사항), p.183–190 (ON vs WHERE, Semi-Join, 결과 행 수 예측, 실수 패턴), 종합실습 2 문항 1–13·17–19
---

```compare
조건을 ON에 | 조건을 WHERE에
적용 시점 | 조인하는 중 | 조인이 끝난 뒤
왼쪽 행 | 모두 보존, 짝만 NULL | 오른쪽이 NULL인 행은 탈락
결과 | LEFT JOIN 유지 | 사실상 INNER JOIN
쓰는 경우 | 모든 학생 + 특정 과목 성적 | 일부러 거를 때, Anti-Join(IS NULL)
```

```sql
-- 종합실습 2: 수강 없는 학생 (Anti-Join) — 두 쿼리 결과 동일
SELECT st.student_id, st.name
FROM student st LEFT JOIN enroll e ON e.student_id = st.student_id
WHERE e.student_id IS NULL;

SELECT student_id, name FROM student st
WHERE NOT EXISTS (SELECT 1 FROM enroll e WHERE e.student_id = st.student_id);

-- SELF JOIN: 직원과 매니저 이름 (매니저 없는 CEO도 남기려고 LEFT)
SELECT e.name AS employee_name, m.name AS manager_name
FROM emp e LEFT JOIN emp m ON m.emp_id = e.manager_id;
```

- 행 수 감각 (A 5행, B 3행, 매칭 2): INNER 2 · LEFT 5 · RIGHT 3 · FULL 6(5 + 3 − 2) · CROSS 15 · Anti 3
- RIGHT JOIN은 LEFT로 방향을 바꿔 쓰는 게 관례, FULL OUTER는 MySQL 미지원 → LEFT UNION RIGHT로 우회
- CROSS JOIN = N × M 조합 (실습: 학생 × 과목 추천 후보, LIMIT 100) — ON 누락 실수도 같은 결과라 EXPLAIN의 actual rows로 확인
- Semi-Join: "있기만 하면" → EXISTS·IN. JOIN + DISTINCT로 쓰면 매칭 수만큼 중복이 생겼다가 제거됨
- 비등가 조인도 가능: 실습 19 `JOIN student ot ON ABS(hr.gpa - ot.gpa) < 0.1`
- 5개 테이블을 조인하면 ON 조건은 4개, FK 컬럼에는 반드시 인덱스

> [!warn] 헷갈리기 쉬움
> 1:N 조인 후 바로 SUM·COUNT 하면 N배로 부풀려진다. COUNT(*)가 이상하게 크면 중복 조인을 의심하고, 서브쿼리에서 먼저 집계한 뒤 조인하거나 EXISTS로 바꾼다.
