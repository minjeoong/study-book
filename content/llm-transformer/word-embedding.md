---
title: "텍스트 표현과 워드 임베딩"
en: "Text Representation, Word Embedding"
summary: "단어를 숫자 벡터로 바꾸는 방법 — 빈도 기반(BoW·TF-IDF)에서 의미 기반 임베딩(Word2Vec)으로 진화"
importance: 3
order: 2
tags:
  - NLP
  - TF-IDF
  - Word2Vec
  - 임베딩
keypoints:
  - "빈도 기반 표현은 순서·의미를 못 담고 차원이 폭증"
  - "분포가설 — 비슷한 문맥에 나오는 단어는 의미도 비슷"
  - "Word2Vec은 고정 벡터, Transformer는 문맥마다 다른 벡터"
qa:
  - q: "TF-IDF는 무엇이고 한계는?"
    a: "한 문서 안에서 자주 나오면서(TF) 다른 문서에는 드물게 나오는(IDF) 단어에 높은 가중치를 주는 표현이다. 검색·토픽 분류처럼 순서가 덜 중요한 작업에는 강하지만 단어 순서와 의미 관계를 담지 못하고, 어휘가 커질수록 벡터가 거대하고 희소해진다. '동생'과 '아우'처럼 뜻이 같은 단어도 완전히 다른 차원으로 취급한다."
  - q: "Word2Vec 같은 정적 임베딩과 BERT·GPT의 문맥 임베딩 차이는?"
    a: "Word2Vec은 주변 단어를 맞히는 학습으로 단어마다 하나의 고정 벡터를 만든다. 그래서 'bank'가 강둑인지 은행인지 구분하지 못한다. Transformer 기반 모델은 어텐션으로 주변 단어를 함께 보고 같은 단어라도 문장마다 다른 벡터를 만들어 동음이의어와 다의어를 문맥에 맞게 표현한다."
related:
  - vector-similarity
  - language-model-rnn
  - self-attention
  - prompt-context/token
source: "Day1 슬라이드 p.25–35, p.40, Day1 실습 4"
---

```flow
One-hot :: 단어마다 0/1 인덱스, 의미 관계 없음
BoW · N-gram :: 빈도로 문장 표현, 순서는 n개 묶음만큼만
TF-IDF :: 이 문서에서만 중요한 단어에 가중치
Thesaurus (WordNet) :: 사람이 관계를 정의, 신조어·비용 문제
Word2Vec :: 주변 단어로 학습한 밀집 벡터 (분포가설)
Contextual Embedding :: 문맥마다 다른 벡터 (BERT, GPT)
```

```formula
TF(t, d) = (d에서 t의 등장 수) ÷ (d의 전체 단어 수) :: 이 문서에서 얼마나 자주 나오나
IDF(t, D) = logₑ(전체 문서 수 ÷ t가 등장한 문서 수) :: 여러 문서에 흔할수록 작아짐
TF-IDF = TF × IDF :: 이 문서만의 특징 단어일수록 큼
```

> [!tip] 임베딩 공간에서는 연산이 된다
> 수많은 문장을 읽으며 단어 관계가 벡터 공간에 투영됨. King − Man + Woman ≈ Queen, 국가-수도 관계가 평행한 방향으로 나타남. Word2Vec 학습은 "주변 단어 → 타겟 단어" 분류 문제.
