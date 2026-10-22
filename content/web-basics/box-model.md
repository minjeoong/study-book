---
title: 박스 모델과 display
en: CSS Box Model, box-sizing, Block vs Inline
summary: 모든 요소는 content·padding·border·margin 네 겹 박스 — box-sizing과 display가 크기 계산 방식을 정한다
importance: 3
order: 5
tags:
  - CSS
  - 박스 모델
  - 레이아웃
keypoints:
  - 안쪽부터 content → padding → border → margin
  - content-box(기본)는 width에 padding·border 제외, border-box는 포함
  - block은 한 줄 전체·크기 지정 가능, inline은 내용 크기만·width/height 무시
qa:
  - q: "box-sizing: border-box를 쓰는 이유는?"
    a: 기본값 content-box에서는 width가 content 영역만 뜻해서, width 100%인 input에 padding과 border를 주면 실제 너비가 부모보다 커져 밖으로 넘칩니다. border-box는 width에 padding과 border를 포함해 계산하므로 지정한 크기가 곧 화면 크기가 되어 레이아웃 계산이 쉬워집니다. 그래서 Day2 실습처럼 전체 선택자에 border-box를 거는 것이 관례입니다.
  - q: margin과 padding의 차이는? 마진 병합이란?
    a: padding은 테두리 안쪽 여백이라 배경색이 칠해지고, margin은 테두리 바깥 여백이라 다른 요소와의 간격을 만듭니다. 세로로 만난 블록의 margin은 더해지지 않고 큰 값 하나로 합쳐지는 마진 병합이 일어나며, 좌우 margin과 flex·grid 아이템 사이에서는 일어나지 않습니다.
  - q: block, inline, inline-block의 차이는?
    a: block(div, p, h1, section)은 새 줄에서 시작해 가로 폭 전체를 차지하고 width, height, margin, padding이 모두 적용됩니다. inline(span, a, strong, em)은 내용 크기만큼만 차지하며 옆으로 나란히 놓이고 width, height가 무시되며 세로 margin도 적용되지 않습니다. inline-block은 배치는 inline처럼 나란히, 크기 지정은 block처럼 가능해서 가로 메뉴를 만들 때 썼습니다.
related:
  - css-selectors-specificity
  - flexbox-grid
source: Day1 슬라이드 p.51–53 (Block & Inline, span, div), p.124–128 (Box Model, width·height·max-width, border, margin·마진 병합, padding), p.135 (미션2 박스 모델), p.141 (inline-block), Day2 style.css (* box-sizing, .form-card padding·border-radius, .container margin auto)
---

```layers
margin :: 바깥 여백 — 다른 요소와 간격, 배경 없음, 세로끼리 병합
border :: 테두리 — border: 1px solid, border-radius로 둥글게
padding :: 안쪽 여백 — 배경색이 칠해짐
content :: 실제 내용 — content-box일 때 width·height의 기준
```

```compare
block | inline | inline-block
줄 배치 | 새 줄에서 시작, 위아래로 쌓임 | 같은 줄에 나란히 | 같은 줄에 나란히
너비 | 부모 폭 전체 | 내용 크기만큼 | 내용 크기 또는 지정값
width·height | 적용 | 무시 | 적용
margin·padding | 모두 적용 | 좌우만 자리 차지 | 모두 적용
예 | div, p, h1~h6, ul, li, form, section | span, a, strong, em, label | 가로 내비게이션 li
```

```formula
content-box 실제 너비 = width + padding × 2 + border × 2 :: width 300, padding 25 → 350px (Day1 p.128 예)
border-box 실제 너비 = width :: padding·border가 안으로 들어가 → 300px 그대로
```

> [!tip] 면접 팁
> 가운데 정렬은 `max-width`(또는 width) + `margin: 0 auto`. shorthand는 위 → 오른쪽 → 아래 → 왼쪽(시계 방향). 개발자 도구 Elements > Computed의 박스 그림을 떠올리며 설명하면 말이 쉽게 나온다.
