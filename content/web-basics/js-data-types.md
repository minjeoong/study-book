---
title: JS 데이터 타입과 연산자
en: Primitive vs Reference Types, == vs ===
summary: 원시 타입은 값 자체를, 참조 타입(객체·배열·함수)은 힙 메모리 주소를 변수에 담는다 — 복사·비교·함수 전달 동작이 달라진다
importance: 3
order: 10
tags:
  - JavaScript
  - 데이터 타입
  - 연산자
keypoints:
  - 원시 타입 7종(string, number, boolean, null, undefined 등)은 불변
  - 객체·배열은 주소가 복사되어 한쪽을 고치면 다른 변수에서도 바뀐다
  - 비교는 ===(값+타입) — ==는 형변환을 해서 5 == '5'가 true
qa:
  - q: 원시 타입과 참조 타입의 차이는?
    a: 원시 타입은 변수 공간에 실제 값이 저장되고 불변이라, 다른 변수에 대입하거나 함수에 넘기면 값이 복사됩니다. 객체·배열 같은 참조 타입은 실제 데이터가 힙에 있고 변수에는 주소가 들어가서, 대입하거나 함수 인자로 넘기면 같은 객체를 가리키게 되어 내부 속성을 고치면 원본도 바뀝니다. 수업에서는 이를 Call by Value와 Call by Sharing으로 구분했습니다.
  - q: null과 undefined의 차이는?
    a: undefined는 변수를 선언만 하고 값을 넣지 않았거나, 없는 속성에 접근했거나, return이 없는 함수의 결과일 때 엔진이 주는 값입니다. null은 개발자가 값이 없음을 의도적으로 표현할 때 직접 대입하는 값입니다. typeof null이 'object'로 나오는 것은 초기 설계의 버그로 알려져 있습니다.
  - q: == 대신 ===를 쓰는 이유는?
    a: ==는 비교 전에 타입을 암묵적으로 맞춰서 5 == '5'나 0 == '' 같은 예상 밖의 true가 나옵니다. ===는 값과 타입이 모두 같아야 true라 결과를 예측할 수 있습니다. 이후 Vue 과목에서는 ESLint의 eqeqeq 규칙으로 ===를 강제하는 실습도 했습니다.
related:
  - js-variables-scope
  - array-methods-crud
  - vue/modern-javascript
source: Day1 슬라이드 p.168 (인터프리터, 동적 타이핑), p.179–189 (Datatypes — String, Number, BigInt, Boolean, undefined·null, Symbol, Reference Types, Wrapper Object), p.190–196 (연산자), p.211 (Call by Value vs Call by Sharing), p.223–229 (내장 객체 Math, Date, JSON, RegExp, Set, Map)
---

```compare
원시 타입 (Primitive) | 참조 타입 (Object)
종류 | string, number, bigint, boolean, null, undefined, symbol | object, array, function, Date, Map, Set, RegExp
저장 | 변수에 실제 값 | 변수에는 힙(Heap) 메모리 주소
변경 | 불변 — 문자열 메서드도 새 값을 반환 | 가변 — 내부 속성 변경 가능
대입·함수 전달 | 값 복사 (Call by Value) | 주소 공유 (Call by Sharing)
```

```js
function changeValue(x) { x = 20 }
function changeProperty(obj) { obj.name = 'Lee' }

let a = 10
changeValue(a)               // a는 그대로 10 — 복사본만 바뀜
const user = { name: 'Kim' }
changeProperty(user)         // user.name === 'Lee' — 같은 객체를 가리킴

typeof 42                    // 'number' (정수·실수 구분 없이 Number 하나)
typeof null                  // 'object' (역사적 버그)
5 == '5'                     // true  — 형변환 후 비교
5 === '5'                    // false — 타입까지 비교
0.1 + 0.2                    // 0.30000000000000004 — 부동소수점 오차
10n + 5                      // TypeError — BigInt와 Number는 섞어 계산 불가
```

> [!tip] 면접 팁
> `"hello".toUpperCase()`처럼 원시 값에 메서드를 쓸 수 있는 건 엔진이 잠깐 래퍼 객체(String)로 바꿔 주는 오토박싱 덕분이다. `new String()`으로 직접 만들면 typeof가 'object'가 되고 느려지므로 쓰지 않는다.
