---
title: "Dense Embedding과 임베딩 모델 생태계"
en: "Dense Embedding, OpenAI text-embedding-3, BGE-M3, E5"
summary: "텍스트를 수백~수천 개 실수로 꽉 찬 의미 좌표로 바꿔, 글자가 달라도 뜻이 같으면 가까이 모이게 하는 신경망 임베딩"
importance: 3
order: 2
tags:
  - Embedding
  - Dense Vector
  - BGE-M3
  - OpenAI
keypoints:
  - "Dense = 수만 칸의 0 대신 768·1536칸을 연속 실수로 채움, 어텐션으로 문장 문맥을 압축"
  - "모델 선택 3기준: 출력 차원, 최대 입력 길이, 클라우드 API vs 자체 구축(오픈소스)"
  - "API는 OpenAI 3-small·large, 폐쇄망은 BGE-M3·E5 (E5는 접두어 필수)"
qa:
  - q: "Sparse 표현과 Dense 임베딩의 차이는?"
    a: "Sparse는 어휘 사전 크기만큼의 차원에서 등장한 단어 칸만 값이 있고 나머지는 0인 벡터라, 글자가 같아야 비슷하게 나온다. Dense는 신경망이 문맥을 보고 768이나 1536처럼 작은 차원의 모든 칸을 실수로 채운 벡터라, '스마트폰 액정이 깨졌어요'와 '휴대폰 화면 파손 수리'처럼 겹치는 글자가 없어도 가까운 좌표에 놓인다. 대신 품번 같은 정확한 키워드 매칭은 Sparse가 강해서 둘을 섞는 하이브리드 검색을 쓴다."
  - q: "폐쇄망 환경에서는 어떤 임베딩 모델을 쓰나?"
    a: "외부 API로 텍스트를 보낼 수 없으면 BGE-M3나 Multilingual-E5 같은 오픈소스 모델을 사내 GPU 서버나 로컬 컨테이너에 올린다. BGE-M3는 100개 이상 언어와 최대 8192 토큰을 지원하고 한 번에 Dense와 Sparse 벡터를 함께 뽑아 키워드와 의미 검색을 같이 잡을 수 있다. E5를 쓸 때는 질문에 'query: ', 문서에 'passage: ' 접두어를 꼭 붙여야 검색 품질이 유지된다."
related:
  - text-vectorization
  - similarity-metrics
  - rag-pipeline/embedding-model-selection
  - rag-pipeline/hybrid-search
source: "10/8 슬라이드 p.39–56 (AI 기반 Dense Embedding, 최신 임베딩 모델 생태계)"
---

```flow
문장 입력 :: "스마트폰 액정이 깨졌어요"
인코더 (Transformer) :: 어텐션으로 단어 간 관계를 종합 분석
의미 좌표 :: [0.15, −0.82, 0.34, ...] 768~3072차원 Dense Vector
가까운 점 찾기 :: "휴대폰 화면 파손 수리"는 바로 옆, "파스타 먹었다"는 멀리
```

| 모델 | 차원 | 최대 입력 | 특징 |
| --- | --- | --- | --- |
| OpenAI text-embedding-3-small | 1536 | 약 8,000토큰 | 가성비, 일반 챗봇·사내 매뉴얼 검색 |
| OpenAI text-embedding-3-large | 3072 | 약 8,000토큰 | 정밀도, 법률·금융 등 뉘앙스 중요 |
| BGE v1.5 (small·base·large) | 384~1024 | 512 | 가벼운 오픈소스, 질문 앞 지시문(Instruction) 효과 |
| BGE-M3 | 1024 | 8192 | 100+ 언어, Dense + Sparse 동시 출력 |
| Multilingual-E5 | 384~1024 | 512 | 한국어 문맥 이해, 온프레미스 단골 |
| E5-Mistral-7b | 4096 | — | 7B LLM을 임베딩 전용으로, 최상위 성능·고성능 GPU 필요 |

```python
# MRL(마트료시카): 앞쪽 512개만 잘라 받아 메모리·검색 속도를 아끼고 정확도는 거의 유지
client.embeddings.create(model="text-embedding-3-small", input=texts, dimensions=512)
```

> [!tip] 실무 선택 한 줄 요약
> 빠르게 만들어야 하면 OpenAI 3-small, 텍스트를 밖으로 못 보내는 폐쇄망이면 BGE-M3·Multilingual-E5 자체 구축, 품번·고유명사 키워드와 의미 검색을 한 번에 잡으려면 BGE-M3.

> [!warn] E5 접두어를 빼먹지 말 것
> 질문은 `query: 스마트폰 액정이 깨졌을 때 수리 방법`, 저장 문서는 `passage: ...` 형식으로 학습된 모델이라 접두어가 없으면 맥락을 엉뚱하게 파악해 검색 품질이 뚝 떨어짐.
