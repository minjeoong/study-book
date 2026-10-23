---
title: 데이터 모델 설계 (ERD)
en: Data Modeling / ERD
summary: 계정 · 사고 · 보상 · 피해 해시 · 확인 결과 · 감사 로그를 테이블 13개로 나눠, 누가 무엇을 만들고 어떤 이력을 남기는지 구조화
importance: 3
order: 4
tags: [ERD, 데이터 모델링, 1:N, 감사 로그, Enum]
keypoints:
  - 회사(company)와 로그인 계정(company_account)을 분리해 1기업 : N계정 구조
  - 사고(incident)를 중심으로 유출 항목 · 보상정책 · 피해 해시 · 심사 로그가 1:N으로 붙는다
  - 상태는 Enum 컬럼으로, 승인 · 반려 판단 이력은 review_log에 감사 로그로
qa:
  - q: 회사와 기업 담당자 계정을 왜 나눴나요?
    a: '한 회사에 담당자가 여러 명이거나 담당자가 바뀔 수 있기 때문입니다. company에는 사업자번호·대표자 같은 회사 정보만, company_account에는 이메일·비밀번호 해시·승인 상태 같은 로그인 정보를 두고 company_id FK로 1:N 연결했습니다. 사고는 계정이 아니라 회사에 속하게 해서 담당자가 바뀌어도 사고 이력이 유지됩니다.'
  - q: 유출 항목을 incident 컬럼이 아니라 별도 테이블로 둔 이유는?
    a: '한 사고에서 이름, 이메일, 주소처럼 여러 항목이 유출될 수 있어서, 컬럼 하나에 콤마로 넣으면 1정규형을 깨고 "이메일이 유출된 사고" 같은 검색이 어려워집니다. incident_data_category를 사고와 1:N으로 두고 category를 Enum으로 관리하면 항목별 필터와 통계가 쉬워집니다.'
  - q: 감사 로그(review_log)는 왜 따로 두었나요?
    a: 'incident.status에는 현재 상태만 남기 때문에 누가 언제 왜 승인하거나 반려했는지는 사라집니다. review_log에 admin_id, action, reason, reviewed_at을 쌓아 두면 반려와 재제출이 반복돼도 심사 이력을 추적할 수 있고, 분쟁이 생겼을 때 근거가 됩니다.'
related: [hash-matching-exposure-check, review-state-machine, smart-data/relational-model-erd, smart-data/normalization]
source: 개요 PDF p.32–33 (데이터 모델 설계 — 개체 정의, 개체 속성, ERD, 정보유출 대상 확인 설계 포인트)
---

```layers
계정 :: company · company_account (1기업 : N계정) · admin · member
사고 :: incident — company_id, status, rejection_reason, occurred_at, disclosed_at, estimated_affected_count
사고 부속 (1:N) :: incident_data_category · compensation_policy · incident_affected_identifier
심사 :: review_log — admin_id, action, reason, reviewed_at
사용자 활동 :: incident_alert · exposure_check · password_change_check · inquiry
```

| 테이블 | 무엇을 저장 | 핵심 컬럼 |
| --- | --- | --- |
| company | 유출 사고를 등록하는 기업 | name, biz_no, ceo_name, logo_url |
| company_account | 기업 담당자 로그인 계정 | company_id, email, password_hash, approval_status, approved_at |
| admin · member | 운영자 · 일반 사용자 계정 | email, password_hash, name / nickname |
| incident | 개인정보 유출 사건 | status, summary, occurred_at, disclosed_at, submitted_at, reviewed_at |
| incident_data_category | 사고별 유출 항목 | incident_id, category (Enum) |
| compensation_policy | 사고별 보상 정책과 지급 현황 | type, amount, description, status |
| incident_affected_identifier | 기업이 낸 피해 대상 식별값 | incident_id, identifier_hash char(64) |
| review_log | 관리자 승인 · 반려 감사 로그 | incident_id, admin_id, action, reason |
| incident_alert | 해시 일치 사용자 알림 | incident_id, member_id, status, notified_at, checked_at |
| exposure_check | 해시 대조 결과 | incident_id, member_id, status (AFFECTED / NOT_AFFECTED) |
| password_change_check | 서비스별 비밀번호 변경 "완료 여부" | member_id, company_id, checked_at |
| inquiry | 1:1 문의와 관리자 답변 | member_id, title, content, status, answer, answered_at |

> [!tip] 면접 팁
> "현재 상태는 행에, 이력은 로그 테이블에"라는 한 문장으로 incident.status와 review_log를 나눈 이유를 설명할 수 있다.
