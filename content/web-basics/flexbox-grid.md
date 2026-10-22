---
title: Flexbox, Grid와 position
en: Flexbox vs CSS Grid, position
summary: Flex는 한 방향 정렬, Grid는 행 × 열 배치, position은 흐름 밖 배치 — 실습은 골격 Grid, 버튼 줄 Flex
importance: 3
order: 6
tags:
  - CSS
  - 레이아웃
  - Flexbox
  - Grid
keypoints:
  - Flex는 1차원, Grid는 2차원 — 보통 페이지 골격은 Grid, 내부 정렬은 Flex
  - Flex 정렬은 주축 justify-content, 교차축 align-items
  - absolute는 흐름에서 빠져 position 지정된 조상 기준, fixed는 뷰포트 기준
qa:
  - q: Flexbox와 Grid는 각각 언제 쓰나요?
    a: Flexbox는 한 축을 따라 아이템을 나열하고 정렬하는 1차원 레이아웃이라 버튼 묶음, 내비게이션, 헤더의 좌우 정렬에 맞습니다. Grid는 행과 열을 함께 정의하는 2차원 레이아웃이라 페이지 골격이나 카드 격자에 맞습니다. 수업에서도 둘을 함께 쓰라고 정리했고, 실습에서 입력·목록 2열과 카드 목록은 Grid, 버튼 영역과 목록 헤더는 Flex로 구성했습니다.
  - q: justify-content와 align-items의 차이는?
    a: justify-content는 주축(flex-direction 방향, 기본은 가로) 정렬이고 align-items는 교차축(기본은 세로) 정렬입니다. 실습의 목록 헤더는 justify-content space-between으로 제목과 대수 텍스트를 양 끝에, align-items center로 세로 가운데에 맞췄습니다. flex-direction이 column이면 두 축이 서로 바뀝니다.
  - q: position의 relative, absolute, fixed, sticky 차이는?
    a: 기본값 static은 문서 흐름대로 놓이고 top, left가 적용되지 않습니다. relative는 원래 자리를 차지한 채 그 위치를 기준으로 이동하고, absolute는 흐름에서 빠져 공간을 차지하지 않으며 position이 지정된 가장 가까운 조상을 기준으로 배치됩니다. fixed는 뷰포트 기준이라 스크롤해도 고정되고, sticky는 평소엔 relative처럼 있다가 스크롤 임계점에서 fixed처럼 붙어 헤더나 메뉴에 씁니다. 겹칠 때 순서는 z-index로 정합니다.
related:
  - box-model
  - responsive-media-query
source: Day1 슬라이드 p.129–130 (position, z-index), p.139–147 (Layout 방식 float·inline-block·Flexbox·Grid, Flex Container·Item, Grid Container·Item), p.163 (미션4 Flex와 Grid 레이아웃), Day2 가이드 p.4 (CSS 레이아웃 요구사항 1–3), style.css TODO 1–9, .list-header
---

```compare
Flexbox | Grid
차원 | 1차원 (한 줄) | 2차원 (행 × 열)
구성 | Flex Container + Item, Main Axis · Cross Axis | Grid Container + Item, Line · Track · Cell · Area
컨테이너 속성 | flex-direction, flex-wrap, justify-content, align-items | grid-template-columns·rows, fr, repeat, gap
아이템 속성 | flex(grow shrink basis), order, align-self | grid-column 1 / 3 (선 번호 기준), grid-area, justify-self
실습 사용처 | .list-header, .button-area, .search-area, .card-actions | .container 2열, .car-form, .car-list 카드 격자
```

| position | 기준 | 원래 자리 | 쓰임 |
| --- | --- | --- | --- |
| static (기본) | 문서 흐름 | 차지 | top·left 무시 |
| relative | 자기 원래 위치 | 차지 | 살짝 이동, absolute 자식의 기준점 |
| absolute | position 지정된 가장 가까운 조상 | 빠짐 | 배지, 툴팁, 겹치는 요소 |
| fixed | 뷰포트 | 빠짐 | 스크롤해도 고정된 버튼·배너 |
| sticky | 스크롤 위치 | 차지 | 임계점에서 붙는 헤더·메뉴 |

```css
/* Day2 풀이 예시 — 크기·간격 값은 자유 */
.container {                       /* TODO 1: 입력 | 목록 2열 */
  display: grid;
  grid-template-columns: 320px 1fr;  /* 왼쪽 고정, 오른쪽은 남는 공간 전부 */
  gap: 24px;
}
.car-list {                        /* TODO 6: 폭에 따라 칸 수 자동 — 최소 220px, 남으면 늘어남 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.button-area, .card-actions { display: flex; gap: 8px; }   /* TODO 4, 8 */
.card-actions button { flex: 1; }  /* TODO 9: 수정·삭제 버튼 같은 너비 (flex-grow 1) */
```

> [!tip] 면접 팁
> 레이아웃 방식의 변천으로 정리하면 쉽다. float(요소 겹침 문제) → inline-block(공백 문제) → Flexbox(1차원 정렬) → Grid(2차원 페이지 구조). `fr`은 Grid 전용 단위로 남는 공간의 비율이다.
