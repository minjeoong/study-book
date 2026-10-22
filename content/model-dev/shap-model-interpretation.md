---
title: "모델 해석과 SHAP"
en: "XAI, SHAP (SHapley Additive exPlanations)"
summary: "블랙박스 ML 모델이 왜 그런 예측을 했는지, 각 Feature의 기여도를 게임 이론(Shapley value)으로 계산해 설명하는 XAI 기법"
importance: 3
order: 11
tags: [XAI, SHAP, Feature Importance, Force Plot, 모델 해석]
keypoints:
  - "Feature Importance(Train)는 학습 관점, SHAP(Test)은 예측 근거 관점"
  - "bar=중요도, beeswarm=방향+분포, dependence=관계·상호작용"
  - "Force plot은 base value에서 f(x)로 올리고(빨강) 내린(파랑) Feature"
qa:
  - q: "SHAP이란? Tree의 Feature Importance와 무엇이 다른가?"
    a: "SHAP은 각 Feature가 개별 예측값에 기여한 정도를 게임 이론의 Shapley value로 계산하는 XAI 기법으로, 대부분 ML 모델에 적용된다. Tree 계열의 Feature Importance는 학습 과정에서 모델이 많이 쓴 변수를 Train 기준으로 보여 주며 변수 선정이나 학습 후 해석에 쓴다. SHAP은 Test 데이터에서 영향의 크기뿐 아니라 방향(+/−)과 개별 고객 단위의 근거까지 보여 줘 실제 서비스에서 예측 근거를 설명할 때 쓴다."
  - q: "은행 이탈 모델을 SHAP으로 해석하면 어떤 결과가 나왔나?"
    a: "이탈에 가장 중요한 Feature는 Age였고, 나이가 많을수록 이탈 쪽(+)으로 작용했으며 같은 연령에서도 활동 회원(IsActiveMember=1)이면 이탈이 줄었다. NumOfProducts도 상위였는데, 실습 집계로 보면 상품 2개는 이탈률 7.6%로 가장 안정적이고 3개 이상은 88% 이상이 이탈해 단조 관계가 아니었다. 이런 비선형 관계를 보고 종합실습에서 Age_mid(45–62세), Prod_2, Prod_ge3 같은 파생 변수를 만들었다."
  - q: "Force plot은 어떻게 읽나?"
    a: "base value는 모델 예측의 평균적인 기준값(예: 평균 이탈 확률)이고 f(x)는 해당 고객의 최종 예측값이다. 빨간 막대는 Class 1 예측을 높이는 방향, 파란 막대는 낮추는 방향으로 작용한 Feature이며 막대 길이가 영향력이다. '평균 이탈 확률은 약 X%지만 이 고객은 Feature A·B 때문에 Y%로 낮아졌다'처럼 설명한다."
related: [feature-engineering, model-drift-monitoring, classification-metrics]
source: "9/28–29 슬라이드 p.63–66, 9/29 노트북 모델 해석 섹션, 9/28 실습 코드 p1_variable_target_relationship"
---

```compare
Feature Importance (Tree) | SHAP
대상 모델 | Tree 계열 (RF, XGBoost 등) | 대부분 ML 모델
분석 데이터 | Train Set | Test Set
알려 주는 것 | 모델이 많이 쓴 변수 (크기만) | 기여도의 크기 + 방향(+/−) + 개별 관측치 근거
쓰임 | 학습 전 Feature 선정, 학습 후 해석 | 서비스 적용 시 동작 예상, 운영 중 예측 근거
```

```python
explainer = shap.TreeExplainer(model)
sv = explainer.shap_values(X_test)
sv_pos = sv[1] if isinstance(sv, list) else (sv[:, :, 1] if sv.ndim == 3 else sv)  # Class 1
shap.summary_plot(sv_pos, X_test, plot_type="bar")   # Feature Importance
shap.summary_plot(sv_pos, X_test)                    # Feature Impact (방향 + 분포)
shap.dependence_plot("Age", sv_pos, X_test, interaction_index="auto")
```

> [!tip] 왜 해석이 필요한가
> 선형회귀는 y = 0.5·Age + 1.2·Income처럼 계수로 설명되지만 ML·DL은 블랙박스. 신용평가처럼 "이 사람은 왜 이 점수인가(Age·Income은 +, Debt·Loan은 −)"를 설명해야 하는 업무에서 SHAP이 표준 도구로 쓰임.
