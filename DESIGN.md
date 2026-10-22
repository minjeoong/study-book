---
name: SKALA 개념 운행표
description: 커리큘럼을 인쇄된 열차 시각표로 읽는 SKALA 4기 개인 학습 노트
colors:
  signal: "#d71920"
  signal-ink: "#b3131a"
  on-signal: "#ffffff"
  signal-on-band: "#ff5b52"
  paper: "#ffffff"
  paper-2: "#f3f3f1"
  ink: "#111111"
  ink-2: "#3d3d3b"
  grey: "#6b6b68"
  rule: "#dcdcd8"
  band: "#111111"
  selection: "#ffd9d6"
  signal-dark: "#e8342b"
  signal-ink-dark: "#ff6a60"
  paper-dark: "#0f0f0f"
  paper-2-dark: "#1b1b1a"
  ink-dark: "#f2f2ee"
  ink-2-dark: "#c9c9c4"
  grey-dark: "#9a9a95"
  rule-dark: "#2e2e2c"
  band-dark: "#000000"
  selection-dark: "#5a1a17"
typography:
  display:
    fontFamily: "Archivo, 'Pretendard Variable', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "112px"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 78"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "'Pretendard Variable', Pretendard, Archivo, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 750
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Pretendard Variable', Pretendard, Archivo, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 750
    lineHeight: 1.45
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Pretendard Variable', Pretendard, Archivo, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'ss06'"
  prose:
    fontFamily: "'Pretendard Variable', Pretendard, Archivo, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Pretendard Variable', Pretendard, Archivo, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.35
  figure:
    fontFamily: "Archivo, 'Pretendard Variable', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 78"
    fontFeature: "'tnum'"
  code:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  none: "0px"
  mark: "50%"
spacing:
  xs: "6px"
  sm: "14px"
  md: "18px"
  lg: "28px"
  column-gap: "56px"
  section: "64px"
  wrap: "1240px"
  rail: "288px"
  mast: "60px"
components:
  button-go:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-go-hover:
    backgroundColor: "{colors.signal-ink}"
  button-line:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  station-code:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 5px"
    height: "22px"
  station-code-today:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "28px"
  masthead:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    height: "{spacing.mast}"
  service-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.on-signal}"
  finder-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.grey}"
    rounded: "{rounded.none}"
    height: "64px"
    padding: "0 14px 0 18px"
  month-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "7px 12px 6px"
---

# Design System: SKALA 개념 운행표

## Overview

**Creative North Star: "인쇄된 열차 시각표"**

커리큘럼은 철도 운행표다. 과목은 역, 분야는 노선, 오늘 수업은 '운행 중'이다. 사용자는 사이드바 트리와 옅은 색 카드로 된 문서 사이트가 아니라, 인쇄된 시각표의 정밀한 표와 노선도로 길을 찾는다. 화면은 흰 종이 위 검정 잉크로 짜이고, 지금 이 순간을 가리키는 데에만 신호 빨강을 쓴다.

밀도는 높고 조용하다. 면은 색이나 그림자가 아니라 괘선(가는 1px 회색, 굵은 2~3px 검정)으로 나뉜다. 날짜·역 코드·개수 같은 숫자는 좁은 폭의 굵은 Archivo 고정폭 숫자로 찍어 시각표의 인쇄감을 만들고, 한국어 본문은 Pretendard 로 편하게 읽힌다. 노선은 색이 아니라 문자 배지(A·D·W·I·P)로, 상태는 원형 표식(지남·운행 중·예정)으로 구분한다.

라이트와 다크는 같은 세계의 두 인쇄다. 다크에서는 종이와 잉크가 뒤집히고 신호 빨강만 한 단계 밝아진다. 빨간 마스트헤드와 검정 운행 정보 띠는 두 테마에서 모두 그대로다.

**Key Characteristics:**
- 네 가지 색 역할만: 종이, 잉크, 신호 빨강, 시각표 회색.
- 모든 모서리는 직각, 원은 상태 표식에만.
- 면 구분은 괘선, 깊이는 없음 (검색 대화상자 하나만 예외).
- 숫자는 Archivo 좁은 폭(wdth 78) + 고정폭 숫자, 글은 Pretendard.
- 노선도 문법(3px 검정 선 위의 정차 표식)이 레일, 운행표, 진행 막대, flow 블록에 반복된다.

## Colors

종이와 잉크의 흑백 인쇄 위에 신호 빨강 하나가 '지금'을 가리키는 시각표 팔레트.

