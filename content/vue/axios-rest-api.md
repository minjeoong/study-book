---
title: Axios와 REST API 통신
en: Axios, REST API, HTTP Methods
summary: REST는 URI로 자원을, HTTP 메서드로 행위(CRUD)를 표현하는 API 스타일 — Vue에서는 Axios + async/await로 호출
importance: 3
order: 13
tags:
  - Vue
  - Axios
  - REST API
  - HTTP
keypoints:
  - REST — URI는 명사(/users), 행위는 GET·POST·PUT/PATCH·DELETE로 표현
  - Axios는 JSON 자동 변환, 4xx·5xx 자동 reject, baseURL·인터셉터 지원
  - axios.create로 공통 설정 인스턴스, 요청 인터셉터로 JWT 토큰 자동 첨부
qa:
  - q: REST API란 무엇이고 설계 원칙은?
    a: HTTP를 활용해 자원을 URI로 식별하고, 그 자원에 대한 생성·조회·수정·삭제를 HTTP 메서드로 표현하는 웹 API 스타일입니다. URI에는 /getWeather, /deleteUser 같은 동사를 넣지 않고 /weather, /users처럼 명사만 두며, 행위는 GET 조회, POST 생성, PUT·PATCH 수정, DELETE 삭제로 나타냅니다. 프론트엔드는 이 API로 받은 JSON을 화면에 그리고, 백엔드는 비즈니스 로직과 DB를 담당합니다.
  - q: fetch 대신 Axios를 쓰는 이유는?
    a: fetch는 브라우저 내장이라 설치가 필요 없지만 응답을 res.json()으로 직접 파싱해야 하고, 404나 500 응답에도 reject하지 않아 에러를 직접 확인해야 합니다. Axios는 JSON을 자동으로 객체로 바꿔 response.data에 담고, 4xx·5xx를 자동으로 reject해 catch로 받으며, axios.create로 baseURL과 공통 파라미터를 설정하고 인터셉터로 토큰 첨부나 공통 에러 처리를 할 수 있습니다.
  - q: PUT과 PATCH의 차이는?
    a: PUT은 자원 전체를 보낸 내용으로 교체하고, PATCH는 보낸 필드만 부분 수정합니다. 사용자 정보 중 나이만 바꿀 때는 PATCH /users/1에 age만 보내는 것이 의도에 맞습니다. 수업에서는 메서드 역할이 강제 규칙은 아니라서 POST로 삭제해도 동작은 하지만, 규약을 지켜야 API를 예측할 수 있다고 정리했습니다.
related:
  - pinia-store
  - modern-javascript
  - web-basics/web-http-basics
  - web-basics/async-javascript
source: Day3(8/4) 슬라이드 p.193–196 (HTTP Methods와 CRUD, API·REST 설계 원칙, Frontend vs Backend, JSONPlaceholder), p.197–200 (OpenWeather API, Postman), p.201–207 (Fetch vs Axios, 설치, API 예제, Method 목록·인터셉터·병렬 요청, Promise vs async/await, JSONPlaceholder CRUD), p.209 (과제 날씨 데이터 연동), 과제 제출물 api/index.js, api/weather-hooks.js
---

```compare
Fetch API | Axios
설치 | 브라우저 내장 | npm install axios
JSON 변환 | res.json() 직접 | response.data에 자동
에러 처리 | 4xx·5xx도 resolve — response.ok 직접 확인 | 4xx·5xx 자동 reject → catch
baseURL·공통 설정 | 없음 | axios.create({ baseURL, params })
인터셉터 | 없음 | 요청 전 토큰 첨부, 응답 후 공통 에러 처리
```

```js
// api/index.js — 과제: OpenWeatherMap 공통 설정 인스턴스
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,               // 환경 변수로 분리
  params: { appid: import.meta.env.VITE_API_KEY, units: 'metric', lang: 'kr' },
})

// api/weather-hooks.js
export const getWeatherById = async (id) => (await api.get('/weather', { params: { id } })).data

// WeatherHomeView.vue — 로딩·에러 상태를 함께 관리
isDetailLoading.value = true
try {
  const [weather, forecast] = await Promise.all([getWeatherById(id), getForecastById(id)])  // 병렬
  selectedDetail.value = weather
  selectedForecast.value = forecast
} catch (err) {
  detailError.value = err
} finally {
  isDetailLoading.value = false
}
```

> [!tip] 면접 팁
> "API 함수는 api/ 폴더로 분리(axios 인스턴스 + 함수), 컴포넌트는 isLoading·error·data 세 상태로 스피너·에러 메시지·빈 결과를 분기"로 구조를 설명하면 된다. 토큰은 `api.interceptors.request.use((config) => …)`에서 Authorization 헤더에 붙인다.
