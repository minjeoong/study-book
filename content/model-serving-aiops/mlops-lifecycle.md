---
title: MLOps 개요 — 라이프사이클과 성숙도
en: MLOps, ML Lifecycle, MLOps Maturity, DevOps vs MLOps vs AIOps
summary: "DevOps 원칙을 ML에 적용해 코드뿐 아니라 데이터·모델 성능까지 관리하며, 데이터 → 학습 → 검증 → 배포 → 모니터링을 순환시키는 체계"
importance: 3
order: 6
tags: [MLOps, DevOps, ML 라이프사이클, 성숙도, AIOps, 재현성]
keypoints:
  - "MLOps = DevOps + 데이터 버전·모델 성능까지 관리 (재현 = 코드 + 데이터 + 하이퍼파라미터)"
  - "성숙도 Level 0 수동 노트북 → 1 실험 기록·레지스트리·게이트 → 2 자동 재학습 + 모니터링"
  - "MLOps는 '어떻게 만들어 내보낼까', AIOps는 '배포된 모델이 계속 잘 동작하는가'"
qa:
  - q: "DevOps와 MLOps는 무엇이 다른가요?"
    a: "둘 다 코드를 Git으로 관리하고 자동화된 빌드·배포 파이프라인을 쓰지만, MLOps는 데이터 버전과 모델 성능까지 관리 대상에 넣습니다. DevOps는 테스트 통과 여부로 배포하지만 MLOps는 RMSE ≤ $4 같은 정량 성능 게이트를 통과해야 배포하고, 산출물도 실행 파일이 아니라 모델 파일과 실험 메타데이터입니다. 또 코드만 같으면 재현되는 DevOps와 달리 ML은 코드, 데이터, 하이퍼파라미터가 모두 같아야 재현됩니다."
  - q: "MLOps 성숙도 단계를 설명해 주세요."
    a: "Level 0은 데이터 과학자가 노트북에서 수동으로 학습하고 모델 파일을 넘겨 수동 배포하는 단계로, 누가 언제 어떤 모델을 올렸는지 추적이 어렵고 성능이 떨어져도 사용자 불만이 오기 전까지 모릅니다. Level 1은 MLflow 같은 도구로 실험을 자동 기록하고 Registry로 버전을 관리하며 배포 전 게이트로 검증하는 단계입니다. Level 2는 새 데이터가 들어오면 자동 재학습하고 운영 지표를 상시 모니터링하는 단계로, 과정의 Day1 → Day2 → Day3가 이 진화 순서를 따랐습니다."
  - q: "MLOps와 AIOps는 어떻게 나뉘나요?"
    a: "MLOps는 모델 개발에 착수하는 순간부터 배포 시점까지 데이터 준비, 학습, 검증, 버전 관리, 배포 파이프라인을 다룹니다. AIOps는 모델이 서빙되기 시작한 순간부터 인프라·모델·데이터를 포함한 운영 시스템 전체를 모니터링하고 이상 탐지, 자동 대응, 재학습 트리거를 담당합니다. 두 영역은 순차로 이어져, MLOps가 만들어 내보낸 모델을 AIOps가 계속 잘 돌아가게 지킵니다."
related: [mlflow-tracking-registry, ci-cd-docker, serving-aiops-overview]
source: "Day2 슬라이드 p.46–60 (ML의 한계, MLOps 정의·목적·구성요소, 데이터 준비~모델 모니터링, 구축 사례), p.64–70 (데이터·모델 관리, HAIC 실습 프로젝트, 성숙도, DevOps vs MLOps, 라이프사이클 매핑), p.87–92 (MLOps 개념 실습, MLOps vs AIOps, 데이터가 바뀌면), 실습 가이드 p.9–10"
---

```flow
데이터 :: HAIC 일봉 CSV 업로드, 데이터셋 스냅샷
학습 :: MLflow Tracking으로 param·metric 기록
검증 :: RMSE ≤ $4.00 게이트
배포 :: Registry Production 승격 → FastAPI 컨테이너
모니터링 :: 드리프트 감지 → 다시 데이터·학습으로 순환 (Day3)
```

```compare
DevOps | MLOps
버전 관리 | 코드 (Git) | 코드 + 데이터셋 스냅샷
배포 트리거 | 코드 커밋 (git push) | 코드 커밋 + 성능 게이트 통과
롤백 기준 | 빌드 실패, 에러율 급증 | RMSE 악화, 데이터 드리프트 감지
산출물 | 실행 파일·컨테이너 이미지 | 컨테이너 이미지 + 모델·실험 메타데이터 (MLflow)
재현성 | 코드만 같으면 재현 | 코드 + 데이터 + 하이퍼파라미터
```

| 성숙도 | 특징 | 과정 매핑 |
| --- | --- | --- |
| Level 0 · 수동 | 노트북 학습, 결과를 파일로 보관, RMSE 이력 추적 불가 | 출발점 |
| Level 1 · 파이프라인 자동화 | 실험 자동 기록, Registry 버전 관리, 배포 게이트 | Day2 |
| Level 2 · CI/CD + 모니터링 | 새 데이터 유입 시 자동 재학습, AIOps 상시 감시 | Day3 |

> [!tip] 실무 도구 매핑
> 실무에서는 MLflow 대신 SageMaker·Vertex AI 같은 관리형 서비스, 로그 파일 대신 Prometheus·Grafana·Slack 알림을 쓰는 경우가 많지만 "기록 → 게이트 → 배포 → 감시 → 자동 대응" 구조는 같다.
