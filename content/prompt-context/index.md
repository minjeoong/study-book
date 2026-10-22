---
summary: "LLM에게 일을 잘 시키는 법 — 동작 원리와 한계에서 출발해 프롬프트 구조(RICE)·기법(Few-shot, CoT 등)을 거쳐 Context·Harness 설계까지"
keywords:
  - Prompt Engineering
  - Token
  - Temperature
  - Top-p
  - RICE
  - Few-shot
  - Chain of Thought
  - Step-back
  - Self-Consistency
  - Context Engineering
  - Harness Engineering
  - LangChain
materials:
  - file: slides-prompt-context-engineering.pdf
    title: "강의 슬라이드 — Prompt 설계 및 Context Engineering"
    type: slides
    date: 2026-07-15
  - file: lab-few-shot-market-research.ipynb
    title: "실습 — Few-shot 시장조사·전략·의사결정 보고서 (LangChain)"
    type: notebook
    date: 2026-07-15
---

## 한눈에 보기

```flow
생성형 AI 트렌드 :: 답변하는 AI → 근거를 찾아 답하는 AI(RAG) → 실행하는 AI(Agent)
LLM 동작 원리 :: 다음 토큰 확률 예측, Scale, Hallucination
Prompt 기초 :: Token, Sampling 파라미터, System/User Prompt, RICE
Prompt 기법 :: Few-shot, CoT, Step-back, Self-Consistency, Devil's Advocate, Meta
논문으로 검증 :: 모델 크기, 예시 형식, 공손함·감정, Temperature
Prompt를 넘어서 :: Context Engineering → Harness Engineering
```

- LLM은 다음 토큰을 확률로 고르는 모델이라 "무엇을 어떻게 입력하느냐"가 곧 성능이다.
- 프롬프트 문장 다듬기(Prompt Engineering)에서 시작해, 컨텍스트 윈도우 전체 설계(Context Engineering), 에이전트의 실수를 시스템으로 막는 설계(Harness Engineering)로 관점이 넓어진다.
- 실습은 LangChain Few-shot 프롬프트로 시장조사 → 전략 → 의사결정 보고서를 만드는 LCEL 파이프라인.

## 수업 흐름

2026-07-15 (Day 1), 페이지는 PDF 기준.

1. **생성형AI 트렌드** (p.3–20) — Gartner Hype Cycle(2014 빅데이터 → 2018 딥러닝 → 2023 생성형 AI → 2025 AI Agents), ChatGPT 5일 만에 100만 사용자, Prompt Engineer 직무, Chatbot → RAG → Agent, 생성형 AI 4대 Task, 지도학습 → LLM 패러다임, 기업 도입 허들, Biz Use Case 3분류
2. **생성형AI 동작 원리와 한계** (p.21–28) — LM = 다음 단어 확률, GPT-3 학습 데이터(약 500B 토큰), 파라미터 Scale(1.5B → 175B), Hallucination
3. **Prompt Engineering 기초** (p.29–55) — Token, Prompt Engineering 정의, Sampling controls(Temperature, Top-k/p, Min-p, Max tokens), reasoning.effort·verbosity, System/User Prompt, RICE 프레임워크, Socratic Prompting, Policy·Style·Constraints·Format
4. **Prompt Engineering Techniques** (p.56–73) — Zero/One/Few-shot, CoT, Step-back, Self-Consistency, Devil's Advocate, Multi-Persona, Meta Prompting, Markdown 프롬프트
5. **논문으로 살펴보는 Prompt Engineering** (p.74–86) — 기법 분류(survey), 모델 크기와 Few-shot, 예시 품질(랜덤 라벨 vs 형식), 공손함, EmotionPrompt, Temperature와 Hallucination, CoT의 한계
6. **Prompt Engineering을 넘어서** (p.87–96) — Context Engineering(Context Rot, 구성 요소 4가지), Harness Engineering(Legibility, Mechanical Hierarchy, Progressive Disclosure)

## 실습 정리

- **환경**: Colab, `langchain-openai`, `ChatOpenAI(model="gpt-4.1-mini", temperature=0.3)`
- **목표**: Few-shot 프롬프트로 시장조사 → 사업 전략 → 의사결정을 거쳐 "AI 기반 드론 배송 서비스" 최종 보고서까지 생성 (TODO 1–20)
- **패턴**: 매 단계 `examples → example_prompt → FewShotChatMessagePromptTemplate → system + few-shot + human → prompt | llm | StrOutputParser`

| 단계 | TODO | Few-shot 예시 | System 역할 | 덧붙인 기법 |
| --- | --- | --- | --- | --- |
| 시장조사 | 1–9 | 전기차, 스마트팩토리 (시장 규모·경쟁사·전망) | Gartner Senior Research Analyst (실습에선 반려동물 산업 컨설턴트로 변형) | Markdown 보고서 구조, Step-back, CoT 문구 |
| 전략수립 | 10–14 | 온라인 쇼핑몰, AI 교육 (단기·중기·장기 전략) | McKinsey 전략 컨설턴트 | Devil's Advocate (전략이 실패했다고 가정) |
| 의사결정·최종 보고서 | 15–20 | 전기차 시장 진출 (진출 추천·성장률·정책·수익성) | BCG Senior Partner (실습에선 최종 프로젝트 분석 전문가로 변형) | Step-back 질문 3개, 미검증 수치 단정 금지 |

```python
example_prompt = ChatPromptTemplate.from_messages([
    ("human", "산업 : {industry}"),
    ("ai", "{analysis}"),
])
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)
final_prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 Gartner의 Senior Research Analyst입니다."),
    few_shot_prompt,
    ("human", "{input}"),
])

chain = final_prompt | llm | StrOutputParser()   # LCEL: Prompt → LLM → Parser
result = chain.invoke({"input": "생성형 AI 교육 시장을 조사하세요."})
```

> [!warn] 헷갈리기 쉬움
> `invoke()`에 넘기는 dict 키는 프롬프트의 템플릿 변수명과 같아야 한다. 노트북 TODO 9는 `{"market": ...}`를 넘겼지만 `final_prompt`에 `{market}` 변수가 없어 입력이 무시되고 하드코딩된 질문(반려동물 헬스케어)으로 답이 나왔다.
