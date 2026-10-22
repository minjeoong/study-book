---
summary: Vue 3 Composition API로 반응형 SPA를 만드는 법 — 디렉티브·컴포넌트 통신부터 Router, Pinia, Axios, Vite 빌드·배포까지 날씨 대시보드로 실습
keywords:
  - Vue 3
  - MVVM
  - Virtual DOM
  - SPA
  - CSR
  - SSR
  - SFC
  - Composition API
  - 디렉티브
  - v-model
  - ref
  - reactive
  - computed
  - watch
  - 라이프사이클
  - Props
  - Emit
  - Slot
  - Vue Router
  - Navigation Guard
  - Pinia
  - JWT
  - Axios
  - REST API
  - Element Plus
  - ES6+
  - Vite
  - ESLint
  - 환경 변수
materials:
  - file: slides-vue.pdf
    title: "강의 슬라이드 — Front-end Framework Vue.js"
    type: slides
    date: 2026-07-31
  - file: submission-vue.zip
    title: "과제 제출 — Vue.js 실습"
    type: lab
    date: 2026-07-31
---

## 한눈에 보기

```flow
Vue 시작 :: MVVM, Virtual DOM, SPA·CSR, Vite 프로젝트
템플릿 문법 :: 디렉티브, 이벤트, v-model
Composition API :: ref·reactive, computed·watch
컴포넌트 :: 라이프사이클, Props·Emits·Slot
SPA 인프라 :: Vue Router, Pinia, Axios, Element Plus
실무 마무리 :: Modern JS, ESLint·Prettier, 환경 변수, 빌드·배포
```

- HTML·CSS·JS 과목에서 직접 하던 "상태 바꾸고 renderCars() 다시 그리기"를 Vue의 반응성이 자동으로 해 준다는 것이 출발점.
- 문법(디렉티브, v-model) → Composition API(ref, computed, watch) → 컴포넌트 통신(Props, Emits, Slot) → SPA 인프라(Router, Pinia, Axios) → 빌드·배포 순으로 쌓아 올림.
- 과제 하나(날씨 대시보드)를 Mockup부터 매 단원 확장해 최종적으로 OpenWeatherMap 실데이터를 쓰는 SPA로 완성하는 구조.

## 수업 흐름

일차 구분은 과제 제출 README의 일차별 체크리스트 기준. 슬라이드 275쪽, 실습 소스는 skala-vue 저장소.

**Day 1 (07-31)** — 시작하기, Vue 문법, Composition API, 컴포넌트

- 1\. Vue.js 시작하기 (p.7–38): Vue 개요·역사, MVVM, Vue·React·Angular 비교, Virtual DOM, 양방향 바인딩, 컴포넌트 기반, CSR vs SSR, SPA vs MPA, 개발환경(WSL, fnm·Node.js, VS Code 확장, Vue Devtools, Postman), `npm create vue@latest`, 도구 유형·Vite·npm
- 2\. Vue 문법 (p.39–98): 프로젝트 구조(index.html → main.js → App.vue), SFC, Options vs Composition API, 보간법, 디렉티브 전체, v-on·이벤트 객체·수식어, v-model·수식어, scoped style → 과제 날씨 Mockup
- 3\. Composition API (p.99–126): ref, reactive, computed 캐싱, watch(다중·deep·게터), watchEffect → 과제 날씨(컴포지션)
- 4\. Vue Component (p.127–158): 지역·전역 등록, 라이프사이클 훅, Props·Emits, Provide·Inject, Slot 3종 → 과제 날씨(컴포넌트 4개로 분리)

**Day 2 (08-03)** — Vue Router (p.159–177)

- 라우터 설정 3단계, Lazy Loading, RouterLink·RouterView, views vs components, useRoute(params, query), useRouter(push, replace, go), Navigation Guard, Catch-all 404 → 과제 Router 활용

**Day 3 (08-04)** — Pinia, Axios, UI 라이브러리

- 6\. Pinia (p.178–191): Store(state, getters, actions), 구축 3단계, storeToRefs, authStore 사례(JWT vs Session, 가드 연동) → 과제 configStore 단위 토글
- 7\. Axios (p.192–209): HTTP 메서드와 CRUD, REST 설계 원칙, JSONPlaceholder·OpenWeather API, Postman, Fetch vs Axios, 인터셉터, Promise vs async/await → 과제 날씨 데이터 연동
- 8\. UI 라이브러리 (p.210–228): Vuetify·Element Plus·PrimeVue 비교, Element Plus 설치·컴포넌트(Basic, Form, Data, Navigation, Feedback), ElMessage·ElMessageBox 실습 → 과제에 Element Plus 적용

