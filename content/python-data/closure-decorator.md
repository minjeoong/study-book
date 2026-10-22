---
title: 함수, 클로저, 데코레이터
en: First-class Function, Closure, Decorator
summary: 함수는 일급 객체라 인자·반환값이 될 수 있고, 이를 이용해 외부 변수를 기억하는 클로저와 기존 함수에 기능을 덧씌우는 데코레이터를 만든다
importance: 3
order: 4
tags: [함수, 클로저, 데코레이터, functools, 고차함수]
keypoints:
  - "*args는 위치 인자를 tuple로, **kwargs는 키워드 인자를 dict로 받는다 (일반 → *args → **kwargs 순)"
  - 클로저는 외부 함수가 끝난 뒤에도 내부 함수가 외부 변수를 기억하는 구조
  - "데코레이터는 함수를 받아 wrapper를 반환하는 함수, @functools.wraps로 원래 이름·docstring 보존"
qa:
  - q: 데코레이터가 무엇이고 어떻게 동작하나요?
    a: "함수를 인자로 받아 기능을 덧붙인 새 함수(wrapper)를 반환하는 고차 함수입니다. @timer를 붙이면 add = timer(add)와 같아서, 원래 코드를 고치지 않고 실행 시간 측정, 로깅, 인증, 재시도, 캐싱 같은 공통 기능을 분리할 수 있습니다. FastAPI의 @app.get 라우팅도 데코레이터입니다."
  - q: 클로저와 데코레이터는 어떤 관계인가요?
    a: "클로저는 내부 함수가 외부 함수의 지역 변수를 기억하는 특성이고, 데코레이터는 그 클로저를 이용해 원래 함수(func)를 wrapper 안에 기억해 두는 패턴입니다. 즉 데코레이터는 클로저를 활용한 함수입니다. RAG에서 retriever(vector_store)가 search 함수를 반환해 저장소를 계속 참조하는 것도 클로저입니다."
  - q: functools.wraps는 왜 필요한가요? 데코레이터를 여러 개 쌓으면 순서는?
    a: "데코레이터를 씌우면 함수 이름이 wrapper로, docstring도 wrapper 것으로 바뀌어 디버깅과 문서화가 어려워집니다. @wraps(func)를 붙이면 원래 __name__과 __doc__이 유지됩니다. @d1 @d2 순으로 쌓으면 d1(d2(f))가 되어 d1 전 → d2 전 → f → d2 후 → d1 후 순으로 실행됩니다."
related: [comprehension-generator, exception-logging]
source: Day1 (8/6) 슬라이드 p.99–112 (함수 정의, 기본값, *args·**kwargs, 일급 객체, 람다, 고차함수 map·filter·reduce, 클로저, partial), p.115–124 (내장 함수, 표준 라이브러리), p.131–146 (데코레이터, 체이닝, functools.wraps, FastAPI·LLM·RAG·Agent 활용, @timer·@retry·@lru_cache)
---

```python
import time
from functools import wraps, lru_cache

def timer(func):                       # 함수를 받아서
    @wraps(func)                       # 원래 __name__, __doc__ 유지
    def wrapper(*args, **kwargs):      # 어떤 인자든 그대로 전달
        t = time.perf_counter()
        result = func(*args, **kwargs) # 클로저: 바깥의 func를 기억
        print(f"{func.__name__}: {time.perf_counter() - t:.3f}s")
        return result
    return wrapper                     # 새 함수를 반환

@timer                                 # load_data = timer(load_data)
def load_data(path): ...

@lru_cache(maxsize=128)                # 같은 인자면 재계산 생략
def expensive_stats(key): ...
```

```layers
@decorator1의 wrapper :: 가장 바깥. 실행 전 출력 → 안쪽 호출 → 실행 후 출력
@decorator2의 wrapper :: decorator1 안에서 실행 (택배박스 안의 포장)
say_hello :: 원래 함수, 두 wrapper의 실행 전 출력 다음에 가장 안쪽에서 실행
```

- 실무 활용: FastAPI `@app.get` 라우팅, LLM 입력 전처리 `@clean_input`, Agent 단계 추적 `@log_agent_action`, API 수집 `@retry`
- 클로저 활용: `retriever(vector_store)`가 search 함수를 반환해 FAISS·Chroma 같은 저장소 상태를 계속 참조

> [!tip] 면접 팁
> lambda는 이름 없는 한 줄 함수 (`sorted(emps, key=lambda x: x["salary"], reverse=True)`), functools.partial은 인자 일부를 고정한 새 함수. 모두 "함수가 일급 객체"라서 가능하다고 묶어서 말하면 깔끔하다.
