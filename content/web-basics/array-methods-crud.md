---
title: 배열 메서드로 CRUD
en: Array Methods (filter, find, map, push, reduce)
summary: 객체 배열 하나로 목록 데이터를 관리 — push로 추가, find로 찾기, map으로 수정, filter로 삭제·검색
importance: 3
order: 11
tags:
  - JavaScript
  - 배열
  - CRUD
keypoints:
  - 차량 1대 = 객체 1개, 목록 = 객체 배열, id로 구분한다
  - filter·map·toSorted는 새 배열 반환, push·splice·sort는 원본 변경
  - find는 첫 요소 하나, filter는 조건 맞는 전부, reduce는 누적해 값 하나
qa:
  - q: map, filter, forEach, find, reduce의 차이는?
    a: forEach는 각 요소에 함수를 실행만 하고 반환값이 없습니다. map은 각 요소를 변환한 같은 길이의 새 배열을, filter는 조건이 참인 요소만 모은 새 배열을 반환하고, find는 조건을 만족하는 첫 요소 하나를 돌려주며 없으면 undefined입니다. reduce는 합계처럼 모든 요소를 누적해 값 하나를 만듭니다. 실습에서는 수정에 map, 삭제·검색에 filter, 수정할 차량 찾기에 find를 썼습니다.
  - q: 원본 배열을 직접 바꾸지 않는 불변 방식은 왜 쓰나요?
    a: filter, map, 스프레드처럼 새 배열을 만들면 이전 상태가 그대로 남아 변경 전후 비교와 디버깅이 쉽습니다. React는 참조가 바뀌어야 변경을 감지하므로 불변 업데이트가 사실상 필수이고, 원본을 보존하는 toSorted, toReversed 같은 메서드도 추가되었습니다. 실습에서도 삭제를 cars = cars.filter(...)로 처리해 원본을 건드리지 않고 새 목록으로 교체했습니다.
  - q: for...in과 for...of의 차이는?
    a: for...in은 객체의 key(속성 이름)를 순회하고, for...of는 배열이나 문자열 같은 반복 가능한 객체의 값을 순회합니다. 배열에 for...in을 쓰면 인덱스가 문자열로 나오고 상속된 속성까지 섞일 수 있어 배열은 for...of나 forEach를 씁니다. 객체를 배열처럼 돌리고 싶으면 Object.entries()로 [key, value] 쌍의 배열로 바꿉니다.
related:
  - js-data-types
  - state-driven-rendering
  - form-validation
source: Day1 슬라이드 p.200–206 (for, while, break·continue, for...in, for...of, 중첩 반복), p.214–217 (Arrays, 기본·검색·정렬·반복 메서드, Spread), p.221 (Object.entries), p.232 (과제 내 가방 보기), Day2 가이드 p.5–10 (기능 요구사항 2, 4, 7–9), app.js getFilteredCars, TODO 1·7·8
---

| 기능 | 메서드 | 원본 변경 |
| --- | --- | --- |
| 등록 (Create) | `push` 또는 `[...cars, car]` | push만 O |
| 조회·검색·필터 (Read) | `filter` + `includes` | X |
| 수정 폼 채우기 | `find` | X |
| 수정 완료 (Update) | `map` (id 같은 것만 교체) | X |
| 삭제 (Delete) | `filter` (id 다른 것만 남김) | X |
| 카드 출력 | `forEach` (반환값 없음) | X |
| 앞뒤 넣고 빼기 | `push` / `pop`(뒤), `unshift` / `shift`(앞) | O |
| 정렬 | `sort`, `reverse` / `toSorted`, `toReversed` | O / X |
| 합계 | `reduce((sum, x) => sum + x, 0)` | X |

```flow
검색어 정리 :: searchInput.value.trim().toLowerCase()
비교 문자열 :: 제조사 + 모델명을 합쳐 toLowerCase()
부분 일치 :: includes(keyword) — 빈 검색어면 항상 true → 전체 목록
상태 일치 :: '전체'이거나 car.status가 같음
결과 :: 두 조건이 모두 참인 차량만 filter → renderCars
```

```js
// 수정 폼 채우기 — TODO 7
function startEdit(id) {
  const car = cars.find((c) => c.id === id)
  makerInput.value = car.maker
  modelInput.value = car.model          // 나머지 항목도 같은 방식
  editingId = id
  submitButton.textContent = '수정 완료'
  cancelEditButton.hidden = false
}

// 삭제 — TODO 8
function deleteCar(id) {
  if (!confirm('선택한 차량을 삭제할까요?')) return   // 확인 = true, 취소 = false
  cars = cars.filter((c) => c.id !== id)
  renderCars()
}
```

> [!warn] 헷갈리기 쉬움
> 가이드는 "alert 창"이라고 했지만 확인/취소 두 버튼이 있는 창은 `confirm()`이다. alert는 알림만, confirm은 true/false, prompt는 입력 문자열을 돌려준다 (Day1 Up-Down 게임 과제가 prompt 사용).
