---
title: "DB 보안과 백업 · 고가용성"
en: DB Security, SQL Injection, Backup, High Availability
summary: "최소 권한·파라미터 바인딩·암호화로 데이터를 지키고, 백업·복제·Failover로 RPO·RTO 안에서 복구하는 운영 기본기"
importance: 2
order: 14
tags: [보안, SQL Injection, RBAC, 백업, 고가용성, RPO, 모니터링]
keypoints:
  - SQL Injection은 문자열 이어붙이기가 원인 → 항상 파라미터 바인딩
  - 역할(Role)에 권한을 주고 앱 계정은 역할만 받는 최소 권한 설계
  - RPO는 허용 데이터 손실, RTO는 허용 다운타임 — 동기 복제면 RPO ≈ 0
qa:
  - q: SQL Injection은 어떻게 막나요?
    a: "사용자 입력을 SQL 문자열에 직접 이어붙이면 ' OR '1'='1 같은 입력으로 쿼리 구조 자체가 바뀌는 것이 원인입니다. 1차 방어는 Prepared Statement의 파라미터 바인딩으로 SQL과 값을 분리하는 것이고, ORDER BY 컬럼명처럼 바인딩이 안 되는 부분은 화이트리스트로 검증합니다. ORM도 raw SQL에 입력을 포맷팅하면 똑같이 취약하고, 저장 프로시저도 안에서 동적 SQL을 이어붙이면 안전하지 않습니다."
  - q: RPO와 RTO는 무엇인가요?
    a: "RPO는 장애 시 허용할 수 있는 최대 데이터 손실 시간, RTO는 서비스를 복구하기까지 허용되는 최대 다운타임입니다. AWS RDS Multi-AZ는 Standby에 동기 복제하므로 RPO가 거의 0이고, Primary 장애 시 자동 Failover로 RTO가 수 분 이내입니다. 비동기 복제는 성능이 좋은 대신 RPO가 0보다 커집니다."
  - q: 실수로 데이터를 지웠다면 어떻게 복구하나요?
    a: "PITR(시점 복구)을 씁니다. 베이스 백업과 WAL 아카이브를 쌓아 두고 recovery_target_time을 DELETE 직전 시각으로 지정해 그 시점까지 로그를 재실행합니다. 복제본에는 삭제도 그대로 복제되므로 백업을 대신할 수 없고, 백업은 3-2-1 원칙으로 보관하고 복원 테스트를 정기적으로 해야 합니다."
related: [acid-wal, stored-procedure-trigger, subquery-cte-view]
source: Day3 (7/29) 슬라이드 p.324–340 (백업·복구, VACUUM, pgBouncer, 모니터링 쿼리, 최적화 4단계), Day4 (7/30) p.413–454 (인증·인가, Role·GRANT, Row-Level Security, SQL Injection, 암호화, 최소 권한 패턴), p.455–461 (백업 유형, PITR, Streaming Replication, RPO·RTO, HA 솔루션), p.462–473 (TPS·QPS·Latency, 모니터링 도구, 알람)
---

```layers
인증 (Authentication) :: 누가 접속했나 — 비밀번호, IAM, AD, pg_hba.conf
인가 (Authorization) :: 무엇을 할 수 있나 — GRANT·REVOKE, Role, View, RLS
입력 검증 :: 파라미터 바인딩, ORDER BY 등은 화이트리스트
암호화 :: 전송은 TLS, 저장은 TDE, 민감 컬럼은 pgcrypto
감사 (Audit) :: 누가 언제 무슨 쿼리를 실행했나
```

```sql
-- 역할에 권한을 주고, 앱 계정은 역할만 받는다 (최소 권한)
CREATE ROLE app_reader NOLOGIN;
GRANT USAGE  ON SCHEMA public TO app_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reader;
CREATE ROLE app_user LOGIN PASSWORD '***';
GRANT app_reader TO app_user;

-- Row-Level Security: 세션에 설정한 고객의 행만 보이게 (멀티테넌시)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY by_customer ON orders
  FOR SELECT USING (customer_id = current_setting('app.customer_id')::int);
```

- View 기반 보안: 급여·이름을 뺀 View만 GRANT하고 원본 테이블은 REVOKE (API 계정, 분석가 계정)
- 백업: 논리(pg_dump, SQL 덤프, 이식성) vs 물리(pg_basebackup, 파일 복사, 빠름) / Full · Incremental · Differential / PITR = 베이스 백업 + WAL 아카이브
- 복제: Streaming Replication(WAL 스트리밍), 동기(RPO 0, 느림) vs 비동기(기본, 빠름), Hot Standby는 읽기 분산 / Failover는 Patroni, RDS Multi-AZ·Aurora 자동 전환
- 운영: pgBouncer transaction 모드로 DB 연결 20개가 앱 연결 2,000개를 처리, autovacuum 튜닝, 캐시 히트율 99% 이상
- 모니터링 지표: TPS(초당 완료 트랜잭션), QPS(초당 쿼리), Latency(p95) → Prometheus + Grafana, 클라우드는 CloudWatch·Performance Insights
- 흔한 실수: 앱에 관리자 권한 부여, KMS 키 권한 삭제(백업 복구 불가), 로그에 민감정보 평문

> [!warn] 헷갈리기 쉬움
> Read Replica·Multi-AZ는 장애 대비(HA)이지 백업이 아니다. 잘못된 DELETE도 즉시 복제되므로 실수 복구는 PITR로 한다.
