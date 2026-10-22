---
title: User Story와 Product Backlog
en: User Story, INVEST, Acceptance Criteria, Backlog Refinement
summary: "요구사항을 사용자가 얻는 가치 단위로 쓰는 법 — As a / I want / So that + 인수 기준, INVEST로 다듬어 백로그에 쌓는다"
importance: 3
order: 3
tags:
  - Agile
  - User Story
  - 요구사항
keypoints:
  - "템플릿: As a [사용자], I want [기능], So that [얻는 가치]"
  - "INVEST: 독립·협상 가능·가치·추정 가능·작은 크기·테스트 가능"
  - "비즈니스 요구 → Epic → Story → Task, 상세화는 Just-in-time"
qa:
  - q: "좋은 User Story의 조건은?"
    a: "INVEST를 만족해야 한다. 다른 스토리와 독립적으로 개발할 수 있고(Independent), 세부 구현은 계약이 아닌 대화로 협의할 수 있고(Negotiable), 사용자에게 명확한 가치가 있고(Valuable), 팀이 크기를 추정할 수 있고(Estimable), 한 Sprint 안에 끝낼 만큼 작고(Small), 완료를 검증할 기준이 있어야(Testable) 한다. '로그인 기능 개발'처럼 누가·왜·언제 완료인지가 없는 문장은 팀마다 다르게 해석할 위험이 크다."
  - q: "인수 기준(Acceptance Criteria)은 왜 필요한가?"
    a: "스토리가 완료됐는지 판단하는 검증 조건이라 해석 차이를 없애고 그대로 테스트 기준이 된다. Given-When-Then 형식으로 쓰면 명확하다. 수업 예시로 로그인 스토리에는 '올바른 정보면 메인으로 이동, 틀리면 오류 메시지, 5회 연속 실패 시 계정 일시 잠금'을 붙였고, Day1에 쓴 인수 기준이 Day2 구현의 테스트 기준이 됐다."
  - q: "Backlog Grooming(Refinement)이란?"
    a: "Sprint 시작 전에 제품 백로그 항목을 정리·구체화·우선순위화하는 사전 준비 활동이다. Sprint 중반에 1시간 이내로 PO는 필수, Dev팀은 일부가 돌아가며 참석해 우선순위 재정렬 → 상위 항목 상세화 → INVEST 점검 → Planning Poker로 Story Point 추정 순으로 진행한다. 목표는 다음 1~2 Sprint 분량의 스토리를 늘 Ready 상태로 유지하는 것이다."
related:
  - scrum-framework
  - sprint-planning-estimation
source: "2026-08-26 교재 p.17–23 (User Story 정의, INVEST, 그루밍, Before/After, Backlog 채우기, 제품 백로그와 완료 기준), p.37–38 (샘플 스토리 3종, 가이드 세션 체크리스트)"
---

```flow
비즈니스 요구 :: 시장·고객이 겪는 문제
Epic :: 큰 기능 덩어리 — 팀 브레인스토밍으로 나열
User Story :: As a ~, I want ~, So that ~ + 인수 기준
Task :: Sprint에 들어온 스토리를 구현 단위로 분할 → Sprint Backlog
```

```compare
Before — 모호한 작성 | After — INVEST 적용
스토리 | "로그인 기능 개발" | As a 회원, I want 이메일/비밀번호로 로그인, So that 내 계정에 안전하게 접근
누가 · 왜 | 불명확 | 회원 / 계정 접근이라는 가치
완료 기준 | 없음 → 검증 불가 | 정상이면 메인 이동, 오류면 메시지, 5회 실패 시 잠금
위험 | 팀마다 다르게 해석 | 인수 기준이 곧 테스트 기준
```

| 시점 | 얼마나 상세히 쓰나 |
| --- | --- |
| 백로그 초기 등록 | 제목 + 한 줄 가치 정도 (Epic 수준) |
| Backlog Refinement | Sprint 후보가 되면 팀과 세부 조건·인수 기준 논의 |
| Sprint Planning 직전 | INVEST를 충족하고 Task로 쪼갤 수 있는 수준 |
| Sprint 진행 중 | 필요 이상 앞서 상세화하지 않음 (Just-in-time) |

- 팀 Backlog 채우기 5단계: Epic 브레인스토밍 → Epic을 Story로 분해 → MoSCoW로 우선순위 태깅 → 상위 10개 INVEST 점검·인수 기준 작성 → Planning Poker로 추정
- "요구사항 ≒ 사용자 스토리 ≒ 백로그 ≒ 일감" — 팀이 일하는 근거이자 소통·성과 측정의 중심이 백로그. Ownership은 PO

> [!warn] 헷갈리기 쉬움
> 교재는 DoD와 인수 기준을 묶어 "완료 기준"으로 설명했지만 구분해서 말하는 편이 안전하다. DoD(Definition of Done)는 모든 Increment에 적용되는 팀 공통 기준(예: 코드 리뷰, 테스트 통과), 인수 기준은 스토리마다 다른 조건(Given-When-Then)이다.
