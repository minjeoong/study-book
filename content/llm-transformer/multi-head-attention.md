---
title: "Multi-Head Attention"
summary: "어텐션을 여러 head로 나눠 서로 다른 관점에서 병렬 수행한 뒤, 이어 붙이고 선형변환으로 통합하는 구조"
importance: 3
order: 8
tags:
  - Attention
  - Transformer
keypoints:
  - "d_model을 head 수로 나눠 head마다 독립적으로 어텐션"
  - "문법 관계, 의미 유사성 등 여러 관점을 동시에 포착"
  - "Concat 후 Linear(W_O)로 섞어 다음 층이 쓸 공간에 투영"
qa:
  - q: "Multi-Head Attention을 쓰는 이유는?"
    a: "어텐션 하나는 한 가지 관점의 관계를 평균적으로 잡기 쉽다. 여러 head로 나누면 어떤 head는 문법 관계, 어떤 head는 의미 유사성처럼 서로 다른 관점에서 동시에 주목할 수 있다. 각 head의 결과를 이어 붙이고 선형층으로 융합해 더 풍부한 표현을 만든다."
  - q: "Concat 뒤에 Linear Layer가 필요한 이유는?"
    a: "단순히 이어 붙인 벡터는 head별 특징이 따로 흩어져 있다. 선형변환으로 이를 재조합해 정보를 통합하고 차원을 d_model로 맞춘다. 결과적으로 다음 레이어가 바로 쓸 수 있는 표현 공간으로 재배치하는 역할이다."
related:
  - self-attention
  - transformer-architecture
source: "Day1 슬라이드 p.67–68, Day2 실습 TO DO 4"
---

```formula
headᵢ = Attention(Q·W_Qᵢ, K·W_Kᵢ, V·W_Vᵢ) :: head마다 다른 가중치로 어텐션
MultiHead(Q, K, V) = Concat(head₁, …, head_h) · W_O :: 이어 붙인 뒤 선형변환
```

```flow
Linear :: Q, K, V 각각 선형변환
Head 분리 :: d_model → num_heads × head_dim
Scaled Dot-Product Attention :: head마다 병렬로 h번
Concat :: head 출력을 이어 붙임
Linear (W_O) :: 통합 + 차원 맞춤
```

```python
# Day2 실습 — (B, T, d_model) → (B, heads, T, head_dim)
Q = self.query_linear(Q).view(B, -1, self.num_heads, self.head_dim).transpose(1, 2)
out, w = scaled_dot_product_attention(Q, K, V)          # K, V도 동일하게 분리
out = out.transpose(1, 2).contiguous().view(B, -1, self.d_model)   # head 결합
return self.w_o(out)
```

> [!warn] contiguous()
> transpose 후에는 메모리가 연속이 아니라서 바로 view 할 수 없음. head를 다시 합칠 때 contiguous()가 필요함.
