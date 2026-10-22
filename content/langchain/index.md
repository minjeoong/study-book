---
summary: "LLM API 직접 호출에서 출발해 LangChain 컴포넌트(Chat Model·Prompt·Structured Output·LCEL·Tool)를 익히고, create_agent 기반 Basic·Advanced Agent(메모리·미들웨어·가드레일)까지 만드는 과정"
keywords:
  - LangChain
  - init_chat_model
  - ChatPromptTemplate
  - Structured Output
  - LCEL
  - Runnable
  - Tool Calling
  - create_agent
  - ReAct
  - Checkpointer
  - Middleware
  - Human-in-the-loop
  - Guardrails
  - Long-term Memory
materials:
  - file: slides-langchain.pdf
    title: "강의 교재 — 생성형 AI 서비스 개발 (LangChain)"
    type: slides
    date: 2026-09-09
  - file: lab-2-llm-basics.ipynb
    title: "실습 [2] — LLM과 친해지기"
    type: notebook
    date: 2026-09-09
  - file: lab-3-langchain.ipynb
    title: "실습 [3] — LangChain"
    type: notebook
    date: 2026-09-09
  - file: lab-4-basic-agent.ipynb
    title: "실습 [4] — Basic Agent"
    type: notebook
    date: 2026-09-09
  - file: lab-5-advanced-agent.ipynb
    title: "실습 [5] — Advanced Agent"
    type: notebook
    date: 2026-09-09
  - file: lab-langchain-data.zip
    title: "실습 데이터 — capital.yaml, fruit_color.yaml, test_data.txt"
    type: lab
    date: 2026-09-09
  - file: lab-langchain-quiz.pdf
    title: "퀴즈, 종합실습 — 생성형 AI 서비스 개발"
    type: lab
    date: 2026-09-10
  - file: submission-team2-design.pdf
    title: "과제 제출 — 2조 설계서 (최종)"
    type: etc
    date: 2026-09-11
  - file: submission-team2-source.zip
    title: "과제 제출 — 2조 개발 소스"
    type: lab
    date: 2026-09-11
---

## 한눈에 보기

```flow
LLM과 친해지기 :: Hugging Face pipeline, Gemini·OpenAI SDK, stateless 대화
LangChain 컴포넌트 :: Chat Model, Message, Prompt Template, Structured Output, LCEL, Tool
Basic Agent :: create_agent, 도구 호출 루프, 단기 메모리, 구조화된 답변
Advanced Agent :: Runtime·State, Middleware, Guardrails, 장기 메모리
종합실습 :: 조별 에이전트 설계서 → 개발 → 발표
```

- LLM은 다음 토큰 예측기라 환각·지식 차단·실행력 부족이 있고, 이를 Prompt·RAG·Tool Calling·LangChain·LangGraph가 나눠서 보완한다는 큰 그림에서 시작함.
- LangChain v1의 핵심은 벤더 독립 인터페이스(`init_chat_model`)와 `prompt | model | parser` 체인(LCEL), 그리고 `create_agent` 하나로 만드는 에이전트 루프.
- 후반부는 "안전하고 통제 가능한 프로덕션 에이전트" — 미들웨어 훅으로 컨텍스트를 주입·검증하고, 가드레일과 Human-in-the-loop로 위험한 행동을 막음.

## 수업 흐름

페이지는 PDF 페이지 번호 기준 (슬라이드 우하단 번호와 2~4쪽 차이 있음). 일차 구분은 교재 p.3 시간표 기준.

### Day1 (9/9) — LLM 호출부터 Basic Agent까지

1. **Introduction** (p.5–28) — AI Application 개발 4분류(전통 SW → AI 모델 → AI 앱 → Agent), AI 제품 6단계 진화, RAG 메커니즘, Agent 정의와 ReAct, AI 규제(OWASP·NIST·EU AI Act)와 개발 체크리스트
2. **LLM과 친해지기** (p.29–58) — 다음 토큰 예측, LLM 한계 보완 6가지 기술, 대표 모델, Hugging Face pipeline 4종, Gemini SDK(세션 객체), OpenAI SDK(역할 부여, 기억 X/O, TTS, 멀티턴, 논문 요약)
3. **LangChain** (p.59–103) — Chat Model(`init_chat_model`, temperature·timeout·max_tokens, invoke·stream·batch), Message, Prompt Template 4가지 + MessagesPlaceholder, Structured Output(Pydantic·JSON Schema), LCEL 인터페이스와 Runnable 4종, Tool Calling(Tavily, `@tool`)
4. **Basic Agent** (p.104–127) — Agent Flow, Tool 사용(날씨·사칙연산·알라딘·챗봇), 단기 메모리(checkpointer, thread_id), 구조화된 답변(`ToolStrategy`, LLMToolEmulator)

