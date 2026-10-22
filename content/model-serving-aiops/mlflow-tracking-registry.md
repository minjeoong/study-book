---
title: MLflow — 실험 추적과 모델 레지스트리
en: MLflow Tracking, Model Registry, Stage / Alias
summary: "학습 run마다 파라미터·지표·모델을 기록(Tracking)하고, 배포할 버전을 이름·상태로 관리(Registry)해 서빙이 Production 버전을 불러오게 하는 도구"
importance: 3
order: 7
tags: [MLflow, Experiment Tracking, Model Registry, Stage, Alias, autolog]
keypoints:
  - "4요소 — Tracking(실험 기록), Projects(코드 패키징), Models(모델 형식), Registry(버전·상태)"
  - "run마다 log_param·log_metric·log_model, 게이트 통과 버전만 register → Production 승격"
  - "서빙은 models:/HAIC_Predictor/Production URI로 로드 → 버전 하드코딩 불필요"
qa:
  - q: "MLflow Tracking과 Model Registry는 각각 무엇을 하나요?"
    a: "Tracking은 학습 한 번(run)마다 하이퍼파라미터, RMSE 같은 지표, 모델 아티팩트를 기록해 실험끼리 비교하고 재현할 수 있게 합니다. Registry는 그중 배포할 모델을 이름으로 등록해 v1, v2처럼 버전을 매기고 None → Staging → Production 같은 상태를 관리합니다. 실습에서는 v1(RMSE $5.20, 게이트 미달) 다음 이동평균 피처를 더한 v2(RMSE $3.65)만 Production으로 승격해, 서빙 앱이 항상 검증된 버전을 불러오게 했습니다."
  - q: "서빙 서버는 어떻게 새 모델을 반영하고, 무엇을 주의해야 하나요?"
    a: "서빙 앱이 models:/모델명/Production URI로 로드하면 승격된 버전을 가져오므로 코드에 버전 번호를 하드코딩하지 않아도 되고, 새 버전이 승격되면 재시작이나 재로드로 반영됩니다. 다만 이미 메모리에 캐시된 모델은 Registry가 바뀌어도 그대로라서, 실습에서 재학습 로그는 [OK]인데 /predict가 옛 값을 돌려주는 문제가 있었습니다. 승격 시 캐시를 새 모델로 교체하고 응답에 model_version을 넣어 실제 교체를 확인해야 합니다."
  - q: "Stage와 Alias는 어떻게 다른가요?"
    a: "Stage는 각 버전에 붙는 상태값이라 이전 버전을 archive하지 않으면 여러 버전이 동시에 Production으로 남을 수 있습니다. Alias는 @champion, @Production처럼 이름 하나가 정확히 한 버전만 가리켜, 새 버전으로 옮기면 이전 버전에서는 자동으로 해제됩니다. MLflow 3에서는 stage 방식이 deprecated라 alias 사용이 권장됩니다."
related: [mlops-lifecycle, deployment-gate-validation, auto-retraining-loop]
source: "Day2 슬라이드 p.61–66 (ML Flow 이해·동작·활용, HAIC 실습 프로젝트, MLflow 아키텍처), p.71–74 (Tracking 코드, Registry Stage 전환, FastAPI Production 로드), p.93–96 (통합 실습), 실습 mlflow.ipynb, 실습 가이드 부록1 #6·#10, 개인 서브노트 T3·T4·T8"
---

```flow
학습 스크립트 :: mlflow.start_run(), log_param / log_metric / log_model
Tracking :: 실험별 파라미터·RMSE·아티팩트 기록, mlflow ui로 비교
게이트 :: RMSE ≤ $4.00인 run만 register_model
Registry :: 버전 등록, None → Staging → Production
FastAPI 서빙 :: models:/HAIC_Predictor/Production 로드
```

```python
mlflow.set_experiment("haic-price-prediction")
with mlflow.start_run(run_name="v2-feature-improved"):
    model.fit(X_train, y_train)
    rmse = mean_squared_error(y_test, model.predict(X_test), squared=False)
    mlflow.log_param("features", "close,volume,ma5,ma20")
    mlflow.log_metric("rmse", rmse)                              # 예: 3.65
    mlflow.sklearn.log_model(model, "model")
    if rmse <= 4.00:                                             # 배포 게이트
        v = mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/model",
                                  "HAIC_Predictor")
        MlflowClient().transition_model_version_stage("HAIC_Predictor", v.version, "Production")

model = mlflow.pyfunc.load_model("models:/HAIC_Predictor/Production")   # 서빙 쪽
```

- 실습 노트북: diabetes RandomForest를 `mlflow.autolog()`로 자동 기록, OpenAI 호출도 `mlflow.openai.autolog()`로 GenAI trace 기록
- 로컬은 `mlflow ui --port 5001`, 팀 공유는 `mlflow server --backend-store-uri`로 중앙 Tracking Server 구성

> [!warn] 헷갈리기 쉬움
> `transition_model_version_stage`를 archive 없이 반복 호출하면 v1~v11이 모두 Production으로 남는다. 서빙은 최신 하나를 골라 정상처럼 보여 발견이 늦다. MLflow 3.x는 기본 저장소가 mlruns 폴더가 아니라 mlflow.db(SQLite)라, 기록이 안 보이면 tracking URI부터 확인.
