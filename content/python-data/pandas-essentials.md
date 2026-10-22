---
title: Pandas 2.x 핵심 패턴
en: Pandas DataFrame, groupby, merge, Copy-on-Write
summary: DataFrame으로 로딩 → info·describe로 EDA → 결측·이상치 처리 → groupby·pivot·merge로 집계·결합, 반복은 apply 대신 벡터화
importance: 3
order: 9
tags: [Pandas, EDA, 결측치, groupby, merge, 벡터화]
keypoints:
  - 첫 EDA는 shape → info()(타입·결측·메모리) → describe() → isna().sum() 순서
  - "groupby().agg(total=('amount', 'sum'))처럼 named aggregation으로 결과 컬럼명을 직접 지정"
  - 2.x는 Copy-on-Write가 기본, 필터 결과 수정은 .copy()나 .loc로, 문자열·날짜는 .str·.dt 벡터화
qa:
  - q: 결측치는 어떻게 처리하나요?
    a: "먼저 isna().sum()과 비율로 규모를 보고, 결측이 완전 무작위(MCAR)인지, 다른 변수와 관련(MAR)되는지, 값 자체와 관련(MNAR)되는지 생각합니다. 수치형은 이상치에 강한 중앙값, 범주형은 최빈값으로 채우고, 핵심 컬럼이 비면 dropna(subset=[...])로 그 행만 지웁니다. 결측 비율이 매우 높은 컬럼은 제거하거나 'Unknown' 범주로 남기는 것도 방법입니다."
  - q: merge와 join의 차이는?
    a: "merge는 SQL JOIN처럼 지정한 컬럼(on='customer_id')을 기준으로 inner·left·right·outer 결합을 하고, join은 인덱스를 기준으로 결합하는 간편 버전입니다. 위아래로 단순히 이어 붙일 때는 concat을 씁니다."
  - q: apply는 왜 느리고 무엇으로 바꾸나요?
    a: "apply는 행이나 값마다 Python 함수를 호출하는 사실상의 Python 루프입니다. 내부가 NumPy 배열인 DataFrame은 .str.upper(), .dt.month, 산술 연산 같은 벡터화 연산을 쓰면 C 레벨에서 한 번에 처리되어 100만 행 기준 약 3.2초가 0.08초 수준(약 40배)으로 줄어듭니다."
related: [polars-duckdb-arrow, data-visualization, data-stats/dispersion-iqr, data-structures-complexity]
source: Day2 (8/7) 슬라이드 p.251–257 (Pandas 2.x, 기초 EDA, 결측치·이상치, groupby·pivot_table·merge, Copy-on-Write, apply vs 벡터화), Practice 3 (sales_100k.csv EDA, IQR, named aggregation)
---

```flow
로딩 :: pd.read_csv / read_parquet, 날짜는 to_datetime, 반복 범주는 astype('category')
구조 파악 :: shape, info(), describe(include='all'), head·sample
결측·중복 :: isna().sum() 비율 → fillna(중앙값·최빈값) 또는 dropna(subset=...), drop_duplicates
이상치 :: IQR 기준 between(Q1 − 1.5·IQR, Q3 + 1.5·IQR), 제거 전·후 행 수 확인
집계·결합 :: groupby + named agg, pivot_table, merge(how='left')
```

```python
q1, q3 = df["amount"].quantile([0.25, 0.75])
iqr = q3 - q1
df_clean = df[df["amount"].between(q1 - 1.5 * iqr, q3 + 1.5 * iqr)]

summary = (df_clean.groupby(["region", "category"])
           .agg(total=("amount", "sum"), mean=("amount", "mean"), count=("amount", "count"))
           .reset_index()
           .sort_values("total", ascending=False))

pivot = df.pivot_table(values="amount", index="region", columns="category",
                       aggfunc="sum", fill_value=0)          # 엑셀 피벗과 동일
```

> [!warn] 헷갈리기 쉬움
> `df_seoul = df[df.region == "서울"]` 후 `df_seoul["amount"] *= 1.1`은 2.x에서 경고(ChainedAssignment). 필터 결과를 따로 쓰려면 `.copy()`, 원본을 고치려면 `df.loc[조건, "amount"] *= 1.1`. `agg({'amount': 'sum'})`처럼 컬럼명을 안 정하면 실습 감점.
