---
summary: Java 기초·OOP·SOLID를 다진 뒤 Spring Boot로 Controller·Service·Repository 계층의 REST API를 만들고 JPA·트랜잭션까지 붙인 5일 과정
keywords:
  - JVM
  - OOP
  - SOLID
  - Collection
  - Stream API
  - Reflection
  - REST
  - DispatcherServlet
  - IoC/DI
  - AOP
  - Validation
  - JPA
  - "@Transactional"
  - Actuator
materials:
  - file: slides-day1-java.pdf
    title: "강의 슬라이드 1부 — Java 이해하기 (1일차~3일차 오전)"
    type: slides
    date: 2026-08-10
  - file: slides-day2-rest-springboot.pdf
    title: "강의 슬라이드 2부 — REST API와 Spring Boot (3일차 오후~5일차)"
    type: slides
    date: 2026-08-12
  - file: lab-skala-java-springboot.zip
    title: "실습 저장소 — Java, Spring Boot (training / answer code)"
    type: lab
    date: 2026-08-10
  - file: workspace-java-spring.zip
    title: "내 실습 폴더 — Java, Spring Boot"
    type: lab
    date: 2026-08-10
---

## 한눈에 보기

```flow
HTTP 요청 :: 내장 톰캣이 소켓으로 받아 HttpServletRequest 생성
DispatcherServlet :: HandlerMapping으로 처리할 컨트롤러 메서드 검색
Controller :: @RestController — 파라미터 바인딩, @Valid 검증, DTO 반환
Service :: 업무 로직과 @Transactional 경계 (AOP 프록시)
Repository :: JpaRepository → EntityManager → Hibernate가 SQL 실행
DB :: H2 인메모리 — users, products, orders 테이블
```

- 앞 2.5일은 Java: JVM·메모리, OOP 4대 특징, 컬렉션·제네릭, 람다·Stream, 리플렉션·어노테이션, SOLID까지. 계산기와 Stock 예제를 계속 고쳐 가며 익힘.
- 리플렉션·어노테이션·소켓을 먼저 배운 이유는 Spring이 바로 이것들로 만들어졌기 때문 — 순수 Java로 HTTP 서버와 IoC 컨테이너를 직접 흉내 내 본 뒤 Spring으로 넘어감.
- 뒤 2.5일은 myapp 하나를 단계별로 키움: Hello API → User CRUD 3계층 → DI·프록시·AOP·검증·비동기 → Product 엔티티·연관관계·트랜잭션 → Swagger·Actuator.

## 수업 흐름

**Day 1 (08-10)** — Java 기초 (1부 슬라이드 p.3–180)

1. 프로그램 기초: IP·Port, 프로세스·스레드, JSON·YAML, 동기·비동기, 응집도·결합도, Monolith vs MSA — p.3–21
2. 자바 둘러보기·개발환경: 컴파일러 vs 인터프리터, JVM·바이트코드, Stack·Heap, VS Code와 javac/java — p.22–49
3. 변수·자료형: 기본형·참조형, 래퍼·불변 객체, StringBuilder vs StringBuffer, synchronized — p.50–73
4. 네이밍 컨벤션, 클래스와 객체·static, Javadoc 주석 — p.74–102
5. 제어문: if, switch expression(Java 14), while, for-each, break·continue·return, 예외 처리와 try-with-resources — p.103–136
6. 패키지·접근 제어자, 필수 클래스(Object·System·Thread·Exception·Runtime·Class) — p.137–151
7. 객체지향 4대 특징(캡슐화·상속·추상화·다형성), 업캐스팅, JVM 구조와 GC — p.152–180

**Day 2 (08-11)** — Java 심화 (1부 슬라이드 p.181–311)

1. 상속, 인터페이스(default·static·private 메서드, 다중 구현), 추상 클래스, 다형성(오버라이딩·오버로딩) — p.181–201
2. Collection(List·Set·Map·Queue·Deque·Stack), Generic과 와일드카드 — p.202–240
3. 함수형 프로그래밍, 람다·함수형 인터페이스, 메서드 참조, effectively final — p.241–264
4. Stream API, Method Chaining, java.util(Collections·Arrays·Optional) — p.265–283
5. Reflection, Annotation(Retention·Target)과 Spring 어노테이션의 동작 원리 — p.284–311

**Day 3 (08-12)** — 오전 설계·네트워크, 오후 REST와 Spring Boot

1. 객체 생성 패턴(Singleton·Factory Method·Abstract Factory·Builder), SOLID 5원칙 — 1부 p.312–336
2. OSI·TCP/IP, HTTP 메시지·URL·메서드, Socket·ServerSocket으로 Echo·HTTP 서버 만들기 — 1부 p.337–362
3. RESTful API: 3요소, 6원칙, 설계 규칙 — 2부 p.3–21
4. Spring vs Spring Boot, VS Code로 myapp 생성, Hello API, 컴포넌트 스캔 — 2부 p.22–47
5. Spring MVC: DispatcherServlet 흐름, @Controller vs @RestController, 파라미터 바인딩, UserController 실습 — 2부 p.48–77
6. Controller → Service → Repository 계층, User 엔티티 + H2 + data.sql, 어노테이션·리플렉션·소켓으로 만든 미니 HTTP 서버 — 2부 p.78–96

**Day 4 (08-13)** — Spring 핵심 원리 (2부 p.97–210)

