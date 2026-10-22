---
title: 동기 vs 비동기 처리와 배칭
en: Sync vs Async (async/await), Request Batching
summary: "비동기는 추론을 빠르게 하는 게 아니라 I/O 대기 중 다른 요청을 함께 받는 구조, 배칭은 여러 요청을 모아 한 번에 추론해 처리량을 높이는 방법"
importance: 2
order: 4
tags: [async, await, 이벤트 루프, run_in_threadpool, Batching, Throughput]
keypoints:
  - "동기는 추론이 끝날 때까지 다른 요청 대기, 비동기는 이벤트 루프가 대기 중 다른 요청 처리"
  - "async def 안의 블로킹 추론은 run_in_threadpool로 넘겨야 루프가 막히지 않음"
  - "배칭: 최대 8건 또는 50ms까지 모아 GPU 1회 연산 → 처리량↑"
qa:
  - q: "FastAPI에서 def와 async def는 어떻게 고르나요?"
    a: "함수 안에서 DB 조회, 외부 API 호출, 업로드 파일 읽기처럼 await로 I/O를 기다려야 하면 async def를, 그렇지 않으면 평범한 def를 씁니다. FastAPI는 def 핸들러를 스레드풀에서 실행해 주지만, async def 안에서 무거운 동기 추론을 그냥 호출하면 이벤트 루프 전체가 멈춥니다. 그래서 비동기 핸들러에서는 run_in_threadpool로 추론을 넘기며, 실습 프로젝트는 파일 업로드 핸들러 하나만 async def였습니다."
  - q: "비동기로 바꾸면 추론이 빨라지나요?"
    a: "아닙니다. 비동기는 더 빠른 추론이 아니라 동시에 더 많은 요청을 받아낼 수 있는 구조입니다. 1초짜리 요청 3개가 동시에 오면 동기 서버는 순차로 약 3초, 비동기 서버는 대기 시간을 겹쳐 약 1초 내외로 끝낼 수 있습니다. 처리량을 더 높이려면 짧은 시간 동안 요청을 모아 한 번에 추론하는 배칭을 함께 씁니다."
related: [batch-vs-realtime-serving, fastapi-pydantic, auto-retraining-loop]
source: "Day1 슬라이드 p.27–31 (동기 vs 비동기, async/await 코드, 배치 처리로 처리량 개선, 설계 트레이드오프), FastAPI 기본 문법 자료 1장, 실습 ex1 slow-ping, 실습 가이드 부록1 #8"
---

```compare
동기 (Sync) | 비동기 (Async)
동작 | 추론이 끝날 때까지 다른 요청 대기 | 대기 중 이벤트 루프가 다른 요청 처리
동시 요청 3건 (예시) | 순차 처리, 약 3초 | 동시 처리, 약 1초 내외
구현·디버깅 | 쉬움, 직관적 | async/await 이해 필요, 디버깅 어려움
적합 | CPU 바운드, 순서가 중요한 단순 로직 | I/O 바운드 (추론 대기, DB, 외부 API)
```

```python
@app.post("/predict-sync")
def predict_sync(req: PredictRequest):
    return heavy_model_inference(req.text)                        # blocking

@app.post("/predict-async")
async def predict_async(req: PredictRequest):
    return await run_in_threadpool(heavy_model_inference, req.text)  # 루프를 막지 않음

BATCH_SIZE, BATCH_TIMEOUT = 8, 0.05                              # 최대 8건 또는 50ms 대기
async def batch_worker(queue):
    batch = await collect_until(queue, BATCH_SIZE, BATCH_TIMEOUT)
    results = model.predict_batch([item.text for item in batch])  # GPU 연산 1회
    for item, result in zip(batch, results):
        item.future.set_result(result)                            # 각 요청자에게 반환
```

> [!warn] 실습에서 만난 문제
> 드리프트 감지 후 fine-tuning을 요청 처리 중에 동기로 돌리면 /predict/batch-test 응답이 오래 걸리거나 타임아웃된다. 재학습은 BackgroundTasks나 백그라운드 스레드로 응답과 분리하고, 중복 실행은 락으로 막는다.
