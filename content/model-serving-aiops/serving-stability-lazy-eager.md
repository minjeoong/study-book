---
title: 서빙 안정성 — 헬스체크와 Lazy vs Eager 로딩
en: Input Validation, Error Handling, Health Check, Lazy vs Eager Loading, Logging
summary: "입력 검증·에러 핸들링·헬스체크·로깅으로 추론 서버를 안정화하고, 모델을 서버 시작 시(Eager) 또는 첫 요청 시(Lazy) 로드하는 전략을 고름"
importance: 3
order: 5
tags: [헬스체크, Lazy Loading, Eager Loading, HTTPException, 로깅, Readiness]
keypoints:
  - "Eager는 시작이 느리지만 첫 요청이 빠르고 모델 오류를 기동 시점에 발견"
  - "Lazy는 시작이 빠르지만 첫 사용자가 로딩을 기다리고 오류가 늦게 드러남"
  - "/health가 ok여도 예측 가능 상태는 아닐 수 있음 → model_loaded 노출, /ready 분리"
qa:
  - q: "Lazy Loading과 Eager Loading 중 무엇을 쓰나요?"
    a: "Eager는 서버 시작 시 모델을 로드해 시작은 느리지만 첫 요청부터 빠르고, 모델 파일에 문제가 있으면 기동 단계에서 실패해 바로 발견됩니다. Lazy는 첫 요청이 올 때 로드하고 캐시해 시작은 빠르지만 첫 사용자가 로딩 시간을 기다리고 오류도 요청 시점에야 드러납니다. 실측에서 첫 /predict가 Lazy 2.31초, Eager 0.15초였고, 운영 컨테이너는 Eager와 readiness 체크를, 잦은 재시작이 필요한 개발 환경이나 모델이 많고 일부만 쓰는 서비스는 Lazy를 택합니다."
  - q: "헬스체크 엔드포인트는 어떻게 설계하나요?"
    a: "로드밸런서나 Kubernetes 같은 오케스트레이터가 주기적으로 호출해 서버 생존 여부를 확인하는 /health를 둡니다. 단순히 ok만 반환하면 프로세스는 살아 있는데 모델이 로드되지 않아 예측이 500나는 상태를 놓치므로, model_loaded와 로딩 모드를 함께 반환하거나 예측 가능 여부를 보는 /ready(미준비 시 503)를 분리합니다. 이 엔드포인트가 이후 AIOps 인프라 감시 대상이 됩니다."
related: [fastapi-pydantic, model-monitoring, ci-cd-docker]
source: "Day1 슬라이드 p.32–44 (입력 검증·에러 핸들링, 헬스체크, Lazy/Eager, 로깅, 엔드포인트 실습, 빌드업 실습, Lazy vs Eager 결과표), 실습 가이드 p.12 Day1·부록2 Q&A, HAIC project model_loader.py, 개인 서브노트 3-2 1)·T1·T2"
---

```compare
Lazy Loading | Eager Loading
서버 시작 | 빠름 (실측 0.26초) | 느림, 모델 로딩 대기 (2.45초)
첫 요청 | 느림, 로딩 포함 (2.31초) | 빠름 (0.15초)
이후 요청 | 0.016초 | 0.016초
모델 오류 발견 | 첫 요청에서 500 | 기동 단계에서 실패 (exit code 3)
적합 | 빠른 배포·재시작, 모델이 늦게 정해질 때 | 첫 요청부터 안정 응답, 컨테이너 배포
```

```python
def load_eager():                        # @app.on_event("startup")에서 호출
    global _model_cache
    _model_cache = _load_model()         # 시작은 느리지만 첫 요청부터 빠름

def get_model():                         # /predict에서 호출
    global _model_cache
    if _model_cache is None:             # Lazy: 첫 요청 때만 로드 후 캐시
        _model_cache = _load_model()
    return _model_cache

@router.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model_cache is not None,
            "loading_mode": os.getenv("LOADING_MODE", "lazy")}
```

- 입력 검증: 스키마 위반은 422, 비즈니스 규칙(빈 문자열 등)은 HTTPException(400), 추론 예외는 500으로 감싸 원인 메시지 반환
- 로깅: 요청(text_len)·응답(label)을 남겨 장애 분석과 Day3 지표 수집의 기반으로 사용

> [!tip] Eager도 첫 추론은 느리다
> 실측에서 Eager 첫 요청 0.153초, 두 번째 0.016초로 약 10배 차이. TensorFlow가 첫 호출에서 실행 그래프를 준비하기 때문으로 보고, 로딩 직후 더미 입력으로 한 번 추론하는 warm-up 단계를 두면 좋다.
