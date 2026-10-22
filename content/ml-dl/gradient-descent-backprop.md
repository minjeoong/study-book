---
title: 경사하강법과 역전파
en: Gradient Descent, Learning Rate, Backpropagation, Adam
summary: "손실함수의 기울기 반대 방향으로 가중치를 조금씩 옮기는 경사하강법과, 그 기울기를 연쇄법칙으로 출력층부터 거꾸로 구하는 역전파"
importance: 3
order: 7
tags: [경사하강법, 학습률, 역전파, Chain Rule, Optimizer, Adam, 기울기 소실]
keypoints:
  - "W* = W − η · ∂E/∂W — 학습률 η가 보폭, 기울기가 방향"
  - "역전파 = 연쇄법칙으로 ∂E/∂W를 출력층부터 거꾸로 계산 (∂E/∂W₆ = Δ · H₂)"
  - "Adam = Momentum(방향 기억) + RMSProp(파라미터별 보폭 조절)"
qa:
  - q: "역전파(Backpropagation)를 설명해 주세요."
    a: "순전파로 예측값과 손실을 계산한 뒤, 손실을 각 가중치로 미분한 기울기를 출력층에서 입력층 방향으로 연쇄법칙을 써서 거꾸로 계산하는 과정입니다. 예를 들어 ∂E/∂W₆는 ∂E/∂prediction × ∂prediction/∂W₆로 쪼개지고, 결과는 오차 Δ = prediction − actual에 그 가중치로 들어온 은닉 출력 H₂를 곱한 값이 됩니다. 이렇게 구한 기울기로 Optimizer가 가중치를 업데이트합니다."
  - q: "학습률이 너무 크거나 작으면 어떻게 되나요?"
    a: "너무 작으면 아주 조심스럽게 한 발씩 내려가 학습 시간이 오래 걸리고, 너무 크면 최소점을 지나쳐 손실 그래프 밖으로 튀는 over-shooting이나 발산이 생깁니다. 사람이 정하는 하이퍼파라미터라 튜닝이 필요하고, 초반에는 큰 보폭으로 빠르게 탐색하다 최소점 근처에서는 보폭을 줄이는 방식이 좋습니다. 실습에서는 Adam에 lr = 0.001을 썼습니다."
  - q: "기울기 소실과 폭주는 왜 생기고 어떻게 해결하나요?"
    a: "역전파에서 기울기가 층마다 곱해지는데, Sigmoid나 Tanh처럼 기울기가 0에 가까운 값이 반복해서 곱해지면 앞쪽 층에 도달할 때 거의 0이 되어 학습이 멈추는 것이 소실입니다. 반대로 매우 깊은 망이나 잘못된 초기화로 큰 기울기가 곱해지면 폭주해 발산합니다. 소실은 ReLU, Batch Normalization, ResNet의 Skip Connection으로, 폭주는 임계값을 넘으면 잘라내는 Gradient Clipping으로 완화합니다."
related: [activation-loss-functions, batch-dropout-batchnorm, cnn-resnet]
source: "Day2 슬라이드 p.22–42 (최적화 접근, DL 최적화, Gradient Descent, Learning Rate, Optimizer & LR 쉽게 이해하기, Forward vs Backward-propagation, Backpropagation 단계별 설명, Optimizer·Adam, Gradient Vanishing & Exploding), 실습 10-cnn Training 셀"
---

```formula
W* = W − η · ∂E/∂W :: 새 가중치 = 현재 가중치 − 학습률 × 기울기
E = ½ (prediction − actual)² :: ½은 미분할 때 상수를 정리하기 위함
∂E/∂W₆ = ∂E/∂pred · ∂pred/∂W₆ = (pred − actual) · H₂ :: 연쇄법칙, 오차 Δ × 은닉 출력
```

```flow
순전파 :: 입력 [2, 3] → 은닉 [0.85, 0.48] → 예측 0.191
손실 계산 :: E = ½(0.191 − 1.0)² = 0.327
역전파 :: 연쇄법칙으로 각 가중치의 기울기 계산
가중치 업데이트 :: Optimizer(SGD, Adam)가 η만큼 이동
반복 :: 배치마다 업데이트, 데이터 한 바퀴 = 1 Epoch
```

```python
for inputs, labels in train_loader:
    optimizer.zero_grad()              # 이전 스텝 기울기 초기화
    outputs = model(inputs)            # 순전파
    loss = criterion(outputs, labels)  # 손실 계산
    loss.backward()                    # 역전파: 기울기 계산
    optimizer.step()                   # 경사하강: 가중치 업데이트
```

> [!warn] 경사하강법의 한계
> 지역 정보(현재 경사)만 보고 내려가므로 Local Minimum에 빠질 수 있고, 경사가 완만하면 느리고, 출발 위치에 민감하다. Adam은 이전 방향(기울기 평균)과 변동 크기(기울기 제곱 평균)를 함께 기억해 더 빠르고 덜 흔들리게 수렴한다.
