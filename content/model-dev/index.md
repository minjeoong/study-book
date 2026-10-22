---
summary: "은행 고객 이탈 예측을 따라가며 배우는 ML 모델 개발 전 과정 — 데이터 준비·Feature Engineering부터 분할·튜닝·평가·SHAP 해석·드리프트 모니터링까지"
keywords:
  - Feature Engineering
  - Data Partition
  - Cross Validation
  - Class Imbalance
  - Hyperparameter Tuning
  - Bayesian Search
  - Overfitting
  - Data Leakage
  - Confusion Matrix
  - AUC
  - LIFT
  - SHAP
  - Model Drift
  - AutoML
materials:
  - file: slides-model-dev.pdf
    title: "강의 슬라이드 — 모델 개발 및 최적화"
    type: slides
    date: 2026-09-28
  - file: lab-genai-model-dev.pptx
    title: "실습 — 생성형 AI 기반 모델 개발"
    type: lab
    date: 2026-09-28
  - file: lab-model-develop-0928.zip
    title: "실습 코드 — model-develop (가상환경 제외)"
    type: lab
    date: 2026-09-28
  - file: data-bank-churn-train.csv
    title: "실습 데이터 — 은행 고객 이탈 (학습용)"
    type: etc
    date: 2026-09-28
  - file: data-bank-churn-new.csv
    title: "실습 데이터 — 은행 고객 이탈 (신규)"
    type: etc
    date: 2026-09-28
  - file: lab-model-dev-optimization.ipynb
    title: "실습 — 모델 개발 및 최적화"
    type: notebook
    date: 2026-09-29
  - file: submission-model-dev-final.ipynb
    title: "과제 제출 — 종합실습 결과물 (노트북)"
    type: notebook
    date: 2026-09-29
  - file: submission-model-dev-final.xlsx
    title: "과제 제출 — 종합실습 결과물 (엑셀)"
    type: etc
    date: 2026-09-29
---

## 한눈에 보기

```flow
문제 정의 :: Target(Y) 정의, 관찰 기간·예측 기간, 분석 모집단
데이터 준비 · FE :: 정제·변환·통합, 파생변수 생성, Feature Selection
분할 · 학습 :: Train / Validation / Test 6:2:2, K-Fold·Stratified CV
최적화 :: Hyperparameter Tuning, 과적합·Data Leakage 점검
평가 · 해석 :: Confusion Matrix·AUC·LIFT, 회귀 오차 지표, SHAP
운영 · 모니터링 :: Drift 감지 → Threshold 조정 · Re-training · Re-modeling
```

- 모델 개발을 "알고리즘 고르기"가 아니라 문제 정의 → 데이터 → 학습 → 평가 → 운영으로 이어지는 Lifecycle로 다룸. 단계별 중요도는 비즈니스 문제 정의(40%), 소요 시간은 데이터 준비(59%)가 가장 크고, 성공적인 모델의 요인으로는 Feature Engineering(25%)이 첫손에 꼽힘.
- 핵심 원칙은 "학습에 쓰지 않은 데이터로 공정하게 평가" — 분할, Validation 기준 튜닝, Train에서만 fit, Leakage 방지가 모두 여기서 나옴.
- 실습은 은행 고객 이탈 데이터(2,100건, 이탈률 21%)로 생성형 AI 기반 모델 개발(9/28)과 노트북 기반 최적화·SHAP 해석(9/29), 평균 AUC를 겨루는 종합실습으로 진행.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준 (슬라이드 우하단 번호 + 1). 슬라이드 한 벌을 이틀에 걸쳐 진행.

### 강의 (9/28–9/29) — 모델개발 및 최적화

1. **분석 프로세스 이해** — 데이터 분석 분류 체계, 비즈니스 이해 → 데이터 준비 → 전처리 → 모델링 → 평가 → 적용, 시나리오 기반 문제 정의, 관찰·예측 기간 (p.3–7)
2. **데이터 준비** — 데이터 특성(Type·Size·Processing)별 모델 전략, 가장 시간이 많이 드는 단계(59%), 분석 Mart 구축, 품질(GIGO), 처리 용어 (p.8–14)
3. **Feature Engineering** — 정의·중요도, Extraction(Transformation / Creation), 차원의 저주, Selection(신뢰성 → 중요도 → 논리성) (p.15–23)
4. **모델 학습 및 최적화** — 모델 Lifecycle, Data Partition(Hold-out, K-Fold, Stratified), Sampling(Over / Under), 최적화 전략, Hyperparameter Tuning(Grid / Random / Bayesian), Overfitting, Data Leakage, Quiz (p.24–43)
5. **모델 평가** — 문제 유형별 지표, Confusion Matrix, Baseline vs Naive, AUC, LIFT, 분류 지표 선택, 회귀 지표(MAPE·MAE·MSE·RMSE·R²) (p.44–62)
6. **모델 해석** — 블랙박스와 XAI, SHAP Feature Importance·Impact·Dependence (p.63–66)
7. **모델 모니터링** — Model Drift(Data / Prediction / Concept), 대응 전략, Model Renewal (p.67–73)
8. **Appendix** — End-to-End 모델링 프로세스, AutoML 정의·배경·자동화 수준·목표, Data Analyst 역할 변화 (p.74–82)

