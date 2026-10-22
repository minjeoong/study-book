---
title: "Text Splitter와 청킹 전략"
en: "Chunking Strategies (Fixed, Recursive, Semantic, Hierarchical)"
summary: "긴 문서를 검색·임베딩에 알맞은 조각으로 나누는 단계 — 크기·겹침·분할 기준이 검색 품질을 좌우"
importance: 3
order: 4
tags:
  - RAG
  - Chunking
  - Text Splitter
keypoints:
  - "chunk_overlap은 보통 chunk_size의 10~20% — 문맥 보존 vs 저장량·중복 검색 trade-off"
  - "단순(Fixed·Recursive) vs 고급(Semantic·LLM·Late·Hierarchical) 전략"
  - "RecursiveCharacterTextSplitter: 문단 → 문장 → 단어 순으로 쪼개 의미 단위를 최대한 보존"
qa:
  - q: "chunk size와 overlap은 어떻게 정하나?"
    a: "청크가 너무 크면 한 벡터에 여러 주제가 섞여 검색이 흐려지고, 너무 작으면 답에 필요한 문맥이 잘린다. overlap은 경계에서 끊긴 문장을 다음 청크 앞에 겹쳐 문맥을 잇는 것으로 보통 청크 크기의 10~20%를 쓰지만 저장량과 중복 검색이 늘어난다. 페이지 단위 baseline으로 시작해 표·문단이 잘리는지 확인하고, Hit Rate·MRR 같은 검색 지표로 비교해 확정한다."
  - q: "Semantic Chunking과 Hierarchical Chunking은?"
    a: "Semantic Chunking은 길이 대신 문장 임베딩 유사도로 주제가 바뀌는 지점을 찾아 자르는 방식이라 정답이 한 청크에 깔끔하게 모이지만, 임베딩 비용이 들고 경계가 틀릴 수 있다. Hierarchical Chunking은 섹션 같은 상위 청크와 문단 같은 하위 청크를 함께 만들어, 작은 청크로 정밀하게 찾고 큰 청크로 문맥을 넘긴다. ParentDocumentRetriever가 대표 구현으로, 실습 평가에서 MRR 0.90을 기록했다."
related:
  - document-parsing
  - embedding-model-selection
  - retriever-mmr
  - prompt-context/token
source: "Day1(9/18) 슬라이드 p.32–39, p.105–106, 구현 노트 11-TextSplitter, 실습 11-TextSplitter/01·02, 14-Retriever/02"
---

| 전략 | 방식 | 장점 | 단점 |
| --- | --- | --- | --- |
| Fixed-size (Token) | 정해진 토큰·문자 수로 자름 + overlap | 구현 쉽고 빠름 | 문장·문단 경계 무시 |
| Recursive | 문단 → 문장 → 단어 순 구분자로 재귀 분할 | 구조를 어느 정도 보존 | 처리 시간·저장량 증가 |
| Document-based | 문서 전체가 한 청크 | 문맥 보존 (공지·FAQ) | 세부 구절 매칭 어려움 |
| Semantic | 임베딩 유사도로 주제 전환점에서 분할 | 문맥 보존, 검색 정확도↑ | 비용, 경계 불확실 |
| LLM-based (Agentic) | LLM이 의미 단위로 분할·전략 선택 | 가장 유연 | 비용, 느림, 일관성 한계 |
| Late | 원문 전체를 임베딩해 두고 질의 시점에 분할 | 문맥 손실 최소 | 실시간 비용, 구현 난이도 |
| Hierarchical | 상위(섹션)·하위(문단) 청크를 함께 생성 | 문맥 + 세밀 검색 | 저장·계산량, 분할 수준 튜닝 |

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)   # 기본값 구분자: \n\n, \n, ' ', ''
chunks = splitter.split_documents(docs)

semantic = SemanticChunker(OpenAIEmbeddings())    # chunk_size 없이 의미 유사도로 분할
texts = semantic.split_text(file)
```

> [!tip] Token과 Chunk, 무엇을 먼저?
> Token은 단어 조각(모델 입력 단위), Chunk는 토큰을 묶은 블록. 예: 1200토큰 기사 → 512 + 512 + 176. Tokenizer → Chunking은 모델 입력 한도 중심(GPT·BERT 처리), Chunking → Tokenizer는 문장·문단 의미 단위 중심(RAG·검색·요약)으로 목적에 따라 고름.
