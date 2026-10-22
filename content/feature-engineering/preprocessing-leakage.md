---
title: 전처리 순서와 데이터 누수
en: Preprocessing Workflow & Data Leakage (fit on Train only)
summary: 기준을 학습하는 모든 전처리는 Train에서만 fit하고 Test에는 같은 기준으로 transform해야 평가가 현실을 반영한다
importance: 3
order: 11
tags: [데이터 누수, fit, transform, 전처리 순서, Baseline]
keypoints:
  - 분할을 먼저 하고, 결측 대체값·이상치 경계·스케일 통계·인코딩 범주는 모두 Train에서만 학습
  - "실습 순서: 결측치 → 이상치 → 파생변수 → 로그변환 → 인코딩 → 스케일링 (데이터·모델에 따라 조정)"
  - 최소 처리 Baseline과 같은 Test로 비교해야 Feature Engineering의 효과를 말할 수 있다
qa:
  - q: 데이터 누수(Data Leakage)란 무엇이고 어떻게 막나요?
    a: "학습 시점에는 알 수 없는 정보, 특히 Test 데이터나 Target 정보가 학습 과정에 섞여 들어가 성능이 실제보다 좋게 나오는 현상입니다. 전체 데이터로 평균을 구해 결측을 채우거나 스케일러를 fit하면 Test의 분포가 Train에 새어 들어갑니다. 그래서 Train/Test를 먼저 나누고 모든 기준은 Train에서만 fit, Test에는 transform만 하며, sklearn Pipeline으로 묶으면 이 규칙이 자동으로 지켜집니다."
  - q: 이상치 제거는 Test에도 적용하나요?
    a: "제거(remove)는 Train에만 적용합니다. Test는 실제로 들어올 데이터를 흉내 낸 평가 대상이라 마음대로 행을 지우면 성능을 속이게 됩니다. 반면 Clip이나 로그변환처럼 값을 바꾸는 처리는 Train에서 정한 기준으로 Test에도 똑같이 적용해야 같은 Feature 공간에서 예측할 수 있습니다."
  - q: 실습에서 Feature Engineering 효과를 어떻게 확인했나요?
    a: "수치형 10개만 쓰고 결측을 0으로 채운 Linear Regression을 Baseline으로 두고, 같은 Test에서 결측 중앙값 대체, IQR Clip, log1p, One-Hot·Dummy 인코딩, 표준화, Target 로그변환을 적용한 Final 모델과 MAE, RMSE, Adjusted R²를 비교했습니다. 기본 설정 기준으로 MAE 약 23,800에서 16,600으로, Adjusted R²는 0.81에서 0.89로 개선되었습니다."
related: [missing-value, outlier-detection, feature-scaling, categorical-encoding, python-data/stats-to-ml-pipeline, data-stats/regression-evaluation]
source: 9/14 슬라이드 p.46 (Scaling 유의점 fit vs transform), 실습 2 전체 (Train/Test 분할, Baseline 회귀, 결측 → 이상치 → 파생 → 로그 → 인코딩 → 스케일링, Final 회귀, 성과 비교)
---

```flow
분할 :: train_test_split(test_size=0.2, random_state=42), 전처리보다 먼저
Train에서 fit :: 대체값, IQR 경계, 인코더 범주, 스케일러 평균·표준편차
Train · Test에 transform :: 같은 기준으로 변환 (remove만 Train 전용)
검증 :: 결측 0, 비수치 열 0, Train·Test 열 구조 동일
비교 :: Baseline vs Final을 같은 Test로 MAE · RMSE · Adjusted R²
```

| 처리 | Train | Test |
| --- | --- | --- |
| 결측 대체 (median) | fit + transform | transform (Train 중앙값) |
| 이상치 remove | 행 제거 (y도 같이) | 건드리지 않음 |
| 이상치 clip | Train 경계로 자름 | 같은 경계로 자름 |
| log1p | 적용 | 적용 (학습할 기준 없음) |
| One-Hot / Dummy | 범주 목록 fit | 새 범주는 무시(0 벡터) |
| Scaling | fit + transform | transform |
| Target log | log1p로 학습 | 예측값을 expm1로 복원 후 평가 |

> [!warn] 헷갈리기 쉬움
> Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p − 1). 인코딩으로 변수 수 p가 10개에서 50개 이상으로 늘면 R²만으로는 과대평가되므로 변수 수를 벌점으로 반영한 Adjusted R²로 비교한다.
