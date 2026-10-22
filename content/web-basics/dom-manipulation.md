---
title: DOM 조회와 조작
en: DOM (Document Object Model) Manipulation
summary: HTML을 JS 객체 트리(DOM)로 다루기 — querySelector로 찾고 createElement·appendChild로 만들어 붙인다
importance: 3
order: 12
tags:
  - JavaScript
  - DOM
  - 보안
keypoints:
  - DOM은 문서를 노드 트리로 표현한 표준 인터페이스(W3C·WHATWG)
  - 사용자 입력은 textContent로 — innerHTML은 XSS 위험
  - querySelector는 CSS 선택자로 첫 요소 하나, dataset 값은 항상 문자열
qa:
  - q: DOM이란 무엇인가요?
    a: 브라우저가 HTML을 파싱해 메모리에 만든 문서의 객체 트리로, document 아래 각 태그가 Element 노드, 속성이 Attribute 노드, 글자가 Text 노드가 됩니다. JavaScript는 DOM API로 이 트리를 조회·생성·수정·삭제하고 이벤트를 처리해 화면을 바꿉니다. HTML 파일 자체가 아니라 메모리 속 표현이라 JS로 바꾼 내용은 소스 보기가 아니라 개발자 도구 Elements에서 보입니다.
  - q: innerHTML과 textContent(innerText)의 차이는?
    a: innerHTML은 문자열을 HTML로 해석해 태그를 만들고, textContent는 문자열을 그대로 텍스트로 넣습니다. 사용자 입력을 innerHTML로 넣으면 img onerror 같은 코드가 실행되는 XSS 공격에 노출될 수 있습니다. Day2 실습 createCarCard는 사용자가 입력한 모델명을 textContent로 넣고, innerHTML은 목록을 비우는 빈 문자열 대입에만 썼습니다.
related:
  - browser-rendering
  - event-delegation
  - state-driven-rendering
source: Day1 슬라이드 p.171 (Output — innerHTML, document.write, alert, console.log), p.235–238 (HTML DOM, DOM Tree, DOM API, Selecting Elements, Changing HTML·속성·style), Day2 app.js 1–18행 (querySelector), createCarCard (createElement, className, dataset, appendChild), renderCars (innerHTML, hidden, textContent)
---

```layers
document :: 모든 노드의 주인 — DOM API의 시작점
Element 노드 :: html, head, body, h1, a …
Attribute 노드 :: href, id, class
Text 노드 :: 태그 안의 글자 "My Header"
```

| 하는 일 | API | 실습에서 |
| --- | --- | --- |
| 요소 찾기 | `getElementById`, `getElementsByClassName` / `querySelector`, `querySelectorAll` | 파일 상단 요소 참조 15개 (querySelector) |
| 요소 만들기 | `createElement` | 카드 article, h3, p, span, button |
| 글자 넣기 | `textContent` | 차량명, 연식·연료·주행거리, 가격 |
| 속성·스타일 | `el.src = ...`, `setAttribute`, `el.style.color` | |
| 클래스 지정 | `className` / `classList.add` | `status-badge selling` |
| 데이터 심기 | `dataset` (data-*) | `data-action="edit"`, `data-id` |
| 자식 붙이기 | `appendChild` / `append` | 카드 → carList |
| 보이기·숨기기 | `hidden` 속성 | 빈 목록 메시지, 수정 취소 버튼 |
| 비우기 | `innerHTML = ''` | 다시 그리기 전 목록 초기화 |

> [!warn] 헷갈리기 쉬움
> `querySelectorAll`이 돌려주는 NodeList는 배열이 아니다. forEach는 되지만 map, filter는 없어서 `Array.from()`이나 스프레드로 바꿔 써야 한다. Vue의 `v-html`도 내부적으로 innerHTML이라 같은 XSS 위험이 있다.
