---
title: HTML 폼과 입력 요소
en: HTML Forms
summary: form 안의 label·input·select·button으로 입력을 받는 구조 — type·속성으로 제한하고 action·method로 전송
importance: 2
order: 3
tags:
  - HTML
  - 폼
  - 접근성
keypoints:
  - label의 for와 input의 id를 맞춰 클릭 영역·접근성 확보
  - type(email, number, date, radio…)과 required·min·pattern으로 입력 제한
  - form 안 button 기본값은 submit, 일반 버튼은 type="button"
qa:
  - q: form 안의 버튼을 눌렀더니 페이지가 새로고침된다. 왜인가요?
    a: form 안의 button은 type을 지정하지 않으면 기본값이 submit이라 폼이 제출되면서 페이지가 다시 로드됩니다. JS로 처리할 때는 submit 이벤트에서 event.preventDefault()로 기본 동작을 막고, 제출용이 아닌 버튼은 type="button"으로 지정합니다. 실습의 등록 버튼은 submit, 수정 취소 버튼은 button으로 구분했습니다.
  - q: label을 input과 연결하는 이유는?
    a: label의 for 값과 input의 id를 맞추면 라벨을 클릭해도 입력칸에 포커스가 가서 클릭 영역이 넓어집니다. 스크린리더가 입력칸을 읽을 때 라벨 텍스트를 함께 읽어 주므로 접근성 측면에서 필수에 가깝습니다. placeholder는 입력을 시작하면 사라지므로 label을 대신할 수 없습니다.
  - q: 폼의 method GET과 POST는 어떻게 다른가요?
    a: GET은 입력값을 URL 뒤 쿼리스트링(?userId=...)에 붙여 보내 주소창에 노출되고 길이 제한이 있지만 북마크나 공유가 쉽습니다. POST는 값을 요청 바디에 담아 보내 주소창에 드러나지 않아 회원가입이나 로그인처럼 데이터를 생성하거나 민감한 값을 보낼 때 씁니다. Day1 회원가입 과제는 method="get"으로 signUpResult.html에 제출해 보는 연습이었습니다.
related:
  - semantic-html
  - form-validation
  - event-delegation
source: Day1 슬라이드 p.70–80 (Form, Form 속성, Form Elements, Input Types, Input 속성, Button types, fieldset·legend 예제, 과제 회원가입·회원가입결과), Day2 가이드 p.3 (HTML 기본 화면 요구사항 1–6), index.html TODO 2–10
---

```flow
입력 :: label + input / select / textarea, fieldset·legend로 묶기
제출 :: submit 버튼 클릭 또는 Enter → submit 이벤트
브라우저 검증 :: required, type, min/max, pattern을 통과해야 진행
전송 :: action URL로 method에 따라 전송 (get 쿼리스트링 / post 바디)
JS 처리 시 :: preventDefault()로 새로고침 막고 직접 처리 (Day2 실습)
```

| 구분 | 값 | 포인트 |
| --- | --- | --- |
| input type | text, password, email, number, tel, url, date, checkbox, radio, file, hidden, range | email·url은 형식 검증, radio는 같은 name끼리 하나만 선택 |
| 검증 속성 | required, min / max, minlength / maxlength, pattern, step | 제출 시 브라우저가 검사 |
| 상태 속성 | value, placeholder, readonly, disabled, autofocus | disabled 값은 제출되지 않음 |
| button type | submit(기본), reset, button | 실습: 등록 submit, 수정 취소 button |
| 기타 요소 | select + option, textarea, fieldset + legend, datalist | Day1 회원가입 폼: 계정 정보 · 프로필 · 자기소개 fieldset |
| Day2 실습 필드 | 제조사·연료·판매 상태 select, 모델명 text, 연식·주행거리·가격 number | 빈 value 옵션 = 미선택 → JS 검증에 사용 |

```html
<div class="form-row">
  <label for="makerInput">제조사</label>
  <select id="makerInput">
    <option value="">제조사 선택</option>   <!-- 빈 값 = 미선택 -->
    <option value="현대">현대</option>
  </select>
</div>
<div class="button-area">
  <button id="submitButton" type="submit">등록</button>
  <button id="cancelEditButton" type="button" hidden>수정 취소</button>
</div>
```

> [!warn] 헷갈리기 쉬움
> `type="number"`여도 JS에서 읽은 `input.value`는 문자열이다. 비교 전에 `Number()`로 바꿔야 한다.
