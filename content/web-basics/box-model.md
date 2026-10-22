---
title: 박스 모델과 box-sizing
en: CSS Box Model
summary: 모든 요소는 content·padding·border·margin 네 겹 박스 — box-sizing이 width의 기준을 정한다
importance: 3
order: 5
tags:
  - CSS
  - 박스 모델
  - 레이아웃
keypoints:
  - 안쪽부터 content → padding → border → margin
  - content-box(기본)는 width에 padding·border가 빠져 있다
  - border-box는 width 안에 포함 — 실습은 전체 선택자로 일괄 적용
qa:
  - q: "box-sizing: border-box를 쓰는 이유는?"
    a: 기본값 content-box에서는 width 100%인 input에 padding과 border를 주면 실제 너비가 부모보다 커져 밖으로 넘친다. border-box는 width에 padding과 border를 포함해 계산하므로 지정한 크기가 곧 화면 크기가 되어 레이아웃 계산이 쉬워진다. 그래서 실습처럼 전체 선택자에 border-box를 거는 것이 관례다.
  - q: margin과 padding의 차이는?
    a: padding은 테두리 안쪽 여백이라 배경색이 칠해지고, margin은 테두리 바깥 여백이라 다른 요소와의 간격을 만든다. 세로로 인접한 블록의 margin은 큰 값 하나로 합쳐지는 마진 상쇄가 일어나며, flex나 grid 아이템 사이에서는 일어나지 않는다.
related:
  - css-selectors-specificity
  - flexbox-grid
source: style.css (* box-sizing, .form-card의 padding·border·border-radius, .container의 margin auto)
---

```layers
margin :: 바깥 여백 — 다른 요소와 간격, 배경 없음
border :: 테두리 — 1px solid, border-radius로 둥글게
padding :: 안쪽 여백 — 배경색이 칠해짐
content :: 실제 내용 — content-box일 때 width·height의 기준
```

```formula
content-box 실제 너비 = width + padding × 2 + border × 2 :: width 300, padding 24, border 1 → 350px
border-box 실제 너비 = width :: padding·border가 안으로 들어가 → 300px 그대로
```

```css
* { box-sizing: border-box; }   /* 실습 style.css 첫 줄 */

.container {
  width: min(1100px, 92%);      /* 둘 중 작은 값 — 큰 화면 1100px, 작은 화면 92% */
  margin: 32px auto;            /* 좌우 auto → 가운데 정렬 */
}
```

> [!tip] 면접 팁
> 개발자 도구 Elements 탭의 박스 그림(margin, border, padding, content)을 떠올리며 설명하면 말이 쉽게 나온다.
