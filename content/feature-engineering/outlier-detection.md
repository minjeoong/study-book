---
title: 이상치 탐지와 처리
en: Outlier Detection (IQR, Z-score) & Treatment
summary: 범위에서 크게 벗어난 극단값을 IQR·Z-score로 찾되, 오류인지 실제 극단값인지 도메인으로 판단해 제거·대체·유지를 정한다
importance: 3
order: 5
tags: [이상치, IQR, Z-score, Clipping, 박스플롯]
keypoints:
  - 이상치는 평균·분산 같은 통계량을 왜곡하고 분산을 과도하게 키워 모델 예측력을 약화시킨다
  - IQR 기준 Q1 − 1.5·IQR 미만, Q3 + 1.5·IQR 초과 / Z-score 기준 |z| > 3
  - 처리는 제거, 상·하한값 대체(Clipping), 가중치 조정, 경향값 변경 — 실제 대형 주택이면 유지 검토
qa:
  - q: 이상치는 어떻게 찾나요?
    a: "IQR 방식은 1사분위수와 3사분위수 사이 폭(IQR)의 1.5배를 넘어 벗어난 값을 이상치로 봅니다. 사분위수 기반이라 분포가 치우쳐도 강건합니다. Z-score 방식은 평균에서 표준편차 몇 배 떨어졌는지 보고 절댓값 3을 넘으면 이상치로 보는데, 평균과 표준편차 자체가 이상치에 영향을 받고 정규분포를 가정한다는 한계가 있습니다."
  - q: 이상치는 무조건 제거하나요?
    a: "아닙니다. 나이 355처럼 입력 오류면 수정하거나 결측으로 처리하지만, 실제 대형 주택이나 VIP 고객처럼 의미 있는 극단값일 수 있습니다. 과도하게 제거하면 예측치 분산은 줄지만 예측력을 과장하는 편향이 생깁니다. 그래서 상·하한값으로 잘라내는 Clipping, 가중치 조정, 로그변환으로 영향만 줄이는 방법을 함께 검토합니다."
  - q: 이상치 제거와 Clipping은 Train과 Test에 어떻게 적용하나요?
    a: "IQR 경계는 Train에서만 계산합니다. 행을 지우는 remove는 Train에만 적용하고 y도 같이 지우며, Test는 평가 대상이므로 지우지 않습니다. Clip은 Train에서 구한 같은 경계로 Train과 Test 모두 자릅니다. 실습에서 Gr_Liv_Area(Train 이상치 59건)와 Lot_Area(113건)에 Clip을 적용했습니다."
related: [missing-value, feature-scaling, variable-transformation, data-stats/dispersion-iqr]
source: 9/14 슬라이드 p.37–41 (Outlier 개념, IQR Based, Z-score Based, 처리, 유의점), 실습 1 9번 (IQR 이상치 요약), 실습 2 8번 (remove / clip)
---

```formula
IQR = Q3 − Q1 :: 가운데 50%의 폭
하한 = Q1 − 1.5·IQR,  상한 = Q3 + 1.5·IQR :: 벗어나면 이상치 (박스플롯 수염 끝)
z = (x − μ) / σ :: |z| > 3이면 이상치 (68-95-99.7 규칙상 0.3% 바깥)
```

```python
q1, q3 = X_train[col].quantile([0.25, 0.75])
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr          # 경계는 Train에서만
X_train[col] = X_train[col].clip(lo, hi)         # Clip은 Train·Test 동일 경계
X_test[col] = X_test[col].clip(lo, hi)
```

> [!warn] 헷갈리기 쉬움
> 통계량에 의한 무조건적인 탐색은 위험하다. 전체 데이터가 많을수록 이상치의 영향은 줄고, 분석 도메인에 따라 이상치 자체가 중요한 의미(사기, 불량)일 수 있다. 발생 원인을 먼저 고찰할 것.
