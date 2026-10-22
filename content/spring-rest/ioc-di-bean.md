---
title: IoC 컨테이너와 DI, Bean
en: Inversion of Control, Dependency Injection, Spring Bean, Spring Boot
summary: 객체 생성과 연결을 개발자가 아닌 스프링 컨테이너가 맡고(IoC), 필요한 의존 객체를 생성자로 넣어 주는(DI) 구조
importance: 3
order: 11
tags:
  - Spring
  - IoC
  - DI
  - Bean
  - Spring Boot
keypoints:
  - IoC는 객체 생성·연결 제어권이 컨테이너로 넘어간 것, DI는 그 구현 방법
  - 생성자 주입 권장 — final 불변, 누락 즉시 발견, 테스트 쉬움, 순환 참조 조기 감지
  - "빈은 기본 싱글톤, @SpringBootApplication의 컴포넌트 스캔이 하위 패키지를 등록"
qa:
  - q: IoC와 DI의 차이는?
    a: IoC(제어의 역전)는 객체를 new로 만들고 서로 연결하는 제어권이 개발자에서 프레임워크(스프링 컨테이너)로 넘어갔다는 원리다. DI(의존성 주입)는 그 원리를 구현하는 방식으로, 객체가 필요한 의존 객체를 직접 만들지 않고 생성자·setter·필드를 통해 외부에서 받는 것이다. 실습에서 Coffee가 new Hot()을 직접 하던 코드를 생성자로 Ame를 받게 바꾸자, ThinIce를 추가해도 Coffee는 고칠 필요가 없었다.
  - q: 필드 주입보다 생성자 주입을 권장하는 이유는?
    a: 생성자 주입은 필드를 final로 선언할 수 있어 주입 후 바뀌지 않고, 의존성이 빠지면 객체 자체를 만들 수 없어 누락이 바로 드러난다. 테스트에서 스프링 없이 new로 가짜 객체를 넣을 수 있고, A와 B가 서로를 생성자로 요구하는 순환 참조는 기동 시점에 즉시 에러로 알려 준다. @Autowired 필드 주입은 final이 안 되고 테스트가 불편해 권장하지 않는다.
  - q: Spring과 Spring Boot의 차이는?
    a: Spring은 IoC/DI와 AOP를 제공하는 프레임워크로, 전통적으로 XML이나 Java Config를 손으로 작성하고 WAR를 외부 WAS에 배포했다. Spring Boot는 Starter 의존성, 클래스패스를 보고 빈을 자동 구성하는 Auto-configuration, 내장 톰캣을 제공해 설정을 최소화하고 java -jar로 바로 실행하게 해 준다. @SpringBootApplication은 @Configuration·@EnableAutoConfiguration·@ComponentScan을 합친 것이다.
related:
  - solid-patterns
  - reflection-annotation
  - proxy-aop
  - layered-dto-validation
source: 2부 슬라이드 p.22–47(Spring 개요·생태계·Spring Boot 특징·프로젝트 생성·컴포넌트 스캔) — Day 3 오후 (08-12); p.107–120(프로퍼티·@Value·@ConfigurationProperties·프로파일), p.121–147(의존성·DI 3방식·순환 참조·Spring 컨테이너·Bean·싱글톤·Simple IoC 실습) — Day 4 (08-13), 실습 05.di/before·after, 06.simple-ioc-container, 04.properties
---

```flow
컴포넌트 스캔 :: @SpringBootApplication 패키지 하위의 @Component·@Service·@Repository·@Controller 탐색
빈 정의 등록 :: 클래스 정보를 컨테이너(ApplicationContext) 저장소에 등록
생성 + 주입 :: 생성자 파라미터 타입에 맞는 빈을 찾아 넣으며 객체 생성 (싱글톤 1개)
후처리 :: BeanPostProcessor — 필요하면 AOP 프록시로 바꿔치기
제공 :: 다른 빈의 생성자 인자로 같은 인스턴스를 계속 전달
```

| 주입 방식 | 장점 | 단점 |
| --- | --- | --- |
| 생성자 주입 (권장) | final 불변, 필수 의존성 보장, 테스트 쉬움 | 코드가 조금 길다 (Lombok @RequiredArgsConstructor로 해결) |
| 필드 주입 (@Autowired) | 짧다 | final 불가, 테스트 불편, 순환 참조를 늦게 발견 |
| Setter 주입 | 선택적 의존성에 적합 | 불변성 약함, 중간에 바뀔 수 있음 |

```java
@Service
public class StockService {
    private final StockRepository stockRepository;      // final — 한 번만 할당

    public StockService(StockRepository stockRepository) { // 생성자가 하나면 @Autowired 생략
        this.stockRepository = stockRepository;
    }
}

// 설정값 주입 — 계층형 설정은 객체로 묶는다
@Data @Component
@ConfigurationProperties(prefix = "developer")   // application-local.yml / -prod.yml
public class DeveloperProperties { private Owner owner; private Team team; }
```

> [!warn] 순환 참조
> AService ↔ BService가 서로를 생성자로 요구하면 "APPLICATION FAILED TO START — form a cycle"로 기동이 실패한다. 우회하지 말고 설계 신호로 받아들여 공통 로직을 별도 빈·인터페이스·이벤트로 분리한다.
