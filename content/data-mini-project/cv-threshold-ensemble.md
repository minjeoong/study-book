---
title: 모델링 — Baseline에서 앙상블까지
en: Baseline, OOF Cross-Validation, Threshold Tuning, Ensemble & Calibration
summary: 기본 피처의 LightGBM Baseline에서 출발해 피처 확장, 클래스 가중치, OOF 기반 임계값 조정, 다양성 앙상블과 확률 보정까지 회차별로 한 가지씩 바꾸며 기록
importance: 3
order: 4
tags: [LightGBM, 교차검증, OOF, 임계값, 앙상블, 확률 보정, 데이터 누수]
keypoints:
  - Baseline 5종 비교에서 부스팅 > 배깅 > 선형, LightGBM CV F1(0) 0.780이 출발점
  - F1에 맞는 임계값은 0.5가 아니다 → OOF 예측으로 임계값을 고르고, 중첩검증으로 낙관 편향 확인
  - 트리끼리는 예측 상관 0.94~0.99라 섞어도 효과가 적다 → 성격이 다른 모델(선형, MLP, 분자 커널 SVM)이 앙상블에 기여
qa:
  - q: 모델 성능을 어떻게 단계적으로 올렸나요?
    a: "제공 피처 그대로 LogReg, RF, XGBoost, LightGBM, CatBoost를 비교해 LightGBM(CV F1 0.780)을 기준으로 잡았습니다. 1차에 RDKit 서술자, MACCS, 입체 ECFP를 더하고 클래스 가중치와 임계값 조정, 소프트보팅으로 0.796, 2차에 지문 10종과 폴드별 이웃 피처로 0.803, 5차에 10겹 CV와 상위 4,000개 피처 선택으로 0.811까지 올렸습니다. 회차마다 바꾼 것, 근거, 관찰을 실험 기록에 남겨 무엇이 효과였는지 추적했습니다."
  - q: 임계값은 왜, 어떻게 조정했나요?
    a: "모델은 확률을 내고 0.5에서 자르는 것은 관례일 뿐이라, F1을 최대로 만드는 임계값은 클래스 비율과 확률 보정 상태에 따라 0.5와 다릅니다. 교차검증의 OOF 예측(각 행을 학습에 쓰지 않은 폴드 모델로 예측한 값)으로 임계값을 고르고, 그 선택 과정까지 바깥 폴드에서 반복하는 중첩검증으로 OOF 점수가 과대평가되지 않았는지 확인했습니다. 최종 회차는 5겹 교차 적합 시그모이드 보정 후 임계값 0.414가 최적점이었습니다."
  - q: 이웃 라벨 피처는 왜 누수 위험이 있고 어떻게 막았나요?
    a: "'가장 비슷한 학습 분자 20개 중 독성 비율' 같은 피처는 강력하지만, 전체 학습 데이터의 라벨로 계산하면 검증 폴드 행의 라벨이 자기 피처에 들어가 OOF 점수가 낙관적으로 됩니다. 그래서 Tanimoto 유사도 행렬은 라벨 없이 한 번만 계산하고, 라벨에 의존하는 통계는 폴드마다 학습 행만으로 다시 계산했습니다. 실제 예측 때 테스트 분자가 전체 학습 데이터만 보는 상황을 그대로 흉내 낸 것입니다."
related: [score-validation-selection-bias, toxicity-eda-findings, feature-engineering/preprocessing-leakage, feature-engineering/imbalanced-data, python-data/stats-to-ml-pipeline]
source: 10/20 챌린지 최종 아카이브 — EXPERIMENTS.md (0~5차 실험 기록), baseline_results.csv, model_comparison_label1.csv, 논문검토와_설계.md, code/src/similarity.py (누수 없는 이웃 피처), round6~8 info.json
---

| 회차 | 바꾼 것 | 피처 수 | OOF F1 (0~5차 라벨 0, 6~8차 라벨 1) |
| --- | --- | --- | --- |
| 0 Baseline | 제공 피처, 기본 하이퍼파라미터, 임계값 0.5 | 3,027 | 0.7799 |
| 1 | RDKit 서술자 · MACCS · 입체 ECFP + 클래스 가중치 + 임계값 0.39 + 소프트보팅 | 5,311 | 0.7962 |
| 2 | 지문 10종 + 폴드별 이웃(AD) 피처 + 모델 7종 | 11,193 | 0.8025 (실제 0.835) |
| 3–4 | 모델 14~15종, Optuna 튜닝, 순위 평균, Mordred는 별도 모델로 | 11,193~12,601 | 0.8042~0.8044 |
| 5 | 10겹 CV, 모델 6종으로 압축, 상위 4,000 피처 | 12,601 | 0.8111 |
| 6–8 | 지표가 라벨 1 F1로 변경 → 확률 블렌드, MLP · 분자 커널 SVM · count 지문 추가, 시그모이드 보정 | - | 0.8395 → 0.8446 → 0.8460 (실제 0.8472) |

```flow
Baseline :: 모델 5종 비교, 출발점 점수 고정
피처 확장 :: 지문·서술자 조합, 효과 없으면 피처 대신 별도 모델로 (Mordred 0.8011 → 0.7988 하락)
OOF 예측 :: K-fold로 모든 학습 행에 대해 학습에 안 쓴 모델의 확률 확보
앙상블 · 보정 :: OOF로 모델 가중치 선택, 교차 적합 시그모이드로 확률 보정
임계값 · 제출 :: OOF에서 F1 최대 임계값 선택 → 927행 예측, 형식 검증
```

```python
from sklearn.model_selection import StratifiedKFold
oof = np.zeros(len(y))
for tr, va in StratifiedKFold(10, shuffle=True, random_state=42).split(X, y):
    oof[va] = make_model().fit(X[tr], y[tr]).predict_proba(X[va])[:, 1]   # 학습에 안 쓴 행만 예측
cuts = np.linspace(0.2, 0.8, 121)
best = max(cuts, key=lambda c: f1_score(y, oof >= c, pos_label=1))       # F1 최대 임계값
```

> [!tip] 면접 팁
> "앙상블은 많이 섞는 것이 아니라 다르게 틀리는 모델을 섞는 것." 탐욕 선택이 트리 2종만 고른 회차와, 가장 약한 logreg(트리와 상관 0.85)가 오히려 채택된 회차를 대비해 설명하면 설득력이 있다. 최종 블렌드 가중치 30 중 14가 신경망 계열.
