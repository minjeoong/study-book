---
title: Pinia 전역 상태 관리
en: Pinia Store (state, getters, actions), JWT
summary: 컴포넌트 계층과 무관하게 공유할 상태를 담는 전역 저장소 — state는 ref, getters는 computed, actions는 함수로 정의
importance: 3
order: 12
tags:
  - Vue
  - Pinia
  - 상태 관리
  - JWT
keypoints:
  - 3단계 — createPinia 등록 → defineStore로 생성 → useXxxStore()로 사용
  - state = ref, getters = computed(읽기 전용), actions = 함수(변경·API 통신)
  - 구조 분해 시 state·getters는 storeToRefs로 감싸야 반응성 유지
qa:
  - q: Pinia는 왜 쓰나요?
    a: 앱이 커지면 로그인 정보나 설정처럼 여러 화면이 공유하는 상태를 Props로 계층마다 넘기기 어렵습니다. Pinia는 컴포넌트 트리와 별개로 전역 Store를 만들어 어떤 컴포넌트든 useStore()로 같은 반응형 상태에 접근하게 합니다. Vue 2의 Vuex를 잇는 Vue 3 공식 상태 관리 라이브러리이고, Vue Devtools에서 상태 변화를 추적할 수 있습니다.
  - q: Store에서 값을 구조 분해했더니 화면이 안 바뀝니다. 왜인가요?
    a: const { count } = store처럼 구조 분해하면 반응형 Proxy와의 연결이 끊긴 일반 값이 복사됩니다. state와 getters는 storeToRefs(store)로 감싸 ref로 꺼내야 반응성이 유지되고, actions는 함수라 그냥 구조 분해해도 됩니다.
  - q: JWT 방식과 세션 방식의 차이는?
    a: 세션은 로그인 정보를 서버 메모리나 DB에 저장해 동시 접속이 많으면 서버 부담이 크고, 서버를 늘리면 Redis 같은 세션 공유가 필요합니다. JWT는 서버가 서명한 토큰(Header.Payload.Signature)을 클라이언트가 보관하고 요청마다 Authorization Bearer 헤더로 보내, 서버는 서명만 검증하면 되므로 Stateless하고 확장이 쉬워 SPA와 REST API 구조에 맞습니다. Payload는 Base64라 누구나 디코딩할 수 있어 민감 정보를 넣으면 안 됩니다.
related:
  - props-emits-slot
  - vue-router
  - axios-rest-api
  - ref-reactive
source: Day3(8/4) 슬라이드 p.179–184 (Pinia Basic, Store 핵심 개념, 구축 3단계, Frequent Mistakes — storeToRefs), p.185–189 (사례연구 authStore — Login Flow, JWT vs Session, Source Code, Navigation Guard 연동), p.190–191 (Code Challenge counter, 과제 configStore 단위 토글), 과제 제출물 stores/configStore.js
---

```layers
state :: ref() — 전역 공유 원본 데이터 (unit = 'celsius')
getters :: computed() — state로 계산한 읽기 전용 값 (unitSymbol °C / °F)
actions :: function — state 변경, 비동기 API 통신 (toggleUnit, login)
return { … } :: 외부 컴포넌트에 공개할 것만 반환
```

```js
// stores/configStore.js — 과제: 온도 단위 스토어 (Setup Store 문법)
export const useConfigStore = defineStore('config', () => {
  const unit = ref('celsius')                                                  // state
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))  // getter
  function toggleUnit() {                                                      // action
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }
  return { unit, unitSymbol, toggleUnit }
})

// 컴포넌트에서
const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)   // 반응성 유지
const { toggleUnit } = configStore                      // action은 그냥 꺼내도 됨
```

> [!tip] 면접 팁
> 로그인 흐름으로 설명하면 좋다. 백엔드가 ID/PW를 검증해 JWT 발급 → authStore.login()이 토큰·유저 정보를 state와 localStorage에 저장 → router.beforeEach에서 authStore.isLoggedIn으로 접근 제어 → Axios 요청 인터셉터가 Authorization 헤더에 토큰 자동 첨부.
