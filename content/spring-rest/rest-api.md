---
title: REST API 설계
en: RESTful API, HTTP Method, Status Code
summary: 자원은 URI(명사)로, 행위는 HTTP 메서드로, 결과는 상태 코드와 JSON 표현으로 주고받는 웹 API 설계 스타일
importance: 3
order: 8
tags:
  - REST
  - HTTP
  - API 설계
keypoints:
  - "REST 3요소 — 자원(URI) · 행위(HTTP Method) · 표현(JSON 등)"
  - URI는 명사·복수형·계층, 동작은 GET·POST·PUT·PATCH·DELETE로
  - 무상태 — 서버는 세션을 기억하지 않고 요청마다 인증 정보(JWT)를 받는다
qa:
  - q: REST란 무엇이고 RESTful하게 설계하는 규칙은?
    a: Roy Fielding이 2000년 논문에서 제안한 웹 아키텍처 스타일로, 웹의 자원을 URI로 식별하고 HTTP 메서드로 행위를 표현하며 JSON 같은 표현으로 주고받는다. URI에는 /users/10처럼 명사만 쓰고 /createUser처럼 동사를 넣지 않으며, 포함 관계는 /users/10/orders처럼 계층으로, 필터·정렬은 ?age=20&sort=name처럼 쿼리 파라미터로 표현한다. 처리 결과는 200·201·400·404 같은 상태 코드로 알려 준다.
  - q: POST, PUT, PATCH의 차이는?
    a: POST는 /users에 새 자원을 생성하고, PUT은 /users/3 자원 전체를 보낸 값으로 교체하며, PATCH는 일부 필드만 수정한다. PUT·DELETE는 같은 요청을 여러 번 보내도 결과가 같은 멱등성을 갖지만, POST는 보낼 때마다 새 자원이 생길 수 있어 멱등하지 않다. 생성 성공은 보통 201 Created와 Location 헤더로 응답한다.
  - q: 무상태(Stateless)가 확장에 유리한 이유는?
    a: 서버가 세션 같은 클라이언트 상태를 저장하지 않고, 각 요청이 Authorization 헤더의 JWT처럼 처리에 필요한 정보를 모두 담아 온다. 그래서 어떤 서버 인스턴스가 요청을 받아도 똑같이 처리할 수 있어, 로드밸런서 뒤에 서버를 늘리는 scale-out이 쉽고 장애 시 다른 서버가 이어받기도 쉽다.
related:
  - spring-mvc-flow
  - layered-dto-validation
source: 2부 슬라이드 p.3–21(웹 애플리케이션·Web Server vs WAS·REST 3요소·URI vs URL·6원칙·설계 규칙·API 예시) — Day 3 오후 (08-12); 1부 슬라이드 p.337–347(OSI·TCP/IP·HTTP·URL·HTTP Method), p.359–362(HTTP 요청·응답 메시지)
---

```layers
자원 (Resource) :: 무엇을 — URI로 식별하는 명사 (/users/10, /posts/10/comments)
행위 (HTTP Method) :: 어떻게 — GET 조회 · POST 생성 · PUT 전체 수정 · PATCH 일부 수정 · DELETE 삭제
표현 (Representation) :: 어떤 형태로 — JSON(기본), XML, HTML, 이미지
```

| 기능 | 메서드 | URI | 성공 응답 |
| --- | --- | --- | --- |
| 목록 조회 | GET | /users (?name=alice) | 200 OK |
| 단건 조회 | GET | /users/3 | 200 OK, 없으면 404 Not Found |
| 생성 | POST | /users | 201 Created + Location |
| 전체 수정 | PUT | /users/3 | 200 OK |
| 일부 수정 | PATCH | /users/3 | 200 OK |
| 삭제 | DELETE | /users/3 | 200 OK 또는 204 No Content |
| 잘못된 입력 | — | — | 400 Bad Request (검증 실패) |

| REST 6원칙 | 의미 |
| --- | --- |
| 클라이언트-서버 분리 | UI와 데이터·로직을 나누고 API 계약만 공유 |
| 무상태 | 서버가 세션을 보관하지 않음 → scale-out 쉬움 |
| 캐시 가능 | Cache-Control·ETag로 응답 재사용 |
| 일관된 인터페이스 | URI 식별 · 표준 메서드 · 표준 표현 · 자기서술적 메시지 |
| 계층 구조 | Gateway·LB·인증 서버가 중간에 있어도 클라이언트는 모름 |
| Code on Demand | 서버가 JS 같은 코드를 내려보냄 — 유일한 선택 원칙 |

> [!warn] 헷갈리기 쉬움
> URI는 "무엇(어떤 자원)", URL은 "어디에(위치·접근 방법)"다. URL은 URI의 한 종류이고, `https://example.com/index.html`은 URI이면서 URL이다.
