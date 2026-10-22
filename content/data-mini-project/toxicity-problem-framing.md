---
title: 문제 정의 — 신약 후보물질 독성 예측
en: Problem Framing (ADMET Toxicity, Binary Classification)
summary: 임상 전에 화합물의 독성 유무를 예측해 후보물질 발굴 단계의 시간·비용과 임상 실패를 줄이는 이진 분류 문제
importance: 3
order: 1
tags: [문제 정의, ADMET, 이진 분류, F1, 라벨 검증]
keypoints:
  - 신약 개발 비용의 37.9%(6,740억 원, 5년)가 후보물질 발굴 단계, 여기서 ADMET를 미리 예측하면 임상 착오가 준다
  - "Target: label 1 = 독성 없음, 0 = 독성 있음 — 직관과 반대라 모델링 전에 라벨 의미부터 검증"
  - 평가지표는 Precision·Recall을 함께 보는 F1, 어느 라벨을 Positive로 보느냐에 따라 점수가 달라진다
qa:
  - q: 이 프로젝트는 어떤 문제를 풀었나요?
    a: "신약 후보물질의 구조 정보(SMILES, 분자 지문, 물성 서술자)로 독성 유무를 맞히는 이진 분류입니다. 신약 개발은 후보물질 발굴 5년, 전임상 2년, 임상 6년이 걸리고 발굴 단계가 전체 비용의 37.9%를 차지합니다. ADMET 중 Toxicity를 임상 전에 예측하면 탐색 기간과 비용, 전임상 시행착오를 줄일 수 있다는 것이 비즈니스 목표였습니다. 학습 데이터 8,349건으로 모델을 만들어 927건을 예측해 제출했습니다."
  - q: 라벨을 어떻게 검증했나요?
    a: "이 데이터는 1이 독성 없음, 0이 독성 있음이라 일반적인 직관과 반대입니다. 그래서 심장독성(hERG 차단)으로 시장에서 철수한 Terfenadine이 0이고, 그 대체약인 Fexofenadine이 1인지 확인해 명세와 일치함을 검증했습니다. 라벨 의미를 잘못 잡으면 Positive 클래스, 임계값, F1 계산이 모두 뒤집히기 때문에 모델링 전에 가장 먼저 확인했습니다."
  - q: 왜 Accuracy가 아니라 F1을 쓰나요?
    a: "클래스 비율이 54.4 : 45.6으로 크게 치우치진 않았지만, 독성 예측은 놓치는 것(Recall)과 잘못 경보하는 것(Precision)의 비용이 모두 있어 둘을 조화평균한 F1을 주 지표로 썼습니다. 또 F1은 Positive 라벨을 무엇으로 두느냐에 따라 값이 달라져서, 대회 중 기준이 라벨 0 F1에서 라벨 1 F1로 바뀌었을 때 이전 회차 점수와 직접 비교하지 않았습니다."
related: [smiles-fingerprint-descriptor, toxicity-eda-findings, feature-engineering/feature-engineering-overview, feature-engineering/imbalanced-data]
source: 10/19 슬라이드 p.3–7 (프로젝트 주제, 신약개발 프로세스, 비용 37.9%, 후보물질 발굴 프로세스, ADMET), p.11–15 (What Are We Predicting, Data, 평가지표), 챌린지 코드 README (라벨 검증), 최종 아카이브 README (지표 변경 이력)
---

```flow
비즈니스 목표 :: 후보물질 발굴 단계의 탐색 기간·비용 과다, 전임상 시행착오 감소
분석 목표 :: 임상 전 ADMET 중 Toxicity(독성 유무) 사전 예측
데이터 :: train.csv 8,349건 × 3,078열 (SMILES + 지문 3,072 + 서술자 4 + label)
문제 유형 :: Binary Classification, label 1 = 독성 없음(54.4%) / 0 = 독성 있음(45.6%)
평가 · 제출 :: F1-score, predict_input.csv 927건 → predict_output (SMILES, label)
```

| ADMET | 질문 |
| --- | --- |
| Absorption | 약물이 몸에 잘 흡수되는가? |
| Distribution | 필요한 곳까지 잘 분포되는가? |
| Metabolism | 몸 대사에 의해 잘 분해되는가? |
| Excretion | 몸 밖으로 잘 배출되는가? |
| Toxicity | 독성이 없는가? → 이번 과제의 Target |

> [!tip] 면접 팁
> "Before modeling, always verify what the target label actually means." 슬라이드의 Issue Found 문구 그대로, 라벨 방향을 실제 약물 사례로 검증했다는 한 문장이 문제 정의를 꼼꼼히 했다는 근거가 된다.
