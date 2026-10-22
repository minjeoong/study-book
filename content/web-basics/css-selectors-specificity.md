---
title: CSS 선택자와 우선순위
en: CSS Selectors, Specificity, Cascade
summary: 스타일을 적용할 요소를 고르는 문법과, 규칙이 겹칠 때 어느 쪽이 이기는지 정하는 계산 규칙
importance: 3
order: 4
tags:
  - CSS
  - 선택자
  - 명시도
keypoints:
  - 우선순위는 인라인 > id > class·속성·가상 클래스 > 태그
  - 점수가 같으면 나중에 선언된 규칙이 이긴다 (cascade)
  - "!important는 계산을 무시하고 이긴다 — 남용 금지"
qa:
  - q: CSS 우선순위(명시도)는 어떻게 계산하나?
    a: 선택자를 (id 개수, class·속성·가상 클래스 개수, 태그·가상 요소 개수) 세 자리로 세어 앞자리부터 비교한다. 예를 들어 실습의 submitButton id 선택자는 (1,0,0), .status-badge.selling은 (0,2,0)이라 id 쪽이 이긴다. 점수가 같으면 나중에 선언된 규칙이 적용되고, 인라인 style과 !important는 그보다 위에 있다.
  - q: 상속되는 속성과 안 되는 속성은?
    a: color, font 같은 글자 관련 속성은 자식에게 상속되고, margin, padding, border, width 같은 박스 관련 속성은 상속되지 않는다. input, button 같은 폼 요소는 브라우저 기본 글꼴을 쓰므로 실습처럼 font inherit를 지정해 부모 글꼴을 따르게 한다.
related:
  - box-model
  - flexbox-grid
  - dom-manipulation
source: style.css (전체 선택자, id·클래스·복합·자손 선택자, input:focus, font inherit)
---

```layers
!important :: 모든 규칙 위 — 최후의 수단
인라인 style :: style 속성에 직접 작성
ID 선택자 :: #submitButton — (1,0,0)
클래스·속성·가상 클래스 :: .car-card, [type="number"], :focus — (0,1,0)
태그·가상 요소 :: input, ::before — (0,0,1)
```

| 종류 | 예 (style.css) | 명시도 |
| --- | --- | --- |
| 전체 | `*` | 0,0,0 |
| 태그 | `body`, `input` | 0,0,1 |
| 클래스 | `.car-card` | 0,1,0 |
| 복합 (두 클래스를 모두 가진 요소) | `.status-badge.selling` | 0,2,0 |
| 자손 (안쪽 어디든) | `.card-actions button` | 0,1,1 |
| 가상 클래스 | `input:focus` | 0,1,1 |
| ID | `#submitButton` | 1,0,0 |
| 그룹 (쉼표) | `.form-card, .list-card` | 각각 따로 계산 |

> [!warn] 헷갈리기 쉬움
> `.status-badge.selling`(붙여 씀 = 한 요소가 두 클래스 모두)과 `.status-badge .selling`(띄어 씀 = 자손)은 공백 하나로 뜻이 완전히 다르다. 실습의 판매 상태 배지는 붙여 쓴 복합 선택자로 색을 바꾼다.
