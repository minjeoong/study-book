---
title: CNN과 ResNet
en: Convolutional Neural Network, Residual Network
summary: "작은 필터를 이미지 전체에 공유해 지역 패턴을 뽑는 귀납적 편향으로 MLP의 한계를 넘고, Skip Connection으로 깊이의 한계를 넘은 비전 아키텍처"
importance: 3
order: 9
tags: [CNN, Convolution, Pooling, Padding, 귀납적 편향, AlexNet, ResNet, Skip Connection]
keypoints:
  - "MLP는 이미지를 1차원으로 펴서 공간 구조 소실·파라미터 폭발·위치 의존 문제"
  - "CNN 귀납적 편향 — Locality(작은 필터), Weight Sharing(필터 재사용), Pooling으로 위치 둔감"
  - "ResNet은 H(x) 대신 변화량 F(x) = H(x) − x만 학습, Skip Connection으로 152층까지"
qa:
  - q: "이미지에 MLP 대신 CNN을 쓰는 이유는?"
    a: "MLP는 28×28 이미지를 784차원 벡터로 펼치면서 어떤 픽셀이 이웃이었는지 공간 정보가 사라지고, 완전연결이라 은닉 1000개만 돼도 연결이 약 78만 개로 늘며, 입력 위치마다 다른 가중치를 배워 물체가 이동하면 다시 배워야 합니다. CNN은 작은 필터로 가까운 픽셀 관계만 보고(Locality), 같은 필터를 이미지 전체에 재사용하며(Weight Sharing), Pooling으로 위치 변화에 둔감해집니다. 이처럼 데이터에 대한 사전 가정을 구조에 새긴 것을 귀납적 편향이라고 합니다."
  - q: "Conv와 Pooling은 각각 무슨 역할이고 실습 CNN의 shape은 어떻게 변하나요?"
    a: "Conv는 필터로 특징(feature map)을 뽑아 채널을 늘리고, Pooling은 대표값만 남겨 공간 크기를 줄이며 학습 파라미터가 없습니다. 실습 MNIST 모델은 kernel 3, padding 1이라 Conv가 크기를 유지한 채 채널만 1 → 32 → 64로 늘리고, MaxPool(2, 2)가 28 → 14 → 7로 줄여 64 × 7 × 7 = 3136개 특징을 FC로 보냅니다. 위치 정보는 점점 덜 중요해지고 무엇인지가 중요해지므로 공간은 줄이고 채널은 늘립니다."
  - q: "ResNet의 Skip Connection은 왜 효과적인가요?"
    a: "층을 계속 쌓으면 기울기 소실이 아닌데도 학습 오차까지 커지는 degradation 문제가 생겼습니다. ResNet은 블록 입력 x를 출력에 그대로 더해, 각 블록이 전체 출력 H(x) 대신 필요한 변화량 F(x) = H(x) − x만 배우게 합니다. 바꿀 게 없으면 F(x)를 0으로 두면 되므로 최소한 성능이 나빠지지 않고 기울기도 지름길로 흘러, 152층의 깊은 망도 안정적으로 학습했습니다."
related: [activation-loss-functions, batch-dropout-batchnorm, rnn-lstm]
source: "Day3 슬라이드 p.7–28 (MLP 한계, Convolution, Kernel·Filter·Padding, Pooling, Flatten, Softmax, CNN 귀납적 편향), p.61–68 (ImageNet, AlexNet, ResNet, Residual Block), 보조 교재 1장, 실습 10–13 (MNIST)·20–21 (CIFAR-10)"
---

```formula
출력 크기 = (W − K + 2P) / S + 1 :: 입력 W, 커널 K, 패딩 P, 스트라이드 S. (28 − 3 + 2) / 1 + 1 = 28
H(x) = F(x) + x :: ResNet 블록 출력 = 학습한 변화량 + 입력 (Skip Connection)
```

```flow
입력 (N, 1, 28, 28) :: 흑백 MNIST, (배치, 채널, 높이, 너비)
Conv1 + ReLU → Pool :: 32채널, 28×28 → 14×14
Conv2 + ReLU → Pool :: 64채널, 14×14 → 7×7
Flatten :: 64 × 7 × 7 = 3136
FC1 + ReLU → FC2 :: 128 → 10개 점수(logit)
```

| 필요한 성질 | CNN이 하는 일 | 귀납적 편향 |
| --- | --- | --- |
| 격자 유지 (가까운 픽셀 관계) | 작은 필터, 국소 영역만 연결 | Locality — 패턴은 이웃에 있다 |
| 파라미터 절약 | 하나의 필터를 이미지 전체에 | Weight Sharing — 같은 가중치 반복 사용 |
| 위치 무관 재사용 | 등변성 + Pooling으로 둔감화 | Invariance — 어디 있든 같은 특징 |

> [!tip] CNN의 진화
> AlexNet(2012, 8층)은 ReLU·Dropout·GPU·Data Augmentation으로 ImageNet 첫 CNN 우승, VGG 19층, GoogLeNet 22층을 거쳐 ResNet(2015) 152층. 실습에서 같은 CNN이 MNIST는 Test 0.991, 컬러 CIFAR-10(3채널, 64×8×8)은 0.714에 그쳐 더 깊은 구조가 필요함을 확인.
