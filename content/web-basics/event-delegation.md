---
title: 이벤트 처리와 이벤트 위임
en: Event Handling, Bubbling, Delegation
summary: addEventListener로 동작을 연결하고, 버블링을 이용해 부모 하나가 자식들의 이벤트를 대신 처리한다
importance: 3
order: 10
tags:
  - JavaScript
  - 이벤트
  - DOM
keypoints:
  - 이벤트는 캡처 → 타깃 → 버블링 순서로 전파된다
  - 위임은 부모에 리스너 하나 — 나중에 생긴 자식도 처리된다
  - target은 실제 클릭된 요소, currentTarget은 리스너 주인
qa:
  - q: 이벤트 버블링과 이벤트 위임을 설명하라.
    a: 버블링은 자식에서 발생한 이벤트가 부모, 조상 순으로 올라가며 전파되는 현상이다. 위임은 이를 이용해 자식마다 리스너를 달지 않고 공통 부모에 하나만 달아 event.target으로 실제 대상을 구분하는 방식이다. 실습에서는 카드가 렌더링할 때마다 새로 만들어지므로 carList에 click 리스너 하나를 두고 버튼의 data-action으로 수정과 삭제를 나눴다.
  - q: preventDefault와 stopPropagation의 차이는?
    a: preventDefault는 브라우저 기본 동작을 막는 것으로, 폼 submit 시 페이지가 새로고침되는 것을 막을 때 쓴다. stopPropagation은 이벤트가 부모로 더 전파되지 않게 막는 것이다. 둘은 서로 독립이라 기본 동작만 막아도 버블링은 계속 일어난다.
  - q: input 이벤트와 change 이벤트의 차이는?
    a: input은 값이 바뀔 때마다 즉시 발생해 실시간 검색에 맞다. change는 값이 확정될 때 발생해서 텍스트 입력은 포커스를 잃을 때, select는 선택하는 즉시 발생한다. 실습은 검색창에 input, 판매 상태 select에 change를 걸어 renderCars를 다시 호출했다.
related:
  - dom-manipulation
  - state-driven-rendering
  - html-forms
source: 슬라이드 p.5–10 (등록·수정·삭제·검색·필터), app.js TODO 1–5 (submit, carList click, input, change, 수정 취소)
---

```flow
캡처 :: window → document → … → 부모 (위에서 아래로)
타깃 :: 클릭된 삭제 버튼 = event.target
버블링 :: button → article → carList → … (아래에서 위로)
위임 처리 :: carList 리스너가 dataset.action으로 분기
```

```js
// 카드마다가 아니라 목록(부모)에 리스너 1개 — TODO 2
carList.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]')
  if (!button) return                    // 버튼 밖 클릭은 무시
  const id = Number(button.dataset.id)   // dataset 값은 문자열
  if (button.dataset.action === 'edit') startEdit(id)
  if (button.dataset.action === 'delete') deleteCar(id)
})

searchInput.addEventListener('input', renderCars)    // TODO 3: 타이핑할 때마다
statusFilter.addEventListener('change', renderCars)  // TODO 4: 선택이 바뀔 때
cancelEditButton.addEventListener('click', resetForm) // TODO 5: 수정 취소
```

> [!warn] 헷갈리기 쉬움
> 리스너에는 함수 자체(`renderCars`)를 넘긴다. `renderCars()`로 쓰면 등록 시점에 바로 실행되고 그 반환값(undefined)이 리스너로 넘어간다.
