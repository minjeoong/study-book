---
title: Vue.js 개요 — MVVM과 Virtual DOM
en: Vue.js Overview, MVVM, Virtual DOM
summary: Vue는 UI를 만드는 가벼운 점진적 프레임워크 — MVVM 패턴으로 화면과 데이터를 분리하고, 가상 DOM으로 바뀐 부분만 실제 DOM에 반영
importance: 3
order: 1
tags:
  - Vue
  - MVVM
  - Virtual DOM
  - 프레임워크
keypoints:
  - MVVM — ViewModel(Vue 엔진 + script)이 DOM 이벤트와 데이터 바인딩을 중개
  - Virtual DOM은 메모리 속 DOM 사본, 변경을 모아 최소한으로 한 번에 반영
  - 컴포넌트 기반 — HTML·JS·CSS를 .vue 하나에 묶고 Props Down, Emit Up
qa:
  - q: Virtual DOM이란 무엇이고 왜 쓰나요?
    a: 실제 DOM을 바꾸면 브라우저가 레이아웃 재계산(리플로우)과 다시 칠하기(리페인트)를 하므로, 노드가 많은 화면에서 자주 바꾸면 느려집니다. Virtual DOM은 메모리에 둔 DOM의 사본으로, 상태가 바뀌면 새 가상 DOM을 만들어 이전과 비교한 뒤 달라진 부분만 실제 DOM에 반영합니다. 한 이벤트 안에서 데이터가 여러 번 바뀌어도 끝난 시점에 한 번만 반영해 렌더링 횟수를 줄이고, 개발자는 DOM 조작 대신 상태 변화만 선언하면 됩니다.
  - q: MVVM 패턴을 Vue에 대입해 설명해 보세요.
    a: Model은 script 안의 ref, reactive 원본 데이터나 REST API에서 받은 데이터이고, View는 template과 style로 그린 화면입니다. ViewModel은 Vue 엔진과 script로, DOM Listeners로 화면 이벤트를 받아 데이터를 바꾸고 Data Bindings로 바뀐 데이터를 화면에 반영합니다. 덕분에 화면 그리기와 데이터 처리 로직이 분리됩니다.
  - q: Vue, React, Angular의 차이는?
    a: Vue는 Evan You가 AngularJS의 무거움을 덜려고 만든 점진적 프레임워크로, 학습 곡선이 낮고 v-model 양방향 바인딩을 지원합니다. React는 Meta의 UI 라이브러리로 단방향 데이터 흐름과 Hooks가 특징이고, Angular는 Google의 풀스택 프레임워크로 TypeScript가 필수이며 의존성 주입을 제공하고 가장 무겁습니다. Vue와 React는 가상 DOM을, Angular는 실제 DOM을 씁니다.
related:
  - spa-csr-ssr
  - sfc-composition-api
  - web-basics/browser-rendering
  - web-basics/state-driven-rendering
source: Day1(7/31) 슬라이드 p.8–14 (Vue.js Overview, JS vs TS, History, MVVM, Frontend Framework 3대장 비교, Virtual DOM, Two-Way Data Binding, Component Based Architecture)
---

```layers
View :: template, style — 사용자가 보는 화면 (DOM)
ViewModel :: Vue 엔진 + script — DOM Listeners(이벤트 감지), Data Bindings(데이터 반영)
Model :: ref·reactive 원본 데이터, REST API 응답 (순수 JS 객체)
```

```compare
Vue.js | React | Angular
분류·개발 | 점진적 프레임워크 · Evan You (2014) | UI 라이브러리 · Meta (2013) | 풀스택 프레임워크 · Google (2010)
언어 | JS, TS | JS, TS | TS 필수
학습 곡선 · 크기 | 낮음 · 약 33KB | 중간 · 약 42KB | 높음 · 약 500KB
DOM | Virtual DOM | Virtual DOM | 실제 DOM
데이터 흐름 | 양방향 바인딩 (v-model) | 단방향 + Hooks | 양방향 + 의존성 주입
```

> [!tip] 면접 팁
> 버전 흐름으로 정리하면 쉽다. 1.0(2015, 데이터 바인딩·기본 디렉티브) → 2.0(2016, Virtual DOM) → 3.0(2020, Composition API, 코어를 TypeScript로 재작성) → Vite 연계가 표준(2023). Options API는 레거시 유지보수용.
