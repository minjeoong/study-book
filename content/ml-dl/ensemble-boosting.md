---
title: 앙상블 — Random Forest와 Boosting
en: Random Forest (Bagging), Gradient Boosting, XGBoost, LightGBM, CatBoost
summary: "여러 트리를 무작위로 만들어 투표(Bagging)하거나, 이전 트리의 오답을 순차로 보완(Boosting)해 단일 트리의 한계를 넘는 방법"
importance: 3
order: 3
tags: [앙상블, Random Forest, Bagging, Boosting, XGBoost, LightGBM, CatBoost]
keypoints:
  - "Random Forest = 데이터·변수 무작위 부분집합으로 트리 여러 개 → 투표(bagging)"
  - "Boosting = 약한 모델을 순차 연결해 이전 모델의 오차를 줄임 (weak → strong)"
  - "XGBoost는 Depth-wise, LightGBM은 Leaf-wise(빠름), CatBoost는 범주형 직접 처리"
qa:
  - q: "Bagging(Random Forest)과 Boosting의 차이는?"
    a: "Random Forest는 데이터와 변수를 무작위로 뽑은 부분집합으로 여러 트리를 독립적으로 만들고 투표나 평균으로 결과를 정하는 bagging이라, 단일 트리의 불안정성을 줄이고 튜닝 없이도 안정적인 기준 성능을 줍니다. Boosting은 트리를 순차적으로 만들며 이전 모델이 틀린 부분을 다음 모델이 보완해 오차를 줄여 나갑니다. 대신 Boosting은 모델이 복잡해 해석이 어렵고 튜닝에 더 민감합니다."
  - q: "XGBoost, LightGBM, CatBoost는 각각 언제 고르나요?"
    a: "정형 데이터 대회처럼 튜닝으로 마지막 정확도까지 짜내야 하면 XGBoost, 수천만 행 규모라 학습 속도와 메모리가 중요하면 Leaf-wise 분할로 빠른 LightGBM, 고유값이 많은 범주형 변수가 많아 인코딩 전처리를 줄이고 싶으면 CatBoost를 먼저 고려합니다. CatBoost는 같은 train 안에서 지금까지 본 데이터만으로 다음 트리를 학습하는 Ordered Boosting으로 라벨 누수와 과적합을 줄입니다."
related: [decision-tree, svm-kernel, overfitting-regularization]
source: "Day1 슬라이드 p.42–44 (ML Algorithm, CART-series), p.53–55 (Random Forest, Boosting, XGBoost·LightGBM, CatBoost), TODAY QUIZ Q1–Q7 p.64–70"
---

```flow
Decision Tree :: 트리 하나, 해석 쉬움, 불안정
Random Forest :: 무작위 부분집합으로 트리 여러 개 → 투표
Gradient Boosting :: 트리를 하나씩 연결해 오답을 줄임
XGBoost · LightGBM · CatBoost :: 계산 속도와 정밀도 개선
```

```compare
XGBoost | LightGBM | CatBoost
트리 성장 | Depth-wise (층 단위) | Leaf-wise (잎 중심 분할) | Leaf-wise + Ordered Boosting
강점 | 예측 성능 좋음, 변수 많고 데이터 클수록 유리 | XGBoost보다 빠르고 정확한 경우 많음 | 범주형 데이터를 전처리 없이 처리, 기본값으로도 높은 성능
비고 | 복잡한 모델이라 해석 어려움 | 변수 많고 데이터 클수록 장점 | 튜닝 난이도 낮아 현장 선호
```

| TODAY QUIZ 상황 | 1순위 |
| --- | --- |
| 설명 가능성이 정확도보다 우선 (대출 거절 사유) | Decision Tree |
| 튜닝 없이 빠르고 안정적인 기준 성능 + 과적합 감소 | Random Forest |
| 정형 대회, 튜닝으로 마지막 한 방울 정확도 | XGBoost |
| 수천만 행, 학습 속도·메모리 효율 중요 | LightGBM |
| 고유값 많은 범주형 다수, 인코딩 최소화 | CatBoost |
| 표본 수백 · 변수 수천 + 비선형 경계 | SVM |
| 변수 수백 · 대체로 선형 · 중요 변수만 | LASSO |

> [!tip] Boosting의 "gradient"
> 같은 가중치의 약한 모델들을 만들고, 낮은 성능을 높이는 방향으로 가중치를 업데이트(오분류 데이터에 가중치 부여)하는 과정을 성능이 더 이상 오르지 않을 때까지 반복한다.
