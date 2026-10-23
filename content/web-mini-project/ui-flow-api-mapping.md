---
title: UI 흐름과 API 매핑
en: UI Flow ↔ API Mapping
summary: 화면마다 사용자의 행동과 그때 호출되는 API를 짝지어, 기획서만 보고도 프론트와 백엔드가 같은 그림을 그리게 하는 설계 문서
importance: 2
order: 3
tags: [UI Flow, 화면 설계, API, 다단계 폼]
keypoints:
  - 화면 15개마다 "무엇을 누르면 → 어떤 API → 어떤 결과"를 한 장에 적었다
  - 사고 등록은 3단계 폼 — 1·2단계 값은 화면에 임시 보관, 3단계에서 한 번에 POST
  - 확인 이력이 없을 때만 "내 유출 여부 확인" 버튼을 보여 주는 식으로 상태별 화면을 나눴다
qa:
  - q: 다단계 등록 폼에서 단계마다 서버에 저장하지 않은 이유는?
    a: '단계마다 저장하면 중간에 이탈한 미완성 사고가 DB에 남고, 임시 저장 상태까지 따로 관리해야 합니다. 그래서 1단계 기본 정보와 2단계 유출 항목은 화면 상태로 들고 있다가, 3단계에서 보상정책과 피해 대상 해시까지 POST /companies/me/incidents 한 번으로 보내고 그 순간 사고를 심사중 상태로 만들었습니다. 대신 새로고침하면 입력이 사라지므로, 구현할 때는 sessionStorage 임시 저장 같은 보완이 필요합니다.'
  - q: UI 흐름에 API를 같이 적으면 좋은 점은?
    a: '화면의 버튼 하나가 어떤 요청을 보내고 무엇을 응답받는지 정해져 있어서, 프론트엔드와 백엔드가 같은 문서를 보고 병렬로 작업할 수 있습니다. 화면 기준으로 훑으면 빠진 API나 쓰이지 않는 API도 바로 드러납니다.'
related: [system-actors-roles, rest-api-resource-design, web-basics/form-validation, vue/vue-router]
source: 개요 PDF p.16–31 (UI FLOW 화면 15개), p.20 (사고 상세 · 내 유출 여부 확인), p.24 (유출 사고 등록 3단계). sessionStorage 보완은 면접 대비 일반 지식
---

유출 사고 등록 — 3단계 폼 (기업 담당자)

```flow
1단계 기본 정보 :: 제목 · 사고 개요 · 발생 시각, 화면 안에 임시 보관
2단계 유출 항목 :: 이름 · 휴대폰 · 이메일 · 주소 · 주민번호 · 비밀번호 · 카드 · 계좌 등 선택 + 추정 영향 인원
3단계 최종 제출 :: 보상정책 + 피해 대상 이메일(→ SHA-256 해시) + 공지문 미리보기
POST /companies/me/incidents :: 세 단계 값을 한 번에 전송, 상태 = 심사중
```

| 액터 | 화면 | 호출 API |
| --- | --- | --- |
| 공통 | 로그인 · 회원가입 (역할 탭) | `POST /members/login` · `/members/signup` · `/companies/signup` |
| 사용자 | 홈 — 내 유출 현황 | `GET /members/me/exposure-checks` (최신순) |
| 사용자 | 사고 탐색 | `GET /incidents?keyword=&category=` (승인된 사고만) |
| 사용자 | 사고 상세 | `GET /incidents/{incidentId}` → `POST …/exposure-check` |
| 사용자 | 비밀번호 변경 체크 | `GET` · `POST /members/me/password-checks` |
| 사용자 | 마이페이지 · 1:1 문의 | `GET /members/me` · `POST /members/me/inquiries` |
| 기업 | 등록한 사고 목록 · 상세 | `GET /companies/me/incidents?status=` · `GET …/{incidentId}` |
| 기업 | 사고 등록 3단계 | `POST /companies/me/incidents` |
| 기업 | 반응 통계 · 보상 관리 | `GET …/{incidentId}/stats` · `PATCH …/compensation-policies/{policyId}` |
| 기업 | 반려 사고 수정 · 재제출 | `PUT /companies/me/incidents/{incidentId}` |
| 관리자 | 기업 가입 승인 큐 | `GET /admin/companies/pending` · `PUT …/approve` · `…/reject` |
| 관리자 | 사고 심사 큐 | `GET /admin/incidents/pending` · `PUT …/approve` · `…/reject` |
| 관리자 | 전사 통계 | `GET /admin/stats/incidents` (월별 · 항목별 · 기업별) |
| 관리자 | 문의 관리 | `GET /admin/inquiries` · `PUT …/{inquiryId}/answer` |

> [!note] 비밀번호 변경 체크는 "기록"
> 실제로 비밀번호가 바뀌었는지는 검증하지 않고, 사용자가 고른 서비스의 변경 완료 시각만 저장한다. 비밀번호 값은 저장하지 않는다.
