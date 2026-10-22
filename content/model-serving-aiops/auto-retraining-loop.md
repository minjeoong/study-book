---
title: 자동 재학습 루프 — 감지에서 재배포까지
en: Auto Retraining Trigger, Warm-start Fine-tuning, Redeploy
summary: "드리프트 감지 → 알림 → 최근 데이터 수집 → Production 가중치에서 fine-tuning → 게이트 재검증 → 승격(또는 기존 유지)을 사람 없이 반복하는 AIOps 핵심 루프"
importance: 3
order: 12
tags: [자동 재학습, Warm Start, Fine-tuning, 재배포, 롤백, 스케일러, aiops.log]
keypoints:
  - "감지 → 알림 → 최근 21 + 20행 수집 → fine-tune → 게이트 재검증 → 승격 or 기존 유지"
  - "데이터가 적어 scratch 대신 Production 가중치에서 lr 1e-4 · 10 epoch warm start"
  - "스케일러는 Day1 fit 그대로, 승격 후 서빙 캐시 교체·판정 윈도우 초기화"
qa:
  - q: "드리프트가 감지되면 왜 처음부터 재학습하지 않고 fine-tuning하나요?"
    a: "최근 1개월(21거래일)로 만들 수 있는 학습 시퀀스는 20개 남짓이라, 파라미터 약 1.6만 개인 LSTM을 처음부터 학습시키기엔 너무 적어 결과가 불안정합니다. 이미 3년치로 학습된 Production 가중치에서 낮은 학습률(1e-4)로 10 epoch만 이어서 학습하면 기존 지식은 유지하면서 최근 변화만 반영합니다. 팀 프로젝트 비교에서도 scratch는 정상 구간 RMSE가 3.1에서 6.4로 무너지고 시드에 따라 흔들렸지만 warm start는 안정적이었습니다."
  - q: "재학습할 때 스케일러를 다시 fit하지 않는 이유는?"
    a: "모델 가중치는 Day1에 fit한 min-max 기준으로 학습되어 있습니다. 재학습 때 새 데이터로 스케일러를 다시 fit하면 같은 가격이 다른 숫자로 들어가 기존 가중치와 어긋나고 fine-tuning 자체가 의미를 잃습니다. 그래서 학습과 서빙의 전처리를 한 모듈에서 관리하고, 가격대가 학습 범위를 크게 벗어나는 상황이 길어지면 fine-tuning이 아니라 스케일러까지 새로 정하는 base 재학습을 별도로 결정합니다."
  - q: "자동 재학습을 운영할 때 주의할 점은?"
    a: "첫째, 재학습 모델도 반드시 게이트를 다시 통과해야 하고 실패하면 기존 Production을 유지합니다. 둘째, 승격 후 서빙 프로세스의 모델 캐시를 교체하지 않으면 로그는 성공인데 응답은 옛 모델에서 나오므로 응답에 버전을 넣어 확인합니다. 셋째, 재학습 전 오차가 판정 윈도우에 남으면 곧바로 다시 트리거되므로 윈도우를 비우고, 재학습은 요청 처리와 분리된 백그라운드에서 락을 걸어 중복 실행을 막습니다."
related: [data-concept-drift, deployment-gate-validation, mlflow-tracking-registry, ml-dl/rnn-lstm]
source: "Day3 슬라이드 p.117–118 (자동 재학습 트리거 구조, 코드 스켈레톤), p.122 (실행 결과 로그), p.127 (Q&A 주요 주제), p.131–139 (드리프트 판정 기준 워크시트, AIOps 구축 실습·체크리스트), 실습 가이드 부록1 #6–9·부록2, HAIC project retrain_trigger.py·train_and_register.py, 개인 서브노트 3-2 5)·T3·T5"
---

```flow
이상 탐지 :: 최근 21건 RMSE > $4.00 → [WARN] drift detected
알림 · 데이터 수집 :: [INFO] retrain triggered, 최신 CSV의 최근 21 + 20행
warm-start fine-tuning :: Production 가중치에서 lr 1e-4, 10 epoch
게이트 재검증 :: RMSE ≤ $4.00
승격 또는 유지 :: [OK] Production 승격 + 캐시 교체 / [FAIL] 기존 버전 유지
```

```python
def check_and_trigger(recent_predictions):
    if not is_drift(recent_predictions):                  # 최근 21건 RMSE ≤ 4.00
        return {"status": "ok"}
    logger.warning("[WARN] drift detected - triggering retrain")
    logger.info("[INFO] retrain triggered (window=last_21_days)")
    rows = load_rows(latest_upload())[-(21 + SEQ_LEN):]    # 최근 1개월 + 시퀀스용 20행
    result = fine_tune(rows)                               # Production 가중치에서 warm start
    recent_predictions.clear()                             # 옛 모델 오차로 재트리거 방지
    if result["promoted"]:                                 # 게이트 재통과
        model_loader.reload_model()                        # 서빙 캐시 교체
        logger.info(f"[OK] new_rmse={result['rmse']:.2f} - production promoted")
    return {"status": "retrain_triggered", "promoted": result["promoted"]}
```

- 실측: `[WARN] window_rmse=6.38 > 4.00` → `[INFO] retrain triggered` → `[OK] new_rmse=1.46 v8`까지 약 5초, 이후 /predict가 `production-v8`로 응답
- 운영 정책 결정 항목: 측정 윈도우(21건), 재학습 데이터 범위(최근 3주), 재배포 승인(자동 vs 사람), 연속 실패 시 알림(에스컬레이션)

> [!warn] 재학습 RMSE를 믿어도 되나
> fine-tuning에 쓰는 41행으로 만든 21개 시퀀스를 8:2로 나누면 검증 표본은 약 5개라 RMSE가 우연히 낮게 나올 수 있다. 재학습 검증셋 확보(최근 홀드아웃, Champion 비교, 고정 정상셋)를 운영 설계에 포함해야 한다.
