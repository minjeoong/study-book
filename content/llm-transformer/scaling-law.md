---
title: "Scaling Law"
summary: "모델 크기·데이터 양·연산량을 늘리면 Loss가 거듭제곱 법칙으로 예측 가능하게 줄어든다는 경험 법칙"
importance: 3
order: 13
tags:
  - Scaling Law
  - Chinchilla
  - LLM
keypoints:
  - "성능은 Parameter·Data·Compute 세 요소의 균형으로 결정"
  - "규모를 키우면 Loss가 Power Law로 꾸준히 감소"
  - "Chinchilla — 큰 모델보다 '적정 크기 + 충분한 데이터'"
qa:
  - q: "Scaling Law란?"
    a: "OpenAI가 GPT-2, GPT-3를 개발하며 발견한 경험 법칙으로, 파라미터 수·학습 토큰 수·연산량을 늘리면 Loss가 거듭제곱(Power Law) 형태로 예측 가능하게 줄어든다는 것이다. 이 때문에 AI 개발 경쟁이 '더 좋은 구조'에서 '더 크게 학습'하는 인프라 경쟁으로 바뀌었다. 실제로 GPT가 발전하는 동안 Transformer 구조 자체는 크게 변하지 않았다."
  - q: "Chinchilla 연구가 준 시사점은?"
    a: "2022년 DeepMind는 70B 파라미터에 약 1.4T 토큰을 학습한 Chinchilla가 175B 파라미터, 약 300B 토큰의 GPT-3보다 성능이 좋음을 보였다. 모델만 키우고 데이터가 부족하면 비효율적이라는 뜻이다. 모델 크기·데이터·연산량을 균형 있게 늘리는 최적 비율이 있고, 같은 예산이면 더 작은 모델을 더 많은 데이터로 학습하는 편이 낫다."
related:
  - transfer-learning
  - distillation-moe
source: "Day2 슬라이드 p.52–56"
---

```formula
Loss ∝ N^(−α) :: 파라미터 수 N이 늘수록 감소 (Parameter Scaling)
Loss ∝ D^(−β) :: 학습 토큰 수 D가 늘수록 감소 (Data Scaling)
Loss ∝ C^(−γ) :: 연산량 C(FLOPs)가 늘수록 감소 (Compute Scaling)
```

```compare
GPT-3 | Chinchilla
파라미터 | 175B | 70B
학습 토큰 | 약 300B | 약 1.4T
특징 | 모델은 크지만 데이터 부족 | 모델은 작지만 데이터 충분
성능 | 상대적으로 열위 | 오히려 우수
```

> [!tip] Scaling Law가 바꾼 것
> 과거에는 더 좋은 모델 구조와 알고리즘 경쟁, 이후에는 "더 크게 학습시키자" — 더 큰 모델, 더 많은 데이터, 더 많은 GPU의 인프라 경쟁.
