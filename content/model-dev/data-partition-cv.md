---
title: "Data Partition과 Cross Validation"
en: "Hold-out, K-Fold, Stratified K-Fold, Time Series Split"
summary: "학습·튜닝·평가에 쓰는 데이터를 분리해 성능을 공정하게 재는 방법 — Hold-out, K-Fold, Stratified K-Fold, 시계열 분할"
importance: 3
order: 3
tags: [Data Partition, Validation Set, Cross Validation, Stratified K-Fold]
keypoints:
  - "Train(학습) · Validation(HP 탐색) · Test(최종 평가, 학습에 미반영)"
  - "Hold-out은 6:2:2 무작위 분할, 시계열은 반드시 시간 순서로 분할"
  - "K-Fold는 회귀, Stratified K-Fold는 클래스 비율 유지 (분류·불균형)"
qa:
  - q: "Validation set과 Test set의 차이는?"
    a: "Validation set은 학습된 모델을 검증하면서 최적의 Hyperparameter를 찾는 데 쓰는, 모델 개발 과정에 들어가는 데이터다. Test set은 학습과 검증이 끝난 모델의 성능을 마지막에 평가하는 데이터로, 학습에 반영되지 않아야 한다. 보통 Train : Validation : Test = 6 : 2 : 2, Test는 전체의 20–30%로 잡는다. '암 예측 모델 정확도 95%'라고 말할 때 기준이 되는 데이터도 Test다."
  - q: "K-Fold와 Stratified K-Fold의 차이는?"
    a: "K-Fold는 데이터를 K개로 건수만 동일하게 나눠 K번 학습·검증을 반복하고 Validation 성능을 평균내는 방법으로 주로 회귀에 쓴다. Stratified K-Fold는 각 Fold에 클래스 비율이 원본과 같게 유지되도록 나눠서, 분류 문제 특히 클래스 불균형 데이터에 쓴다. 실습 노트북도 이탈 분류라 StratifiedKFold(n_splits=3)로 튜닝했다."
  - q: "CV로 튜닝한 뒤 최종 모델은 어떻게 평가하나?"
    a: "Hold-out은 학습 모델을 그대로 쓰거나 Train + Validation으로 재학습한 뒤 Test로 평가한다. CV는 찾은 최적 파라미터로 전체 Train set을 재학습(scikit-learn의 refit=True)하고 Test로 한 번 평가한다. 어느 쪽이든 Test는 선택 과정에 쓰지 않고 마지막에 한 번만 본다."
related: [sampling-imbalance, hyperparameter-tuning, data-leakage]
source: "9/28–29 슬라이드 p.26–30, 9/29 노트북 데이타 분할·Hyperparameter 최적화 섹션"
---

```compare
Hold-out | K-Fold CV | Stratified K-Fold
방법 | 비율대로 한 번 분할 (6 : 2 : 2) | K등분, 각 Fold를 번갈아 Valid로 K번 반복 | K-Fold + 각 Fold의 클래스 비율 유지
성능 값 | Validation 1회 | K번 Validation 평균 | K번 Validation 평균
주 용도 | 데이터가 충분할 때, 빠른 실험 | 회귀 | 분류, 클래스 불균형
변형 | 시계열이면 시간 순 Train → Valid → Test | 시계열이면 TimeSeriesSplit | —
```

```python
# 6 : 2 : 2 — 두 번에 나눠 분할
df_train, temp = train_test_split(df, test_size=0.4, random_state=42)
df_valid, df_test = train_test_split(temp, test_size=0.5, random_state=42)

cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)  # 분류: 클래스 비율 유지
# cv = KFold(n_splits=3, shuffle=True, random_state=42)          # 회귀
# cv = TimeSeriesSplit(n_splits=3)                               # 시계열
```

> [!warn] 시계열은 무작위로 섞지 않음
> 미래 데이터가 Train에 들어가면 예측 시점에 알 수 없는 정보를 학습하는 셈. KOSPI200 확장 실험도 2019–2023 Train / 2023–2024 Valid / 2025–2026 Test로 시간 순 분할함.
