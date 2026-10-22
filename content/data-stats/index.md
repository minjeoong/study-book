---
summary: 데이터를 요약하고(기술통계), 표본으로 모집단을 추론하고(추론통계·가설검정), 변수 관계를 모델링하는(상관·회귀) 통계 기초
keywords: [기술통계, 척도, IQR, 왜도, 첨도, 표준오차, 중심극한정리, 가설검정, p-value, t-test, 상관계수, 최소제곱법, R², RMSE, 회귀 가정, VIF]
materials:
  - file: slides-day1-basic-statistics.pdf
    title: 강의 슬라이드 Day1 — 기초통계 (변수, 기술통계, 추론통계, 가설검정)
    type: slides
    date: 2026-07-16
  - file: lab-day1-descriptive-stats-titanic.ipynb
    title: 실습 — 기술통계·이상치·상관·t-test 기초 + Titanic EDA/전처리/분류
    type: notebook
    date: 2026-07-16
  - file: slides-day2-correlation-regression.pdf
    title: 강의 슬라이드 Day2 — 회귀분석 (상관분석, 회귀분석, 선형모형 가정)
    type: slides
    date: 2026-07-20
  - file: lab-day2-energy-regression.ipynb
    title: 프로젝트 실습 1~3 — 스마트빌딩 Heating Load 예측 (문제, 빈칸 TODO)
    type: lab
    date: 2026-07-20
  - file: lab-day2-energy-regression-solution.ipynb
    title: 프로젝트 실습 1~3 — 스마트빌딩 Heating Load 예측 (풀이본)
    type: lab
    date: 2026-07-20
---

## 한눈에 보기

```flow
변수 이해 :: 척도·형태·역할에 따라 쓸 수 있는 기법이 정해짐
기술통계 :: 중심화 · 퍼짐 · 분포 형태로 데이터 요약
추론통계 :: 표본 → 모집단, 표준오차와 중심극한정리
가설검정 :: H₀ 가정 → 검정통계량 → p-value → 판정
상관분석 :: 두 변수의 선형 관계 방향과 강도
회귀분석 :: 최소제곱 직선, R²·RMSE 평가, 잔차로 가정 점검
```

- Day1은 "데이터 하나를 어떻게 요약하고, 표본의 불확실성을 어떻게 재는가"까지 다룸
- Day2는 "두 변수의 관계를 수치(상관계수)와 식(회귀직선)으로 표현하고, 그 결과를 믿어도 되는지(가정)"를 다룸
- 관통 메시지: 통계는 단정하지 않는다. 불확실성을 정량화해서 더 신뢰할 수 있는 의사결정을 내리는 도구

## 수업 흐름

**Day1 (7/16) 기초통계**

- Intro — 잘못된 통계의 예 (도박사의 오류, 비율 착시, 학과 섞인 상관), 통계학 = 불확실성을 다루는 학문
- 데이터와 변수 — 척도(명목·서열·구간·비율), 형태(범주·이산·연속), 역할(종속·독립·통제), 데이터 유형별 기법 선택
- 기술통계 — 중심화(평균·중앙값·최빈값, 이동평균), 퍼짐(분산·표준편차·IQR·CV, 박스플롯), 분포 형태(왜도·첨도)
- 추론통계 — 모집단 vs 표본, 실험 vs 관측, 표본 편향과 심슨의 역설, 확률변수·PMF·PDF, 정규분포·Z-score, 기대값, 표준오차, 대수의 법칙, 중심극한정리
- 가설검정 — 귀류법, H₀/H₁, 검정통계량, p-value, 유의수준, 단측/양측, P-hacking, t분포, t-test·카이제곱·ANOVA

**Day2 (7/20) 회귀분석**

- 상관분석 — 산점도, 공분산과 상관계수, 자유도(n−1), 해석 가이드와 함정(이상치, 비선형, 평균화 효과, 허위상관, 상관 ≠ 인과)
- 회귀분석 — 평균 예측에서 회귀직선으로, 최소제곱법(OLS), 기울기 b = r·SDy/SDx, 평균으로의 회귀, RMSE, R², 회귀결과표 해석
- 선형모형 가정 — 선형성·독립성·등분산성·정규성·다중공선성, 잔차로 진단, 불편 추정량, 강건성

## 실습 정리

**Day1 노트북 — 기초통계 실무 + Titanic**

- 작은 매출 예제로 `describe`, 분위수, IQR·Z-score 이상치, `skew`/`kurt`, `corr`/heatmap, `ttest_ind`, `normaltest`, `groupby` 순서로 실무 통계 연습
- Titanic(891행) EDA → 전처리 → 분류: Age 결측은 중앙값, Embarked는 최빈값으로 대체, Cabin(결측 77%) 제거, FamilySize·IsAlone 파생
- 결과: 여성 생존율 0.74 vs 남성 0.19, 1등석 0.63 vs 3등석 0.24, 정확도 Logistic 0.80 / Random Forest 0.82

```python
Q1, Q3 = df["sales"].quantile([0.25, 0.75])
IQR = Q3 - Q1
outliers = df[(df["sales"] < Q1 - 1.5*IQR) | (df["sales"] > Q3 + 1.5*IQR)]

df_pre["Age"] = df_pre["Age"].fillna(df_pre["Age"].median())        # 이상치에 강한 중앙값
df_pre["Embarked"] = df_pre["Embarked"].fillna(df_pre["Embarked"].mode()[0])  # 범주형은 최빈값
```

**Day2 프로젝트 — 스마트빌딩 냉난방 부하 예측 (UCI Energy Efficiency, 768행 × 10열)**

- 목표: 건축 설계 변수 X1~X8(상대 밀집도, 표면적, 벽면적, 지붕면적, 높이, 방향, 창 면적, 창 분포)로 Heating Load(Y1)를 예측할 회귀모델의 입력 Feature 선정. Cooling Load(Y2)는 참고용으로 제외 (Y1과 r = 0.976, 사실상 같은 정보)
- 실습 1 데이터 이해: 결측 0, 중복 0, 기술통계·왜도·첨도 종합표
- 실습 2 EDA: Histogram, Boxplot(IQR 기준 이상치 0개), 상관행렬 heatmap, Y1/Y2 vs X 산점도
- 실습 3 변수 선정: Pearson r과 p-value(X5 높이 0.889, X4 지붕면적 −0.862 최상위, X6 방향은 p = 0.94로 무의미), VIF(X2·X3·X4 = inf, X1·X5 > 100)로 다중공선성 확인
- 결론: 상관계수 하나로 고르지 말고 다중공선성을 함께 보고, 회귀모델 성능 비교 후 조정

```python
from scipy.stats import pearsonr
from statsmodels.stats.outliers_influence import variance_inflation_factor

corr, p = pearsonr(df["X5"], df["Y1"])            # 0.889, p ≈ 0
vif = [variance_inflation_factor(df[features].values, i) for i in range(len(features))]
```
