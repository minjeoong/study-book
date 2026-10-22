---
title: 서비스 분리와 데이터 소유권
en: Bounded Context, Database per Service
summary: "서비스 경계는 도메인 경계(Bounded Context)이자 데이터 경계 — 테이블마다 주인 서비스는 하나, 남의 데이터는 API로만"
importance: 3
order: 6
tags:
  - MSA
  - DDD
  - 데이터베이스
keypoints:
  - "분리 기준: 도메인 경계(Bounded Context), 데이터 소유권, 변경 빈도"
  - "DB 분리 단계: 애플리케이션 모듈화 → API로만 통신 → Database 분리"
  - "서비스를 넘는 조인·트랜잭션 대신 API·이벤트와 최종 일관성"
qa:
  - q: "마이크로서비스는 어떤 기준으로 나누나?"
    a: "도메인 경계(DDD의 Bounded Context), 데이터 소유권, 변경 빈도를 기준으로 나눈다. 같은 '고객'이라도 영업 컨텍스트와 지원 컨텍스트에서 의미가 달라 각자 모델을 갖는 것이 Bounded Context다. 실습에서는 요구사항을 주체(수강생·강사·시스템)별로 정리한 뒤 회원·강의·수강·결제·추천 다섯 서비스로 묶었고, 우리 팀은 '카탈로그 정책이 바뀔 때 결제 코드가 같이 바뀌면 안 된다'는 변경 이유 기준도 함께 썼다."
  - q: "Database per Service란? 왜 필요한가?"
    a: "각 서비스가 자기 데이터를 단독으로 소유하고, 다른 서비스는 그 DB를 직접 조회하지 않고 API나 이벤트로만 접근하는 원칙이다. 두 서비스가 같은 테이블을 동시에 건드리면 한쪽 변경이 다른 쪽을 깨뜨려 독립 배포가 불가능해지기 때문이다. 실습은 MariaDB 한 대를 썼지만 테이블마다 주인 서비스를 하나로 정했고, 수강 서비스는 강의 정보를 course-service 내부 API로 받았다. 그래서 나중에 DB를 물리적으로 분리해도 코드는 바뀌지 않는다."
  - q: "DB가 나뉘면 조인과 트랜잭션은 어떻게 하나?"
    a: "DB 조인은 SQL 시작 시점 기준으로 일관된 데이터를 읽지만, 여러 테이블을 WAS로 따로 가져와 합치면 그 사이 다른 트랜잭션이 커밋한 값이 섞여 격리 수준이 깨질 수 있다. 그래서 교재는 MSA에서도 서비스 안에서는 ERD를 그리고 조인 SQL을 쓰라고 강조했다. 서비스를 넘는 작업은 실습처럼 수강을 PENDING으로 먼저 저장하고 결제 완료 이벤트를 받아 ACTIVE로 바꾸는 최종 일관성으로 처리하며, 실패 시에는 보상 처리를 두는 Saga 패턴으로 확장한다."
related:
  - monolith-vs-msa
  - kafka-event-driven
  - msa-components
source: "2026-08-27 교재 p.51 (서비스 분리 기준), p.56–57 (Bounded Context Map, DB는 어떻게?), p.82–84 (MSA에서 Data 처리 Case Study), p.95 (요구사항 분석, 도메인 분리) · 실습 가이드 3 Step 1–2, 5 (ERD)"
---

```flow
Application 모듈화 :: 한 코드베이스 안에서 도메인별 경계 긋기
API로만 Communication :: 다른 모듈의 내부 코드·테이블 직접 참조 금지
Database 분리 :: 서비스별 DB — 테이블 하나에 주인 서비스 하나
```

| 서비스 | 스택 · 포트 | 묶인 기능 | 소유 데이터 |
| --- | --- | --- | --- |
| User | Spring Boot · 8081 | 회원가입, 로그인, JWT 인증 | users |
| Course | Spring Boot · 8082 | 강의 등록·목록·검색, 카테고리 | courses |
| Enrollment | Spring Boot · 8083 | 수강신청, 수강 상태 (PENDING → ACTIVE) | enrollments |
| Payment | Spring Boot · 8084 | 결제 처리, 결제 내역 | payments |
| Recommend | FastAPI · 8085 | 수강 이력 기반 규칙 추천 | 없음 (enrollments·courses 읽기 전용) |

```compare
DB 조인 (SQL 한 번) | WAS로 가져와 처리
기준 시점 | SQL 시작 시점(Oracle SCN) 하나로 전 테이블 동기화 | 테이블마다 읽는 시점이 다름
다른 트랜잭션 영향 | 이후 커밋된 변경은 롤백 세그먼트로 시작 시점 값 복원 (Consistent Mode) | 그 사이 커밋된 값이 섞임 — Dirty·Phantom Read 위험
막으려면 | DBMS가 격리 수준을 자동 보장 | 전 테이블 LOCK 필요 → 성능 저하
```

> [!warn] 교재가 짚은 함정
> 조인을 피하려고 ERD 없이 테이블을 파일처럼 쓰거나, 중복 컬럼을 맞추려 같은 데이터를 두 번 이상 처리하면 대용량 DB에서 심각한 성능 저하가 난다. "MSA 적용 시에도 ERD 작성하고 SQL은 조인 형태 사용" — 경계 안에서는 DB의 일관성 기능을 그대로 쓴다.
