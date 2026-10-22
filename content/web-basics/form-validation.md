---
title: 입력 값 검증
en: Form Validation
summary: 제출 전에 필수 항목·숫자 범위를 확인하고, 실패하면 알리고 멈추기 — 클라이언트 검증은 UX용, 최종 검증은 서버
importance: 2
order: 12
tags:
  - JavaScript
  - 폼
  - 검증
keypoints:
  - input 값은 항상 문자열 — Number()로 바꾼 뒤 비교한다
  - 빈 값 → 범위 순으로 검사하고 첫 실패에서 멈춘다
  - 클라이언트 검증은 우회 가능 — 서버에서 다시 검증한다
qa:
  - q: 프론트엔드에서 검증했는데 서버에서도 검증해야 하나?
    a: 해야 한다. 클라이언트 검증은 개발자 도구로 코드를 바꾸거나 API를 직접 호출하면 쉽게 우회되므로 보안 수단이 아니다. 프론트 검증은 사용자에게 즉시 피드백을 주는 UX 목적이고, 데이터 무결성과 보안은 서버 검증이 책임진다.
  - q: HTML 속성 검증과 JS 검증은 어떻게 다른가?
    a: required, min, max 같은 HTML 속성은 코드 없이 브라우저가 제출을 막고 기본 메시지를 보여 준다. JS 검증은 메시지 문구, 항목 간 조건, 현재 연도 같은 동적 기준을 자유롭게 정할 수 있다. 실습은 항목별 안내 문구를 alert로 정확히 보여 줘야 해서 getCarFromForm 함수에서 JS로 검증했다.
related:
  - html-forms
  - event-delegation
  - array-methods-crud
source: 슬라이드 p.5 (입력 값 검증 메시지 6종), p.6 (수정 완료도 같은 검증), app.js getCarFromForm TODO 6
---

```flow
submit :: 등록 또는 수정 완료 클릭 (같은 검증 사용)
값 읽기 :: value는 문자열 → trim(), Number() 변환
순서대로 검사 :: 제조사 → 모델명 → 연식 → 가격 → 주행거리 → 연료
실패 :: alert 후 null 반환 — 배열에 반영 안 함
성공 :: 차량 객체 반환 → 배열 반영 → 폼 초기화
```

| 순서 | 항목 | 규칙 | alert 메시지 |
| --- | --- | --- | --- |
| 1 | 제조사 | 선택 필수 (빈 value) | 제조사를 선택하세요. |
| 2 | 모델명 | trim 후 빈 값 금지 | 모델명을 입력하세요. |
| 3 | 연식 | 1990 ~ 현재 연도 | 연식은 1990년부터 2026년(현재 년도) 사이로 입력하세요. |
| 4 | 가격 | 1 이상 | 가격은 1이상 입력하세요. |
| 5 | 주행거리 | 0 이상 | 주행거리는 0이상 입력하세요. |
| 6 | 연료 | 선택 필수 | 연료를 선택하세요. |

```js
// getCarFromForm — TODO 6 (값 읽기·Number 변환은 제공 코드)
if (!maker) { alert('제조사를 선택하세요.'); return null }
if (!model) { alert('모델명을 입력하세요.'); return null }
if (!yearText || year < 1990 || year >= maxYear) {      // maxYear = 올해 + 1
  alert('연식은 1990년부터 현재 년도 사이로 입력하세요.'); return null
}
if (!priceText || price < 1) { alert('가격은 1이상 입력하세요.'); return null }
if (!mileageText || mileage < 0) { alert('주행거리는 0이상 입력하세요.'); return null }
if (!fuel) { alert('연료를 선택하세요.'); return null }
return { maker, model, year, mileage, price, fuel, status }
```

> [!warn] 헷갈리기 쉬움
> `Number('')`는 0이라 빈 주행거리가 "0 이상"을 통과한다. `NaN`은 어떤 비교도 false라 범위 검사를 통과한다. 그래서 문자열이 비었는지(`!yearText`)를 먼저 본다.
