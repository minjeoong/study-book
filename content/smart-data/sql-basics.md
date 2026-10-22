---
title: DDL · DML과 SELECT 실행 순서
en: DDL, DML, Constraints, SELECT Logical Order
summary: "구조를 만드는 DDL, 데이터를 다루는 DML, 그리고 작성 순서와 다른 SELECT의 논리적 실행 순서와 NULL 처리"
importance: 3
order: 4
tags: [SQL, DDL, DML, 제약조건, NULL, PostgreSQL]
keypoints:
  - "실행 순서: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY"
  - 그래서 WHERE에선 SELECT 별칭을 못 쓰고 ORDER BY에선 쓸 수 있다
  - NULL = NULL은 UNKNOWN, 비교는 IS NULL, 대체는 COALESCE
qa:
  - q: SELECT 문의 실행 순서를 설명해 주세요.
    a: "작성은 SELECT부터 하지만 논리적으로는 FROM과 JOIN으로 대상 행을 만들고, WHERE로 거르고, GROUP BY로 묶고, HAVING으로 그룹을 거른 뒤 SELECT로 컬럼을 계산하고 ORDER BY, LIMIT 순으로 처리합니다. 그래서 WHERE 절에서는 SELECT에서 붙인 별칭을 쓸 수 없고 ORDER BY에서는 쓸 수 있습니다."
  - q: DELETE, TRUNCATE, DROP의 차이는?
    a: "DELETE는 DML이라 WHERE로 일부 행만 지울 수 있고 롤백과 DELETE 트리거가 동작하지만 행 단위라 느립니다. TRUNCATE는 테이블 구조는 남기고 모든 행을 한 번에 비워 빠르며 트리거가 실행되지 않고, MySQL·Oracle에서는 DDL이라 자동 커밋됩니다. DROP은 테이블 자체를 구조까지 삭제합니다."
  - q: WHERE col = NULL이 동작하지 않는 이유는?
    a: "NULL은 '알 수 없는 값'이라 어떤 값과 비교해도 TRUE가 아니라 UNKNOWN이 되고, WHERE는 TRUE인 행만 남기기 때문입니다. IS NULL, IS NOT NULL로 비교하고, 화면에 보여 줄 대체값은 COALESCE(email, '미등록')처럼 씁니다. NULL + 5도 NULL이므로 계산 전에 COALESCE로 기본값을 채웁니다."
related: [relational-model-erd, group-by-having]
source: Day1 (7/27) 슬라이드 p.91–107 (CREATE DATABASE·TABLE, DBMS별 데이터 타입, 제약조건, 이식성, ALTER·TRUNCATE), p.108–112 (DML 패턴, SELECT 논리적 실행 순서, 문자열·날짜·NULL 함수, WHERE 조건), 종합실습 1 (p.113–116)
---

```flow
FROM · JOIN :: 대상 테이블 결합
WHERE :: 행 필터 (집계 전, SELECT 별칭 사용 불가)
GROUP BY · HAVING :: 그룹으로 묶고 집계 결과로 그룹 필터
SELECT :: 컬럼 계산, 별칭 부여 (DISTINCT, 윈도우 함수도 여기)
ORDER BY · LIMIT :: 정렬(별칭 사용 가능), 페이지 자르기
```

```sql
-- 종합실습 1: 수강신청 교차 테이블 — 규칙을 제약조건으로 DB가 강제
CREATE TABLE registration (
  student_id  BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  course_id   BIGINT NOT NULL REFERENCES courses(course_id)   ON DELETE CASCADE,
  score       NUMERIC(5,2) CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (student_id, course_id)          -- 같은 과목 중복 신청 차단
);

SELECT student_no, name,
       COALESCE(email, '이메일 미등록') AS email_display,
       CASE grade WHEN 1 THEN '신입생' WHEN 4 THEN '졸업예정' ELSE grade || '학년' END AS grade_label
FROM students
WHERE grade >= 3
ORDER BY student_no;
```

- 제약조건 4대장: NOT NULL, DEFAULT, CHECK, FK (+ PK, UNIQUE) — 규칙이 자주 바뀌면 CHECK·ENUM 대신 Lookup 테이블 + FK
- 타입: PK는 `GENERATED ALWAYS AS IDENTITY`(PG 표준) / `AUTO_INCREMENT`(MySQL), 금액은 부동소수점 대신 `NUMERIC(10,2)`, 시각은 `TIMESTAMPTZ`
- 이식성: ANSI 표준(`COALESCE`, `FETCH FIRST n ROWS ONLY`) vs 벤더 문법(`NVL`, `ISNULL`, `LIMIT`, `TOP`)
- UPDATE·DELETE는 WHERE 필수 (없으면 전체 행), 운영 중 인덱스는 `CREATE INDEX CONCURRENTLY`
- `LIKE '김%'`는 인덱스 사용 가능, `LIKE '%길%'`는 불가 / 우선순위 NOT > AND > OR → 괄호로 명시
- 자동 커밋: PostgreSQL·MySQL은 `BEGIN` 없이 실행한 DML이 즉시 커밋, Oracle은 DML 시작 시 트랜잭션이 자동으로 열림

> [!warn] 헷갈리기 쉬움
> `WHERE major_id = NULL`은 에러 없이 항상 0건. NULL 비교는 `IS NULL`, NOT IN 서브쿼리에 NULL이 섞여도 같은 이유로 빈 결과가 된다.
