---
title: "데이터 분석 프로세스와 데이터 준비"
en: "Data Analysis Process, Data Preparation"
summary: "비즈니스 이해부터 데이터 준비·전처리·모델링·평가·적용까지 반복하는 분석 절차 — 노력의 59%가 데이터 준비"
importance: 2
order: 1
tags: [분석 프로세스, 문제 정의, Target 정의, 데이터 준비, 데이터 품질]
keypoints:
  - "Target(Y) 정의 → Feature(X) 도출 → 분석 요건 → 모델링 순으로 설계"
  - "기준일로 관찰 기간(X 생성)과 예측 기간(Y 생성)을 나눔"
  - "데이터 준비가 소요 시간 59% — Garbage In, Garbage Out"
qa:
  - q: "고객 이탈 예측 모델을 만든다면 무엇부터 정하나?"
    a: "먼저 '어떤 특성을 가진 고객이 이탈할까'라는 분석 주제와 이탈의 정의(Target)를 정한다. 예를 들어 보험 해지 또는 2개월 연속 미납이다. 다음으로 성별·연령 같은 고객 특성과 거래 특성으로 Feature 후보를 도출하고, 분석 모집단·기간과 분석 기법(분류 모델)을 정한다. 기간은 기준일 이전 3년을 관찰 기간으로 X를 만들고, 이후 6개월을 예측 기간으로 Y를 만드는 식이다."
  - q: "데이터 특성에 따라 모델 전략은 어떻게 달라지나?"
    a: "같은 분류 문제라도 데이터 특성이 다르면 전략이 바뀐다. 정형 데이터는 Feature Engineering + ML, 텍스트·이미지 같은 비정형은 대규모 사전학습 모델 + Fine-Tuning이 맞다. 데이터가 작으면 증강이나 복잡도가 낮은 모델·Rule 전략을, 크면 학습·추론 인프라 설계가 중요하다. 실시간 처리는 정확도보다 응답 시간과 운영 안정성이 더 중요하다."
  - q: "Data Preparation, Preprocessing, Wrangling은 어떻게 다른가?"
    a: "Data Preparation은 데이터 처리 전반을 아우르는 포괄적 개념이다. Data Preprocessing은 모델 개발을 위한 최소한의 준비로 Cleaning·Reduction처럼 필요한 경우 한 번만 한다. Data Wrangling은 모델 성능 향상을 위해 Sampling·Partitioning·Binning·Scaling·결측/이상치 처리를 반복하는 과정이다."
related: [feature-engineering, data-partition-cv, data-stats/variable-types, data-stats/population-sample]
source: "9/28–29 슬라이드 p.3–14"
---

```flow
비즈니스 이해 :: 문제 정의, 목표·분석 기준 — 분석 기획서
데이터 준비 :: 수집·통합, EDA, 품질 점검 — 데이터 정의서
데이터 전처리 :: 정제·변환·파생변수, Feature Engineering
모델링 :: 알고리즘 선정(통계 / ML / DL), 학습·최적화
모델 평가 :: 성능 평가, 결과 해석 — 결과 보고서 (필요하면 앞 단계로 반복)
모델 적용 :: 운영 시스템 적용, 모델 모니터링 — 운영자 매뉴얼
```

| 데이터 특성 | 구분 | 모델 전략 |
|---|---|---|
| Type | 정형 (고정 스키마) | Feature Engineering + ML |
| Type | 비정형 (텍스트·이미지·음성) | 대규모 사전학습 모델 + Fine-Tuning, DL |
| Size | Small | 데이터 증강, 복잡도 낮은 모델, 비지도 학습, Rule |
| Size | Big | 모델보다 학습·추론 인프라, 자동화 설계 |
| Processing | Batch (일일 추천 등) | 복잡한 모델과 Feature 사용 가능 |
| Processing | Real-time (실시간 추천) | 정확도보다 응답 시간·운영 안정성 |

> [!tip] 중요도 40% vs 시간 59%, 그리고 분석 Mart
> 분석 단계별 중요도는 비즈니스 문제 정의가 40%로 가장 크고, 소요 시간은 데이터 준비(정제·탐색·변환)가 59%로 가장 큼. 원천 데이터(고객·상품·계약·거래·상담·온라인)를 정제·변환·통합해 분석 Key(고객) 단위로 Target(Y)과 Feature(X)를 모은 분석 Master Data Set을 만든 뒤 탐색·FE·모델링으로 넘어감. 품질이 나쁘면 수정 비용이 생기고, 놓치면 모델 정확도 저하와 잘못된 의사결정으로 이어짐.
