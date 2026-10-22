---
title: "격리 수준 · MVCC · Lock"
en: Isolation Level, MVCC, Lock & Deadlock
summary: "동시 트랜잭션이 서로의 변경을 어디까지 볼지 정하는 격리 수준과, 이를 구현하는 MVCC 스냅샷·Lock"
importance: 3
order: 11
tags: [트랜잭션, 격리 수준, MVCC, Lock, Deadlock, 동시성]
keypoints:
  - Dirty · Non-Repeatable · Phantom Read를 어디까지 막느냐가 격리 수준
  - MVCC는 수정 시 새 버전을 만들어 읽기와 쓰기가 서로 막지 않는다
  - 데드락은 잠금 순서 통일 + 짧은 트랜잭션 + 재시도로 대응
qa:
  - q: 트랜잭션 격리 수준 4단계를 설명해 주세요.
    a: "Read Uncommitted는 커밋 전 값까지 읽어 Dirty Read가 생깁니다. Read Committed는 커밋된 값만 읽지만 같은 행을 다시 읽으면 값이 바뀔 수 있고(Non-Repeatable Read), Repeatable Read는 트랜잭션 동안 같은 값을 보장하지만 표준상 새 행이 끼어드는 Phantom Read는 허용합니다. Serializable은 순차 실행과 같은 결과를 보장하는 대신 성능 비용과 충돌 시 재시도가 필요합니다. PostgreSQL·Oracle 기본은 Read Committed, MySQL InnoDB는 Repeatable Read입니다."
  - q: MVCC란 무엇인가요?
    a: "데이터를 덮어쓰지 않고 수정할 때마다 새 버전을 만들어, 각 트랜잭션이 자기 시점의 스냅샷을 읽게 하는 방식입니다. 그래서 읽기가 쓰기를, 쓰기가 읽기를 막지 않아 동시성이 높습니다. PostgreSQL은 행마다 xmin·xmax를 두고 지난 버전(dead tuple)을 VACUUM으로 회수하고, MySQL InnoDB는 이전 값을 Undo Log에 둡니다. 오래 열린 트랜잭션은 VACUUM을 막아 테이블이 부풀므로 주의해야 합니다."
  - q: 데드락은 왜 생기고 어떻게 막나요?
    a: "두 트랜잭션이 서로 상대가 잡은 행의 잠금을 기다리는 순환 대기입니다. 세션1이 1번→2번, 세션2가 2번→1번 순서로 재고를 차감하면 생깁니다. DB가 감지해 한쪽을 롤백하므로, 앱은 항상 같은 순서(id 오름차순)로 잠그고, 트랜잭션을 짧게 유지하고, 데드락 에러(PostgreSQL 40P01)가 나면 짧은 백오프 후 재시도합니다."
related: [acid-wal, explain-tuning, spring-rest/persistence-context-transaction]
source: Day1 (7/27) 슬라이드 p.18–22 (Isolation Level, 이상 현상, Phantom Read), p.65 (낙관적·비관적 Lock), Day3 (7/29) p.289–299 (MVCC, RC·RR·Serializable 실습, DBMS별 기본값, 실무 가이드), p.300–311 (Lock 종류, FOR UPDATE·NOWAIT·SKIP LOCKED, Deadlock 감지·해소·모니터링), p.327–330 (VACUUM·Table Bloat)
---

| 격리 수준 | Dirty Read | Non-Repeatable | Phantom | 기본값 · 쓰임 |
| --- | --- | --- | --- | --- |
| Read Uncommitted | 발생 | 발생 | 발생 | 거의 안 씀 (PostgreSQL은 RC로 동작) |
| Read Committed | 방지 | 발생 | 발생 | PostgreSQL, Oracle, SQL Server 기본 |
| Repeatable Read | 방지 | 방지 | 표준상 발생 (InnoDB·PG는 스냅샷으로 사실상 방지) | MySQL InnoDB 기본, 반복 집계 리포트 |
| Serializable | 방지 | 방지 | 방지 | 금융 이체, 재고 차감 (충돌 시 40001 재시도) |

```compare
낙관적 Lock | 비관적 Lock
가정 | 충돌이 드물다 | 충돌이 잦다
방식 | version 컬럼 비교, 0행 갱신이면 재시도 | SELECT … FOR UPDATE로 먼저 잠금
적합 | 읽기 많은 시스템, 긴 사용자 세션 | 은행 이체, 좌석 예매, 재고 차감
```

- RC vs RR 실습: 세션2가 Alice 잔액을 800으로 커밋 → RC 세션1은 재조회 시 800(Non-Repeatable), RR 세션1은 계속 1000(시작 시점 스냅샷)
- 행 잠금 옵션: `FOR UPDATE`(대기), `FOR UPDATE NOWAIT`(즉시 에러), `FOR UPDATE SKIP LOCKED`(잠긴 행 건너뜀 → 여러 워커의 작업 큐)
- 데드락 해소 4가지: 잠금 순서 통일(`ORDER BY id FOR UPDATE`), 트랜잭션 짧게(HTTP 호출·파일 I/O는 밖에서), Advisory Lock(`pg_advisory_xact_lock(user_id)`), 앱 레벨 재시도(지수 백오프 + Jitter)
- 모니터링: `pg_locks` + `pg_stat_activity`로 대기·차단 세션 확인, `pg_cancel_backend`(쿼리만 취소) vs `pg_terminate_backend`(연결 종료)
- MVCC 비용: 버전 저장 공간, dead tuple → Table Bloat → VACUUM(공간 재사용) / VACUUM FULL(재작성, 배타 잠금)

> [!warn] 헷갈리기 쉬움
> Non-Repeatable Read는 같은 행의 값이 바뀐 것(UPDATE), Phantom Read는 조건에 맞는 새 행이 생겨 결과 개수가 바뀐 것(INSERT). 예: `COUNT(*) WHERE amount >= 100`이 5 → 6.
