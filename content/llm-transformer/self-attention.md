---
title: "Self-Attention (Scaled Dot-Product)"
en: "Scaled Dot-Product Attention"
summary: "각 토큰이 Query로 다른 토큰의 Key와 유사도를 재고, 그 비율대로 Value를 섞어 문맥 벡터를 만드는 연산"
importance: 3
order: 7
tags:
  - Attention
  - QKV
  - Transformer
keypoints:
  - "Q는 어디에 집중할지, K는 참조될 정보, V는 실제 전달 정보"
  - "QKᵀ 점수 → √dₖ로 스케일 → Softmax → V 가중합"
  - "√dₖ로 나눠 Softmax 쏠림과 기울기 소실을 막음"
qa:
  - q: "Self-Attention의 계산 과정을 설명해 달라."
    a: "입력 벡터에 학습 가중치 W_Q, W_K, W_V를 곱해 Query, Key, Value를 만든다. Q와 Kᵀ를 행렬곱해 토큰 간 유사도 점수 행렬을 만들고 √dₖ로 나눈 뒤 Softmax로 확률화한다. 이 어텐션 가중치를 V에 곱하면 각 토큰이 다른 토큰들의 정보를 비율대로 섞은 새 문맥 표현이 나온다."
  - q: "왜 √dₖ로 나누나?"
    a: "Q·K 벡터 차원 dₖ가 커질수록 내적 값의 분산이 커져 Softmax 출력이 한 토큰에 쏠린다. 그러면 Softmax의 기울기가 매우 작아져 학습이 잘 되지 않는다. 차원의 제곱근으로 나눠 값의 범위를 안정화하면 Softmax가 적당한 기울기를 유지한다."
related:
  - vector-similarity
  - multi-head-attention
  - masked-self-attention
source: "Day1 슬라이드 p.62–66, Day1 실습 2 · 응용, Day2 실습 TO DO 3"
---

```formula
Q = X·W_Q,  K = X·W_K,  V = X·W_V :: 입력에 가중치 행렬을 곱해 세 역할 벡터 생성
Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V :: 유사도로 가중치를 만들고 Value를 가중합
```

```flow
선형변환 :: X × W_Q, W_K, W_V → Q, K, V
점수 행렬 :: QKᵀ의 (i, j) = i번째 토큰이 j번째를 얼마나 주목하나
스케일링 :: √dₖ로 나눔
Softmax :: 행마다 합이 1인 Attention Weight
가중합 :: Weight × V = 문맥이 반영된 새 벡터
```

```python
def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)    # (T, T) 점수 행렬
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)      # Decoder용 마스크
    weights = F.softmax(scores, dim=-1)
    return weights @ V, weights
```

> [!tip] 실습 노트북의 비유
> 은행 창구 검색 — Query는 내가 찾는 질문, Key는 각 단어의 명함, Value는 그 단어의 실제 내용. 질문과 명함을 대조해 관련 깊은 단어의 내용을 더 많이 가져옴.
