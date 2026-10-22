---
title: "Data Leakage"
en: "Target Leakage, Train-Test Contamination"
summary: "예측 시점에 알 수 없는 정보가 학습에 섞여, 개발 때는 정확도가 매우 높고 실제 운영에서 급락하는 데이터 설계 문제"
importance: 3
order: 7
tags: [Data Leakage, Target Leakage, Contamination, fit/transform]
keypoints:
  - "Target Leakage — Feature에 Target 정보가 직·간접으로 포함"
  - "Train-Test Contamination — 전체 데이터 통계로 Scaling·결측 대체"
  - "대체값·Scaler는 Train에서만 계산하고 Valid·Test에는 적용만"
qa:
  - q: "Data Leakage란? 예를 들어 달라."
    a: "모델이 예측 시점에는 알 수 없는 정보를 학습에 사용한 경우로, 개발 때 정확도가 99%처럼 매우 높다가 실제 데이터에서 크게 떨어진다. Target Leakage는 폐렴 예측에 '항생제 처방 여부', 고객 이탈 예측에 '해지 위약금 지불 여부'를 Feature로 쓰는 것처럼 결과를 알아야 생기는 정보가 들어간 경우다. Train-Test Contamination은 전체 데이터의 평균·표준편차로 Scaling하거나 결측을 대체해 Test 정보가 학습에 노출된 경우다."
  - q: "결측 대체용 평균값은 어느 데이터에서 계산하고 어디에 적용하나?"
    a: "Train에서 계산해 Train·Validation·Test에 똑같이 적용한다(슬라이드 Quiz ②). Validation·Test는 운영에서 처음 보는 데이터를 흉내 내야 하므로 그 통계를 미리 보면 안 된다. 노트북도 X_train의 중앙값으로 세 데이터셋을 채우고, MinMaxScaler는 Train에 fit_transform, Valid·Test에는 transform만 했다."
related: [data-partition-cv, overfitting-underfitting, feature-engineering]
source: "9/28–29 슬라이드 p.42–43, 9/29 노트북 Feature Transformation 섹션"
---

```compare
Target Leakage | Train-Test Contamination
정의 | Feature에 Target 정보가 직접·간접 포함 | Test 데이터가 학습 과정에 일부라도 노출
예시 | 폐렴 예측에 '항생제 처방 여부', 이탈 예측에 '해지 위약금 지불 여부' | 전체 데이터 평균·표준편차로 Scaling, 전체 평균으로 결측 대체
점검 | 이 값을 예측 시점에 알 수 있는가? | 통계·fit을 어느 데이터로 계산했는가?
```

```python
medians = X_train[num_cols].median()                 # 통계는 Train에서만
for X in (X_train, X_valid, X_test):
    X[num_cols] = X[num_cols].fillna(medians)

scaler = MinMaxScaler()
X_train[num_cols] = scaler.fit_transform(X_train[num_cols])   # fit은 Train
X_valid[num_cols] = scaler.transform(X_valid[num_cols])       # 나머지는 transform만
X_test[num_cols]  = scaler.transform(X_test[num_cols])
```

> [!warn] 평가셋으로 고르면 평가셋에 맞춰진다
> 종합실습은 목표가 "Validation + Test 평균 AUC"라 Test도 튜닝 기준이 됐고, 이 경우 최종 점수는 실제 운영 성능보다 낙관적일 수 있음. 실무에선 선택은 Validation·CV로 끝내고 Test는 마지막 한 번만 보는 게 원칙. 전처리를 `Pipeline`으로 묶으면 fit 범위를 실수할 여지가 줄어듦.