### Primary
- **신호 빨강** (`signal`): 마스트헤드 바탕, 오늘 역 코드 배지, 운행 중 표식, 운행 구간 띠의 오늘 칸, 주요 행동 버튼(답 확인), 경고 콜아웃, 포커스 링, 진행 막대 채움. 다크에서는 `signal-dark` 로 한 단계 밝아진다.
- **신호 빨강 잉크** (`signal-ink`): 종이 위 빨간 글자(오늘 표시, '답 보기' 토글, 링크 hover, 코드 키워드·숫자)와 주요 버튼 hover. 글자로 쓰일 때 대비를 확보하려는 더 짙은 빨강.
- **띠 위 빨강** (`signal-on-band`): 검정 운행 정보 띠 위의 '운행 중' 글자 전용.

### Neutral
- **종이** (`paper`): 페이지 바탕, 대화상자·서랍 바탕, 반전 배지의 글자색.
- **종이 그늘** (`paper-2`): 행 hover, 선택된 검색 결과, 인라인 코드 바탕. 면을 칠하는 유일한 회색이며 정지 상태 카드에는 쓰지 않는다.
- **잉크** (`ink`): 본문 글자, 역 코드 배지, 월 띠, 노선 선, 굵은 괘선(`rule-strong`), 테두리 버튼 윤곽.
- **잉크 2** (`ink-2`): 리드 문단, 요약·설명 글, 인용.
- **시각표 회색** (`grey`): 메타 정보, 열 머리, 예정 표식 윤곽, 자료 대기 상태.
- **괘선** (`rule`): 1px 행 구분선, 빈 칸, 남은 운행 구간 칸.
- **띠 검정** (`band`): 마스트헤드 아래 운행 정보 띠.
- **선택** (`selection`): 텍스트 선택과 검색 일치 하이라이트.

### Named Rules
**The One Signal Rule.** 빨강은 '지금'과 '가라'만 말한다: 오늘, 운행 중, 주요 행동, 경고, 포커스. 장식·분류·노선 구분에 빨강을 쓰지 않는다.

**The Letters Not Colors Rule.** 노선(분야)은 색이 아니라 문자 배지(A AI·LLM, D 데이터, W 웹·백엔드, I 인프라, P 프로젝트·특강)로 구분한다. 노선별 색을 추가하지 않는다.

**The Tinted Card Ban.** 정지 상태의 면을 색으로 칠한 카드는 없다. `paper-2` 는 hover·선택·인라인 코드에만 쓴다.

## Typography

**Display / Figure Font:** Archivo 가변(wdth 62–125, wght 400–800, 자체 호스팅), 좁은 폭 78%와 고정폭 숫자로 사용 (fallback: Pretendard Variable, Helvetica Neue, Arial)
**Body Font:** Pretendard Variable 동적 서브셋 (자체 호스팅, fallback: Apple SD Gothic Neo, Malgun Gothic, system-ui). 수학 기호(−, ≈)는 Archivo 가 채운다.
**Code Font:** 시스템 고정폭 (ui-monospace, SF Mono, Menlo, Consolas)

**Character:** 굵고 좁은 숫자는 시각표의 활자, 한국어 본문은 조용하고 넉넉한 읽기 서체. 숫자가 위계의 꼭대기에 서고, 글은 그 아래에서 설명한다.

### Hierarchy
- **Display** (Archivo 800, 112px, 0.86): 홈 첫 화면의 오늘 날짜 하나. 720px 이하 80px.
- **Headline** (Pretendard 750, 40px / 개념·과목 34px / 홈 역 이름 44px, 1.22, -0.025em, `text-wrap: balance`): 페이지 제목. 720px 이하 30px / 27px / 31px.
- **Title** (Pretendard 750, 21–23px, -0.015em): 섹션 머리(22px), 본문 h2(21px), 정의 문장(23px, 600), 승차권 질문(22px, 700).
- **Body** (Pretendard 400, 16px, 1.6, `ss06`, `word-break: keep-all`): 기본 UI 글. 리드 18px `ink-2`, 46em 이하.
- **Prose** (Pretendard 400, 17px, 1.8, 최대 42em): 마크다운 개념 본문. 16px 아래로 내리지 않는다(휴대폰 16.5px).
- **Label** (Pretendard 13–14px, 400–700): 메타·열 머리·범례는 `grey`, 반전 라벨 칩(정의, 콜아웃 제목)은 700.
- **Figure** (Archivo 700–800, wdth 78, 고정폭 숫자, 13–30px): 날짜, 역 코드, 개념 수, 질문 번호(Q1), 층 번호(01). 숫자와 코드는 항상 이 서체로.

### Named Rules
**The Printed Figure Rule.** 날짜·코드·개수·순번은 Archivo 좁은 폭 굵은 고정폭 숫자로 찍는다. 본문 서체로 숫자를 위계화하지 않는다.

**The Weight Ladder Rule.** 위계는 크기보다 굵기 계단(400 → 600 → 650 → 700 → 750 → 800)으로 먼저 만든다. 대문자 변환은 코드 언어 라벨에만 쓴다.

