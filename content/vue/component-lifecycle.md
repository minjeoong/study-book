---
title: 컴포넌트와 라이프사이클 훅
en: Vue Component, Registration, Lifecycle Hooks
summary: 컴포넌트는 독립·재사용 가능한 화면 부품 — 생성 → 마운트 → 갱신 → 소멸 단계마다 onMounted 같은 훅으로 코드를 끼워 넣는다
importance: 2
order: 9
tags:
  - Vue
  - 컴포넌트
  - 라이프사이클
keypoints:
  - 컴포넌트는 트리 구조 — 형제끼리는 직접 못 하고 부모를 거쳐 통신
  - API 호출·DOM 접근은 onMounted, 타이머·리스너 정리는 onUnmounted
  - 지역 등록은 import 후 바로 사용, 전역 등록은 main.js의 app.component()
qa:
  - q: Vue 컴포넌트의 생명주기를 설명해 보세요.
    a: script setup 본문이 실행되는 생성 단계에서 ref, computed, watch가 초기화되지만 아직 DOM은 없습니다. 실제 DOM에 붙은 직후 onMounted가 호출되어 DOM 접근이나 초기 데이터 API 호출에 적합하고, 반응형 데이터가 바뀌어 다시 그려지면 onUpdated, v-if가 false가 되는 등으로 제거되면 onUnmounted가 호출됩니다. 각 단계 앞에는 onBeforeMount처럼 직전에 호출되는 훅도 있습니다.
  - q: onUnmounted에서는 무엇을 해야 하나요?
    a: 컴포넌트가 사라져도 setInterval 타이머나 window에 단 전역 이벤트 리스너는 계속 살아 있어 메모리 누수와 예기치 않은 동작을 만듭니다. 그래서 onMounted에서 시작한 타이머는 onUnmounted에서 clearInterval로 끄고, 등록한 리스너도 제거합니다. 수업 예제에서도 3초마다 count를 올리는 타이머를 onUnmounted에서 정리했습니다.
related:
  - props-emits-slot
  - computed-watch
  - sfc-composition-api
source: Day1(7/31) 슬라이드 p.128–136 (Component 개념, Hierarchy, Local·Global Registration, Lifecycle 4단계, Lifecycle Hooks, Hook 예제)
---

```flow
생성 (setup) :: script setup 실행 — ref·computed·watch 초기화, DOM 없음
마운트 (onMounted) :: 실제 DOM에 부착 — DOM 접근, 초기 API 호출
갱신 (onUpdated) :: 반응형 데이터 변경 → 다시 렌더링한 직후
소멸 (onUnmounted) :: v-if false 등으로 제거 — 타이머·리스너 정리
```

| 훅 | 호출 시점 |
| --- | --- |
| `onBeforeMount` / `onMounted` | DOM 부착 직전 / 직후 |
| `onBeforeUpdate` / `onUpdated` | 다시 그리기 직전 / 직후 |
| `onBeforeUnmount` / `onUnmounted` | 제거 직전 / 직후 |
| `onErrorCaptured` | 자식 컴포넌트에서 난 에러 포착 |
| `onActivated` / `onDeactivated` | KeepAlive 캐시 안에서 다시 활성 / 비활성 |

```js
let timerId = null
onMounted(() => {
  timerId = setInterval(() => { count.value++ }, 3000)   // 화면에 붙은 뒤 시작
})
onUnmounted(() => clearInterval(timerId))                // 안 끄면 메모리 누수
```

> [!tip] 면접 팁
> 컴포넌트 이름은 두 단어 이상 PascalCase(`WeatherCard.vue`)가 권장이고, ESLint `vue/multi-word-component-names` 규칙이 이를 검사한다. 템플릿에서는 `<BaseButton />`과 `<base-button>` 둘 다 쓸 수 있다.
