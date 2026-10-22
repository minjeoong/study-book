---
title: 불균형 데이터 샘플링
en: Imbalanced Data (Undersampling, Oversampling, SMOTE)
summary: 타깃 클래스 비율이 크게 차이 나면 모델이 다수 클래스에 편향되므로, 다수를 줄이거나(Under) 소수를 늘려(Over) 결정경계를 찾기 쉽게 만든다
importance: 3
order: 9
tags: [불균형, SMOTE, Undersampling, Oversampling, Tomek Links]
keypoints:
  - 정상:비정상 99:1이면 전부 정상이라고 해도 Accuracy 99%, 정작 찾고 싶은 소수 클래스는 못 찾는다
  - "Undersampling: Random, Tomek Links, CNN / Oversampling: Random 복제, SMOTE, Borderline-SMOTE, ADASYN"
  - 샘플링은 Train에만 적용하고, 샘플링 후 결정경계가 더 쉬워졌는지(적어도 불리해지지 않았는지) 시각화로 확인
qa:
  - q: 불균형 데이터에서 Accuracy만 보면 안 되는 이유는?
    a: "불량 1%, 정상 99%인 데이터에서 모든 제품을 정상이라고 예측해도 정확도는 99%이지만, 불량을 하나도 잡지 못합니다. 모델은 관측치가 많은 다수 클래스에 편향되고, 몇 개 안 되는 소수 클래스 샘플에는 과적합되어 새 데이터를 잘 분류하지 못합니다. 그래서 Recall, Precision, F1, ROC-AUC 같은 지표를 함께 보고 샘플링이나 클래스 가중치로 균형을 맞춥니다."
  - q: SMOTE는 어떻게 동작하나요? 단점은?
    a: "소수 클래스 샘플 하나를 무작위로 고르고, KNN으로 같은 소수 클래스 이웃 k개를 찾은 뒤, 선택점과 이웃을 잇는 선분 위의 임의의 점을 새 샘플로 만듭니다. 단순 복제와 달리 원본과 똑같지 않은 샘플을 만들어 과적합을 줄입니다. 다만 소수 관측치 사이의 직선 위에서만 생성되고, 경계 근처에서는 노이즈 샘플이 늘어날 수 있습니다."
  - q: Undersampling과 Oversampling은 어떻게 고르나요?
    a: "Undersampling은 다수 클래스를 줄여 빠르고 과적합 위험이 적지만 정보를 잃을 수 있고, Oversampling은 정보 손실이 없지만 같은 패턴이 반복되어 과적합될 수 있습니다. 극단적으로 불균형한 경우 다수 클래스가 분포 전체에 퍼져 있어 Undersampling의 손해가 생각보다 크지 않고 오히려 안전한 측면도 있습니다. 어느 쪽이든 샘플링 후에도 결정경계를 찾기 쉬워졌는지 확인합니다."
related: [preprocessing-leakage, feature-engineering-overview, python-data/stats-to-ml-pipeline]
source: 9/14 슬라이드 p.58–68 (Imbalanced data 개념, Why, Undersampling vs Oversampling, Random Sampling, Tomek Links, Condensed Nearest Neighbor, Resampling, SMOTE, Borderline-SMOTE, ADASYN, Consideration)
---

| 구분 | 기법 | 아이디어 | 주의 |
| --- | --- | --- | --- |
| Under | Random Sampling | 다수 클래스를 무작위 제거 | 빠르지만 실행마다 결과가 다름 |
| Under | Tomek Links | 서로 다른 클래스의 가장 가까운 쌍(Tomek Link)에서 다수 쪽 제거 | 경계가 선명해지지만 제거량이 적음 |
| Under | CNN (Condensed NN) | 1-NN으로 소수 쪽에 가까운 다수 샘플만 남기고 밀집된 다수 제거 | 다수 샘플을 상당수 제거 |
| Over | Random Resampling | 소수 클래스를 무작위 복제 | 특정 패턴 과적합, 모집단 대표성 문제 |
| Over | SMOTE | 소수 샘플과 소수 이웃 사이 선분 위에 가상 샘플 생성 | 직선 위에서만 생성, 노이즈 증가 |
| Over | Borderline-SMOTE | 이웃의 50% 이상이 다수인 Danger set에만 SMOTE | 경계 근처 집중 |
| Over | ADASYN | 주변 다수 비율 rᵢ가 클수록 더 많이 생성 | 어려운 샘플에 집중 |

```flow
소수 샘플 선택 :: Minority 중 하나를 무작위로 선택
이웃 탐색 :: KNN으로 같은 소수 클래스 이웃 k개 탐색
보간 생성 :: 선택점 + λ × (이웃 − 선택점), λ ∈ [0, 1]
반복 :: 원하는 비율이 될 때까지 (Train에만 적용)
```

> [!warn] 헷갈리기 쉬움
> 샘플링을 Train/Test 분할 전에 하면 SMOTE로 만든 가상 샘플의 '이웃'이 Test에 들어가 성능이 부풀려진다. 분할 후 Train에만 적용하고, Test는 실제 분포 그대로 평가한다.
