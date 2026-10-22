---
title: 데이터 스케일링
en: Feature Scaling (Min-Max, Standard, Robust, Normalizer)
summary: 연속형 Feature마다 제각각인 범위나 분포를 같은 기준으로 맞춰 학습 안정성과 수렴 속도를 높이는 전처리
importance: 3
order: 6
tags: [스케일링, StandardScaler, MinMaxScaler, RobustScaler, 정규화]
keypoints:
  - Min-Max는 0~1로, Standard는 평균 0·표준편차 1로, Robust는 중앙값 0·IQR 1로 맞춘다
  - 이상치가 있으면 Min-Max는 좁게 압축되고 Standard도 흔들리므로 Robust가 안전
  - Scaler는 Train에서만 fit하고 Test에는 transform만, 거리 기반 모델에서 특히 중요
qa:
  - q: 스케일링은 왜 하나요?
    a: "Feature마다 단위와 범위가 다르면(0~10 vs 1,000~100,000) 값의 변화 폭이 큰 Feature가 모델에 과도한 영향을 줍니다. 학습 중 값이 너무 커지거나 작아 0으로 수렴하거나 발산하는 문제, overflow·underflow도 막아 주고, 안정성과 수렴 속도를 높입니다. 단위 차이는 독립변수 행렬의 조건수(Condition number)를 키워 작은 오차에도 해가 크게 흔들리게 만듭니다."
  - q: StandardScaler, MinMaxScaler, RobustScaler는 어떻게 고르나요?
    a: "범위를 0~1로 고정해야 하면 Min-Max지만 이상치 하나가 있으면 나머지 값이 아주 좁은 범위로 눌립니다. Standard는 평균 0, 표준편차 1로 맞추는 표준화로 가장 무난하지만 이상치가 평균과 분산을 흔듭니다. 이상치가 많으면 중앙값과 IQR을 쓰는 Robust가 영향을 받지 않습니다."
  - q: 모든 모델에 스케일링이 필요한가요?
    a: "KNN, SVM, K-means, 경사하강법을 쓰는 선형·신경망 모델처럼 거리나 계수 크기에 민감한 모델에는 매우 중요합니다. 반면 의사결정나무나 랜덤포레스트 같은 트리 모델은 값의 순서로 분할하므로 스케일링 영향이 거의 없습니다. One-Hot으로 만든 0/1 변수는 보통 스케일링하지 않습니다."
related: [outlier-detection, preprocessing-leakage, variable-transformation, data-stats/normal-distribution]
source: 9/14 슬라이드 p.42–46 (Data Scaling 개념, Why, Condition number, Min-Max, Standard, Robust, Normal Scaling, 유의점 fit vs transform), 실습 2 12번 (standard / robust / minmax)
---

```formula
x' = (x − min) / (max − min) :: Min-Max, 0~1 범위, 이상치에 매우 민감
x' = (x − μ) / σ :: Standard, 평균 0 · 표준편차 1, 최소·최대 제한 없음
x' = (x − median) / IQR :: Robust, 중앙값 0 · IQR 1, 이상치 영향 없음, 결과 범위가 더 넓음
x' = x / √(x² + y² + z²) :: Normalizer (L2), Feature가 아니라 행(Sample) 단위로 길이를 1로
```

```compare
StandardScaler | MinMaxScaler | RobustScaler
기준 통계 | 평균, 표준편차 | 최솟값, 최댓값 | 중앙값, IQR
결과 범위 | 제한 없음 (대략 −3~3) | 0~1 | 제한 없음
이상치 | 영향 받음 | 매우 민감 (나머지가 압축) | 거의 무관
언제 | 기본값, 정규분포에 가까울 때 | 범위 고정 필요 (이미지 픽셀 등) | 이상치가 많은 데이터
```

> [!warn] 헷갈리기 쉬움
> `scaler.fit(X_train)` 후 `transform(X_train)`, `transform(X_test)`. Test로 다시 fit하거나 전체 데이터로 fit하면 Test 통계량이 학습에 새어 들어가 성능이 부풀려진다.
