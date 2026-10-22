---
title: 비동기 JavaScript — Promise와 async/await
en: Asynchronous JavaScript, Promise, async/await, Event Loop
summary: 싱글 스레드 JS가 통신·타이머를 맡겨 두고 다음 코드를 먼저 실행하는 방식 — 콜백 → Promise → async/await
importance: 3
order: 14
tags:
  - JavaScript
  - 비동기
  - Promise
  - fetch
keypoints:
  - Promise 상태는 Pending → Fulfilled(then) 또는 Rejected(catch)
  - async 함수는 항상 Promise를 반환, await는 async 함수 안에서만 쓴다
  - await 뒤 코드는 콜 스택이 빈 뒤 이벤트 루프가 Microtask Queue에서 꺼내 실행
qa:
  - q: 자바스크립트는 싱글 스레드인데 어떻게 비동기 처리를 하나요?
    a: 타이머나 네트워크 요청은 JS 엔진이 아니라 브라우저의 Web API가 백그라운드에서 처리합니다. 작업이 끝나면 후속 코드가 큐에 등록되고, 콜 스택이 완전히 비었을 때 이벤트 루프가 큐에서 꺼내 실행합니다. 그래서 서버 응답을 기다리는 동안에도 화면이 멈추지 않습니다.
  - q: 콜백, Promise, async/await의 차이는?
    a: 콜백은 함수 안에 함수를 계속 넣는 방식이라 콜백 지옥과 어려운 에러 처리가 문제였습니다. Promise는 비동기 결과를 객체로 표현하고 .then().catch() 체인으로 코드를 평평하게 만들었습니다. async/await는 Promise 위의 문법적 설탕으로, 비동기 코드를 동기 코드처럼 위에서 아래로 읽히게 하고 try/catch로 에러를 처리합니다.
  - q: Promise 체인에서 .then 안의 return을 빠뜨리면?
    a: 다음 .then이 앞의 비동기 작업 완료를 기다리지 않고 undefined를 받아 바로 실행되어 실행 순서가 보장되지 않습니다. 순서대로 실행할 비동기 함수는 .then 안에서 Promise를 return하거나, async 함수 안에서 차례로 await합니다.
related:
  - js-data-types
  - state-driven-rendering
  - vue/axios-rest-api
source: Day1 슬라이드 p.168 (Single Thread), p.246–253 (Asynchronous JavaScript, Promise 생성·소비·체인, async/await, Event Loop와 Microtask Queue), p.254–257 (Browser API — Timer, Storage, fetch), p.261–263 (과제 실시간 날씨 — change 이벤트, fetch + async/await, 모듈 분리)
---

```flow
1세대 콜백 :: 함수 안에 함수 — 콜백 지옥, 에러 처리 어려움
2세대 Promise (ES6) :: 비동기 상태를 객체로, .then() .catch() 체인
3세대 async/await (ES8) :: Promise 기반 문법적 설탕, 동기식처럼 작성 + try/catch
```

| 단계 | await를 만났을 때 엔진 내부 |
| --- | --- |
| 1. 일시 정지 | await 뒤 비동기 함수를 실행하고 async 함수는 멈춤 → 호출한 쪽의 남은 동기 코드 계속 실행 |
| 2. 작업 완료 | 끝나도 실행 중인 코드에 끼어들지 않고, 남은 코드가 Microtask Queue에 대기 |
| 3. 재개 | 콜 스택이 비면 이벤트 루프가 꺼내 await 다음 줄부터 실행 |

```js
// 과제 실시간 날씨 — weatherAPI.js (데이터 담당, export로 모듈 분리)
export async function getCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,relative_humidity_2m'
  const response = await fetch(url)        // Promise<Response>
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()                   // 이것도 Promise
}

// realtimeInfo.js (화면 담당) — <script type="module">로 로드
import { getCurrentWeather } from './weatherAPI.js'
citySelect.addEventListener('change', async () => {
  weatherBox.textContent = '로딩 중...'
  try {
    const { current } = await getCurrentWeather(lat, lon)
    weatherBox.textContent = `${current.temperature_2m}°C / 습도 ${current.relative_humidity_2m}%`
  } catch (e) {
    weatherBox.textContent = '날씨를 불러오지 못했습니다'
  }
})
```

> [!warn] 헷갈리기 쉬움
> `fetch()`는 404·500 응답에도 reject하지 않고 네트워크 실패일 때만 reject한다. `response.ok`로 직접 확인해야 한다 (Axios는 4xx·5xx를 자동으로 reject). 타이머도 `setTimeout`이 돌려준 ID를 `clearTimeout`에 넘겨야 취소된다.
