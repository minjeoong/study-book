---
title: 다음 단계 — 인증 · 통계 성능 · 알림 확장
en: Next Steps — Auth, Aggregation Performance, Notifications
summary: 설계 범위에서 남겨 둔 세 가지 — 식별 헤더를 JWT/세션 인증으로, 매 요청 집계를 배치 · 캐시로, 인앱 알림을 외부 채널로
importance: 2
order: 9
tags: [JWT, 세션, 집계 성능, 캐시, 배치, 알림]
keypoints:
  - 지금은 식별 헤더로 사용자를 구분 — JWT/세션 인증으로 바꾸고 Security Schemes를 명세에 포함
  - 통계 API는 요청마다 전체를 집계 — 데이터가 커지면 배치 · 캐시 집계 테이블로
  - 알림은 인앱(IncidentAlert)만 — 이메일 · 푸시 · 문자 채널로 확장
qa:
  - q: 이 설계의 한계와 개선 계획은?
    a: '세 가지를 남겨 두었습니다. 첫째, 인증·인가를 평가 범위 밖으로 두고 식별 헤더로 사용자를 구분했기 때문에 실제 서비스라면 JWT나 세션 인증으로 바꾸고 OpenAPI Security Schemes에 정식으로 넣어야 합니다. 둘째, 통계 API가 요청마다 전체 데이터를 집계하므로 데이터가 커지면 배치로 미리 집계한 테이블이나 캐시를 써야 합니다. 셋째, 지금은 인앱 알림만 만들어서 이메일·푸시·문자 같은 외부 채널 연동이 필요합니다.'
  - q: JWT와 세션 중 무엇을 고르겠나요?
    a: '세션은 서버가 로그인 상태를 들고 있어서 강제 로그아웃이나 계정 차단을 바로 반영하기 쉽습니다. JWT는 서버가 상태를 갖지 않아 여러 서버·모바일로 확장하기 좋지만, 발급한 토큰을 중간에 무효화하기 어려워 짧은 Access Token과 Refresh Token을 함께 씁니다. 이 서비스는 관리자처럼 권한이 큰 계정이 있어서, 확장이 필요하면 JWT를 쓰되 Refresh Token을 서버에 저장해 즉시 차단할 수 있게 하겠습니다.'
related: [rest-api-resource-design, hash-matching-exposure-check, agile-msa/auth-server-gateway]
source: 개요 PDF p.40 (다음 단계 고려사항), p.35 (Security Schemes를 평가 범위에서 제외). JWT · 세션 비교는 면접 대비 일반 지식
---

```compare
지금 | 다음 단계
인증 · 인가 | 식별 헤더, 명세에서 Security Schemes 제외 | JWT / 세션 인증, Security Schemes 정식 명세
통계 집계 | 요청마다 전체 데이터 집계 | 배치 · 캐시 집계 테이블
알림 | 인앱 알림(IncidentAlert)만 생성 | 이메일 · 푸시 · 문자 외부 채널 연동
```

> [!tip] 면접 팁
> "한계를 알고 있었고, 무엇을 먼저 바꿀지 순서도 정해 두었다"가 핵심이다. 실제 사용자가 생긴다면 인증 → 알림 채널 → 집계 성능 순으로 손대겠다고 우선순위까지 말하면 좋다.
