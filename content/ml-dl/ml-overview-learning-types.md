---
title: 머신러닝 개요와 학습 유형
en: Machine Learning Overview, Supervised / Unsupervised Learning
summary: "명시적 규칙 대신 경험(데이터)으로 성능을 높이는 ML — 정답 유무로 지도·준지도·비지도, 출력 형태로 분류·회귀를 나눔"
importance: 3
order: 1
tags: [머신러닝, 지도학습, 비지도학습, 준지도학습, 분류, 회귀, Train-Valid-Test]
keypoints:
  - "ML = Task T를 Experience E로 반복해 Performance P가 오르면 학습 (Mitchell)"
  - "지도는 라벨로 정답 예측, 비지도는 군집·차원축소, 준지도는 소량 라벨 + 다량 비라벨"
  - "통계는 가설 확인(선형, p-value), ML은 데이터로 가설 발견(비선형, 검증 성능)"
qa:
  - q: "지도학습과 비지도학습의 차이는?"
    a: "지도학습은 입력과 정답(Label)을 모두 주고 예측값과 정답을 비교하며 학습해 분류·회귀 문제를 풉니다. 비지도학습은 입력만 주고 정답 없이 데이터 구조를 스스로 찾는 방식으로 군집화나 차원 축소에 씁니다. 라벨링이 어렵거나 비쌀 때는 소량의 라벨과 다량의 비라벨 데이터를 함께 쓰는 준지도학습을 쓰며, 출력은 지도학습과 같습니다."
  - q: "통계 모델링과 머신러닝은 어떻게 다른가요?"
    a: "통계는 전문가 가설을 세우고 정해진 분포와 선형 모형에 맞춰 p-value 같은 진단으로 변수 해석과 신뢰도를 중시하는 가설 확인 방식입니다. 머신러닝은 모형 모양을 미리 가정하지 않고 데이터에서 비선형 패턴을 학습하며, 통계적 진단 대신 Train·Valid·Test 성능으로 모델을 고릅니다. 우열 관계가 아니라 분석 영역의 확장으로 보는 것이 맞습니다."
  - q: "Train, Validation, Test 셋은 왜 나누나요?"
    a: "Train으로 파라미터를 학습하고, Validation으로 하이퍼파라미터 튜닝과 모델 선택을 하며, Test는 마지막에 한 번만 써서 처음 보는 데이터에 대한 일반화 성능을 확인합니다. 세 성능을 비교하면 과적합 여부도 드러납니다. Test를 모델 선택에 쓰면 Test에 맞춘 셈이 되어 성능이 낙관적으로 나옵니다."
related: [overfitting-regularization, classification-metrics, data-stats/linear-regression-ols]
source: "Day1 슬라이드 p.3–39 (AI History, AI–ML–DL, Statistics vs ML, 모델 접근 방향, 모델 성능 영향 요인, 용어의 이해, Learning, ML Type, Semi-Supervised)"
---

```compare
통계 분석 | 머신러닝
접근 | Human Driven, 가설 확인 | Data Driven, 가설 발견
데이터 | 정형, 샘플링 | 정형 + 비정형(이미지·텍스트), 빅데이터
모형 | 선형 함수, 모양을 먼저 가정 | 비선형, 데이터에서 패턴 학습
검증 | p-value 등 변수 단위 진단 | Train : Valid : Test 성능 비교
```

```compare
Classification | Regression
목적 | X로 Y를 구분하는 경계 찾기 (Decision Boundary) | X로 Y와 가장 가깝게 예측 (Best Fit Line)
결과값 | 이산형 Class Label | 연속형 숫자
평가 | Accuracy 등 분류 정확도 | SSE, RMSE, R²
```

| 학습 유형 | 데이터 | 출력 | 예 |
| --- | --- | --- | --- |
| 지도 (Task-driven) | 모두 Labeled | Label 예측 | 분류, 회귀 |
| 준지도 | 소량 Labeled + 다량 Unlabeled | Label 예측 | 라벨링 비용이 큰 경우 (Smoothness, Low-density 가정) |
| 비지도 (Data-oriented) | 모두 Unlabeled | 패턴·군집 | Clustering, 차원 축소 |

- 평가 방식: 모델 하나를 만들고 Train → Valid → Test 성능을 비교하는 Single-Split Evaluation
- 모델 성능 영향 요인: 모델링(알고리즘 적용) 전 단계(요건 정의·데이터 준비·변수 탐색)에 노력의 약 85%

> [!tip] 당부 말씀
> Kaggle은 최대 성능이 목적이지만, 비즈니스 모델링은 "성능 점수 싸움이 아니라 현장의 문제 해결책 싸움". 현업이 결과를 이해·수용·활용할 수 있는지가 정확도보다 중요하다.
