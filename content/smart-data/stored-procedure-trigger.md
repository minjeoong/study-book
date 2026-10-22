---
title: "Stored Procedure · 함수 · Trigger"
en: Stored Procedure, User-Defined Function, Trigger
summary: "여러 SQL을 묶어 DB 안에서 실행하는 프로시저, 값을 계산해 돌려주는 함수, DML 이벤트에 자동 실행되는 트리거"
importance: 2
order: 12
tags: [Stored Procedure, 함수, Trigger, PL/pgSQL, CDC]
keypoints:
  - 프로시저는 CALL로 실행하고 DML·트랜잭션 가능, 함수는 SELECT 안에서 값 반환
  - PostgreSQL은 IMMUTABLE 함수만 함수 기반 인덱스에 쓸 수 있다
  - 트리거는 짧고 결정적으로, 외부 API 호출은 금지
qa:
  - q: Stored Procedure와 함수의 차이는?
    a: "프로시저는 여러 SQL을 묶은 작업 절차로 CALL로 실행하며, 반환값이 없어도 되고 INSERT·UPDATE와 트랜잭션 제어가 가능합니다. 함수는 SELECT 안에서 호출해 값을 계산하고 반환하는 용도라 보통 데이터를 바꾸지 않습니다. 자주 바뀌는 비즈니스 로직은 앱 코드에, 공통 계산이나 배치는 DB 쪽에 두는 것이 기준입니다."
  - q: 트리거는 언제 쓰고 언제 피해야 하나요?
    a: "어떤 경로로 데이터가 바뀌어도 반드시 실행돼야 하는 감사 로그, created_at 자동 세팅, 재고 음수 방지 같은 규칙에 적합합니다. 반면 외부 API 호출이나 긴 작업은 트랜잭션을 늘리고 장애를 전파하므로 피하고, 로그 테이블이나 큐에 적재한 뒤 비동기 소비자가 처리하게 합니다. 대량 DML에는 행 단위 대신 문장 단위 트리거를 고려합니다."
related: [index-design, sql-basics, db-security-ha]
source: Day4 (7/30) 슬라이드 p.348–359 (SP vs 함수, 4개 DBMS 문법, DEFINER·INVOKER, IMMUTABLE·DETERMINISTIC, 에러 처리, 주문 생성 SP), p.360–374 (Trigger 개념, row·statement, DBMS 비교, 배치·알림·CDC, Event Trigger, LISTEN/NOTIFY), 종합실습 3 LAB B, 종합실습 4 Q11
---

```compare
Stored Procedure | 함수 (UDF)
역할 | 여러 SQL을 묶은 작업 절차 | 계산해서 값 반환
호출 | CALL / EXEC | SELECT fn() 안에서
반환값 | 없어도 됨 | 반드시 있음
트랜잭션 · DML | 가능 | 보통 불가 (읽기 전용)
쓰임 | 데이터 변경, 배치, 주문 생성 | 데이터 변환, 계산
```

```sql
-- 종합실습 4 Q11: 0으로 나눠도 에러 대신 NULL
CREATE OR REPLACE FUNCTION ecom.safe_div(numer NUMERIC, denom NUMERIC)
RETURNS NUMERIC LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN denom IS NULL OR denom = 0 THEN NULL
              ELSE ROUND(numer / denom, 2) END
$$;

-- 감사 로그 트리거 (row-level, AFTER INSERT)
CREATE OR REPLACE FUNCTION trg_sales_ai() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log(table_name, op, row_json) VALUES ('sales', TG_OP, to_jsonb(NEW));
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER sales_ai AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION trg_sales_ai();
```

- PostgreSQL 함수 안정성: IMMUTABLE(같은 입력 → 항상 같은 결과, 인덱스 표현식 가능) / STABLE(한 쿼리 안에서 불변) / VOLATILE(random(), now(), 기본값) — MySQL은 DETERMINISTIC, Oracle은 RESULT_CACHE
- 실습 3 LAB B: `reverse()`를 IMMUTABLE 함수 `hr.reverse_text()`로 감싸 함수 기반 인덱스의 키로 사용
- 보안: SECURITY DEFINER는 작성자 권한으로 실행 → search_path 고정, 내부 동적 SQL은 인젝션 위험
- 에러 처리: PG `EXCEPTION` 블록 / MySQL `DECLARE HANDLER` / SQL Server `TRY…CATCH`, 주문 생성 SP는 재고 부족 시 `RAISE EXCEPTION` → 전체 롤백
- 트리거: BEFORE·AFTER·INSTEAD OF(뷰), FOR EACH ROW vs STATEMENT, OLD·NEW / MySQL은 row 트리거만 + 같은 테이블 수정 금지(오류 1442), SQL Server는 inserted·deleted 가상 테이블
- 이벤트 처리: 트리거 + `pg_notify` → 앱 LISTEN 실시간 알림 / CDC는 WAL·Binlog → Debezium → Kafka / 스케줄은 pg_cron, MySQL EVENT Scheduler
- 커서로 행 단위 순회는 느림 → 대용량은 Set-based SQL로
