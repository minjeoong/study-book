---
title: 상태 기반 렌더링
en: State-driven Rendering
summary: 화면을 직접 고치지 않고 데이터(상태)를 바꾼 뒤 render 함수로 다시 그리는 패턴 — Vue·React의 출발점
importance: 3
order: 13
tags:
  - JavaScript
  - 상태 관리
  - 렌더링
  - Vue
keypoints:
  - 상태 = cars 배열 + editingId, 화면 = 상태를 그린 결과
  - 모든 변경은 상태 수정 → renderCars() 한 길로 통일
  - editingId가 null이면 등록 모드, id가 있으면 수정 모드
qa:
  - q: 바닐라 JS로 CRUD 화면을 만들 때 데이터와 화면을 어떻게 맞췄나?
    a: 차량 목록은 cars 배열, 등록·수정 모드는 editingId 하나로 상태를 정의했다. 등록, 수정, 삭제, 검색 어떤 동작이든 상태만 바꾼 다음 renderCars()가 목록을 비우고 현재 상태 기준으로 카드를 다시 만들게 했다. 화면을 그리는 경로가 하나뿐이라 데이터와 화면이 어긋나는 버그가 줄어든다.
  - q: 매번 전체를 다시 그리는 방식의 한계와 프레임워크의 해결책은?
    a: 데이터가 조금만 바뀌어도 목록 DOM 전체를 지우고 다시 만들어서 항목이 많으면 느려지고, 포커스나 스크롤 같은 화면 상태도 사라진다. Vue와 React는 상태 변경을 자동으로 감지하고 가상 DOM으로 이전 결과와 비교해 바뀐 부분만 실제 DOM에 반영한다. 실습의 renderCars 호출이 프레임워크에서 자동화되는 바로 그 부분이다.
  - q: 새로고침하면 등록한 차량이 사라진다. 유지하려면?
    a: 상태가 JS 변수(메모리)에만 있어서 새로고침하면 처음 배열로 돌아간다. 브라우저에 남기려면 변경 때마다 localStorage에 JSON.stringify로 저장하고 시작할 때 JSON.parse로 읽어 오면 된다. 여러 기기·사용자와 공유해야 하면 서버 API와 DB에 저장해야 한다.
related:
  - event-delegation
  - array-methods-crud
  - dom-manipulation
source: 슬라이드 p.5–11 (등록·수정 모드 버튼 전환, 새로고침 시 초기화, 브라우저 저장 미사용), app.js renderCars, editingId, resetForm
---

```flow
사용자 동작 :: 등록, 수정, 삭제, 검색어 입력, 필터 선택
이벤트 핸들러 :: submit, click(위임), input, change
상태 변경 :: cars 배열 / editingId 수정
renderCars() :: 목록 비우고 filter 결과로 카드 다시 생성
화면 :: 카드 목록 + "전체 N대 / 표시 M대"
```

```compare
등록 모드 | 수정 모드
editingId | null | 수정 중인 차량 id
버튼 | 등록 | 수정 완료 + 수정 취소
submit 처리 | push로 추가 | map으로 교체
끝나면 | resetForm() → 등록 모드 | resetForm() → 등록 모드
```

```js
// 제공 코드(요약) — 상태를 읽어 화면 전체를 다시 그린다
function renderCars() {
  const filteredCars = getFilteredCars()          // 상태 → 보여 줄 데이터
  carList.innerHTML = ''                          // 기존 카드 비우기
  emptyMessage.hidden = filteredCars.length > 0
  countText.textContent = `전체 ${cars.length}대 / 표시 ${filteredCars.length}대`
  filteredCars.forEach((car) => carList.appendChild(createCarCard(car)))
}
```

> [!tip] 다음 과목 연결
> Vue.js에서는 cars를 반응형 상태(ref)로 두고 renderCars 대신 템플릿의 v-for로 목록을 선언한다. 상태만 바꾸면 화면이 자동으로 갱신된다.