### Day2 (9/10) — Advanced Agent, 퀴즈, 설계

5. **Advanced Agent** (p.128–169) — Runtime·State, Node-style·Wrap-style 미들웨어, Built-in 미들웨어 5종, Custom 미들웨어, Guardrails(Before·After·Combine), Long-term Memory(Store, Use Case 1·2)
6. **퀴즈** — 20문항(객관식 17, 주관식 3), 1시간, Open Book
7. **종합실습 설계** — 조별 AI Agent 서비스 정의(공공데이터·기상청·Naver 등 Open API) → 설계서 제출

### Day3 (9/11) — 종합실습 개발

8. 조 내 역할 분담 후 개발 → 조별 발표(설계서·소스 구조·시연·Q&A) → 설계서(최종)·소스 제출

## 실습 정리

| 노트북 | 내용 | 핵심 포인트 |
| --- | --- | --- |
| [2] LLM과 친해지기 | HF pipeline(분류·생성·QA·감성), Gemini `chats.create`, OpenAI `chat.completions`, TTS, `test_data.txt` 논문 요약 | API는 stateless — messages에 기록을 직접 누적해야 기억 |
| [3] LangChain | `init_chat_model`, 메시지, PromptTemplate·`load_prompt`(capital.yaml), Structured Output, LCEL 인터페이스, RunnableParallel·Lambda·Branch, Tavily·`@tool` | 모든 컴포넌트가 Runnable이라 `invoke/stream/batch` 공통 |
| [4] Basic Agent | 날씨·사칙연산·알라딘 베스트셀러·챗봇 도구, `InMemorySaver` + thread_id, `ToolStrategy(EmailAnalysis)` | 도구가 있어도 안 쓸 수 있음 → system_prompt로 규칙 부여 |
| [5] Advanced Agent | Context(dataclass) 주입, 동적 모델 선택, HITL·PII·Summarization 미들웨어, 교육용 4중 가드레일, Store 장기 메모리 | 미들웨어로 모델·프롬프트를 런타임에 교체 |

```python
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware, PIIMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-5-nano",
    tools=[send_email_tool, read_email_tool],
    checkpointer=InMemorySaver(),                      # HITL은 중단·재개가 필요해 필수
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        HumanInTheLoopMiddleware(interrupt_on={
            "send_email_tool": {"allowed_decisions": ["approve", "edit", "reject"]},
            "read_email_tool": False,                  # 읽기는 자동 승인
        }),
    ],
)
agent.invoke({"messages": [{"role": "user", "content": "교수님께 메일 보내줘"}]},
             {"configurable": {"thread_id": "HIL-b"}})
```

### 종합실습 — 2조 Earth.FM

- **서비스**: 지역을 입력하면 NASA EONET(자연현상)·USGS(지진)·Open-Meteo(좌표·날씨)를 조회해 지역 분위기(mood)를 판정하고, Freesound 환경음과 AI 라디오 해설(TTS)을 만들어 주는 에이전트. 재난 예보가 아닌 교육·엔터테인먼트로 범위를 명시.
- **구조**: LangGraph `StateGraph` — 입력 가드레일 → 요청 해석 → 지역 해석 → Supervisor 라우팅 → EONET·USGS 병렬 조회 → Judge(근거 부족 시 범위 확대 재조회) → mood 판정 → 음원 검색 → 원고 작성 → QA Reviewer(1회 재작성) → 출력 가드레일 → finalize. 각 LLM 노드는 `with_structured_output`으로 스키마 강제.
- **안정성 설계**: 도구·모델 호출 한도 12회, 타임아웃 8초, 429·5xx·타임아웃만 지수 백오프 재시도, 10분 캐시, 근거 대조(Tool 결과에 없는 사건·수치 생성 금지), API Key·정밀 위치 마스킹 등 가드레일 GR-01~12.

```python
graph.add_edge("earth_dispatch", "eonet_subagent")          # fan-out: 두 API를 병렬 조회
graph.add_edge("earth_dispatch", "usgs_subagent")
graph.add_edge(["eonet_subagent", "usgs_subagent"], "terra_judge")   # fan-in
graph.add_conditional_edges("terra_judge", route_from_judge, {
    "prepare_requery": "prepare_requery",   # 사건 없음 → 기간·반경 확대 후 재조회
    "weather_subagent": "weather_subagent",
    "mood_planner": "mood_planner",
})
```

> [!tip] 설계서에서 배운 점
> 데이터가 없는 것(no_event)과 API가 실패한 것(unavailable)을 다른 상태로 구분하고, 사용자가 요청한 검색 범위와 실제로 확대된 범위를 State에 따로 저장해 출력에 함께 표기함. "결과 없음"을 오류가 아닌 정상 결과로 다루는 것이 환각 방지의 출발점.