**Day 4 (08-05)** — Modern JavaScript, 빌드·배포

- 9\. Modern JavaScript (p.229–250): ECMAScript 역사, Babel·Polyfill, let·const, 화살표 함수, 템플릿 리터럴, 구조 분해, Spread·Rest, Promise·async/await, ES6+ 배열·객체 기능, ?.·?? → 과제 확장
- 10\. Vite 빌드 및 실무 배포 (p.251–274): ESLint(정적 분석, 커스텀 규칙), Prettier, vite.config.js(server, build), 환경 변수(VITE_, --mode), 번들링과 dist → 과제 완성(ESLint 에러 0, API 키 환경 변수, GitHub Pages)

## 실습 정리

**과제 — 날씨 대시보드 (단원마다 확장, 본인 GitHub Public 저장소로 제출)**

| 단계 | 요구사항 | 핵심 기술 |
| --- | --- | --- |
| Mockup | 날씨 배열 v-for(:key=id), 25도 기준 라벨, 한글 도시 검색, 카드 선택 상태바, 상세보기 alert(버블링 없이) | v-for, v-if, :value + @input, @click.stop |
| 컴포지션 | 검색어 필터링 filteredWeatherList, 선택 도시 watch 로그, 검색어 watchEffect 로그, 결과 없음 안내 | ref, computed, watch, watchEffect |
| 컴포넌트 | WeatherParent, BaseDashboardCard(slot), SearchBar(update-query), WeatherCard(select-card, click-detail)로 분리 | Props, Emits, Slot, style scoped |
| Router | 지연 로딩, Catch-all 404, 내비게이션 바, 상세보기 → router.push('/weather/' + id), 상세 페이지 | Vue Router, 동적 경로 |
| Store | configStore(unit, unitSymbol, toggleUnit), 단위 토글 버튼, 메인·상세에 섭씨·화씨 반영 | Pinia, computed |
| 데이터 연동 | Axios 설치, OpenWeatherMap API 키 발급·연동 | Axios, async/await |
| Element Plus · 완성 | UI 라이브러리 적용, ESLint 에러 0, API 키 환경 변수 + Git 제외, dist를 GitHub Pages로 | Element Plus, ESLint, .env, vite build |

**제출물 — vue.0731 (Vue 3 + Vite + Vue Router 4 + Pinia + Axios + Element Plus)**

- 구조: `api/`(axios 인스턴스 + 날씨·예보 조회 함수), `components/home`·`shared`, `views/`(intro, home, detail, about, NotFound), `stores/configStore.js`, `router/index.js`, `util/`(시간 포맷, 날씨 아이콘 코드 → 하늘 그라디언트)
- 요구사항 외 추가: macOS Weather 앱 UI(사이드바 + 상세 패널), 검색 300ms debounce, MacWindowLayout 슬롯으로 App.vue 분리, 인트로 라우트 분리 + sessionStorage 가드, iPhone 잠금화면 인트로 애니메이션, 현재 위치 날씨 토스트(geolocation + ElNotification)
- 상태 처리: 목록은 스켈레톤·`el-alert`·`el-empty`, 상세 패널 전체에 `v-loading` — 로딩 마스크를 일부 컴포넌트가 아니라 패널 전체에 걸어야 이전 도시 데이터가 남지 않음
- 배포: `npm run build`로 dist 생성까지 확인, GitHub Pages 워크플로는 미구성 (base 경로, 하위 경로 새로고침 404 처리 필요)

핵심 코드 — 검색 debounce (입력값과 필터 기준 값을 분리)

```js
const searchQuery = ref('')          // 입력창과 연결
const debouncedQuery = ref('')       // 실제 필터링 기준
let debounceTimer = null

watch(searchQuery, (value) => {
  clearTimeout(debounceTimer)
  if (value === '') { debouncedQuery.value = ''; return }
  debounceTimer = setTimeout(() => { debouncedQuery.value = value }, 300)
})
const isFiltering = computed(() => searchQuery.value !== debouncedQuery.value)  // "입력 중..." 표시
```

핵심 코드 — 인트로는 첫 진입(홈)일 때만, 404 등 다른 경로는 바로 렌더링

```js
router.beforeEach((to) => {
  if (to.name === 'intro') return true
  if (to.name === 'home' && !hasFinishedIntro()) {   // sessionStorage 'weather-intro-done'
    return { name: 'intro', replace: true }
  }
  return true
})
```
