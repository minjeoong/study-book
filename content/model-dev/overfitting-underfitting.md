---
title: "Overfitting과 Underfitting"
en: "Overfitting, Underfitting, Regularization"
summary: "학습 데이터에만 과하게 맞춰 새 데이터에서 성능이 떨어지는 과적합과, 학습이 부족해 학습 데이터도 못 맞추는 과소적합"
importance: 3
order: 6
tags: [Overfitting, Underfitting, Regularization, 일반화]
keypoints:
  - "Train 0.99 / Test 0.78 모델보다 0.80 / 0.75 모델이 더 좋은 모델"
  - "과적합 대응 — 데이터↑, 불필요 Feature 제거, 모델 단순화·정규화"
  - "과소적합 대응 — 데이터↑, Feature 추가, 모델 복잡화·HP 범위 확대"
qa:
  - q: "과적합이란? 어떻게 판단하나?"
    a: "학습 데이터에서는 잘 맞는데 검증·테스트 데이터에서는 그렇지 않은 상태다. Train과 Validation·Test 성능 차이로 판단하며, 슬라이드 예시에서 Train 0.99 / Test 0.78인 모델 A보다 Train 0.80 / Test 0.75인 모델 B가 새 데이터에 안정적이라 더 좋은 모델이다. 영향 요인은 Train·Test 비유사도, 데이터 건수, Feature 개수, 알고리즘 복잡도다."
  - q: "과적합과 과소적합은 각각 어떻게 대응하나?"
    a: "과적합은 데이터를 늘리고 Test와 비슷한 Train을 구성하거나, 불필요한 Feature를 빼거나, 알고리즘을 단순화하고 정규화를 건다. 과소적합은 데이터를 늘리고 Feature를 추가하거나 알고리즘을 복잡하게 하고 하이퍼파라미터 탐색 범위를 넓힌다. 실습에서도 기본값 Random Forest는 Train AUC 1.000이었는데 깊이와 리프 최소 샘플을 제한하자 Train 0.936으로 내려오고 Validation은 거의 그대로였다."
  - q: "L1과 L2 정규화의 차이는?"
    a: "둘 다 손실에 가중치 크기에 대한 벌점을 더해 모델이 학습 데이터에 과하게 맞추지 않도록 한다. L1(LASSO)은 가중치 절댓값 합을 벌점으로 써서 일부 계수를 정확히 0으로 만들어 변수 선택 효과가 있다. L2(Ridge)는 제곱합을 써서 계수를 전체적으로 작게 줄인다. 신경망은 Dropout과 Early Stopping으로 같은 목적을 달성한다."
related: [hyperparameter-tuning, data-leakage, feature-engineering, sllm-finetuning/sft-training]
source: "9/28–29 슬라이드 p.35, p.38–41, 9/28 실습 코드 practice1_train.py"
---

```compare
Underfitting | 적합한 fitting | Overfitting
상태 | 학습 부족, 학습 데이터도 못 맞춤 | 패턴을 적당히 일반화 | 학습 과다, 학습 데이터만 잘 맞춤
Data 대응 | 데이터 건수 증가 | — | 데이터 건수 증가, Test와 유사한 Train
Feature 대응 | Feature 추가 | — | 불필요한 Feature 제거
알고리즘 대응 | Complexify, HP 범위 확대 | — | Simplify, 정규화 (L1·L2, Dropout, Early Stopping)
```

| 실습 Random Forest | Train AUC | Validation AUC | Test AUC | 해석 |
|---|---|---|---|---|
| 기본값 (깊이 제한 없음) | 1.000 | 0.871 | 0.853 | 학습 데이터를 외움 |
| 튜닝 (max_depth 6, min_samples_leaf 5) | 0.936 | 0.869 | 0.848 | 격차 축소, 일반화 성능 유지 |

> [!warn] Overfitting vs Data Leakage
> Overfitting은 주로 모델 설계 문제(복잡도·Feature 수), Data Leakage는 데이터 설계 문제(예측 시점에 없는 정보). 둘 다 "개발 땐 높고 운영에선 떨어진다"는 증상은 비슷하지만 원인과 처방이 다름.
