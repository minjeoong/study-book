---
title: Vue Router
en: Vue Router, Dynamic Route, Navigation Guard
summary: SPA에서 URL과 컴포넌트를 연결하는 공식 라우터 — 새로고침 없이 주소만 바꾸고 RouterView 자리의 페이지 컴포넌트를 교체
importance: 3
order: 11
tags:
  - Vue
  - Router
  - SPA
keypoints:
  - RouterLink는 새로고침 없는 링크, RouterView는 매칭된 페이지 출력 자리
  - useRoute는 현재 주소 정보(params·query), useRouter는 이동 명령(push·replace)
  - beforeEach 가드로 권한 검사, /:pathMatch(.*)* 로 404 처리
qa:
  - q: Vue Router에서 a 태그 대신 RouterLink를 쓰는 이유는?
    a: a 태그는 브라우저 전체를 새로고침해 서버에 새 페이지를 요청하므로 메모리에 있던 ref, computed 같은 반응형 상태가 모두 초기화됩니다. RouterLink는 a 태그로 렌더링되지만 클릭을 가로채 새로고침 없이 주소만 바꾸고, RouterView 영역의 컴포넌트만 교체해 SPA의 빠른 화면 전환을 유지합니다.
  - q: route와 router, params와 query의 차이는?
    a: useRoute로 얻는 route는 현재 활성 경로의 정보 객체로 path, params, query, name을 읽을 때 쓰고, useRouter로 얻는 router는 앱 전체 라우터 인스턴스로 push, replace, go 같은 이동 명령을 내릴 때 씁니다. params는 /weather/:cityId처럼 경로에 박힌 동적 세그먼트이고, query는 ?search=수원처럼 물음표 뒤 key=value라 라우트 설정 없이 붙일 수 있습니다.
  - q: router.push와 replace의 차이는? 네비게이션 가드는 언제 쓰나요?
    a: push는 히스토리 스택에 새 항목을 쌓아 뒤로 가기가 가능하고, replace는 현재 항목을 대체해 뒤로 갈 수 없어 로그인 후 이동이나 인증 만료 리다이렉트에 씁니다. 네비게이션 가드는 이동 직전에 가로채는 훅으로, router.beforeEach에서 meta.requiresAuth인 페이지에 비로그인 사용자가 들어오면 로그인 페이지로 돌려보내는 식으로 씁니다.
related:
  - spa-csr-ssr
  - pinia-store
  - component-lifecycle
source: Day2(8/3) 슬라이드 p.160–177 (Vue Router Basic, Setup 3단계, history·routes·Lazy Loading, RouterLink·RouterView, route·router 정리, views vs components, useRoute, Dynamic Route Matching, Query String, useRouter·Programmatic Navigation, Navigation Guard, Catch-all Route, 과제 Router 활용), 과제 제출물 router/index.js, WeatherDetailView.vue
---

```flow
router/index.js :: createRouter({ history: createWebHistory(), routes })
main.js :: app.use(router)
App.vue :: RouterLink(메뉴) + RouterView(페이지 출력 자리)
views/*View.vue :: URL과 1:1로 매핑되는 페이지 컴포넌트
```

```js
// router/index.js — 과제 제출물 요약
const routes = [
  { path: '/', name: 'home', component: () => import('../views/home/WeatherHomeView.vue') },  // Lazy Loading
  { path: '/weather/:id', name: 'weather-detail', component: () => import('../views/detail/WeatherDetailView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },  // 맨 마지막
]
router.beforeEach((to) => {          // 전역 가드 — 첫 진입(홈)일 때만 인트로로
  if (to.name === 'home' && !hasFinishedIntro()) return { name: 'intro', replace: true }
})

// 컴포넌트 안
const route = useRoute()             // route.params.id, route.query.search
const router = useRouter()           // router.push(`/weather/${city.id}`), router.replace('/'), router.go(-1)
```

> [!warn] 헷갈리기 쉬움
> `/weather/1` → `/weather/2`처럼 params만 바뀌면 Vue Router는 같은 컴포넌트를 재사용해 onMounted가 다시 실행되지 않는다. 과제 상세 페이지는 `watch(() => route.params.id, fetchWeather, { immediate: true })`로 처리했다.
