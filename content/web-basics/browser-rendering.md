---
title: 브라우저 렌더링과 script 로딩
en: Critical Rendering Path, defer / async / module
summary: HTML은 DOM, CSS는 CSSOM으로 만든 뒤 합쳐 배치·그리기 — script는 body 끝이나 defer·module로 파싱을 막지 않게 둔다
importance: 3
order: 8
tags:
  - 브라우저
  - 렌더링
  - 성능
keypoints:
  - HTML→DOM, CSS→CSSOM → 렌더 트리 → 레이아웃 → 페인트
  - head의 일반 script는 파싱을 멈춘다 — body 끝에 두거나 defer·module
  - 리플로우(배치 재계산)가 리페인트(다시 칠하기)보다 비싸다
qa:
  - q: 브라우저가 화면을 그리는 과정을 설명해 보세요.
    a: HTML을 파싱해 DOM 트리를, CSS를 파싱해 CSSOM을 만듭니다. 둘을 합쳐 실제로 보이는 요소만 담은 렌더 트리를 만들고, 각 요소의 위치와 크기를 계산하는 레이아웃, 픽셀을 칠하는 페인트, 레이어를 합치는 합성 순서로 화면이 나옵니다. JS가 DOM이나 스타일을 바꾸면 이 과정의 일부가 다시 실행됩니다.
  - q: script 태그의 위치와 defer, async, type="module"의 차이는?
    a: head에 일반 script를 두면 내려받고 실행하는 동안 HTML 파싱이 멈춰 화면이 늦게 뜨므로, 수업에서는 body 끝에 두는 방법을 먼저 배웠습니다. defer는 파싱과 병렬로 받고 파싱이 끝난 뒤 문서 순서대로, async는 받는 즉시 실행해 순서가 보장되지 않습니다. type="module"은 기본으로 defer처럼 동작하고 파일마다 독립 스코프를 가져 전역 변수 충돌이 없으며 import, export로 소통합니다.
  - q: 리플로우와 리페인트의 차이는?
    a: 리플로우는 크기나 위치가 바뀌어 레이아웃을 다시 계산하는 것이고, 리페인트는 색이나 그림자처럼 모양만 다시 칠하는 것입니다. 리플로우는 리페인트까지 동반하므로 더 비쌉니다. DOM 변경을 모아 한 번에 반영하거나 애니메이션을 transform, opacity로 처리하면 비용을 줄일 수 있고, Vue의 가상 DOM도 이 비용을 줄이려는 장치입니다.
related:
  - semantic-html
  - dom-manipulation
  - vue/vue-overview
source: Day1 슬라이드 p.24 (브라우저가 HTML을 렌더링), p.170 (script 위치 head vs body, 외부 JS, 브라우저별 JS 엔진 V8·SpiderMonkey·JavaScriptCore), p.258–260 (ES Modules, export·import, Module vs External JS), Day2 index.html head (script defer), app.js 상단 querySelector — 렌더 단계 상세는 면접 대비 보강
---

```flow
HTML 파싱 :: DOM 트리
CSS 파싱 :: CSSOM 트리
렌더 트리 :: DOM + CSSOM, 보이는 요소만 (display none 제외)
레이아웃 :: 위치·크기 계산 — 바뀌면 리플로우
페인트·합성 :: 픽셀 칠하기, 레이어 합치기 — 바뀌면 리페인트
```

```compare
script | script defer | script async
다운로드 | 파싱을 멈추고 받음 | 파싱과 병렬 | 파싱과 병렬
실행 시점 | 받자마자 (파싱 중단) | 파싱 완료 후 (DOMContentLoaded 전) | 받자마자
실행 순서 | 문서 순서 | 문서 순서 | 보장 안 됨
쓰임 | body 맨 끝에 둘 때 | DOM 조작 스크립트 (Day2 app.js) | 분석·광고 등 독립 스크립트
```

| 구분 | 일반 외부 JS | ES Module |
| --- | --- | --- |
| 로드 | `<script src="file.js">` | `<script type="module" src="file.js">` |
| 스코프 | 전역 공유 — 같은 이름 const가 두 파일에 있으면 에러 | 파일별 독립 (은닉화) |
| 소통 | 전역 변수·함수로 간접 | `export` / `import`로 명시 |
| 실행 시점 | 태그를 만나는 즉시 (파싱 중단) | HTML을 다 읽은 뒤 (defer) |

> [!warn] 헷갈리기 쉬움
> defer 없이 head에 app.js를 두면 querySelector가 아직 없는 요소를 찾아 `null`을 반환하고, 이어지는 `addEventListener`에서 TypeError가 난다.
