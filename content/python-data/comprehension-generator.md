---
title: 컴프리헨션과 제너레이터
en: Comprehension & Generator (yield)
summary: 반복문을 한 줄 표현식으로 줄이는 컴프리헨션, 값을 필요할 때 하나씩 만들어 메모리를 아끼는 제너레이터
importance: 3
order: 3
tags: [컴프리헨션, 제너레이터, yield, lazy, 메모리]
keypoints:
  - "[식 for x in 반복 if 조건]은 list·dict·set 모두 가능, ()로 감싸면 제너레이터 표현식"
  - yield는 값을 내주고 실행 상태를 저장한 채 멈췄다가 다음 호출에서 이어서 실행
  - 리스트는 전부 메모리에, 제너레이터는 한 번에 하나 (1만 개 기준 약 87KB vs 약 100B)
qa:
  - q: 리스트 컴프리헨션이 for문 + append보다 빠른 이유는?
    a: "for문은 매 반복마다 lst.append라는 메서드를 찾아 호출하는 바이트코드가 실행되지만, 컴프리헨션은 전용 명령(LIST_APPEND)으로 바로 원소를 추가합니다. dis 모듈로 바이트코드를 비교해 보면 차이가 보입니다. 다만 조건이 복잡해지면 가독성을 위해 일반 for문이 낫습니다."
  - q: yield와 return의 차이는?
    a: "return은 값을 돌려주고 함수를 끝내지만, yield는 값을 하나 내준 뒤 지역 변수와 실행 위치를 보존한 채 일시정지합니다. 다음 next() 호출 때 멈춘 지점부터 이어서 실행되므로, 함수가 반복 가능한 제너레이터 객체가 됩니다. 제너레이터는 한 번 다 소비하면 다시 순회할 수 없습니다."
  - q: 제너레이터는 언제 쓰나요?
    a: "전체를 메모리에 올릴 필요가 없을 때입니다. 수백만 행 CSV를 한 줄씩 읽어 처리하거나, 무한 수열이나 스트리밍 파이프라인을 만들 때 씁니다. 실습에서 amount > 1000인 행만 yield하는 제너레이터와 리스트를 sys.getsizeof로 비교해 제너레이터가 훨씬 작다는 것을 확인했습니다."
related: [data-structures-complexity, closure-decorator, pandas-essentials]
source: Day1 (8/6) 슬라이드 p.43–52 (반복문, 고급 반복 제어, List·Dict Comprehension), p.71–80 (zip, zip_longest), p.84 (제너레이터 대용량 처리), p.113–114 (Generator vs List), Practice 1 심화 3번 (제너레이터 메모리 비교)
---

```compare
리스트 컴프리헨션 | 제너레이터 표현식
문법 | [x*x for x in range(10)] | (x*x for x in range(10))
생성 시점 | 즉시 전부 생성 | 필요할 때 하나씩 (lazy)
메모리 | 전체 원소 크기만큼 | 상태만 저장, 거의 일정
재사용 | 여러 번 순회 가능 | 한 번 소비하면 끝
쓰임 | 결과를 여러 번 쓰거나 인덱싱 | 대용량 스트리밍, sum·max에 바로 전달
```

```python
squares = {i: i**2 for i in range(1, 6) if i % 2 == 0}   # dict 컴프리헨션 {2: 4, 4: 16}
person = dict(zip(["name", "age"], ["Alice", 25]))          # zip은 짧은 쪽 기준

def read_rows(path):                 # 제너레이터 함수
    with open(path) as f:
        next(f)                      # 헤더 스킵
        for line in f:
            yield line.strip().split(",")

total = sum(float(r[2]) for r in read_rows("large.csv"))  # 한 번에 한 행만 메모리에
```

> [!warn] 헷갈리기 쉬움
> sys.getsizeof는 객체 자체 크기(shallow)만 잰다. 제너레이터를 list()로 바꿔 비교하면 메모리 차이를 확인할 수 없다 (실습 감점 항목). 길이가 다른 리스트를 묶을 땐 zip 대신 itertools.zip_longest(fillvalue=...)를 쓴다.
