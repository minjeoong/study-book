---
title: "RAG 개요와 필요성"
en: "Retrieval-Augmented Generation"
summary: "질문과 관련된 외부 문서를 검색해 프롬프트에 덧붙이고, 그 근거로 LLM이 답을 생성하게 하는 방식"
importance: 3
order: 1
tags:
  - RAG
  - Hallucination
  - Fine-tuning
keypoints:
  - "Retrieval 관련 문서 검색 → Augmented 프롬프트 보강 → Generation 근거 기반 생성"
  - "파라미터 기억(LLM) + 비파라미터 기억(검색 인덱스) — 재학습 없이 지식 갱신, 출처 제시"
  - "Long Context 시대에도 비용·지연·사내 데이터 때문에 검색은 유효, 진화 대상은 1세대 Naive RAG"
qa:
  - q: "RAG가 필요한 이유는?"
    a: "비즈니스 관점에서 기업 내부 문서는 어떤 LLM에도 학습되지 않았기 때문에, 사내 지식에 근거한 정확한 답을 내려면 문서를 연결해야 한다. 기술 관점에서 지식을 파라미터에 저장하는 LLM은 지식을 고치려면 재학습해야 하고, 출처를 댈 수 없으며, 환각을 만든다. RAG는 검색기와 생성기를 분리해 문서 인덱스만 교체하면 지식이 갱신되고, 검색 문서를 근거로 제시할 수 있다."
  - q: "RAG와 Fine-tuning 중 무엇을 고르나?"
    a: "Fine-tuning은 가중치를 바꿔 말투, 출력 형식, 도메인 전문성을 고정하는 데 강하지만 구현·유지 비용이 크고 새 지식을 넣으려면 다시 학습해야 한다. RAG는 비교적 저렴하게 최신·사내 지식을 반영하고 출처를 보여줘 투명성과 환각 회피에 유리하다. 지식이 자주 바뀌고 근거가 중요하면 RAG, 행동과 형식을 바꾸려면 Fine-tuning이 맞고, 둘을 함께 쓰기도 한다."
  - q: "100만 토큰 컨텍스트가 나왔는데 RAG는 죽었나?"
    a: "'RAG is Dead' 주장은 질문마다 0부터 검색하는 1세대 Naive RAG를 겨냥한 것이다. 하지만 기업 데이터 대부분은 어떤 모델에도 학습되지 않았고, 매번 전체 문서를 컨텍스트에 넣는 것은 비용과 지연 면에서 비현실적이다. Long Context는 검색의 필요성을 없애기보다 비용 구조를 바꿀 뿐이고, 실무는 Dense, Sparse, Reranking을 섞은 하이브리드로 진화하는 중이다."
related:
  - rag-pipeline-process
  - advanced-rag
  - agentic-rag
  - langchain/ai-application-evolution
  - prompt-context/llm-hallucination
source: "Day1(9/18) 슬라이드 p.4–24, RAG 논문 정리 노트(9/21) Naive RAG"
---

```flow
Retrieval :: 질문을 벡터로 바꿔 DB에서 관련 문서 검색
Augmented :: 검색된 문서를 프롬프트에 근거(context)로 추가
Generation :: 질문 + 근거 문서로 LLM이 답변 생성
```

| 비교 (2023, 4개 기법) | Prompt Engineering | RAG | PEFT | Full Fine-tuning |
| --- | --- | --- | --- | --- |
| 구현·유지 비용 | 가장 낮음 | 낮음 | 중간 | 가장 높음 |
| 투명성·해석 가능성 | 중간 | 가장 높음 (출처 제시) | 낮음 | 낮음 |
| 구현 복잡도 | 낮음 | 중간 | 높음 | 높음 |
| 환각 회피 | 낮음 | 가장 높음 | 중간 | 중간 |

> [!warn] 실무 도입의 진짜 허들은 데이터
> 기업 RAG의 걸림돌은 기술보다 문서: 중복·노후 문서가 섞인 비일관한 문서 체계, 비정형 데이터 전처리(정제·정렬·분류)에 예상보다 큰 리소스. 흔한 증상 7가지는 정보 누락, 정답 추출 실패, 출력 형식 오류, 불완전 응답, 대규모 처리 병목, 생성 코드의 보안 위협, PDF 추출 실패.

> [!tip] 2026 논쟁 정리
> Karpathy의 LLM Wiki(LLM이 마크다운 위키를 Ingest·Query·Lint로 누적 관리)는 수백 문서 규모 개인·팀 지식 관리 레이어로 RAG 위에 얹는 도구이지 대체재가 아님. 엔터프라이즈 평가 기준은 Response Correctness, Retrieval Accuracy, Answer Relevance.
