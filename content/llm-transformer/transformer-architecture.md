---
title: "Transformer 구조 (Attention Is All You Need)"
en: "Transformer Architecture"
summary: "RNN·CNN 없이 Self-Attention만으로 시퀀스를 처리하는 인코더-디코더 구조 (2017, Google)"
importance: 3
order: 6
tags:
  - Transformer
  - Encoder
  - Decoder
  - LayerNorm
keypoints:
  - "RNN 없이 Self-Attention만으로 병렬 학습 + 장기 의존성 해결"
  - "Encoder는 입력 이해, Decoder는 Masked Attention으로 생성"
  - "블록 = Multi-Head Attention → Add & Norm → FFN → Add & Norm"
qa:
  - q: "Transformer가 RNN 기반 Seq2Seq보다 나은 점은?"
    a: "RNN은 단어를 하나씩 순서대로 처리해 병렬화가 어렵고 긴 문장에서 앞 정보를 잃는다. Transformer는 Self-Attention으로 모든 토큰 쌍의 관계를 한 번에 계산하므로 GPU 병렬 학습이 가능하고 멀리 떨어진 단어도 직접 연결된다. 실제로 WMT 2014 번역에서 훨씬 적은 학습 비용으로 당시 최고 BLEU(영-독 28.4, 영-불 41.8)를 기록했다."
  - q: "Residual Connection, LayerNorm, FFN은 각각 왜 넣나?"
    a: "Residual은 어텐션 결과만 쓰면 원래 입력 정보가 사라질 수 있어 입력을 그대로 더해 원 정보 위에 관계 정보를 보강하고 기울기 소실도 막는다. LayerNorm은 토큰마다 벡터 차원의 평균과 분산을 정규화해 층이 깊어져도 학습을 빠르고 안정적으로 만든다. FFN은 거의 선형 연산인 어텐션에 ReLU 비선형성을 더해 표현력을 높인다."
  - q: "Encoder-only(BERT)와 Decoder-only(GPT)의 차이는?"
    a: "BERT는 인코더만 사용해 문장 전체를 양방향으로 보며 문맥 표현을 학습하므로 분류·검색 같은 이해 작업에 강하다. GPT는 디코더만 사용해 앞 토큰만 보고 다음 토큰을 예측하는 자기회귀(autoregressive) 생성 모델이다. 둘 다 Transformer 블록을 쌓지만 마스크 유무와 학습 목표가 다르다."
related:
  - self-attention
  - multi-head-attention
  - positional-encoding
  - masked-self-attention
source: "Day1 슬라이드 p.57–61, p.69–70, Day2 실습 TO DO 5"
---

```layers
입력 :: Token Embedding + Positional Encoding
Multi-Head Attention :: 토큰 간 관계 계산 (Decoder는 Masked)
Add & Norm :: LayerNorm(x + MultiHeadAttention(x))
Feed Forward :: Linear → ReLU → Linear, 비선형 추가
Add & Norm :: LayerNorm(x + FFN(x)), 이 블록을 N번 반복
출력 :: Linear + Softmax → 다음 토큰 확률
```

```compare
Encoder | Decoder
역할 | 입력 문장을 여러 층의 Self-Attention + FFN으로 벡터화 | 인코딩 벡터와 자기 출력으로 목표 문장 생성
Attention | Self-Attention (모든 토큰 참조) | Masked Self-Attention + Encoder 출력 참조
대표 모델 | BERT (encoder-only, 양방향 표현) | GPT (decoder-only, 자기회귀 생성)
```

> [!warn] Add & Norm 위치는 구현마다 다름
> 원 논문과 Day2 실습은 Post-LN `x = norm(x + attn(x))`, Day1 miniGPT는 Pre-LN `x = x + attn(norm(x))`. 최근 GPT 계열은 학습 안정성 때문에 Pre-LN을 주로 씀.
