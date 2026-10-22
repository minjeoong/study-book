---
summary: EDA로 데이터에 질문해 문제를 찾고, 결측·이상치·스케일링·인코딩(Basic)과 변환·불균형(Advanced) 전처리, 파생변수 생성으로 모델이 학습하기 좋은 Feature를 만드는 과목
keywords: [Feature Engineering, 분석 방법론, Question-driven EDA, Cardinality, missingno, 결측치, IQR, Z-score, Clipping, Min-Max, Standard, Robust, One-Hot, Dummy Variable Trap, 로그변환, log1p, Box-Cox, SMOTE, Tomek Links, 파생변수, RFM, 데이터 누수]
materials:
  - file: slides-feature-engineering.pdf
    title: "강의 슬라이드 — 실전 Feature Engineering"
    type: slides
    date: 2026-09-14
  - file: lab-1-question-driven-eda.ipynb
    title: "실습 1 — Question Driven EDA"
    type: notebook
    date: 2026-09-14
  - file: lab-2-feature-engineering.ipynb
    title: "실습 2 — Feature Engineering"
    type: notebook
    date: 2026-09-14
  - file: data-ames-housing-edu.csv
    title: "실습 데이터 — Ames Housing (교육용)"
    type: etc
    date: 2026-09-14
---

## 한눈에 보기

```flow
Intro :: 분석 방법론 6단계, Feature Engineering은 데이터를 정보로 바꾸는 과정
EDA :: Basic Data Exploration, 시각화 Toolkit, 질문 → 분석 → Next Action
Pre-processing Basic :: 결측치, 이상치, 스케일링, 인코딩
Pre-processing Advanced :: 변수 변환(로그), 불균형 데이터 샘플링
Creating Better Features :: 비율·차이·상호작용·날짜·구간화·집계, 도메인 Feature
```

- EDA는 그래프 그리기가 아니라 데이터에게 질문해 Findings를 만드는 과정이고, 그 Findings가 전처리와 파생변수의 근거가 됨
- 전처리 기법마다 "언제 쓰나, 왜 쓰나, 무엇을 조심하나"를 짝으로 기억 (예: Min-Max는 이상치에 민감, Dummy는 k−1열)
- 실습 관통 원칙: 기준을 학습하는 전처리는 Train에서만 fit, Test에는 같은 기준으로 transform

## 수업 흐름

**9/14 (1일)**

- Intro — 분석 Framework(기법·절차·도구·산출물), 분석 방법론 6단계와 단계별 FAQ, GIGO와 Better Features
- EDA — Why EDA, EDA Workflow, 기술통계, Basic Data Exploration 체크리스트(shape·info·head·describe·nunique·value_counts·isnull·corr), Cardinality, missingno
- EDA Visualization Toolkit — 수치·범주 단일, Q vs Q(산점도), Q vs C(박스플롯), C vs C(모자이크), Question-driven EDA 표
- 실습 1 — Ames Housing Question-driven EDA (10개 질문 → EDA Findings 작성)
- Pre-processing Basic — Missing Value(삭제·대체·예측), Outlier(IQR·Z-score, 제거·대체), Scaling(Min-Max·Standard·Robust·Normalizer), Encoding(Label·One-Hot·Dummy, Large Category)
- Pre-processing Advanced — Variable Transformation(로그, log1p, Box-Cox, Yeo-Johnson), Imbalanced Data(Random·Tomek·CNN, SMOTE·Borderline-SMOTE·ADASYN)
- Creating Better Features — Feature Creation Strategies, From Questions to Features, RFM, 도메인 Feature
- 실습 2 — Baseline 회귀 vs Feature Engineering 후 회귀 성능 비교

## 실습 정리

**데이터 — Ames Housing 교육용 (2,930행 × 15열)**

- Target SalePrice, 수치형 10개(Overall_Qual, Gr_Liv_Area, Lot_Area, Year_Built, Total_Bsmt_SF, Garage_Cars, Garage_Yr_Blt 등), 범주형 4개(Neighborhood 28개, House_Style 8개, Kitchen_Qual, Exter_Qual)

**실습 1 — Question-driven EDA**

- SalePrice 평균 180,796 > 중앙값 160,000, 왜도 1.74 → 오른쪽 꼬리, Target 로그변환 후보
- 결측: Garage_Yr_Blt 159건(이 중 157건이 Garage_Cars = 0, 즉 차고 없음), Total_Bsmt_SF·Garage_Cars 각 1건
- 왜도: Lot_Area 12.8로 극단적, Gr_Liv_Area 1.27, Total_Bsmt_SF 1.16 / IQR 이상치 후보: Overall_Cond 252, SalePrice 137, Lot_Area 127건
- SalePrice와 상관: Overall_Qual 0.80, Gr_Liv_Area 0.71, Garage_Cars 0.65, Total_Bsmt_SF 0.63 / Neighborhood·Kitchen_Qual·Exter_Qual별 박스플롯에서 가격 차이 뚜렷
- 같은 면적이라도 Overall_Qual이 높으면 가격이 높음 (hue 산점도) → 품질 × 면적 상호작용 후보

**실습 2 — Baseline vs Feature Engineering (Linear Regression)**

- Baseline: 수치형 10개, 결측 0 대체 / Final: 결측 중앙값 → Gr_Liv_Area·Lot_Area IQR Clip → (선택) 파생변수 → log1p 3개 변수 → Neighborhood One-Hot, House_Style Dummy → 5개 연속 변수 Standard → Target log1p (TransformedTargetRegressor)
- 노트북 기본 설정으로 재현하면 MAE 약 23,800 → 16,600, RMSE 약 38,600 → 28,400, Adjusted R² 0.81 → 0.89
- 관찰: 0이 79건인 Total_Bsmt_SF는 log1p 후 왜도가 −5로 뒤집힘 → 0이 많은 변수는 플래그 분리가 나음

```python
log_model = TransformedTargetRegressor(regressor=LinearRegression(),
                                       func=np.log1p, inverse_func=np.expm1)
log_model.fit(X_train_final, y_train_final)          # 학습은 로그 스케일
pred = log_model.predict(X_test_final)               # 예측은 원래 단위로 자동 복원
```

```python
imputer = SimpleImputer(strategy="median").fit(X_train[["Garage_Yr_Blt"]])  # Train에서만 fit
X_test[["Garage_Yr_Blt"]] = imputer.transform(X_test[["Garage_Yr_Blt"]])    # Test는 transform만
```
