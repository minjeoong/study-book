---
title: 승인 · 심사 상태 전이 설계
en: Approval Workflow & State Transitions
summary: 기업 계정 · 유출 사고 · 보상정책이 가질 수 있는 상태와 허용되는 전이를 정해, 순서가 맞지 않는 요청은 409로 막는 설계
importance: 2
order: 7
tags: [상태 머신, 워크플로, Enum, 409 Conflict]
keypoints:
  - 사고는 심사중(PENDING) → 승인 또는 반려, 반려된 사고만 고쳐서 다시 PENDING
  - 기업 계정도 PENDING → APPROVED / REJECTED, 승인 전 로그인은 403
  - 보상정책은 지급예정 → 지급중 → 지급완료, 클릭할 때마다 한 단계씩 진행
qa:
  - q: 상태 전이를 왜 명시적으로 설계했나요?
    a: '상태를 아무 값으로나 바꿀 수 있으면 이미 승인돼 공개된 사고를 기업이 몰래 고치는 일이 생길 수 있습니다. 그래서 허용 전이를 정해 두고, 반려된 사고만 수정·재제출할 수 있게 했고 다른 상태에서 수정 요청이 오면 409 Conflict로 거절했습니다. 재제출하면 다시 심사중으로 돌아가 관리자 검토를 한 번 더 거칩니다.'
  - q: 상태 값은 어떻게 저장했나요?
    a: 'incident_status, approval_status, compensation_status처럼 Enum 타입 컬럼으로 두어 정해진 값만 들어가게 했습니다. 현재 상태는 해당 행에, 승인·반려 이력과 사유는 review_log에 따로 쌓아 현재 값과 이력을 분리했습니다.'
related: [privacyon-erd, system-actors-roles, error-scenarios-status-codes]
source: 개요 PDF p.15 (관리자 승인 후에만 사용 가능), p.26 (보상 지급 상태), p.27 (반려 사고 수정과 재제출), p.28–29 (가입 승인 큐, 사고 심사 큐), p.37 (APPROVED 계정만 로그인, REJECTED 상태만 수정·성공 시 PENDING 복귀), p.39 (409). 코드 예시는 면접 대비 일반 지식
---

유출 사고의 상태

```flow
PENDING (심사중) :: POST /companies/me/incidents 로 제출
APPROVED (승인) :: 관리자 승인 — disclosedAt 확정, 공개 + 해시 일치 사용자 알림
REJECTED (반려) :: 관리자 반려 — 사유 필수, review_log 기록
재제출 :: PUT /companies/me/incidents/{id} — REJECTED일 때만, 성공하면 다시 PENDING
```

| 대상 | 상태 흐름 | 막히는 요청 |
| --- | --- | --- |
| 기업 계정 | PENDING → APPROVED / REJECTED(사유) | 승인 전 로그인 → 403 |
| 유출 사고 | PENDING → APPROVED / REJECTED(사유) → 수정 후 PENDING | REJECTED가 아닌 사고 수정 → 409 |
| 보상정책 | 지급예정 → 지급중 → 지급완료 | — |
| 알림 | 생성 → 읽음 (`PUT /members/me/alerts/{alertId}/read`) | — |
| 문의 | 접수 → 답변 완료 (answer, answered_at) | — |

규칙을 엔티티 안에 두면 (예시)

```java
public void resubmit(IncidentUpdateRequest req) {
    if (status != IncidentStatus.REJECTED) {
        throw new ConflictException("반려된 사고만 수정할 수 있습니다");   // → 409
    }
    apply(req);
    status = IncidentStatus.PENDING;
    submittedAt = LocalDateTime.now();
}
```
