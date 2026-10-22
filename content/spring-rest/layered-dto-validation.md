---
title: 계층 구조와 DTO·입력값 검증
en: Controller-Service-Repository, DTO, Bean Validation (@Valid, @Validated)
summary: 요청·업무·데이터 접근을 세 계층으로 나누고, 계층 사이는 DTO로 주고받으며 입구에서 @Valid로 검증한다
importance: 3
order: 10
tags:
  - Spring
  - 계층형 아키텍처
  - DTO
  - Validation
keypoints:
  - Controller 요청·응답, Service 업무·트랜잭션, Repository DB
  - DTO는 계층 간 전달 전용 데이터 상자 — Entity를 그대로 노출하지 않는다
  - "@Valid는 MVC 바인딩 때, @Validated는 AOP 프록시로 서비스 메서드 검증"
qa:
  - q: Controller, Service, Repository로 계층을 나누는 이유는?
    a: Controller는 HTTP 요청을 받아 검증하고 응답을 만드는 일만, Service는 업무 규칙과 트랜잭션 경계를, Repository는 DB 접근만 맡는다. 역할이 나뉘면 화면 요구가 바뀌면 Controller만, 저장 기술이 바뀌면 Repository만 고치면 되어 변경의 파급이 줄고 계층별로 따로 테스트할 수 있다. SOLID의 단일 책임 원칙을 아키텍처 수준에 적용한 것이다.
  - q: Entity를 API 응답으로 바로 내보내면 안 되는 이유는?
    a: 비밀번호처럼 숨겨야 할 필드가 그대로 노출되고, DB 컬럼을 바꾸는 순간 API 스펙이 바뀌어 클라이언트가 깨진다. 양방향 연관관계 엔티티를 JSON으로 직렬화하면 서로를 계속 참조해 StackOverflowError가 날 수도 있다. 그래서 UserRequest·UserResponse처럼 요청·응답용 DTO를 나누고, 정적 팩토리 UserResponse.from(user)처럼 변환은 한 곳에서 한다.
  - q: "@Valid와 @Validated의 차이는?"
    a: "@Valid는 자바 표준(jakarta.validation) 어노테이션으로, 컨트롤러의 @RequestBody DTO를 ArgumentResolver가 바인딩하는 과정에서 검증하고 실패하면 MethodArgumentNotValidException으로 400을 낸다. @Validated는 스프링 어노테이션으로 클래스에 붙이면 MethodValidationPostProcessor가 그 빈을 AOP 프록시로 감싸, 서비스 메서드 파라미터나 @RequestParam 단일 값에 붙은 제약을 검증하고 실패 시 ConstraintViolationException을 던진다."
related:
  - spring-mvc-flow
  - ioc-di-bean
  - proxy-aop
  - jpa-entity-repository
  - web-basics/form-validation
source: 2부 슬라이드 p.78–93(Service·Repository 역할, Controller→Service→Repository 실습, H2·data.sql) — Day 3 오후 (08-12); p.179–195(입력값 검증·DTO·@Valid vs @Validated·검증 어노테이션) — Day 4 (08-13), 실습 02.layer/02.myapp-svc-repo, 09.valid, 내 myapp UserRequest·UserService
---

```layers
Controller (@RestController) :: HTTP ↔ 자바 변환, @Valid 검증, DTO 반환 — 업무 규칙 없음
Service (@Service) :: 업무 로직, 여러 Repository 조합, @Transactional 경계
Repository (@Repository) :: JpaRepository — DB 접근만, SQL·JPA 세부를 감춤
DB :: H2 인메모리 (users, products) — data.sql로 초기 데이터
```

```java
// 요청 DTO — 검증 규칙은 DTO 필드에
@Data @NoArgsConstructor @AllArgsConstructor
public class UserRequest {
    @NotBlank(message = "이름은 필수입니다")
    private String name;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}

@PostMapping("/users")                     // 검증 실패 → 400 Bad Request
public User createUser(@Valid @RequestBody UserRequest request) { ... }

@Service
@Validated                                 // 서비스 메서드도 프록시로 검증
public class UserService {
    public User createUser(@Valid UserRequest request) { ... }
}
```

| 검증 위치 | 동작 방식 | 실패 예외 |
| --- | --- | --- |
| @RequestBody + @Valid | ArgumentResolver 바인딩 중 검증 | MethodArgumentNotValidException |
| @ModelAttribute + @Valid | 폼·쿼리 바인딩 중 검증 | BindException |
| @RequestParam 단일 값 + 클래스 @Validated | AOP 프록시 메서드 검증 | ConstraintViolationException |

> [!warn] 헷갈리기 쉬움
> @NotNull은 null만 막고, @NotEmpty는 null과 빈 값(길이 0)을, @NotBlank는 공백 문자열까지 막는다(String 전용). 이름·이메일 같은 문자열 필수 입력은 @NotBlank가 맞다.
