---
title: "회귀 평가지표: MAE · MSE · RMSE · MAPE"
en: "Regression Metrics (MAE, MSE, RMSE, MAPE, sMAPE, R²)"
summary: "오차의 크기(MAE·MSE·RMSE), 오차 비율(MAPE), 설명력(R²)으로 회귀모델을 평가 — 데이터 특성과 목적에 맞게 고른다"
importance: 2
order: 10
tags: [MAE, MSE, RMSE, MAPE, sMAPE, R-Squared]
keypoints:
  - "MAE는 직관적, MSE·RMSE는 큰 오차(이상치)에 더 큰 벌점"
  - "MAPE는 스케일이 달라도 비교 가능, 실제값 0이면 계산 불가 → sMAPE"
  - "R²는 1에 가까울수록 좋고, 음수면 평균 예측(Naive)보다 못함"
qa:
  - q: "MAE, RMSE, MAPE는 각각 언제 쓰나?"
    a: "MAE는 오차 절댓값의 평균이라 실제값과 단위가 같고 직관적이지만 데이터 스케일에 의존한다. MSE는 오차를 제곱해 이상치에 큰 벌점을 주지만 단위가 제곱이라 해석이 어렵고, RMSE는 루트를 씌워 단위를 되돌리면서 이상치 벌점은 MSE보다 완화한다. MAPE는 오차를 실제값 대비 비율로 보므로 매출과 방문자 수처럼 스케일이 다른 대상을 비교할 수 있다."
  - q: "MAPE의 한계와 대안은?"
    a: "실제값이 0이면 나눌 수 없어 계산이 안 되고, 실제값이 아주 작으면 작은 오차도 상대적으로 크게 잡혀 과민 반응하며 무한대로 발산할 수도 있다. 0인 행은 제외하거나 대체해 계산하고, 대안으로 실제값과 예측값의 평균으로 나누는 대칭형 sMAPE를 쓴다."
related: [auc-lift-baseline, classification-metrics, data-stats/regression-evaluation, data-stats/linear-regression-ols]
source: "9/28–29 슬라이드 p.45, p.55–62"
---

```formula
MAE = Σ|실제 − 예측| ÷ n :: 예: D(1,1)·E(2,1.5)·F(3,2.5) → (0 + 0.5 + 0.5) ÷ 3 = 0.33
MSE = Σ(실제 − 예측)² ÷ n :: 큰 오차에 제곱 벌점, 단위가 제곱
RMSE = √( Σ(실제 − 예측)² ÷ n ) :: 실제값과 같은 단위로 되돌림
MAPE = Σ(|실제 − 예측| ÷ |실제|) ÷ n :: 같은 예 → (0 + 0.25 + 0.17) ÷ 3 = 0.14
sMAPE = Σ|실제 − 예측| ÷ ((|실제| + |예측|) ÷ 2) ÷ n :: 실제값 0 문제를 피하는 대칭형
R² = SSR ÷ SST = 1 − SSE ÷ SST :: 설명력, Adj R²는 변수 개수 k로 보정
```

| 지표 | 장점 | 단점 |
|---|---|---|
| MAE | 직관적인 평균 오차, 실제값과 단위 동일 | 데이터 단위(scale)에 의존 |
| MSE | 오차 큰 값에 Penalty | 이상치에 매우 민감, 단위가 제곱이라 비직관적 |
| RMSE | Penalty를 주되 MSE보다 완화, 직관적 | 이상치에 민감, 단위에 의존 |
| MAPE | 평균 오차 비율로 직관적, 다른 스케일 비교 가능 | 실제값 0이면 산출 불가 |
| R² | 모델 설명력(적합도), 0–1로 해석 쉬움 | 예측력보다 설명력에 치중 |

> [!tip] 통계 과목과 연결
> R²·Adjusted R²·잔차 분해(SST = SSR + SSE)의 상세 해석은 데이터 분석 과목의 회귀모형 평가 노트 참고. 이 과목은 "어떤 상황에 어떤 오차 지표를 고르나"에 초점.
