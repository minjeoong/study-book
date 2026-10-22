---
title: 배열 메서드로 CRUD
en: Array Methods (filter, find, map, push)
summary: 객체 배열 하나로 목록 데이터를 관리 — push로 추가, find로 찾기, map으로 수정, filter로 삭제·검색
importance: 3
order: 11
tags:
  - JavaScript
  - 배열
  - CRUD
keypoints:
  - 차량 1대 = 객체 1개, 목록 = 객체 배열, id로 구분한다
  - filter·map은 새 배열 반환, push·splice는 원본 변경
  - 검색은 toLowerCase + includes로 부분·대소문자 무시 일치
qa:
  - q: map, filter, forEach, find의 차이는?
    a: forEach는 각 요소에 함수를 실행만 하고 반환값이 없다. map은 각 요소를 변환한 같은 길이의 새 배열을, filter는 조건이 참인 요소만 모은 새 배열을 반환한다. find는 조건을 만족하는 첫 요소 하나를 돌려주고 없으면 undefined다. 실습에서는 수정에 map, 삭제·검색에 filter, 수정할 차량 찾기에 find를 쓸 수 있다.
  - q: 원본 배열을 직접 바꾸지 않는 불변 방식은 왜 쓰나?
    a: filter, map, 스프레드처럼 새 배열을 만들면 이전 상태가 그대로 남아 변경 전후 비교와 디버깅이 쉽다. React는 참조가 바뀌어야 변경을 감지하므로 불변 업데이트가 사실상 필수다. 실습에서도 삭제를 cars = cars.filter(...)로 처리하면 원본을 건드리지 않고 새 목록으로 교체하게 된다.
related:
  - js-variables-scope
  - state-driven-rendering
  - form-validation
source: 슬라이드 p.5–10 (기능 요구사항 2, 4, 7–9), app.js getFilteredCars (filter, includes), TODO 1·7·8
---

| 기능 | 메서드 | 원본 변경 |
| --- | --- | --- |
| 등록 (Create) | `push` 또는 `[...cars, car]` | push만 O |
| 조회·검색·필터 (Read) | `filter` + `includes` | X |
| 수정 폼 채우기 | `find` | X |
| 수정 완료 (Update) | `map` (id 같은 것만 교체) | X |
| 삭제 (Delete) | `filter` (id 다른 것만 남김) | X |
| 카드 출력 | `forEach` (반환값 없음) | X |

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
  modelInput.value = car.model
  yearInput.value = car.year            // 나머지 항목도 같은 방식
  editingId = id
  submitButton.textContent = '수정 완료'
  cancelEditButton.hidden = false
  modelInput.focus()
}

// 삭제 — TODO 8
function deleteCar(id) {
  if (!confirm('선택한 차량을 삭제할까요?')) return   // 확인 = true, 취소 = false
  cars = cars.filter((c) => c.id !== id)
  renderCars()
}
```

> [!warn] 헷갈리기 쉬움
> 슬라이드는 "alert 창"이라고 했지만 확인/취소 두 버튼이 있는 창은 `confirm()`이다. alert는 알림만, confirm은 true/false, prompt는 입력 문자열을 돌려준다.
