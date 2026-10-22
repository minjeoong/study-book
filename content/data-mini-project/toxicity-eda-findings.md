---
title: 품질 점검과 가설 기반 EDA
en: Data Quality Audit & Hypothesis-driven EDA
summary: 결측·중복·염·상수 컬럼을 점검하고, Descriptor·SMILES 구조·Fingerprint와 독성의 관계를 층화와 다중검정 보정으로 검증해 파생변수 후보를 도출
importance: 3
order: 3
tags: [EDA, 데이터 품질, 층화 분석, 다중검정, BH 보정, clogP]
keypoints:
  - clogP가 높을수록 독성 비율이 단조 증가 (10분위 17% → 62%), 다른 서술자를 고정해도 유지 → 독립 신호
  - 구조 특징 12개는 Fisher 검정 + BH 보정, 다시 MolWt·clogP 보정 로지스틱의 OR로 확인 (이중결합 OR 0.475)
  - 확인한 것은 연관성이지 원인이 아니다 → 파생변수 후보로 넘기고 모델 성능으로 검증
qa:
  - q: EDA에서 가장 중요한 발견은 무엇이었나요?
    a: "서술자 4개 중 clogP(지용성)만 라벨과 뚜렷하게 연관되어 clogP 10분위별 독성 비율이 17%에서 62%까지 올라갔습니다. 우연한 상관인지 보려고 sa_score, QED, MolWt를 각각 3분위로 고정한 층마다 clogP 5분위별 독성 비율을 비교했는데 모든 층에서 단조 증가했습니다(p < 10⁻³⁶). 지용성이 높은 분자가 소수성 아미노산으로 둘러싸인 hERG 칼륨 채널에 잘 들어가 막는다는 알려진 메커니즘과도 일치했습니다."
  - q: 구조 특징과 독성의 관계는 어떻게 검증했나요?
    a: "RDKit으로 SMILES의 =, #, @, 괄호 같은 기호를 이중결합, 삼중결합, 입체중심, 분지 같은 구조 특징으로 바꾸고, 특징 유무별 독성률 차이를 Fisher 정확검정으로 비교했습니다. 12개를 동시에 검정하므로 Benjamini-Hochberg로 q값을 보정했고, 다시 분자량과 clogP를 통제한 로지스틱 회귀의 오즈비로 확인했습니다. 이중결합·카보닐·아마이드는 보정 후에도 유의(OR 0.48~0.61)했지만 니트릴·삼중결합은 비유의로 바뀌었습니다."
  - q: 상관과 인과를 어떻게 구분해서 보고했나요?
    a: "통제 후에도 남는 신호라는 것까지만 주장하고, '확인한 것'과 '아직 확인하지 않은 것'을 나눠 발표했습니다. 확인한 것은 일부 구조 특징과 라벨의 연관성, 내부 검증 재현, 파생변수 후보이고, 독성 차이의 원인, 외부 데이터 재현성, 모델 성능 개선 여부는 아직이라고 명시했습니다. 같은 분자식 C₂₃H₂₄N₆O₃인데 연결 구조와 clogP가 달라 라벨이 다른 쌍도 사례로 제시했습니다."
related: [smiles-fingerprint-descriptor, cv-threshold-ensemble, feature-engineering/question-driven-eda, data-stats/correlation-causation, data-stats/hypothesis-testing]
source: 5조 EDA 보고서 (10/19) p.3–5 (데이터 소개·확인·품질 점검), p.9 (분석 방향 Part A–D), p.10–11 (Part A 디스크립터와 label, 층화 비교), p.12 (Part B SMILES 구조 피처), p.13–14 (Part C Fingerprint), p.15–19 (Part D 구조 특징 검정), 챌린지 quality_summary.csv
---

| 점검 항목 | 결과 | 조치 |
| --- | --- | --- |
| 결측치 | 2,569만 셀 중 0개 (계산형 데이터) | 불필요 |
| 행 중복 / 피처 중복 | SMILES 중복 0 / 지문 완전 동일 534행·241그룹, 라벨 충돌 33그룹 | GroupKFold, chiral ECFP 검토 |
| 염(salt) 포함 | 262행 (3.1%), MolWt 평균 +62.6 | salt stripping 후 서술자 재계산 |
| 상수·중복 컬럼 | 상수 49 + 중복 58 = 107개 | 제거 (3,072 → 2,965) |
| 이상치 | MolWt 130 / clogP 137 / SA 158건 | 실재 구조(고리형 펩타이드)라 유지 |
| 행 순서 | 분자량 정렬된 3개 블록 (여러 출처 병합) | shuffle + stratify 분할 |
| 클래스 비율 | 54.4 : 45.6 | stratify, F1 평가 |

```flow
Part A 서술자 :: clogP만 라벨과 연관, 3분위 층화 후에도 단조 증가 → 독립 신호
Part B SMILES 구조 :: 방향족·탄소·고리가 많을수록 독성, 산소·헤테로원자·아마이드가 많을수록 비독성
Part C Fingerprint :: 지문만으로 서술자 4개 회귀 R² 0.76~0.98 (PTFP→MolWt 0.98), 라벨 관련 비트 40개는 clogP·MolWt 보정 후에도 계수 유지
Part D 구조 특징 :: Fisher + BH 보정 → MolWt·clogP 보정 OR, 이중결합 포함군 독성률 41% vs 미포함 63%
결론 :: 구조 기반 파생변수 후보 도출, 예측 성능 개선 여부는 모델로 검증
```

> [!tip] 면접 팁
> "검정을 12번 하면 우연히 유의한 것이 나온다 → BH로 보정", "교란변수(분자량, 지용성)를 통제해도 남는가 → 층화와 로지스틱 OR" 두 가지를 말하면 통계적 사고를 보여 줄 수 있다.
