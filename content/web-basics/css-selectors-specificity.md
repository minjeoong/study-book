---
title: CSS 선택자와 우선순위
en: CSS Selectors, Specificity, Cascade, Inheritance
summary: 스타일을 적용할 요소를 고르는 문법과, 규칙이 겹칠 때 어느 쪽이 이기는지 정하는 계산 규칙(명시도·캐스케이드·상속)
importance: 3
order: 4
tags:
  - CSS
  - 선택자
  - 명시도
keypoints:
  - 우선순위는 인라인 > id > class·속성·가상 클래스 > 태그·가상 요소
  - 자릿수가 높으면 무조건 승리, 점수가 같으면 나중 규칙이 이긴다 (cascade)
  - "!important는 모든 계산 위 — 디버깅·유지보수가 어려워 최소 사용"
qa:
  - q: CSS 우선순위(명시도)는 어떻게 계산하나요?
    a: 선택자를 인라인, id 개수, class·속성·가상 클래스 개수, 태그·가상 요소 개수의 네 자리로 세어 앞자리부터 비교합니다. 앞자리가 크면 무조건 이겨서 클래스 1개(0,0,1,0)가 태그 15개(0,0,0,15)보다 우선합니다. 점수가 같으면 나중에 선언된 규칙이 적용되고, 전체 선택자 *는 0점이며 !important는 이 계산 위에 있습니다.
  - q: 가상 클래스와 가상 요소의 차이는?
    a: 가상 클래스는 콜론 하나(:)로 hover, focus, first-child, nth-child처럼 요소의 상태나 위치를 선택합니다. 가상 요소는 콜론 두 개(::)로 ::before, ::after, ::first-line처럼 요소의 특정 부분을 꾸미거나 content 속성으로 콘텐츠를 생성합니다. 명시도는 가상 클래스가 클래스와, 가상 요소가 태그와 같습니다.
  - q: 상속되는 속성과 안 되는 속성은?
    a: color, font, line-height, text-align 같은 글자 관련 속성과 list-style은 자식에게 상속되고, margin, padding, border, width, display, position, background 같은 박스·배치 속성은 상속되지 않습니다. 상속되지 않는 속성도 inherit 키워드로 강제로 물려받을 수 있어서, 실습에서는 input과 button에 font inherit를 지정해 부모 글꼴을 따르게 했습니다.
related:
  - box-model
  - flexbox-grid
  - dom-manipulation
source: Day1 슬라이드 p.97–100 (CSS 문법, Inline·Internal·External CSS), p.101–112 (Simple·Grouping·Attribute 선택자, Combinator, Pseudo-class, Pseudo-element, 조합 예), p.113–115 (Specificity, Hierarchy, !important), p.131–132 (상속, inherit), Day2 style.css (전체·클래스·복합·자손 선택자, input:focus, font inherit)
---

```layers
!important :: 모든 규칙 위 — 최후의 수단
인라인 style :: style 속성에 직접 작성 — 1,0,0,0
ID 선택자 :: #submitButton — 0,1,0,0
클래스·속성·가상 클래스 :: .car-card, [type="text"], :hover — 0,0,1,0
태그·가상 요소 :: input, h1, ::before — 0,0,0,1
전체 선택자, :where() :: * — 0,0,0,0
```

| 종류 | 문법 예 | 고르는 대상 |
| --- | --- | --- |
| 그룹 (쉼표) | `.form-card, .list-card` | 각각 따로 — 명시도도 따로 계산 |
| 복합 (붙여 씀) | `.status-badge.selling`, `p.notice` | 두 조건을 모두 가진 한 요소 |
| 자손 (공백) | `.card-actions button` | 안쪽 어디든 있는 후손 |
| 자식 (`>`) | `div > p` | 바로 아래 자식만 |
| 인접 형제 (`+`) / 일반 형제 (`~`) | `h1 + p` / `h1 ~ p` | 바로 다음 형제 하나 / 뒤의 모든 형제 |
| 속성 | `input[type="text"]`, `a[href^="https"]` | 속성 값이 일치·시작·포함 |
| 가상 클래스 | `:hover`, `:focus`, `:nth-child(2n)` | 상태·위치 |
| 가상 요소 | `::before`, `::after`, `::first-letter` | 요소의 일부, 생성 콘텐츠 |

> [!warn] 헷갈리기 쉬움
> `.status-badge.selling`(붙여 씀 = 한 요소가 두 클래스 모두)과 `.status-badge .selling`(띄어 씀 = 자손)은 공백 하나로 뜻이 완전히 다르다. 실습의 판매 상태 배지는 붙여 쓴 복합 선택자로 색을 바꾼다.
