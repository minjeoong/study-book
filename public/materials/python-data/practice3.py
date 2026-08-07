"""
===================================================

제출자 : 판교 9반 P282 김민정
제출일 : 2026.08.07
데이터 분석을 위한 Python 이해 [실습 3]

변경내역
- 2026.08.07 v1.0 최초 작성
- 2026.08.07 v1.1 CSV 로딩 예외 처리(load_csv) 추가
- 2026.08.07 v1.2 Polars/DuckDB 파이프라인 오류까지 최상단 예외 처리 범위 확장

===================================================


===================== 프로그램 설명 =====================
sales_100k.csv(100만행 매출 데이터)를 대상으로 동일한 집계 (지역·카테고리별 총매출/평균/건수, 총매출 내림차순)를 Pandas / Polars
Lazy API / DuckDB SQL 세 가지 방식으로 각각 수행하고, timeit으로 세 도구의 실행 시간을 동일 반복 횟수로 비교합니다.

1. Pandas  : 기초 EDA(shape/info/결측치) 후 IQR로 이상치를 제거하고,
             named aggregation으로 region·category별 집계
2. Polars  : scan_csv -> filter -> group_by -> agg -> sort -> collect
             체인으로 동일 집계를 Lazy 방식으로 수행
3. DuckDB  : CSV 파일에 직접 SQL(GROUP BY)을 실행해 동일 집계를 수행
4. timeit로 세 파이프라인의 실행 시간을 동일 number(반복 횟수)로 비교

- load_csv                       : CSV 로딩 + 예외 처리(파일 없음/빈 파일/파싱 오류/필수 컬럼 누락)
- explore_and_get_outlier_bounds : df.info()/결측치 비율 출력 후 IQR 이상치 경계(lo, hi)를 계산하고 이상치를 제거한 DataFrame을 반환
- pandas_named_aggregation       : named aggregation으로 region·category별 total/mean/count 집계 (총매출 내림차순 정렬)
- pandas_pipeline                : CSV 로딩 -> IQR 필터 -> named aggregation 전 과정을 묶은 함수 (성능 비교용)
- polars_lazy_pipeline           : scan_csv -> filter -> group_by -> agg -> sort -> collect Lazy 체인으로 동일 집계 수행
- duckdb_sql_pipeline            : DuckDB SQL(GROUP BY)로 동일 집계 수행
- compare_performance            : timeit으로 세 파이프라인의 실행 시간을 동일 반복 횟수(number)로 측정·비교
===================================================
"""

import sys
import timeit
from functools import partial
from pathlib import Path

import duckdb
import pandas as pd
import polars as pl

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "sales_100k.csv"

AMOUNT_COL = "amount"
GROUP_COLS = ["region", "category"]
REQUIRED_COLS = {*GROUP_COLS, AMOUNT_COL}


# ---------------------------------------------------------------------------
# CSV 로딩 + 예외 처리
# - FileNotFoundError : 경로에 CSV 파일이 없는 경우
# - pd.errors.EmptyDataError : 파일은 있으나 내용이 비어 있는 경우
# - pd.errors.ParserError    : CSV 형식이 깨져 파싱할 수 없는 경우
# - KeyError                 : 집계에 필요한 컬럼(region/category/amount)이 없는 경우
# 위 네 가지 오류를 각각 구분해 원인을 알 수 있는 메시지로 다시 발생시킨다.
# ---------------------------------------------------------------------------
def load_csv(csv_path: Path) -> pd.DataFrame:
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV 파일을 찾을 수 없습니다: {csv_path}") from None
    except pd.errors.EmptyDataError:
        raise pd.errors.EmptyDataError(f"CSV 파일이 비어 있습니다: {csv_path}") from None
    except pd.errors.ParserError as e:
        raise pd.errors.ParserError(f"CSV 파싱 오류({csv_path}): {e}") from None

    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        raise KeyError(f"필수 컬럼 누락: {sorted(missing)}")

    return df


