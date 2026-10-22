---
summary: "단어를 벡터로 바꾸는 법에서 출발해 Self-Attention 기반 Transformer 구조와 RLHF·Scaling Law·MoE 같은 현대 LLM 기술까지"
keywords:
  - Transformer
  - Self-Attention
  - Multi-Head Attention
  - Positional Encoding
  - Word2Vec
  - GPT
  - RLHF
  - Scaling Law
  - Distillation
  - MoE
materials:
  - file: slides-day1-llm-transformer.pdf
    title: "강의 슬라이드 Day1 — Transformer (NLP 흐름, 수학 기초, Attention)"
    type: slides
    date: 2026-07-21
  - file: lab-day1-minigpt.ipynb
    title: "실습 Day1 — Transformer 개념 실습과 miniGPT (빈칸)"
    type: notebook
    date: 2026-07-21
  - file: lab-day1-minigpt-solution.ipynb
    title: "실습 Day1 — Transformer 개념 실습과 miniGPT (정답)"
    type: notebook
    date: 2026-07-21
  - file: slides-day2-modern-llm.pdf
    title: "강의 슬라이드 Day2 — Modern LLM (Landscape, RLHF, Scaling Law, MoE)"
    type: slides
    date: 2026-07-22
  - file: lab-day2-mini-llm-transformer.ipynb
    title: "실습 Day2 — Mini LLM Transformer Builder (TO DO)"
    type: notebook
    date: 2026-07-22
  - file: lab-day2-mini-llm-transformer-solution.ipynb
    title: "실습 Day2 — Mini LLM Transformer Builder (풀이)"
    type: notebook
    date: 2026-07-22
---

## 한눈에 보기

```flow
토큰화 :: 텍스트를 Token ID로
임베딩 + 위치 인코딩 :: 의미 벡터에 순서 정보를 더함
Multi-Head Self-Attention :: 토큰끼리 관련도만큼 정보를 섞음
Add & Norm + FFN :: 잔차·정규화·비선형, N개 블록 반복
Linear + Softmax :: 어휘 전체에 대한 다음 토큰 확률
```

- Day1은 "기계가 언어를 어떻게 숫자로 이해하나"에서 시작해 RNN의 한계, 수학 기초(내적·Softmax)를 거쳐 Transformer 블록을 하나씩 뜯어봄.
- Day2는 이 구조 위에서 LLM을 실제로 쓸 만하게 만든 기술(RLHF, Scaling Law, Distillation, MoE)과 시장 지형(리더보드, 주요 모델)을 다룸.
- 실습은 이틀 모두 PyTorch로 미니 Transformer(GPT)를 직접 구현해 "다음 토큰 예측"이 어떻게 계산되는지 확인함.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준 (슬라이드 우하단 번호 + 1).

### Day1 (7/21) — Transformer

1. **Intro: Software 3.0** — SW 1.0(규칙 코딩) → 2.0(데이터 학습) → 3.0(자연어 지시), LLM의 한계 4가지, 증강지능 (p.3–24)
2. **NLP Technical Summary** — One-hot·BoW·TF-IDF → 분포가설·Word2Vec → 언어 모델·RNN·Seq2Seq → Attention·문맥 임베딩 → 전이학습·GPT (p.25–43)
3. **Math Essentials** — 유클리드 거리, 코사인 유사도, 내적, 행렬곱, 선형변환, Softmax (p.44–56)
4. **Transformer** — 논문 배경 → Scaled Dot-Product Attention → Multi-Head → Add & Norm·FFN → Positional Encoding → Decoder의 Masked Self-Attention (p.57–73)
5. **실습** — 개념 / 실전 / 응용 / miniGPT 노트북

### Day2 (7/22) — Modern LLM

1. **LLMs at Work** — 생성형 AI의 생산성 효과(McKinsey, MS Work Trend), AlphaFold, Agent-first IDE, FDE(Forward Deployed Engineer)와 커리어 방향 (p.3–18)
2. **LLM Landscape** — 현대 LLM 특징, 모델 타임라인, 리더보드(HELM·Vellum·HF), GPT·Gemini·Claude·Grok·LLaMA (p.19–43)
3. **Modern LLM Technologies** — RLHF와 아첨 부작용 → Scaling Law·Chinchilla → DeepSeek·Distillation → MoE (p.44–64)
4. **실습** — Mini LLM Transformer Builder (TO DO 0–10)

## 실습 정리

### Day1 — Transformer 개념 실습 + miniGPT

- **구성**: 개념(비유 + 장난감 예제) → 실전 실습 1–4 → 응용 → 미니 GPT Part 1–3. 빈칸본(`lab-day1-minigpt`)과 정답본(`-solution`)
- **실습 1**: 사인·코사인 Positional Encoding 계산 후 히트맵 시각화
- **실습 2**: `scaled_dot_product_attention(Q, K, V, mask)` 직접 구현
- **실습 3**: Hugging Face `pipeline('text-generation', model='distilgpt2')`로 다음 토큰 생성 (temperature 0.7)
- **실습 4**: TF-IDF + 코사인 유사도로 문서 검색 — RAG의 검색 원리
- **응용**: 한국어 토큰 6개의 어텐션 히트맵, 프롬프트 이어쓰기
- **miniGPT**: `hello world / ai / transformer / gpt` 4줄을 문자 단위로 토큰화(어휘 18개) → 16글자 입력 x와 한 칸 밀린 정답 y → 학습형 위치 임베딩 + Causal Mask Self-Attention + FFN 블록 → Adam(lr 1e-3) 500 epoch, Loss 3.03에서 0.0002까지 감소 → greedy(argmax) 생성. 데이터가 작아 생성 결과는 사실상 암기 수준

```python
for epoch in range(500):
    logits = model(x.unsqueeze(0))                       # (1, T, vocab)
    loss = F.cross_entropy(logits.view(-1, vocab_size), y.view(-1))
    optimizer.zero_grad(); loss.backward(); optimizer.step()
```

### Day2 — Mini LLM Transformer Builder

- **시나리오**: AI Research Lab에서 Mini LLM을 만드는 AI 엔지니어 — Transformer Forward 동작을 TO DO 0–10으로 구현
- **구현**: 사인·코사인 PE → Scaled Dot-Product Attention → MultiHeadAttention(`view`·`transpose`로 head 분리) → TransformerBlock(잔차 + LayerNorm, FFN 4배 확장) → MiniLLM(Embedding + PE + 블록 3개 + lm_head)
- **검증**: vocab 50, 입력 `(1, 5)` → 출력 `(1, 5, 50)`, 마지막 위치 argmax로 0–49 사이 토큰이 나오면 성공
- **실제 GPT와의 차이**: Causal Mask, Tokenizer, Loss, Backpropagation, Training Loop가 추가로 필요. 이후 CoT·Self-Consistency·ReAct 같은 추론 기법으로 연결

```python
output = model(x)                          # (1, 5, 50)
next_token_logits = output[0, -1]          # 마지막 위치
prediction = torch.argmax(F.softmax(next_token_logits, dim=-1)).item()
```
