---
title: AutoEncoder와 Seq2Seq
en: Auto-Encoder, Representation Learning, Sequence-to-Sequence
summary: "정답 없이 입력 자신을 정답으로 삼아 압축(Encoder) → 복원(Decoder)하며 핵심 특징(latent)을 배우는 표현 학습, 이를 다른 시퀀스로의 변환으로 확장한 Seq2Seq"
importance: 2
order: 11
tags: [AutoEncoder, Latent Space, 표현 학습, Self-Supervised, 차원 축소, Seq2Seq]
keypoints:
  - "지도학습의 라벨 비용·모호함·정보 손실 → 입력 자신을 정답으로 (Self-Supervised)"
  - "Encoder 압축 → Latent(Bottleneck) → Decoder 복원, 입력 ≈ 출력이 되게 학습"
  - "Seq2Seq는 Encoder 마지막 hidden(Context Vector) 하나에 전체를 압축 → 고정 길이 병목"
qa:
  - q: "AutoEncoder는 무엇이고 PCA와 어떻게 다른가요?"
    a: "입력을 Encoder로 점점 압축해 가장 작은 차원의 Latent Space에 담았다가 Decoder로 다시 복원하고, 입력과 출력이 같아지도록 학습하는 신경망입니다. 이 과정에서 복원에 꼭 필요한 핵심 특징만 Latent에 남습니다. PCA는 분산이 가장 큰 방향으로 데이터를 선형 압축하지만, AutoEncoder는 비선형 활성함수 덕분에 비선형 데이터도 잘 압축할 수 있습니다."
  - q: "Vanilla AutoEncoder의 한계와 활용은?"
    a: "복원이 잘 된다고 그 표현이 분류나 검색에 유용하다는 보장이 없고, Latent 공간이 불규칙해 임의의 점에서 의미 있는 출력이 나오지 않아 생성 모델로 쓰기 어렵습니다. Latent 차원도 너무 크면 그냥 복사하고 너무 작으면 정보를 과하게 버려 튜닝이 까다롭습니다. 학습 분포 밖의 입력은 잘 복원하지 못하는데, 이를 거꾸로 이용해 복원 오차가 큰 샘플을 이상치로 보는 Anomaly Detection에 씁니다."
related: [rnn-lstm, transformer-bert, ml-overview-learning-types]
source: "Day3 슬라이드 p.48–60 (지도 학습의 한계, Auto-Encoder, AE 필요성·차원의 저주, AE Architecture, 분류 확장, Vanilla AE 한계점, AE 확장, Seq2Seq), 실습 40·50-autoencoder (MNIST)"
---

```flow
입력 (784) :: 28×28 MNIST를 1차원으로 펼침
Encoder :: 784 → 128 → 32, 중요한 특징만 남김
Latent (32) :: Bottleneck, 가장 압축된 표현
Decoder :: 32 → 128 → 784, Sigmoid로 픽셀을 [0, 1]로
손실 :: MSE(복원, 원본) — 라벨을 쓰지 않음
```

| AE 종류 | 특징 | 활용 |
| --- | --- | --- |
| Vanilla AE | 기본형, MLP로 구성 | 차원 축소, 특징 추출 |
| Denoising AE | 입력에 일부러 노이즈를 넣고 깨끗하게 복원 | 노이즈 제거, 강인한 특징 |
| Sparse AE | Latent 활성 뉴런 수 제한 (L1 등) | 중요 특징만 압축 |
| VAE | 작은 변화에 덜 민감한 Latent 제약 | 데이터 생성까지 가능 |
| Convolutional AE | CNN 기반, 공간 구조 반영 | 이미지 압축·노이즈 제거 |
| Seq2Seq | RNN·LSTM·GRU 기반 | 번역, 요약, 시계열 패턴 |

> [!tip] Seq2Seq → Attention
> AE가 입력을 그대로 복원한다면 Seq2Seq는 입력을 길이가 다른 시퀀스로 변환한다(I am a student → je suis étudiant). 입력 전체를 Context Vector 하나에 담는 병목이 정보 손실을 만들고, 이것이 Attention 등장 배경이다. 실습 50은 train/val 분할 + Early Stopping으로 Test 복원 MSE 0.0101.
