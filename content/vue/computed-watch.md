---
title: computed와 watch
en: computed(), watch(), watchEffect()
summary: computed는 반응형 데이터로 계산한 값을 캐싱, watch·watchEffect는 데이터가 바뀔 때 API 호출 같은 후속 작업(부수 효과)을 실행
importance: 3
order: 8
tags:
  - Vue
  - computed
  - watch
  - Composition API
keypoints:
  - computed는 의존 데이터가 바뀔 때만 재계산 — 템플릿의 일반 함수는 렌더마다 실행
  - watch는 대상 지정·이전 값 제공, watchEffect는 자동 추적·최초 1회 즉시 실행
  - ref 객체 내부 변화는 deep 옵션 또는 () => user.value.age 같은 게터로 감시
qa:
  - q: computed와 일반 함수(methods)의 차이는?
    a: 템플릿에서 getMethodResult()처럼 호출한 일반 함수는 컴포넌트가 다시 렌더링될 때마다 조건 없이 다시 실행됩니다. computed는 의존하는 반응형 데이터가 바뀔 때만 다시 계산하고 그 외에는 캐시된 값을 재사용해 성능에 유리합니다. 수업에서 count와 무관한 dummy만 바꿨을 때 일반 함수 로그만 찍히고 computed 로그는 찍히지 않는 것으로 확인했습니다.
  - q: computed와 watch는 각각 언제 쓰나요?
    a: computed는 기존 상태로부터 파생된 값을 선언적으로 만들 때 쓰고 기본적으로 읽기 전용입니다. watch는 값이 바뀌었을 때 서버 API 재조회, 저장, 로그처럼 부수 효과를 실행할 때 씁니다. 과제에서도 검색어로 거른 filteredWeatherList는 computed로, 선택한 도시가 바뀔 때 로그를 남기는 일은 watch로 처리했습니다.
  - q: watch와 watchEffect의 차이는?
    a: watch는 감시할 대상을 명시하고 콜백에서 새 값과 이전 값을 함께 받으며, 값이 바뀔 때만 실행됩니다. watchEffect는 대상을 지정하지 않아도 함수 안에서 읽은 반응형 데이터를 자동으로 추적하고, 컴포넌트가 생성될 때 최초 1회 즉시 실행되며 이전 값은 주지 않습니다.
related:
  - ref-reactive
  - component-lifecycle
  - pinia-store
source: Day1(7/31) 슬라이드 p.108–125 (computed 캐싱, 함수 정의 방식 3종, watch, Multi-Source Watch, Deep Watch, reactive 데이터 감시, 배열 감시, watchEffect, watchPostEffect·watchSyncEffect), p.126 (과제 날씨 컴포지션 — filteredWeatherList, watch, watchEffect)
---

```compare
computed | watch | watchEffect
목적 | 파생 값 계산 (캐싱) | 변경 시 후속 작업 | 변경 시 후속 작업
대상 | 내부에서 읽은 반응형 값 | 명시 (ref, 배열, 게터 함수) | 내부에서 읽은 값 자동 추적
최초 실행 | 처음 읽을 때 | 바뀔 때만 (immediate 옵션 가능) | 생성 즉시 1회
이전 값 | X | O (newVal, oldVal) | X
과제 예 | filteredWeatherList | 선택 도시 변경 로그, 상세 페이지 재조회 | 검색어 타이핑 로그
```

```js
const filteredWeatherList = computed(() =>
  weatherList.value.filter((w) => w.name.includes(searchQuery.value)))

watch(currentCity, (newVal, oldVal) => { /* 날씨 API 재조회 */ })
watch([city, dateType], ([newCity, newDate], [oldCity, oldDate]) => { /* 둘 중 하나만 바뀌어도 */ })
watch(user, (newVal) => { /* 내부 속성 변화 감지 */ }, { deep: true })
watch(() => user.value.age, (newAge, oldAge) => { /* 이전 값까지 정확히 */ })
watchEffect(() => console.log(`[검색어] ${searchQuery.value}`))   // 즉시 1회 + 자동 추적
```

> [!warn] 헷갈리기 쉬움
> `{ deep: true }`나 reactive 객체를 통째로 감시하면 newVal과 oldVal이 같은 객체(같은 주소)를 가리켜 이전 값을 알 수 없다. 이전 값이 필요하면 `() => state.price`처럼 특정 속성을 게터로 감시한다.
