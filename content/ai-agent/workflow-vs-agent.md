---
title: Workflow vs Agent
en: Augmented LLM, Workflow, Agentic Workflow, Agent
summary: "같은 Augmented LLM이라도 흐름을 코드가 정하면 Workflow, 모델이 런타임에 정하면 Agent"
importance: 3
order: 2
tags: [AI Agent, Workflow, Agentic Workflow]
keypoints:
  - "Augmented LLM = LLM + 검색·도구·메모리, 에이전트 시스템의 기본 블록"
  - "Workflow는 재현성·저비용, Agent는 유연성 대신 Latency·Cost·디버깅 부담"
  - "단순하게 시작해 결과가 좋아질 때만 복잡도를 높여라 (Hybrid)"
qa:
  - q: "Workflow와 Agent의 차이는? 언제 무엇을 쓰나?"
    a: "둘 다 Augmented LLM을 쓰지만 제어 주체가 다르다. Workflow는 개발자가 코드로 정한 순서(Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator)대로 LLM을 호출해 결정론적이고 저비용·저지연이다. Agent는 LLM이 어떤 도구를 몇 번 쓰고 언제 끝낼지 런타임에 정해서 경로를 미리 정하기 어려운 개방형 작업에 맞지만 비용·지연·디버깅 부담이 크다. Production에서는 명확한 Workflow 골격 위에 리스크가 낮은 업무부터 Agent를 넣는 Hybrid가 현실적이다."
  - q: "Self-Correction 루프가 있으면 Agent인가?"
    a: "아니다. 루프가 있어도 구조가 코드로 고정되어 있으면 Workflow다. 기준은 루프 유무가 아니라 다음 행동과 종료 시점을 모델이 런타임에 결정하느냐다. 그 중간인 Agentic Workflow는 바깥 구조는 고정하고 그 안에서만 모델이 자율적으로 선택한다."
  - q: "Agentic Workflow가 왜 주목받았나?"
    a: "Andrew Ng가 소개한 HumanEval 코딩 결과에서 GPT-3.5 zero-shot은 48.1%, GPT-4 zero-shot은 67.0%였지만 GPT-3.5를 에이전트 루프로 감싸면 95.1%까지 올랐다. 모델을 바꾸는 것보다 Planning, Reflection, Tool use, Multi-agent collaboration 같은 반복 개선 구조의 효과가 더 컸다는 근거다."
related: [ai-agent-overview, agentic-design-framework, multi-agent-patterns, langgraph-state-graph]
source: "2026-10-06 · slides-ai-agent.pdf p.11–12 (AI Service Spectrum, Augmented LLM), p.55–58 (Traditional vs AI Agentic Workflow, Andrew Ng, 흐름을 누가 통제하는가), p.97 SUMMARY"
---

```compare
Workflow | Agentic Workflow | Agent
흐름 통제 | 코드가 경로를 통제·재현 (개발자) | 고정된 바깥 구조 + 그 안에서 모델 선택 | 모델이 런타임에 흐름 결정 (LLM)
성격 | 결정론적, 검증 가능 | 반복 개선 루프 Goal ⟳ (Plan ⇌ Execute ⇌ Reflect) | 자율성, 유연한 구조
대표 패턴 | Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator | Reflection, Evaluator-Optimizer 루프 | 도구·실행 순서·종료를 런타임에 결정
비용·지연 | 저비용, 저지연 | 루프 횟수만큼 증가 | 고비용, 고지연, 디버깅 어려움
언제 | 재현성이 우선 | 품질을 반복으로 끌어올릴 때 | 경로를 미리 정하기 어려운 개방형 작업
```

- Traditional Workflow: Input → Process A → Process B → Output, 정해진 길을 따라가는 단방향 흐름
- Enterprise 현실: 안정성·보안·비용 때문에 Hybrid, Guardrailed Agent 패턴으로 구성. 높은 신뢰성이 필요한 Production은 Workflow 기반 개발 비중이 높음

> [!warn] 헷갈리기 쉬움
> Agent ≠ Loop. Self-Correction 루프가 있어도 구조가 코드로 고정되어 있으면 Workflow다. "Agent냐 아니냐"보다 "얼마나 자율적인가"로 설명하면 된다.
