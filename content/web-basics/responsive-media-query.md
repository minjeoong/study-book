---
title: 반응형 웹과 미디어 쿼리
en: Responsive Web Design, Media Query
summary: 화면 폭에 따라 레이아웃을 바꾸는 설계 — viewport meta + 유연한 단위 + @media 조건부 스타일
importance: 2
order: 7
tags:
  - CSS
  - 반응형
  - 모바일
keypoints:
  - viewport meta가 없으면 모바일이 데스크톱 폭으로 축소 표시
  - "@media (max-width: 800px)로 좁은 화면에서 2열을 1열로 전환"
  - 모바일 퍼스트는 min-width로 넓은 화면 스타일을 덧붙인다
qa:
  - q: 반응형 웹은 어떻게 구현하나?
    a: 먼저 viewport 메타 태그로 기기 폭을 레이아웃 기준 폭으로 삼게 한다. 그다음 %, fr, min() 같은 유연한 단위와 Grid·Flex로 레이아웃을 짜고, 미디어 쿼리로 특정 폭 아래에서 배치를 바꾼다. 실습에서는 800px 이하일 때 2열 grid를 1열로 바꿔 입력 폼 아래에 목록이 오도록 했다.
  - q: 모바일 퍼스트란?
    a: 작은 화면용 기본 스타일을 먼저 쓰고 min-width 미디어 쿼리로 넓은 화면 스타일을 추가하는 방식이다. 모바일 기기가 불필요한 규칙을 덜 처리하고, 핵심 콘텐츠부터 설계하게 된다는 장점이 있다. 실습처럼 데스크톱 기준 스타일에서 max-width로 줄여 가는 방식은 데스크톱 퍼스트다.
related:
  - flexbox-grid
  - box-model
source: 슬라이드 p.4 (요구사항 4, 1열 레이아웃 화면), index.html viewport meta, style.css TODO 10
---

```flow
viewport meta :: 기기 폭 = 레이아웃 기준 폭
유연한 단위 :: %, fr, min(1100px, 92%)
유연한 레이아웃 :: Grid·Flex, repeat(auto-fill, …)
미디어 쿼리 :: 800px 이하 → 1열
```

```css
/* 화면이 좁아지면 1열로 변경한다 — TODO 10 */
@media (max-width: 800px) {
  .container {
    grid-template-columns: 1fr;   /* 폼 위, 목록 아래 */
  }
}
```

```compare
데스크톱 퍼스트 | 모바일 퍼스트
기본 스타일 | 넓은 화면 기준 | 좁은 화면 기준
미디어 쿼리 | max-width (이 폭 이하일 때) | min-width (이 폭 이상일 때)
실습 | 이 방식 (800px 이하 1열) | —
```
