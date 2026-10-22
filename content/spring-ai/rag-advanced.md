---
title: RAG 심화 — HyDE·재순위·하이브리드
en: HyDE, Modular RAG, Re-ranking, Hybrid Search, Agentic RAG, RAG Evaluation
summary: RAG 품질은 검색이 좌우 — 질의를 다듬고(HyDE), 넓게 찾아 좁게 넣고(재순위), 키워드와 의미를 합친다
importance: 2
order: 10
tags:
  - RAG
  - 검색 품질
  - 평가
keypoints:
  - HyDE — 가상 답변을 먼저 만들어 그 문장으로 검색
  - topK 20으로 넓게 회수 → 재순위 → 상위 4건만 투입
  - 지식은 RAG, 말투·형식은 파인튜닝 — 순서는 프롬프트 → RAG → FT
qa:
  - q: HyDE는 무엇이고 언제 효과가 있나?
    a: 짧고 구어체인 질문은 실제 문서와 말투·형태가 달라 검색이 빗나가므로, 모델에게 그럴듯한 가상 답변을 먼저 쓰게 하고 그 답변을 임베딩해 검색하는 기법이다. 답변끼리는 문서와 닮아 정답 문서를 더 잘 찾는다. 실습에서 '물건 돌려보내려면 며칠 안에 해야 해요?'는 그냥 검색하면 배송 정책(0.41)이 1등이었지만 HyDE로는 반품 규정(0.68)이 1등이 됐고, 모델 호출이 1회 늘어나므로 질문이 이미 문서 말투면 쓰지 않는다.
  - q: 재순위(Re-rank)와 하이브리드 검색은 무엇을 해결하나?
    a: 벡터 유사도 상위가 곧 정답 순서는 아니므로, topK 20처럼 넓게 회수한 뒤 모델이나 재순위기로 실제로 쓸모 있는 문단만 다시 골라 상위 4건만 넣으면 정확도는 오르고 토큰은 준다. 하이브리드 검색은 벡터 검색이 놓치는 제품 코드·품번·고유명사를 키워드(BM25) 검색으로 잡고 의미 검색과 합쳐 순위를 재조정한다. 재순위는 들인 노력 대비 효과가 가장 확실한 기법이다.
  - q: RAG 품질은 어떤 지표로 재나?
    a: 검색과 생성을 나눠 잰다. 검색은 정답 문서가 상위 k 안에 있는지(Recall@k)와 가져온 것 중 쓸모 있는 비율(Precision@k), 생성은 근거 안의 내용만으로 답했는지(Faithfulness)와 질문에 실제로 답했는지(Answer Relevancy)를 본다. Spring AI의 RelevancyEvaluator처럼 모델로 채점할 수도 있고, 어느 지표가 낮은지에 따라 청킹·임계값을 고칠지 프롬프트를 고칠지가 갈린다.
related:
  - rag-retrieval
  - rag-ingest
  - tool-calling-mcp
  - llm-workflow-patterns
source: 슬라이드 p.200–219(9장 RAG 품질·HyDE·모듈형 RAG·질문 변환·Contextual Retrieval·Agentic RAG·Parent-Child·검색 Tool·재순위·Hybrid Search·분할 전략·GraphRAG·RAG vs Fine-tuning·RAG 평가·HyDE 실습) — Day 2 (08-19), 실습 09_HyDE비교, ch08_ragadv
---

```layers
Pre-Retrieval (질문 다듬기) :: RewriteQueryTransformer · TranslationQueryTransformer · MultiQueryExpander · HyDE
Retrieval (검색) :: VectorStoreDocumentRetriever — topK · threshold · 메타데이터 필터, 하이브리드
Post-Retrieval (후처리) :: 재순위(Re-rank) · 중복 제거 · 압축 · Parent-Child로 큰 맥락 꺼내기
Generation (생성) :: 질문 + 근거 → ChatModel → 근거 있는 답 + 출처
```

| 기법 | 해결하는 문제 | 비용·주의 |
| --- | --- | --- |
| HyDE | 질문과 문서의 문체 차이 | 모델 호출 1회 추가 |
| 질문 변환·다중 질의 | 짧고 애매한 질문, 회수율 부족 | 질의당 1~3회 추가 호출 |
| Contextual Retrieval | 청크만 보면 "이것"이 무엇인지 모름 | 청크마다 문서 요약 1~2문장을 붙여 저장, 인제스트 비용 증가 |
| Parent-Child | 작게 찾아야 정확, 크게 줘야 맥락 | 자식 청크로 검색 → 부모 단락 투입 |
| Agentic RAG | 한 번 검색으로 부족한 복잡한 질문 | 검색을 @Tool로, 부족하면 재검색 — 스텝·비용 증가 |
| GraphRAG | "A와 B의 관계는?" 같은 다중 홉 질문 | 구축 비용 큼, 단일 사실 질문엔 과함 |

```java
var advisor = RetrievalAugmentationAdvisor.builder()
        .queryTransformers(RewriteQueryTransformer.builder()        // ① 질문 다시 쓰기
                .chatClientBuilder(builder.build().mutate()).build())
        .queryExpander(MultiQueryExpander.builder()                 // ② 여러 각도로 질의
                .chatClientBuilder(builder.build().mutate()).numberOfQueries(3).build())
        .documentRetriever(VectorStoreDocumentRetriever.builder()   // ③ 검색
                .vectorStore(vectorStore).similarityThreshold(0.6).topK(6).build())
        .build();

String answer = chat.prompt().user(q).advisors(advisor).call().content();
```

> [!warn] 한 번에 하나씩
> 기법을 동시에 여러 개 붙이면 무엇이 효과였는지 알 수 없고 지연과 비용만 확실히 는다. 실패 사례 하나를 고른 뒤 기법 하나를 붙이고, 같은 질문 5개로 전후를 비교해 좋아졌을 때만 남긴다.
