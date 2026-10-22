---
title: Agentic Workflow 설계 프레임워크
en: Goal → Plan → Execute → Reflect
summary: "에이전트는 사고 구조 설계에서 시작 — 목표와 성공 기준을 정하고 작업·상태·제어·협업 구조를 설계"
importance: 3
order: 6
tags: [Agentic Workflow, Success Criteria, State Schema, 설계]
keypoints:
  - "Goal은 '무엇을 할지'가 아니라 '무엇이 달성되면 끝인지'를 판정 가능한 기준으로"
  - "Plan = 작업 분해 + State Schema + 제어 전략 + 협업 구조"
  - "제어 전략의 핵심은 실패 처리 — 최대 반복, fallback, 비용 초과 종료"
qa:
  - q: "에이전트를 설계할 때 무엇부터 정하나?"
    a: "Goal부터 정한다. 산출물이 아니라 업무 결과(Desired Outcome: 대상, 변화, 결정·행동, 범위)를 정의하고, '좋은 답변' 같은 정성 표현 대신 판정 가능한 Success Criteria를 둔다. 약관 상담 에이전트 예시에서는 출처 명시율 100%, Faithfulness 통과 95% 이상, 답변 400자 이내, 답변당 LLM 호출 3회 이하·P95 3초 이하처럼 품질·업무 제약·서비스 기준을 수치로 적었다."
  - q: "State Schema는 왜 중요하고 어떻게 설계하나?"
    a: "State는 Subtask 사이에 데이터를 넘기고 Goal 달성 여부를 추적하는 Single Source of Truth다. 입력(질문, 사용자 프로필), 중간 결과(질문 분류, 검색 문서, 초안), 평가 점수, 루프 제어 값(retry_count, is_escalate)을 나눠 담는다. 멀티에이전트에서는 에이전트별 스코프로 나눠 필요한 키만 주입해 컨텍스트 오염을 막고, 실패 시 checkpointer로 롤백할 수 있는지도 같이 설계한다."
  - q: "Retry와 종료 정책은 어떻게 정하나?"
    a: "Retry는 품질 향상이 예상될 때만 허용하고, 종료 조건이 없으면 에이전트는 멈추지 않는다는 전제로 최대 반복 횟수, 실패 시 fallback, 근거 부족 시 응답 규칙, 비용 초과 시 종료 정책을 반드시 정한다. 예시에서는 검색 결과가 부족하면 최대 2회 재검색하고, 그래도 부족하면 임의 생성 없이 '확인 후 안내' 메시지와 상담사 이관으로 처리했다."
related: [workflow-vs-agent, multi-agent-patterns, langgraph-state-graph, agent-eval-harness]
source: "2026-10-06 · slides-ai-agent.pdf p.59–68 (Design Framework, Goal·Desired Outcome·Success Criteria·Goal 명세, Task Decomposition, State Schema 1/2·2/2, Control Strategy, Task & Control 예시), p.98 SUMMARY"
---

```flow
Goal :: 무슨 목적인가, 무엇을 달성으로 볼 것인가 (Desired Outcome + Success Criteria)
Plan :: Task Decomposition, State Schema, Control Strategy(Linear·Loop·Branch·Retry), Collaboration Structure
Execute :: Tool Invocation, State Update, Action Execution, Memory
Reflect :: Self-Reflection, Tool-based Validation, External Judge — 미달 시 Plan으로 재진입
```

| # | Task (약관 상담 예시) | 처리 방식 | 실패 처리 | 연결된 Success Criteria |
| --- | --- | --- | --- | --- |
| 1 | 질문 유형 분류 | Rule | 범위 외 → 상담사 이관 | Boundaries |
| 2 | 약관·정책 조항 검색 | 검색 Tool | 결과 부족 시 최대 2회 재검색, 그래도 없으면 "확인 후 안내" | 근거성, Error |
| 3 | 조항-질문 매핑 검증 | LLM Judge | 충실성 미달 시 매핑만 재실행(1회) | 충실성 |
| 4 | 근거 포함 답변 생성 | LLM 생성 | 3단 구조·400자 위반 시 재생성(1회) | 완결성, Formatting |
| 5 | 내부 정책 위반 체크 | Rubric | 위반 시 재생성 → 반복 실패면 이관 | Compliance |

- Success Criteria 3묶음: 결과 품질(근거성·충실성·완결성·일관성), 업무 제약(Target Actor·Compliance·Scope·Formatting), 서비스 기준(Cost·Error Handling·Consistency·Stability)
- Task Decomposition 점검: Outcome에 직접 기여하나(Alignment), 병렬 가능·실패 시 어디로 돌아가나(Dependency), 단일 책임 수준인가(Granularity — 너무 크면 Reflection이 무의미, 너무 잘면 복잡)
- Cost 예산: 정상은 생성 1 + 검증 1 + 검색 1회, 최대 생성 2·검증 2·검색 3회 초과 시 중단·이관

> [!tip] 면접 팁
> "Task가 구조라면 Control Strategy는 의사결정 로직, 특히 실패를 어떻게 처리할 것인가"라는 한 문장으로 Plan 단계를 요약할 수 있다. Conditional Branch는 모델의 판단이 아니라 설계자의 정책(Rule 또는 Judge)이다.
