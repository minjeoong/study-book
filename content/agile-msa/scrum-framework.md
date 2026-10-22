---
title: Scrum — 역할·이벤트·산출물
en: Scrum Framework
summary: "Agile을 실행하는 대표 프레임워크 — 3 역할이 4 이벤트를 Timebox로 반복하며 3 산출물을 만든다"
importance: 3
order: 2
tags:
  - Agile
  - Scrum
keypoints:
  - "역할 3: PO(우선순위·ROI), SM(진행 촉진·장애물 제거), Dev팀(Increment 완성)"
  - "이벤트 4: Planning → Daily Scrum → Review → Retrospective, Timebox 엄수"
  - "산출물 3: Product Backlog, Sprint Backlog, Increment + 팀 공통 DoD"
qa:
  - q: "Scrum의 역할·이벤트·산출물을 설명해 보라."
    a: "역할은 제품 백로그와 우선순위, ROI를 책임지는 Product Owner, 프로세스를 촉진하고 장애물을 치워 팀을 보호하는 Scrum Master, 설계·구현·테스트로 Increment를 완성하는 Development Team이다. 이벤트는 Sprint Planning, Daily Scrum, Sprint Review, Retrospective를 Sprint마다 반복한다. 산출물은 우선순위화된 전체 요구사항인 Product Backlog, 이번 Sprint 항목과 Task 계획인 Sprint Backlog, 완료 기준(DoD)을 충족한 결과물의 합인 Increment다."
  - q: "Daily Scrum은 어떻게 진행하나? 문제를 그 자리에서 푸나?"
    a: "매일 같은 시간에 15분을 넘지 않게, 시간을 지키려 서서 진행한다. 어제 한 일, 오늘 할 일, 장애물을 돌아가며 공유하고 Sprint Board로 상태를 같이 본다. 장애물은 발견만 하고 해결 논의는 끝난 뒤 별도 회의(SoS Meeting)로 분리하며, 한 사람이 발언을 독점하지 않도록 SM이 진행을 돕는다."
  - q: "Sprint Review와 Retrospective의 차이는?"
    a: "Review는 제품을 보는 자리로, 동작하는 결과물을 이해관계자에게 데모하고 피드백을 받는다. 미완성 Task가 있으면 솔직히 공유하고 다음 계획에 반영한다. Retrospective는 팀이 일하는 방식을 보는 자리로, Keep·Problem·Try로 회고해 액션 아이템을 다음 Sprint에 넣는다. 실습에서는 Day1 계획 대비 Day2 실행의 갭이 추정 오류인지 기술 난이도인지 먼저 분석한 뒤 Retro를 했다."
related:
  - agile-vs-waterfall
  - user-story-backlog
  - sprint-planning-estimation
source: "2026-08-26 교재 p.10–16 (Scrum values, 구조, 산출물, 이벤트 가이드, 2주 캘린더, Daily 예시, Agile Delivery 공정), p.30 (Daily Scrum) · 2026-08-27 교재 p.89–92 (Review 가이드, 갭 분석, Retro 대본)"
---

```flow
Sprint Planning :: 2시간(2주 Sprint 기준), 전체 팀 — 목표 합의 → Backlog 선택 → Task 분할
Daily Scrum :: 15분, Dev팀 + SM — 어제 / 오늘 / 장애물 (발견만, 해결은 별도)
Sprint Review :: 1시간, 전체 + 이해관계자 — 동작하는 결과물 데모, 피드백 수집
Retrospective :: 45분, 전체 팀 — Keep / Problem / Try → 다음 Sprint에 반영
```

| 구분 | 항목 | 핵심 |
| --- | --- | --- |
| 역할 | Product Owner | 제품 백로그 소유·관리, 우선순위 결정, ROI 책임 |
| 역할 | Scrum Master | 타임박스 관리, 진행 촉진, 장애물 제거, 팀 보호 |
| 역할 | Development Team | 기능 설계·구현·테스트, 추정 참여, 상호 리뷰 |
| 산출물 | Product Backlog | 우선순위화된 전체 요구사항, 지속 정제(Refinement) |
| 산출물 | Sprint Backlog | 이번 Sprint에 고른 항목 + 구현 Task 계획 |
| 산출물 | Increment | Sprint 종료까지 완료된 항목의 합, DoD 충족 필수 |

- Scrum 5 values: Courage, Focus, Commitment, Respect, Openness
- 2주 Sprint 예: Day 1 Planning → Day 2–9 개발 + Daily Scrum → Day 10 Review + Retro
- Agile Delivery 공정: 현실적인 SI 프로젝트에 맞게 실행 단계 앞에 착수·준비 단계(Sprint 0 — Scrum 팀·환경 구성, Product Backlog 도출, Release Planning)를 추가한 커스터마이징

> [!tip] Timebox가 핵심
> 이벤트마다 시간을 정하고 지키는 것이 Scrum 운영의 핵심. 논의가 길어지면 별도 회의로 떼어내 해당 이벤트 시간을 지킨다. Sprint Planning도 Sprint 주기(2~4주)에 따라 4~8시간을 넘기지 않는다.
