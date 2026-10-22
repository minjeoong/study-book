---
summary: "트리·SVM·규제 같은 전통 ML에서 활성함수·경사하강·역전파로 신경망 학습 원리를 잡고, CNN → RNN → Transformer → MoE로 이어지는 아키텍처를 '왜 등장했나'의 문제 해결 연대기로 정리"
keywords: [지도학습, Decision Tree, Random Forest, XGBoost, SVM, L1/L2 규제, Overfitting, 활성함수, 경사하강법, 역전파, Adam, Dropout, BatchNorm, CNN, ResNet, RNN, LSTM, AutoEncoder, Transformer, BERT, MoE, Recall, Macro-F1]
materials:
  - file: guide-course-overview.pdf
    title: "과정 안내"
    type: etc
    date: 2026-09-01
  - file: slides-day1-ml.pdf
    title: "강의 교재 A — 머신러닝"
    type: slides
    date: 2026-09-01
  - file: slides-supplement.pdf
    title: "보조 교재"
    type: slides
    date: 2026-09-01
  - file: lab-deep-learning-notebooks.zip
    title: "실습 노트북 — CNN, CIFAR-10, LSTM, Autoencoder, BERT, Wafer"
    type: lab
    date: 2026-09-01
  - file: slides-day2-dl.pdf
    title: "강의 교재 B — 딥러닝"
    type: slides
    date: 2026-09-02
  - file: slides-day3-dl-architecture.pdf
    title: "강의 교재 C — 딥러닝 아키텍처"
    type: slides
    date: 2026-09-03
  - file: submission-dl-team.pdf
    title: "과제 제출 — 딥러닝 팀 과제 보고서"
    type: etc
    date: 2026-09-03
  - file: submission-dl-team-code.zip
    title: "과제 제출 — 딥러닝 팀 과제 코드"
    type: lab
    date: 2026-09-03
---

## 한눈에 보기

```flow
ML 기초 :: 통계 vs ML, 지도·비지도, 분류·회귀, Train-Valid-Test
ML 알고리즘 :: Decision Tree → Random Forest → Boosting, SVM, L1·L2 규제
신경망 학습 원리 :: 회귀 재해석, 활성함수·손실함수, 경사하강법, 역전파
학습 안정화 :: Batch·Epoch, Dropout, BatchNorm, Early Stopping
아키텍처 연대기 :: CNN → RNN·LSTM → AutoEncoder → ResNet → Transformer·BERT
규모와 비용 :: O(n²)·KV cache 한계, Linear RNN(DeltaNet), MoE, Kimi Linear
```

- Day1은 "데이터로 규칙을 배운다"는 ML의 기본 틀과 트리·SVM·규제 알고리즘을 상황별로 고르는 법을 다룸
- Day2는 선형 회귀 y = Wx + b를 딥러닝으로 다시 읽으며 손실 → 경사하강 → 역전파 → 업데이트의 학습 루프를 수치 예제로 풀어냄
- Day3은 아키텍처를 "데이터 구조를 코드에 새기는 귀납적 편향"과 "이전 구조의 한계를 푸는 연대기"로 설명 — CNN(공간), RNN(순서), Attention(병렬·장거리), Linear RNN·MoE(비용)
- 관통 메시지: 모델은 성능 점수가 아니라 현장 문제 해결책. 과적합은 늘 생기므로 Train·Valid·Test를 비교하고, 지표는 비용 구조로 먼저 정함

## 수업 흐름

**Day1 (9/1) Part A — Machine Learning**

- 과정 안내 — Python 3.11, torch 2.6.0, PEP 8 스타일 가이드(코드는 의사소통 수단), Day3 과제 필수 논문 Transformer·BERT
- Artificial Intelligence — AI 역사(Dartmouth 1956, AI Winter, Deep Blue, AlexNet 2012, ChatGPT 2022, Agent), ELIZA vs Deep Blue(규칙 기반, 학습·일반화 불가), ANI·Generative AI·AGI
- Statistics vs ML — 가설 확인 vs 가설 발견, 방법론·모델링 비교, 분류 vs 회귀, 모델 성능 영향 요인(모델링 전 단계 85%), 당부 말씀(Kaggle vs 비즈니스)
- Machine Learning — Samuel·Mitchell 정의(T·P·E), Single-Split Evaluation, 지도·준지도·비지도
- ML Algorithm — Decision Tree(Gini·Entropy·Feature Importance), Overfitting, Random Forest, Boosting(XGBoost·LightGBM·CatBoost), SVM(margin·kernel·C·gamma), Regularization(LASSO·Ridge), TODAY QUIZ 7문항(상황별 알고리즘 선택)

**Day2 (9/2) Part B — Deep Learning**

- 회귀분석 재해석 — Rule by Human → ML → DL(바나나 비유), 몸무게로 키 예측 y = Wx + b, 5단계(데이터 → 가설 → MSE → 오차 최소화 → 파라미터), Statistics vs DL, 활성함수(Sigmoid·Tanh·ReLU)
- 모델 최적화 — Gradient Descent, Learning Rate, Local Minimum, Forward·Backward Propagation 수치 예제(Chain Rule), Optimizer(Adam), Gradient Vanishing·Exploding·Clipping, Dropout
- 데이터 구조 — Deep Learning Goal, Batch·Epoch·Mini-batch(DataLoader 코드), Batch Normalization, Tensor(0D~6D), Tensor Shape 읽기, TODAY QUIZ(shape·reshape·transpose)

**Day3 (9/3) Part C — DL Architecture, 문제 해결의 연대기**

