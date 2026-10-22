---
title: "RAG 평가 (Hit Rate·MRR·LLM-as-a-Judge·RAGAS)"
en: "RAG Evaluation: Hit Rate@K, MRR, LLM-as-a-Judge, RAGAS"
summary: "검색이 정답 문서를 찾았는지(Retrieval)와 LLM이 근거에 맞게 답했는지(Generation)를 나눠서 측정"
importance: 3
order: 10
tags:
  - RAG
  - Evaluation
  - LLM-as-a-Judge
  - RAGAS
keypoints:
  - "Retrieval: Hit Rate@K(정답 포함 여부) + MRR(정답이 몇 번째인지)"
  - "Generation: LLM-as-a-Judge — 항목별 rubric, 점수+근거 Form-filling, 반복·교차 평가"
  - "평가셋 합성: 정답 청크를 LLM에 주고 질문 생성 → (질문, 정답 청크 ID) Ground Truth"
qa:
  - q: "RAG 평가에서 검색과 생성을 나눠 보는 이유는?"
    a: "아무리 좋은 LLM이라도 검색 단계에서 관련 문서를 못 가져오면 좋은 답을 기대할 수 없고, 반대로 검색이 맞아도 LLM이 문서를 무시하고 지어낼 수 있다. 그래서 검색은 Hit Rate@K와 MRR로, 생성은 Faithfulness와 Answer Relevance 같은 기준의 LLM-as-a-Judge로 따로 재서 어느 단계가 병목인지 찾는다."
  - q: "Hit Rate와 MRR은 어떻게 다른가?"
    a: "Hit Rate@K는 상위 K개 안에 정답 문서가 있는 질문의 비율로, 단순하지만 정답이 몇 번째인지는 구분하지 못한다. MRR은 정답 순위의 역수(1위 1.0, 2위 0.5, 3위 0.333, 없으면 0)를 평균 낸 값이다. 질문 4개의 정답 순위가 1, 2, 3, 없음이면 Hit Rate@3은 0.75, MRR은 0.458이고, Hit Rate가 같다면 MRR이 높은 검색기가 더 좋다."
  - q: "LLM-as-a-Judge의 한계와 보완책은?"
    a: "같은 프롬프트에도 점수가 달라지는 일관성 부족, 기준이 모호할 때 관대한 채점, 학습 데이터 편향, GPT 답변을 GPT가 후하게 주는 자기 모델 평가 문제가 있다. 정확성, 충실성, 관련성처럼 항목을 쪼개 1~5 rubric을 주고, 점수와 근거를 함께 쓰게 하는 Form-filling(G-Eval의 CoT + Form-filling)으로 출력을 통제한다. 같은 평가를 반복하거나 여러 LLM으로 교차 평가해 편차를 줄인다."
related:
  - reranker
  - retriever-mmr
  - advanced-rag
  - langchain/structured-output
source: "Day1(9/18) 슬라이드 p.85–89, 부록 p.148–163, 실습 14-Retriever/10-Retriever-Evaluation, 15-RAG/02-RAG-Advanced D"
---

```formula
Hit Rate@K = (상위 K개 안에 정답이 있는 질문 수) ÷ (전체 질문 수) :: 포함 여부만 봄
MRR = (1 ÷ N) · Σ 1 ÷ rankᵢ :: 정답 순위의 역수 평균, 정답이 없으면 0
Faithfulness = (Context로 뒷받침되는 주장 수) ÷ (답변의 전체 주장 수) :: 환각 탐지
```

| RAGAS 지표 | 비교 대상 | 보는 것 |
| --- | --- | --- |
| Context Precision | Query ↔ Retrieval | 검색된 문서 중 상위 결과가 질문과 관련 있는가 |
| Context Recall | Retrieval ↔ 정답 | 정답에 필요한 문서를 빠짐없이 가져왔는가 |
| Faithfulness | Context ↔ Answer | 답이 검색 문서에 근거하는가 (환각 방지) |
| Answer Relevancy | Query ↔ Answer | 답에서 역생성한 질문과 원 질문의 임베딩 유사도 |
| Context Relevancy | Retrieval ↔ Answer | 답이 검색 문서 내용과 실제로 연결되는가 |
| Conciseness · Fluency | Answer | 불필요한 반복 없이 간결, 문장이 자연스러운가 |

> [!tip] 텍스트 유사도 지표는 보조로만
> ROUGE(n-gram 재현율, 요약 평가), BLEU(n-gram 정밀도 + 짧은 문장 패널티, 번역), METEOR(어근·동의어 매칭 + 순서 패널티)는 글자 일치 기반이라 "조깅↔산책" 같은 의미 유사성을 못 봄. SemScore는 문장 임베딩 코사인으로 의미를 반영. RAG 답변 평가는 LLM-as-a-Judge·RAGAS, 운영은 LangSmith(테스트셋 버전 관리, trace, 사용자 피드백).

> [!warn] 실습에서 본 평가 디테일
> 질문 생성 평가셋은 100자 미만 청크를 빼고 seed를 고정해 재현성 확보. Answer Relevance를 0~1로 바로 매기게 하지 않고 5단계 rubric 등급을 받은 뒤 (등급−1)/4로 정규화. 검색 평가 결과 표에서 MultiQuery는 Hit@1 0.70로 낮고 164초로 가장 느렸음 — 지표와 함께 비용·지연도 비교.
