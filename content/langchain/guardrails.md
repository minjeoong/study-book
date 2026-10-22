---
title: "Guardrails와 AI 거버넌스"
en: "Guardrails (Before/After Agent), AI Governance"
summary: "입력·처리·출력 길목마다 규칙 기반·모델 기반 안전장치를 겹겹이 두어 에이전트의 탈선과 사고를 막는 설계"
importance: 3
order: 12
tags:
  - Guardrails
  - Security
  - Agent
keypoints:
  - "Before Agent(입력 필터): 키워드·정규식 규칙, 싸고 빠르며 LLM 호출 자체를 차단"
  - "After Agent(출력 필터): 감시자 LLM 평가, 미묘한 문제까지 잡지만 비용·지연 추가"
  - "여러 가드레일을 레이어로 결합 + OWASP LLM Top 10, NIST AI RMF, EU AI Act 기준"
qa:
  - q: "Before Agent 가드레일과 After Agent 가드레일을 비교하면?"
    a: "Before Agent는 사용자 질문이 LLM에 닿기 전에 키워드나 정규식 같은 결정론적 규칙으로 금지 주제, 개인정보, 프롬프트 인젝션을 걸러낸다. LLM 호출 자체를 막으니 매우 싸고 빠르지만 미묘한 표현은 놓칠 수 있다. After Agent는 답변 생성 직후 감시자 LLM에게 평가를 맡겨 정답 유출, 환각, 정책 위반을 잡아 내용을 고치거나 재생성하므로 정밀하지만 추가 비용과 지연이 생긴다."
  - q: "프롬프트 인젝션은 어떻게 방어하나?"
    a: "OWASP LLM Top 10의 LLM01로, 사용자 입력이 시스템 지시를 덮어쓰려는 공격이다. 에이전트에 닿기 전 before_agent 훅에서 '이전 지시 무시' 같은 패턴을 규칙으로 걸러내고, 사용자 입력과 시스템 프롬프트 채널을 엄격히 분리한다. 도구 결과나 외부 문서에 섞여 들어온 명령문도 지시가 아닌 데이터로만 다루고, 중요한 행동은 Human-in-the-loop 승인을 거치게 한다."
related:
  - middleware
  - ai-agent-react
  - prompt-context/llm-hallucination
  - prompt-context/harness-engineering
source: "Day1(9/9) 슬라이드 p.24–27 (AI 규제, 개발 체크리스트), Day2(9/10) 슬라이드 p.151–158, 실습 [5] 3장"
---

```compare
Before Agent Guardrail | After Agent Guardrail
작동 시점 | 질문이 LLM에 도달하기 직전 | 답변 생성 직후, 사용자에게 보여주기 전
주 목적 | 비용 절감, 보안(PII), 정책 위반 차단 | 품질 관리, 환각 방지, 답변 안전성 검증
방식 | 규칙 기반 (키워드, 정규식) | 모델 기반 (감시자 LLM 평가)
비용·속도 | 매우 저렴, 매우 빠름 | 메인 + 감시자 LLM 비용, 검사 시간만큼 지연
처리 | jump_to end로 즉시 응답 | Intervention(내용 교체) 또는 Regeneration(재생성)
```

```python
@before_agent(can_jump_to=["end"])
def education_guardrail(state, runtime):
    text = state["messages"][-1].content
    if any(k in text for k in ["답지", "정답 알려줘", "숙제 대신"]):
        return {"messages": [{"role": "assistant", "content": "힌트를 드릴까요? 어디가 어려운지 말해주세요."}],
                "jump_to": "end"}                       # LLM 호출 없이 종료
    return None                                         # 통과

agent = create_agent(model="gpt-5-nano", tools=[],
    middleware=[education_guardrail, student_safety_middleware,       # 입력 규칙, 연락처 마스킹
                counseling_escalation_middleware, answer_leakage_guardrail])  # 상담 이관, 출력 검증
```

| AI 개발 체크리스트 | 구현 방법 |
| --- | --- |
| 환각 방지 (MUST) | RAG·신뢰도 점수, 고위험 답변 전 HITL |
| 프롬프트 인젝션 (MUST) | before_agent 규칙 필터, 입력·시스템 프롬프트 채널 분리 |
| 권한 관리 (MUST) | RBAC, 도구 호출을 사용자 토큰 권한 범위로 한정 |
| 개인정보 (MUST) | PIIMiddleware로 이메일·카드번호 마스킹, DLP |
| 투명성·책임성 (SHOULD) | CoT·툴 호출 로그 저장, 변경 불가 감사 로그, 모델 카드 |
| 안전성 (MUST) | 유해 콘텐츠 분류기, 배포 전 Red Teaming |

> [!tip] 규제 프레임워크 세 줄 요약
> OWASP Top 10 for LLM: 생성형 AI 보안 표준(LLM01 프롬프트 인젝션). NIST AI RMF: 자발적 위험 관리 가이드. EU AI Act: 위험도 4단계(금지·고위험·제한된 위험·최소 위험) 분류와 과징금이 있는 최초의 포괄적 AI 법.
