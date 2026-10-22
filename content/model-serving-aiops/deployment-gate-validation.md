---
title: 데이터·모델 검증과 배포 게이트
en: Input Schema Validation, Performance Regression Test, Deployment Gate, Champion / Challenger
summary: "입력 스키마 검증, 이전 버전 대비 성능 회귀 테스트, 절대 성능 기준(RMSE ≤ $4)을 배포 전에 자동으로 확인해 나쁜 모델이 나가지 못하게 막는 안전장치"
importance: 3
order: 9
tags: [배포 게이트, 성능 회귀 테스트, 스키마 검증, Champion/Challenger, 골든셋, 롤백]
keypoints:
  - "입력 검증: 종가 > 0, 거래량 ≥ 0, 길이 20 — 학습 시점과 같은 형태·범위인지 (위반 시 422)"
  - "절대 기준(RMSE ≤ $4.00) + 상대 기준(운영 버전보다 크게 나빠지지 않음)을 함께 확인"
  - "미통과 버전은 기록만 남기고 승격 안 함 → 기존 Production 유지 = 자동 롤백 효과"
qa:
  - q: "배포 게이트가 없으면 어떤 일이 생기나요?"
    a: "자동 재학습이 돌 때 사람 검토 없이 Production이 바뀌므로, 데이터나 학습이 잘못돼 성능이 더 나쁜 모델도 그대로 서비스에 나갑니다. 게이트는 RMSE 같은 수치만으로 배포 여부를 자동 결정해 이런 사고를 막고, 통과하지 못한 버전은 Registry에 기록만 남긴 채 기존 Production이 계속 서비스합니다. 그래서 서비스 중단 없이 새 모델을 검증할 수 있고, 어떤 버전이 왜 막혔는지도 추적됩니다."
  - q: "절대 기준 게이트만으로 충분한가요?"
    a: "부족할 수 있습니다. 실습에서 fine-tuning 후 RMSE 1.47이 나왔지만 검증 표본이 5개 남짓이라 우연히 낮게 나왔을 가능성이 있었습니다. 그래서 이전 운영 버전보다 나빠지지 않았는지 보는 성능 회귀 테스트, 같은 홀드아웃에서 현재 Production(Champion)보다 나아야 교체하는 Champion/Challenger 비교, 매번 같은 고정 정상셋으로 기존 구간 성능 유지를 확인하는 골든셋 테스트를 함께 두는 것이 안전합니다."
related: [fastapi-pydantic, mlflow-tracking-registry, auto-retraining-loop]
source: "Day2 슬라이드 p.76 (게이트 미통과 시 이전 버전 유지), p.83–86 (입력 데이터 스키마 검증, 성능 회귀 테스트, 배포 게이트 설계), 실습 가이드 부록2 Q&A, 개인 서브노트 3-2 3), 2조 EtchGuard 발표 3장 운영 설계"
---

```flow
학습 완료 :: 새 버전 후보
입력 스키마 검증 :: 학습 시점과 같은 형태·범위인가
절대 기준 :: RMSE ≤ $4.00인가
회귀 테스트 :: 운영 버전보다 크게 나빠지지 않았나
판정 :: 통과 → Production 승격 / 미통과 → 배포 차단, 이전 버전 유지
```

```compare
절대 기준 | 상대 기준 (회귀·Champion) | 고정 정상셋 (골든셋)
질문 | 품질선을 넘는가 | 지금 운영 모델보다 나은가 | 기존 정상 구간 성능을 지키는가
예 | RMSE ≤ $4.00 (HAIC) | 신규 ≤ 운영 + 0.5, 홀드아웃 7.86 → 2.64 (EtchGuard) | 정상 2,410건 RMSE ≤ 4.0 (EtchGuard)
```

```python
def test_new_model_not_worse_than_production():
    prod_rmse = get_production_rmse()      # 예: 3.65
    new_rmse = get_latest_run_rmse()       # 예: 3.40
    assert new_rmse <= prod_rmse + 0.5, (
        f"신규 버전 RMSE({new_rmse})가 운영 버전({prod_rmse})보다 크게 나빠졌습니다 - 배포 중단")
```

> [!tip] 분류형 서비스라면
> 팀 프로젝트(이상 점수 예측)는 RMSE ≤ 4.0에 더해 HIGH 등급 Recall ≥ 0.80, Precision ≥ 0.80을 게이트로 두었다. 미검출 비용이 크면 Recall 하한, 오경보 피로가 크면 Precision 하한을 함께 건다.
