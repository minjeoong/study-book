---
title: RAG 검색과 근거 답변
en: Retrieval, QuestionAnswerAdvisor, Grounded Answer, Golden Set
summary: 질문과 가까운 청크를 찾아 그 근거만으로 답하고 출처를 붙인다 — 근거가 없으면 모른다고 답한다
importance: 3
order: 9
tags:
  - RAG
  - QuestionAnswerAdvisor
  - 평가
keypoints:
  - RAG = 검색 + 생성, 재학습 없이 문서만 바꿔 지식을 갱신하는 오픈북 시험
  - 답이 이상하면 모델보다 검색 결과를 먼저 눈으로 본다
  - 근거가 없으면 모델을 부르지 않고 "확인되지 않습니다"로 거절
qa:
  - q: RAG란 무엇이고 왜 필요한가?
    a: LLM은 학습 이후의 일과 우리 회사 내부 문서를 모르고, 모르는 것도 그럴듯하게 지어내는 환각이 있다. RAG는 질문마다 관련 문서 조각을 검색해 프롬프트에 함께 넣고 그 근거로 답하게 하는 방식으로, 모델을 재학습하지 않고 문서만 바꾸면 최신 지식이 반영되고 출처를 붙일 수 있다. Spring AI에서는 ChatClient에 QuestionAnswerAdvisor(vectorStore)를 붙이면 검색과 근거 주입이 자동으로 된다.
  - q: RAG 답변이 틀렸을 때 어떤 순서로 진단하나?
    a: 먼저 /retrieve 같은 검색 전용 엔드포인트로 상위 결과와 점수를 눈으로 본다. 근거에 답이 없으면 '못 찾음' 유형이라 청킹·임베딩·top-k·임계값·질문 변환을 고치고, 근거는 맞는데 답이 틀리면 '찾고도 잘못 답함' 유형이라 시스템 프롬프트의 근거·거절·인용 지시를 고친다. 근거에 답이 없는데 프롬프트를 아무리 고쳐도 좋아지지 않으므로 순서는 항상 검색 → 프롬프트 → 모델이다.
  - q: similarityThreshold는 어떻게 정해야 하나?
    a: 남이 쓰는 기본값을 물려받지 말고 우리 말뭉치에서 점수 분포를 재서 정한다. Day 2 과제에서 0.5로 두자 모든 질문이 거절됐는데, 임계값을 0으로 낮춰 원점수를 보니 text-embedding-3-small의 관련 문서 점수가 0.15~0.41에 몰려 있어 0.15로 조정했고 골든셋 10/10을 통과했다. 또 범위 밖 질문도 0.375가 나와 임계값만으로는 답변 가능 여부를 가를 수 없음을 확인했고, 최종 거절 판단은 프롬프트 단계에 맡겼다.
related:
  - rag-ingest
  - rag-advanced
  - structured-output
  - advisors-memory
  - prompt-context/llm-hallucination
source: 슬라이드 p.172–175(LLM 한계와 RAG·파이프라인), p.188–199(검색과 근거·QuestionAnswerAdvisor·대화 메모리 결합·튜닝 포인트·필터 표현식·실패 진단표·위키 Q&A 실습), p.220–230(Day 2 실습 사내 문서 Q&A·골든 세트·실험표) — Day 2 (08-19), p.317(Phase 3 출처 표기), 실습 08_위키QnA, ch07_rag, day2_lab2, 과제 Day 2
---

```flow
질문 :: "단순 변심 반품은 며칠 이내인가요?"
임베딩 + 유사도 검색 :: topK 4, similarityThreshold, filterExpression(부서·유효기간)
근거 확인 :: 결과가 비면 모델을 부르지 않고 거절 응답
프롬프트 결합 :: [근거] + [질문] + "근거에만 기반, 없으면 확인되지 않습니다"
생성 + 출처 :: AnswerDto(answer, sources, grounded) — 구조화 출력
```

| 증상 | 원인 | 대응 |
| --- | --- | --- |
| 아무것도 못 찾음 | 인제스트 안 됨 · 임베딩 설정 · 임계값이 너무 높음 | 청크 수·점수 분포부터 확인 |
| 엉뚱한 문서가 옴 | 임계값이 낮음 · 청크가 큼 | threshold 올리기, 청크 줄이기, 필터 |
| 관련 문서가 빠짐 | 질문과 문서의 어휘 차이 | HyDE · 질문 변환 · 하이브리드 검색 |
| 근거는 맞는데 답이 틀림 | 근거를 안 쓰고 지어냄 | "근거 안에서만" 지시 강화 |
| 출처가 안 나옴 | 꺼내는 코드가 없음 | 응답 컨텍스트의 RETRIEVED_DOCUMENTS 사용 |
| 같은 문장만 반복 | 재색인 없이 add 반복 | source 기준 삭제 후 재적재 |

```java
public AnswerDto ask(String question) {
    var docs = vectorStore.similaritySearch(SearchRequest.builder()
            .query(question).topK(4).similarityThreshold(0.15).build());
    if (docs.isEmpty()) return AnswerDto.unknown();        // 근거 없으면 모델을 안 부른다
    return chatClient.prompt()
        .system("""
            아래 [근거]만 사용해 답한다. 근거에 없으면 "확인되지 않습니다"라고 답한다.
            답변 끝에 사용한 출처를 [출처: 파일명] 형식으로 남긴다.
            """)
        .user(u -> u.text("[근거]\n{context}\n\n[질문] {question}")
                    .param("context", format(docs)).param("question", question))
        .call()
        .entity(AnswerDto.class);                          // answer · sources · grounded
}
```

> [!tip] 골든 세트로 측정한다
> 정답 키워드·기대 출처가 정해진 질문 10개(표현만 바꾼 질문 쌍, 문서에 없는 질문 포함)를 golden.json으로 두고, 통과 기준선(8/10)을 테스트 코드에 박는다. 모델을 부르는 테스트라 `-Peval`로 분리해 기본 빌드에서는 돌지 않게 한다.
