---
title: Transformer와 BERT
en: Transformer, Self-Attention, BERT
summary: "모든 단어가 서로를 동시에 참조(Self-Attention)해 순차 처리 병목을 없앤 Transformer, 그 Encoder로 양방향 문맥을 사전학습한 BERT"
importance: 3
order: 12
tags: [Transformer, Attention, QKV, Multi-Head, Positional Encoding, BERT, Masked LM, Fine-tuning]
keypoints:
  - "Attention = Query·Key 유사도 → Softmax 가중치 → Value 가중합, √dₖ로 스케일"
  - "Encoder(이해) + Decoder(생성), 순서 정보는 Positional Encoding으로 보충"
  - "BERT = Encoder 기반 양방향 사전학습 (Masked LM 15% + NSP) → Fine-tuning"
qa:
  - q: "Transformer가 RNN, LSTM을 대체한 이유는?"
    a: "RNN 계열은 단어를 하나씩 순서대로 처리해 병렬화가 어렵고, 문장이 길면 앞 내용이 잘 전달되지 않는 장기 의존성 문제가 남았습니다. Transformer는 Self-Attention으로 문장 안의 모든 단어가 다른 모든 단어와의 관련도를 한 번에 계산하므로 병렬 처리가 되고, 거리와 상관없이 직접 참조합니다. 대신 순서를 알 수 없어서 각 단어 임베딩에 위치 벡터를 더하는 Positional Encoding으로 순서를 보충합니다."
  - q: "BERT는 어떻게 학습하고 왜 Encoder만 쓰나요?"
    a: "BERT는 생성이 아니라 문장 이해가 목적이라 생성용 Decoder 없이 Transformer Encoder만 쌓았습니다. 사전학습은 입력 토큰의 약 15%를 [MASK]로 가리고 앞뒤 문맥으로 원래 단어를 맞히는 Masked LM과, 두 문장이 실제로 이어지는지 맞히는 NSP로 합니다. 정답 단어를 입력에서 지워야 양방향 문맥을 쓰면서도 답을 컨닝하지 않을 수 있고, 이렇게 만든 모델을 분류 같은 특정 작업에 Fine-tuning합니다."
  - q: "Self-Attention의 비용 문제는 무엇인가요?"
    a: "토큰이 n개면 모든 쌍을 비교해야 해서 계산량이 O(n²)로 늘고, 생성할 때는 지난 토큰의 Key·Value를 KV cache에 계속 쌓아 메모리가 길이에 비례해 커집니다. 긴 문맥이나 수십만 토큰을 다루는 Agent에서는 이것이 추론 병목이 됩니다. 이를 줄이려는 Linear Recurrent 계열과 MoE 같은 시도가 이어지고 있습니다."
related: [beyond-transformer-moe, rnn-lstm, llm-transformer/self-attention, llm-transformer/transformer-architecture, llm-transformer/transfer-learning]
source: "Day3 슬라이드 p.69–83 (Transformer, Attention 쉽게 이해하기, QKV, Scaled Dot-Product, Multi-Head, Transformer Architecture, Positional Encoding, BERT, BERT Architecture, Masked LM, BERT 주요 특징, 전이학습 사례), 실습 60-bert (AG News), 과정 안내 Assignment 필수 논문"
---

```formula
Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V :: 유사도 점수 → 가중치 → Value 가중합
MultiHead(Q, K, V) = Concat(head₁, …, headₕ) · Wᴼ :: 여러 시선(Head)의 관계를 합침
```

```flow
Query vs Key :: '잔다'와 각 단어의 유사도 (고양이가 90, 햇살을 15, 창문에서 10)
Softmax :: 가중치로 변환 (고양이가 0.55, 잔다 0.25, 받으며 0.10 …)
Value 가중합 :: 0.55 × 고양이가 + … → '고양이가 잔다' 문맥을 품은 '잔다'
```

```python
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=4)          # 분류 헤드만 새로 초기화
trainer = Trainer(model=model, args=training_args,
                  train_dataset=train_dataset, eval_dataset=val_dataset,
                  compute_metrics=compute_metrics, data_collator=data_collator)
trainer.train()   # AG News 3,840건 1 epoch → Test Acc 0.905, F1 0.905
```

> [!tip] Encoder vs Decoder
> BERT = Encoder(텍스트 이해, 양방향), GPT = Decoder(텍스트 생성, Masked Self-Attention으로 미래 단어 가림). BERT-base는 12 Layer, 768 Hidden, 12 Head. 한국어는 서술어가 뒤에 있어 오른쪽 문맥 의존도가 더 크다.
