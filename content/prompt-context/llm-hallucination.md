---
title: LLM 동작 원리와 Hallucination
en: Language Model, Hallucination
summary: "LLM은 앞 단어들로 다음 단어의 확률을 계산해 가장 그럴듯한 시퀀스를 만드는 모델 — 그래서 그럴듯한 거짓말도 한다"
importance: 3
order: 2
tags:
  - LLM
  - Hallucination
keypoints:
  - "LM = 앞 단어 시퀀스로 다음 단어의 확률을 예측하는 모델"
  - "GPT-2 1.5B → GPT-3 175B, 성능 차이의 핵심은 데이터·파라미터 규모"
  - "검증 안 된 웹 데이터 + 확률적 생성 → Hallucination에 구조적으로 노출"
qa:
  - q: "Language Model이란?"
    a: "주어진 단어 시퀀스 다음에 올 단어가 얼마나 그럴듯한지를 확률로 나타내는 모델이다. 예를 들어 '탑승시간에 늦어서 결국 비행기를 ( )'에서 '놓쳤다' 0.72, '탔다' 0.15처럼 후보마다 확률을 주고 높은 단어를 고른다. 이 확률은 대규모 텍스트에서 계산하며, 사람이 많이 읽고 들으며 언어를 배우는 것과 비슷하다."
  - q: "Hallucination은 왜 발생하나? 어떻게 줄이나?"
    a: "LLM은 사실을 조회하는 게 아니라 학습 데이터 기반으로 다음에 올 그럴듯한 토큰을 확률적으로 고르기 때문이다. 학습 데이터 대부분이 검증되지 않은 웹 수집 텍스트이고, 학습 이후 정보는 알지 못해 모르는 내용도 자연스러운 문장으로 만들어 낸다. 완화하려면 Context 제공(RAG), 낮은 Temperature, '확인되지 않은 내용은 추측하지 않는다' 같은 제약을 함께 쓴다."
related:
  - token
  - sampling-controls
  - context-engineering
  - genai-trend
  - llm-transformer/language-model-rnn
  - llm-transformer/transfer-learning
source: 슬라이드 p.21–28
---

```formula
P(놓쳤다 | 탑승시간에 늦어서 결국 비행기를) = 0.72 :: 앞 문맥이 주어졌을 때 다음 단어의 확률
y = 1.25 × x − 110 :: 키로 몸무게를 추론하는 단순 모델은 파라미터 2개, LLM은 수천억 개
```

| 모델 | 연도 | 논문 | 파라미터 |
| --- | --- | --- | --- |
| GPT-1 | 2018 | Improving Language Understanding with Unsupervised Learning | — |
| GPT-2 | 2019 | Language Models are Unsupervised Multitask Learners | 1.5B |
| GPT-3 | 2020 | Language Models are Few-shot Learners | 175B (GPT-2의 100배+) |
| GPT-5.x | — | 경쟁사에 구조·스케일을 노출하지 않으려 비공개 | ? |

- GPT-3 학습 데이터: 약 500B 토큰. Common Crawl 60%, WebText2 22%, Books 16%, Wikipedia 3% → 대부분 웹 수집
- Scale을 키운 동력: GPU 컴퓨팅 파워 + 병렬처리가 가능한 Transformer

> [!warn] LLM 동작 원리에서 나오는 한계
> 학습 텍스트가 모두 Fact인가(검증 불가) · 대규모 학습은 시간·비용이 큼 · 새 버전을 자주 못 내니 최신 정보 반영이 어려움 → RAG, Context Engineering의 출발점.