# ---------------------------------------------------------------------------
# 1) 기초 EDA + IQR 이상치 제거
#  요구사항
#   - sales_100k.csv 를 로딩하고 기본 EDA를 수행한 뒤 IQR 방법으로 이상치를 제거
#   - between(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR) 은 IQR 기준 정상범위
# ---------------------------------------------------------------------------
def explore_and_get_outlier_bounds(csv_path: Path) -> tuple[pd.DataFrame, float, float]:
    # 데이터 로딩
    df = load_csv(csv_path)

    print(f"shape: {df.shape}")
    df.info()

    # 결측치 개수 / 비율 출력
    na_counts = df.isna().sum()
    na_ratio = na_counts / len(df) * 100
    print("\n결측치 개수 / 비율(%)")
    print(pd.DataFrame({"결측치수": na_counts, "비율(%)": na_ratio.round(2)}))

    # Q1, Q3, IQR로 정상 범위(lo, hi)를 계산하고 범위 밖 행을 제거
    q1 = df[AMOUNT_COL].quantile(0.25)
    q3 = df[AMOUNT_COL].quantile(0.75)
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr

    # 제거 전/후 행 수를 출력하고, 이후 단계에서 재사용할 (lo, hi)를 반환
    before = len(df)
    df_clean = df[df[AMOUNT_COL].between(lo, hi)]
    after = len(df_clean)
    print(f"\nIQR 정상 범위: [{lo:.0f}, {hi:.0f}]")
    print(f"이상치 제거 전: {before}행 -> 제거 후: {after}행 (제거된 행: {before - after})")

    return df_clean, lo, hi


# ---------------------------------------------------------------------------
# 2) Pandas named aggregation
#  요구사항 
#   - region·category별 총매출·평균·건수를 named aggregation으로 계산하고 총매출 내림차순으로 정렬
#   - named aggregation: total=('amount','sum') 형태로 결과 컬럼명을 직접 지정
# ---------------------------------------------------------------------------
def pandas_named_aggregation(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.groupby(GROUP_COLS) # region·category별 그룹화
        .agg( # named aggregation으로 총매출·평균·건수를 계산
            total=(AMOUNT_COL, "sum"), # 총매출
            mean=(AMOUNT_COL, "mean"), # 평균
            count=(AMOUNT_COL, "count"), # 건수
        )
        .reset_index() # region·category별 그룹화 컬럼을 인덱스로 변환
        .sort_values("total", ascending=False) # 총매출 내림차순 정렬
        .reset_index(drop=True)
    )


# ---------------------------------------------------------------------------
# 성능 비교용 Pandas 전체 파이프라인
# - CSV 로딩 -> IQR 필터(lo, hi는 1번 단계에서 계산된 값 재사용) -> named
#   aggregation까지 묶어, Polars/DuckDB와 동일한 조건(파일 로딩 포함)으로
#   timeit 비교가 가능하도록 한다.
# ---------------------------------------------------------------------------
def pandas_pipeline(csv_path: Path, lo: float, hi: float) -> pd.DataFrame:
    df = load_csv(csv_path)
    df_clean = df[df[AMOUNT_COL].between(lo, hi)]
    return pandas_named_aggregation(df_clean)


# ---------------------------------------------------------------------------
# 3) Polars Lazy API로 동일 집계
#  요구사항 
#   - 2번 실습과 동일한 집계를 Polars Lazy API로 작성 
#   - scan_csv -> filter -> group_by -> agg -> sort
# ---------------------------------------------------------------------------
def polars_lazy_pipeline(csv_path: Path, lo: float, hi: float) -> pl.DataFrame:
    return (
        pl.scan_csv(csv_path)
        .filter(pl.col(AMOUNT_COL).is_between(lo, hi)) # IQR 범위 필터
        .group_by(GROUP_COLS) # region·category별 그룹화
        .agg(
            [
                pl.col(AMOUNT_COL).sum().alias("total"), # 총매출
                pl.col(AMOUNT_COL).mean().alias("mean"), # 평균
                pl.col(AMOUNT_COL).count().alias("count"), # 건수
            ]
        )
        .sort("total", descending=True) # 총매출 내림차순 정렬
        .collect()
    )


