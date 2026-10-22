---
title: "Model Drift와 모니터링"
en: "Data Drift, Prediction Drift, Concept Drift, Model Renewal"
summary: "학습 환경과 운영 환경의 차이로 시간이 지나며 모델 성능이 떨어지는 현상 — 무엇이 변했는지에 따라 감지·대응법이 다르다"
importance: 3
order: 12
tags: [Model Drift, Data Drift, Concept Drift, Monitoring, Re-training]
keypoints:
  - "Data Drift P(X), Prediction Drift P(ŷ), Concept Drift P(Y|X)의 변화"
  - "대응은 Threshold 조정 → Re-training → Re-modeling 순"
  - "모델은 개발로 끝나지 않음 — 모니터링으로 유지·폐기·재개발 결정"
qa:
  - q: "Data Drift와 Concept Drift의 차이는?"
    a: "Data Drift는 입력 X의 분포가 학습 시점과 달라지는 것으로, 신규 유저층 유입, 계절성, 센서 단위 변경(°F → °C) 같은 원인이 있다. Concept Drift는 입력과 정답의 관계 P(Y|X) 자체가 바뀌어 기존 패턴이 더 이상 유효하지 않은 것으로, 금리 인상·규제 개정이나 경쟁사 등장으로 이탈 요인이 바뀌는 경우다. Prediction Drift는 예측 분포의 변화로, 두 드리프트가 생긴 결과로 나타나는 경우가 많다."
  - q: "드리프트가 감지되면 어떻게 대응하나?"
    a: "모델 성능 변화 없이 예측 분포만 변했다면 의사결정용 확률 기준값을 조정하는 Threshold Adjustment(예: 신용 1등급 기준 연체 확률 0.2 → 0.15)로 대응한다. 성능이 떨어졌다면 Feature는 그대로 두고 새 데이터로 가중치만 다시 학습하는 Re-training을 하고, 그래도 개선되지 않으면 EDA부터 Feature 생성까지 다시 하는 Re-modeling으로 모델을 재구축한다."
related: [shap-model-interpretation, data-partition-cv, automl-genai-model-dev, sllm-finetuning/sllm-three-axes]
source: "9/28–29 슬라이드 p.26, p.67–73"
---

```formula
Data Drift: Pₜ(X) ≠ Pref(X) :: 입력 분포 변화 — 신규 유저층, 계절성, 데이터 파이프라인 변경
Prediction Drift: Pₜ(ŷ) ≠ Pref(ŷ) :: 예측 분포 변화 — 스팸 탐지율 5% → 20%, 확신 없는 0.4–0.6 구간 증가
Concept Drift: Pₜ(Y|X) ≠ Pref(Y|X) :: 관계 변화 — 금리·규제, 앱 개편, 경쟁사 등장으로 정확도 점진 하락
```

| Renewal 방법 | 내용 | 대응 Drift |
|---|---|---|
| Threshold Adjustment (Cut-off 변경) | 등급·타깃 구간의 기준값만 조정, 모델 그대로 | Prediction Drift (성능 변화 없음) |
| Re-training (모델 재학습) | Feature는 같고 계수만 변경 (예: Feature A 계수 0.5 → 0.7) | Data Drift |
| Re-modeling (모델 재구축) | Feature 변경 포함, EDA부터 모델을 새로 생성 | Concept Drift, 재학습으로 개선 안 될 때 |

> [!tip] 모델 Lifecycle 관점
> 1단계 개발(Partition → 학습 → 평가 → 최종 모델 선택·배포) 뒤 2단계 운영에서 새 원천 데이터를 같은 가공 로직으로 처리해 예측하고, 모니터링 결과로 모델 유지·폐기·재개발을 결정. 이 감시·재학습을 자동화하는 흐름이 AIOps와 AutoML로 이어짐.
