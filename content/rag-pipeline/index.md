---
summary: "문서를 로드·분할·임베딩·저장하고 검색·생성하는 RAG 파이프라인을 단계별로 설계하고, 하이브리드 검색·리랭커·평가·Agentic RAG로 고도화"
keywords:
  - RAG
  - Document Loader
  - Chunking
  - Embedding
  - Vector Index
  - HNSW
  - Hybrid Search
  - BM25
  - RRF
  - MMR
  - Reranker
  - Hit Rate
  - MRR
  - RAGAS
  - Self-RAG
  - CRAG
  - Agentic RAG
  - LangGraph
materials:
  - file: slides-rag-pipeline.pdf
    title: "강의 슬라이드 — RAG Pipeline 설계 및 구축"
    type: slides
    date: 2026-09-18
  - file: slides-rag-pipeline-implementation.pdf
    title: "강의 자료 — RAG Pipeline 설계 및 구현"
    type: slides
    date: 2026-09-18
  - file: guide-macos-uv-python-setup.docx
    title: "실습환경 가이드 — macOS uv 파이썬 환경 구성"
    type: lab
    date: 2026-09-18
  - file: lab-langchain-v1.zip
    title: "실습 코드 — LangChain v1"
    type: lab
    date: 2026-09-18
  - file: lab-langgraph-v1.zip
    title: "실습 코드 — LangGraph v1"
    type: lab
    date: 2026-09-18
  - file: ref-spri-ai-brief-2026-08.pdf
    title: "참고 자료 — SPRi AI Brief 2026년 8월호"
    type: etc
    date: 2026-09-18
  - file: slides-rag-overview.pdf
    title: "강의 자료 — RAG, Retrieval Augmented Generation"
    type: slides
    date: 2026-09-21
  - file: lab-kv-cache-evaluation.pdf
    title: "실습 — KV cache 최적화 기술 평가 agent"
    type: lab
    date: 2026-09-22
  - file: submission-team-rag-design.pdf
    title: "과제 제출 — 팀 RAG 설계 산출물"
    type: etc
    date: 2026-09-22
  - file: submission-team-rag-output.pdf
    title: "과제 제출 — 팀 RAG 결과 산출물"
    type: etc
    date: 2026-09-22
  - file: submission-kv-cache-optimization.zip
    title: "과제 제출 — KV cache 최적화 평가 agent 코드"
    type: lab
    date: 2026-09-22
---

## 한눈에 보기

```flow
Load · Parse :: PDF 로더 선택, 헤더·푸터·표 처리, 메타데이터
Split :: chunk_size·overlap, Recursive·Semantic·Hierarchical
Embed · Store :: 임베딩 모델 선택, Vector DB + ANN 인덱스(HNSW 등)
Retrieve :: Similarity·MMR, Hybrid(BM25 + Dense, RRF), Reranker
Generate :: 근거만 쓰는 프롬프트, 출처 표기, 모르면 모른다
Evaluate · Extend :: Hit Rate·MRR·LLM-as-a-Judge, Advanced·Self·Corrective·Agentic RAG
```

- RAG는 "외워서 답하지 말고 문서를 펼쳐 보고 답하게" 하는 구조로, 사내 지식 연결·환각 감소·출처 제시를 재학습 없이 해낸다.
- 품질은 생성 모델보다 앞단(파싱·청킹·임베딩·검색)에서 갈리므로, 각 단계 선택지를 trade-off로 비교하고 Hit Rate·MRR로 검증하는 것이 수업의 축.
- 후반은 단순 선형 파이프라인(Naive) → 단계별 정교화(Advanced) → 스스로 판단·재시도(Self·CRAG) → 모듈·에이전트 기반(Modular·Agentic)으로의 진화와 LangGraph 구현.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 기준. 슬라이드 한 벌(164p)을 사흘에 걸쳐 진행했으며, 날짜별 구분은 자료 배포일 기준으로 정리.

### Day1 (9/18) — RAG 개요와 RAG A to Z

1. **RAG 개요** (p.3–24) — 용어(R·A·G), 비즈니스·기술 관점 필요성, RAG 기법 진화 맵(Retrieval·Query·Structure), Naive RAG 논문(2020), FT·PEFT·Prompt·RAG 비교, 엔터프라이즈 도전 과제, LLM Wiki와 "RAG is Dead" 논쟁
2. **RAG A to Z — Preprocessing** (p.25–64) — Document Loader, Text Splitter와 청킹 전략, 메타데이터 태깅, 전처리·표·법령 파싱 TIP, Embedding과 모델 선택(MTEB, 차원), Vector Database 구조, Vector Index(Flat·IVF·HNSW·PQ), Recall·Latency·Memory, Vector Store 비교
3. **RAG A to Z — Runtime** (p.65–84) — Retriever(Cosine, MMR), Hybrid Retriever(BM25, RRF, SPLADE), Reranker(Lost in the Middle, Cross-Encoder, MRR 벤치마크), Prompt, LLM, Chain
4. **RAG 평가 기초** (p.85–97) — Hit Rate@K·MRR, LLM-as-a-Judge, 평가 데이터셋 합성, 검색기 비교 결과, 요약 기반 검색·요약 방식
5. **구현 노트(Notion)·실습환경** — 단계별 LangChain 클래스·TO-DO 노트북, `uv sync --locked`로 실습 환경 재현

### Day2 (9/21) — RAG 확장 전략과 평가 심화