- 귀납적 편향의 설계 — MLP 한계 → CNN(Conv·Padding·Pooling·Flatten·Softmax, Locality·Weight Sharing·Invariance), RNN(Hidden State, 가중치 공유, BPTT, tanh 예제), LSTM(Cell State·Gate)
- 표현 학습이라는 다른 길 — 지도 학습의 한계, AutoEncoder(Latent, 한계, 확장), Seq2Seq
- CNN의 진화 — ImageNet, AlexNet, ResNet(degradation, residual, skip connection)
- Attention 등장 — Transformer(QKV, Scaled Dot-Product, Multi-Head, Encoder·Decoder, Positional Encoding), BERT(Masked LM·NSP, Fine-tuning, 전이학습 사례)
- 규모와 비용의 시대 — O(n²)·KV cache, Transformer vs RNN trade-off, SSM·RetNet·DeltaNet, MoE(Sparsely-Gated·Switch), Kimi Linear
- 과제 — 4조 WM-811K 웨이퍼 불량 분류 CNN 최적화 보고서 제출

## 실습 정리

**PyTorch 노트북 (04-DeepLearning) + 보조 교재 "CNN, Block by Block"**

| 노트북 | 데이터 | 한 일 | 결과 |
| --- | --- | --- | --- |
| 10-cnn | MNIST 54k / 6k / 10k | Conv 32-64 + FC, Adam lr 0.001, 10 epoch | Test Acc 0.9910, valid loss가 epoch 2~3 이후 정체 (과적합 초기 신호) |
| 11-cnn-dropout-earlystopping | MNIST | + Dropout(0.25 / 0.5) + Early Stopping(patience 3), 라벨별 정확도 | Test 0.9919 |
| 12-cnn-batchnorm | MNIST | + BatchNorm (Conv → BN → ReLU) | Test 0.9929, valid loss < train loss는 계산 방식 차이 |
| 13-cnn-refactoring | MNIST | 상수·함수 분리, logging, 라벨별 모니터링 | 스크립트 구조화 |
| 20·21-cifar10 | CIFAR-10 45k / 5k / 10k, RGB 32×32 | 같은 CNN(입력 3채널, 64×8×8) | Test 0.7142 |
| 30·31-lstm | UCI Air Quality CO(GT), 과거 24시간 → 다음 1시간 | LSTM(hidden 50, 2층), 31에서 누수 제거·시간 보간·Early Stopping | 원 스케일 RMSE 0.6189 → 0.5553 |
| 40·50-autoencoder | MNIST | 784 → 128 → 32 → 128 → 784, MSE | Test 복원 MSE 0.0101 |
| 60-bert | AG News 4클래스 (1/25로 축소, 3,840 / 960 / 304) | bert-base-uncased Fine-tuning 1 epoch | Val Acc 0.914, Test Acc 0.905, F1 0.905 |
| 90-wafer | WM-811K 811,457장 → 30,519장 (정상 5,000장 샘플링) | 64×64 nearest 리사이즈 + Baseline CNN | 과제 출발점 |

```python
# 학습 / 평가 블록 (실습 10~12 공통)
model.train()                          # Dropout on, BN은 배치 통계
for inputs, labels in train_loader:
    optimizer.zero_grad()
    loss = criterion(model(inputs), labels)
    loss.backward()
    optimizer.step()
    running_loss += loss.item()        # tensor에서 숫자만 꺼내 누적
train_losses.append(running_loss / len(train_loader))  # batch 평균 = epoch loss

model.eval()                           # Dropout off, BN은 누적 통계
with torch.no_grad():                  # 채점만, 기울기 추적 끔
    _, predicted = torch.max(model(inputs), 1)   # 가장 큰 logit의 위치 = 예측 라벨
```

**과제 — 4조 WM-811K 웨이퍼 불량 분류 CNN 최적화 (보고서 + 코드)**

- 문제 정의: 불량을 놓치는 FN이 오탐 FP보다 비쌈 → 주 지표 소수 3클래스(Near-full·Donut·Random) Recall, 게이트 Macro-F1(기준선 − 0.05), seed 3회 잡음 폭 0.0164 이내는 동등으로 보고 단순한 모델 선택. 선정 규칙을 코드 한 곳에 먼저 고정
- 진단: none 785,938장 중 81%는 실제로 라벨 없음, Edge-Ring 9,680 vs Near-full 149 (65배), 맵 Shape 346종 → 64×64, FC1에 파라미터 97.6% 집중, Train-Valid gap 7.99%p, Scratch Recall 0.17
- 8개 조합 × 3 seed (단일 변인 → 조합): BN·Dropout·Weight Decay는 gap만 조금 줄이고 소수 Recall 하락, Dropout + BN은 최하위(Near-full이 배치당 0.31장이라 BN 통계가 다수 클래스만 반영), Class Weight 적용 3개만 소수 Recall 0.93대
- 최종 #4 Baseline + Class Weight: Test 소수 Recall 0.7957 → 0.9011, Scratch 0.18 → 0.41, Macro-F1 유지, 정상 Recall 0.80 → 0.63(오탐 증가), Accuracy 82.6% → 77.8%
- 후속: Flatten → Global Average Pooling + 채널 확장, 128×128 입력, FN·FP 비용 기반 임계값, AdamW 재실험

```python
# 역빈도 클래스 가중치: w_c = N / (K · n_c), train 분포만 사용
counts = np.bincount(y_train, minlength=NUM_CLASSES).astype(np.float64)
weights = torch.tensor(len(y_train) / (NUM_CLASSES * np.clip(counts, 1, None)),
                       dtype=torch.float32)
criterion = nn.CrossEntropyLoss(weight=weights)  # 소수 클래스 오분류에 큰 벌점
```
