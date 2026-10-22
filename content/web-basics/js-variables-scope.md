---
title: var, let, const와 스코프
en: var / let / const, Scope, Hoisting
summary: 재할당이 필요하면 let, 아니면 const — var는 함수 스코프와 호이스팅 문제 때문에 쓰지 않는다
importance: 3
order: 8
tags:
  - JavaScript
  - 변수
  - 스코프
  - 호이스팅
keypoints:
  - const는 재할당만 금지 — 객체·배열 내용은 바꿀 수 있다
  - let·const는 블록 스코프, var는 함수 스코프
  - let·const도 호이스팅되지만 선언 전 접근은 TDZ 에러
qa:
  - q: var, let, const의 차이는?
    a: var는 함수 스코프이고 같은 이름으로 다시 선언할 수 있으며, 선언 전에 접근하면 undefined가 나온다. let과 const는 블록 스코프이고 재선언이 안 되며, 선언 전에 접근하면 ReferenceError(TDZ)가 난다. const는 재할당만 막으므로 실습에서 DOM 요소 참조는 const로, 통째로 바뀌는 cars 배열과 editingId는 let으로 선언했다.
  - q: 호이스팅이란?
    a: 선언이 스코프 맨 위로 끌어올려진 것처럼 동작하는 현상이다. 함수 선언문은 본문까지 끌어올려져 정의보다 위에서 호출할 수 있어서, 실습 app.js가 renderCars()를 정의보다 먼저 호출해도 동작한다. 반면 let, const 변수는 선언 줄에 도달하기 전까지 TDZ에 있어 접근하면 에러가 난다.
related:
  - dom-manipulation
  - array-methods-crud
  - state-driven-rendering
source: app.js 1–48행 (const 요소 참조, let cars, let editingId, renderCars 선호출)
---

```compare
var | let | const
스코프 | 함수 | 블록 { } | 블록 { }
재선언 | 가능 | 불가 | 불가
재할당 | 가능 | 가능 | 불가
선언 전 접근 | undefined | ReferenceError (TDZ) | ReferenceError (TDZ)
실습 사용 | 없음 | cars, editingId | DOM 요소, 함수 안 지역 값
```

```js
const carList = document.querySelector('#carList') // 다시 대입하지 않음 → const
let cars = [ /* 예시 차량 2대 */ ]                  // filter 결과로 교체됨 → let
let editingId = null                                // null ↔ 차량 id 로 모드 전환

renderCars()               // 함수 선언문은 호이스팅 → 정의보다 먼저 호출 가능
function renderCars() { /* ... */ }

const list = [1, 2]
list.push(3)               // OK — 내용 변경
// list = []               // TypeError — 재할당 금지
```

> [!tip] 면접 팁
> "기본은 const, 다시 대입해야 할 때만 let, var는 쓰지 않는다"를 원칙으로 먼저 말하고 이유(블록 스코프, TDZ)를 붙인다.
