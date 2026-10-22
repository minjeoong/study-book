---
title: JPA·Entity·JpaRepository
en: JPA, ORM, Entity Mapping, Spring Data JPA, Association Mapping
summary: 객체(Entity)와 테이블을 자동 매핑하는 ORM 표준 — JpaRepository만 선언하면 CRUD와 쿼리가 생긴다
importance: 3
order: 13
tags:
  - JPA
  - ORM
  - Spring Data JPA
  - 연관관계
keypoints:
  - JPA는 ORM 표준, 구현체는 Hibernate — 클래스=테이블, 필드=컬럼
  - JpaRepository 상속만으로 CRUD, findByStatus처럼 메서드 이름이 곧 쿼리
  - "@ManyToOne은 FK를 가진 쪽이 연관관계의 주인, LAZY면 실제 접근 시 조회"
qa:
  - q: JPA와 JDBC(MyBatis)의 차이는?
    a: JDBC는 SQL을 직접 쓰고 Connection·Statement·ResultSet을 다뤄 결과를 객체에 손으로 옮긴다. JPA는 엔티티 객체와 테이블을 매핑해 CRUD SQL을 자동 생성하고, 변경 감지·지연 로딩·@Transactional 기반 트랜잭션 관리까지 해 준다. 대신 영속성 컨텍스트 같은 개념을 알아야 하고, 자동 생성된 SQL을 show-sql로 확인하며 튜닝해야 한다.
  - q: 쿼리 메서드와 @Query는 언제 쓰나?
    a: findByNameAndAgeGreaterThan처럼 정해진 키워드 규칙으로 메서드를 선언만 하면 Spring Data JPA가 쿼리를 만들어 주며, 단순 조건·정렬·페이징에 빠르고 실수가 적다. 조인·집계·복잡한 조건은 @Query로 엔티티 기준 JPQL을 써서 DB에 독립적으로 작성하고, DB 전용 함수가 꼭 필요할 때만 nativeQuery = true로 SQL을 쓴다. 네이티브 쿼리는 DB 종속이 생기므로 최소화한다.
  - q: "@ManyToOne, 연관관계의 주인, 지연 로딩을 설명하라."
    a: "여러 상품이 한 사용자에 속하면 Product에 @ManyToOne과 @JoinColumn(name = \"user_id\")를 두고, FK를 가진 Product가 연관관계의 주인이라 관계를 바꿀 수 있다. User 쪽 @OneToMany(mappedBy = \"user\")는 읽기만 하는 반대편이다. FetchType.LAZY면 Product를 조회할 때 User는 프록시로 채워 두었다가 getName()처럼 실제로 쓸 때 SELECT가 나가며, @ManyToOne의 기본값이 EAGER라서 실습에서는 LAZY를 명시했다."
related:
  - persistence-context-transaction
  - layered-dto-validation
  - lambda-stream
source: 2부 슬라이드 p.211–232(Entity·ORM·JPA vs JDBC·DB 설정·매핑 어노테이션), p.233–254(JpaRepository 계층·기본 메서드·쿼리 메서드 키워드·@Query·Product 실습), p.255–271(연관관계 매핑·FK 제어권·LAZY vs EAGER·Product→User 실습) — Day 5 (08-14), 실습 11.jpa, 12.jpa-relation, 내 myapp Product·ProductRepository
---

```layers
UserRepository (인터페이스) :: extends JpaRepository<User, Long> — 선언만 함
SimpleJpaRepository (프록시 구현체) :: 스프링이 동적으로 만들어 빈으로 등록
EntityManager :: persist·find·merge·remove — 영속성 컨텍스트 관리
Hibernate (JPA 구현체) :: 엔티티 변경을 SQL로 변환
JDBC → DB :: PreparedStatement 실행 (H2, MariaDB …)
```

| 어노테이션 | 역할 |
| --- | --- |
| @Entity, @Table(name) | 클래스를 테이블에 매핑 (기본 생성자 필수) |
| @Id, @GeneratedValue(IDENTITY) | PK와 자동 증가 전략 (SEQUENCE는 Oracle·Postgres) |
| @Column(name, nullable, length, unique) | 컬럼명·제약 조건 |
| @Enumerated(EnumType.STRING) | enum을 이름 문자열로 저장 |
| @Lob | 대용량 텍스트(CLOB)·바이너리(BLOB) |
| @Transient | DB에 저장하지 않는 계산용 필드 |
| @ManyToOne + @JoinColumn | N:1 관계, FK 컬럼 지정 |

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(ProductStatus status);   // WHERE status = ?
    List<Product> findByUserId(Long userId);            // 연관 엔티티의 id로
    List<Product> findByUserName(String userName);      // 연관 엔티티 필드 탐색 (join)
}

@Query("select u from User u where u.status = :status and u.age >= :minAge")  // JPQL
List<User> findActiveUsers(@Param("status") UserStatus status, @Param("minAge") int minAge);
```

> [!warn] 헷갈리기 쉬움
> @Enumerated 기본값 ORDINAL은 enum 순서 번호(0, 1, 2)를 저장해서, 중간에 상수를 추가하면 기존 데이터의 의미가 바뀐다. 실무에서는 항상 EnumType.STRING을 쓴다.
