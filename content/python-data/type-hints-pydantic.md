---
title: 타입 힌트와 Pydantic
en: Type Hints, mypy, Pydantic v2
summary: 타입 힌트는 실행에 영향 없는 정적 검사용 표기, Pydantic은 실행 중에 실제로 타입·범위를 검증하는 데이터 모델
importance: 3
order: 6
tags: [타입힌트, typing, mypy, Pydantic, dataclass]
keypoints:
  - "Optional[X] = X | None, Union은 여럿 중 하나, Literal은 정해진 값만, Any는 검사 포기"
  - 타입 힌트는 런타임에 강제되지 않고 mypy·Pylance가 실행 전에 오류를 잡아 준다
  - "Pydantic BaseModel + Field(gt=0)로 검증, 실패하면 ValidationError, model_dump()로 dict 변환"
qa:
  - q: 타입 힌트를 쓰면 실행 중에 타입이 강제되나요?
    a: "아닙니다. def add(x: int, y: int)에 문자열을 넣어도 실행은 됩니다. 타입 힌트는 주석에 가까워서 mypy나 VS Code Pylance 같은 정적 검사 도구가 실행 전에 불일치를 찾아 주고, IDE 자동완성 품질이 좋아지며, 함수 시그니처가 팀 간 계약서 역할을 합니다."
  - q: dataclass, TypedDict, Pydantic은 어떻게 다른가요?
    a: "dataclass는 __init__, __repr__, __eq__ 같은 보일러플레이트를 자동 생성하는 클래스, TypedDict는 dict에 키별 타입 힌트만 붙이는 것이라 둘 다 실행 중 검증은 하지 않습니다. Pydantic BaseModel은 생성 시점에 타입 변환과 범위 검증을 실제로 수행하고 ValidationError로 어느 필드가 왜 틀렸는지 알려 줍니다. 외부에서 들어오는 API 응답이나 CSV 행 검증에는 Pydantic을 씁니다."
  - q: 실습에서 Pydantic을 어떻게 활용했나요?
    a: "판매 데이터를 SalesRecord 모델(month·region 비어 있으면 안 됨, amount > 0, category 선택)로 행마다 검증해 성공은 valid, 실패는 {row, error}로 errors에 분리 저장했습니다. Day1 종합실습에서는 Open-Meteo 등 3개 API 응답에서 필요한 필드만 뽑아 강수확률 0~100, 위도 −90~90 같은 범위를 Field 제약으로 검증했습니다."
related: [exception-logging, code-quality-testing, automation-project-structure]
source: Day1 (8/6) 슬라이드 p.85 (dataclass·TypedDict), p.167–185 (기본 타입 힌트, Optional·Union·Any·Literal, Generic, Protocol, Callable, mypy, Pydantic v2, 파이프라인 검증 패턴), Practice 2 (Pydantic 검증 파이프라인), Day1 종합실습 (API 스키마 검증)
---

```compare
타입 힌트 + mypy | Pydantic BaseModel
검사 시점 | 실행 전 (정적 분석) | 실행 중 (객체 생성 시)
실패하면 | mypy 오류 메시지, 실행은 됨 | ValidationError 발생
값 범위 | 표현 못 함 | Field(gt=0, ge=0, le=100, min_length=3)
타입 변환 | 없음 | "1500" → 1500.0 자동 변환
쓰임 | 함수 시그니처, IDE 자동완성, CI 품질 게이트 | API 응답·CSV 행 검증, FastAPI 스키마
```

```python
from pydantic import BaseModel, Field, ValidationError, field_validator

class SalesRecord(BaseModel):
    month: str
    region: str
    amount: float = Field(gt=0)              # 0 초과만 허용
    category: str | None = None              # Optional

    @field_validator("month", "region")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("값이 비어 있으면 안 됩니다.")
        return v.strip()

valid, errors = [], []
for i, row in enumerate(raw_rows):
    try:
        valid.append(SalesRecord(**row).model_dump())
    except ValidationError as e:              # Exception 대신 구체적으로
        errors.append({"row": i, "error": str(e)})
```

- Generic[T]: 타입을 파라미터처럼 (`Stack[int]`), Protocol: 상속 없이 메서드만 맞으면 통과 (Duck Typing 정적 검사), Callable[[int, int], int]: 함수 시그니처 타입
- mypy 설정은 `strict = True`, `disallow_untyped_defs = True`로 모든 함수에 타입 강제 가능
