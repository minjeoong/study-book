---
title: 분류 성능 지표와 클래스 불균형
en: Accuracy, Precision, Recall, F1, Macro-F1, ROC-AUC, Class Weight
summary: "불균형 데이터에서는 Accuracy가 착시를 만들므로, 놓치면 안 되는 클래스의 Recall과 클래스 평균 F1(Macro)을 함께 보고 손실 가중치로 보정"
importance: 3
order: 14
tags: [Accuracy, Precision, Recall, F1, Macro-F1, ROC-AUC, 클래스 불균형, Class Weight]
keypoints:
  - "정상이 압도적인 데이터는 전부 정상이라 찍어도 Accuracy가 높음 → 클래스별 Recall 확인"
  - "Precision = 양성 예측 중 진짜 비율(오탐 FP), Recall = 실제 양성 중 잡은 비율(미검출 FN)"
  - "역빈도 Class Weight로 소수 클래스 오분류에 큰 벌점 → 소수 Recall↑, 다수 Recall↓"
qa:
  - q: "Precision과 Recall은 어떻게 다르고 언제 무엇을 우선하나요?"
    a: "Precision은 모델이 양성(불량)이라고 한 것 중 실제 양성의 비율이라 오탐(FP)이 적을수록 높고, Recall은 실제 양성 중 모델이 잡아낸 비율이라 미검출(FN)이 적을수록 높습니다. 웨이퍼 검사처럼 불량을 놓치면 후공정 가공비까지 손실되는 경우는 FN 비용이 커서 Recall을 우선합니다. 그래도 오탐이 너무 늘면 재검사 부담이 커지므로 둘의 조화평균인 F1을 함께 봅니다."
  - q: "Macro-F1과 Weighted-F1의 차이는?"
    a: "Macro-F1은 클래스별 F1을 단순 평균해 데이터가 적은 클래스도 같은 비중으로 반영하므로 불균형 데이터에서 소수 클래스 성능 저하를 잘 드러냅니다. Weighted-F1은 클래스 샘플 수로 가중 평균해 다수 클래스의 영향이 커서 Accuracy와 비슷하게 움직입니다. 실습 BERT(AG News)는 클래스가 3만 건씩 균등해 weighted로도 충분했고, 팀 과제(WM-811K)는 최대 65배 불균형이라 Macro-F1을 게이트 지표로 썼습니다."
  - q: "ROC-AUC는 무엇인가요?"
    a: "분류 임계값을 바꿔 가며 TPR(Recall)과 FPR을 그린 ROC 곡선의 아래 면적으로, 임계값과 무관하게 양성을 음성보다 높게 점수 매기는 능력을 0.5(무작위)에서 1 사이로 나타냅니다. 양성이 매우 드문 불균형 데이터에서는 AUC가 낙관적으로 나올 수 있어 Precision-Recall 곡선 면적(AUPRC)을 함께 봅니다. 수업의 BERT 전이학습 사례(방사선 보고서 분류)도 macro AUPRC 0.88, AUC 0.97로 함께 보고했습니다."
related: [ml-overview-learning-types, overfitting-regularization, cnn-resnet]
source: "Day1 슬라이드 p.18 (분류 vs 회귀 모델평가), Day3 슬라이드 p.83 (BERT 전이학습 사례 AUPRC·AUC), 실습 60-bert compute_metrics, 실습 90-wafer, 4조 팀 과제 보고서 2–6장"
---

```formula
Precision = TP / (TP + FP) :: 불량이라 한 것 중 진짜 불량 (오탐 FP를 줄임)
Recall = TP / (TP + FN) :: 실제 불량 중 잡은 비율 (미검출 FN을 줄임)
F1 = 2 · P · R / (P + R) :: 조화평균, 한쪽만 높으면 낮게 나옴
w_c = N / (K · n_c) :: 역빈도 클래스 가중치. Near-full 22.84 vs Edge-Ring 0.35
```

| 4조 과제 Test (3 seed) | Baseline | + Class Weight (최종) |
| --- | --- | --- |
| 소수 3클래스 Recall (주 지표) | 0.7957 | 0.9011 |
| Scratch Recall | 0.1835 | 0.4132 |
| Macro-F1 (게이트) | 0.7391 | 0.7321 (잡음 폭 0.0164 이내) |
| none(정상) Recall | 0.7973 | 0.6320 (오탐 증가) |
| Accuracy (참고용) | 82.60% | 77.80% |

> [!warn] Accuracy 착시
> 과제에서 Dropout(p = 0.3)은 Valid Accuracy 84.69%로 8개 실험 중 1위였지만 Scratch Recall은 0.17 → 0.04로 떨어졌다. 애매한 샘플을 전부 다수 클래스로 보내면 정확도는 오른다. 지표는 실험 전에 비용 구조(FN vs FP)로 정하고, 결과를 본 뒤 바꾸지 않는다.
