---
title: "Structured Output"
en: "Structured Output (Pydantic, JSON Schema)"
summary: "LLM 답변을 텍스트가 아닌 미리 약속한 스키마의 데이터로 받아 DB 저장·API 호출 같은 후속 로직에 바로 연결"
importance: 3
order: 6
tags:
  - LangChain
  - Pydantic
  - JSON Schema
  - Agent
keypoints:
  - "스키마(Pydantic·JSON Schema) 정의 → model.with_structured_output(스키마) 두 단계"
  - "Field description은 주석이 아니라 프롬프트 — 예시·제약을 쓰면 정확도 상승"
  - "에이전트는 response_format으로 최종 산출물의 스키마를 강제"
qa:
  - q: "Structured Output이 필요한 이유는?"
    a: "자연어 답변을 DB 저장, API 호출, 알림 발송에 쓰려면 정규식으로 파싱해야 하고 형식도 매번 흔들린다. 스키마를 주고 with_structured_output을 쓰면 response.title처럼 바로 접근하고, 평점은 문자열이 아니라 float로 타입이 보장된다. 실습에서는 이메일 분석 에이전트의 결과를 EmailAnalysis 스키마로 강제해 intent가 complaint이고 sentiment가 negative면 CS팀 긴급 알림을 보내는 자동화로 이어 붙였다."
  - q: "Pydantic 스키마를 설계할 때 주의할 점은?"
    a: "Field의 description은 LLM이 읽고 값을 채우는 프롬프트다. '영화 평점 (10점 만점 기준)', '예: 인셉션'처럼 예시와 제약을 구체적으로 쓰고, 값이 정해진 항목은 Literal로 선택지를 제한하며, 모를 수 있는 값은 Optional과 default=None으로 둔다. JSON Schema 방식이라면 키 이름을 영문, 숫자, 언더스코어, 대시로만 쓰는 것이 안전하다."
related:
  - create-agent
  - lcel-runnable
  - rag-pipeline/rag-evaluation
  - prompt-context/meta-prompting-markdown
source: "Day1(9/9) 슬라이드 p.77–81, p.122–127, 실습 [3] 4장, 실습 [4] 구조화된 답변"
---

```compare
Pydantic | JSON Schema
정의 | BaseModel 클래스 + Field(description) | 딕셔너리 (type, properties, required)
결과 | 모델 객체 (response.title) | dict (response['title'])
장점 | 타입 캐스팅, IDE 자동완성, 파이썬 에이전트에 추천 | 언어 중립, 다른 시스템과 스키마 공유
주의 | description을 구체적으로 | 키는 영문·숫자·_·- 만
```

```python
class Movie(BaseModel):
    """상세한 영화 정보."""
    title: str = Field(description="영화의 제목 (예: 인셉션)")
    year: Optional[int] = Field(default=None, description="개봉 연도. 모르면 None.")
    genre: Literal["액션", "로맨스", "SF", "코미디", "기타"] = Field(description="장르")
    rating: float = Field(description="영화 평점 (10점 만점 기준)")

model.with_structured_output(Movie).invoke("영화 도둑들에 대해 설명해 주세요")
# title='도둑들' year=2012 genre='액션' rating=7.5
```

> [!tip] 에이전트에서는 두 가지가 돌아온다
> `response["messages"]`에는 도구 호출을 포함한 사고·행동 과정이, `response["structured_response"]`에는 스키마에 맞춘 최종 산출물(Pydantic 객체)이 담김. `.model_dump()`로 dict로 바꿔 후처리 파이프라인에 넘김.
