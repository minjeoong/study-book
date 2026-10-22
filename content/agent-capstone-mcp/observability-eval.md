---
title: Observability와 Eval
en: Observability, Evaluation, LangSmith
summary: "Observability는 시스템이 무엇을 하는지 관측(descriptive), Eval은 출력이 기준에 맞는지 판정(judgmental) — 둘은 한 쌍"
importance: 2
order: 6
tags: [Observability, Eval, LangSmith, 운영]
keypoints:
  - "Monitoring은 정해 둔 임계치 알림, Observability는 예상 못한 문제의 원인까지 추적"
  - "Agent 관측 단위: Trace(요청 전체), Span(LLM·Tool 호출), Metrics, Metadata"
  - "Eval 구성: Dataset, Target, Evaluator, Score, Experiment"
qa:
  - q: "Monitoring과 Observability는 무엇이 다른가?"
    a: "Monitoring은 미리 정한 임계치(CPU, 에러율 등)를 넘으면 장애를 알려 준다. Observability는 Metrics, Logs, Traces를 연결해 외부 출력으로부터 내부 상태를 추론하고 미처 예상하지 못한 문제의 근본 원인까지 찾는 능력이다. 에이전트는 같은 입력에도 출력이 다르고 한 요청에 여러 LLM·도구 호출과 상태 변화가 일어나서 로그만으로는 부족하고, Trace·Span 단위 추적과 토큰 사용량 가시화가 필요하다."
  - q: "Observability와 Eval은 어떻게 함께 쓰나?"
    a: "개발 단계에서 Dataset과 Evaluator를 만들어 Eval로 baseline을 잡고, 배포하면서 Observability를 켠다. 운영 중 trace로 실제 문제를 관찰하면 그 trace를 Dataset에 추가하고 Evaluator를 보강한 뒤, 수정 버전을 Eval로 확인하고 배포한다. Observability만 있으면 변경이 좋아졌는지 확신할 수 없고, Eval만 있으면 운영의 실제 문제에 대응할 수 없다."
related: [error-handling, cost-latency, ai-agent/agent-eval-harness]
source: "2026-10-23(예정) · slides-agent-capstone.pdf p.69–75 (통합 환경의 운영, Callback, Observability 용어·AI Agent 관점, Eval, Observability & Eval), p.90 SUMMARY, p.94–96 (Observability & Eval Hands-On: create_dataset, evaluators, run_eval, LangSmith)"
---

```flow
개발 :: Dataset 생성, Evaluator 작성, Eval로 Baseline 확립
배포 :: Observability 활성화 (LangSmith Tracing)
운영 :: Trace로 실제 동작 관찰 — 문제 발견
개선 :: 문제 trace를 Dataset에 추가, Evaluator 보강, 수정 버전 Eval 확인 후 배포
```

| 관측 단위 | 내용 | 답하는 질문 |
| --- | --- | --- |
| Trace | 요청 하나의 전체 실행 경로 | 이 요청은 왜 30초나 걸렸나? → 병목 단계 식별 |
| Span | Trace의 한 단계 (LLM 호출, Tool call) | 오류가 어디서 났나? → 실패 span 추적 |
| Metrics | Latency, token usage, cost | 이번 달 비용이 왜 늘었나? → 토큰 패턴 분석 |
| Metadata | thread_id, user_id, agent_version 등 분류 정보 | Plan은 어떻게 세워졌나? → planning prompt·completion 확인 |

- Eval 구성: Dataset(질의 + 기대 응답), Target(Agent·Function·System), Evaluator(Reference-based 정답 비교, LLM-as-a-Judge + Rubric, Heuristic 형식 검증), Score, Experiment(Target × Dataset 한 번 실행 결과)
- Eval 질문 예: 프롬프트 v1 vs v2, Multi-agent vs Single agent, 모델 버전 변경 시 품질 유지 → 모두 "같은 Dataset으로 비교"
- Hands-On 구조: `backend/eval/`의 `create_dataset`·`evaluators`·`run_eval`이 Endpoint를 거치지 않고 Supervisor 그래프를 직접 호출, Trace는 LangSmith에 자동 기록

> [!warn] 수집 비용도 설계 대상
> Unknown을 탐지하려 해도 어떤 차원의 데이터를 수집할지는 미리 정해야 한다. Metrics·Logs·Traces를 따로 쌓으면 상관관계를 보기 어렵고, Log·Trace 저장 비용은 트래픽에 비례한다.