### Day1 (9/28) 실습 — 생성형 AI 기반 모델 개발

- Claude·GPT·Gemini에 데이터를 올리고 프롬프트로 Practice #1 학습(Random Forest, 6:2:2, Accuracy·F1·AUC, 변수 중요도) → #2 전처리 포함 Pipeline `.pkl` 저장 → #3 신규 고객 이탈 Score 생성
- Self-Practice: 생성 코드 리뷰·검증, XGBoost·LightGBM과 Test AUC 비교

### Day2 (9/29) 실습 — 모델 개발 및 최적화 노트북 + 종합실습

- 노트북: 파생변수 → EDA → 6:2:2 분할 → 결측 대체·Log·Min-Max·One-Hot → 단일값·상관 변수 제거, RF 중요도 → Decision Tree → Naive Baseline → Random Forest → Bayesian / Random / Grid Search(Stratified K-Fold) → Feature Importance·SHAP
- 종합실습: Validation·Test 평균 AUC 최대화, 결과를 노트북 + 엑셀(실험 이력·최적화 방법·설계 고민)로 제출

## 실습 정리

### Day1 — 생성형 AI로 이탈 모델 만들고 검증하기

- **데이터**: `bank_churn_train.csv` 2,100건(Target `Exited`, 이탈률 21.3%, Geography·EstimatedSalary 일부 결측), `bank_churn_new.csv` 900건(Target 없음)
- **구현**: AI가 만든 코드를 리뷰해 날짜 → 가입기간 파생, 결측 대체, One-Hot, Random Forest를 하나의 `Pipeline`으로 묶고 Stratified 6:2:2 분할
- **과적합 확인**: 기본값 RF는 Train AUC 1.000 / Validation 0.871 / Test 0.853. Validation AUC 최고치 0.005 이내 후보 중 Train–Validation 차이가 가장 작은 설정(max_depth 6, min_samples_leaf 5) 선택 → Train 0.936 / Validation 0.869 / Test 0.848
- **불균형 대응**: Validation에서 F1이 최대인 Threshold 0.26 선택 → Test F1 0.468 → 0.580
- **모델 비교(Q2)**: Test AUC LightGBM 0.858 > RF 0.848 > XGBoost 0.843 (XGBoost는 Validation 최고였지만 Test에서 역전)
- **해석**: 중요도 Age 0.32, NumOfProducts 0.25, IsActiveMember 0.09. 50대 이탈률 52%, 상품 3개 이상 88% 이상, 상품 2개는 7.6%로 가장 안정
- **Naive 비교**: 전부 "유지" 예측 Accuracy 0.79·F1 0·AUC 0.50, 나이만 쓴 규칙 AUC 0.75 → RF 0.85가 의미 있는 개선임을 확인

```python
pipe = Pipeline([("features", DateFeatures()),          # TenureMonths 파생, ID 제거
                 ("preprocess", preprocess),            # 결측 대체 + One-Hot (Train에서만 fit)
                 ("model", RandomForestClassifier(max_depth=6, min_samples_leaf=5))])
joblib.dump(pipe.fit(X_tr, y_tr), "bank_churn_model.pkl")   # 전처리까지 통째로 저장
```

### Day2 — 노트북 최적화와 종합실습 (평균 AUC 0.8997)

- **노트북 핵심**: 결측 대체값·Scaler는 Train에서만 계산해 Valid·Test에 적용, One-Hot 후 `reindex`로 컬럼 구조 맞춤, `BayesSearchCV(scoring="roc_auc", cv=StratifiedKFold(3))` 후 `refit`
- **종합실습 경로**: Decision Tree Baseline 0.772 → 8개 모델 비교(부스팅 우세) 0.855 → 노이즈 변수 제거 0.878 → 파생변수(Age_mid 45–62세, Germany_Balance, Inactive_Prod1) 0.884 → Optuna로 변수 포함 여부 + HP 동시 탐색 CatBoost 0.893 → 결합 성능 기준 파트너 탐색 + Greedy 앙상블 → **CatBoost×3 + XGBoost + GradientBoosting Soft Voting, Validation 0.898 / Test 0.901**
- **설계 판단**: AUC는 순위 지표라 SMOTE 미사용, 트리 모델이라 Scaling 생략, Geography 결측은 이탈률이 높아 Unknown으로 보존, 단독 상위 모델끼리보다 예측이 다른 모델을 섞을 때 앙상블 효과가 큼, 가중치 튜닝은 과적합 위험으로 동일가중 유지
- **주의점**: 과제 목표가 Validation + Test 평균이라 Test도 선택 기준이 됨 — 실무라면 Test는 마지막 한 번만 쓰는 게 원칙

```python
def ensemble_proba(X):   # 변수셋·알고리즘이 다른 5개 모델의 확률 동일가중 평균
    probs = [m.predict_proba(X[cols])[:, 1] for m, cols in MEMBERS]
    return sum(probs) / len(probs)
```
