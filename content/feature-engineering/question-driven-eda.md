---
title: Question-driven EDA
en: Exploratory Data Analysis, Basic Data Exploration
summary: 선입견 없이 데이터를 살펴 문제를 발견하고, 그 발견(Insight)으로 전처리와 Feature Engineering 방향을 정하는 과정
importance: 3
order: 2
tags: [EDA, 기술통계, 결측치, Cardinality, missingno]
keypoints:
  - EDA는 그래프를 그리는 일이 아니라 데이터에게 질문하는 일, 결과는 Findings와 Next Action
  - "기본 점검 순서: shape·info → head·sample → describe → nunique·value_counts → isnull → corr"
  - nunique로 Cardinality를 보고 인코딩 방식과 ID성 변수 여부를 판단
qa:
  - q: EDA는 왜 하나요? 무엇을 보나요?
    a: "모델링 전에 데이터의 구조, 품질, 변수 분포, 변수 간 관계를 확인해 전처리와 Feature Engineering 방향을 정하기 위해서입니다. 구조(shape, 타입, 결측), 기술통계(중심·퍼짐·분포 형태), 시각화(분포·패턴·관계)를 보고, 결측은 어디에 얼마나 있는지, 이상치는 있는지, 비슷한 정보를 가진 변수는 없는지 같은 질문에 답하며 Findings를 정리합니다."
  - q: High Cardinality 변수란? 정보력이 있을 수 있나요?
    a: "범주형 변수의 고유값 개수가 매우 많은 변수입니다. CustomerID처럼 행마다 값이 다르면 그 자체로는 패턴이 없어 보통 제외하지만, 우편번호나 상품 코드처럼 그룹을 대표하면 묶거나 타깃 통계로 바꿔 정보력을 살릴 수 있습니다. 다만 nunique만으로는 각 범주가 얼마나 자주 나오는지, 타깃과 관련이 있는지는 알 수 없어 value_counts와 함께 봅니다."
  - q: 결측치가 많은 데이터는 어떻게 탐색하나요?
    a: "isnull().sum()으로 개수, isnull().mean()으로 비율을 먼저 봅니다. 변수가 많고 결측 패턴이 복잡하면 missingno의 matrix로 결측이 어느 행, 어느 구간에 몰려 있는지, heatmap으로 여러 변수가 함께 결측되는 패턴이 있는지 확인합니다. 함께 빠지는 변수들은 같은 원인(측정 장비, 시설 없음)일 가능성이 큽니다."
related: [eda-visualization, missing-value, categorical-encoding, data-stats/variable-types]
source: 9/14 슬라이드 p.10–24 (Why EDA, EDA Workflow, Descriptive Statistics, EDA Checklist, Cardinality Case Study, missingno, 상관관계 탐색), p.30–31 (Question-driven EDA), 실습 1 (Ames Housing Question-driven EDA)
---

```flow
Raw Data :: 원본
EDA :: 구조 확인 → 기술통계 → 시각화 → 질문하기
EDA Findings :: 발견한 인사이트와 문제점 정리 (Finding · Evidence · Possible Action)
Feature Engineering :: 결측·이상치·스케일링·인코딩·파생변수
Modeling :: 학습·평가로 예측·분류 목표 달성
```

| Question | Analysis | Next Action |
| --- | --- | --- |
| 결측치는 어디에, 얼마나? | 개수·비율, 변수별·행별 결측 | 삭제, 대체 |
| 중복이나 유효하지 않은 값은? | 중복행·키, 타입, 유효 범위, 논리 조건 | 중복 제거, 타입 변환, 오류값 대체 |
| 수치 변수의 분포는? | 기술통계, Histogram, KDE, Skewness | 변환, 스케일링, 구간화 |
| 이상치는 있는가? | Box Plot(IQR), Z-score | 제거, 대체 |
| 범주 구성과 빈도는 적절한가? | nunique, value_counts, Cardinality | 범주 재정의, 인코딩 결정 |
| 비슷한 정보를 가진 변수는? | Correlation Matrix, Heatmap | 변수 제거, 다중공선성 검토 |

```python
df.shape; df.info()                       # 구조, 타입, 결측
df.describe(include="all")                # 수치 + 범주 요약
df.nunique(); df["Neighborhood"].value_counts(normalize=True)
pd.DataFrame({"cnt": df.isna().sum(), "ratio": df.isna().mean() * 100})
df.corr(numeric_only=True)["SalePrice"].sort_values(ascending=False)
```

> [!tip] 면접 팁
> 실습 Ames Housing에서 Garage_Yr_Blt 결측 159건 중 157건이 Garage_Cars = 0이었다. "결측은 단순 누락이 아니라 차고가 없다는 의미"처럼 결측의 원래 의미를 먼저 확인한 사례로 말하기 좋다.
