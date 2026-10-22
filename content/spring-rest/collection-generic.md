---
title: 컬렉션과 제네릭
en: Java Collections Framework, Generics
summary: List·Set·Map·Queue는 데이터 묶음을 다루는 표준 인터페이스, 제네릭은 그 요소 타입을 컴파일 시점에 고정한다
importance: 3
order: 4
tags:
  - Java
  - Collection
  - Generic
keypoints:
  - List 순서·중복 허용, Set 중복 불허, Map 키-값, Queue FIFO
  - ArrayList는 조회 O(1)·중간 삽입 O(n), LinkedList는 그 반대
  - "제네릭 와일드카드 — ? extends T는 읽기, ? super T는 쓰기 전용"
qa:
  - q: ArrayList와 LinkedList의 차이는?
    a: ArrayList는 동적 배열이라 인덱스 조회가 O(1)로 빠르지만 중간 삽입·삭제는 뒤 요소를 밀어야 해서 O(n)이다. LinkedList는 이중 연결 리스트라 노드 연결만 바꾸면 되어 삽입·삭제가 O(1)이지만, 조회는 처음부터 따라가야 해서 O(n)이고 노드 참조 때문에 메모리를 더 쓴다. 둘 다 동기화가 없어 멀티스레드에서 동시 접근이 필요하면 Vector 같은 동기화 구현을 고려한다.
  - q: HashMap, LinkedHashMap, TreeMap은 어떻게 고르나?
    a: HashMap은 해시 테이블 기반으로 검색·삽입·삭제가 가장 빠르지만 순서를 보장하지 않는다. LinkedHashMap은 이중 연결 리스트를 더해 삽입 순서를 유지하고, TreeMap은 Red-Black Tree로 키를 정렬된 순서로 유지해 범위 조회에 유리하다. 빠르기만 하면 HashMap, 순서 유지면 LinkedHashMap, 정렬이면 TreeMap이다.
  - q: "제네릭의 ? extends T와 ? super T의 차이는?"
    a: "? extends T는 T 또는 하위 타입의 리스트를 받는 상한 제한이라, 꺼낸 값은 최소 T임이 보장되어 읽기는 안전하지만 실제 타입을 몰라 add는 컴파일 오류다. ? super T는 T 또는 상위 타입의 리스트를 받는 하한 제한이라, T를 넣는 쓰기는 안전하지만 꺼내면 Object로만 받을 수 있다. 실습에서 sumBox(List<? extends Number>)는 읽기 전용, addBox(List<? super Integer>)는 쓰기 전용임을 컴파일 오류로 확인했다."
related:
  - lambda-stream
  - oop-polymorphism
source: Java 슬라이드 p.202–228(컬렉션 종류·List·Set·Map·Queue·Deque·Stack·Collection 인터페이스), p.229–240(제네릭·타입 제한·와일드카드) — Day 2 (08-11), 실습 08.collection/Calculator·CalculatorMap, 09.generic/GenericsExample·BoundedGenericsExample
---

```compare
ArrayList | LinkedList | Vector
구조 | 동적 배열 | 이중 연결 리스트 | 동적 배열 + synchronized
조회 | O(1) 빠름 | O(n) 느림 | O(1) 빠름
삽입·삭제 | O(n) 느림 | O(1) 빠름 | O(n) 느림
멀티스레드 | 비추천 | 비추천 | 안전 (대신 느림)
적합 | 조회가 많을 때 | 삽입·삭제가 많을 때 | 동시 접근이 필요할 때
```

| 필요 | Set | Map |
| --- | --- | --- |
| 가장 빠르게 | HashSet | HashMap |
| 삽입 순서 유지 | LinkedHashSet | LinkedHashMap |
| 정렬 | TreeSet | TreeMap |

```java
// 실습: 계산 기록을 배열 → ArrayList → HashMap으로
List<String> history = new ArrayList<>();
history.add("10 + 10 = 20");
Iterator<String> it = history.iterator();
while (it.hasNext()) System.out.println(it.next());

Map<Integer, String> historyMap = new HashMap<>();
historyMap.put(record.hashCode(), record);           // key는 문자열 해시값
for (Map.Entry<Integer, String> e : historyMap.entrySet())
    System.out.println(e.getKey() + ": " + e.getValue());

// 제네릭 — 타입을 컴파일 시점에 고정, 꺼낼 때 형변환 없음
class Box<T> { private T item; T getItem() { return item; } }
```

> [!warn] 헷갈리기 쉬움
> `Collection`은 List·Set·Queue의 최상위 인터페이스, `Collections`는 sort·reverse·shuffle 같은 static 유틸리티 클래스다. 변수 타입은 구현체(ArrayList)가 아니라 인터페이스(List)로 선언해야 교체가 쉽다.
