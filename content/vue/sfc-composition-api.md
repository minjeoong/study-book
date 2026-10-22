---
title: 프로젝트 구조, SFC와 Composition API
en: Single File Component, script setup, Options vs Composition API
summary: .vue 하나에 script setup·template·style을 담는 SFC — 로직은 Vue 3 표준 Composition API로 기능별로 묶는다
importance: 3
order: 4
tags:
  - Vue
  - SFC
  - Composition API
  - script setup
keypoints:
  - 진입 순서 index.html → main.js(createApp, mount) → App.vue
  - SFC 3단 — script setup(로직), template(구조), style scoped(스타일)
  - Options API는 역할별 상자, Composition API는 기능별로 묶고 Composable로 재사용
qa:
  - q: Options API와 Composition API의 차이는?
    a: Options API는 data, methods, computed 같은 정해진 옵션 상자에 코드를 역할별로 나누는 Vue 2 방식이라, 기능 하나를 고치려면 상자 사이를 오르내려야 하고 Mixin 재사용은 출처가 불분명해집니다. Composition API는 script setup 안에서 ref, computed 같은 함수로 관련 데이터와 로직을 한곳에 묶어 가독성이 좋고, Composable 함수로 로직을 재사용하며 TypeScript 추론도 자연스럽습니다. Vue 3의 공식 표준입니다.
  - q: Vue 앱이 시작되는 과정을 설명해 보세요.
    a: 브라우저는 유일한 HTML인 index.html을 읽고, 그 안의 div id="app"과 type="module" script로 main.js를 실행합니다. main.js에서 createApp(App)으로 앱 인스턴스를 만들고 use()로 Pinia, Router 같은 플러그인을 등록한 뒤 mount('#app')으로 실제 DOM에 붙이면, App.vue를 루트로 컴포넌트 트리가 렌더링됩니다.
  - q: style scoped는 어떻게 동작하나요?
    a: scoped를 붙이면 그 컴포넌트 템플릿의 요소에만 스타일이 적용되고 다른 컴포넌트에는 영향을 주지 않습니다. Vue가 빌드할 때 요소에 고유한 data-v 속성을 붙이고 선택자에도 그 속성 조건을 붙여 범위를 제한합니다. 프로젝트 공통 스타일은 main.js에서 import하고, 특정 컴포넌트에 외부 CSS를 쓸 때는 style 안에서 @import를 씁니다.
related:
  - ref-reactive
  - vue-directives
  - vite-build-deploy
source: Day1(7/31) 슬라이드 p.40–53 (Project 구조, package.json, index.html, main.js, App.vue, SFC, HelloWorld.vue, Options vs Composition API, Interpolation & Directive, 반응성 예제), p.95–96 (Scoped Style, External Style), p.100–101 (Composition API 개요, Vue 3 내장 함수), p.110 (script setup 함수 정의 방식)
---

```flow
index.html :: 유일한 HTML — div#app + script type="module" src="/src/main.js"
main.js :: createApp(App) → use(createPinia()) → use(router) → mount('#app')
App.vue :: 루트 컴포넌트 — RouterLink, RouterView 배치
views · components :: 페이지 컴포넌트와 재사용 부품이 트리를 구성
```

```vue
<script setup>              // 1. 로직 — Composition API (import한 것은 template에서 바로 사용)
import { ref } from 'vue'
const count = ref(0)
const increment = () => { count.value++ }    // 실무 표준: 화살표 함수 (호이스팅 X)
</script>

<template>                  <!-- 2. 구조 — template 안에서는 .value 생략 -->
  <button @click="increment">Count: {{ count }}</button>
</template>

<style scoped>              /* 3. 스타일 — 이 컴포넌트에만 적용 */
button { padding: 8px 16px; }
</style>
```

| 폴더·파일 | 역할 |
| --- | --- |
| `public/` | 컴파일하지 않는 정적 파일 (favicon) |
| `src/assets/` | 빌드가 최적화하는 CSS, 이미지, 폰트 |
| `src/components/` | 재사용 UI 부품 — 두 단어 이상 PascalCase (`WeatherCard.vue`) |
| `src/views/` | 라우터에 매핑되는 페이지 (`WeatherHomeView.vue`) |
| `src/router/`, `src/stores/` | 라우트 정의, Pinia 스토어 |
| `package.json` | 메타 정보, scripts(dev, build), dependencies / devDependencies |
