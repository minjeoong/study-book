---
title: 신경망의 구성 — 활성함수와 손실함수
en: From Linear Regression to Neural Network, Activation & Loss Functions
summary: "딥러닝 노드는 선형 회귀(Wx + b)에 활성함수로 비선형을 더한 것 — 이를 층으로 쌓고 손실함수로 오차를 재서 학습"
importance: 3
order: 6
tags: [활성함수, ReLU, Sigmoid, Tanh, Softmax, 손실함수, MSE, Cross Entropy]
keypoints:
  - "노드 = Σxᵢwᵢ + b (선형 회귀) + 활성함수 → 층으로 쌓으면 딥러닝"
  - "ReLU는 음수를 0으로 잘라 비선형을 만들고 계산이 쉬워 기본값, Sigmoid·Tanh는 기울기 소실"
  - "회귀는 MSE, 분류는 Softmax + Cross Entropy로 오차를 수치화해 역전파에 전달"
qa:
  - q: "활성함수는 왜 필요한가요?"
    a: "활성함수가 없으면 층을 아무리 쌓아도 선형 변환의 합성이라 결국 직선 하나와 같아져 복잡한 곡선 경계를 표현하지 못합니다. ReLU처럼 음수를 버리는 간단한 꺾임만 넣어도, 꺾임을 여러 개 모으면 곡선을 근사하고 직선 여러 개로 원형 경계도 나눌 수 있습니다. 그래서 선형 회귀식에 활성함수를 붙인 노드를 레이어로 쌓아 딥러닝 아키텍처를 만듭니다."
  - q: "Sigmoid, Tanh, ReLU를 비교해 주세요."
    a: "Sigmoid는 출력이 0~1이라 이진 분류 확률 출력에 쓰지만 입력이 극단적이면 출력이 0이나 1에 붙어 기울기가 거의 0이 되는 기울기 소실이 생깁니다. Tanh는 출력이 -1~1로 0 중심이라 소실이 덜하고 RNN, LSTM 내부에서 많이 씁니다. ReLU는 max(0, x)로 계산이 간단하고 양수 영역 기울기가 일정해 소실이 적어 대부분 신경망의 기본이지만, 일부 뉴런이 죽는 현상이 있어 변형 함수들이 나왔습니다."
  - q: "분류 모델 마지막에 Softmax를 쓰는 이유는? PyTorch에서는?"
    a: "출력층 점수(logit)를 합이 1인 확률로 바꿔 가장 큰 값의 클래스를 예측으로 삼기 위해서입니다. 손실은 이 확률과 정답의 차이를 Cross Entropy로 잽니다. PyTorch의 nn.CrossEntropyLoss는 내부에 Softmax를 포함하므로 모델 끝에는 Softmax를 붙이지 않고 logit을 그대로 넘깁니다."
related: [gradient-descent-backprop, cnn-resnet, data-stats/linear-regression-ols]
source: "Day2 슬라이드 p.3–21 (바나나 비유, Linear Regression 재해석, 파라미터 구하는 과정, Statistics vs Deep Learning, Activation Function, ReLU 쉽게 이해하기), Day3 슬라이드 p.22 (Softmax), p.39 (Softmax in RNN), 보조 교재 1장 FAQ, 실습 90-wafer 주석"
---

```compare
Linear Regression | Deep Learning
가설 | y = Wx + b | y = Wx + b 노드를 층으로 쌓음
평가 기준 | MSE, RMSE | 손실함수 (회귀 MSE, 분류 Cross Entropy)
비선형 | 없음 | 활성함수 (ReLU)
파라미터 계산 | 최소제곱법 | 역전파 + Optimizer (경사하강법)
반복 | 잔차 ≈ 0이 될 때까지 | Epoch 단위 반복 학습
```

```formula
σ(x) = 1 / (1 + e⁻ˣ) :: Sigmoid, 출력 (0, 1), 이진 분류 확률
tanh(x) = (eˣ − e⁻ˣ) / (eˣ + e⁻ˣ) :: Tanh, 출력 (−1, 1), 0 중심, RNN·LSTM
ReLU(x) = max(0, x) :: 출력 [0, ∞), 대부분 신경망의 기본
softmax(zᵢ) = e^zᵢ / Σⱼ e^zⱼ :: 출력 합 = 1, 분류 확률
MSE = (1/n) Σ(yᵢ − ŷᵢ)² :: 회귀 손실 (실습 LSTM, AutoEncoder)
```

| 문제 | 출력층 | 손실함수 (PyTorch) |
| --- | --- | --- |
| 회귀 (CO 농도, 복원) | 노드 1개 그대로 | nn.MSELoss |
| 다중 분류 (MNIST 10개) | 클래스 수만큼 logit | nn.CrossEntropyLoss (Softmax 내장) |

> [!warn] 헷갈리기 쉬움
> 실습 CNN의 마지막 출력 10개는 확률이 아니라 확률 이전의 점수(logit)다. 시계열 회귀는 Softmax 없이 예측값을 그대로 내보내고, 텍스트 다음 단어 예측은 N개 단어 중 하나라 Softmax를 쓴다.
