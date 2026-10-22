---
title: "모델 최적화와 Hyperparameter Tuning"
en: "Model Optimization, Grid / Random / Bayesian Search"
summary: "학습으로 정해지는 Parameter와 달리 사람이 정하는 Hyperparameter를 Grid·Random·Bayesian Search로 탐색해 Validation 성능을 최대화"
importance: 3
order: 5
tags: [Hyperparameter, Grid Search, Random Search, Bayesian Search, Optuna, Ensemble]
keypoints:
  - "Parameter는 데이터로 학습(회귀계수), Hyperparameter는 사람이 설정(max_depth)"
  - "Grid는 전수, Random은 무작위 샘플, Bayesian은 이전 결과로 다음 점 예측"
  - "최적화 전략은 데이터(설계·FE)와 모델(선택·튜닝·정규화·앙상블) 두 축"
qa:
  - q: "Parameter와 Hyperparameter의 차이는?"
    a: "Parameter는 모델 내부에서 학습 데이터로 자동 업데이트되는 값으로, 선형회귀의 회귀계수·절편처럼 모델의 구조를 결정한다. Hyperparameter는 Decision Tree의 최대 깊이처럼 사용자가 학습 전에 직접 설정하는 모델 외부 값으로, 학습 중에는 바뀌지 않고 알고리즘의 동작 방식을 정한다. 정답이 정해진 게 아니라 여러 번 학습해 보며 적절한 값을 찾아야 한다(Not best, but proper values)."
  - q: "Grid, Random, Bayesian Search를 비교하면?"
    a: "Grid Search는 정의한 범위의 모든 조합을 전수 조사해 격자 안에서는 최적해를 보장하지만 차원이 늘면 비효율적이라 하이퍼파라미터가 적을 때 쓴다. Random Search는 범위 안에서 무작위 조합을 샘플링해 고차원에서 효율적이지만 최적해를 보장하지 않는다. Bayesian Search는 이전 결과로 다음에 시도할 유망한 점을 예측해 적은 시도로 수렴하므로 DL·LightGBM·XGBoost처럼 학습 비용이 큰 모델에 효과적이다."
  - q: "하이퍼파라미터는 어느 데이터의 성능을 기준으로 최적화하나?"
    a: "Validation set 성능, 또는 Train 안에서 돌린 Cross Validation 평균 성능 기준으로 최적화한다. Test는 최종 평가용이라 선택 기준에 쓰면 Test에 맞춘 모델이 되어 실제 성능을 과대평가한다. 실습에선 Validation AUC 최고치 0.005 이내 후보 중 Train–Validation 차이가 가장 작은, 즉 덜 과적합된 설정을 골랐다."
related: [data-partition-cv, overfitting-underfitting, automl-genai-model-dev, sllm-finetuning/lora-config]
source: "9/28–29 슬라이드 p.33–37, p.43 Quiz, 9/29 노트북 Hyperparameter 최적화 섹션, 종합실습 엑셀"
---

```compare
Grid Search | Random Search | Bayesian Search
탐색 방식 | 범위 내 모든 조합 전수 조사 | 범위 내 무작위 조합 샘플링 | 이전 결과로 다음 최적점 예측
탐색 효율 | 차원이 늘면 비효율 | 고차원에서 효율적 | 가장 효율적, 적은 시도로 수렴
최적해 | 격자 안에서는 보장 | 보장 안 됨 | 좋은 해에 빠르게 근접
언제 | 하이퍼파라미터 수가 적을 때 | 탐색 공간이 넓을 때 | 학습 비용 큰 모델 (DL, LGBM, XGBoost)
scikit-learn | GridSearchCV | RandomizedSearchCV | BayesSearchCV (skopt), Optuna TPE
```

| 최적화 전략 | 목적 | 기법 |
|---|---|---|
| Training Data Design | 학습에 최적화된 데이터 구성 | Segmentation, Sampling, Hold-out·CV |
| Feature Engineering | 예측에 유용한 Feature 생성·변환 | 파생·Lag 변수, 결측 대체·Scaling, 변수 선택 |
| Model Selection | 문제·데이터에 맞는 알고리즘 | 통계 / ML / DL, Tree 계열 (XGBoost, LightGBM) |
| Hyperparameter Tuning | 성능을 최적화하는 HP 탐색 | Grid / Random / Bayesian, 경험·사례 기반 |
| Regularization | 과적합 방지, 일반화 | L1·L2 (LASSO, Ridge), Dropout, Early Stopping |
| Ensemble | 여러 모델 결합으로 성능·안정성 | Bagging(RF), Boosting(XGBoost), Stacking |

> [!tip] 종합실습에서 효과가 컸던 순서
> 모델 선택(DT 0.772 → XGBoost 0.855) > 노이즈 변수 제거·파생변수(→ 0.884) > Optuna로 변수 포함 여부와 HP를 동시 탐색(→ 0.893) > 예측이 서로 다른 모델끼리의 Soft Voting 앙상블(→ 0.900). HP만 튜닝한 효과(0.884 → 0.8885)는 생각보다 작았음.
