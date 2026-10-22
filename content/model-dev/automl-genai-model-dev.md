---
title: "AutoML과 생성형 AI 기반 모델 개발"
en: "AutoML, LLM-assisted Model Development"
summary: "분석 워크플로의 일부 또는 전체를 자동화하는 AutoML, 그리고 LLM에게 프롬프트로 ML 모델을 학습·저장·예측시키는 실습"
importance: 1
order: 13
tags: [AutoML, End-to-End, 생성형 AI, Pipeline, pkl]
keypoints:
  - "AutoML 자동화 수준: 문제 정의 < 전처리 < FE < 학습(모델 선택·HPO)"
  - "궁극 목표는 Modeling → Monitoring → Re-Modeling Lifecycle 자동화"
  - "LLM이 만든 모델도 코드 리뷰와 전처리 포함 Pipeline 저장이 필수"
qa:
  - q: "AutoML이란? 무엇을 자동화하나?"
    a: "데이터 수집부터 탐색·준비·Feature Engineering·모델 선택·학습·Hyperparameter Tuning·예측까지 분석 워크플로의 전체 또는 일부를 자동화하는 기술이다. ML은 도메인 지식·수학·프로그래밍이 모두 필요해 어렵고, 알고리즘 선택 → 학습·평가 → 파라미터 최적화 반복에 노력이 많이 든다는 장벽에서 출발했다. 자동화 수준은 학습 단계(모델 선택·튜닝)가 가장 높고 비즈니스 문제 정의가 가장 낮으며, 최종 목표는 개발·모니터링·재개발 Lifecycle 자체의 자동화다."
  - q: "생성형 AI로 ML 모델을 개발할 때 주의할 점은?"
    a: "같은 프롬프트라도 LLM 종류·버전·유료 여부에 따라 결과가 다르고, 처리 가능한 데이터 규모에도 한계가 있다. 생성된 코드는 분할·전처리·평가가 맞는지 직접 리뷰해야 하며, 실습에서도 기본값 Random Forest가 Train AUC 1.0으로 과적합된 것을 리뷰로 잡았다. 모델 저장 시에는 학습 모델만이 아니라 전처리까지 포함한 Pipeline을 저장해야 신규 데이터 예측이 재현되고, 세션 밖 예측은 저장 파일(.pkl)로 해야 한다."
related: [hyperparameter-tuning, model-drift-monitoring, feature-engineering, modeling-process]
source: "9/28–29 슬라이드 p.74–82, 9/28 실습 pptx Practice #1–3, 9/28 실습 코드 zip"
---

```flow
Practice #1 학습 :: 데이터 업로드 + 프롬프트 — RF, 6:2:2, Accuracy·F1·AUC, 변수 중요도
Self-Practice :: 생성 코드 리뷰·검증, XGBoost·LightGBM과 Test AUC 비교
Practice #2 저장 :: 전처리 포함 전체 과정을 bank_churn_model.pkl로 저장
Practice #3 예측 :: pkl + 신규 900명 → 이탈 Score CSV
```

| 자동화 수준 (Low → High) | 단계 | 내용 |
|---|---|---|
| 1 (Low) | 비즈니스 문제 정의 (모델 설계) | 주제 선정, 분석 요건, 필요 데이터 정의 |
| 2 | Pre-Processing | 데이터 입수·변환·통합 |
| 3 | Feature Engineering | Feature Extraction, Feature Selection |
| 4 (High) | Training | Model Selection, Hyperparameter Tuning, Model Assessment |

> [!tip] Data Analyst 역할 변화 (p.82)
> 과거 분석가의 노력은 '분석' 단계에 몰렸지만 생성형 AI·AutoML이 그 부분을 대체하면서, 노력은 설계(문제 정의)와 활용(비즈니스 적용)으로 이동. 분석가의 비즈니스·IT 협업 역할과 Data Analyst 층이 오히려 넓어질 것으로 전망.
