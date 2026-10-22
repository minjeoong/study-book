---
title: "Positional Encoding"
summary: "순서 개념이 없는 Transformer에 토큰의 위치 정보를 더해 주는 벡터 (사인·코사인 고정형 또는 학습형)"
importance: 3
order: 9
tags:
  - Transformer
  - 위치 정보
keypoints:
  - "Attention은 순서를 모름 — '나는 밥을'과 '밥이 나를' 구분 불가"
  - "고정형 sin·cos 계산값 또는 학습형 Position Embedding"
  - "토큰 임베딩에 더해서(+) Transformer 입력으로 사용"
qa:
  - q: "Positional Encoding이 왜 필요한가?"
    a: "Self-Attention은 모든 토큰을 한꺼번에 보고 쌍마다 관계를 계산하므로 그 자체로는 토큰 순서를 알지 못한다. 그래서 '나는 밥을 먹었다'와 '밥이 나를 먹었다'를 구분하려면 위치 정보가 따로 필요하다. 위치마다 고유한 벡터를 만들어 토큰 임베딩에 더해 순서를 알려준다."
  - q: "사인·코사인 방식과 학습형 방식의 차이는?"
    a: "사인·코사인 방식은 학습 없이 정해진 공식으로 위치값을 계산하므로 파라미터가 없고, 코드에서는 register_buffer로 고정값으로 둔다. 학습형은 nn.Embedding(max_len, dim)으로 위치별 벡터를 학습하는 방식으로, Day1 miniGPT 실습이 이 방식이다. 둘 다 결과를 토큰 임베딩에 더한다는 점은 같다."
related:
  - transformer-architecture
  - self-attention
source: "Day1 슬라이드 p.71, Day1 실습 1 · miniGPT Part 2, Day2 실습 TO DO 2"
---

```formula
PE(pos, 2i) = sin( pos / 10000^(2i / d_model) ) :: 짝수 차원은 사인
PE(pos, 2i+1) = cos( pos / 10000^(2i / d_model) ) :: 홀수 차원은 코사인
입력 = Token Embedding + PE :: 의미 + 위치를 더해서 사용
```

```compare
사인·코사인 (고정형) | 학습형 Position Embedding
만드는 법 | 공식으로 계산, 학습 없음 | nn.Embedding(max_len, dim)을 학습
파라미터 | 없음 (register_buffer로 고정) | 위치 수 × 차원
실습 | Day1 실습 1, Day2 TO DO 2 | Day1 miniGPT
```

```python
position = torch.arange(0, max_len).unsqueeze(1)
div_term = torch.exp(torch.arange(0, d_model, 2) * (-math.log(10000.0) / d_model))
pe[:, 0::2] = torch.sin(position * div_term)   # 짝수 차원
pe[:, 1::2] = torch.cos(position * div_term)   # 홀수 차원
self.register_buffer('pe', pe.unsqueeze(0))    # 학습 때 업데이트되지 않음
```
