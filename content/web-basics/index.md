---
summary: 웹 화면을 이루는 세 언어 — HTML(구조), CSS(표현), JavaScript(동작)를 웹 통신 기초부터 배우고, 중고차 목록 CRUD 화면으로 엮어 완성
keywords:
  - HTML
  - CSS
  - JavaScript
  - TCP/IP
  - HTTP
  - 시맨틱 태그
  - 웹 접근성
  - 명시도
  - 박스 모델
  - Flexbox
  - Grid
  - position
  - 미디어 쿼리
  - 호이스팅
  - 원시 타입
  - DOM
  - 이벤트 위임
  - Promise
  - async/await
  - fetch
  - ES Module
  - CRUD
materials:
  - file: slides-day1-html-css-js.pdf
    title: "강의 슬라이드 Day1 — HTML, CSS, JavaScript"
    type: slides
    date: 2026-07-23
  - file: slides-day2-html-css-js-crud-guide.pdf
    title: 종합실습 가이드 — 중고차 목록 관리 CRUD (HTML, CSS 레이아웃, JavaScript)
    type: slides
    date: 2026-07-24
  - file: lab-used-car-crud-starter.zip
    title: 실습 스타터 코드 — index.html, style.css, app.js (수강생 구현 TODO 28개)
    type: lab
    date: 2026-07-24
---

## 한눈에 보기

```layers
웹 통신 :: DNS → TCP 연결 → HTTP 요청·응답으로 HTML을 받아 옴
HTML :: 구조와 의미 — 시맨틱 태그, 폼, 미디어, 접근성
CSS :: 표현과 배치 — 선택자·명시도, 박스 모델, Flex·Grid, 반응형
JavaScript :: 동작 — 타입·스코프, DOM, 이벤트, 비동기(fetch, async/await)
상태 (데이터) :: cars 배열 + editingId — 화면은 이 상태를 그린 결과
```

- 웹 화면은 세 언어가 역할을 나눠 맡음: HTML은 무엇이 있는지, CSS는 어떻게 보이는지, JS는 어떻게 동작하는지. 그 아래에는 TCP/IP와 HTTP가 깔려 있음.
- Day1은 웹 개요부터 JS 심화(DOM, 이벤트, 비동기, 모듈)까지 264쪽 이론 + 단계별 과제로 개인 포털 페이지를 키워 가는 수업.
- Day2 종합실습은 셋을 한 번에 엮어 중고차 목록 관리 화면(등록, 조회, 수정, 삭제, 검색, 필터)을 완성하는 과제.
- JS 핵심은 "배열(상태)을 바꾸고 → renderCars()로 목록을 다시 그린다"는 상태 기반 렌더링 — 다음 Vue.js 과목의 반응성으로 이어짐.

## 수업 흐름

**Day 1 (07-23)** — HTML, CSS, JavaScript 이론 + 과제 (슬라이드 264쪽, 소스 skala-front 저장소, 과제는 본인 GitHub Public 저장소로 제출)

1. Web 개요 — 인터넷 역사, TCP/IP 4계층, IP·NAT, TCP/UDP, DNS, 3-way handshake, WWW·URL·HTTP·HTTPS, HTML 개요, VS Code Live Server·Emmet — p.8–39
2. HTML 기초 — 요소·속성(전역 속성 id, class, data-*), 제목·문단, block vs inline, 링크, 서식, 목록, 표 — p.40–67
3. HTML Form — form 속성(action, method), 입력 요소, input type·속성, button type, fieldset — p.68–80
4. HTML 심화 — img, picture, audio, video, 시맨틱 레이아웃 태그, head, 주석, 웹 접근성 — p.81–94
5. CSS 기초 — 문법·적용 3방법, 선택자(조합자, 가상 클래스·요소), 명시도, !important, 색·단위·폰트·텍스트·배경, 박스 모델, position, z-index, 상속 — p.95–136
6. CSS 심화 — 레이아웃(float, inline-block, Flexbox, Grid), transform, transition, animation, 반응형(viewport, 미디어 쿼리, 모바일 퍼스트), CSS 변수, SCSS — p.137–165
7. JavaScript 기초 — 특징(인터프리터, 동적 타이핑, 싱글 스레드), 변수·스코프·호이스팅, 데이터 타입, 연산자, 조건·반복문, 함수, 배열, 객체, 내장 객체(Math, Date, JSON, RegExp, Set, Map) — p.166–232
8. JavaScript 심화 — DOM API, 이벤트(핸들러 3방식, 전파, 제어), 비동기(Promise, async/await, 이벤트 루프), Browser API(Timer, Storage, fetch), ES 모듈 — p.233–263

**Day 2 (07-24)** — 종합실습: 중고차 목록 관리 CRUD

