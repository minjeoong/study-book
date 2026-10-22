---
title: Release·Sprint Planning과 Story Point
en: Release Planning, Sprint Planning, Story Point, Velocity
summary: "MoSCoW로 우선순위를 정해 릴리즈를 나누고, Sprint마다 목표 → 백로그 선택 → Task 분할 → 추정·배분, 크기는 상대적 Story Point로"
importance: 3
order: 4
tags:
  - Agile
  - Scrum
  - 추정
keypoints:
  - "MoSCoW(Must·Should·Could·Won't) 우선순위 → Release별 Epic 배치"
  - "Sprint Planning: 목표 합의 → Backlog 선택 → Task 분할 → 추정·배분"
  - "Story Point = 시간이 아닌 상대 크기(피보나치), 실제 처리량은 Velocity"
qa:
  - q: "Story Point를 시간 대신 쓰는 이유는?"
    a: "사람마다 속도가 달라 시간 추정은 빗나가기 쉽지만, '기준 스토리보다 두 배쯤 크다' 같은 상대 비교는 팀이 합의하기 쉽다. 피보나치 수열(1, 2, 3, 5, 8)로 매겨 클수록 불확실성이 크다는 것을 반영하고, Planning Poker로 함께 추정해 규모에 대한 공통 이해를 만든다. 실제로 Sprint마다 끝낸 양은 Velocity로 기록해 다음 계획을 보정한다."
  - q: "Sprint Planning은 어떤 순서로 하나?"
    a: "PO가 이번 Sprint 목표를 한 문장으로 제안해 팀이 합의하고, 우선순위 상위 스토리 중 이번 Sprint에 넣을 항목을 고르고, 구현 가능한 Task로 쪼갠 뒤, Task별 담당자와 예상 소요를 팀이 함께 배분한다. 팀원은 자율적으로 일감을 고르고, 작업량이 너무 많거나 적으면 개발팀이 PO와 백로그를 재협상할 수 있다. 핵심은 이 순서를 지키는 것이다."
  - q: "계획보다 오래 걸린 Task가 생기면?"
    a: "Review에서 미완성을 솔직히 공유하고 다음 Sprint로 이월한다. Retro 전에 원인이 추정 오류였는지 기술 난이도였는지 갭 분석을 하고, 낯선 기술은 Spike(사전 조사) Task를 따로 두거나 Point를 보수적으로 잡아 추정 기준을 보완한다. 우리 팀도 Sprint 2에서 계획 18점 중 13점만 끝내, 마이페이지 추천 스토리(5점)를 다음 Sprint 첫 작업으로 이월했다."
related:
  - user-story-backlog
  - scrum-framework
source: "2026-08-26 교재 p.24–29 (Release Planning 1–4, Sprint Planning 1–2), p.39–43 (설계 실습: Planning 순서, Task·Point 예시, Board 운영, 실행 로드맵) · 2026-08-27 교재 p.87 (Task 현황판), p.91–92 (갭 분석, Retro)"
---

```flow
비즈니스 우선순위 :: MoSCoW 또는 User 행동 순서로 결정
Release Roadmap :: Release별 Epic 배치 (1차 Open, 2차 Open)
Sprint 일정 :: 주기 2~4주, 전체 기간·출시 계획 고려
Sprint Planning :: 목표 합의 20분 → Backlog 선택 30분 → Task 분할 50분 → 추정·배분 20분
Sprint Board :: To Do → In Progress → Done, 매일 Daily Scrum에서 갱신
```

```formula
Velocity = Σ 완료한 Story Point (Sprint 1회) :: 다음 Sprint에 담을 양의 기준
달성률 = 완료 SP ÷ 계획 SP :: 우리 팀 Sprint 1은 24 ÷ 24 = 100%, Sprint 2는 13 ÷ 18 = 72%
```

| User Story | Task | Point |
| --- | --- | --- |
| 로그인 API 구현 | 인증서버 엔드포인트 개발 | 3 |
| | JWT 토큰 발급 로직 구현 | 2 |
| | 단위 테스트 작성 | 1 |
| Kafka 메시지 발행 | 주문 상태 변경 이벤트 Producer 구현 | 3 |
| | Topic / Consumer 그룹 설정 | 2 |

- MoSCoW: Must have(없으면 출시 불가) · Should have(중요하지만 미룰 수 있음) · Could have(여유되면) · Won't have(이번엔 안 함)
- 실습 로드맵: Sprint 0(Day1) = 백로그 정리 + Sprint 계획, Sprint 1(Day2) = Daily Scrum → 구현 → Review → Retro

> [!tip] 우리 팀의 분할 기준
> "기능을 절반씩"이 아니라 "이 기능이 없으면 서비스 가치를 줄 수 없는가?"로 나눴다. 회원가입 → API 등록 → 조회 → 구독 신청까지가 Sprint 1(MVP), 카테고리 필터·결제·추천은 Sprint 2. 상품이 있어야 구독할 수 있듯, 데이터가 만들어지는 순서가 곧 개발 순서였다.
