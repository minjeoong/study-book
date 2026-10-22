---
title: CI/CD for ML과 컨테이너화
en: CI/CD for ML, Docker, Environment Consistency
summary: "새 데이터 → 자동 학습 → 게이트 → 승격 → 컨테이너 재배포로 이어지는 ML 파이프라인과, 학습·서빙 환경을 이미지로 고정해 '내 컴퓨터에선 됐는데'를 없애는 Docker"
importance: 2
order: 8
tags: [CI/CD, Docker, Dockerfile, docker compose, 환경 일관성, 레이어 캐시]
keypoints:
  - "파이프라인: 새 데이터 → 자동 학습 → RMSE 게이트 → Production 승격 → 컨테이너 재배포"
  - "게이트 미통과 시 파이프라인이 멈추고 이전 Production이 계속 서빙"
  - "라이브러리 버전 불일치(로컬 RMSE $3.65 → 서버 $6.20)를 requirements 고정 이미지로 해소"
qa:
  - q: "ML에서 컨테이너화가 왜 중요한가요?"
    a: "학습할 때 쓴 pandas, scikit-learn 버전과 서빙 서버의 버전이 다르면 같은 모델도 예측값이 미묘하게 달라져, 로컬 RMSE $3.65가 서버에서 $6.20이 되는 식의 재현 불가 문제가 생깁니다. Dockerfile로 Python 버전과 requirements를 이미지에 고정하면 어디서 실행하든 같은 환경과 결과를 얻습니다. 다만 실습에서 확인했듯 난수 시드까지 고정해야 학습 결과가 재현되고, 플랫폼 차이로 소수점 수준의 차이는 남을 수 있어 게이트에 약간의 여유가 필요합니다."
  - q: "Dockerfile에서 requirements.txt를 소스보다 먼저 복사하는 이유는?"
    a: "Docker는 명령 한 줄마다 레이어를 만들고, 바뀌지 않은 레이어는 캐시를 재사용합니다. 의존성 설치를 소스 복사보다 앞에 두면 코드만 바뀌었을 때 무거운 pip install 레이어를 다시 실행하지 않아 빌드가 빨라집니다. TensorFlow가 들어간 실습 이미지는 1GB대라 이 차이가 큽니다."
related: [mlops-lifecycle, deployment-gate-validation, serving-stability-lazy-eager]
source: "Day2 슬라이드 p.75–82 (CI/CD for ML, 학습/배포 파이프라인 구조, 환경 일관성, CI 스크립트, Dockerfile, 빌드·실행, docker compose), 실습 가이드 p.6–7·부록3 (Dockerfile 한 줄씩 읽기), HAIC project serving_app/Dockerfile, 개인 서브노트 T7"
---

```flow
새 데이터 :: 새 거래일 HAIC 데이터 적재
자동 학습 :: MLflow Tracking에 run 기록
RMSE 게이트 :: $4.00 초과면 중단, 이전 Production 유지
Production 승격 :: Registry 상태 전환
컨테이너 재배포 :: docker build → docker run
```

| Dockerfile 구문 | 의미 | 실습 포인트 |
| --- | --- | --- |
| FROM python:3.11-slim | 베이스 이미지 | 로컬 가상환경과 같은 Python 버전 |
| WORKDIR /app | 컨테이너 작업 경로 | 이후 상대 경로의 기준 |
| COPY requirements.txt → RUN pip install | 의존성 먼저 설치 | 레이어 캐시 (소스만 바뀌면 재설치 생략) |
| COPY serving_app/ data/ scripts/ | 소스·데이터 복사 | 빌드 컨텍스트 = 프로젝트 루트 |
| RUN train_baseline_v1 && train_and_register | 빌드 시점에 학습·등록 | MLflow(SQLite)와 서빙이 한 이미지 안 (자기 완결형) |
| EXPOSE 8000, ports 8000:8000 | 포트 공개·매핑 | 스크립트의 API_URL 포트와 일치시킬 것 |
| ENV MODEL_SOURCE=mlflow, LOADING_MODE=eager | 런타임 설정 | 환경변수 전환 구조를 그대로 적용 |
| CMD ["uvicorn", ...] | 시작 명령 | 로컬 uvicorn 명령과 동일 |

- 확장형: `docker-compose.yml`로 mlflow-server + serving-app 두 서비스를 띄우고 `MLFLOW_TRACKING_URI`로 연결 (슬라이드 예시), 실습은 단일 컨테이너

> [!warn] Eager 이미지의 빠른 실패
> 이미지가 `MODEL_SOURCE=mlflow`, `LOADING_MODE=eager`로 시작하므로 `_load_from_mlflow()`가 미구현이면 컨테이너가 기동 직후 종료된다. 불편해 보이지만 "떠 있는데 예측 못 하는 서버"보다 안전한 실패다.
