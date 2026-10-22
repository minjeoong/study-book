---
title: Polars · DuckDB · Arrow
en: Polars Lazy API, DuckDB, Apache Arrow, Parquet
summary: 대용량은 Rust·Arrow 기반 Polars의 Lazy API나 파일에 직접 SQL을 던지는 DuckDB로 처리하고, 저장은 컬럼형 Parquet으로
importance: 2
order: 10
tags: [Polars, DuckDB, Arrow, Parquet, Lazy evaluation]
keypoints:
  - Pandas 한계는 싱글스레드, 수백만 행 이상에서 속도 저하, 원본 대비 5~10배 메모리
  - Polars Lazy는 scan_csv로 실행 계획만 세우고 pushdown 최적화 후 collect()에서 실행
  - DuckDB는 서버 없이 CSV·Parquet에 바로 SQL, Arrow 포맷으로 도구 간 제로카피 변환
qa:
  - q: Lazy evaluation(지연 실행)의 장점은?
    a: "명령을 바로 실행하지 않고 scan → filter → group_by → agg까지 전체 계획을 먼저 모은 뒤 collect()에서 한 번에 실행합니다. 그래서 필터를 파일 읽기 단계로 당겨 필요한 행만 읽고(predicate pushdown), 쓰는 컬럼만 읽는(projection pushdown) 최적화를 엔진이 알아서 해 줍니다. collect()를 빼먹으면 결과가 아니라 LazyFrame 계획만 남습니다."
  - q: CSV 대신 Parquet을 쓰는 이유는?
    a: "Parquet은 컬럼 단위로 저장하는 포맷이라 필요한 컬럼만 읽을 수 있고, 압축이 잘 되어 CSV보다 파일은 약 5배 작고 읽기는 약 10배 빠릅니다. 컬럼 타입(스키마)도 함께 저장되어 다시 읽을 때 타입 추론 문제가 없습니다. 다만 Day1 실습처럼 수십 행 규모에서는 차이가 거의 드러나지 않습니다."
  - q: Pandas, Polars, DuckDB는 각각 언제 쓰나요?
    a: "수백만 행 이하의 탐색과 시각화 연동은 생태계가 가장 넓은 Pandas, 수천만 행 이상의 대용량 변환은 멀티스레드와 Lazy 최적화가 되는 Polars, 여러 CSV·Parquet 파일을 로딩 없이 SQL로 집계·조인할 때는 DuckDB가 적합합니다. 원본 수집 → Parquet 저장 → DuckDB·Polars 분석 → 최종 검토는 Pandas 같은 조합이 실무 패턴입니다."
related: [pandas-essentials, gil-concurrency]
source: Day2 (8/7) 슬라이드 p.258–264 (Polars·DuckDB 도입 이유, Eager vs Lazy, Pandas 대응 문법, DuckDB SQL, 도구 선택 가이드, Apache Arrow), p.130 (Parquet), Practice 3 (Pandas · Polars Lazy · DuckDB 성능 비교)
---

```compare
Pandas | Polars | DuckDB
API 스타일 | 즉시 실행 (Eager) | Lazy (쿼리 최적화) | SQL
멀티스레드 | X (단일) | 자동 | 자동
메모리 효율 | 보통 | 높음 (Arrow) | 높음 (스트리밍)
적합 크기 | 수백만 행까지 | 수천만 행 이상 | 파일 직접 쿼리
Pandas 연동 | 기본 | to_pandas() (Arrow 변환) | .df()
권장 | EDA, 탐색 | 대용량 처리 | 파일 직접 분석
```

```python
import polars as pl, duckdb

result = (pl.scan_csv("sales_100k.csv")                 # Lazy: 아직 안 읽음
          .filter(pl.col("amount").is_between(lo, hi))
          .group_by(["region", "category"])
          .agg(pl.col("amount").sum().alias("total"),
               pl.col("amount").count().alias("count"))
          .sort("total", descending=True)
          .collect())                                    # 여기서 최적화 후 실행

duckdb.sql(f"""SELECT region, category, SUM(amount) AS total
               FROM read_csv_auto('sales_100k.csv')
               WHERE amount BETWEEN {lo} AND {hi}
               GROUP BY region, category ORDER BY total DESC""").df()
```

> [!tip] 면접 팁
> 실습에서 세 도구를 공정하게 비교하려고 모두 "파일 로딩부터 집계·정렬까지" 같은 범위로 묶고 timeit의 number(반복 횟수)를 통일했다. 비교 조건을 맞추는 것 자체가 벤치마크의 핵심이라고 말하면 좋다.
