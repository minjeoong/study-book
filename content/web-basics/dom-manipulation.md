---
title: DOM 조회와 조작
en: DOM Manipulation
summary: HTML을 JS 객체 트리(DOM)로 다루기 — querySelector로 찾고 createElement·appendChild로 만들어 붙인다
importance: 3
order: 9
tags:
  - JavaScript
  - DOM
  - 보안
keypoints:
  - querySelector는 CSS 선택자로 첫 요소 하나를 찾는다
  - 사용자 입력은 textContent로 — innerHTML은 XSS 위험
  - data-* 속성은 dataset으로 읽고, 값은 항상 문자열
qa:
  - q: DOM이란 무엇인가?
    a: 브라우저가 HTML을 파싱해 메모리에 만든 문서의 객체 트리로, 각 태그가 노드가 된다. JavaScript는 document 객체로 이 트리를 조회·생성·수정·삭제해 화면을 바꾼다. HTML 파일 자체가 아니라 메모리 속 표현이라 JS로 바꾼 내용은 소스 보기에는 나오지 않고 개발자 도구 Elements에서 보인다.
  - q: innerHTML과 textContent의 차이는?
    a: innerHTML은 문자열을 HTML로 해석해 태그를 만들고, textContent는 문자열을 그대로 텍스트로 넣는다. 사용자 입력을 innerHTML로 넣으면 img onerror 같은 코드가 실행되는 XSS 공격에 노출될 수 있다. 실습 createCarCard는 사용자가 입력한 모델명을 textContent로 넣고, innerHTML은 목록을 비우는 빈 문자열 대입에만 썼다.
related:
  - browser-rendering
  - event-delegation
  - state-driven-rendering
source: app.js 1–18행 (querySelector), createCarCard (createElement, className, dataset, appendChild), renderCars (innerHTML, hidden, textContent)
---

```flow
찾기 :: document.querySelector('#carList')
만들기 :: document.createElement('article')
채우기 :: textContent, className, dataset.id
붙이기 :: carList.appendChild(card)
```

| 하는 일 | API | 실습에서 |
| --- | --- | --- |
| 요소 찾기 | `querySelector` / `querySelectorAll` | 파일 상단 요소 참조 15개 |
| 요소 만들기 | `createElement` | 카드 article, h3, p, span, button |
| 글자 넣기 | `textContent` | 차량명, 연식·연료·주행거리, 가격 |
| 클래스 지정 | `className` / `classList.add` | `status-badge selling` |
| 데이터 심기 | `dataset` (data-*) | `data-action="edit"`, `data-id` |
| 자식 붙이기 | `appendChild` / `append` | 카드 → carList |
| 보이기·숨기기 | `hidden` 속성 | 빈 목록 메시지, 수정 취소 버튼 |
| 비우기 | `innerHTML = ''` | 다시 그리기 전 목록 초기화 |

> [!warn] 헷갈리기 쉬움
> `querySelectorAll`이 돌려주는 NodeList는 배열이 아니다. forEach는 되지만 map, filter는 없어서 `Array.from()`이나 스프레드로 바꿔 써야 한다.
