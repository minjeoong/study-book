---
title: JVM 구조와 메모리 (Stack·Heap·GC)
en: JVM Architecture, Memory Areas, Garbage Collection
summary: 바이트코드를 JVM이 실행하고, 지역 변수는 Stack·객체는 Heap에 두며 GC가 Heap의 쓰레기 객체를 치운다
importance: 3
order: 1
tags:
  - Java
  - JVM
  - 메모리
  - GC
keypoints:
  - ".java → javac → .class(바이트코드) → JVM이 OS별로 실행해 플랫폼 독립"
  - Stack은 스레드별 프레임·지역 변수, Heap은 공유 객체 공간
  - "== 는 참조(주소) 비교, equals()는 값 비교 — 래퍼·String은 equals"
qa:
  - q: Stack과 Heap 메모리의 차이는?
    a: Stack은 스레드마다 하나씩 있고 메서드를 호출할 때마다 프레임이 쌓였다가 끝나면 사라지며, 지역 변수·기본형 값·참조값이 들어간다. Heap은 모든 스레드가 공유하고 new로 만든 객체와 배열이 저장되며 GC가 관리한다. Person p = new Person()이라면 참조 p는 Stack에, Person 객체는 Heap에 있다.
  - q: Minor GC와 Major GC, Stop-the-World를 설명하라.
    a: 새 객체는 Heap의 Young 영역(Eden)에 생기고, 여기서 일어나는 Minor GC는 대상이 작아 빠르다. 여러 번 살아남은 객체는 Survivor를 거쳐 Old로 옮겨지고, Old의 Major(Full) GC는 객체가 크고 참조가 복잡해 느리다. GC 동안 JVM의 모든 스레드가 멈추는 것을 Stop-the-World라 하며, ZGC처럼 스레드를 거의 멈추지 않는 GC로 지연을 줄인다.
  - q: Integer 두 개를 == 로 비교하면 안 되는 이유는?
    a: 래퍼 클래스는 객체라 == 는 값이 아니라 Heap 주소를 비교한다. 실습 NumberBox에서 Integer 100끼리 == 가 true로 나온 것은 -128~127 범위를 캐싱해 같은 객체를 재사용했기 때문이고, 범위를 넘으면 false가 된다. 값 비교는 항상 equals()로 하고, 직접 만든 클래스는 equals·hashCode를 함께 재정의한다.
related:
  - java-exception
  - oop-polymorphism
  - collection-generic
source: Java 슬라이드 p.22–33(자바와 JVM·Stack vs Heap), p.51–57(기본형·참조형·래퍼, NumberBox), p.144(Object.equals), p.174–180(JVM 구조·Heap·GC) — Day 1 (08-10)
---

```layers
Method Area (Metaspace) :: 클래스 메타데이터·메서드 바이트코드 — 모든 스레드 공유
Heap :: new로 만든 객체·배열 — 공유, GC 대상 (Young = Eden·S0·S1 / Old)
Java Stack :: 메서드 프레임·지역 변수·참조값 — 스레드별
PC Register :: 지금 실행 중인 바이트코드 위치 — 스레드별
Native Method Stack :: JNI로 부르는 C/C++ 메서드용 — 스레드별
```

```compare
Minor GC | Major (Full) GC
영역 | Young (Eden, Survivor) | Old
대상 | 막 생긴 짧은 수명 객체 | Young에서 살아남은 큰·오래된 객체
속도 | 빠름 | 느림 — 참조 구조 복잡, 메모리 분산
영향 | 짧은 STW | 긴 STW → 응답 지연의 주범
```

```java
void method() {
    int a = 10;                  // Stack: 기본형 값
    String s = "Hello";          // Stack: 참조, 문자열은 Heap 상수 풀
    Person p = new Person();     // Stack: 참조 p, Heap: Person 객체
}

Integer A = 100, B = 100;
System.out.println(A == B);       // 주소 비교 (캐시 범위라 우연히 true)
System.out.println(A.equals(B));  // 값 비교 — 항상 이쪽
```

> [!tip] 면접 팁
> "바이트코드 → JVM → JIT" 한 줄로 플랫폼 독립성을 설명한 뒤, 메모리 그림(Stack의 참조가 Heap 객체를 가리킴)을 말로 그리면 GC 질문까지 자연스럽게 이어진다.
