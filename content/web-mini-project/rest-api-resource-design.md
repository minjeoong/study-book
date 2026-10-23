---
title: 액터별 REST API 설계
en: REST API Design by Actor (OpenAPI 3.0)
summary: 엔드포인트 32개를 Company · Admin · Member · Incident(Public) 4개 태그로 나누고, /me 경로와 메서드 · 상태 코드로 권한과 행위를 드러낸 OpenAPI 명세
importance: 3
order: 6
tags: [REST, API 설계, OpenAPI, Swagger, HTTP 메서드]
keypoints:
  - 경로 앞부분으로 액터를 구분 — /companies/me, /admin, /members/me, 공개 /incidents
  - /me는 로그인한 "나의 것"만 다룬다 — 남의 ID를 경로에 받지 않아 권한 실수를 줄인다
  - 전체 교체는 PUT(반려 사고 재제출), 필드 하나 변경은 PATCH(보상 지급 상태)
qa:
  - q: /members/me 같은 경로를 쓴 이유는?
    a: '/members/{memberId}처럼 ID를 경로로 받으면 다른 사람 ID를 넣은 요청을 매번 권한 검사로 막아야 합니다. /me는 서버가 인증 정보에서 현재 사용자를 꺼내 쓰므로 클라이언트가 남의 자원을 지정할 방법이 없습니다. 그래서 내 알림, 내 확인 이력, 내 문의는 모두 /members/me 아래에 두고, 기업 담당자도 /companies/me/incidents로 자기 회사 사고만 보게 했습니다.'
  - q: 승인·반려를 PUT /approve, /reject로 만든 이유와 다른 방법은?
    a: '승인과 반려는 단순한 필드 수정이 아니라 상태 전이와 알림 생성 같은 부수 효과가 있는 행위라서, 의도가 바로 보이도록 행위 이름을 하위 경로로 두었습니다. 자원 중심으로 더 엄격하게 하면 PATCH /admin/incidents/{id}에 상태를 보내거나, POST /admin/incidents/{id}/reviews처럼 심사 기록을 새 자원으로 만드는 방법도 있습니다. 심사 이력을 review_log로 쌓는 설계와는 POST reviews 방식이 더 잘 맞습니다.'
  - q: PUT과 PATCH는 어떻게 구분했나요?
    a: 'PUT은 자원 전체를 새 값으로 바꾸는 요청이라, 반려된 사고를 고쳐 다시 제출할 때 기본정보·유출 항목·보상정책을 통째로 보내는 PUT /companies/me/incidents/{id}에 썼습니다. 보상 지급 상태처럼 필드 하나만 바꿀 때는 PATCH /…/compensation-policies/{policyId}를 썼습니다.'
related: [ui-flow-api-mapping, error-scenarios-status-codes, spring-rest/rest-api, vue/axios-rest-api]
source: 개요 PDF p.34–37 (API 명세 정의 — OAS 3.0, 4개 태그, 엔드포인트와 응답 코드). 대안 설계(PATCH 상태 변경, POST reviews)는 면접 대비 일반 지식
---

| 태그 | 대상 | 개수 | 대표 엔드포인트 |
| --- | --- | --- | --- |
| Company | 기업 담당자 | 8 | `POST /companies/me/incidents` · `GET …/{incidentId}/stats` · `PATCH …/compensation-policies/{policyId}` |
| Admin | 플랫폼 관리자 | 11 | `GET /admin/incidents/pending` · `PUT …/{incidentId}/approve` · `GET /admin/stats/incidents` |
| Member | 일반 사용자 | 11 | `GET /members/me/alerts` · `POST /incidents/{incidentId}/exposure-check` · `POST /members/me/password-checks` |
| Incident (Public) | 누구나 | 2 | `GET /incidents?keyword=&category=` · `GET /incidents/{incidentId}` |

```compare
POST | PUT | PATCH
의미 | 새 자원 생성 · 처리 요청 | 자원 전체 교체 | 일부 필드만 변경
멱등성 | 없음 | 있음 | 설계에 따라 다름
이 프로젝트 | 회원가입, 사고 등록, 해시 대조, 문의 등록 | 반려 사고 재제출, 승인 · 반려, 문의 답변 | 보상 지급 상태 변경
```

> [!note] 명세 범위
> Swagger UI(OAS 3.0)로 문서화했고, 인증 · 인가(Security Schemes)는 평가 범위 밖이라 명세에 넣지 않았다. 대신 엔드포인트마다 응답 코드(200 · 201 · 400 · 401 · 403 · 404 · 409)를 적었다.
