---
title: SOLID 원칙과 객체 생성 패턴
en: SOLID Principles, Creational Patterns
summary: 결합도를 낮추고 응집도를 높이는 다섯 설계 원칙과, 객체 생성을 감추는 Singleton·Factory·Builder 패턴
importance: 3
order: 7
tags:
  - 설계
  - SOLID
  - 디자인 패턴
keypoints:
  - SRP 책임 하나 · OCP 확장엔 열고 수정엔 닫기 · LSP 자식이 부모를 대체
  - ISP 작은 인터페이스로 분리 · DIP 구현이 아니라 추상화에 의존
  - 생성 패턴 — Singleton · Factory Method · Builder
qa:
  - q: SOLID 원칙을 예시와 함께 설명하라.
    a: SRP는 클래스가 바뀔 이유가 하나여야 한다는 것으로 Controller·Service·Repository 분리가 예다. OCP는 결제 수단이 늘어도 PaymentService를 고치지 않도록 Payment 인터페이스로 추상화하고 NaverPay 같은 구현만 추가하는 것이고, LSP는 Square가 Rectangle의 setWidth 계약을 깨면 위반이다. ISP는 거대한 SmartPrinter 대신 Printer·Copier·Fax로 쪼개는 것, DIP는 Computer가 Keyboard 구현이 아니라 InputDevice 인터페이스에 의존하는 것이다.
  - q: DIP와 스프링 DI는 어떤 관계인가?
    a: DIP는 고수준 모듈(업무 흐름)이 저수준 구현(기술·라이브러리)이 아닌 추상화에 의존해야 한다는 설계 원칙이고, DI는 그 원칙을 실현하는 기법이다. 실습에서 Computer는 생성자로 InputDevice·OutputDevice를 받고, 어떤 구현을 넣을지는 main(Composition Root)에서만 정했다. 스프링에서는 이 조립을 IoC 컨테이너가 대신해 준다.
  - q: 싱글톤 패턴의 장단점과 스프링 빈과의 관계는?
    a: private 생성자와 static 인스턴스로 앱 전체에 객체 하나만 두는 패턴으로, 메모리 절약과 전역 공유가 장점이고 테스트가 어렵고 결합도가 높아지며 멀티스레드 동기화가 필요한 것이 단점이다. 스프링은 @Component·@Service 빈을 컨테이너가 싱글톤으로 관리해 주므로 클래스에 싱글톤 코드를 직접 쓰지 않는다. 대신 하나를 여러 요청이 공유하므로 필드에 요청별 상태를 두지 않는 무상태로 설계해야 한다.
related:
  - oop-polymorphism
  - ioc-di-bean
  - layered-dto-validation
  - agile-msa/solid-principles
source: Java 슬라이드 p.312–320(Singleton·Factory Method·Abstract Factory·Builder), p.321–336(SOLID 5원칙) — Day 3 오전 (08-12), 실습 14.pattern(User.Builder), 15.solid/02.ocp·03.lsp·05.dip
---

| 원칙 | 한 줄 정의 | 실습·예시 |
| --- | --- | --- |
| SRP 단일 책임 | 클래스가 바뀔 이유는 하나 | Employee에서 급여 계산을 PayCalculator로 분리 |
| OCP 개방-폐쇄 | 확장에는 열리고 수정에는 닫힘 | Payment 인터페이스 + KakaoPay·CardPay·NaverPay 추가 |
| LSP 리스코프 치환 | 자식은 부모 자리에 넣어도 정상 동작 | Square extends Rectangle(위반) → 둘 다 Shape 구현 |
| ISP 인터페이스 분리 | 쓰지 않는 메서드에 의존하지 않음 | SmartPrinter → Printer · Copier · Fax |
| DIP 의존 역전 | 고수준·저수준 모두 추상화에 의존 | Computer → InputDevice · OutputDevice |

```compare
DIP 위반 | DIP 준수
의존 대상 | Keyboard, Monitor 구현 클래스 | InputDevice, OutputDevice 인터페이스
생성 | Computer 안에서 new Keyboard() | 밖(main·컨테이너)에서 만들어 생성자로 주입
무선 키보드 추가 | Computer 코드 수정 필요 (OCP도 위반) | WirelessKeyboard만 추가, Computer 그대로
테스트 | 가짜 장치로 바꿔 끼우기 어려움 | Mock 구현을 넣어 바로 테스트
```

```java
// Builder — 생성자 인자가 많을 때 이름을 붙여 단계별로 조립
User user = new User.Builder()
        .setName("홍길동")
        .setAge(20)
        .setEmail("hong@sk.com")
        .build();                  // private 생성자는 Builder만 호출 (Lombok @Builder로 대체 가능)
```

> [!tip] 면접 팁
> SOLID 다섯 개를 다 외우기보다 "결국 인터페이스로 What과 How를 분리해 변경이 퍼지지 않게 하는 원칙"이라는 큰 그림을 먼저 말하고, OCP·DIP를 결제 예시로 보여 주는 편이 설득력이 있다.
