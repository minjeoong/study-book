---
title: 데이터 시각화 도구
en: Matplotlib, Seaborn, Plotly, Altair
summary: 숫자 요약만으로는 패턴을 놓치므로(Anscombe) 분포·관계·비교 목적에 맞는 그래프와 도구를 고른다
importance: 2
order: 11
tags: [시각화, Matplotlib, Seaborn, Plotly, EDA]
keypoints:
  - Anscombe 사중주는 평균·분산·상관계수가 같아도 그림은 완전히 다를 수 있음을 보여 준다
  - Matplotlib은 Figure(전체 캔버스) 안에 Axes(개별 그래프), subplots(2, 2)로 배치
  - 보고서는 Matplotlib·Seaborn, 인터랙티브 공유는 Plotly(write_html), 빠른 EDA는 Altair
qa:
  - q: 시각화가 왜 분석의 필수 단계인가요?
    a: "Anscombe 사중주의 네 데이터셋은 평균, 분산, 상관계수가 거의 같지만 그려 보면 직선, 곡선, 이상치 하나, 수직 정렬로 완전히 다릅니다. 숫자만 보고 선형회귀를 적용하면 틀린 결론을 냅니다. 그래서 EDA에서 히스토그램·박스플롯으로 분포를, 산점도로 관계를, 히트맵으로 상관과 결측 패턴을 먼저 봅니다."
  - q: Matplotlib의 Figure와 Axes는?
    a: "Figure는 그림 전체를 담는 캔버스로 크기와 해상도를 관리하고, Axes는 그 안에서 실제 데이터가 그려지는 개별 그래프로 축, 눈금, 제목, 범례를 가집니다. fig, axes = plt.subplots(2, 2)로 만들고 axes[0, 1].bar(...)처럼 각 칸에 그리며, Seaborn도 ax=axes[i, j] 인자로 같은 Figure에 넣을 수 있습니다."
  - q: Seaborn과 Plotly는 언제 쓰나요?
    a: "Seaborn은 Matplotlib 위에 만든 통계 시각화 라이브러리라 hue 인자 하나로 그룹별 색을 나누고 pairplot, heatmap, boxplot을 짧은 코드로 그립니다. Plotly Express는 줌·필터·hover가 되는 인터랙티브 차트를 HTML 파일 하나로 공유할 수 있어 비전공자 대상 발표나 대시보드에 좋습니다."
related: [pandas-essentials, stats-to-ml-pipeline, data-stats/correlation]
source: Day2 (8/7) 슬라이드 p.269–291 (시각화의 이유, Anscombe, Matplotlib 구조·subplots, Seaborn pairplot·heatmap·histplot·boxplot·hue, Plotly Express, Altair, 도구 선택 가이드), Practice 4 (2×2 EDA 4종, Plotly HTML 저장)
---

| 목적 | 그래프 | 함수 |
| --- | --- | --- |
| 수치 분포 | 히스토그램 (+KDE) | `plt.hist`, `sns.histplot(kde=True)` |
| 사분위·이상치, 그룹 비교 | 박스플롯, 바이올린 | `sns.boxplot(x='region', y='amount', hue=...)` |
| 두 변수 관계 | 산점도 | `plt.scatter`, `sns.scatterplot(hue=...)` |
| 상관행렬, 혼동행렬, 결측 패턴 | 히트맵 | `sns.heatmap(corr, annot=True, cmap='coolwarm')` |
| 시간 추이 | 선 그래프 | `plt.plot`, `px.line` |
| 범주 비교 | 막대 그래프 | `plt.bar`, `sns.barplot`, `px.bar` |
| 모든 변수 쌍 | 페어플롯 | `sns.pairplot(df, hue='species')` |

```compare
Matplotlib | Seaborn | Plotly Express
성격 | 저수준, 모든 요소를 픽셀 단위 제어 | Matplotlib 기반 통계 시각화 | 인터랙티브 (줌·필터·hover)
강점 | 논문·보고서 품질, 다른 라이브러리의 기반 | hue 하나로 다차원 표현, 코드가 짧음 | HTML 파일 하나로 공유
언제 | 세밀한 커스터마이징 | 분포·상관·그룹 비교 EDA | 비전공자 발표, 대시보드
```

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
sns.histplot(data=df, x="amount", kde=True, ax=axes[0, 0])
sns.boxplot(data=df, x="region", y="amount", ax=axes[0, 1])
axes[1, 0].plot(monthly.index, monthly.values, marker="o")
sns.heatmap(df.select_dtypes("number").corr(), annot=True, fmt=".2f", ax=axes[1, 1])
plt.tight_layout(); fig.savefig("eda_4charts.png", dpi=150)

px.bar(agg, x="region", y="total", color="category").write_html("sales.html")
```

> [!warn] 헷갈리기 쉬움
> 차트 4개를 각각 plt.show()로 따로 띄우지 말고 하나의 Figure에 묶는다. Plotly는 fig.show()만 하면 파일이 남지 않으므로 write_html()로 저장해야 공유된다 (둘 다 실습 감점 항목).
