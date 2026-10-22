---
title: 윈도우 함수
en: Window Functions (ROW_NUMBER, RANK, LAG, Running Total)
summary: "행을 줄이지 않고 각 행 옆에 순위·이전 값·누적합을 붙이는 함수. OVER(PARTITION BY … ORDER BY …)"
importance: 3
order: 8
tags: [윈도우 함수, RANK, LAG, 누적합, 이동평균, Top-N]
keypoints:
  - GROUP BY는 행이 줄고, 윈도우 함수는 원래 행을 유지한다
  - ROW_NUMBER 1,2,3,4 / RANK 1,2,2,4 / DENSE_RANK 1,2,2,3
  - ROWS는 물리적 행 개수, RANGE는 ORDER BY 값 범위 기준 프레임
qa:
  - q: GROUP BY와 윈도우 함수의 차이는?
    a: "GROUP BY는 그룹당 한 행으로 접혀 개별 행 정보가 사라집니다. 윈도우 함수는 OVER(PARTITION BY ...)로 같은 범위를 묶어 계산하되 원래 행은 그대로 두고 결과를 옆 컬럼으로 붙입니다. 그래서 각 직원 급여와 부서 평균을 함께 보거나 학과별 순위를 매길 때 씁니다."
  - q: ROW_NUMBER, RANK, DENSE_RANK의 차이는?
    a: "동점 처리가 다릅니다. 같은 값이 둘이면 ROW_NUMBER는 1,2,3,4처럼 무조건 고유 번호를, RANK는 1,2,2,4처럼 같은 순위 뒤 번호를 건너뛰고, DENSE_RANK는 1,2,2,3처럼 건너뛰지 않습니다. 종합실습 4의 제품 매출 Top20은 동점 제품을 빠뜨리지 않으려고 RANK()와 WHERE rank <= 20을 썼습니다."
  - q: 그룹별 Top-N은 어떻게 구하나요?
    a: "ROW_NUMBER() OVER (PARTITION BY 그룹 ORDER BY 기준 DESC)로 그룹 안 순번을 매긴 뒤 서브쿼리나 CTE로 감싸 rn <= N으로 거릅니다. 윈도우 함수는 WHERE보다 늦게 계산되므로 같은 SELECT의 WHERE에서는 바로 쓸 수 없기 때문입니다. PostgreSQL에서는 LATERAL JOIN + ORDER BY ... LIMIT N으로도 풀 수 있습니다."
related: [group-by-having, subquery-cte-view]
source: Day2 (7/28) 슬라이드 p.157–168 (GROUP BY와 차이, 순위·LAG/LEAD·누적합·이동평균, 코호트, Gap & Island, DBMS 지원), p.170 (LATERAL), p.197–204 (ROWS vs RANGE, NTILE·PERCENT_RANK·FIRST/LAST_VALUE, 코호트 분석), p.219–221 (Top-N per Group 3가지), 종합실습 2 문항 23–25, 종합실습 4 Q4·Q10
---

```layers
함수 :: ROW_NUMBER · RANK · DENSE_RANK · NTILE / LAG · LEAD · FIRST_VALUE / SUM · AVG · COUNT
OVER ( ) :: 윈도우 정의, 비워 두면 전체 행이 하나의 윈도우
PARTITION BY :: 계산 단위 (학과별, 고객별), GROUP BY처럼 묶지만 행은 유지
ORDER BY :: 윈도우 안 순서 (순위, 이전·다음 행의 기준)
ROWS / RANGE BETWEEN :: 프레임 (누적합, 최근 3개 이동평균의 범위)
```

```sql
-- 종합실습 2-23: 학과별 GPA 상위 3명 (동점은 student_id로 2차 정렬)
WITH ranked AS (
  SELECT student_id, name, major, gpa,
         ROW_NUMBER() OVER (PARTITION BY major ORDER BY gpa DESC, student_id) AS rn,
         RANK()       OVER (PARTITION BY major ORDER BY gpa DESC) AS rnk,
         DENSE_RANK() OVER (PARTITION BY major ORDER BY gpa DESC) AS drk,
         COUNT(*)     OVER (PARTITION BY major) AS total_in_major
  FROM student
)
SELECT * FROM ranked WHERE rn <= 3 ORDER BY major, rn;

-- 2-25: 누적합 · 최근 3개 이동평균 · 고객별 누적
SELECT order_id, customer_id, amount,
       SUM(amount) OVER (ORDER BY order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_total,
       AVG(amount) OVER (ORDER BY order_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)         AS moving_avg_3,
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_id)                        AS customer_cum
FROM orders;
```

- LAG(col, 1)·LEAD: 전월 대비 증감(MoM), `LAG(revenue, 12)`는 YoY, 증감률 나눗셈은 `NULLIF(prev, 0)`로 0 나누기 방지
- 실습 2-24: 성적을 CASE로 A=4…D=1 변환 → `LAG(score) OVER (PARTITION BY student_id ORDER BY course)`로 상승·유지·하락
- LAST_VALUE는 기본 프레임이 '처음 ~ 현재 행'이라 파티션 끝 값을 보려면 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` 명시
- NTILE(n) 균등 분할: 실습 4 Q10에서 `NTILE(100)`의 1구간 = 상위 1% 고객 / PERCENT_RANK = (rank − 1) ÷ (전체 − 1)
- Gap & Island: `날짜 − ROW_NUMBER()`가 같으면 연속 구간 → 연속 로그인 일수, 연속 품절 기간
- 비율: `COUNT(*) / SUM(COUNT(*)) OVER ()`처럼 집계 결과 위에 윈도우를 다시 씌울 수 있음

> [!warn] 헷갈리기 쉬움
> `WHERE salary > AVG(salary) OVER (PARTITION BY dept_id)`는 에러 (슬라이드 p.192 예시도 그대로는 동작 안 함). 윈도우 값은 SELECT 단계에서 생기므로 CTE·서브쿼리로 한 번 감싼 뒤 바깥 WHERE에서 거른다.
