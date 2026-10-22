---
title: GIL과 동시성·병렬성
en: GIL, threading, multiprocessing, asyncio
summary: CPython은 GIL 때문에 한 번에 한 스레드만 바이트코드를 실행하므로, I/O 대기는 스레드·asyncio로, CPU 연산은 멀티프로세스로 나눈다
importance: 3
order: 8
tags: [GIL, 동시성, 병렬성, asyncio, multiprocessing, 성능측정]
keypoints:
  - 동시성은 여러 작업을 번갈아 실행, 병렬성은 멀티코어에서 진짜 동시에 실행
  - GIL은 I/O 대기 중 해제되므로 I/O bound는 threading·asyncio, CPU bound는 multiprocessing
  - asyncio.gather로 API 100개 동시 호출 시 순차 약 100초 → 약 2초, 최적화 전 cProfile로 병목부터 측정
qa:
  - q: GIL이 무엇이고 왜 문제가 되나요?
    a: "CPython 인터프리터에서 한 프로세스 안의 스레드 중 하나만 바이트코드를 실행하도록 강제하는 락입니다. 메모리 관리(참조 카운팅)를 단순하고 안전하게 하려는 장치인데, 그 결과 CPU 연산을 스레드 4개로 나눠도 실제로는 하나씩 돌아가 멀티코어를 못 씁니다. I/O 대기 중에는 GIL이 풀리므로 네트워크·파일 작업은 스레드로도 효과가 있습니다."
  - q: threading과 multiprocessing은 언제 각각 쓰나요?
    a: "파일 읽기·쓰기, API 호출처럼 기다리는 시간이 긴 I/O bound 작업은 메모리를 공유하고 생성 비용이 싼 threading이 적합합니다. 수치 계산, 대용량 전처리 같은 CPU bound 작업은 프로세스마다 별도 메모리와 GIL을 갖는 multiprocessing(ProcessPoolExecutor, Pool.map)으로 코어 수만큼 병렬화합니다. 대신 프로세스 간 데이터 전달 비용을 고려해야 합니다."
  - q: asyncio는 멀티스레드인가요?
    a: "아닙니다. 단일 스레드의 이벤트 루프가 await 지점에서 대기 중인 작업을 잠시 내려놓고 다른 작업을 실행하는 협력적 동시성입니다. async def로 코루틴을 정의하고 asyncio.gather로 여러 요청을 동시에 띄우며, httpx.AsyncClient 같은 비동기 클라이언트와 함께 씁니다. LangChain, FastAPI, Agent 코드가 대부분 async 기반입니다."
related: [python-execution-model, polars-duckdb-arrow, automation-project-structure]
source: Day1 (8/6) 슬라이드 p.224–239 (동시성 vs 병렬성, GIL, NumPy GIL 해제, threading, multiprocessing, Queue, 선택 기준, FastAPI BackgroundTasks, DataLoader num_workers), p.240–244 (ProcessPoolExecutor, asyncio + httpx, timeit·cProfile·memory_profiler), Day1 종합실습 (3개 API 비동기 수집)
---

```compare
threading | multiprocessing | asyncio
실행 단위 | 스레드 (메모리 공유) | 프로세스 (별도 메모리) | 코루틴 (단일 스레드)
GIL 영향 | 받음, CPU 작업은 사실상 순차 | 프로세스마다 GIL, 회피 | 대기 중 전환이라 무관
적합 | I/O bound, 공유 상태 필요 | CPU bound (계산, 이미지, 대용량 전처리) | 대량 네트워크 I/O (API 수집)
비용 | 가벼움, 동기화(Lock) 필요 | 무거움, 프로세스 간 전달 비용 | 가장 가벼움, async 라이브러리 필요
```

```python
import asyncio, httpx

async def fetch(client, url):
    try:
        r = await client.get(url, timeout=10)
        r.raise_for_status()
        return r.json()
    except httpx.HTTPError as e:
        return {"error": str(e)}          # 하나가 실패해도 나머지는 계속

async def fetch_all(urls):
    async with httpx.AsyncClient() as c:
        return await asyncio.gather(*(fetch(c, u) for u in urls))

results = asyncio.run(fetch_all(urls))    # 이벤트 루프 시작
```

> [!warn] 헷갈리기 쉬움
> NumPy 행렬곱처럼 C 확장 내부 연산은 GIL을 풀고 BLAS 멀티스레드로 돈다. 그래서 "Python은 멀티코어를 못 쓴다"가 아니라 "순수 Python 바이트코드 스레드가 동시에 못 돈다"가 정확하다. Python 3.13부터 GIL 제거(free-threaded) 빌드가 실험 중.
