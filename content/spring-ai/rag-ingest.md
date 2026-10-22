---
title: RAG 인제스트 — 임베딩·청킹·VectorStore
en: Embedding, Chunking, Metadata, VectorStore, Indexing Pipeline
summary: 문서를 읽고 자르고 메타데이터를 붙여 임베딩한 뒤 VectorStore에 저장하는 RAG 사전 준비
importance: 3
order: 8
tags:
  - RAG
  - 임베딩
  - 청킹
  - VectorStore
keypoints:
  - 임베딩은 문장을 숫자 벡터로 — 뜻이 가까우면 벡터도 가깝다 (코사인 유사도)
  - 청크 800~1200자·겹침 10~20%에서 시작, 문서 성격에 맞게 조정
  - 메타데이터는 인제스트 때만 넣을 수 있고, 재색인은 delete 후 add
qa:
  - q: 임베딩과 코사인 유사도를 설명하라.
    a: 임베딩은 문장을 의미를 담은 숫자 배열(예 1536차원)로 바꾼 것으로, 뜻이 가까운 문장일수록 벡터 공간에서 가깝다. 코사인 유사도는 두 벡터가 이루는 각도로 닮은 정도를 재며 1에 가까울수록 비슷하다. 그래서 '휴가 내는 법'으로 물어도 '연차 신청 규정'처럼 키워드가 하나도 안 겹치는 문서를 찾을 수 있고, 실습에서 '조심해서 나쁠 건 없지'에 '돌다리도 두들겨 보고 건너라'가 1등으로 나왔다.
  - q: 청크 크기와 겹침(overlap)은 어떻게 정하나?
    a: 기준은 질문 하나에 답할 만한 분량으로, 너무 크면 관련 없는 내용이 잡음으로 딸려 오고 너무 작으면 앞뒤 맥락이 끊긴다. FAQ는 300~500토큰, 규정·매뉴얼은 600~900토큰, 기술 문서는 800~1200토큰처럼 문서 유형별로 시작값을 정하고, 겹침은 경계에서 잘린 문장을 살리는 보험이다. 정답은 문서마다 다르므로 골든셋 통과율을 보며 한 번에 하나씩 조정한다.
  - q: 인제스트에서 메타데이터와 재색인이 중요한 이유는?
    a: source·version·dept·validUntil 같은 메타데이터가 있어야 답변에 출처를 붙이고, 부서·권한 필터와 만료 문서 제외를 할 수 있는데 인제스트 시점에만 넣을 수 있어 빠뜨리면 전량 재색인이다. 또 같은 문서를 add만 반복하면 같은 청크가 쌓여 검색 결과가 중복 문장으로 도배되므로, source 기준으로 먼저 delete한 뒤 add한다. 두 실수 모두 오류를 내지 않고 품질만 조용히 떨어뜨려 찾기가 가장 어렵다.
related:
  - rag-retrieval
  - rag-advanced
  - spring-ai-abstractions
  - llm-transformer/vector-similarity
  - llm-transformer/word-embedding
source: 슬라이드 p.50–52(EmbeddingModel·임베딩과 벡터·VectorStore), p.56–57(속담 유사도 실습) — Day 1 (08-18); p.172–187(8장 RAG 파이프라인·임베딩 모델 선택·DocumentReader·청킹·메타데이터·청킹 전략·VectorStore·pgvector·벡터 DB 선택·HNSW 인덱스·ETL 파이프라인) — Day 2 (08-19), 실습 02_속담유사도, 08_위키QnA, 과제 Day 2 Lab2IngestService
---

```flow
읽기 (Reader) :: TikaDocumentReader·PagePdfDocumentReader → Document(본문 + 메타데이터)
분할 (Splitter) :: TokenTextSplitter — 크기·겹침 조절
메타데이터 보강 :: source · version · dept · validUntil (지금만 넣을 수 있다)
재색인 :: 같은 source 청크를 delete
임베딩 + 저장 :: vectorStore.add() — 임베딩은 VectorStore가 호출
```

| 고를 것 | 선택지 | 판단 기준 |
| --- | --- | --- |
| 임베딩 모델 | 768·1536·3072차원 등 | 한국어 회수율을 우리 문서 30건으로 비교, 바꾸면 전량 재색인 |
| 벡터 DB | pgvector · Redis · Elasticsearch · Chroma · SaaS | 성능보다 "우리 팀이 운영할 수 있나" — 대개 pgvector가 첫 선택 |
| 인덱스 | 없음(전수 비교) · HNSW · IVFFlat | 1만 건 미만은 없어도 됨, 운영은 HNSW |
| dimensions | 임베딩 모델 차원과 반드시 일치 | 다르면 저장 오류 또는 조용히 엉뚱한 결과 |

```java
public IngestResult ingest(Resource doc, String source, String version) {
    var reader = new TextReader(doc);
    reader.getCustomMetadata().put("source", source);     // 나중에는 못 넣는다
    reader.getCustomMetadata().put("version", version);

    List<Document> chunks = TokenTextSplitter.builder()
            .withChunkSize(400).withMinChunkSizeChars(200).build()
            .apply(reader.get());

    vectorStore.delete(new FilterExpressionBuilder().eq("source", source).build()); // 재색인
    vectorStore.add(chunks);                                // 임베딩 + 저장
    return new IngestResult(source, chunks.size());        // 두 번 넣어도 청크 수가 같아야 정상
}
```

> [!warn] 임베딩 모델 교체
> 임베딩 모델을 바꾸면 차원이 같아도 의미 공간이 달라 기존 벡터와 섞이는 순간 검색이 조용히 망가진다. 모델과 dimensions는 한 번 정하면 함께 움직이는 값이고, 바꿀 때는 전량 재색인이 기본이다.
