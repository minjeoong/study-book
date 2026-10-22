---
title: 람다와 Stream API
en: Lambda Expression, Functional Interface, Stream API, Optional
summary: 람다는 함수형 인터페이스의 구현을 한 줄로 쓰는 문법, Stream은 컬렉션을 선언형 파이프라인으로 처리하는 API
importance: 3
order: 5
tags:
  - Java
  - 람다
  - Stream
  - Optional
keypoints:
  - 람다 = 추상 메서드가 하나인 함수형 인터페이스의 익명 구현
  - Stream은 생성 → 중간 연산(지연) → 최종 연산 때 실행
  - 람다가 쓰는 외부 지역 변수는 final 또는 effectively final
qa:
  - q: 함수형 인터페이스와 람다 표현식이란?
    a: 추상 메서드가 딱 하나인 인터페이스를 함수형 인터페이스라 하고 @FunctionalInterface로 표시한다. 람다는 이 인터페이스의 익명 구현 객체를 (a, b) -> a + b처럼 짧게 만드는 문법으로, Java 8 이전 익명 클래스의 장황함을 없애고 함수를 값처럼 전달하게 해 준다. java.util.function에 Supplier·Consumer·Function·Predicate 같은 표준 함수형 인터페이스가 정의되어 있다.
  - q: Stream의 중간 연산과 최종 연산, 지연 연산을 설명하라.
    a: filter·map·sorted·limit 같은 중간 연산은 Stream을 반환하며 호출해도 바로 실행되지 않고 파이프라인만 만든다. count·collect·forEach 같은 최종 연산이 호출될 때 비로소 요소를 하나씩 흘려보내며 실행되는데 이를 지연 연산이라 하고, limit이 있으면 필요한 개수만 처리하고 멈춘다. for문이 '어떻게' 반복할지를 적는다면 Stream은 '무엇을' 할지만 선언한다.
  - q: Optional은 왜 쓰고 어떻게 쓰나?
    a: 값이 있을 수도 없을 수도 있다는 사실을 타입으로 드러내 NullPointerException을 막는 컨테이너다. Optional.ofNullable로 감싸고 map·filter로 가공한 뒤 orElse·orElseGet·orElseThrow로 꺼내며, get()은 값이 없으면 예외라 권장하지 않는다. Spring Data JPA의 findById가 Optional<T>를 돌려주는 것도 같은 이유다.
related:
  - collection-generic
  - reflection-annotation
  - layered-dto-validation
source: Java 슬라이드 p.241–264(함수형 프로그래밍·익명 클래스·람다·표준 함수형 인터페이스·메서드 참조·effectively final), p.265–277(Stream API·Method Chaining), p.278–283(Collections·Arrays·Optional) — Day 2 (08-11), 실습 10.lambda/AddableDemo·LambdaExternalVariable, 11.stream sample01·02, OptionalExample
---

```flow
생성 :: products.stream() — List·배열·Map.entrySet·Files.lines
중간 연산 :: filter(Predicate), map(Function), sorted, limit — 지연 실행
최종 연산 :: count, collect, forEach, reduce — 이때 비로소 실행
결과 :: long, List, Optional 등 Stream이 아닌 값
```

| 인터페이스 | 추상 메서드 | 용도 | 예 |
| --- | --- | --- | --- |
| Runnable | void run() | 인자·반환 없는 작업 | `() -> System.out.println("Hi")` |
| Supplier&lt;T&gt; | T get() | 값 공급 | `() -> "SKALA"` |
| Consumer&lt;T&gt; | void accept(T) | 값 소비 | `s -> System.out.println(s)` |
| Function&lt;T,R&gt; | R apply(T) | 변환 (map) | `s -> s.length()` |
| Predicate&lt;T&gt; | boolean test(T) | 조건 (filter) | `s -> s.startsWith("A")` |

```java
// 실습: 판매 중이고 10만 원 이하인 상품 개수 — for문을 Stream으로
long count = products.stream()
        .filter(Product::isUsable)               // 메서드 참조
        .filter(p -> p.getPrice() <= 100000)
        .count();                                // 최종 연산

int base = 10;
Function<Integer, Integer> addBase = x -> x + base;  // base는 effectively final
// base = 20;  → 컴파일 오류: 람다가 캡처한 지역 변수는 바꿀 수 없다
```

> [!tip] 면접 팁
> effectively final을 묻는다면 "람다가 실행되는 시점과 변수가 바뀌는 시점이 달라 생기는 불일치와 스레드 안전 문제를 막기 위해, 캡처한 지역 변수의 변경을 금지한다"고 답한다.
