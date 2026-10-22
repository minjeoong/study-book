---
title: Vue 디렉티브
en: Vue Directives (v-bind, v-if, v-show, v-for, v-html)
summary: v- 접두사가 붙은 Vue 전용 HTML 속성 — 따옴표 안은 JS 표현식이고, 속성·조건·반복을 데이터와 연결한다
importance: 3
order: 5
tags:
  - Vue
  - 디렉티브
  - 템플릿
keypoints:
  - v-bind(:)는 속성에 데이터 연결, :class는 객체·배열 문법으로 조건부 클래스
  - v-if는 DOM을 만들고 지움, v-show는 display none으로 숨김만
  - v-for에는 고유한 :key 필수 — index 대신 데이터의 id
qa:
  - q: v-if와 v-show의 차이와 선택 기준은?
    a: v-if는 조건이 false면 태그를 DOM에 아예 만들지 않고, 바뀔 때마다 파괴하고 새로 만듭니다. v-show는 항상 그려 두고 CSS display none만 붙였다 뗍니다. 그래서 초기 렌더링 비용은 v-if가, 전환 비용은 v-show가 낮아 로그인 후 화면이나 권한별 메뉴처럼 드물게 바뀌면 v-if, 탭·모달·아코디언처럼 자주 토글하면 v-show를 씁니다. v-else 조합과 template 태그는 v-if만 됩니다.
  - q: v-for에 key를 왜 지정하나요? index를 key로 쓰면?
    a: key는 Vue가 가상 DOM을 비교할 때 각 항목을 구별하는 식별자라, key가 있어야 순서가 바뀌거나 중간에 추가·삭제될 때 기존 요소를 재사용하고 바뀐 것만 갱신합니다. index를 key로 쓰면 삭제나 정렬 후 같은 index가 다른 데이터를 가리켜 입력값이나 컴포넌트 상태가 엉뚱한 항목에 남을 수 있습니다. 그래서 날씨 Mockup 과제에서도 :key에 도시 id를 바인딩하는 것이 필수 요구사항이었습니다.
  - q: v-html을 쓸 때 주의할 점은?
    a: v-html은 문자열을 innerHTML처럼 실제 HTML로 해석해 넣기 때문에, 사용자 입력을 그대로 넣으면 img onerror 같은 스크립트가 실행되는 XSS 공격에 노출됩니다. 수업에서도 입력창에 onerror 코드를 넣으면 다른 사이트로 이동하는 예제로 확인했습니다. 텍스트는 보간법이나 v-text로 출력하고, v-html은 신뢰할 수 있는 HTML에만 씁니다.
related:
  - event-v-model
  - ref-reactive
  - web-basics/dom-manipulation
source: Day1(7/31) 슬라이드 p.49 (Interpolation & Directive), p.53 (보간법 안 JS 표현식), p.55–75 (Directive 목록, v-html·XSS, v-text, v-bind·Class·Style Binding·Same-name Shorthand, v-if·v-show 비교, v-for, v-pre, v-cloak, v-once, v-memo), p.98 (과제 날씨 Mockup)
---

| 디렉티브 | 하는 일 | 예 |
| --- | --- | --- |
| `v-bind` (`:`) | 속성에 데이터 바인딩 | `:href="url"`, `:disabled="isLocked"`, 3.4+ 같은 이름 축약 `:src` |
| `:class` | 조건부 클래스 (객체·배열) | `:class="{ 'text-danger': isWarning }"`, `:class="[theme, ok ? 'a' : 'b']"` |
| `:style` | 인라인 스타일 (key는 camelCase) | `:style="{ fontSize: size + 'px' }"` |
| `v-if` / `v-else-if` / `v-else` | 조건부 렌더링 (DOM 생성·삭제) | 점수별 학점 A~F |
| `v-show` | 조건부 표시 (display none) | 토글 상자 |
| `v-for` + `:key` | 반복 렌더링 (배열·객체) | `v-for="(item, index) in items" :key="item.id"` |
| `v-html` / `v-text` | innerHTML / innerText | v-html은 XSS 주의, v-text 대신 보간법 |
| `v-pre`, `v-cloak`, `v-once`, `v-memo` | 컴파일 생략 / 로딩 전 숨김 / 1회만 렌더 / 지정 값 바뀔 때만 갱신 | 특수·성능 최적화 |

```compare
v-if | v-show
방식 | DOM 생성·파괴 | CSS display none 토글
초기 비용 | 낮음 (false면 안 그림) | 높음 (일단 다 그림)
전환 비용 | 높음 | 낮음
v-else · template | 가능 | 불가
쓰임 | 로그인 후 화면, 권한별 메뉴 | 탭, 모달, 아코디언
```

```vue
<!-- 날씨 Mockup 과제 — v-for + key + v-if -->
<div v-for="city in weatherList" :key="city.id" class="card">
  {{ city.name }} {{ city.temp }}°C
  <span v-if="city.temp >= 25">더움 (25도 이상)</span>
  <span v-else>선선함 (25도 미만)</span>
</div>
```

> [!tip] 면접 팁
> 실무 비중은 `:class`(미리 정의한 디자인을 갈아입힘)가 대부분이고, `:style`은 슬라이더 수치나 게이지처럼 값을 실시간 반영할 때만 쓴다고 정리했다.
