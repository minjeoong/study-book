---
title: "Confusion Matrix와 분류 평가지표"
en: "Confusion Matrix, Accuracy, Precision, Recall, F1"
summary: "실제값과 예측값을 교차한 오분류표로 Accuracy·Recall·Precision·F1을 계산하고, 비즈니스 목적에 맞는 지표를 고른다"
importance: 3
order: 8
tags: [Confusion Matrix, Precision, Recall, F1 Score, Accuracy]
keypoints:
  - "Recall = 실제 Positive 중 잡아낸 비율 (미탐을 줄일 때)"
  - "Precision = Positive라고 한 것 중 진짜 비율 (오탐을 줄일 때)"
  - "불균형 데이터에서 Accuracy는 착시 — 전부 0으로 찍어도 90%"
qa:
  - q: "Precision과 Recall의 차이, 언제 무엇을 중시하나?"
    a: "Recall은 실제 Positive 중 모델이 잡아낸 비율이라 놓치는 것(미탐, FN)이 치명적일 때 본다. 암 환자 진단처럼 환자를 놓치면 생명이 위험하고 오탐은 추가 검사로 해결되는 경우다. Precision은 Positive로 예측한 것 중 진짜 비율이라 잘못 잡는 것(오탐, FP)이 치명적일 때 본다. 정상 메일을 스팸으로 분류하면 심각하고 스팸을 놓치는 건 덜 위험한 스팸 필터가 예다."
  - q: "CCTV 범인 색출 모델 A·B·C 중 무엇을 고르나?"
    a: "모델 C는 Accuracy 0.90으로 가장 높지만 전부 일반인으로 예측해 Recall이 0이라 범인을 한 명도 못 잡는 쓸모없는 모델이다. 범인을 최대한 잡는 게 목표면 Recall 0.80인 모델 A가 낫다. 반대로 일반인을 범인으로 오탐하는 걸 최소화하려면 FP가 27건인 A보다 15건이고 Precision이 0.25로 더 높은 모델 B를 고른다. 지표의 절대값보다 어떤 오류가 더 비싼지가 기준이다."
  - q: "F1 Score는 왜 산술평균이 아니라 조화평균인가?"
    a: "조화평균은 두 값 중 작은 쪽에 크게 끌려가서, Precision이나 Recall 하나만 높은 모델에 높은 점수를 주지 않는다. 예를 들어 Precision 1.0, Recall 0.0이면 산술평균은 0.5지만 F1은 0이다. 그래서 특정 Threshold에서 Positive 클래스의 오탐과 미탐을 함께 평가할 때 쓰고, 금융사기·암 환자처럼 둘 다 중요한 문제에 맞다."
related: [auc-lift-baseline, sampling-imbalance, regression-metrics, sllm-finetuning/sft-evaluation]
source: "9/28–29 슬라이드 p.45–49, p.54"
---

```formula
Accuracy = (TP + TN) ÷ 전체 :: 전체 중 얼마나 맞췄나 — 예: (20 + 60) ÷ 100 = 0.80
Recall = TP ÷ (TP + FN) :: 실제 Positive 중 얼마나 잡았나 — 20 ÷ 25 = 0.80 (1 − Recall = 미탐)
Precision = TP ÷ (TP + FP) :: Positive 예측 중 얼마나 진짜인가 — 20 ÷ 35 = 0.57 (1 − Precision = 오탐)
F1 = 2·P·R ÷ (P + R) :: 둘의 조화평균 — 2 × 0.57 × 0.80 ÷ 1.37 = 0.67
```

| 지표 | 무엇을 평가 | 대표 사례 |
|---|---|---|
| Accuracy | 특정 Threshold에서 0·1 모두, 클래스가 균등할 때 | 성별, 개/고양이 분류 |
| F1 | 특정 Threshold에서 Positive의 오탐·미탐 모두 | 금융사기, 암 환자 |
| Precision | Positive 예측의 적중률 (오탐 관리) | 스팸 메일 |
| Recall | 실제 Positive의 탐지율 (미탐 관리) | 암 환자 진단 |
| AUC | Threshold 없이 전체 확률로 0·1 구분력 | 신용평가 |
| LIFT | Threshold 없이 상위 확률 구간의 Positive 집중도 | 마케팅 타깃 추천 |

> [!warn] Accuracy의 함정
> 실습 데이터(이탈률 21%)에서 전부 "유지"로 예측하는 Naive 모델도 Test Accuracy 0.79가 나오지만 F1은 0, AUC는 0.5. 불균형 문제에선 Accuracy만 보고 모델을 고르면 안 됨.
