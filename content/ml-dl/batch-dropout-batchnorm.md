---
title: 학습 안정화 — Batch·Epoch, Dropout, BatchNorm, Early Stopping
en: Mini-batch, Epoch, Dropout, Batch Normalization, Early Stopping, Tensor Shape
summary: "데이터를 미니배치로 나눠 Epoch 단위로 반복 학습하고, Dropout·BatchNorm·Early Stopping으로 과적합 직전에서 안정적으로 멈추게 하는 장치들"
importance: 3
order: 8
tags: [Mini-batch, Epoch, Dropout, Batch Normalization, Early Stopping, Tensor Shape]
keypoints:
  - "20개 데이터, batch_size 5 → 1 Epoch에 미니배치 4개 = 가중치 4번 업데이트"
  - "Dropout은 학습 때만 뉴런을 무작위로 끄고(conv 0.25, fc 0.5) 평가 때는 모두 켬"
  - "BatchNorm은 층 입력을 배치 통계로 정규화해 손실 지형을 매끄럽게, train·eval 동작이 다름"
qa:
  - q: "Epoch, Batch, Mini-batch의 관계는?"
    a: "Epoch은 전체 학습 데이터를 한 바퀴 도는 단위이고, Batch는 한 번에 처리해 가중치를 한 번 업데이트하는 데이터 묶음입니다. 배치 크기가 전체보다 작으면 미니배치라 하고, 20개 데이터에 batch_size 5면 1 Epoch에 4번 업데이트합니다. 미니배치는 메모리를 아끼고 업데이트를 자주 해 학습을 빠르고 안정적으로 만들지만, Epoch을 과도하게 반복하면 과적합됩니다."
  - q: "Dropout은 왜 효과가 있고 평가할 때는 어떻게 하나요?"
    a: "학습 중 매 스텝 무작위로 일부 뉴런을 꺼서 모델이 특정 뉴런에 의존하지 못하고 여러 뉴런이 골고루 특징을 배우게 해 과적합을 줄입니다. 평가 때는 model.eval()로 모든 뉴런을 켜서 온전한 실력으로 예측합니다. 비율이 너무 높으면 배울 뉴런이 부족해 과소적합되므로 보통 0.2~0.5에서 조절하고, 연결이 많은 FC층에 더 큰 값을 줍니다."
  - q: "Batch Normalization의 효과와 주의점은?"
    a: "각 층의 입력을 배치 평균·분산으로 정규화해 손실 지형을 매끄럽게 만들고, 그 결과 기울기 소실이 완화되고 더 큰 학습률로 빠르고 안정적으로 수렴하며 약한 규제 효과도 있습니다. 학습 때는 현재 배치 통계를, 평가 때는 누적 이동평균을 쓰기 때문에 valid loss가 train loss보다 낮게 나와도 일반화가 좋아졌다고 단정하면 안 됩니다. 배치가 아주 작거나 소수 클래스가 배치에 거의 안 들어오면 통계가 불안정해집니다."
related: [overfitting-regularization, gradient-descent-backprop, cnn-resnet]
source: "Day2 슬라이드 p.43 (Dropout), p.46–52 (Deep Learning Goal, Batch & Epoch, Mini Batch, Batch Normalization), p.53–67 (Data Structure, Tensor, Tensor Shape, TODAY QUIZ), 보조 교재 2–3장·Code Review, 실습 11·12"
---

```compare
model.train() | model.eval()
Dropout | 뉴런을 무작위로 끔 | 모든 뉴런 사용
BatchNorm | 현재 배치 평균·분산 사용, 이동평균 누적 | 누적된 고정 통계 사용
기울기 | 계산하고 가중치 업데이트 | torch.no_grad()로 추적 끔
```

```python
# Early Stopping (실습 11, patience = 3)
if valid_losses[-1] < best_valid_loss:
    best_valid_loss = valid_losses[-1]
    best_model_state = copy.deepcopy(model.state_dict())  # 스냅샷을 독립 복사해 얼려 둠
    patience_counter = 0
else:
    patience_counter += 1
    if patience_counter >= patience:
        break
model.load_state_dict(best_model_state)  # valid loss가 가장 낮던 시점으로 복원
```

- 순서: Conv → BatchNorm → ReLU → Pool (ReLU가 음수를 자르기 전에 분포를 다듬음)
- BatchNorm2d는 채널마다(32채널 → 규격 32개), BatchNorm1d는 뉴런마다(128개) 정규화
- 입력 정규화(Normalize((0.5,), (0.5,)))는 첫 층 입력만, BatchNorm은 층마다 계속 이동하는 분포를 다시 맞춤
- MNIST 실습 Test Acc: 기본 0.9910 → +Dropout·Early Stopping 0.9919 → +BatchNorm 0.9929 (단일 실행이라 반복 확인 필요)

> [!tip] Tensor Shape 읽기
> 가장 바깥 대괄호부터 차원 크기를 센다. 흑백 128×128 = (128, 128), 컬러 256×256 = (256, 256, 3). PyTorch 이미지 배치는 (N, C, H, W) = (32, 1, 28, 28).
