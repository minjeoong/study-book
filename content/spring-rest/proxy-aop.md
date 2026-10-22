---
title: 프록시와 AOP (@Async 포함)
en: Proxy Pattern, Aspect Oriented Programming, @Async
summary: 원본 빈을 프록시로 감싸 호출 전후에 로깅·트랜잭션·비동기 같은 공통 기능을 끼워 넣는 스프링의 핵심 메커니즘
importance: 3
order: 12
tags:
  - Spring
  - AOP
  - Proxy
  - Async
keypoints:
  - 프록시는 같은 타입으로 원본을 감싸 호출 전후에 부가 기능을 실행
  - AOP는 공통 관심사를 Aspect로 분리 — Pointcut + Advice
  - "@Transactional·@Async도 프록시 기반 — 내부 호출엔 안 걸림"
qa:
  - q: AOP란 무엇이고 주요 용어는?
    a: 여러 클래스에 흩어지는 로깅·트랜잭션·보안·성능 측정 같은 공통 관심사를 비즈니스 로직에서 떼어 한곳에 모듈화하는 방식이다. Aspect는 그 모듈 클래스, Pointcut은 execution(* com..service.*.*(..))처럼 적용할 메서드를 고르는 표현식, Advice는 @Before·@After·@Around처럼 언제 무엇을 실행할지, JoinPoint는 가로챈 메서드 정보, Target은 감싸진 원본 빈이다. 스프링은 빈 생성 시 Target을 프록시로 감싸 런타임에 Advice를 끼워 넣는다.
  - q: JDK 동적 프록시와 CGLIB 프록시의 차이는?
    a: JDK 동적 프록시는 java.lang.reflect.Proxy로 만들기 때문에 인터페이스가 반드시 필요하고 리플렉션으로 메서드를 호출한다. CGLIB는 바이트코드를 조작해 대상 클래스를 상속한 서브클래스를 만들어 인터페이스 없이도 되고, 리플렉션을 쓰지 않아 성능이 낫다. 실습 UserServiceConfig에서는 ProxyFactory에 setProxyTargetClass(true)를 줘 CGLIB 프록시를 빈으로 등록했다.
  - q: 같은 클래스 안에서 @Transactional 메서드를 호출하면 왜 적용되지 않나?
    a: 프록시 기반 AOP는 외부에서 프록시를 거쳐 호출할 때만 Advice가 실행된다. outerMethod 안에서 this.innerMethod()로 부르면 프록시가 아니라 원본 객체의 메서드를 직접 호출하므로 REQUIRES_NEW 같은 트랜잭션 설정이나 @Async가 무시된다. 해결책은 트랜잭션 단위가 다른 메서드를 별도 빈으로 분리해 주입받아 호출하는 것이다.
related:
  - ioc-di-bean
  - persistence-context-transaction
  - reflection-annotation
  - layered-dto-validation
source: 2부 슬라이드 p.148–157(Proxy 패턴·JDK vs CGLIB·@Configuration 프록시 빈), p.158–178(AOP 구성요소·Pointcut 표현식·Advice 5종·Bean과 AOP·@Metrics 실습), p.196–210(@Async·ThreadPoolTaskExecutor·CompletableFuture) — Day 4 (08-13); p.287–288(Self Invocation), 실습 07.proxy, 08.aop, 10.async, 내 myapp MetricsAspect·AsyncConfig
---

```flow
빈 생성 :: IoC 컨테이너가 UserService(Target) 생성
프록시로 감싸기 :: @Aspect의 Pointcut에 걸리면 CGLIB 프록시를 빈으로 등록
호출 :: Controller는 프록시인 줄 모르고 userService.getAllUsers() 호출
Advice 실행 :: Before → joinPoint.proceed()로 원본 실행 → After
반환 :: 결과를 그대로 돌려줌 — 원본 코드는 한 줄도 안 바뀜
```

| Advice | 실행 시점 |
| --- | --- |
| @Before | 메서드 실행 전 |
| @After | 실행 후, 정상·예외 상관없이 항상 |
| @AfterReturning | 정상 반환 후 |
| @AfterThrowing | 예외 발생 후 |
| @Around | 전후 모두 감싸고, proceed() 호출 여부와 인자까지 제어 |

```java
@Slf4j @Aspect @Component
public class MetricsAspect {
    @Around("execution(* com.sk.skala.myapp.service.UserService.*(..))")
    public Object measure(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();                 // 원본 메서드 실행
        } finally {
            log.info("{} 소요 {} ms", joinPoint.getSignature().getName(),
                     System.currentTimeMillis() - start);
        }
    }
}
// 어노테이션 기반: @Pointcut("@annotation(com.sk.skala.myapp.aspect.Metrics)")
```

> [!tip] @Async도 프록시다
> @EnableAsync가 @Async 메서드를 가진 빈을 프록시로 바꾸고, 호출을 가로채 스레드 풀에 넘긴 뒤 호출자에게 즉시 반환한다. 기본 SimpleAsyncTaskExecutor는 매번 새 스레드를 만들므로, 실습처럼 ThreadPoolTaskExecutor(core 2·max 5·queue 100)를 빈으로 지정한다. CompletableFuture를 반환받아 `.get()`을 부르면 그 순간 다시 동기(blocking)가 된다.
