---
title: 이벤트 처리와 v-model 양방향 바인딩
en: v-on, Event Modifiers, v-model
summary: v-on(@)으로 이벤트를 연결하고 .prevent·.stop 수식어로 제어, v-model은 :value + @input을 합친 양방향 바인딩
importance: 3
order: 6
tags:
  - Vue
  - 이벤트
  - v-model
  - 폼
keypoints:
  - '@click="fn"은 함수 참조 전달 — 이벤트 객체는 첫 인자로, 인자와 함께 넘길 땐 $event'
  - 수식어 .prevent는 preventDefault(), .stop은 stopPropagation()
  - v-model = :value + @input, 다중 체크박스는 배열·단일은 불리언으로 초기화
qa:
  - q: v-model의 동작 원리는?
    a: v-model은 문법적 설탕으로, 입력 요소의 value를 데이터에 묶는 :value 바인딩과 입력 이벤트에서 데이터를 갱신하는 @input 핸들러를 합친 것입니다. 수업에서 :value="text2"와 @input="(e) => (text2 = e.target.value)"로 직접 구현해 같은 결과를 확인했습니다. 텍스트 입력은 input 이벤트, checkbox·radio·select는 change 이벤트를 기반으로 동작합니다.
  - q: 이벤트 수식어 .prevent와 .stop은 언제 쓰나요?
    a: .prevent는 e.preventDefault()와 같아서 폼 제출 시 새로고침이나 a 태그 이동을 막을 때 씁니다. .stop은 e.stopPropagation()과 같아서 카드 안의 버튼을 눌렀을 때 카드 클릭 이벤트까지 버블링되는 것을 막습니다. 날씨 Mockup 과제의 상세보기 버튼이 바로 .stop 사례였고, .self는 배경 딤을 직접 클릭했을 때만 모달을 닫는 데 씁니다.
  - q: v-model 수식어 .lazy, .number, .trim은?
    a: .lazy는 타이핑마다가 아니라 change 시점(포커스 아웃이나 Enter)에 반영해 불필요한 상태 갱신과 API 요청을 줄입니다. .number는 입력값을 숫자로 자동 변환하고, .trim은 양끝 공백을 제거해 공백 입력으로 인한 검증 오류를 막습니다. v-model.trim.number처럼 이어서 쓸 수 있습니다.
related:
  - vue-directives
  - props-emits-slot
  - web-basics/event-delegation
  - web-basics/html-forms
source: Day1(7/31) 슬라이드 p.13 (Two-Way Data Binding), p.76–87 (v-on, Inline·Method Handler, Event Object, $event, Event Modifier 종류), p.88–94 (v-model 원리, 폼 요소별 매핑, Modifiers), p.98 (과제 날씨 Mockup — 한글 검색 :value + @input, 상세보기 버블링 차단)
---

```compare
v-on (@) | v-model
방향 | View → Model (이벤트로 함수 실행) | View ↔ Model (양방향)
문법 | @click="handleClick", @keyup.enter="send" | v-model="text", v-model.trim="email"
내부 | addEventListener(type, handler) | :value + @input (선택형은 @change)
수식어 | .prevent .stop .once .self .capture .enter .esc .ctrl .exact | .lazy .number .trim
```

| 폼 요소 | ref 초기값 | v-model에 담기는 값 |
| --- | --- | --- |
| input text, textarea | `ref('')` | 입력 문자열 |
| checkbox 단일 | `ref(false)` | true / false |
| checkbox 다중 | `ref([])` | 체크된 항목의 value 배열 |
| radio, select | `ref('')` | 선택한 value |

```vue
<!-- 날씨 Mockup 과제 — 카드 클릭은 선택, 상세보기는 버블링 차단 -->
<div class="card" @click="selectCity(city.name)">
  {{ city.name }}
  <button @click.stop="showDetail(city.name, city.status)">상세보기</button>
</div>

<!-- 한글 검색 — 조합 중에도 즉시 반영하려고 v-model 대신 직접 구현 -->
<input :value="keyword" @input="(e) => (keyword = e.target.value)" />
```

> [!warn] 헷갈리기 쉬움
> 한글 같은 IME 입력은 v-model이 글자 조합이 끝나야 값을 갱신한다. 그래서 과제의 한글 도시 검색은 `:value` + `@input`으로 타이핑 즉시 반영하도록 요구했다.
