---
title: RICE 프롬프트 프레임워크
en: RICE Prompt Framework
summary: "Role·Instruction·Context·Examples 4요소로 프롬프트를 구조화하는 방법 — 자세히보다 구조적으로"
importance: 3
order: 6
tags:
  - 프롬프트
  - 프레임워크
keypoints:
  - "Role = 누구처럼 생각할지, Instruction = 어떤 절차로 판단할지"
  - "Context = 배경 정보 + 사고의 경계 조건 설정, Hallucination 감소"
  - "Examples는 출력 예시가 아니라 평가 기준의 표본(채점표)"
qa:
  - q: "RICE 프레임워크를 설명해 보라."
    a: "프롬프트를 Role, Instruction, Context, Examples 4요소로 구조화하는 방법이다. Role로 누구처럼 생각할지, Instruction으로 수행할 작업과 판단 절차, Context로 회사 규모나 상황 같은 배경, Examples로 원하는 응답의 표본을 준다. 여기에 Policy·Style·Constraints와 Format/Structure를 더하면 응답을 더 안정적으로 통제할 수 있다."
  - q: "프롬프트에 Context를 넣으면 무엇이 좋아지나?"
    a: "질문과 관련된 지식·정보를 함께 주면 모델이 추측할 여지가 줄어 Hallucination이 줄고 정확성과 관련성이 높아진다. 또 어떤 해석이 유효하고 어떤 접근이 배제되는지, 즉 사고가 허용되는 경계 조건을 정해 준다. 예를 들어 '업무 효율 아이디어 5가지'에 '직원 30명 중소 IT회사, 회의가 많고 문서 정리가 비효율적'을 덧붙이면 답이 그 상황에 맞춰진다."
  - q: "어떤 Context를 줘야 할지 모를 때는?"
    a: "역할을 뒤집는 Socratic Prompting을 쓴다. AI를 인터뷰어로 세워 '제안서 작성 전에 명확히 해야 할 것들을 질문해줘'라고 하면 AI가 단계·차별점 등을 객관식으로 묻는다. 인터뷰가 끝난 뒤 '지금까지 내 답변을 바탕으로 제안서를 써줘'라고 하면 전체 대화가 그대로 컨텍스트가 된다."
related:
  - prompt-engineering
  - few-shot
  - meta-prompting-markdown
  - context-engineering
source: 슬라이드 p.48–55, 실습 TODO 5, 12, 17
---

```layers
Role (역할) :: 당신은 10년 이상 근무한 비즈니스 커뮤니케이션 전문가입니다
Instruction (지시) :: 거래처에 보낼 회의 일정 변경 안내 이메일을 작성해 주세요
Context (배경) :: 우리 회사는 직원 30명 규모의 중소 IT회사입니다
Examples (예시) :: [Example] Strength — 문제를 재정의한 점이 인상적 / Weakness — 단일 데이터셋 한정
Policy · Style · Constraints :: 추측 금지, 수치는 출처 있을 때만 / 경영진 보고서체 / 500자 이내, Bullet 최대 5개
Format / Structure :: 제목·소제목, 표, 마지막 3줄 요약
```

```compare
Style | Format / Structure
무엇을 정하나 | 말투와 표현 방식 | 출력의 모양과 순서
예시 | 친절하게, 전문가처럼, 간결하고 논리적으로 | 표, JSON, Markdown, 목차
```

> [!tip] 한 줄 요약
> Role은 "누구처럼 생각할지", Instruction은 "무엇을 생각하라"가 아니라 "어떤 절차로 판단하라", Example은 "모델에게 채점표를 건네는 것".
