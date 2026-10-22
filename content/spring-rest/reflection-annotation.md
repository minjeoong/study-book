---
title: 리플렉션과 어노테이션
en: Reflection, Annotation, Retention
summary: 어노테이션은 코드에 붙인 메타데이터, 리플렉션은 그것을 런타임에 읽어 객체를 만들고 메서드를 부르는 기술 — 스프링 동작의 바탕
importance: 2
order: 6
tags:
  - Java
  - Reflection
  - Annotation
  - Spring 원리
keypoints:
  - 리플렉션은 런타임에 Class 정보로 생성자·메서드·필드를 조회·호출
  - 어노테이션은 힌트일 뿐, 실제 동작은 읽는 쪽(컴파일러·프레임워크)이 수행
  - "런타임에 읽으려면 @Retention(RUNTIME), 붙일 위치는 @Target"
qa:
  - q: 리플렉션이란 무엇이고 스프링은 어디에 쓰나?
    a: 컴파일 시점이 아니라 런타임에 Class 객체를 통해 클래스의 생성자·메서드·필드 정보를 읽고, 객체를 만들거나 메서드를 호출하는 기능이다. 스프링은 @Autowired 대상에 빈을 넣고, @GetMapping이 붙은 메서드를 찾아 Method.invoke로 호출하며, JPA는 엔티티 필드를 리플렉션으로 읽고 쓴다. 다만 직접 호출보다 느리고 private 접근으로 캡슐화를 깨며, 타입 오류가 런타임에야 드러난다는 단점이 있다.
  - q: 어노테이션의 Retention 정책 세 가지는?
    a: SOURCE는 소스에만 있고 컴파일하면 사라져 @Override처럼 컴파일러가 검사용으로 쓴다. CLASS는 .class 파일까지 남지만 런타임에 리플렉션으로 읽을 수 없으며 기본값이다. RUNTIME은 실행 중에도 읽을 수 있어 @Service·@GetMapping·@Autowired 같은 스프링 어노테이션이 모두 이 정책이다.
  - q: 스프링 없이 어노테이션과 리플렉션만으로 IoC 컨테이너를 만든다면?
    a: 실습 Simple IoC Container처럼 커스텀 @Service를 RUNTIME으로 정의하고, 등록할 클래스들의 생성자 파라미터 타입을 getConstructors로 분석한다. 필요한 의존 빈이 아직 없으면 재귀적으로 먼저 만들고, newInstance로 생성한 객체를 ConcurrentHashMap에 이름별로 하나씩 저장해 싱글톤처럼 재사용한다. getBean은 이 맵에서 꺼내 주기만 한다.
related:
  - ioc-di-bean
  - spring-mvc-flow
  - proxy-aop
source: Java 슬라이드 p.284–294(Reflection·Class·Constructor·Method·Field, 한계), p.295–311(Annotation·Retention·Target, Class·Field·Method·Parameter 적용) — Day 2 (08-11), 실습 12.reflection, 13.annotation/01~04; 2부 슬라이드 p.94–96(17.http-api-server), p.143–147(06.simple-ioc-container)
---

```flow
선언 :: @interface GetMapping + @Retention(RUNTIME), @Target(METHOD)
적용 :: UserController의 getUsers()에 @GetMapping("/users")
스캔 :: clazz.getDeclaredMethods() 중 isAnnotationPresent(GetMapping.class)
등록 :: 라우팅 테이블에 경로 → (컨트롤러 객체, Method) 저장
호출 :: 요청 경로가 맞으면 method.invoke(controller, args) → JSON 응답
```

```java
@Retention(RetentionPolicy.RUNTIME)   // 런타임에 리플렉션으로 읽는다
@Target(ElementType.METHOD)           // 메서드에만 붙인다
public @interface RunMe { int order() default 0; }

// @RunMe 붙은 메서드만 order 순으로 실행
Arrays.stream(runner.getClass().getDeclaredMethods())
      .filter(m -> m.isAnnotationPresent(RunMe.class))
      .sorted(Comparator.comparingInt(m -> m.getAnnotation(RunMe.class).order()))
      .forEach(m -> m.invoke(runner));          // (예외 처리 생략)
```

| Spring 어노테이션 | 대상(@Target) | 프레임워크가 하는 일 |
| --- | --- | --- |
| @Service, @RestController | 클래스 | 스캔해서 빈으로 등록 |
| @Autowired, @Value | 필드 | 빈·설정값을 리플렉션으로 주입 |
| @GetMapping, @Transactional | 메서드 | URL 매핑, 트랜잭션 프록시 |
| @PathVariable, @RequestBody | 파라미터 | 요청 값을 파라미터로 변환 |

> [!tip] 면접 팁
> "어노테이션은 주석과 달리 프로그램이 읽는 메타데이터이고, 읽고 동작하는 주체는 리플렉션을 쓰는 프레임워크"라고 한 문장으로 정리하면 @Service·@GetMapping이 왜 동작하는지까지 설명된다.
