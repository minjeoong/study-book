---
title: Cost와 Latency 관리
en: Cost & Latency vs Quality
summary: "에이전트 비용·지연은 대부분 LLM 호출에서 나오고 호출·컨텍스트·지연이 누적된다 — 품질과의 트레이드오프로 관리"
importance: 2
order: 8
tags: [Cost, Latency, 병렬 처리, 운영]
keypoints:
  - "Single 1~3회, Multi-agent 최소 5회+ LLM 호출, 도구 1회 = LLM 2회"
  - "Caching은 비용·지연·일관성 모두 이득, 도구 호출 감소·컨텍스트 압축은 품질 손해"
  - "병렬 실행은 Latency만 줄이고 Cost는 거의 그대로 — 4가지 독립 조건 필요"
qa:
  - q: "멀티에이전트 시스템에서 비용과 지연이 커지는 이유는?"
    a: "단일 에이전트는 LLM 호출이 1~3회 수준이지만 멀티에이전트는 최소 5회 이상으로 누적된다. 도구를 한 번 쓰면 호출 결정과 결과 처리로 LLM이 두 번 돌고, 매 호출마다 이전 메시지를 모두 넣으니 멀티턴이 길어질수록 input token이 늘어난다. 순차 실행이면 전체 지연은 각 단계 지연의 합이라 한 단계만 느려도 전체가 늦어지고, 서브에이전트의 비효율은 전체 응답만 봐서는 안 보이므로 Observability로 확인한다."
  - q: "병렬 실행은 언제 할 수 있나?"
    a: "서로의 결과를 입력으로 쓰지 않고, 같은 State를 동시에 업데이트하지 않고, 실행 순서가 결과에 영향을 주지 않으며(생성·수정 같은 Action 주의, 조회는 무관), 하나가 실패해도 나머지가 계속 진행할 수 있어야 한다. 네 조건을 모두 만족하면 지연은 줄고 비용은 거의 그대로다. 다만 전체 대기 시간은 가장 느린 작업에 맞춰지고 동시 호출이 늘어 Rate limit 위험이 커진다."
related: [observability-eval, error-handling, ai-agent/parallel-fan-out-fan-in, ai-agent/multi-agent-patterns]
source: "2026-10-23(예정) · slides-agent-capstone.pdf p.80–82 (Cost & Latency, Cost & Latency vs Quality, 병렬 실행 조건), p.92 SUMMARY, p.100–102 (Cost & Latency Hands-On: benchmark.py, asyncio.gather) · submission-multiagent.zip F1·F3 (응답 시간)"
---

```formula
Latency(순차) = Σ 단계별 latency :: 한 단계만 느려도 전체 지연
Latency(병렬) ≈ max(작업별 latency) :: 가장 느린 작업이 전체를 결정
LLM 호출 수 ≥ 도구 호출 수 × 2 :: 도구 1회 = 호출 결정 + 결과 처리 LLM 호출
```

| 레버 | Cost | Latency | Quality |
| --- | --- | --- | --- |
| Caching | ↓ | ↓ | ↑ (일관성) |
| Tool 호출 줄이기 | ↓ | ↓ | ↓ (정보 부족) |
| Context 압축 | ↓ | ↓ | ↓ (손실) |
| 병렬 실행 | 거의 그대로 | ↓ | 그대로 |

- 비용의 대부분은 LLM token($/request), 지연도 LLM 호출(sec/request)에서 발생. Agent·LLM token, Tool call, API call, Embedding이 비용 지점
- Hands-On 구조: `backend/perf/benchmark.py`가 그래프를 직접 호출해 측정, Supervisor 그래프 안의 독립 research task를 `asyncio.gather`로 병렬 실행

> [!note] 실습 수치로 보는 트레이드오프
> 같은 질문에 Single 모드는 1.7초(도구 없이 되묻기), Multi-agent(Supervisor)는 Plan → Task 3개 → 최종 응답으로 11.2초. "안녕하세요"에도 Multi는 planning·writing 두 번 LLM을 불러 2.7초 — 분해는 과하지 않았지만 단순 질문에는 무겁다.
