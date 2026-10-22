---
title: 변수 유형별 EDA 시각화
en: EDA Visualization Toolkit
summary: 수치형·범주형 변수의 조합(단일, 수치×수치, 수치×범주, 범주×범주)에 따라 그래프와 확인할 질문이 정해진다
importance: 2
order: 3
tags: [EDA, 시각화, 히스토그램, 산점도, 박스플롯, 모자이크]
keypoints:
  - 수치 단일은 히스토그램(+KDE), 범주 단일은 막대·파이 또는 도수분포표
  - 수치×수치는 산점도, 수치×범주는 박스플롯, 범주×범주는 모자이크 플롯
  - 회귀(타깃 수치)는 산점도·상관, 분류(타깃 범주)는 그룹별 분포·Target Rate로 관계를 본다
qa:
  - q: 두 수치형 변수의 관계를 산점도로 볼 때 무엇을 확인하나요?
    a: "관계가 선형인지 비선형인지, 선형이라면 강한지 약한지, 이상점이 있는지, 로그변환이 필요한지 봅니다. 한 변수가 다른 변수에 영향을 준다면 원인 변수를 X, 결과 변수를 Y에 둡니다. 데이터가 너무 많아 점이 뭉치면 샘플링하거나 alpha 옵션으로 반투명하게 그립니다."
  - q: 박스플롯으로 범주별 수치를 비교할 때 주의할 점은?
    a: "범주별 중앙값과 퍼짐, 이상치를 한눈에 보지만, 범주별 관측치 수가 다르면 표본이 적은 범주의 상자는 믿기 어렵습니다. 점 표시와 반투명 옵션으로 관측치 수를 함께 보고, 범주를 중앙값 순으로 정렬하거나 품질 등급(Po < Fa < TA < Gd < Ex)처럼 자연스러운 순서로 배치합니다. 값의 범위가 넓으면 로그변환이나 축 교환을 검토합니다."
  - q: 상관계수가 낮으면 관계가 없다고 봐도 되나요?
    a: "아닙니다. 상관계수는 선형 관계의 강도만 재므로 곡선 관계는 낮게 나올 수 있어 산점도를 반드시 함께 봅니다. 또 상관이 높아도 인과를 뜻하지 않습니다. 실습에서도 면적이 같아도 Overall_Qual에 따라 가격이 갈리는 것을 hue 산점도로 확인했듯 두 변수를 함께 봐야 보이는 패턴이 있습니다."
related: [question-driven-eda, variable-transformation, python-data/data-visualization, data-stats/correlation]
source: 9/14 슬라이드 p.25–29 (Quantitative · Categorical · Q vs Q · Q vs C · C vs C 시각화), p.31 (Target이 수치형 / 범주형일 때의 질문), 실습 1 (분포, 박스플롯, 산점도, hue 교차 탐색)
---

| 변수 조합 | 추천 그래프 | Think to look for |
| --- | --- | --- |
| 수치 단일 | 히스토그램, 도수 폴리곤, KDE | 이상점? 종모양·치우침·봉우리 수? 거칠면 bin 조정 |
| 범주 단일 | 막대, 파이, 도수·상대도수표 | 범주 수, 특정 범주 쏠림 |
| 수치 × 수치 | 산점도 | 선형·비선형? 강도? 이상점? 로그변환? 많으면 샘플링·alpha |
| 수치 × 범주 | 박스플롯 (+점·반투명) | 범주별 이상치, 관측치 충분한지, 범주 순서, 로그·축 교환 |
| 범주 × 범주 | 도수분포표, 모자이크 플롯 | 제3 변수로 타깃 비율 비교 (성별 × 객실등급 생존율) |

```compare
회귀 (Target 수치형) | 분류 (Target 범주형)
수치 Feature | 변화에 따라 Target도 변하나? → 산점도, 상관 | Target 그룹별 분포 차이? → Box Plot, KDE
범주 Feature | 범주별 Target 평균·분포 차이? → Box Plot, 그룹 통계 | 범주별 Target 비율 차이? → 모자이크, Target Rate
Next Action | 변환, 비선형 검토, 범주 통합, 변수 선택 | 변환, 범주 통합, 변수 선택
```

```python
sns.scatterplot(data=df, x="Gr_Liv_Area", y="SalePrice", hue="Overall_Qual", alpha=0.7)
order = df.groupby("Neighborhood")["SalePrice"].median().sort_values().index
sns.boxplot(data=df, y="Neighborhood", x="SalePrice", order=order)   # 중앙값 순 정렬
```
