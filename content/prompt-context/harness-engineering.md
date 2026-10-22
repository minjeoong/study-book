---
title: Harness Engineering
summary: "에이전트가 실수할 때마다 그 실수를 다시는 못 하도록 도구·규칙·검증·권한을 시스템으로 설계하는 것"
importance: 2
order: 14
tags:
  - AI Agent
  - 하네스
keypoints:
  - "하네스(마구) = 강하지만 예측 불가한 LLM(말)을 안전·유용한 방향으로"
  - "Context가 못 푸는 도구 실행·실패 처리·권한·합격 판정을 다룸"
  - "핵심 원칙: Legibility, Mechanical Hierarchy, Progressive Disclosure"
qa:
  - q: "Harness Engineering이란? Context Engineering과 무엇이 다른가?"
    a: "Terraform 창업자 Mitchell Hashimoto가 소개한 개념으로, 에이전트가 실수할 때마다 그 실수를 다시는 하지 않도록 시스템을 엔지니어링하는 것이다. Context Engineering이 무엇을 컨텍스트에 담을지에 집중한다면, Harness Engineering은 도구 호출·실행 방식, 실패 처리, 같은 실수의 재발 방지, 권한, 결과물 합격 판정을 다룬다. 즉 AI 시대의 Test Harness다."
  - q: "AGENTS.md는 어떻게 설계해야 하나?"
    a: "모든 규칙을 5,000줄짜리 AGENTS.md 한 파일에 넣으면 컨텍스트 윈도우를 다 차지해서 모델이 정작 중요한 부분을 놓친다. 그래서 AGENTS.md는 100줄 이내의 지도로만 쓰고 실제 상세 규칙은 docs/ 같은 디렉토리에 분산한다. 에이전트는 그때그때 필요한 부분만 찾아 읽는데, 이것이 Progressive Disclosure 원칙이다."
related:
  - context-engineering
  - devils-advocate-multi-persona
  - meta-prompting-markdown
source: 슬라이드 p.92–96
---

| 원칙 | 의미 | 예시 |
| --- | --- | --- |
| Application Legibility | 에이전트가 자기 작업물을 직접 검사할 수 있게 | "코드 잘 짰어?" 대신 "서비스 시작 시간을 측정해 500ms 미만이면 통과" |
| Mechanical Hierarchy | 의존성 방향을 물리적으로 강제 | Types → Config → Repo → Service → Runtime → UI, 어기면 PR/Commit 거부 |
| Progressive Disclosure | 한 번에 다 보여주지 않음 | AGENTS.md는 100줄 지도, 상세는 디렉토리에 분산 |

```layers
AGENTS.md :: 100줄 이내 지도 — 어디에 무엇이 있는지
docs/ :: mcp_usage_rules, source_rules, style_guide, brief_review_checklist
templates/ :: design_spec, template
tools/ :: build_ai.py
outputs/ :: ai_brief_v1, ai_brief_v2 (버전별 결과물)
logs/ :: search_log, source_log, revision_log (검색·출처·수정 이력)
```

> [!tip] 원문 인용
> "It is the idea that anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again." — Mitchell Hashimoto (2026.02, Engineer the Harness)
