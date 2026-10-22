---
title: "MLM vs CLM"
en: "Masked Language Model vs Causal Language Model"
summary: "빈칸을 양방향 문맥으로 맞히는 MLM(BERT)과 다음 토큰을 순차 예측하는 CLM(GPT) — sLLM 파인튜닝은 CLM이 중심"
importance: 2
order: 2
tags: [MLM, CLM, BERT, Decoder-only]
keypoints:
  - "MLM = 양방향·Encoder·이해(분류, NER), CLM = 단방향·Decoder·생성"
  - "'프롬프트 → 응답' 학습이 CLM의 다음 토큰 예측과 그대로 맞물림"
  - "Llama·Qwen·Gemma·EXAONE 등 최근 sLLM 대부분이 Decoder-only"
qa:
  - q: "파인튜닝은 왜 MLM보다 CLM 모델을 주로 다루나?"
    a: "첫째, 요약·대화·코드 생성처럼 서로 다른 생성 태스크를 하나의 디코더 구조로 처리할 수 있다. 둘째, Instruction Tuning의 '프롬프트 → 응답' 형식이 CLM의 다음 토큰 예측 구조와 정확히 일치한다. 셋째, MLM의 양방향 마스킹은 자유 생성에 부적합해 분류·추출에 머문다. 그래서 산업 전반이 Decoder-only로 수렴했고, 최근 오픈 sLLM도 대부분 CLM이다."
  - q: "BERT와 GPT 계열은 어떻게 다른가?"
    a: "BERT는 Transformer의 인코더만 떼어 문장 앞뒤를 모두 보고 마스킹된 토큰을 맞히도록 학습해 문장 이해, 분류, 개체명 인식에 강하다. GPT·Qwen 같은 Decoder-only 모델은 이전 토큰만 보고 다음 토큰을 예측해 대화와 생성에 강하다. 가이드 비유로는 문장 전체를 듣고 정리하는 청취 담당과 한 단어씩 말하는 발화 담당이다."
related: [sllm-internal-pipeline, fine-tuning-objectives, llm-transformer/masked-self-attention, llm-transformer/transfer-learning]
source: "Day1(8/28) 슬라이드 p.10–14, 가이드1 1장"
---

```compare
MLM (Masked LM) | CLM (Causal LM)
학습 목표 | 문장 속 마스킹된 토큰 예측 | 다음 토큰을 순차 예측
문맥 방향 | 양방향 (앞뒤 모두) | 단방향 (이전 토큰만)
구조 | Encoder-only | Decoder-only
대표 모델 | BERT, RoBERTa | GPT, Llama, Mistral, Qwen
강점 | 문장 이해, 분류, 개체명 인식 | 자유 생성, 대화, 코드 생성
```

```flow
2018 BERT :: MLM 기반 문장 이해 태스크가 주류
2019–20 GPT-2·GPT-3 :: 대규모 CLM의 생성 능력 부각
2022 InstructGPT·ChatGPT :: Instruction Tuning·RLHF로 대화형 CLM 확산
2023~ 오픈소스 sLLM :: Llama·Qwen 등 경량 CLM이 사내 파이프라인 후보로
```

```python
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")
print(model.config.model_type)          # qwen2
print(model.config.is_encoder_decoder)  # False -> Decoder-only(CLM), 생성 전문
```
