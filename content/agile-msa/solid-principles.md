---
title: SOLID 원칙과 MSA 분리
en: SOLID Principles
summary: "객체지향 설계 5원칙 — 책임을 잘게 나눈 클래스가 그대로 독립 서비스로 떼어낼 수 있는 단위가 된다"
importance: 3
order: 9
tags:
  - 객체지향
  - Java
  - Spring
  - 리팩토링
keypoints:
  - "SRP 단일 책임, OCP 확장엔 열고 수정엔 닫기, LSP 자식으로 치환 가능"
  - "ISP 작은 인터페이스로 분리, DIP 추상화에 의존 (Spring DI·IoC의 핵심)"
  - "LoginService 하나 → Validator·TokenIssuer·Logger 분리 → 인증서버로 이관"
qa:
  - q: "SOLID 원칙을 설명해 보라."
    a: "SRP는 한 클래스가 하나의 책임만 갖는 것으로 Controller·Service·Repository 계층 분리가 예다. OCP는 기존 코드를 고치지 않고 기능을 확장하는 것으로 인터페이스 기반 구현체 추가나 전략 패턴을 쓴다. LSP는 부모 타입 자리에 자식 객체를 넣어도 똑같이 동작해야 한다는 것, ISP는 필요한 기능만 가진 작은 인터페이스로 나누는 것, DIP는 구현 클래스가 아닌 추상화(인터페이스)에 의존하는 것으로 Spring DI와 IoC의 핵심 원칙이다."
  - q: "SOLID가 MSA와 어떤 관계인가?"
    a: "수업에서는 입력 검증·비밀번호 확인·세션 생성·로그 기록을 모두 하던 Pure Java LoginService를 SRP로 CredentialValidator, SessionManager/TokenIssuer, AuthLogger로 나누고, DIP로 UserRepository 인터페이스에 의존하게 바꿨다. 책임이 분리되자 Validator는 인증서버 내부 로직, TokenIssuer는 OAuth 토큰 발급 모듈, Logger는 Kafka 이벤트 발행으로 각각 옮길 수 있었다. 클래스 수준의 책임 분리가 서비스 수준 분리의 전제라는 것이다."
related:
  - auth-server-gateway
  - service-decomposition-data
source: "2026-08-27 교재 p.64–66 (모놀리식 인증/로그인 vs SOLID 구조, SOLID 원칙 표, 컴포넌트 분리 매핑), p.68–69 (Sprint 1 Task 분할, SOLID → Spring Boot OAuth 인증서버 구현 프로세스)"
---

```compare
Before — Pure Java 단일 클래스 | After — SOLID 적용
구조 | LoginService 하나가 검증·비밀번호 확인·세션·로그 전부 담당 | CredentialValidator / SessionManager / AuthLogger로 책임 분리 (SRP)
확장 | 인증 방식 추가 시 기존 코드 수정 | 비밀번호·OAuth 구현체만 추가 (OCP)
의존 | 구체 클래스에 직접 의존 | UserRepository 인터페이스에 의존, 구현체 주입 (DIP)
재사용 · 테스트 | 인증 로직만 떼어내기 어렵고 전체를 실행해야 검증 | 책임 단위로 이관·검증 가능
```

| 기존 모놀리스 컴포넌트 | SOLID 적용 후 역할 | 이관될 MSA 서비스 |
| --- | --- | --- |
| CredentialValidator | 회원 자격 검증 (SRP) | 인증서버 내부 로직 |
| SessionManager / TokenIssuer | 세션 관리 → JWT·OAuth 토큰 발급으로 전환 | 인증서버 OAuth 모듈 |
| LoginController | 요청 수신, 응답 반환 | API Gateway 진입점 + 인증서버 REST API |
| AuthLogger | 인증 이력 기록 | 이벤트 발행 후 Kafka로 비동기 전달 (Sprint 3) |

- Sprint 1 구현 순서: 기존 로직 분석(3) → SOLID 리팩토링(5) → Spring Boot 프로젝트로 이관, `@Service`·`@Component` 등록(3) → OAuth 2.0 Authorization Server 설정(5) → Gateway 라우팅·인증 필터(3), 괄호는 Story Point

> [!tip] 면접 팁
> 원칙 이름만 나열하지 말고 "Spring에서는 어떻게 나타나나"를 한 마디씩 붙이면 좋다 — SRP는 계층 분리, OCP는 전략 패턴, DIP는 생성자 주입.
