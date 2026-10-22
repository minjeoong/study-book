---
title: 반응형 웹과 미디어 쿼리
en: Responsive Web Design, Media Query, CSS Units
summary: 하나의 HTML로 PC·태블릿·폰 화면에 맞추는 설계 — viewport meta + 유연한 단위·레이아웃 + @media 조건부 스타일
importance: 2
order: 7
tags:
  - CSS
  - 반응형
  - 모바일
keypoints:
  - 3요소 — viewport meta, 미디어 쿼리, 유연한 레이아웃(Grid·Flex)
  - "@media (max-width: 800px)로 좁은 화면에서 2열을 1열로 전환"
  - em은 부모 글꼴, rem은 루트(html) 글꼴, vw·vh는 뷰포트의 1% 기준
qa:
  - q: 반응형 웹은 어떻게 구현하나요?
    a: 먼저 head에 viewport 메타 태그(width=device-width, initial-scale=1.0)를 넣어 기기 폭을 레이아웃 기준 폭으로 삼게 합니다. 그다음 %, fr, rem 같은 유연한 단위와 Grid·Flex로 레이아웃을 짜고, 미디어 쿼리로 브레이크포인트 아래에서 배치를 바꿉니다. 실습에서는 800px 이하일 때 2열 grid를 1열로 바꿔 입력 폼 아래에 목록이 오도록 했습니다.
  - q: 모바일 퍼스트란?
    a: 작은 화면용 기본 스타일을 먼저 쓰고 min-width 미디어 쿼리로 화면이 커질 때마다 스타일을 덧붙이는 방식입니다. 핵심 기능부터 설계하게 되고 모바일 기기가 불필요한 규칙을 덜 처리해 로딩에 유리해서 수업에서도 권장했습니다. 반대로 데스크톱 스타일에서 max-width로 줄여 가는 Day2 실습 방식은 데스크톱 퍼스트입니다.
  - q: em과 rem의 차이는?
    a: em은 부모 요소의 font-size를 기준으로 계산해 요소가 중첩될수록 값이 누적되어 예측이 어렵습니다. rem은 루트 html의 font-size만 기준이라 어디서나 일정하며, 루트가 16px이면 1.5rem은 항상 24px입니다. 글자 크기와 여백을 rem으로 통일하면 사용자가 브라우저 기본 글꼴을 키울 때 전체가 비례해 커집니다.
related:
  - flexbox-grid
  - box-model
source: Day1 슬라이드 p.118–119 (CSS Units — px, em, rem, %, vw, vh), p.154–158 (Responsive Web Design, Viewport, Media Query 브레이크포인트, Grid View, Mobile First), p.164 (미션5 스마트폰에서 보기), Day2 가이드 p.4 (요구사항 4, 1열 레이아웃 화면), index.html viewport meta, style.css TODO 10
---

```flow
viewport meta :: width=device-width, initial-scale=1.0 — 기기 폭 = 레이아웃 기준 폭
유연한 단위 :: %, rem, vw·vh, fr, min(1100px, 92%)
유연한 레이아웃 :: Grid·Flex, repeat(auto-fill, …)
미디어 쿼리 :: 브레이크포인트에서 배치 변경 — 실습은 800px 이하 1열
```

```compare
데스크톱 퍼스트 | 모바일 퍼스트
기본 스타일 | 넓은 화면 기준 | 좁은 화면 기준
미디어 쿼리 | max-width (이 폭 이하일 때) | min-width (이 폭 이상일 때)
설계 순서 | 데스크톱 → 태블릿 → 모바일 | 모바일 → 태블릿 → 데스크톱 (수업 권장)
예 | Day2 실습 (800px 이하 1열), Day1 미션5 (786px 이하 1열) | Day1 브레이크포인트 샘플 768 / 1024 / 1440px
```

```css
/* 화면이 좁아지면 1열로 변경한다 — Day2 TODO 10 */
@media (max-width: 800px) {
  .container {
    grid-template-columns: 1fr;   /* 폼 위, 목록 아래 */
  }
}
```
