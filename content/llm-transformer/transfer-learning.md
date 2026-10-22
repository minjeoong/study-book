---
title: "사전학습과 전이학습 (GPT의 등장)"
en: "Pre-training, Transfer Learning"
summary: "대규모 데이터로 미리 학습한 모델을 가져와 내 문제에 맞게 재사용하는 방식 — GPT의 출발점"
importance: 3
order: 4
tags:
  - Pre-training
  - Fine-tuning
  - GPT
keypoints:
  - "미리 학습한 중간 표현을 재사용 = Representation Learning"
  - "GPT 성능의 핵심 = 병렬 학습 가능한 구조 + 데이터 양"
  - "GPT-1→2→3의 가장 큰 차이는 크기 (GPT-3는 100배+)"
qa:
  - q: "사전학습(Pre-training)과 파인튜닝(Fine-tuning)의 차이는?"
    a: "사전학습은 대량의 텍스트로 다음 토큰 예측을 학습하며 문법·의미·문맥 같은 일반 언어 능력을 익히는 단계다. 파인튜닝은 그 모델을 특정 작업 데이터로 추가 학습해 원하는 업무에 맞게 성능을 최적화하는 단계다. 처음부터 학습하는 것보다 적은 데이터와 비용으로 높은 성능을 얻는 것이 전이학습의 장점이다."
  - q: "GPT가 이전 모델보다 압도적으로 좋아진 이유는?"
    a: "Transformer는 RNN과 달리 분산·병렬 학습이 가능해 모델을 매우 크게 키울 수 있었다. 여기에 Common Crawl, WebText2, Books, Wikipedia 등 약 5,000억 토큰 규모의 데이터를 학습시켰다. 구조 자체보다 모델과 데이터의 규모를 키운 것이 핵심이고, 이것이 Scaling Law로 이어진다."
related:
  - language-model-rnn
  - scaling-law
  - rlhf
source: "Day1 슬라이드 p.41–43, Day2 슬라이드 p.20, p.34"
---

```flow
대규모 코퍼스 :: 웹·책·위키 약 5,000억 토큰 (GPT-3)
사전학습 :: 다음 토큰 예측으로 일반 언어 능력 습득
Pretrained Model :: 문법·의미·문맥 표현을 가진 범용 모델
적용 :: Fine-tuning 또는 Prompting으로 새 Task에 빠르게
```

| 모델 | 연도 | 논문 | 핵심 |
|---|---|---|---|
| GPT-1 | 2018 | Improving Language Understanding with Unsupervised Learning | decoder-only 구조, 생성형 사전학습 |
| GPT-2 | 2019 | Language Models are Unsupervised Multitask Learners | 1.5B, 모델 크기 확장 |
| GPT-3 | 2020 | Language Models are Few-shot Learners | 175B, in-context learning |

> [!tip] 현대 LLM의 4가지 특징 (Day2)
> 거대한 매개변수 규모, 대량 텍스트 사전학습 + 파인튜닝, 생성·번역·요약·QA 등 범용 NLP 작업, 병렬 처리 가능한 Transformer 구조.
