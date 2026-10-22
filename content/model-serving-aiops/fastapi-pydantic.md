---
title: FastAPI 서빙 기초 — 라우팅과 Pydantic 스키마
en: FastAPI, APIRouter, Pydantic, Swagger UI
summary: "FastAPI 앱에 기능별 APIRouter를 조립하고, Pydantic 스키마로 입력을 검증(실패 시 422)해 모델 추론을 /predict API로 감싸는 방법"
importance: 3
order: 3
tags: [FastAPI, Pydantic, APIRouter, Swagger, "422", uvicorn, StaticFiles]
keypoints:
  - "요청 흐름: URL 라우터 매칭 → Pydantic 검증 → 핸들러 실행 → return이 JSON 응답"
  - "Field(gt=0, min_length=20, max_length=20)로 학습 시점 입력 형태를 API에 강제"
  - "타입 힌트와 스키마만으로 /docs Swagger 자동 생성, Try it out으로 바로 테스트"
qa:
  - q: "FastAPI에서 Pydantic 스키마는 어떤 역할을 하나요?"
    a: "요청과 응답의 모양을 BaseModel 클래스로 선언하면 FastAPI가 JSON 본문을 자동으로 파싱하고 타입과 범위를 검증합니다. 검증에 실패하면 핸들러 함수까지 가지 않고 422와 함께 어떤 필드(loc)가 왜(msg) 틀렸는지 돌려주므로 if문 검증 코드가 줄어듭니다. 실습에서는 시퀀스 길이를 정확히 20, 종가 > 0, 거래량 ≥ 0으로 강제해 학습 때와 다른 입력이 모델에 들어가는 것을 막았습니다."
  - q: "422, 400·404, 500은 각각 언제 나오나요?"
    a: "422는 Pydantic 스키마 검증 실패로, 필드 누락이나 타입·범위 위반 시 FastAPI가 자동으로 반환합니다. 400이나 404는 개발자가 비즈니스 규칙을 보고 HTTPException으로 직접 올리는 클라이언트 오류이고, 500은 잡지 못한 예외가 났을 때입니다. 422가 뜬다는 것은 스키마가 의도대로 동작했다는 뜻이므로, 운영에서는 4xx와 5xx를 구분해 모니터링합니다."
  - q: "대시보드용 StaticFiles는 왜 라우터 등록 뒤에 mount하나요?"
    a: "Starlette는 등록된 순서대로 경로를 검사하기 때문에, 정적 파일을 루트에 먼저 mount하면 /predict 같은 API 경로까지 정적 파일 요청으로 먼저 매칭되어 버립니다. 그래서 include_router로 API 라우터를 모두 등록한 뒤 마지막에 StaticFiles를 mount합니다. 라우터 등록 순서 자체도 경로 우선순위를 결정합니다."
related: [serving-stability-lazy-eager, deployment-gate-validation, async-batching]
source: "Day1 슬라이드 p.17–26 (최소 서버, 라우팅·요청/응답 모델, Pydantic 입력 검증, Schema vs DB Model, MariaDB·SQLAlchemy, Swagger, MVP 스코프), FastAPI 기본 문법 자료 p.1–4, 실습 fastapi_practice ex1–ex7, HAIC project schemas.py·routers/predict.py"
---

```flow
URL 매칭 :: FastAPI 앱 ← include_router로 조립된 APIRouter
Pydantic 검증 :: 실패하면 함수 실행 전에 422 (loc, msg)
핸들러 실행 :: def / async def 안에서 모델 추론
응답 :: return 값을 response_model 모양으로 JSON 직렬화
```

```python
class DailyPoint(BaseModel):
    close: float = Field(..., gt=0)
    volume: int = Field(..., ge=0)

class PredictRequest(BaseModel):
    sequence: list[DailyPoint] = Field(..., min_length=20, max_length=20)  # 학습 SEQ_LEN

class PredictResponse(BaseModel):
    predicted_close: float
    model_version: str

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    model = model_loader.get_model()
    pred = model.predict_one([p.model_dump() for p in req.sequence])
    return PredictResponse(predicted_close=round(pred, 2), model_version=model.version)
```

```compare
Pydantic (API Schema) | SQLAlchemy (DB Model)
목적 | API 입출력 데이터 검증 | 테이블 구조 정의·매핑
존재 시점 | 요청마다 생기는 임시 객체 | DB에 영속 저장되는 레코드
예시 | PredictRequest / PredictResponse | PredictionLog
```

> [!tip] 실행과 환경변수
> `uvicorn serving_app.main:app --host 0.0.0.0 --port 8000 --reload` (uvicorn = ASGI 실행기). `LOADING_MODE=eager`, `MODEL_SOURCE=mlflow`처럼 환경변수로 코드 수정 없이 동작을 전환한다. 과정에서 FastAPI는 백엔드 전반이 아니라 모델 추론 서빙 용도로만 쓴다(인증·템플릿 등은 범위 밖).
