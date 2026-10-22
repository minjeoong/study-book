---
title: Modern JavaScript (ES6+)
en: ES6+ — Destructuring, Spread/Rest, Optional Chaining, Nullish Coalescing
summary: ES6(2015) 이후 문법 — 구조 분해, Spread·Rest, 템플릿 리터럴, 화살표 함수, ?.와 ??로 코드가 짧고 안전해진다
importance: 3
order: 14
tags:
  - JavaScript
  - ES6
  - 모던 문법
keypoints:
  - 구조 분해 할당은 객체는 key 이름, 배열은 순서로 꺼낸다
  - "...은 펼치면 Spread(복사·병합), 모으면 Rest(나머지 수집)"
  - "?.는 null·undefined에서 멈추고, ??는 null·undefined일 때만 기본값 (0, '' 유지)"
qa:
  - q: "??와 ||의 차이는?"
    a: 논리합 ||는 좌항이 0, 빈 문자열, false 같은 모든 falsy 값이면 우항을 반환해서, 알림 횟수 0이나 빈 닉네임처럼 사용자가 의도한 값을 기본값으로 덮어쓰는 버그를 만듭니다. 널 병합 연산자 ??는 좌항이 null이나 undefined일 때만 우항을 반환해 0과 빈 문자열을 데이터로 인정합니다. 깊은 객체 접근에는 user?.profile?.address?.city ?? '주소 없음'처럼 옵셔널 체이닝과 함께 씁니다.
  - q: 스프레드 연산자로 복사하면 원본과 완전히 분리되나요?
    a: 배열이나 객체를 [...arr], {...obj}로 복사하면 새 주소의 복사본이 만들어져 최상위 요소를 바꿔도 원본은 그대로입니다. 단순 대입(=)은 주소만 복사해 복사본을 고치면 원본도 바뀝니다. 다만 스프레드는 얕은 복사라 안쪽에 중첩된 객체는 여전히 공유되므로, 깊은 구조는 structuredClone 같은 깊은 복사를 써야 합니다.
  - q: Babel과 Polyfill은 무엇인가요?
    a: Babel은 최신 문법으로 작성한 코드를 구형 브라우저도 이해하는 ES5 문법으로 바꿔 주는 트랜스파일러입니다. Polyfill은 구형 브라우저에 아예 없는 Promise, includes 같은 객체나 메서드를 JS로 직접 구현해 채워 넣는 코드입니다. Vite 같은 빌드 도구에 이런 변환이 내장되어 있어 개발자는 브라우저 호환성 걱정 없이 최신 문법으로 작성합니다.
related:
  - axios-rest-api
  - pinia-store
  - web-basics/js-data-types
  - web-basics/async-javascript
source: Day4(8/5) 슬라이드 p.230–231 (ECMAScript 역사, 브라우저 지원, Babel·Polyfill), p.232–246 (let·const, Arrow Function, Template Literal, Destructuring, Spread, Rest, Promise, async/await, ES6+ Array·Object 기능, Optional Chaining, Nullish Coalescing), p.247–249 (Code Challenge 과제 1–3)
---

```flow
ES5 (2009) :: use strict, forEach·map·filter
ES6 (2015) :: let·const, 화살표 함수, 템플릿 리터럴, 구조 분해, Spread, Promise, 모듈
ES8 (2017) :: async/await, Object.values·entries
ES11 (2020) :: 옵셔널 체이닝 ?. , 널 병합 ??
ES13~14 (2022~2023) :: at(-1), toSorted·toReversed (원본 보존 메서드)
```

| 문법 | 예 | 포인트 |
| --- | --- | --- |
| 구조 분해 | `const { name, age } = user`, `const [lat, lon] = coords` | 객체는 이름, 배열은 순서. `[first, , third]`로 건너뛰기 |
| Spread | `[...front, ...back]`, `{ ...base, version: 2 }` | 같은 key는 뒤에 쓴 값이 덮어씀, 얕은 복사 |
| Rest | `const { name, ...rest } = emp`, `(gold, ...others) => {}` | 나머지를 객체·배열로 수집 |
| 템플릿 리터럴 | `` `현재 ${city}의 기온은 ${temp}도` `` | 백틱, 줄바꿈 그대로 |
| 화살표 함수 | `const sum = (a, b) => a + b` | 한 줄이면 return 생략, 인자 1개면 괄호 생략 |
| 객체 축약 | `{ title, price, getInfo() {} }`, `{ [key]: value }` | 단축 속성, 메서드 축약, 계산된 속성명 |
| Optional Chaining | `user?.profile?.address?.city` | 중간이 null·undefined면 에러 대신 undefined |
| Nullish Coalescing | `count ?? 10` | null·undefined일 때만 기본값 |

```js
const userSetting = { alertCount: 0, nickname: '' }
userSetting.alertCount || 10        // 10 — 0을 falsy로 보고 덮어씀 (버그)
userSetting.alertCount ?? 10        // 0  — null·undefined만 기본값
const city = user2?.profile?.address?.city ?? '등록된 주소 없음'
const updatedCart = [...currentCart, newProduct.name]   // Code Challenge 과제 2 — 원본 보존
```
