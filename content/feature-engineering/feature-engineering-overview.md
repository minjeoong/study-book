---
title: Feature Engineering과 분석 프로세스
en: Feature Engineering & Analysis Methodology
summary: 데이터를 모델이 학습하기 좋은 의미 있는 Feature로 바꾸는 과정, 비즈니스 이해에서 배포까지 6단계 분석 프로세스의 데이터 준비 단계에 해당
importance: 2
order: 1
tags: [Feature Engineering, 분석 방법론, CRISP-DM, GIGO]
keypoints:
  - Garbage In, Garbage Out, 그리고 깨끗한 데이터만으로는 부족하다 (Better Features In, Better Predictions Out)
  - "분석 프로세스 6단계: 비즈니스 이해 → 가설 수립 → 데이터 준비 → 모델 정의 → 모델 평가 → 시스템 적용"
  - 모델 평가는 곧 비즈니스 평가, 정확도보다 업무에서 쓸 수 있는지가 기준
qa:
  - q: Feature Engineering이란 무엇이고 왜 중요한가요?
    a: "원본 데이터를 모델이 패턴을 학습하기 쉬운 의미 있는 표현(Feature)으로 바꾸는 과정입니다. 품질이 나쁜 데이터로는 좋은 모델을 못 만들지만(GIGO), 결측과 이상치를 정리한 깨끗한 데이터라도 문제를 잘 표현하는 Feature가 없으면 예측은 제한적입니다. 같은 알고리즘이라도 좋은 Feature가 들어가야 성능이 크게 오릅니다."
  - q: 분석 프로젝트는 어떤 단계로 진행하나요?
    a: "비즈니스 목표와 분석 목표를 정하고, 가설을 세워 필요한 데이터 항목을 정의한 뒤, 전처리와 Feature Engineering으로 데이터를 준비합니다. 이후 후보 기법을 정해 여러 모델을 만들고, 업무 관점에서 평가해 가장 강한 모델을 고른 뒤 배포와 모니터링 계획을 세웁니다. 각 단계에서 경쟁사, 데이터 품질, 시스템 사양, 재현율 같은 질문을 미리 점검합니다."
  - q: 정확도는 높은데 재현율이 낮으면 그 모델을 써도 되나요?
    a: "업무 목적에 따라 다릅니다. 불량 판정이나 사기 탐지처럼 놓치는 비용이 큰 문제라면 정확도가 높아도 재현율이 낮은 모델은 쓸 수 없습니다. 그래서 모델 평가는 수치 평가가 아니라 비즈니스 평가이고, 예측 결과를 어떤 시스템과 어떻게 결합해 쓸지까지 정의해야 합니다."
related: [question-driven-eda, preprocessing-leakage, python-data/stats-to-ml-pipeline]
source: 9/14 슬라이드 p.3–9 (분석 Framework, 분석 방법론 프로세스, 프로세스별 고려사항과 절차별 FAQ, What is Feature Engineering)
---

```flow
1 비즈니스 이해 :: 비즈니스·분석 목표 정의, 경쟁사·전략·공정 효율화 방향
2 가설 수립 :: 가설 정의, 필요한 데이터 항목 지정 (업무 기반), 외부 데이터 필요성
3 데이터 준비 :: 데이터셋 정의, 전처리(구조·내용·생성), Feature Engineering
4 분석 모델 정의 :: EDA, 기법 후보 선정(선형·Boosting·앙상블), Train·Validation·Test 구성
5 모델 평가 :: 모델 평가 = 비즈니스 평가, 가장 강한 모델 결정
6 시스템 적용 :: 배포 계획, 모니터링, 재학습 주기 (MLOps)
```

```compare
Clean Data | Better Features
의미 | 결측·이상치·중복을 정리한 데이터 | 문제를 잘 표현하도록 바꾼 변수
예 | Age 결측을 중앙값으로 채움 | 생년월일 → 연령대, 구매기록 → 구매 빈도
결과 | Limited Predictions | Better Predictions
```

> [!tip] 면접 팁
> "Feature Engineering은 데이터를 정보로 바꾸는 과정"이라고 한 줄로 정의하고, 이 과목의 흐름인 EDA로 질문 → 전처리(Basic · Advanced) → 파생변수 생성을 순서대로 말하면 구조가 잡힌다.
