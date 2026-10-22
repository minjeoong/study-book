---
title: "언어 모델과 RNN·Seq2Seq"
en: "Language Model, RNN, Seq2Seq"
summary: "앞 단어들로 다음 단어 확률을 예측하는 언어 모델, 그리고 이를 순차 처리하던 RNN 계열의 한계"
importance: 3
order: 3
tags:
  - 언어모델
  - RNN
  - LSTM
  - Seq2Seq
  - Attention
keypoints:
  - "LM은 단어 시퀀스에 확률을 할당 = 다음 단어 예측"
  - "RNN은 기울기 소실로 장기 의존성 학습에 실패"
  - "Seq2Seq은 문장을 벡터 하나로 압축해 정보 손실"
qa:
  - q: "언어 모델(Language Model)이란?"
    a: "단어 시퀀스가 얼마나 자연스러운지 확률을 할당하는 모델이다. 앞에 나온 단어들이 주어졌을 때 다음에 올 후보 단어들의 등장 확률을 추정하고 가장 높은 단어를 고른다. GPT 같은 LLM도 이 다음 토큰 예측을 대규모 데이터로 학습한 것이다."
  - q: "RNN·Seq2Seq의 한계와 Attention이 이를 어떻게 해결했나?"
    a: "RNN은 단어를 순서대로 처리해 병렬화가 어렵고, 문장이 길어지면 기울기 소실로 앞쪽 정보가 전달되지 않는다. Seq2Seq은 입력 전체를 하나의 context vector로 압축하기 때문에 긴 문장에서 정보가 손실된다. Attention은 출력 시점마다 Encoder의 모든 hidden state를 다시 보고 관련도(Attention Score)만큼 가중합해 이 병목을 없앴다."
related:
  - word-embedding
  - transformer-architecture
  - masked-self-attention
source: "Day1 슬라이드 p.36–39"
---

```flow
RNN :: hidden state로 과거를 기억, 한 단어씩 순차 처리
LSTM · GRU :: gate로 정보 흐름 제어, 장기 의존성 완화 (연산 증가)
Seq2Seq :: Encoder가 문장을 context vector로 압축 → Decoder
Attention :: 매 출력 시점에 Encoder 전체를 다시 보고 가중합
Transformer :: RNN 없이 Attention만으로 병렬 처리
```

| 문제 | 원인 | 해결 |
|---|---|---|
| 장기 의존성 학습 실패 | 기울기 소실 (vanishing gradient) | LSTM·GRU의 gate |
| 긴 문장 정보 손실 | 고정 길이 context vector 하나로 압축 | Attention |
| 느린 학습, 뒤 단어 참조 불가 | 순차 처리 | Transformer (전체 동시 처리) |

> [!warn] 순차 모델이 못 하는 것
> "공항에 늦어서 그것을 (환불했다)" — '그것'이 티켓인지 알려면 뒤 단어까지 봐야 함. 앞에서부터 한 단어씩 읽는 RNN은 뒤 단어를 고려할 수 없음.
