---
title: 인증서버와 API Gateway (OAuth 2.0 · JWT)
en: Authorization Server, API Gateway, OAuth 2.0, JWT, JWK
summary: "로그인은 인증서버가 JWT로 발급하고, 모든 요청은 Gateway가 공개키로 검증한 뒤 사용자 정보를 헤더로 넘긴다"
importance: 3
order: 10
tags:
  - MSA
  - 인증
  - OAuth2
  - Spring Cloud Gateway
keypoints:
  - "Gateway = 단일 진입점: 라우팅 + 인증 필터 + 로깅, 프론트는 8080만 앎"
  - "발급자(Auth Server)와 검증자(Gateway·서비스) 분리 — RSA 서명, JWK 공개키"
  - "사용자는 Authorization Code, 서비스 간 호출은 Client Credentials + scope"
qa:
  - q: "MSA에서 API Gateway가 하는 일은?"
    a: "모든 클라이언트 요청의 단일 진입점으로, 경로에 따라 Eureka에서 대상 서비스를 찾아 라우팅하고(lb://), 인증 필터에서 JWT를 검증하고, 로깅·CORS 같은 공통 관심사를 한곳에서 처리한다. 덕분에 프론트는 서비스가 몇 개로 나뉘었는지 몰라도 Gateway 주소 하나만 알면 된다. 실습에서는 검증 후 토큰 클레임을 X-User-Id 같은 헤더로 바꿔 넘겨, 서비스마다 JWT 파싱 코드를 중복으로 넣지 않았다."
  - q: "MSA에서 JWT는 어떻게 검증하나? 단일 서버와 무엇이 다른가?"
    a: "단일 서버는 토큰을 발급한 서버가 검증까지 하지만, MSA에서는 인증서버가 RSA 개인키로 서명해 발급하고 Gateway와 각 서비스는 인증서버의 JWK Set URI에서 공개키를 받아 검증한다. 검증은 공개키 확보, 토큰 헤더의 kid로 서명키 선택, 서명·발급자(iss)·만료(exp) 확인 순이다. 그래서 issuer, jwk-set-uri, client-id, scope, grant type, 헤더 전달 방식이 시스템 전체에서 맞아야 하고, 인증은 기능이 아니라 '시스템 전체의 계약'이 된다."
  - q: "Gateway가 이미 검증했는데 서비스도 다시 검증해야 하나?"
    a: "하는 편이 안전하다. 서비스 포트가 외부에 열려 있으면 Gateway를 우회해 헤더를 직접 붙여 다른 사용자 행세를 할 수 있다. 실습 환경에서 같은 경로를 Gateway(8080)로 부르면 401, 서비스 포트(8082)로 직접 부르면 200이 돌아오는 것을 확인했다. 그래서 외부에는 Gateway만 노출하고, 서비스도 Resource Server로 토큰과 scope를 스스로 검증하는 제로 트러스트 방식을 쓴다."
related:
  - msa-components
  - service-discovery-eureka
  - solid-principles
source: "2026-08-27 교재 p.67–70 (인증서버 & API Gateway, Sprint 1 Planning, OAuth 인증서버 구현 프로세스, 라우팅·인증 필터 데모) · 실습 가이드 1 (인증 흐름 보완 설명) · 실습 가이드 3 (auth-server · api-gateway 구성, 트러블슈팅) · 개인 서브노트 Ch.1 §3–4, 부록 1"
---

```flow
① 로그인 :: 프론트 → /oauth2/authorize, 인증서버 화면에서 ID·PW 입력
② 인가 코드 :: redirect_uri로 code 전달 (Authorization Code Grant)
③ 토큰 교환 :: POST /oauth2/token → access_token (RSA 서명된 JWT)
④ API 호출 :: Authorization: Bearer JWT → Gateway (8080)
⑤ Gateway 검증 :: JWK 공개키로 서명·iss·exp 확인 → X-User-Id·Email·Role 헤더로 변환
⑥ 서비스 처리 :: lb://서비스명으로 라우팅, 서비스는 헤더의 userId로 업무만 처리
```

```compare
사용자 인증 | 서비스 간 인증
Grant Type | Authorization Code | Client Credentials
주체 | 사람 (브라우저) | 서비스 자신
검증 지점 | Gateway가 검증 후 클레임을 헤더로 전파 | 각 서비스가 scope(service.read) 확인
대표 경로 | /api/enrollments | /api/**/internal/**
```

```yaml
# 각 서비스(Resource Server) 설정 — 발급자와 공개키 위치만 알면 검증 가능
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://auth-server:9000/oauth2/jwks   # 공개키 목록 (JWK Set)
          issuer-uri: http://auth-server:9000                # iss 클레임 검증
```

- Gateway 필터 순서: LoggingFilter(-2) → JwtAuthenticationFilter(-1), 공개 경로는 /users/register, /users/login, /oauth2/**
- 실습 범위 조절: OAuth2 확장·서비스 간 인증·JWK는 난이도가 높아 auth-server·api-gateway는 이미지로만 배포, 학생은 "로그인하면 토큰이 나오고 헤더에 넣으면 API가 동작한다"는 사용법만 알면 됨