# ---------------------------------------------------------------------------
# 4) DuckDB SQL로 동일 집계
#  요구사항 
#   - DuckDB로 동일 집계를 SQL로 작성
# ---------------------------------------------------------------------------
def duckdb_sql_pipeline(csv_path: Path, lo: float, hi: float) -> pd.DataFrame:
    query = f"""
        SELECT region, category,
               SUM(amount) AS total,
               AVG(amount) AS mean,
               COUNT(*) AS count
        FROM read_csv_auto('{csv_path.as_posix()}')
        WHERE amount BETWEEN {lo} AND {hi}
        GROUP BY region, category
        ORDER BY total DESC
    """
    return duckdb.sql(query).df()


# ---------------------------------------------------------------------------
# timeit 성능 비교
# - 세 파이프라인 모두 "파일 로딩부터 집계·정렬까지"를 포함하도록 통일하고,
#   동일한 number(반복 횟수)로 timeit.timeit을 실행해 공정하게 비교한다.
# ---------------------------------------------------------------------------
def compare_performance(csv_path: Path, lo: float, hi: float, number: int = 3) -> dict[str, float]:
    pipelines = {
        "Pandas": partial(pandas_pipeline, csv_path, lo, hi),
        "Polars(Lazy)": partial(polars_lazy_pipeline, csv_path, lo, hi),
        "DuckDB(SQL)": partial(duckdb_sql_pipeline, csv_path, lo, hi),
    }
    return {name: timeit.timeit(func, number=number) for name, func in pipelines.items()}


if __name__ == "__main__":
    # 파이프라인 실행 중 발생하는 로딩/스키마 오류를 한 곳에서 잡아
    # 원인 메시지를 출력하고 비정상 종료 코드(1)로 종료
    try:
        print("=" * 20, "1) Pandas EDA + IQR 이상치 제거", "=" * 20)
        df_clean, lo, hi = explore_and_get_outlier_bounds(CSV_PATH)

        print("\n" + "=" * 20, "2) Pandas named aggregation (region x category)", "=" * 20)
        pandas_result = pandas_named_aggregation(df_clean)
        print(pandas_result.head(10))

        print("\n" + "=" * 20, "3) Polars Lazy API 동일 집계", "=" * 20)
        polars_result = polars_lazy_pipeline(CSV_PATH, lo, hi)
        print(polars_result.head(10))

        print("\n" + "=" * 20, "4) DuckDB SQL 동일 집계", "=" * 20)
        duckdb_result = duckdb_sql_pipeline(CSV_PATH, lo, hi)
        print(duckdb_result.head(10))

        print("\n" + "=" * 20, "4) timeit 실행 시간 비교", "=" * 20)
        REPEAT = 3
        timings = compare_performance(CSV_PATH, lo, hi, number=REPEAT)
        fastest = min(timings.values())
        print(f"(number={REPEAT}회 반복 기준)")
        for name, seconds in timings.items():
            print(f"  - {name:<13}: 총 {seconds:.4f}초 / 1회 평균 {seconds / REPEAT:.4f}초 "
                  f"(최고 대비 {seconds / fastest:.1f}배)")
    except (
        FileNotFoundError,
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
        KeyError,
        pl.exceptions.PolarsError,  # Polars 파이프라인 오류(컬럼 없음/타입 불일치 등)
        duckdb.Error,               # DuckDB 파이프라인 오류(SQL 문법/컬럼 없음 등)
    ) as e:
        print(f"\n[오류] 파이프라인 실행 실패: {e}", file=sys.stderr)
        sys.exit(1)
