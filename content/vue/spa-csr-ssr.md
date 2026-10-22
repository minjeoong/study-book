---
title: SPA와 CSR·SSR
en: Single Page Application, Client/Server-Side Rendering
summary: SPA는 index.html 하나를 받아 JS가 화면을 바꾸는 구조 — Vue 기본은 브라우저가 그리는 CSR, SEO가 중요하면 Nuxt.js로 SSR
importance: 3
order: 2
tags:
  - SPA
  - CSR
  - SSR
  - 렌더링
keypoints:
  - MPA는 이동마다 새 HTML, SPA는 처음 한 번 받고 이후 데이터(JSON)만 주고받음
  - CSR은 초기 로딩이 느리고 SEO 불리, 대신 페이지 전환이 매우 빠름
  - SPA를 받치는 도구 — Vite(빌드), Vue Router(URL), Pinia(상태), Axios(통신)
qa:
  - q: SPA의 장단점은?
    a: 한 번 받은 JS·CSS를 재사용하고 데이터만 주고받아 페이지 이동이 데스크톱 앱처럼 빠르고 트래픽이 줄며, 프론트엔드와 백엔드를 분리해 개발할 수 있습니다. 반면 처음에 큰 JS 번들을 내려받아야 해 초기 로딩이 느리고, 검색 봇이 내용 없는 index.html만 보게 되어 SEO에 불리합니다. 새로고침하면 메모리의 상태가 초기화되는 점도 주의해야 합니다.
  - q: CSR과 SSR의 차이는?
    a: CSR은 서버가 빈 HTML과 JS를 주고 브라우저가 JS를 실행해 화면을 완성하는 방식으로 Vue의 기본 동작입니다. SSR은 서버가 데이터까지 넣은 완성된 HTML을 내려줘 첫 화면이 빠르고 SEO에 유리하지만, 페이지를 옮길 때마다 서버가 다음 페이지를 다시 그려야 합니다. Vue 생태계에서는 Nuxt.js로 SSR을 구현합니다.
related:
  - vue-overview
  - vue-router
  - web-basics/web-http-basics
source: Day1(7/31) 슬라이드 p.15–18 (CSR vs SSR, SPA, MPA vs SPA, SPA 추가 기술 요소와 장단점), Day2(8/3) p.160 (Vue Router와 SPA), 과제 README (정적 호스팅 새로고침 404 주의)
---

```compare
MPA (JSP, PHP, Spring MVC) | SPA (Vue, React + REST API)
페이지 구성 | 요청마다 서버가 새 HTML 전송 | 처음에 index.html 하나 + 큰 JS
페이지 전환 | 전체 새로고침 | JS가 필요한 부분만 교체
렌더링 | 서버 (SSR) | 브라우저 (CSR), 데이터는 API로
초기 로딩 / 전환 | 빠름 / 느림 | 느림 / 매우 빠름
SEO | 유리 | 불리 (SSR로 보완)
```

```flow
최초 접속 :: index.html + JS·CSS 번들 다운로드
앱 초기화 :: main.js가 Vue 앱 생성, 라우터 준비
데이터 요청 :: Axios로 API 호출 → JSON 응답
URL 변경 :: RouterLink 클릭 — 새로고침 없이 주소만 변경
부분 렌더링 :: RouterView 자리의 컴포넌트만 교체
```

> [!warn] 헷갈리기 쉬움
> SPA를 정적 호스팅(GitHub Pages 등)에 올리면 `/weather/1835848` 같은 하위 경로에서 새로고침할 때 서버가 그 파일을 찾다가 404를 낸다. 모든 경로를 index.html로 돌려주는 설정이 필요하다 (과제 README에 배포 주의점으로 정리).
