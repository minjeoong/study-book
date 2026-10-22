---
title: Flexbox와 Grid 레이아웃
en: Flexbox vs CSS Grid
summary: Flex는 한 방향(행 또는 열) 정렬, Grid는 행과 열 두 방향 배치 — 실습은 큰 틀은 Grid, 버튼 줄은 Flex
importance: 3
order: 6
tags:
  - CSS
  - 레이아웃
  - Flexbox
  - Grid
keypoints:
  - Flex는 1차원 — 버튼 줄, 헤더 양끝 정렬처럼 한 줄 배치
  - Grid는 2차원 — 페이지 2열, 카드 목록 같은 격자 배치
  - gap으로 아이템 사이 간격을 margin 없이 지정한다
qa:
  - q: Flexbox와 Grid는 각각 언제 쓰나?
    a: Flexbox는 한 축을 따라 아이템을 나열하고 정렬하는 1차원 레이아웃이라 버튼 묶음, 내비게이션, 헤더의 좌우 정렬에 맞다. Grid는 행과 열을 함께 정의하는 2차원 레이아웃이라 페이지 골격이나 카드 격자에 맞다. 실습에서도 입력·목록 2열과 카드 목록은 Grid, 버튼 영역과 목록 헤더는 Flex로 구성했다.
  - q: justify-content와 align-items의 차이는?
    a: justify-content는 주축(flex-direction 방향, 기본은 가로) 정렬이고 align-items는 교차축(기본은 세로) 정렬이다. 실습의 목록 헤더는 justify-content space-between으로 제목과 대수 텍스트를 양 끝에, align-items center로 세로 가운데에 맞췄다. flex-direction이 column이면 두 축이 서로 바뀐다.
related:
  - box-model
  - responsive-media-query
source: 슬라이드 p.4 (CSS 레이아웃 요구사항 1–3), style.css TODO 1–9, .list-header
---

```compare
Flexbox | Grid
차원 | 1차원 (한 줄) | 2차원 (행 × 열)
출발점 | 콘텐츠 크기에서 시작 | 컨테이너에 틀을 먼저 정의
핵심 속성 | justify-content, align-items, flex | grid-template-columns, fr, repeat, gap
실습 사용처 | .list-header, .button-area, .search-area, .card-actions | .container 2열, .car-form, .car-list 카드 격자
```

```css
/* 풀이 예시 — 크기·간격 값은 자유 */
.container {                       /* TODO 1: 입력 | 목록 2열 */
  display: grid;
  grid-template-columns: 320px 1fr;  /* 왼쪽 고정, 오른쪽은 남는 공간 전부 */
  gap: 24px;
  align-items: start;
}
.car-list {                        /* TODO 6: 카드 격자, 폭에 따라 칸 수 자동 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.button-area, .card-actions {      /* TODO 4, 8: 버튼 한 줄 */
  display: flex;
  gap: 8px;
}
.card-actions button { flex: 1; }  /* TODO 9: 수정·삭제 버튼 같은 너비 */
```

> [!tip] 면접 팁
> `fr`은 남는 공간의 비율, `minmax(220px, 1fr)`은 "최소 220px, 남으면 늘어남", `auto-fill`은 "들어가는 만큼 칸 생성"으로 설명하면 된다.
