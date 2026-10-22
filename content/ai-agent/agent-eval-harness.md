---
title: Agent 평가와 Harness
en: Agent Evaluation, Harness Engineering
summary: "에이전트는 결과·도구·정책·운영 4축으로 평가하고, 확률적 LLM을 결정론적 경계(Harness)로 감싸 운영한다"
importance: 2
order: 12
tags: [Evaluation, Harness, Guardrail, PassK]
keypoints:
  - "RAG 평가(검색·생성)와 달리 Agent는 State 변화와 행동 궤적(Trajectory)까지 평가"
  - "LLM 비결정성 → K회 반복 PassK, 변경 시 Regression Test"
  - "판정(Judge)은 확률에 맡기고 게이트·권한·종료·Retry는 코드로 결정론화"
qa:
  - q: "AI Agent는 어떻게 평가하나? RAG 평가와 무엇이 다른가?"
    a: "RAG 평가는 Hit Rate@K·MRR로 검색을, LLM-as-a-Judge로 생성을 보는 정적 텍스트 중심이다. 에이전트는 외부 환경을 바꾸고 여러 단계를 거치므로 결과(DB·파일·API 상태 변경, 산출물 무결성), 도구(도구 선택, 인자 유효성, 실행 순서, 중복 호출), 정책(권한 경계, 프롬프트 인젝션·PII 차단), 운영(P95, TTFT, 비용, 무한 루프율)을 함께 본다. 코드·도구·프롬프트·모델이 바뀔 때마다 표준·적대적·실패로그로 만든 Golden Dataset을 샌드박스에서 돌리고 PassK, 정책 0-Fault, 비용으로 배포를 판정한다."
  - q: "Harness Engineering에서 결정론적 경계란?"
    a: "Agent = Model + Harness로, 모델은 추론만 하고 도구 실행·상태 유지·검증·복구는 하네스가 맡는다. LLM Judge를 넣어도 판정 자체는 여전히 확률적이지만, 그 판정을 받아 분기·재시도로 연결하는 파이프라인은 코드로 결정론적으로 만들 수 있다. 그래서 judge_node(확률)와 gate 라우팅 함수(순수 함수)를 물리적으로 분리하고, 권한·Loop 종료·Retry는 프롬프트가 아니라 상수와 코드로 강제한다."
  - q: "하네스나 멀티에이전트를 많이 붙이면 항상 좋은가?"
    a: "아니다. 역할을 나누는 순간 Handoff마다 컨텍스트 전달, 역할별 지침 반복, 통신 오버헤드라는 토큰 비용과 단계 수만큼의 지연, State Schema·Middleware·디버깅 유지보수 비용이 생긴다. 통신 비용은 라운드 수 × 에이전트 수 × 평균 컨텍스트로 늘어난다. 작업이 선형이고 분해 이득이 적거나 검증이 단순하거나 지연이 매우 중요하면 단일 에이전트가 더 빠르고 안정적이다."
related: [langgraph-state-graph, langchain-middleware, agentic-design-framework, prompt-context/harness-engineering, agent-capstone-mcp/observability-eval]
source: "2026-10-07 · slides-ai-agent.pdf p.150–155 ([Appx. A] LangSmith, RAG vs Agent 평가, 평가 층위, Regression Test·PassK, 평가 방법론, Eval Metric), p.157–170 ([Appx. B] Harness, Agent Harness, Deterministic Boundary, State Schema·Validation, 설계 고려사항, Harness 과잉)"
---

| 평가 축 | WHY | WHAT | 판정 예시 |
| --- | --- | --- | --- |
| 결과 | 환경 손상 없이 목적 달성 | State 변경 검증, 산출물 무결성, 과업 완결성 | PassK ≥ 90% |
| 도구 | 최소 자원으로 올바른 도구를 워크플로우대로 | Tool Selection, Argument Validation, Execution Order(결제 전 승인), Call Efficiency | Trajectory 준수율 ≥ 90% |
| 정책 | 보안·권한·컴플라이언스 | 미인가 도구 차단, Prompt injection·Jailbreak 방어, PII·기밀 유출 차단 | Zero-Fault (위반 0건) |
| 운영 | SLA·예산 안에서 안정적 | P95·TTFT, 토큰·비용 상한, 평균 스텝 수, 무한 루프율 | P95 ≤ SLA, 루프 실패율 0% |

```flow
Trigger :: 코드·도구·프롬프트·모델 버전 변경
Setting :: Golden Dataset(표준 + 적대적 + 실패로그), Sandbox 또는 Mock
Eval Metric :: 결과·도구·정책·운영 다차원 평가
Release Gate :: PassK, Policy 0-Fault, Cost
Feedback Loop :: PASS면 CI/CD 배포, FAIL이면 Rollback → 디버깅 → Dataset 업데이트
```

| Harness 고려사항 | Anti-Pattern | Guide |
| --- | --- | --- |
| 도구 - 권한 | 권한을 프롬프트에 위임 | 노출 필터(역할별 도구 숨김) + 실행 게이트(`amount > REFUND_CAP` 차단, HITL) |
| 검증 - 게이트 | 검증·게이트를 LLM 확률 판정에 맡김 | `@after_model` 스키마 검증이 먼저, 통과분만 Judge → `gate()` 순수 함수로 분기 |
| 메모리 - 컨텍스트 | 전체 히스토리를 모든 에이전트가 공유 | 역할별 메시지 선택, SummarizationMiddleware, 에이전트 간 공유는 State로 |
| Loop 종료 | 종료를 모델 판단에 위임 | `token_budget`, `MAX_ATTEMPTS`, `recursion_limit`를 코드로 |
| Retry | 멱등성 없는 재시도 (결제 중복) | `@wrap_tool_call` + idempotency key + checkpointer, `invoke(None, config)`로 재개 |

> [!warn] 결정론이 되는 것은 판정이 아니다
> LLM Judge를 넣는다고 검증이 결정론적이 되지 않는다. Judge가 PASS를 내면 항상 같은 후속 경로로 가는 "파이프라인의 동작"이 결정론이다. 판정과 라우팅을 한 노드에 섞으면("검증하고 다음 단계도 정해") 결정론적 경계가 사라진다.
