---
title: 컴포넌트 통신 — Props, Emits, Slot
en: Props Down Events Up, Slots, Provide/Inject
summary: 데이터는 Props로 내려주고 이벤트는 Emit으로 올린다 — 마크업 주입은 Slot, 깊은 전달은 Provide/Inject
importance: 3
order: 10
tags:
  - Vue
  - 컴포넌트
  - Props
  - Emit
  - Slot
keypoints:
  - Props는 읽기 전용 — 자식은 수정하지 말고 emit으로 부모에 변경 요청
  - defineProps·defineEmits는 import 없이 쓰는 컴파일러 매크로
  - Slot은 마크업 주입 — default, named(#header), scoped(자식 데이터를 부모가 사용)
qa:
  - q: 부모와 자식 컴포넌트는 어떻게 데이터를 주고받나요?
    a: 부모는 자식 태그에 :city-name="name"처럼 속성으로 데이터를 내려주고, 자식은 defineProps로 받아 읽기 전용으로 씁니다. 자식이 값을 바꾸고 싶으면 defineEmits로 선언한 이벤트를 emit('update-query', 값)처럼 발생시키고, 부모가 @update-query로 받아 자기 상태를 바꿉니다. 데이터는 위에서 아래로, 이벤트는 아래에서 위로 흐르는 구조라 데이터 흐름을 추적하기 쉽습니다.
  - q: Props Drilling이란 무엇이고 어떻게 해결하나요?
    a: 계층이 깊을 때 중간 컴포넌트가 자신은 쓰지 않는 데이터를 최하위로 전달하려고 Props를 계속 받아 넘기는 현상입니다. 조상이 provide로 값을 등록하고 후손이 inject로 바로 받으면 중간 단계를 건너뛸 수 있습니다. 다만 앱 전체에서 공유하는 상태는 Pinia 같은 전역 스토어를 주로 써서 Provide/Inject의 사용 빈도는 높지 않습니다.
  - q: Slot은 Props와 어떻게 다른가요?
    a: Props가 데이터 값을 전달한다면 Slot은 HTML 마크업이나 다른 컴포넌트 같은 화면 조각 자체를 주입합니다. 자식은 slot 태그로 자리를 비워 두고, 부모가 채우지 않으면 slot 안의 기본 콘텐츠가 보입니다. 과제에서는 공통 카드 컴포넌트의 slot에 검색창과 날씨 카드 목록을 주입해 디자인을 공통화했고, 제출물에서는 MacWindowLayout의 toolbar 슬롯에 내비게이션과 단위 토글을 넣었습니다.
related:
  - component-lifecycle
  - pinia-store
  - event-v-model
source: Day1(7/31) 슬라이드 p.137–149 (Props & Emits, defineProps 배열·객체 형식, 읽기 전용, camelCase·kebab-case, Prop Validation, 지원 타입, defineEmits 예제), p.150–151 (Provide & Inject), p.153–157 (Default·Named·Scoped Slot), p.158 (과제 날씨 컴포넌트 — WeatherParent, BaseDashboardCard, SearchBar, WeatherCard), 과제 제출물 SearchBar.vue, WeatherCard.vue, MacWindowLayout.vue
---

```flow
부모 상태 :: const searchQuery = ref('') — 데이터의 주인
Props 하행 :: `<SearchBar :search-query="searchQuery" />` (속성은 kebab-case)
자식 사용 :: defineProps({ searchQuery: String }) — 읽기 전용
Emit 상행 :: emit('update-query', e.target.value)
부모 갱신 :: @update-query → searchQuery 변경 → 자식 다시 렌더
```

```vue
<!-- SearchBar.vue (자식) — 과제 제출물 요약 -->
<script setup>
defineProps({ searchQuery: { type: String, required: true } })
const emit = defineEmits(['update-query'])
</script>
<template>
  <input :value="searchQuery" @input="emit('update-query', $event.target.value)" />
</template>

<!-- WeatherHomeView.vue (부모) -->
<SearchBar :search-query="searchQuery" @update-query="(q) => (searchQuery = q)" />
```

| Slot | 자식 | 부모 |
| --- | --- | --- |
| Default | `<slot>기본 콘텐츠</slot>` | 태그 사이에 내용 |
| Named | `<slot name="header" />` | `<template #header>` (= `v-slot:header`) |
| Scoped | `<slot :text="message" :count="userCount" />` | `v-slot="slotBag"` → `slotBag.text` |

> [!warn] 헷갈리기 쉬움
> 객체·배열 Props의 기본값은 함수로 써야 한다 — `default: () => []`, `default: () => ({ lat: 37.5 })`. 자식에서 `props.likes = 999`처럼 Props를 직접 바꾸면 읽기 전용 경고가 난다.
