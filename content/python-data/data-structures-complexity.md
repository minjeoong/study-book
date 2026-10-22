---
title: 자료구조와 시간복잡도
en: list, tuple, set, dict, deque & collections
summary: 내부 구조(동적 배열, 해시 테이블, 블록 연결 리스트)가 연산별 시간복잡도와 쓰임새를 결정한다
importance: 3
order: 2
tags: [자료구조, 시간복잡도, 해시, collections, mutable]
keypoints:
  - list는 동적 배열이라 끝 append는 O(1), 맨 앞 insert·pop(0)은 O(n)
  - set·dict는 해시 테이블이라 탐색·삽입·삭제 평균 O(1), 키는 불변 객체만
  - 양끝 큐는 deque, 빈도는 Counter, 그룹핑은 defaultdict, 우선순위는 heapq
qa:
  - q: list와 tuple의 차이는?
    a: "둘 다 순서가 있는 시퀀스지만 list는 가변(mutable), tuple은 불변(immutable)입니다. tuple은 값이 바뀌지 않아 해시가 가능하므로 dict의 키나 set의 원소로 쓸 수 있고, 메모리를 덜 쓰고 조금 더 빠릅니다. 바뀌면 안 되는 레코드(좌표, 설정값)에 씁니다."
  - q: 리스트에서 x in lst와 집합에서 x in s의 속도 차이는?
    a: "list는 처음부터 하나씩 비교하므로 O(n), set은 해시값으로 위치를 바로 찾으므로 평균 O(1)입니다. 다만 O(1)은 평균이고 해시 충돌이나 리사이징이 생기면 최악 O(n)까지 느려질 수 있습니다. 중복 제거나 존재 여부 확인이 잦으면 set으로 바꾸는 것이 기본 최적화입니다."
  - q: 큐를 list로 구현하면 왜 느린가요? deque는?
    a: "list는 동적 배열이라 pop(0)이나 insert(0, x)를 하면 뒤 원소를 전부 한 칸씩 옮겨야 해서 O(n)입니다. collections.deque는 고정 크기 배열 블록을 양방향으로 연결한 구조라 양쪽 끝 삽입·삭제가 O(1)이고, 대신 중간 인덱스 접근은 O(n)입니다."
related: [comprehension-generator, pandas-essentials]
source: Day1 (8/6) 슬라이드 p.34–42 (제어문, Short-circuit, 연산자), p.53–70 (list·tuple·set·dict·deque, collections, heapq, bisect, 자료구조 비교, O(n)·O(logN)), Practice 1 심화 (Counter, defaultdict)
---

| 자료구조 | 순서 | 변경 | 중복 | 내부 구조 | 핵심 연산 | 쓰임 |
| --- | --- | --- | --- | --- | --- | --- |
| list | O | O | O | 동적 배열 | 인덱스 O(1), 끝 append O(1), 앞 삽입 O(n) | 일반 시퀀스 |
| tuple | O | X | O | 불변 배열 | 인덱스 O(1), 해시 가능 | dict 키, 고정 레코드 |
| set | X | O | X | 해시 테이블 | in·add·remove O(1), 합·교·차집합 | 중복 제거, 필터링 |
| dict | O (3.7+) | O | 키 X | 해시 테이블 | 키 조회 O(1) | 키-값 매핑 (DataFrame의 뼈대) |
| deque | O | O | O | 배열 블록 양방향 연결 | 양끝 삽입·삭제 O(1) | 큐, 스택, 슬라이딩 윈도우 |
| heapq | 힙 순서 | O | O | 최소 힙 (list) | push·pop O(log N) | 우선순위 큐, 다익스트라 |
| bisect | 정렬 유지 | O | O | 정렬 list + 이진 탐색 | 위치 탐색 O(log N) | 정렬된 데이터 빠른 검색 |

```compare
list (동적 배열) | deque (배열 블록 양방향 연결)
끝 append · pop | O(1) | O(1)
앞 insert(0) · pop(0) | O(n), 뒤 원소 전부 이동 | O(1), appendleft · popleft
인덱스 접근 | O(1) | 양끝 O(1), 중간 O(n)
쓰임 | 일반 시퀀스, 인덱싱·슬라이싱 | 큐, 스택, 슬라이딩 윈도우
```

```python
from collections import Counter, defaultdict
import heapq

Counter(["서울", "부산", "서울"]).most_common(1)   # [('서울', 2)] — value_counts 대용
by_cat = defaultdict(list)                          # 없는 키 접근 시 [] 자동 생성
for s in sales:
    by_cat[s["category"]].append(s["amount"])       # if key not in dict 분기 불필요
heapq.heappush(h, -score)                           # 최대 힙은 음수로 넣고 빼서 부호 반전
```

> [!warn] 헷갈리기 쉬움
> ==는 값 비교, is는 같은 객체(id)인지 비교 (None은 is None). None, 0, "", [], {}는 모두 False로 평가된다. and/or는 bool이 아니라 원래 값을 반환하므로 `config.get("key") or "default"`로 기본값 처리, `if user and user.is_active`로 None 접근 오류를 막는다 (단락 평가).