1. 완성 화면과 기능 6개(등록, 조회, 수정, 삭제, 검색, 필터), 제공 파일 3개 소개 — p.1–2
2. HTML 기본 화면 (20점): 헤더, 입력 폼 7항목, 등록 버튼, 검색·필터 영역 — p.3
3. CSS 레이아웃 (20점): 입력/목록 2열, 차량 카드 스타일, 800px 이하 1열 반응형 — p.4
4. JavaScript CRUD: 등록, 입력 값 검증, 수정·수정 완료·수정 취소, 삭제, 검색, 필터 — p.5–10
5. 최종 확인 체크리스트, 제출(`SKALA번호_반_이름_HTML.zip`) — p.11

## 실습 정리

**Day 1 과제 — 개인 포털 페이지 키우기 (SKALA-FRONT 프로젝트, html 폴더)**

| 단계 | 과제 | 핵심 요소 |
| --- | --- | --- |
| HTML | index.html 환영 페이지, myHoliday(휴일 일과), myProfile(소개), myClass(강의 시간표), 바로가기 | h1·p·mark, ul·ol·dl, table(셀 병합), a — CSS 금지 |
| Form | signUp.html → signUpResult.html | form action·method="get", fieldset·legend·label, required·placeholder, select·textarea, submit·reset |
| HTML 심화 | myTrip.html(여행 앨범), index.html 포털 Hub | audio·video·source, img, nav·main·aside |
| CSS 미션 1–3 | css/style.css 공통 테마, 박스 모델 카드, 회원가입 폼 꾸미기 | Google Fonts, 태그·클래스 선택자, padding·margin·border |
| CSS 미션 4–6 | Flex 바로가기 + main·aside 가로 배치, 여행 카드 3열 Grid, 786px 이하 1열, hover·페이드인 | Flexbox, Grid, @media, transition, @keyframes |
| JS 기초 | Up-Down 숫자 게임, 성적 계산기, 내 가방 보기 | Math.random, prompt·alert, for·while, 배열·객체 |
| JS 심화 | 실시간 날씨 — 도시 select → 좌표 표시 → Open-Meteo 호출 → 모듈 분리 | change 이벤트, innerHTML, fetch + async/await, export·import |

```js
// 실시간 날씨 — 비동기 호출 단계 (weather.js → weatherAPI.js + realtimeInfo.js로 분리)
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
  + '&current=temperature_2m,relative_humidity_2m'
weatherBox.innerHTML = '로딩 중...'
const data = await (await fetch(url)).json()
weatherBox.innerHTML = `기온 ${data.current.temperature_2m}°C, 습도 ${data.current.relative_humidity_2m}%`
```

**Day 2 종합실습 — 중고차 목록 관리 CRUD**

- 목표: 제공된 3개 파일의 "수강생 구현" TODO를 채워 화면이 요구사항대로 동작하게 만들기
- 데이터: JS 배열 `cars`의 예시 2대(현대 쏘나타, 기아 K5) — 브라우저 저장소 미사용, 새로고침하면 처음 데이터로 복귀
- 제공 코드: `renderCars()`, `getFilteredCars()`, `createCarCard()`, `resetForm()` — 목록 출력은 이미 완성되어 있음

| 파일 | TODO | 할 일 |
| --- | --- | --- |
| index.html | #1–#10 | 헤더, label + input/select 7개, `type="number"`, placeholder, 등록·수정 취소 버튼, 검색 input + 상태 필터 select |
| style.css | #1–#10 | `.container` 2열 grid, `.form-row` 세로 배치, 버튼·검색·카드 버튼 영역 flex, `.car-list` 카드 grid, `@media (max-width: 800px)` 1열 |
| app.js | #1–#8 | submit(등록/수정), 카드 버튼 이벤트 위임, input·change 시 재렌더, 수정 취소, 입력 검증, `startEdit`, `deleteCar` |

핵심 코드 — 등록과 수정을 한 submit 핸들러에서 처리 (TODO #1, 풀이 예시)

```js
carForm.addEventListener('submit', function (event) {
  event.preventDefault()                 // 폼 기본 제출(새로고침) 막기
  const car = getCarFromForm()           // 검증 실패 시 null
  if (!car) return

  if (editingId === null) {
    cars.push({ id: Date.now(), ...car })                                       // 등록
  } else {
    cars = cars.map((c) => (c.id === editingId ? { ...car, id: editingId } : c)) // 수정
  }
  resetForm()                            // editingId = null, 버튼 '등록'으로
  renderCars()                           // 상태 기준으로 목록 다시 그리기
})
```

핵심 코드 — 다시 그려지는 카드 버튼은 부모 목록 하나로 처리 (TODO #2, 이벤트 위임)

```js
carList.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]')
  if (!button) return
  const id = Number(button.dataset.id)   // data-* 값은 문자열
  if (button.dataset.action === 'edit') startEdit(id)
  if (button.dataset.action === 'delete') deleteCar(id)
})
```
