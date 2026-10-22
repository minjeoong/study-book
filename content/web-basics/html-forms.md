---
title: HTML 폼과 입력 요소
en: HTML Forms
summary: form 안의 label, input, select, button으로 입력을 받는 구조 — type·속성으로 입력을 제한한다
importance: 2
order: 2
tags:
  - HTML
  - 폼
  - 접근성
keypoints:
  - label의 for와 input의 id를 맞춰 클릭 영역·접근성 확보
  - type="number", placeholder, select로 입력을 안내·제한
  - form 안 button 기본값은 submit, 일반 버튼은 type="button"
qa:
  - q: form 안의 버튼을 눌렀더니 페이지가 새로고침된다. 왜인가?
    a: form 안의 button은 type을 지정하지 않으면 기본값이 submit이라 폼이 제출되면서 페이지가 다시 로드된다. JS로 처리할 때는 submit 이벤트에서 event.preventDefault()로 기본 동작을 막고, 제출용이 아닌 버튼은 type="button"으로 지정한다. 실습의 등록 버튼은 submit, 수정 취소 버튼은 button으로 구분한다.
  - q: label을 input과 연결하는 이유는?
    a: label의 for 값과 input의 id를 맞추면 라벨을 클릭해도 입력칸에 포커스가 가서 클릭 영역이 넓어진다. 스크린리더가 입력칸을 읽을 때 라벨 텍스트를 함께 읽어 주므로 접근성 측면에서 필수에 가깝다. placeholder는 입력을 시작하면 사라지므로 label을 대신할 수 없다.
related:
  - semantic-html
  - form-validation
  - event-delegation
source: 슬라이드 p.3 (HTML 기본 화면 요구사항 1–6), index.html TODO 2–10
---

```layers
form#carForm :: submit 이벤트의 주인 — 등록·수정 완료 모두 여기서 처리
div.form-row × 7 :: label + input 또는 select 한 쌍
div.button-area :: 등록(submit) + 수정 취소(button, 처음엔 hidden)
```

| 항목 | 요소 | id | placeholder / 옵션 |
| --- | --- | --- | --- |
| 제조사 | `select` | makerInput | 제조사 선택, 현대, 기아, 제네시스, 쉐보레, 르노 |
| 모델명 | `input type="text"` | modelInput | 예: 쏘나타 |
| 연식 | `input type="number"` | yearInput | 예: 2021 |
| 주행거리(km) | `input type="number"` | mileageInput | 예: 43000 |
| 가격(만원) | `input type="number"` | priceInput | 예: 1850 |
| 연료 | `select` | fuelInput | 연료 선택, 가솔린, 디젤, LPG, 하이브리드, 전기 |
| 판매 상태 | `select` | statusInput | 판매중, 예약중, 판매완료 |
| 검색 / 필터 | `input` + `select` | searchInput, statusFilter | 제조사 또는 모델명 검색 / 전체, 판매중, 예약중, 판매완료 |

```html
<div class="form-row">
  <label for="makerInput">제조사</label>
  <select id="makerInput">
    <option value="">제조사 선택</option>  <!-- 빈 값 = 미선택 → JS 검증에 사용 -->
    <option value="현대">현대</option>
    <option value="기아">기아</option>
  </select>
</div>
<div class="button-area">
  <button id="submitButton" type="submit">등록</button>
  <button id="cancelEditButton" type="button" hidden>수정 취소</button>
</div>
```

> [!warn] 헷갈리기 쉬움
> `type="number"`여도 JS에서 읽은 `input.value`는 문자열이다. 비교 전에 `Number()`로 바꿔야 한다.
