---
summary: "HAIC 주가 예측 LSTM 하나로 FastAPI 서빙(Day1) → MLflow·Docker MLOps(Day2) → 드리프트 감지·자동 재학습 AIOps(Day3)를 같은 서버 위에 쌓아 AI 서비스의 운영 생애주기를 구축"
keywords: [모델 서빙, 배치 vs 실시간 추론, FastAPI, Pydantic, async, Lazy/Eager, 헬스체크, MLOps, MLflow, Model Registry, 배포 게이트, Docker, CI/CD for ML, AIOps, 모니터링, 데이터 드리프트, 컨셉 드리프트, RMSE, 자동 재학습, Warm Start]
materials:
  - file: slides-model-serving-aiops.pdf
    title: "강의 슬라이드 — 모델 서빙 및 AIOps 구성"
    type: slides
    date: 2026-09-30
  - file: slides-fastapi-basics.pdf
    title: "강의 자료 — FastAPI 기본 문법"
    type: slides
    date: 2026-09-30
  - file: lab-model-serving-guide.pdf
    title: "실습 가이드 — 모델 서빙, AIOps"
    type: lab
    date: 2026-09-30
  - file: lab-fastapi-practice.zip
    title: "실습 코드 — FastAPI practice"
    type: lab
    date: 2026-09-30
  - file: lab-mlflow.zip
    title: "실습 코드 — MLflow"
    type: lab
    date: 2026-09-30
  - file: lab-project.zip
    title: "실습 코드 — 모델 서빙 project"
    type: lab
    date: 2026-09-30
  - file: transcript-day1.txt
    title: "강의 녹취 Day1"
    type: etc
    date: 2026-09-30
  - file: transcript-day2.txt
    title: "강의 녹취 Day2"
    type: etc
    date: 2026-10-01
  - file: submission-aiops-individual.pdf
    title: "과제 제출 — AIOps 개인 과제"
    type: etc
    date: 2026-10-02
  - file: submission-team2-etchguard-presentation.pdf
    title: "과제 제출 — 2조 EtchGuard 발표장표"
    type: etc
    date: 2026-10-02
  - file: submission-team2-etchguard-code.zip
    title: "과제 제출 — 2조 EtchGuard 코드"
    type: lab
    date: 2026-10-02
---

## 한눈에 보기

```flow
Day1 서빙 :: FastAPI로 모델을 /predict API로 — 스키마 검증(422), 헬스체크, Lazy/Eager
Day2 MLOps :: MLflow Tracking·Registry, RMSE ≤ $4.00 배포 게이트, Docker 컨테이너화
Day3 AIOps :: 지표·구조화 로그, 최근 21건 RMSE로 드리프트 감지, 알림
자동 대응 :: warm-start fine-tuning → 게이트 재검증 → 승격 또는 기존 유지
```

- 가상 종목 HAIC의 다음날 종가 예측 모델 하나를 Day1 → Day2 → Day3 순서로 하나의 `serving_app/` 위에 쌓음 — 전날 산출물이 다음 날 실습의 기반
- 관통 메시지: 서빙은 모델을 "쓸 수 있게", MLOps는 "믿고 바꿀 수 있게", AIOps는 "나빠져도 스스로 회복하게" 만든다
- 일반 소프트웨어는 버그가 나면 에러가 나지만 AI 서비스는 에러 없이 틀린다 — 그래서 성능 게이트와 오차 감시가 운영의 핵심
- 이론 50% · 실습 50%, 스켈레톤 코드의 TODO 5개를 채우는 개인 실습 + 팀 도메인으로 치환하는 조별 미니 프로젝트

## 수업 흐름

**Day1 (9/30) 모델 서빙 기초 — FastAPI**

- 모델 서빙·AIOps 이해 — 파이프라인에서 서빙의 위치, 학습 vs 서빙 요구사항, AIOps 가치(자동 모니터링·이상 탐지·자동 대응), "데이터는 업무의 결과"
- 모델 서빙 아키텍처 — 학습 vs 서빙 파이프라인, 배치 vs 실시간 추론, REST·gRPC·WebSocket·WebRTC 패턴
- FastAPI 기초 — 최소 서버, 라우팅, Pydantic 스키마와 422, API Schema vs DB Model(MariaDB·SQLAlchemy 예시), Swagger, MVP 스코프
- 비동기 처리 — 동기 vs 비동기, async/await·run_in_threadpool, 배칭으로 처리량 개선
- 서빙 안정성 — 입력 검증·HTTPException, 헬스체크, Lazy vs Eager 로딩, 로깅
- 실습 — FastAPI 기본 문법 7개 예제, 감성분류 엔드포인트, HAIC 스켈레톤 기동·CSV 업로드·baseline 생성·Lazy/Eager 측정

**Day2 (10/1) MLOps 파이프라인 — 컨테이너화**

- MLOps 개요 — ML의 한계(데이터 의존·해석·유지보수), 정의·목적·구성요소, MLflow 4요소와 diabetes 예제
- HAIC 프로젝트 — 다음날 종가 회귀, 배포 목표 RMSE ≤ $4.00, MLflow 아키텍처, 성숙도 Level 0~2, DevOps vs MLOps, 라이프사이클 매핑
- 버전 관리·레지스트리 — Tracking 코드, Stage 전환, FastAPI에서 Production 로드 (v1 $5.20 → v2 $3.65)
- CI/CD for ML · Dockerize — 학습/배포 파이프라인, 환경 일관성, Dockerfile, docker compose
- 데이터·모델 검증 — 입력 스키마 검증, 성능 회귀 테스트, 배포 게이트
- MLOps vs AIOps, "데이터가 바뀌면" → Day3 예고 / 통합 실습(`_load_from_mlflow` 구현, `docker compose up --build`), 조 편성