6. **RAG 확장 전략** (p.98–140) — Naive RAG 한계, Advanced RAG(Indexing·Pre·Retrieval·Post), Self-RAG(Reflection Token), Modular RAG(모듈·패턴), Agentic RAG(Reflection·Planning, Multi-Agent·Hierarchical·Corrective·Adaptive)
7. **RAG 논문 정리 노트** — Naive·Advanced·Self·Corrective·Adaptive·Graph·Modular·Agentic RAG의 핵심 기여와 연구적 의의
8. **LangGraph Quick Start** (p.141–147) — State(Overwrite vs Reducer), Node, Edge·Conditional Edge
9. **[부록] RAG 평가** (p.148–163) — ROUGE·BLEU·METEOR, SemScore, LLM-as-a-Judge(G-Eval), RAGAS, LangSmith

### Day3 (9/22) — 팀 과제: KV cache 최적화 기술 평가 Agentic RAG

10. LangGraph Multi-Agent + Agentic RAG로 SW(압축) vs HW(메모리 확장) 진영 기술을 TRL·시장·이해관계자·도메인 관점에서 중립 비교하는 평가 보고서 생성 → 설계 산출물(10시)·개발 산출물(16시) 제출, README로 발표

## 실습 정리

- **환경**: uv 프로젝트(`pyproject.toml` + `uv.lock`)를 `uv sync --locked`로 그대로 재현, `uv run` 또는 `.venv` 활성화
- **데이터**: SPRi AI Brief 2026년 8월호 PDF(29p) — 모든 RAG 노트북의 공통 문서
- **langchain-v1**: 10-DocumentLoader → 11-TextSplitter(Recursive, Semantic, pdfplumber·VLM 표 파서) → 12-Embedding(OpenAI, CacheBacked) → 13-VectorStore(FAISS, Chroma) → 14-Retriever(ParentDocument, MultiQuery, Ensemble, SPLADE, BGE-M3, Compression, LongContextReorder, SelfQuery, Kiwi BM25, 평가) → 15-RAG(Basic, Advanced, AgenticRAG, Summary)
- **langgraph-v1/20-RAG**: Naive RAG → Relevance Check → Web Search → Query Rewrite → Self-RAG → Corrective RAG → Adaptive RAG → Agentic RAG(다중 소스 라우팅 + Text-to-SQL + RAGAS 평가)

| 검색기 평가 (질문 20개, k=1·3·5) | Hit@1 | Hit@3 | MRR |
| --- | --- | --- | --- |
| Kiwi BM25 + FAISS 앙상블 | 0.95 | 1.00 | 0.975 |
| Kiwi BM25 | 0.90 | 1.00 | 0.950 |
| BM25 + FAISS 앙상블 | 0.85 | 0.95 | 0.900 |
| ParentDocument | 0.80 | 1.00 | 0.900 |
| FAISS Similarity | 0.70 | 1.00 | 0.833 |
| FAISS MMR | 0.70 | 0.75 | 0.739 |

```python
# 02-RAG-Advanced: 출처 + 가드레일 프롬프트, 하이브리드 검색, 검색 평가용 chunk_id
for i, d in enumerate(split_docs):
    d.metadata["chunk_id"] = i                           # 평가 시 정답 청크 식별
hybrid = EnsembleRetriever(retrievers=[bm25, dense], weights=[0.5, 0.5])
rag_chain = (
    {"context": hybrid | format_docs_with_source, "question": RunnablePassthrough()}
    | prompt          # "Context에 답이 없으면 '찾을 수 없습니다'라고만, 끝에 [p.N] 표기"
    | llm
    | StrOutputParser()
)
```

### 팀 과제 — KV cache 최적화 다관점 평가 (판교 9반 2조)

| 항목 | 설계·구현 |
| --- | --- |
| 비교 기술 | SW: DeepSeek-V2 MLA(KV를 저차원 잠재 벡터로, 93.3% 감소 보고) vs HW: ITME(CXL DRAM-NVMe 하이브리드 메모리 확장) |
| 도메인 | 데이터센터·클라우드 장문맥 LLM 서빙 (Llama-3.1-70B FP16 기준 토큰당 KV 320KiB) |
| RAG 문서 | 원문 논문 4편 96p (≤200p 예산), 베이스라인 InfiniGen·CXL-PNM으로 확증편향 완화 |
| 전처리 | pdfplumber 좌표 기반 2단 레이아웃 재정렬, 헤더·푸터·참고문헌 제외, 표 분리, 1,200자/200자 → 359청크 |
| 검색 | Qwen3-Embedding-0.6B + FAISS·BM25를 RRF(k=60) 융합, 기술별 문서 필터로 수치 혼입 방지 |
| Agentic RAG | 질의 계획(한→영 기술어) → 검색 → 관련성 판정 → 관련 청크 2개 미만이면 재작성 후 재검색(최대 2회) → 근거 없으면 "근거 부족" |
| 그래프 | Master Agent + 기술조사(RAG) → 시장·이해관계자(웹)·도메인(RAG) 병렬 fan-out → 종합 → 보고서, 관점별 결과는 분리된 State 키, evidence·logs는 reducer |
| 검색 평가 | 92케이스 Hit@1 0.84, Hit@3 0.99, MRR 0.92 |

```python
def rrf_fuse(dense_rank, lexical_rank, constant=60):
    scores = {}
    for ranking in (dense_rank, lexical_rank):
        for rank, chunk_id in enumerate(ranking, 1):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (constant + rank)
    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
```

> [!tip] 과제에서 배운 점
> 평가 보고서는 우열 판정이 아니라 "관점에 따라 같은 기술이 어떻게 다르게 평가되는가"를 보여주는 것. 그래서 종합 에이전트는 새 검색 없이 검증된 Evidence만 쓰고, 두 기술을 같은 형식(쟁점 / 관점 A / 관점 B / 엇갈리는 이유)으로 병기했으며, TRL은 공개 정보 기반 추정임을 명시함.
