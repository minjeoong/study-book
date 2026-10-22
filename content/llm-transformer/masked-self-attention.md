---
title: "Decoder와 Masked Self-Attention"
en: "Masked Self-Attention, Next Token Prediction"
summary: "미래 토큰을 가려(Causal Mask) 앞 토큰만 보고 다음 토큰을 예측하게 만드는 GPT의 핵심 구조"
importance: 3
order: 10
tags:
  - Decoder
  - GPT
  - Next Token Prediction
  - Causal Mask
keypoints:
  - "생성 = 주어진 토큰들로 다음 토큰을 예측하는 것"
  - "하삼각 마스크로 미래 점수를 −∞ → Softmax 후 0"
  - "정답 Y는 한 칸 밀린 입력, Cross Entropy로 학습"
qa:
  - q: "Masked Self-Attention은 왜 필요한가?"
    a: "생성 모델은 다음 토큰을 예측해야 하는데, 학습 때 뒤에 올 정답 토큰을 볼 수 있으면 답을 베끼는 셈이 된다. 그래서 어텐션 점수 행렬의 미래 위치(대각선 위)를 −∞로 채워 Softmax 후 0이 되게 막는다. 각 위치는 자기와 이전 토큰만 참고해 다음 토큰을 예측하도록 학습된다."
  - q: "GPT는 어떻게 학습하고 텍스트를 생성하나?"
    a: "입력 시퀀스와 이를 한 칸 밀린 시퀀스를 정답으로 두고, 모든 위치에서 다음 토큰을 동시에 예측하도록 Cross Entropy Loss로 학습한다. 생성할 때는 마지막 위치의 출력 확률에서 토큰을 하나 골라 입력 뒤에 붙이고 이를 반복하는 자기회귀 방식이다. 가장 높은 확률만 고르면 greedy, temperature로 샘플링하면 더 다양한 문장이 나온다."
related:
  - self-attention
  - transformer-architecture
  - language-model-rnn
  - prompt-context/sampling-controls
  - prompt-context/token
source: "Day1 슬라이드 p.72–73, Day1 miniGPT Part 1–3, Day1 실습 3"
---

```flow
토큰화 :: 문자 단위 Tokenizer (stoi / itos)
x, y 구성 :: x = data[0:16], y = data[1:17] (한 칸 이동)
Embedding + Position :: 토큰 의미 + 위치
Masked Self-Attention :: 하삼각 마스크로 미래 차단
lm_head :: 어휘 크기만큼 다음 토큰 점수
생성 반복 :: argmax 토큰을 붙여 다시 입력
```

"I study AI hard" 의 Masked Attention Score (슬라이드 예시, × = 마스킹)

| Query \ Key | I | study | AI | hard |
|---|---|---|---|---|
| I | 1.0 | × | × | × |
| study | 0.3 | 0.7 | × | × |
| AI | 0.1 | 0.3 | 0.6 | × |
| hard | 0.3 | 0.2 | 0.1 | 0.4 |

> [!tip] 구현 세 줄
> `mask = torch.tril(torch.ones(T, T))` → `att.masked_fill(mask == 0, float("-inf"))` → `F.softmax(att, dim=-1)`. Day2 실습 모델은 이 마스크가 없어서 "실제 GPT와의 차이 1번"으로 Causal Mask가 꼽힘.
