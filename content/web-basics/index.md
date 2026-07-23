---
summary: 웹 화면을 이루는 세 언어 — HTML(구조), CSS(표현), JavaScript(동작)를 엮어 중고차 목록 CRUD 화면을 완성
keywords:
  - HTML
  - CSS
  - JavaScript
  - 시맨틱 태그
  - 박스 모델
  - Flexbox
  - Grid
  - 미디어 쿼리
  - DOM
  - 이벤트 위임
  - CRUD
materials:
  - file: slides-day1-html-css-js.pdf
    title: "강의 슬라이드 Day1 — HTML, CSS, JavaScript"
    type: slides
    date: 2026-07-23
  - file: slides-day2-html-css-js-crud-guide.pdf
    title: 종합실습 가이드 — 중고차 목록 관리 CRUD (HTML, CSS 레이아웃, JavaScript)
    type: slides
    date: 2026-07-24
  - file: lab-used-car-crud-starter.zip
    title: 실습 스타터 코드 — index.html, style.css, app.js (수강생 구현 TODO 28개)
    type: lab
    date: 2026-07-24
---

## 한눈에 보기

```layers
HTML :: 구조와 의미 — header, main, section, form, label, input, select
CSS :: 표현과 배치 — 박스 모델, Grid 2열, Flex 정렬, 미디어 쿼리
JavaScript :: 동작 — DOM 조회·생성, 이벤트 처리, 입력 검증
상태 (데이터) :: cars 배열 + editingId — 화면은 이 상태를 그린 결과
```

- 웹 화면은 세 언어가 역할을 나눠 맡음: HTML은 무엇이 있는지, CSS는 어떻게 보이는지, JS는 어떻게 동작하는지.
- Day 2 종합실습은 셋을 한 번에 엮어 중고차 목록 관리 화면(등록, 조회, 수정, 삭제, 검색, 필터)을 완성하는 과제.
- JS 핵심은 "배열(상태)을 바꾸고 → renderCars()로 목록을 다시 그린다"는 상태 기반 렌더링 — 다음 Vue.js 과목의 반응성으로 이어짐.

## 수업 흐름

**Day 1 (07-23)** — HTML, CSS, JavaScript 기초 (자료 받으면 보강)

**Day 2 (07-24)** — 종합실습: 중고차 목록 관리 CRUD

1. 완성 화면과 기능 6개(등록, 조회, 수정, 삭제, 검색, 필터), 제공 파일 3개 소개 — p.1–2
2. HTML 기본 화면 (20점): 헤더, 입력 폼 7항목, 등록 버튼, 검색·필터 영역 — p.3
3. CSS 레이아웃 (20점): 입력/목록 2열, 차량 카드 스타일, 800px 이하 1열 반응형 — p.4
4. JavaScript CRUD: 등록, 입력 값 검증, 수정·수정 완료·수정 취소, 삭제, 검색, 필터 — p.5–10
5. 최종 확인 체크리스트, 제출(`SKALA번호_반_이름_HTML.zip`) — p.11

## 실습 정리

- 목표: 제공된 3개 파일의 "수강생 구현" TODO를 채워 화면이 요구사항대로 동작하게 만들기
- 데이터: JS 배열 `cars`의 예시 2대(현대 쏘나타, 기아 K5) — 브라우저 저장소 미사용, 새로고침하면 처음 데이터로 복귀
- 제공 코드: `renderCars()`, `getFilteredCars()`, `createCarCard()`, `resetForm()` — 목록 출력은 이미 완성되어 있음

| 파일 | TODO | 할 일 |
| --- | --- | --- |
| index.html | #1–#10 | 헤더, label + input/select 7개, `type="number"`, placeholder, 등록·수정 취소 버튼, 검색 input + 상태 필터 select |
| style.css | #1–#10 | `.container` 2열 grid, `.form-row` 세로 배치, 버튼·검색·카드 버튼 영역 flex, `.car-list` 카드 grid, `@media (max-width: 800px)` 1열 |
| app.js | #1–#8 | submit(등록/수정), 카드 버튼 이벤트 위임, input·change 시 재렌더, 수정 취소, 입력 검증, `startEdit`, `deleteCar` |

핵심 코드 — 등록과 수정을 한 submit 핸들러에서 처리 (TODO #1, 풀이 예시)

```js
carForm.addEventListener('submit', function (event) {
  event.preventDefault()                 // 폼 기본 제출(새로고침) 막기
  const car = getCarFromForm()           // 검증 실패 시 null
  if (!car) return

  if (editingId === null) {
    cars.push({ id: Date.now(), ...car })                                       // 등록
  } else {
    cars = cars.map((c) => (c.id === editingId ? { ...car, id: editingId } : c)) // 수정
  }
  resetForm()                            // editingId = null, 버튼 '등록'으로
  renderCars()                           // 상태 기준으로 목록 다시 그리기
})
```

핵심 코드 — 다시 그려지는 카드 버튼은 부모 목록 하나로 처리 (TODO #2, 이벤트 위임)

```js
carList.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]')
  if (!button) return
  const id = Number(button.dataset.id)   // data-* 값은 문자열
  if (button.dataset.action === 'edit') startEdit(id)
  if (button.dataset.action === 'delete') deleteCar(id)
})
```
