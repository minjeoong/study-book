---
title: 모델 모니터링 — 지표, 구조화 로깅, 알림
en: Model Monitoring, Latency / Throughput / Error Rate, Structured Logging, Alerting
summary: "인프라·모델·데이터 3대 대상을 감시하고, 지연시간·처리량·에러율과 예측 오차를 JSON 로그로 남겨 집계한 뒤 임계값을 넘으면 알림을 보내는 운영 체계"
importance: 3
order: 10
tags: [모니터링, Latency, Throughput, Error Rate, 구조화 로깅, 미들웨어, 알림]
keypoints:
  - "3대 대상: 인프라(컨테이너·/health), 모델(RMSE·예측 분포·지연), 데이터(입력 분포)"
  - "추론 지표: 지연시간(ms), 처리량(초당 요청), 에러율(5xx 비율)"
  - "알림은 조건·측정 주기·대응 동작을 한 세트로 (평균 지연 > 500ms, 5분 집계, 경고)"
qa:
  - q: "모델 서빙에서 무엇을 모니터링해야 하나요?"
    a: "세 가지 대상을 봅니다. 인프라는 컨테이너 상태, CPU·메모리, 헬스체크 응답이고, 모델은 RMSE 같은 성능 지표와 예측 분포, 응답 지연시간이며, 데이터는 최근 입력 통계가 학습 시점과 얼마나 달라졌는지입니다. 서빙 지표로는 지연시간, 처리량, 5xx 에러율을 수집하고, 정답이 도착하면 예측과 비교해 오차를 계산합니다."
  - q: "로그를 왜 JSON 같은 구조화 형태로 남기나요?"
    a: "사람이 읽는 문장형 로그는 집계 스크립트가 파싱하기 어렵습니다. timestamp, path, status, duration_ms, 입력값, 예측값을 JSON 한 줄로 남기면 최근 5분 평균 지연이나 에러율을 바로 계산할 수 있고, 다음날 실제값(actual)이 도착하면 같은 레코드로 RMSE를 계산할 수 있습니다. 실습에서는 HTTP 미들웨어로 모든 요청의 처리 시간과 상태 코드를 자동으로 기록했습니다."
related: [serving-stability-lazy-eager, data-concept-drift, auto-retraining-loop]
source: "Day3 슬라이드 p.99–113 (AIOps 개요, 실습 시나리오, MLOps vs AIOps, 모니터링 3대 대상, 적용 범위, 앱 구조 확장, 추론 지표, 구조화 로깅, 알림 설계, 로깅 미들웨어, /metrics 엔드포인트), p.129–130·136–137 (AIOps 설계 워크시트, 지표 로깅·집계 실습 코드)"
---

```layers
인프라 :: 컨테이너 상태, CPU·메모리, /health 응답
모델 :: RMSE, 예측 분포, 응답 지연시간
데이터 :: 최근 입력 통계(가격 변동성 등) vs 학습 시점 통계
```

```compare
지연·에러 알림 | 드리프트 알림
조건 | 평균 지연 > 500ms 또는 5xx 비율 > 5% | RMSE > $4.00
측정 주기 | 5분 집계 | 최근 예측 21건
대응 | 경고 로그 출력 | 드리프트 알림 + 재학습 트리거
```

```python
async def log_requests_middleware(request, call_next):    # app.middleware("http")
    start = time.time()
    response = await call_next(request)
    logger.info(json.dumps({"ts": time.time(), "path": request.url.path,
                            "status": response.status_code,
                            "duration_ms": round((time.time() - start) * 1000, 2)}))
    return response

def aggregate(log_path="requests.log", window_sec=300):     # 최근 5분 집계
    recent = [r for r in map(json.loads, open(log_path)) if time.time() - r["ts"] <= window_sec]
    avg_latency = mean(r["duration_ms"] for r in recent)
    error_rate = sum(r["status"] >= 500 for r in recent) / len(recent)
    if avg_latency > 500 or error_rate > 0.05:
        print(f"[WARN] latency={avg_latency:.0f}ms error_rate={error_rate:.1%}")
```

> [!tip] 적용 범위
> 실습은 요청 로깅, 지표 집계, RMSE 드리프트 탐지, 재학습 트리거까지만 다루고 Kubernetes 오토스케일링, Slack·이메일 알림, 다중 모델 모니터링은 범위 밖. 팀 프로젝트는 엔드포인트별 p50/p95 지연과 웹훅 알림까지 확장했다.