1. Lombok(@Data, @Slf4j), 로그 레벨 — p.97–106
2. application.yml, @Value vs @ConfigurationProperties, 프로파일(local·prod) 분리 — p.107–120
3. 의존성·DI·IoC, 주입 3방식과 생성자 주입, 순환 참조, Spring 컨테이너·Bean·싱글톤 — p.121–142
4. 순수 Java로 만든 Simple IoC Container 실습 — p.143–147
5. Proxy 패턴, JDK 동적 프록시 vs CGLIB, @Configuration + @Bean으로 프록시 빈 등록 — p.148–157
6. AOP: Aspect·Pointcut·Advice·JoinPoint, @Around로 실행 시간 측정, @Metrics 커스텀 어노테이션 — p.158–178
7. 입력값 검증: DTO, @Valid vs @Validated, 검증 어노테이션 — p.179–195
8. @Async, ThreadPoolTaskExecutor, CompletableFuture — p.196–210

**Day 5 (08-14)** — JPA와 운영 (2부 p.211–321)

1. Entity·ORM·JPA vs JDBC, DB 설정(H2·HikariCP), 매핑 어노테이션(@Column·@Enumerated·@Lob·@Transient) — p.211–232
2. JpaRepository 기본 메서드, 쿼리 메서드 키워드, @Query(JPQL·Native), Product 도메인 실습 — p.233–254
3. 연관관계 매핑(@ManyToOne·@OneToMany), FK 제어권, LAZY vs EAGER, Product → User 실습 — p.255–271
4. EntityManager와 영속성 컨텍스트, 엔티티 상태 — p.246–247, 272–279
5. @Transactional: ACID, readOnly, 커밋 시점, 전파, 자기 호출 문제, 롤백 규칙, 낙관적·비관적 락 — p.280–296
6. springdoc-openapi로 Swagger UI 문서화 — p.297–304
7. Actuator: health·metrics·prometheus, 로그 레벨 동적 변경, liveness·readiness와 K8s probe — p.305–321

## 실습 정리

- 저장소: `skala-java-springboot` — `01.java`(training-code / answer-code 16개 주제), `02.spring/01.training-code`(01.start ~ 17.http-api-server 단계별 프로젝트)
- Java 실습은 같은 예제를 계속 고쳐 나가는 방식

| 예제 | 거쳐 간 단계 | 배운 것 |
| --- | --- | --- |
| Calculator | switch → switch expression → while(c/q) → `String[] history` + for-each → ArithmeticException 처리 → `ArrayList` + Iterator → `HashMap<hashCode, 기록>` → abstract 클래스로 계산·출력 추상화 | 제어문, 예외, 컬렉션, 템플릿 메서드 |
| Stock / PreferredStock | 클래스·객체 → 패키지·접근 제어자 → 상속 → interface → abstract → 오버라이딩·오버로딩 | OOP 4대 특징 |
| 단독 예제 | NumberBox(==·equals), SynchronizedExample, Box&lt;T&gt;·BoundedBox, AddableDemo(람다), StreamMain, Reflection·Annotation 4종, Builder, OCP·LSP·DIP, Echo·HTTP 소켓 서버 | 각 개념 확인 |

- Spring 실습은 `myapp`(com.sk.skala.myapp) 하나를 끝까지 키움 — 내 실습 폴더(workspace)에 최종본이 있음

| 단계 | 내가 만든 것 |
| --- | --- |
| 시작 | `HelloController` — `GET /api/hello` → `{"message": ...}` |
| 3계층 | `UserController`(GET/POST/PUT/DELETE `/api/users`) → `UserService` → `UserRepository extends JpaRepository<User, Long>`, H2 + `data.sql` 사용자 3명 |
| 설정 | `application.yml` 로그 레벨, `DeveloperProperties`(@ConfigurationProperties) + `GET /api/developer-info`로 local·prod 프로파일 확인 |
| 프록시·AOP | `UserServiceConfig`(ProxyFactory로 CGLIB 프록시 빈) → `MetricsAspect`(@Around·@Before) → `@Metrics` + `MetricsAnnotationAspect` |
| 검증·비동기 | `UserRequest`(@NotBlank·@Email), `UserService`에 @Validated + @Valid, `AsyncConfig`(core 2·max 5·queue 100) + `AsyncController` |
| JPA | `Product`(@Enumerated STRING·@Lob·@Transient displayLabel) + `ProductStatus`, `@ManyToOne(LAZY) User`, `findByStatus`·`findByUserId`·`findByUserName` |
| 운영 | springdoc(`/swagger-ui.html`, `/api-docs`), Actuator(`/actuator/health/liveness`·`readiness`, `/actuator/loggers`로 레벨 변경) |

- 종합 실습(`16.execise`): 주문 → 결제 → 배송. `Order`가 User·Product를 `@ManyToOne`, Payment·Delivery를 `@OneToOne(cascade = ALL)`로 갖고, `OrderStatus.next()`로 상태를 한 단계씩 진행. REST API(Swagger)와 Thymeleaf 화면(`@Controller`)을 분리

핵심 코드 — N:1 연관관계와 화면 표시용 필드 (내 myapp `Product`)

```java
@Entity @Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)          // "ON_SALE" 문자열로 저장
    private ProductStatus status;

    @ManyToOne(fetch = FetchType.LAZY)    // 여러 상품 → 한 사용자
    @JoinColumn(name = "user_id")         // products.user_id FK
    private User user;

    @Transient                            // DB 컬럼 아님, 런타임 계산값
    private String displayLabel;
}
```

핵심 코드 — save 없이 반영되는 상태 전환 (종합 실습 `OrderService`)

```java
@Service
@Transactional(readOnly = true)              // 기본은 조회 전용
public class OrderService {
    @Transactional                           // 쓰기만 재정의
    public Order advanceStatus(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        OrderStatus next = order.getStatus().next();
        order.setStatus(next);
        if (next == OrderStatus.PAYMENT_COMPLETED) order.getPayment().complete();
        return order;                        // 커밋 시 변경 감지로 UPDATE
    }
}
```