## Layout

최대 폭 1240px 래퍼(좌우 거터 20px, safe-area 반영) 안에서 동작한다. 개념·과목 화면은 288px 노선도 레일 + 본문 2단(간격 56px), 과목·면접 화면 본문은 다시 본문 + 300px 사이드 2단으로 나뉘고 사이드는 마스트 아래 고정된다. 홈 첫 화면은 7:5 두 칸(오늘 역 / 역 찾기), 그 아래 전체 폭 운행표, 맨 아래 1:1 두 칸.

세로 리듬: 본문 상단 44px(휴대폰 28px), 섹션 사이 64px, 섹션 머리 아래 18px, 행 내부 9–18px. 표 행 높이 48px. 2단 사이 간격은 일관되게 56px.

반응형: 1180px 이하 마스트 내비 축소, 1080px 이하 마스트 높이 56px·내비와 검색창을 메뉴·검색 아이콘으로 접고 레일은 왼쪽 서랍(최대 360px)으로, 2단은 1단으로. 720px 이하 운행표는 표 머리를 숨기고 행마다 노선·코드·이름·날짜의 4열 그리드로 다시 짠다. 시각화 블록은 컨테이너 쿼리(480/520/560/860px)로 가로 노선을 세로 노선으로, 비교 표를 행 덩어리로 바꾼다.

## Elevation & Depth

평면이다. 깊이 대신 괘선 위계로 면을 나눈다: 1px `rule`(행 구분), 2px `rule-strong`(목록·표 머리, 꼬리표), 3px `rule-strong`(섹션 머리, 운행표 머리, 정의 블록). 윤곽은 모두 `inset` box-shadow 로 그려 레이아웃 크기를 바꾸지 않는다. 그라데이션은 없다.

### Shadow Vocabulary
- **대화상자 들림** (`box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 0 0 2px var(--ink)`): 40% 검정 백드롭 위에 뜨는 검색 대화상자 전용. 이 시스템의 유일한 퍼지는 그림자.
- **잉크 윤곽** (`box-shadow: inset 0 0 0 2px var(--ink)`): 테두리 버튼, 역 찾기 입력, 승차권, 세그먼트, 선택 상자. hover 에서 3px 로 굵어지거나 잉크로 채워진다.
- **얇은 윤곽** (`box-shadow: inset 0 0 0 1px var(--rule)`): 태그, 코드 블록, 빈 상태, 노트북 출력.

### Named Rules
**The Rule-Weight Rule.** 면 구분이 필요하면 그림자나 바탕색이 아니라 괘선 굵기(1 / 2 / 3px)를 고른다. 퍼지는 그림자는 백드롭 위 모달에만 허용한다.

## Shapes

모서리는 전부 직각(0px)이다. 버튼·배지·태그·입력·승차권·대화상자 모두 각졌다. 원(50%)은 상태 표식과 정차점에만 쓴다: 지남은 잉크로 꽉 찬 원, 운행 중은 빨간 고리 안에 빨간 점, 예정은 회색·잉크 고리. 노선은 3px 검정 선이고, 그 위에 표식이 꿰인다. 승차권은 2px 점선 절취선으로 꼬리표와 본문을 나눈다. 면접 빈출도는 8px 사각 세 칸.

## Components

### Buttons
기계적이고 단단하다. 누르면 0.97 로 줄어든다.
- **Shape:** 직각 (0px), 높이 44px(작은 버튼 36px), 좌우 20px(14px), 15px 700.
- **Go (주요):** `signal` 바탕, `on-signal` 글자. hover 에서 `signal-ink`.
- **Line (보조):** 2px 잉크 inset 윤곽, hover 에서 잉크로 채우고 글자는 종이색.
- **Icon:** 44×44 정사각, 2px 잉크 윤곽, 같은 반전 hover, disabled 는 투명도 0.3.
- **Focus:** 전역 `2px solid signal` 아웃라인, offset 2px.

### Station Code Badge (signature)
역 코드(A02, W01)를 담는 검정 사각 배지. 최소 38×22px, Archivo 700 13px 좁은 폭. 오늘 역은 빨강, 자료 대기 역은 투명 바탕에 1.5px 괘선 윤곽과 회색 글자. 큰 판(64×36px, 22px)은 과목·개념 제목 옆에 선다. 검정 띠 위에서는 색이 반전된다.

### Status Mark (signature)
12–17px 원. 지남(잉크 채움), 운행 중(빨간 고리 + 빨간 점), 예정(고리). 레일·운행표·진행 막대·범례에서 같은 문법으로 쓰고, 화면 판독기용 텍스트를 항상 함께 둔다.

