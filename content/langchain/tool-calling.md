---
title: "Tool Calling"
en: "Tool Calling, Built-in Tools, Custom Tools"
summary: "LLM이 텍스트 생성을 넘어 검색·API·계산기·DB 같은 외부 도구를 골라 호출하게 하는 LangChain의 핵심 기능"
importance: 3
order: 8
tags:
  - LangChain
  - Tool
  - Agent
keypoints:
  - "LLM 한계(실시간 데이터, 수학 계산, 환각)를 외부 도구로 보완"
  - "빌트인 도구·툴킷(TavilySearch 등) + @tool 데코레이터로 만드는 사용자 정의 도구"
  - "함수 + 타입 힌트 + docstring + @tool — docstring이 '언제 쓸지' 판단 근거"
qa:
  - q: "Tool Calling은 어떻게 동작하나?"
    a: "도구의 이름, 설명, 입력 스키마를 모델에 알려주면, 모델은 질문을 보고 도구가 필요하다고 판단할 때 텍스트 대신 tool_calls(도구 이름과 JSON 인자)가 담긴 AIMessage를 낸다. 실제 함수 실행은 애플리케이션이나 에이전트 런타임이 하고, 결과를 ToolMessage로 다시 모델에 넣어 최종 답을 만들게 한다. 모델이 코드를 직접 실행하는 게 아니라 무엇을 어떤 인자로 부를지를 결정하는 것이다."
  - q: "커스텀 도구를 잘 만들려면?"
    a: "@tool 데코레이터를 붙이고 타입 힌트와 docstring을 반드시 쓴다. 모델은 docstring과 Args 설명을 읽고 언제, 어떤 인자로 호출할지 정하므로 '도시명은 한글로', '10을 넘으면 10으로' 같은 제약까지 적는 것이 좋다. 실습의 calculate 도구처럼 eval을 쓰는 위험한 동작은 허용된 연산만 실행되게 제한해야 한다."
related:
  - create-agent
  - ai-agent-react
  - middleware
  - rag-pipeline/agentic-rag
source: "Day1(9/9) 슬라이드 p.100–103, 실습 [3] 6장 Tool Calling"
---

```compare
빌트인 도구 | 사용자 정의 도구
정의 | LangChain이 제공하는 tool과 toolkit(여러 도구 묶음) | 내 함수를 @tool로 변환
예시 | TavilySearch(max_results, include_domains, include_answer) | add_numbers, get_weather, 알라딘 베스트셀러 API
장점 | 설치·키 설정만으로 바로 사용 | 사내 API·DB 등 무엇이든 연결
```

| 도구 사용 사례 | 연결 대상 | Tool 사용의 장점 |
| --- | --- | --- |
| 날씨 조회 · 일정 관리 | OpenWeather API, Google Calendar | 확장성: LLM + 실제 기능 결합 |
| 수학 계산 | math 모듈 | 지능적 선택: 언제 어떤 도구를 쓸지 모델이 판단 |
| 데이터 검색 | RAG(VectorStore) 검색 도구 | 자동 인자 매핑: 인자를 JSON으로 생성 |
| DB 조회 | SQL 쿼리 생성·실행 | 로깅·안전성: 호출 기록 추적, 허용 함수만 실행 |

```python
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """도시의 날씨를 조회합니다. 도시명은 한글로 해줘요

    Args:
        city: 도시 이름 (예: '서울', '부산', '제주')
    """
    return {"서울": "맑음 22°C", "부산": "흐림 20°C"}.get(city, f"{city}의 날씨 정보를 찾을 수 없습니다.")

get_weather.invoke({"city": "부산"})   # 도구도 Runnable이라 단독 실행 가능
```
