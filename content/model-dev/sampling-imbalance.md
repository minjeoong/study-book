---
title: "Sampling과 클래스 불균형"
en: "Random / Partitioned Sampling, Over / Under Sampling, SMOTE"
summary: "표본을 뽑는 방식(Random·Partitioned)과, 소수 클래스를 늘리거나(Over) 다수 클래스를 줄여(Under) 불균형을 맞추는 방법"
importance: 2
order: 4
tags: [Sampling, Class Imbalance, SMOTE, class_weight, Threshold]
keypoints:
  - "Partitioned Sampling — Test는 그대로 두고 Train에서만 샘플링"
  - "Over(복제·SMOTE)는 소수 클래스를 늘리고, Under는 다수 클래스를 줄임"
  - "불균형은 데이터 조정 외에 class_weight·지표 선택·Threshold로도 대응"
qa:
  - q: "클래스 불균형 데이터는 어떻게 다루나?"
    a: "데이터 쪽에선 소수 클래스를 복제하거나 SMOTE로 합성하는 Over Sampling, 다수 클래스를 줄이는 Under Sampling을 쓰고, 분할은 Stratified로 클래스 비율을 유지한다. 모델 쪽에선 class_weight='balanced'로 소수 클래스에 가중치를 주고, 평가는 Accuracy 대신 Recall·F1·AUC를 본다. 실습에선 이탈률 21% 데이터에서 Validation 기준 F1 최적 Threshold 0.26을 골라 Test F1을 0.468에서 0.580으로 올렸다."
  - q: "SMOTE란?"
    a: "Synthetic Minority Over-sampling Technique으로, 소수(Positive) 클래스 샘플과 가까운 이웃 사이에 새로운 샘플을 합성해 늘리는 Over Sampling 기법이다. 단순 복제(Random Over Sampling)보다 같은 점의 반복이 줄어든다. 샘플링은 Train에만 적용하고, 평가는 원래 분포의 데이터로 전수 평가해야 한다."
related: [data-partition-cv, classification-metrics, auc-lift-baseline]
source: "9/28–29 슬라이드 p.29–32, 9/29 노트북 RandomForest 섹션, 9/28 실습 코드 practice1_train.py"
---

```compare
Over Sampling | Under Sampling
목적 | 작은 Class를 큰 Class 크기로 맞춤 | 큰 Class를 작은 Class 크기로 맞춤
예 | Positive 200건 → 1,000건 | Negative 1,000건 → 200건
방법 | Random Over(복제), SMOTE(이웃 사이 합성) | 다수 클래스 무작위 축소
언제 | Positive 건수가 너무 적을 때 | Negative 건수가 너무 많을 때
```

| 불균형 대응 수단 | 적용 위치 | 실습 예 |
|---|---|---|
| Stratified 분할·K-Fold | 데이터 분할 | 6:2:2를 클래스 비율 유지로 분할 |
| Over / Under Sampling | Train 데이터 | 노트북 Self-Practice 범위 |
| `class_weight="balanced"` | 모델 학습 | RandomForest·BayesSearchCV 기본 모델 |
| 평가 지표 선택 | 평가 | Accuracy 대신 F1·AUC |
| Threshold 조정 | 예측 후 | 0.5 → 0.26 (Validation F1 최적) |

> [!tip] AUC가 목표면 오버샘플링 이득이 작다
> 종합실습 판단: AUC는 "이탈 고객을 더 높은 확률로 줄 세우는가"를 보는 순위 지표라 0.5 Threshold와 불균형(21.7%)의 직접 영향이 적음. 그래서 SMOTE 대신 확률 순위 품질(FE·모델)을 높이는 데 집중함.
