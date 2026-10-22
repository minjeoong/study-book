---
title: ACID와 WAL
en: ACID, Write-Ahead Logging
summary: "트랜잭션의 4원칙(원자성·일관성·격리성·지속성)과, 지속성을 지키는 '로그 먼저 쓰기' 원리"
importance: 3
order: 1
tags: [트랜잭션, ACID, WAL, 장애 복구, PostgreSQL]
keypoints:
  - 송금은 출금·입금이 둘 다 성공하거나 둘 다 취소 (원자성)
  - WAL은 데이터 파일보다 로그를 먼저 디스크에 써서 Redo·Undo로 복구
  - 단일 DB는 WAL, 분산 DB는 Consensus(Raft·Paxos)로 같은 상태 유지
qa:
  - q: ACID를 설명해 주세요.
    a: "트랜잭션이 지켜야 할 네 가지 원칙입니다. 원자성은 모두 성공하거나 모두 취소되는 것, 일관성은 수행 전후로 제약조건을 만족하는 상태를 유지하는 것, 격리성은 동시에 실행되는 트랜잭션끼리 간섭하지 않는 것, 지속성은 커밋된 결과가 장애 후에도 남는 것입니다. 계좌 이체에서 출금만 되고 입금이 안 되면 원자성이 깨진 것입니다."
  - q: COMMIT 직후 서버가 죽으면 데이터는 어떻게 되나요?
    a: "WAL 덕분에 보존됩니다. DB는 데이터 파일을 바로 고치지 않고 변경 내용을 WAL 로그에 먼저 기록하고 디스크에 동기화(fsync)한 뒤 COMMIT 성공을 응답합니다. 재시작하면 로그를 순서대로 재실행(Redo)하고, 커밋되지 않은 트랜잭션은 취소(Undo)해서 복구합니다."
  - q: WAL을 쓰면 왜 쓰기 성능도 좋아지나요?
    a: "로그는 파일 끝에 순차로 이어 쓰기 때문에, 디스크 여기저기 흩어진 데이터 페이지를 매번 고치는 랜덤 I/O보다 빠릅니다. 실제 데이터 파일 반영은 Checkpoint 때 모아서 처리합니다."
related: [concurrency-control, db-security-ha]
source: Day1 (7/27) 슬라이드 p.6–17 (DB 발전 과정, ACID, DBMS별 ACID 차이, WAL·Consensus)
---

```flow
UPDATE :: 변경 내용을 WAL 버퍼에 먼저 기록 (로그 우선)
메모리 반영 :: Shared Buffer 페이지만 수정, 데이터 파일은 아직 그대로 (dirty page)
COMMIT :: COMMIT 로그를 WAL에 쓰고 fsync → 성공 응답
Checkpoint :: 쌓인 dirty page를 데이터 파일에 일괄 반영
장애 복구 :: pg_wal 로그 재실행(Redo), 미커밋 트랜잭션은 Undo
```

| 속성 | 의미 | 예시 · 구현 |
| --- | --- | --- |
| Atomicity 원자성 | 전부 성공 or 전부 취소 | 송금 = 출금 + 입금, ROLLBACK |
| Consistency 일관성 | 전후로 제약조건 만족 | PK · FK · CHECK |
| Isolation 격리성 | 동시 트랜잭션끼리 간섭 없음 | 격리 수준, MVCC, Lock |
| Durability 지속성 | 커밋 결과는 영구 | WAL, Redo Log |

```compare
WAL | Consensus
적용 범위 | 단일 DBMS, 단일 노드 | 분산 DB, 멀티 노드
목적 | 장애 복구, 트랜잭션 보장 | 노드 간 같은 상태 유지
동작 | 로그 먼저 기록 → 나중에 데이터 반영 | Leader가 로그 전파 → 과반수 동의 시 Commit
사례 | PostgreSQL, Oracle, SQL Server | Spanner(Paxos), Aurora · CockroachDB(Raft)
```

- DB 발전: 파일 시스템(중복, 동시 접근 불가) → 계층형(IMS, N:M 표현 어려움) → RDBMS(Codd 1970, SQL) → NoSQL(수평 확장) → NewSQL·Cloud(ACID + 수평 확장)
- 핵심 긴장 관계: 무결성·일관성 vs 확장성·가용성

> [!warn] 헷갈리기 쉬움
> ACID는 교과서적으로는 모두 지원하지만 엔진·설정에 따라 보장 수준이 다름. MySQL MyISAM은 Rollback·FK가 없어 사실상 미지원(InnoDB가 기본), PostgreSQL `synchronous_commit = off`는 성능을 얻는 대신 최근 커밋 일부를 잃을 수 있음.
