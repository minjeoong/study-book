---
title: 영속성 컨텍스트와 @Transactional
en: Persistence Context, EntityManager, Transaction, Optimistic Lock
summary: 트랜잭션마다 엔티티를 1차 캐시로 관리하며 변경을 모아 커밋 시 반영하는 공간과, 그 경계를 프록시로 긋는 @Transactional
importance: 3
order: 14
tags:
  - JPA
  - 트랜잭션
  - 영속성 컨텍스트
  - 동시성
keypoints:
  - 영속성 컨텍스트 — 1차 캐시, 동일성 보장, 변경 감지, 쓰기 지연
  - "@Transactional은 프록시가 시작·커밋·롤백, 기본은 RuntimeException만 롤백"
  - 동시 수정은 @Version 낙관적 락 또는 SELECT FOR UPDATE 비관적 락
qa:
  - q: 영속성 컨텍스트와 변경 감지(Dirty Checking)를 설명하라.
    a: EntityManager가 트랜잭션마다 관리하는 엔티티 저장 공간으로, 조회한 엔티티를 1차 캐시에 두고 같은 PK는 같은 객체를 돌려준다. 트랜잭션 안에서 엔티티 필드를 바꾸면 커밋 직전 flush 때 처음 상태와 비교해 UPDATE SQL을 자동으로 만들어 실행하므로 save를 다시 부를 필요가 없다. 종합 실습의 주문 상태 전환이 setStatus만 하고 save 없이 DB에 반영된 것이 이 덕분이다.
  - q: "@Transactional은 어떻게 동작하고, readOnly는 왜 쓰나?"
    a: "@Transactional이 붙은 빈은 프록시로 등록되어, 메서드 시작 시 트랜잭션을 열고 정상 종료 시 커밋, RuntimeException이나 Error가 나면 롤백한다. 클래스에 @Transactional(readOnly = true)를 걸고 쓰기 메서드에만 @Transactional을 다시 붙이면, 조회는 변경 감지를 생략해 빨라지고 실수로 쓰는 것도 막힌다. 파일 저장·외부 API 같은 오래 걸리는 IO는 트랜잭션 밖으로 빼서 범위를 DB 작업으로 좁혀야 락과 커넥션 점유가 줄어든다."
  - q: 낙관적 락과 비관적 락의 차이는?
    a: 낙관적 락은 충돌이 드물다고 보고 락 없이 @Version 필드로 커밋 시점에 버전을 비교해, 다르면 OptimisticLockException을 내고 @Retryable 등으로 재시도한다. 비관적 락은 @Lock(PESSIMISTIC_WRITE)로 조회하는 순간부터 DB 행을 잠가 충돌을 원천 차단하지만, 대기 시간이 늘고 데드락 위험이 있다. 읽기가 많고 충돌이 드물면 낙관적, 재고 차감처럼 충돌이 잦은 곳은 비관적 락이 맞다.
related:
  - jpa-entity-repository
  - proxy-aop
  - java-exception
source: 2부 슬라이드 p.246–247(엔티티 상태), p.272–279(EntityManager·영속성 컨텍스트·JpaRepository와의 관계), p.280–296(ACID·@Transactional·readOnly·커밋 시점·전파·Self Invocation·롤백 규칙·동시성 문제·낙관적·비관적 락 실습) — Day 5 (08-14), 실습 13.jpa-transaction, 16.execise/OrderService
---

```flow
트랜잭션 시작 :: 프록시가 BEGIN, EntityManager·영속성 컨텍스트 생성
조회 :: findById → 1차 캐시에 없으면 SELECT, 있으면 캐시에서 (같은 객체)
변경 :: order.setStatus(next) — 메모리 엔티티만 바뀜, save 호출 없음
flush :: 스냅샷과 비교해 UPDATE 생성, 쓰기 지연 SQL 저장소의 SQL을 한 번에 실행
커밋 :: 정상 종료면 COMMIT, RuntimeException이면 ROLLBACK
```

```compare
낙관적 락 (Optimistic) | 비관적 락 (Pessimistic)
가정 | 충돌은 드물다 | 충돌이 자주 난다
방법 | @Version 필드, 커밋 시 버전 비교 | @Lock(PESSIMISTIC_WRITE) → SELECT FOR UPDATE
충돌 시 | OptimisticLockException → 재시도(@Retryable) | 다른 트랜잭션이 락 해제까지 대기
장점 | DB 락 없음, 읽기 많은 환경에 빠름 | 정합성 확실
단점 | 재시도 로직 직접 구현 | 대기·데드락, 성능 저하
```

| 전파 옵션 | 동작 | 쓰임 |
| --- | --- | --- |
| REQUIRED (기본) | 기존 트랜잭션이 있으면 참여, 없으면 새로 생성 | 대부분의 서비스 로직 |
| REQUIRES_NEW | 기존 트랜잭션을 잠시 멈추고 항상 새로 생성 | 실패와 무관하게 남겨야 할 로그·감사 기록 |

> [!warn] 롤백 규칙
> 기본은 RuntimeException(Unchecked)과 Error만 롤백한다. Checked 예외를 catch하고 아무것도 안 하거나 그대로 던지면 커밋되어 데이터가 어긋날 수 있으니, 필요하면 `@Transactional(rollbackFor = Exception.class)`로 지정한다.
