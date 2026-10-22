---
title: 반응형 상태 — ref와 reactive
en: Reactivity, ref(), reactive()
summary: 일반 변수는 바뀌어도 화면이 그대로, ref·reactive로 감싼 반응형 상태가 바뀌면 Vue가 감지해 화면을 다시 그린다
importance: 3
order: 7
tags:
  - Vue
  - 반응성
  - Composition API
keypoints:
  - ref는 모든 타입, script에서는 .value로 접근하고 template에서는 생략
  - reactive는 객체·배열 전용, .value 없이 쓰지만 통째 재할당하면 반응성 끊김
  - 구조 분해해도 반응성이 끊김 — toRefs, Pinia는 storeToRefs로 보존
qa:
  - q: ref와 reactive의 차이는?
    a: ref는 원시 값과 객체를 모두 반응형으로 만들고 script에서는 .value로 읽고 쓰며 template에서는 자동으로 풀려 .value 없이 씁니다. reactive는 객체·배열·Map·Set만 받고 .value 없이 일반 객체처럼 쓰지만, 변수에 새 객체를 통째로 재할당하거나 구조 분해하면 반응성 연결이 끊어집니다. 이 약점 때문에 현업에서는 객체와 배열도 ref로 통일하는 추세라고 정리했습니다.
  - q: 일반 변수로 선언하면 왜 화면이 안 바뀌나요?
    a: Vue 3는 ref나 reactive로 감싼 값을 Proxy로 감시해 읽기와 쓰기를 추적하고, 값이 바뀌면 그 값을 쓰는 컴포넌트를 다시 렌더링합니다. let으로 선언한 일반 변수는 값이 내부적으로 바뀌어도 Vue가 알 방법이 없어 화면이 그대로입니다. 수업 예제에서는 반응형 변수가 바뀌어 다시 렌더링될 때 일반 변수의 바뀐 값도 함께 화면에 나타나는 것까지 확인했습니다.
related:
  - computed-watch
  - sfc-composition-api
  - pinia-store
  - web-basics/state-driven-rendering
source: Day1(7/31) 슬라이드 p.52 (반응성 데이터 예제 — 일반 변수 vs ref), p.101–107 (Vue 3 내장 함수, ref, reactive, 반응성 단절, 반응형 상태 관리 함수 요약), Day3(8/4) p.184 (구조 분해 시 반응성 유실, storeToRefs)
---

```compare
ref() | reactive()
대상 | 원시 값 + 객체·배열 모두 | 객체·배열·Map·Set만
script 접근 | count.value++ | state.count++
template 접근 | {{ count }} (.value 생략) | {{ state.count }}
주의 | .value 빠뜨리기 | 통째 재할당·구조 분해 시 반응성 끊김
실무 | 기본 선택 | 관련 상태 묶음에 가끔
```

```js
import { ref, reactive } from 'vue'

let normalCount = 0                  // 바뀌어도 화면 갱신 안 됨
const vueCount = ref(0)              // vueCount.value++ → 화면 갱신
const user = ref({ name: '이순신', age: 30 })
user.value.name = '장보고'            // ref 객체 내부도 반응형

let state = reactive({ count: 0 })
state.count = 5                      // OK — 속성만 변경
state = { count: 5 }                 // 반응성 끊김 — 새 객체는 추적 안 됨
const items = reactive(['사과'])
items.push('귤')                      // 배열은 push·splice로 변경
```

> [!tip] 면접 팁
> 보조 함수까지 물으면: readonly(읽기 전용), shallowRef·shallowReactive(첫 단계만 반응형), toRef·toRefs(reactive 속성을 ref로 꺼내 구조 분해해도 반응성 유지), isRef·isReactive(판별).
