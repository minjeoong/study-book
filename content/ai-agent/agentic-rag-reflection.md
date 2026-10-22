---
title: Reflection과 Agentic RAG
en: Reflection, Agentic RAG, Agentic Analytics
summary: "생성 결과를 스스로 검토·개선하는 Reflection을 RAG에 붙여 검색 전략·재검색·검증을 에이전트가 맡게 한 구조"
importance: 2
order: 8
tags: [Agentic RAG, Reflection, RAG]
keypoints:
  - "Agentic RAG = [Planning + Reflection + Collaboration] + RAG"
  - "Reflection 유형: Self, Tool-based, External Judge"
  - "모든 루프에 max_retry·max_revision과 Fallback, 검증된 답만 Memory에 저장"
qa:
  - q: "RAG와 Agentic RAG의 차이는?"
    a: "기본 RAG는 검색 → 생성의 정해진 흐름이고 검색 결과를 별도 평가 없이 그대로 쓰며 협업도 없다. Agentic RAG는 AI가 목적에 맞게 어떤 문서를 어떤 순서로 찾고 요약·생성할지 계획하고, 문서 관련성과 답변의 환각 여부를 스스로 평가해 부족하면 쿼리를 다시 써서 재검색한다. 검색·요약·검토 에이전트로 역할을 나눠 협업할 수도 있다."
  - q: "웹 검색 노드를 붙이면 항상 품질이 좋아지나?"
    a: "아니다. 웹은 노이즈가 많고 출처 간 정보가 충돌하며 신뢰도 편차가 크고, 에이전트가 소스를 잘못 고르거나 over-exploration으로 산만해질 수 있다. 컨텍스트 윈도우가 40%에서 80%로 차면 답변 정확도가 94%에서 61%로 떨어졌다는 보고도 있다. 그래서 필요한 질의만 검색 경로로 보내고, raw 결과는 하위 Searcher 에이전트에서 소비한 뒤 rerank·압축한 요약만 상위 Reasoner에 넘기며, 오래된 tool output은 마스킹하거나 주기적으로 요약한다."
related: [agentic-design-framework, multi-agent-patterns, llm-reasoning, prompt-context/context-engineering]
source: "2026-10-06 · slides-ai-agent.pdf p.86 (Reflection), p.88–92 (Agentic RAG, Workflow, Control Strategy·Loop·Memory 확장), p.93–94 (Agentic Analytics), p.100 (TIP WebSearch)"
---

```flow
Router :: 질문 유형에 따라 경로 분기 (Vector·Web·Both 또는 바로 답변)
Query Transformation → Retrieve :: 쿼리 변환 후 검색
Search Evaluation :: 컨텍스트 품질 판정, 미달이면 Query Rewrite (max_retry 5)
Draft Generation :: 근거 기반 초안 생성
Self-Reflection :: Verdict APPROVED · REVISE(max_revision 3) · RETRIEVE, 개선 없으면 Fallback
Memory Update :: APPROVED된 검증 답만 저장
```

```compare
RAG | Agentic RAG
Planning | 검색 → 답변 생성 고정 | 목적에 맞게 검색 전략·순서를 스스로 설계
Reflection | 검색 정보를 그대로 사용 | 생성 답변을 스스로 검토, 부족하면 검색→수정 루프
Collaboration | 에이전트 없는 정보 검색 프로세스 | 검색·요약·응답 검토 에이전트 역할 분담
```

- Reflection: AI가 자기 응답을 되돌아보고 더 나은 답을 만드는 품질 통제 메커니즘. 사람은 Reflection 구조·피드백 방향을 설계하고 최종 결과를 검토
- Agentic Analytics(로그 기반 이상탐지): LLM 계층(Planning·가설 수립·결과 해석)과 Non-LLM 계층(데이터 검증·ML 모델 탐지·Metric 검증)을 명확히 분리, 검증 실패 시 Re-planning

> [!warn] Loop에는 반드시 상한
> Search Evaluation 루프(max_retry)와 Self-Reflection 루프(max_revision)마다 "개선이 없으면 Fallback → 실패 사유와 함께 답변"을 둔다. Memory에는 검증을 통과한 답만 저장해야 틀린 답이 다음 대화로 전파되지 않는다.
