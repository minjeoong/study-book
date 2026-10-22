---
summary: 신약 후보물질의 SMILES·분자 지문·물성 서술자로 독성 유무를 예측하는 이진 분류 프로젝트 — 문제 정의, 품질 점검·가설 기반 EDA, 피처 확장·앙상블·임계값 조정, 점수의 정직한 해석까지
keywords: [신약 후보물질, ADMET, 독성 예측, 이진 분류, SMILES, ECFP, FCFP, PTFP, RDKit, clogP, hERG, Fisher 검정, BH 보정, LightGBM, OOF, 중첩검증, 임계값 조정, 앙상블, 확률 보정, F1, 선택 편향]
materials:
  - file: slides-data-mini-project.pdf
    title: "강의 슬라이드 — 데이터 분석 Mini Project"
    type: slides
    date: 2026-10-19
  - file: submission-team5-report.pdf
    title: "과제 제출 — 5조 미니 프로젝트 보고서"
    type: etc
    date: 2026-10-19
  - file: submission-challenge.zip
    title: "과제 제출 — 챌린지 (예측 결과, 학습 데이터, 최종 모델)"
    type: lab
    date: 2026-10-20
---

## 한눈에 보기

```flow
문제 정의 :: 임상 전 Toxicity 예측, label 1 = 독성 없음 / 0 = 독성 있음, 평가 F1
데이터 이해 :: SMILES + ECFP·FCFP·PTFP 각 1,024비트 + 서술자 4개, 8,349건
품질 점검 · EDA :: 결측 0, 지문 중복·라벨 충돌, 염, 상수 컬럼 / clogP와 구조 특징의 독성 연관 검증
모델링 :: Baseline LightGBM → 피처 확장 → OOF 임계값 → 다양성 앙상블 → 확률 보정
평가 · 해석 :: 실제 제출 F1(라벨 1) 0.8472, 탐색 점수와 구분, 측정 오차 ±0.015
```

- 사업 현장의 실제 신약 개발 프로젝트 일부를 과제화한 2일짜리 프로젝트: Day1은 팀(판교 9반 5조) 단위 데이터 이해·EDA 발표, Day2는 예측 챌린지
- 면접에서 말할 축은 세 가지: 라벨 의미부터 검증한 문제 정의, 교란변수를 통제한 가설 검증형 EDA, 선택 편향과 측정 오차를 인정한 점수 해석

## 수업 흐름

**Day1 (10/19) 과제 소개와 팀 EDA**

- 과제 소개 — 신약개발 프로세스(후보물질 발굴 5년·비용 37.9%), 후보물질 발굴 단계와 ADMET, SMILES 표기법, Fingerprint(ECFP·FCFP·PTFP)
- 과제 명세 — 화합물 독성 이진 분류, train.csv 8,349건 / predict_input.csv 927건 / predict_output 제출, 평가지표 F1, RDKit·Mordred 서술자
- 팀 작업 — 데이터 소개·확인, 품질 점검, 분석 방향(Part A~D), Fingerprint 한계 분석, 가설 기반 EDA 보고서 발표

**Day2 (10/20) 예측 챌린지**

- Baseline 5종 비교 → 피처 확장(RDKit·MACCS·지문 10종·이웃 피처) → 앙상블·튜닝 → 10겹 CV
- 평가 기준이 라벨 1 F1로 바뀐 뒤 확률 블렌드, MLP·분자 커널 SVM 추가, 확률 보정과 임계값 선택으로 최종 round 8 제출

## 실습 정리

**5조 EDA 보고서 (전경호, 김민정, 이지은, 정원준)**

- 데이터: 8,349 × 3,078 (SMILES 1 + 지문 3,072 + 서술자 4 + label), 라벨 1 4,542건 / 0 3,807건
- 품질: 결측 0(계산형), SMILES 중복 0, 그러나 SMILES가 다른데 지문 3종이 모두 같은 분자 다수 — 대부분 입체이성질체(지문이 3차원 배치를 구분 못함)
- Part A: clogP만 라벨과 뚜렷한 연관, sa_score·QED·MolWt 3분위 고정 후에도 clogP 5분위별 독성 비율 단조 증가(p < 10⁻³⁶), hERG 채널 메커니즘과 일치
- Part B: 방향족·탄소·고리가 많을수록 독성, 산소·헤테로원자·아마이드가 많을수록 비독성
- Part C: 지문만으로 서술자 회귀 R² 0.76~0.98(PTFP→MolWt 0.98, clogP는 0.77~0.79로 가장 덜 복원), 라벨 관련 비트는 clogP·MolWt 보정 후에도 효과 유지
- Part D: 같은 분자식 C₂₃H₂₄N₆O₃인데 구조·clogP(1.26 vs 4.24)·라벨이 다른 쌍, 구조 특징 12개 Fisher + BH 보정 후 MolWt·clogP 보정 로지스틱 OR — 이중결합 0.475, 카보닐 0.519, 아마이드 0.606 유의 / 니트릴·삼중결합 비유의

**챌린지 (round 1~8 제출)**

- Baseline: LightGBM CV F1(0) 0.780 > CatBoost 0.779 > XGBoost 0.777 > RF 0.764 > LogReg 0.727
- 라벨 0 기준 OOF F1: 0.796(1차) → 0.803(2차, 실제 0.835) → 0.811(5차)
- 라벨 1 기준: round 7 OOF 0.8446 / 실제 0.8399 → round 8 OOF 0.8460 / 실제 **0.8472** (10개 모델 가중 블렌드 + 5겹 교차 적합 시그모이드 보정, 임계값 0.4137, 예측 1이 567개·0이 360개)
- round 8 OOF 기준 라벨 1: Precision 0.796, Recall 0.902 / 라벨 0: Precision 0.862, Recall 0.724
- 채택하지 않은 것: Mordred를 피처로 합치기(0.8011 → 0.7988 하락), GNN·CatBoost·텍스트 모델·residual stack(최종 블렌드 미채택)

```python
# 누수 없는 이웃 피처: 유사도는 라벨 없이 한 번, 라벨 통계는 폴드마다 학습 행으로만
sim = similarity_matrix(all_smiles, all_smiles)                  # Tanimoto (Morgan 2048)
for tr, va in folds:
    X_ad[va] = ad_features(sim[va], y, ref_index=tr)             # 이웃 20개 중 독성 비율 등
```

```python
f1_score(y_true, y_pred, pos_label=1)        # Positive 라벨을 명시 (1 = 독성 없음)
pred = (calibrated_proba >= 0.4137).astype(int)
```