### Timetable (signature)
전체 폭 표. 머리줄 13px 700 + 3px 잉크 아래 괘선, 행 48px + 1px 괘선, hover 시 `paper-2`. 첫 열에 노선 선(3px)과 상태 표식이 세로로 꿰이고, 월마다 검정 띠(월 이름 Archivo 22px 800)가 행을 끊는다. 날짜 칸은 세로 1px 괘선으로 나뉜다.

### Masthead & Service Band
화면 폭 전체 빨간 마스트(60px, 고정): 흰 사각 'S' 로고, 이름, 운행 기간, 운행 중 점멸 점, 내비(현재 쪽은 4px 흰 밑줄 + 700), 흰 검색 상자(⌘K 표시). 그 아래 검정 운행 정보 띠(14px)가 오늘 역과 다음 정차를 보여 준다.

### Inputs / Fields
- **Style:** 직각, 2px 잉크 inset 윤곽, 종이 바탕. 홈 역 찾기는 64px 높이 17px 글자, 선택 상자·쪽 이동 입력은 38px.
- **Focus / Hover:** hover 에서 윤곽 3px, 포커스는 전역 빨간 아웃라인. 검색 대화상자의 입력 줄은 빨간 64px 띠 위 흰 19px 600 글자.

### Chips / Tags
28px 높이, 1px 괘선 윤곽, 13.5px. hover 에서 1.5px 잉크 윤곽. 세그먼트 버튼은 2px 잉크 틀 안에서 선택 칸만 잉크로 채운다.

### Ticket (질문 카드)
2px 잉크 윤곽의 승차권. 왼쪽 112px 꼬리표(역 코드, 큰 Q, 날짜)와 점선 절취선, 오른쪽 본문(22px 질문, 답 확인/건너뛰기). 휴대폰에서는 꼬리표가 위로 올라가 절취선이 가로가 된다. 답은 260ms 로 위에서 펼쳐진다.

### Lists & Rows
목록은 위 2px 잉크 괘선으로 시작하고 행마다 1px 괘선, hover 에서 `paper-2`. 링크는 hover 에서 밑줄(offset 3px), 본문·출처 링크는 1.5px 빨간 밑줄.

### Navigation (Route Rail)
288px 고정 레일은 노선도다: 3px 검정 세로선 위에 역 표식과 코드·이름·개념 수, 현재 역은 750 + 2px 밑줄, 현재 역의 개념은 1px 지선 위 작은 정차점으로 펼쳐지고 현재 개념은 꽉 찬 점. 1080px 이하에서는 같은 레일이 왼쪽 서랍(280ms) 안에 쌓이고 아래에 주 내비가 붙는다.

### Visual Blocks (markdown)
- **flow:** 가로 노선(3px 선, 17px 고리 정차), 마지막 정차만 빨강. 좁으면 세로 노선.
- **layers:** 3px 머리 괘선 아래 01·02 번호(Archivo, 회색)가 붙은 층 행.
- **compare:** 검정 머리줄 비교 표, 좁으면 행 단위 덩어리.
- **formula:** 3px 머리 괘선 아래 Archivo 22px 식 + 설명 행.
- **callout:** 1.5px 잉크 윤곽 + 검정 반전 제목 칩, 경고는 빨강.
- **code:** 1px 괘선 상자, 오른쪽 위 검정 언어 라벨, 강조는 잉크·빨강·회색만.

## Do's and Don'ts

### Do:
- **Do** 새 화면도 종이·잉크·회색으로 짜고, 빨강은 오늘·운행 중·주요 행동·경고·포커스에만 쓴다.
- **Do** 날짜·역 코드·개수·순번을 Archivo 좁은 폭(wdth 78) 굵은 고정폭 숫자로 찍는다.
- **Do** 면을 나눌 때 괘선 굵기 1px `rule` / 2px·3px `rule-strong` 중에서 고른다.
- **Do** 순서나 진행을 그릴 때 노선도 문법(3px 잉크 선 + 원형 상태 표식)을 재사용한다.
- **Do** 윤곽은 inset box-shadow 로 그리고 모든 모서리를 0px 로 둔다.
- **Do** 한국어 본문은 16px 이상, 행간 1.6–1.8, `word-break: keep-all` 을 유지한다.
- **Do** 상태 표식에는 화면 판독기용 텍스트를 함께 둔다.

### Don't:
- **Don't** 노선이나 분야를 색으로 구분하지 않는다. 문자 배지를 쓴다.
- **Don't** 바탕색을 칠한 카드, 그라데이션, 둥근 모서리를 쓰지 않는다.
- **Don't** 백드롭 위 모달이 아닌 곳에 퍼지는 그림자를 쓰지 않는다.
- **Don't** 원형을 상태 표식·정차점이 아닌 장식에 쓰지 않는다.
- **Don't** 사이드바 트리 + 옅은 색 카드의 문서 사이트 기본형으로 돌아가지 않는다.
