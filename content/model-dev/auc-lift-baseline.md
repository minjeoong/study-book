---
title: "AUC · LIFT · Baseline 모델"
en: "ROC-AUC, LIFT, Baseline vs Naive Model"
summary: "임계값과 무관하게 전체 순위 성능을 보는 AUC, 상위 집단의 예측력을 보는 LIFT, 그리고 성능을 비교할 기준이 되는 Baseline·Naive 모델"
importance: 3
order: 9
tags: [AUC, ROC, LIFT, Baseline, Naive Model]
keypoints:
  - "AUC = ROC 곡선 아래 면적, 0.5 무작위 ~ 1.0 완벽"
  - "LIFT = 상위 K% 구간 Positive 비율 ÷ 전체 Positive 비율"
  - "평가의 핵심은 절대값보다 비교 기준 — Naive부터 이겨야 함"
qa:
  - q: "AUC란 무엇이고 왜 많이 쓰나?"
    a: "분류 임계값을 0부터 1까지 바꿔 가며 그린 ROC 곡선 아래 면적으로, 특정 Threshold에 의존하지 않고 모델이 Positive를 Negative보다 높은 점수로 줄 세우는 능력을 종합 평가한다. 0.5면 무작위 수준, 0.7–0.8 Mediocre, 0.8–0.9 Good, 0.9 이상 Excellent로 본다. 클래스 비율이나 Threshold의 영향을 덜 받아 신용평가처럼 전체 확률 분포로 판단하는 문제에 쓴다."
  - q: "LIFT는 언제 쓰나?"
    a: "예측 Score 상위 고객을 골라 업무에 쓸 때 쓰는 직관적인 지표로, 상위 K% 구간의 Positive 비율이 전체 대비 몇 배인지를 나타낸다. 100명 중 이탈 15명(0.15)인데 Score 상위 10명 중 5명이 이탈이면 LIFT는 0.5 ÷ 0.15 = 3.33으로 무작위 추출보다 3.33배 이탈 고객을 잘 찾는다. AUC로 전체 집단 성능을, LIFT로 관심 집단 성능을 보며, 마케팅 타깃처럼 상위 1–10%만 쓸 땐 AUC가 낮아도 해당 구간 LIFT가 높은 모델이 나을 수 있다."
  - q: "Baseline 모델과 Naive 모델의 차이는?"
    a: "Baseline 모델은 성능 비교 대상으로 쓰는 모든 기준 모델로, 이전에 개발한 모델·단순 선형회귀·규칙 기반 모델·Naive 모델이 해당한다. Naive 모델은 학습 없이 가장 단순한 규칙만으로 예측하는 모델로, 분류는 다수 클래스(불량 5%면 전부 정상), 회귀는 평균값이나 시계열의 직전 값(내일 주가 = 전일 종가)으로 예측한다. 새 모델은 최소한 Naive를 의미 있게 이겨야 가치가 있다."
related: [classification-metrics, sampling-imbalance, regression-metrics, data-stats/linear-regression-ols]
source: "9/28–29 슬라이드 p.50–54, 9/29 노트북 Baseline 모델 평가 섹션, 9/28 실습 코드 naive_bayes_compare.py"
---

```formula
LIFT(상위 K%) = (상위 K% 구간 Positive 비율) ÷ (전체 Positive 비율) :: 1.0이면 무작위와 같음
예: 0.50 ÷ 0.15 = 3.33 :: Score 상위 10%에서 이탈 고객을 무작위보다 3.33배 잘 찾음
AUC = ROC 곡선 아래 면적 :: Threshold를 0→1로 바꾸며 그린 민감도(TPR)–오탐률(FPR) 곡선, Random 대각선이면 0.5
```

| 실습 Test 성능 (이탈 예측) | Accuracy | F1 | AUC |
|---|---|---|---|
| Naive — 전부 0(유지) | 0.788 | 0.000 | 0.500 |
| Naive — 나이만 사용 | 0.771 | 0.324 | 0.754 |
| Gaussian Naive Bayes | 0.836 | 0.489 | 0.789 |
| Random Forest (튜닝) | 0.843 | 0.468 | 0.848 |

> [!tip] AUC와 LIFT를 함께 읽기 (p.53)
> 모델 A는 AUC 0.95로 전체 성능 최고, 모델 C는 AUC 0.88이지만 상위 1% LIFT 6.3으로 최상위 구간 최고, 모델 D는 AUC 0.61로 전체는 Poor지만 상위 20%까지는 2배 성능. 어느 집단에 쓸지에 따라 고를 모델이 달라짐.