**Day3 (10/2) AIOps 파이프라인 — 모니터링·자동대응**

- AIOps 개요 — MLOps와의 차이, 모니터링 3대 대상(인프라·모델·데이터), 적용 범위, 앱 구조 확장(routers/metrics, monitoring/)
- 모델 모니터링 — 지연시간·처리량·에러율, 구조화 로깅, 알림 설계, 로깅 미들웨어
- 모델 드리프트·자동 대응 — 데이터 vs 컨셉 드리프트, 최근 21건 RMSE 게이트, 재학습 트리거 구조
- 드리프트 감지 시뮬레이션 — 기준 통계 → 정상 배치 → 변동성 3배 배치 주입 → RMSE·알림·재학습 관찰
- 파이프라인 회고, AIOps 설계 워크시트(임계값·윈도우·승인 방식), AIOps 구축(TODO 4개), 조별 미니 프로젝트 발표, 서브노트 제출

## 실습 정리

**FastAPI 기본 문법 (fastapi_practice ex1~ex7, 메모 API)**

- ex1 앱/라우터 구조(def vs async def), ex2 요청 3가지(경로 파라미터·바디·파일 업로드), ex3 Pydantic(Field 제약·중첩 모델·response_model, 잘못된 값은 422), ex4 응답·에러(HTTPException 404, 미처리 예외 500), ex5 생명주기·정적 파일(startup, StaticFiles는 마지막에 mount), ex6 실행·문서(uvicorn, /docs, 환경변수)
- ex7 통합본의 파일 구조가 HAIC `serving_app/`과 1:1 대응

**MLflow 노트북** — diabetes RandomForest를 `mlflow.autolog()`로 기록, OpenAI 호출을 GenAI trace로 추적, `mlflow ui --port 5001`로 실험 비교

**HAIC 프로젝트 (project.zip, 개인 실습)**

- 데이터: IBM 2007~2009 시세를 참조한 756거래일 CSV(상승 → 금융위기 −45% → 회복), 대시보드에서 업로드
- 모델: 최근 20거래일 (close, volume) = (20, 2) → LSTM 32-32-16 → Dense 16 → 다음날 종가 1개, scaler.pkl은 Day1에 한 번만 fit
- TODO 5개: `_load_from_mlflow()`(Day2), `compute_rmse()`·`batch_test()`·`check_and_trigger()`·`send_batch()`(Day3)

| 측정 항목 (개인 서브노트) | 결과 |
| --- | --- |
| Lazy vs Eager | 시작 0.26초 vs 2.45초, 첫 /predict 2.31초 vs 0.153초, 이후 0.016초 |
| 입력 검증 | 시퀀스 19·21개, close = 0, 빈 본문 → 모두 422 |
| Day2 게이트 | `[GATE PASSED] rmse=2.03` → HAIC_Predictor v1 Production |
| 드리프트 10회 반복 | 정상 1.87~3.50 (ok 10/10), 변동성 3배 4.24~7.30 (재학습 10/10) |
| 자동 재학습 | `[WARN] 6.38` → `[INFO]` → `[OK] new_rmse=1.46`, 5초, /predict `production-v8` |
| 트러블슈팅 | 재학습 [OK]인데 응답이 옛 모델(캐시 미교체), 모든 버전이 Production(stage 미archive), 연속 재학습(윈도우 미초기화), 로컬·컨테이너 RMSE 차이(시드 미고정) |

```python
def compute_rmse(recent_predictions):
    if not recent_predictions:
        return 0.0
    sq = [(p["actual"] - p["predicted"]) ** 2 for p in recent_predictions]
    return (sum(sq) / len(sq)) ** 0.5

# batch_test 핵심: 길이 20 슬라이딩 윈도우, 정답은 바로 다음 날
for i in range(len(prices) - SEQ_LEN):
    window = prices[i : i + SEQ_LEN]
    pred = model.predict_one([{"close": p, "volume": SIMULATED_VOLUME} for p in window])
    recent_predictions.append({"predicted": pred, "actual": prices[i + SEQ_LEN]})
recent_predictions[:] = recent_predictions[-WINDOW_SIZE:]   # 최근 21건 유지
```

**조별 미니 프로젝트 — 2조 EtchGuard (식각 장비 이상 징후 조기 예측)**

- 도메인 치환: 장비 5대의 최근 20사이클(10시간) × 센서 12종 → 30분 뒤 공정 이상 점수(0~100, 70 이상 HIGH), LSTM 32-16 + Dense 16
- 배포 게이트: RMSE ≤ 4.0 + HIGH Recall ≥ 0.80 + Precision ≥ 0.80 (검증 3.164 / 0.933 / 0.876), 정답 필드 누설·시간 역순 입력도 422
- 드리프트: 12시간 윈도우 RMSE 4.0 초과 3회 연속(정상 오경보 0.03회/장비·월, 탐지 36시간), PSI는 전년 같은 달 기준 원인 센서 진단용
- 재학습: 최근 7일 warm start, Champion/Challenger(홀드아웃 7.86 → 2.64) + 고정 정상셋 2,410건, 백그라운드 + 락, alias @Production, 새 모델 로드 후 참조 교체(무중단, 4초)
- 운영: /health와 /ready(미준비 503) 분리, Docker HEALTHCHECK, 엔드포인트별 p50/p95
- 내 역할: LSTM 학습과 정상·드리프트 구간 평가 — 드리프트 구간 RMSE 8.07이 직전값 규칙(3.57)보다 나빠 재학습의 근거가 됨
