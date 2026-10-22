---
title: 객체지향 4대 특징과 다형성
en: OOP — Encapsulation, Inheritance, Abstraction, Polymorphism
summary: 역할과 책임으로 객체를 나눠 높은 응집도·낮은 결합도를 얻는 설계 — 캡슐화·상속·추상화·다형성이 그 도구
importance: 3
order: 3
tags:
  - Java
  - OOP
  - 인터페이스
  - 다형성
keypoints:
  - 캡슐화·추상화·상속·다형성 — 목표는 높은 응집도와 낮은 결합도
  - 오버라이딩은 부모 메서드 재정의, 오버로딩은 같은 이름·다른 파라미터
  - 추상 클래스는 상태·공통 구현 공유, 인터페이스는 구현 없는 규약(다중 구현)
qa:
  - q: 객체지향의 4대 특징을 설명하라.
    a: 캡슐화는 필드를 private으로 숨기고 getter·setter 같은 메서드로만 접근하게 해 데이터를 보호하고 응집도를 높인다. 추상화는 인터페이스와 구현을 분리해 부품을 쉽게 교체하게 하고, 상속은 부모의 상태와 행위를 물려받아 중복을 없앤다. 다형성은 같은 타입으로 호출해도 실제 객체에 따라 다르게 동작하게 해, 기존 코드를 고치지 않고 새 기능을 추가할 수 있게 한다.
  - q: 오버로딩과 오버라이딩의 차이는?
    a: 오버라이딩은 상속 관계에서 자식이 부모 메서드를 같은 시그니처로 다시 구현하는 것으로, 어떤 메서드가 실행될지는 실행 시점의 실제 객체 타입으로 정해진다. 오버로딩은 한 클래스 안에서 이름은 같고 파라미터 개수·타입·순서가 다른 메서드를 여러 개 두는 것이다. 메서드 시그니처에 반환 타입은 포함되지 않아 반환 타입만 다른 오버로딩은 컴파일 오류다.
  - q: 추상 클래스와 인터페이스는 언제 쓰나?
    a: 추상 클래스는 필드·생성자·일부 구현을 가질 수 있어 공통 상태와 흐름을 자식과 공유할 때 쓰며 단일 상속만 된다. 인터페이스는 상수와 추상 메서드(Java 8 이후 default·static, 9 이후 private 메서드)로 이루어진 규약이라 여러 개를 동시에 구현할 수 있다. 자바는 클래스 다중 상속 시 같은 메서드가 겹치는 모호성 때문에 다중 상속 대신 인터페이스 다중 구현을 허용한다.
related:
  - solid-patterns
  - collection-generic
  - jvm-memory
source: Java 슬라이드 p.152–173(객체·OOP 4대 특징·업캐스팅) — Day 1 (08-10), p.181–201(상속·접근 제한자·인터페이스·추상 클래스·다형성) — Day 2 (08-11), 실습 07.oop/stock, stock-interface, stock-abstract, stock-poly
---

```compare
추상 클래스 | 인터페이스
목적 | 상태와 일부 공통 구현을 자식과 공유 | 구현 없이 동작 규약만 선언
상속 | 단일 상속 (extends) | 다중 구현 (implements A, B)
필드 | 인스턴스 변수, 생성자 가능 | 상수만 (public static final)
메서드 | 추상 + 일반 메서드 | 추상 + default·static·private
실습 | Stock을 abstract로, printInfo()를 추상 메서드로 | Stock을 interface로, getName·getPrice 규약
```

```java
// 업캐스팅 — 사용(What)과 구현(How)의 분리
static void printStockInfo(Stock stock) {   // 부모 타입만 안다
    stock.printInfo();                       // 실제 객체의 오버라이딩 메서드 실행
}

printStockInfo(new Stock("SKALA", 80000));
printStockInfo(new PreferredStock("Netflix", 60000, 10.0)); // 코드 수정 없이 확장

// 다운캐스팅은 instanceof로 확인 후
if (s instanceof PreferredStock) {
    PreferredStock ps = (PreferredStock) s;  // 자식 전용 메서드 사용 가능
    ps.showDividend();
}
```

| 접근 제어자 | 같은 클래스 | 같은 패키지 | 자식 클래스 | 외부 |
| --- | --- | --- | --- | --- |
| public | O | O | O | O |
| protected | O | O | O | X |
| (default) | O | O | X | X |
| private | O | X | X | X |

> [!warn] 헷갈리기 쉬움
> @Override는 필수가 아니지만 붙여야 한다. 오타나 부모 시그니처 변경을 컴파일러가 잡아 주기 때문 — 안 붙이면 "재정의한 줄 알았는데 새 메서드"가 조용히 생긴다.
