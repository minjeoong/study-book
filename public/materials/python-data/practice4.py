"""
===================================================

제출자 : 판교 9반 P282 김민정
제출일 : 2026.08.07
데이터 분석을 위한 Python 이해 [실습 4]

변경내역
- 2026.08.07 v1.0 최초 작성
- 2026.08.07 v1.1 Pipeline 3단계를 단일 Ridge 대신 선형/배깅/부스팅 3계열
  모델을 동일 train/test로 비교해 최고 성능 모델을 선택·저장하도록 고도화

===================================================


===================== 프로그램 설명 =====================
[실습 3] 연계: practice3/판교_9반_김민정.py가 만든 산출물을 그대로 재사용해
EDA 시각화 4종 + 통계 검정(t-test/카이제곱) + sklearn Pipeline 학습·저장 +
Plotly 인터랙티브 차트를 수행한다. practice3 스크립트를 별도 모듈로 재실행하지 않고 importlib로 동적 로딩해 함수만 가져다 쓴다

- IQR 이상치 제거된 DataFrame(explore_and_get_outlier_bounds 결과)
    -> 시각화·t-test·카이제곱의 입력 데이터로 사용
- region·category named aggregation 결과(pandas_named_aggregation)
  -> Plotly 막대 차트 입력으로 재사용
- sales_100k.csv 원본(load_csv 결과, IQR 미적용)
  -> sklearn Pipeline의 학습 데이터 원본으로 사용
  (Pipeline은 ColumnTransformer 안에 SimpleImputer를 두어 결측치를 스스로
   처리하도록 설계했으므로, 이상치 제거 전 원본을 그대로 흘려보내는 것이 "전처리를 Pipeline이 책임진다"는 sklearn Pipeline의 설계 의도에 더 맞음)

===================== 설계 노트 (알고리즘/모델 선택 이유) =====================
1) t-test: 서울 vs 부산의 매출 평균 비교에 Welch's t-test(equal_var=False)를
   사용했다. 두 지역의 표본 수·분산이 같다는 보장이 없으므로, 등분산을
   가정하는 Student's t-test보다 표본 특성에 안전한 Welch 방식을 기본값으로
   선택했다.

2) 카이제곱: region x category 분할표로 독립성을 검정한다. practice3의
   named aggregation이 이미 region·category 조합별 집계를 다뤘으므로, 같은
   두 축을 카이제곱 변수로 재사용해 "groupby 결과를 분할표 변수로 활용"하라는
   연계 요구를 그대로 만족시킨다.

3) 예측 모델: amount(총매출)를 타깃으로 하되, 피처에서 unit_price는 의도적으로 제외했다. 원본 데이터에서 amount = quantity * unit_price가
   정확히 성립(결정론적 관계)하기 때문에, unit_price를 피처로 쓰면 회귀가 사실상 곱셈을 외우는 것에 불과해 R2가 1에 근접하는 무의미한 결과가
   나온다(데이터 누수). 대신 quantity·customer_age(수치형)와 region·category·payment_method·customer_gender(범주형)만으로
   학습시켜, 실제 행동/속성 기반 예측이라는 현실적인 지도학습 문제로 남겨두었다.

    ** [[ 요구사항 외 추가 구현 ]] **
   성격이 다른 3개 알고리즘 계열을 동일한 train/test 분할로 공정 비교(compare_models_and_select_best)한 뒤 R2가
   가장 높은 모델만 저장한다:
   - Ridge          : 선형 모델. 빠르고 해석 가능한 베이스라인
   - RandomForest    : 배깅 기반 트리 앙상블. 비선형·상호작용 포착
   - HistGradientBoosting : 부스팅 기반 트리 앙상블. 대용량 표 데이터에 최적화되어 있고 sklearn 기본 구현 중 가장 빠른 축에 속함

   서로 다른 계열을 나란히 두면 "선형으로 충분한지, 비선형/앙상블이 필요한지"를 데이터로 판단할 수 있다는 것이 이 비교의 핵심 목적이다.
   R2가 전반적으로 낮게 나오는 것은 위 데이터 누수 방지 설계의 결과이며, 학습 로그에도 이유를 함께 출력한다.

   전처리는 모든 후보 모델이 공유하는 ColumnTransformer(SimpleImputer+
   StandardScaler / SimpleImputer+OneHotEncoder(handle_unknown="ignore"))로
   캡슐화했다. handle_unknown="ignore"는 테스트셋에 학습 때 못 본 범주가 나와도 예외 없이 동작하게 하기 위한 방어 장치다.

4) 예외 처리 설계: 파일/모듈 로딩(practice3 임포트, CSV 로딩), 통계 검정의
   표본 부족·분할표 오류, 모델 학습·저장·재로딩, 차트 파일 저장까지
   각 경계마다 구체적인 예외 타입으로 잡아 원인이 드러나는 메시지로
   재발생시킨다. 최상단 진입점에서 이 모든 타입을 한 번에 받아 종료 코드 1로 안전하게 종료한다.
===================================================

- load_practice3_module   : practice3/판교_9반_김민정.py를 importlib로 동적 로딩
- plot_eda_grid           : 2x2 서브플롯(히스토그램+KDE/박스플롯/월별 라인/상관 히트맵) 생성·저장
- interpret_p_value       : p-value를 유의수준과 비교해 해석 문구로 변환 (t-test/카이제곱 공용)
- run_ttest               : 두 지역 그룹 간 평균 매출 차이 Welch's t-test
- run_chi_square          : 두 범주형 변수의 독립성 카이제곱 검정
- build_pipeline               : ColumnTransformer(전처리) + 지정한 모델을 하나의 Pipeline으로 구성
- compare_models_and_select_best : Ridge/RandomForest/HistGradientBoosting을 동일 train/test로
  비교(fit·predict·score) -> 최고 R2 모델 저장 -> 재로딩 검증까지 수행
- save_model / load_model : joblib 기반 모델 저장·로딩 (예외 처리 포함)
- save_plotly_bar_chart   : 지역·카테고리별 총매출 Plotly 막대 차트를 HTML로 저장
===================================================
"""

import importlib.util
import sys
import time
from pathlib import Path
from types import ModuleType

import joblib
import matplotlib

matplotlib.use("Agg")  # GUI 없는 환경(서버/CI)에서도 안전하게 저장하기 위해 백엔드 고정
import matplotlib.pyplot as plt

plt.rcParams["axes.unicode_minus"] = False  # 마이너스 기호 깨짐 방지
import pandas as pd
import plotly.express as px
import seaborn as sns
from scipy import stats
from sklearn.base import BaseEstimator
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
PRACTICE3_PATH = BASE_DIR.parent / "practice3" / "판교_9반_김민정.py"

CHART_PNG_PATH = BASE_DIR / "eda_4charts.png"
MODEL_PATH = BASE_DIR / "sales_amount_model.joblib"
PLOTLY_HTML_PATH = BASE_DIR / "region_category_sales.html"

AMOUNT_COL = "amount"
ALPHA = 0.05

TARGET_COL = "amount"
NUMERIC_FEATURES = ["quantity", "customer_age"]
CATEGORICAL_FEATURES = ["region", "category", "payment_method", "customer_gender"]

# [[ 요구사항 외 추가 구현 ]] **
# 서로 다른 알고리즘 계열(선형 / 배깅 앙상블 / 부스팅 앙상블)을 후보로 두고
# compare_models_and_select_best에서 동일한 train/test로 공정 비교한다.
CANDIDATE_MODELS: dict[str, BaseEstimator] = {
    "Ridge(선형)": Ridge(alpha=1.0, random_state=42),
    "RandomForest(배깅 앙상블)": RandomForestRegressor(n_estimators=50, max_depth=10, n_jobs=-1, random_state=42),
    "HistGradientBoosting(부스팅 앙상블)": HistGradientBoostingRegressor(max_iter=150, random_state=42),
}


# ---------------------------------------------------------------------------
# practice3 모듈 동적 로딩
# - 파일이 없으면 FileNotFoundError, 모듈 실행 중 오류가 나면 ImportError로
#   통일해 재발생시킨다. exec_module 단계는 practice3 내부의 어떤 오류든
#   발생할 수 있어 광범위하게 잡되, 원인 메시지를 보존해 재발생시킨다.
# ---------------------------------------------------------------------------
def load_practice3_module() -> ModuleType:
    if not PRACTICE3_PATH.exists():
        raise FileNotFoundError(f"practice3 스크립트를 찾을 수 없습니다: {PRACTICE3_PATH}")

    spec = importlib.util.spec_from_file_location("practice3_pipeline", PRACTICE3_PATH)
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except Exception as e:
        raise ImportError(f"practice3 모듈 로딩 실패: {e}") from e
    return module


# ---------------------------------------------------------------------------
# 1) EDA 시각화 4종 (2x2 서브플롯)
#  요구사항
#   - fig, axes = plt.subplots(2,2)로 히스토그램+KDE / 박스플롯 / 월별 라인 /상관 히트맵을 한 figure에 구성
# 
# ---------------------------------------------------------------------------
def plot_eda_grid(df: pd.DataFrame, save_path: Path) -> None:
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # 히스토그램 + KDE
    sns.histplot(data=df, x=AMOUNT_COL, kde=True, ax=axes[0, 0], color="steelblue")
    axes[0, 0].set_title("매출 분포 (히스토그램 + KDE)")

    # 지역별 매출 분포 (박스플롯)
    sns.boxplot(data=df, x="region", y=AMOUNT_COL, ax=axes[0, 1])
    axes[0, 1].set_title("지역별 매출 분포 (박스플롯)")
    axes[0, 1].tick_params(axis="x", rotation=45)

    # 월별 매출 추이
    monthly = (
        df.assign(month=pd.to_datetime(df["order_date"]).dt.to_period("M").astype(str))
        .groupby("month")[AMOUNT_COL]
        .sum()
        .sort_index()
    )
    axes[1, 0].plot(monthly.index, monthly.values, marker="o", color="teal")
    axes[1, 0].set_title("월별 매출 추이")
    axes[1, 0].tick_params(axis="x", rotation=45)

    # 수치형 변수 상관 히트맵
    corr = df.select_dtypes("number").corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=axes[1, 1])
    axes[1, 1].set_title("수치형 변수 상관 히트맵")

    # 제목
    fig.suptitle("EDA 시각화 4종 (IQR 정제 데이터 기준)", fontsize=14)
    plt.tight_layout()

    # 저장
    try:
        fig.savefig(save_path, dpi=150)
    except OSError as e:
        raise OSError(f"EDA 차트 저장 실패: {save_path} ({e})") from e
    finally:
        plt.close(fig)


# ---------------------------------------------------------------------------
# p-value 해석 (t-test/카이제곱 공용 -> 중복 로직 제거)
# ---------------------------------------------------------------------------
def interpret_p_value(p_value: float, alpha: float = ALPHA) -> str:
    return (
        f"p < {alpha} -> 통계적으로 유의미한 차이/연관성이 있음"
        if p_value < alpha
        else f"p >= {alpha} -> 통계적으로 유의미하다고 보기 어려움"
    )


# ---------------------------------------------------------------------------
# 2-1) t-test
#  요구사항
#   - 서울 vs 부산 평균 매출 차이를 t-test로 확인, t통계량·p-value 출력 및
#     유의미 여부 해석 한 줄 출력
#  예외 처리
#   - 비교할 두 그룹의 표본이 t-test를 수행하기에 부족하면 ValueError
# ---------------------------------------------------------------------------
def run_ttest(
    df: pd.DataFrame, group_col: str, value_col: str, group_a: str, group_b: str, alpha: float = ALPHA
) -> tuple[float, float]:

    # 두 그룹의 데이터 추출
    a = df.loc[df[group_col] == group_a, value_col].dropna()
    b = df.loc[df[group_col] == group_b, value_col].dropna()

    # 두 그룹의 데이터가 부족하면 ValueError 발생
    if len(a) < 2 or len(b) < 2:
        raise ValueError(f"t-test 표본 부족: {group_col}='{group_a}'({len(a)}건) vs '{group_b}'({len(b)}건)")

    # Welch's t-test 수행
    t_stat, p_value = stats.ttest_ind(a, b, equal_var=False)

    print(f"[t-test] {group_a}(n={len(a)}, mean={a.mean():,.0f}) vs {group_b}(n={len(b)}, mean={b.mean():,.0f})")
    print(f"  t-statistic={t_stat:.4f}, p-value={p_value:.4f}")
    print(f"  유의미 여부 해석: {interpret_p_value(p_value, alpha)}")
    return t_stat, p_value


# ---------------------------------------------------------------------------
# 2-2) 카이제곱 검정
#  요구사항
#   - 두 범주형 변수(region x category) 분할표 생성 후 chi2_contingency
#     적용, p-value 출력 및 해석
#  예외 처리
#   - 유효 데이터가 없거나 분할표에 0인 행/열이 있어 chi2_contingency가
#     실패하면 ValueError로 원인을 명확히 재발생
# ---------------------------------------------------------------------------
def run_chi_square(df: pd.DataFrame, col_a: str, col_b: str, alpha: float = ALPHA) -> tuple[float, float]:
    sub = df[[col_a, col_b]].dropna()

    # 유효 데이터가 없으면 ValueError 발생
    if sub.empty:
        raise ValueError(f"카이제곱 검정 불가: {col_a}/{col_b}에 유효한 데이터가 없습니다")

    # 분할표 생성
    table = pd.crosstab(sub[col_a], sub[col_b])

    # chi2_contingency 수행
    try:
        chi2, p_value, dof, _expected = stats.chi2_contingency(table)
    # chi2_contingency 실패 시 ValueError 발생
    except ValueError as e:
        raise ValueError(f"카이제곱 검정 실패({col_a} x {col_b}): {e}") from e

    print(f"[카이제곱] {col_a} x {col_b} 분할표 shape={table.shape}, dof={dof}")
    print(f"  chi2={chi2:.4f}, p-value={p_value:.4f}")
    print(f"  해석: {interpret_p_value(p_value, alpha)}")
    return chi2, p_value


# ---------------------------------------------------------------------------
# 3-1) 전처리 + 모델 Pipeline 구성
#  요구사항
#   - ColumnTransformer + Pipeline을 완성하고 훈련,평가,저장,재로딩을 순서대로 수행
#
# - 수치형: 결측치는 중앙값으로 대체 후 표준화
# - 범주형: 결측치는 최빈값으로 대체 후 원-핫 인코딩(미지 범주는 무시)
# - 모델: estimator 인자로 받은 모델(Ridge/RandomForest/HistGradientBoosting 등)
#   -> compare_models_and_select_best에서 후보마다 이 함수를 호출해 재사용
# ---------------------------------------------------------------------------
def build_pipeline(estimator: BaseEstimator) -> Pipeline:
    # ColumnTransformer 정의
    preprocessor = ColumnTransformer(
        [
            ( # 수치형 전처리
                "num",
                # 결측치는 중앙값으로 대체 후 표준화
                Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]),
                NUMERIC_FEATURES,
            ),
            ( # 범주형 전처리
                "cat",
                Pipeline(
                    [
                        # 결측치는 최빈값으로 대체
                        ("impute", SimpleImputer(strategy="most_frequent")),
                        # 원-핫 인코딩(미지 범주는 무시). HistGradientBoosting은 sparse 입력을
                        # 받지 못해 sparse_output=False로 통일(후보 컬럼 수가 적어 dense로도 가벼움).
                        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )
    # Pipeline 생성
    return Pipeline([("prep", preprocessor), ("model", estimator)])


# ---------------------------------------------------------------------------
# 3-2) 여러 모델 비교 -> 최고 성능 모델 선택 -> 저장 -> 재로딩 검증
#  요구사항
#   - 전처리 + 모델 1개 이상을 Pipeline 객체로 구성, fit·predict·score 실행 후
#     joblib으로 모델 파일 저장
#   - (고도화) 단일 모델이 아니라 CANDIDATE_MODELS(선형/배깅/부스팅)를 같은
#     train/test로 공정 비교하고, R2가 가장 높은 모델만 저장한다.
#  예외 처리
#   - 학습 데이터가 지나치게 적으면 ValueError
#   - 후보 모델 하나가 학습에 실패해도(ValueError/MemoryError) 전체를 중단하지
#     않고 건너뛰며, 모든 후보가 실패한 경우에만 RuntimeError
#   - 저장/재로딩 후 점수가 원본과 다르면 RuntimeError (저장·로딩 신뢰성 검증)
# ---------------------------------------------------------------------------
def compare_models_and_select_best(df_raw: pd.DataFrame, model_path: Path) -> Pipeline:
    # amount(타깃)가 없는 행은 지도학습에 쓸 수 없으므로 제거
    # 피처의 결측치는 Pipeline 내 SimpleImputer가 처리하므로 여기서는 손대지 않는다.
    data = df_raw.dropna(subset=[TARGET_COL])

    # 학습 데이터가 지나치게 적으면 ValueError 발생
    if len(data) < 10:
        raise ValueError(f"Pipeline 학습 데이터가 너무 적습니다: {len(data)}행")

    # 피처와 타깃 분리
    X = data[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = data[TARGET_COL]

    # 모든 후보 모델이 동일한 분할로 비교되어야 공정하므로, 분할은 한 번만 수행
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"[Pipeline] 학습 {len(X_train)}행 / 평가 {len(X_test)}행 (후보 모델 {len(CANDIDATE_MODELS)}개 비교)")


    scores: dict[str, dict[str, float]] = {}
    fitted_pipelines: dict[str, Pipeline] = {}

    # 모든 후보 모델 비교 시작
    for name, estimator in CANDIDATE_MODELS.items():
        # Pipeline 생성
        pipeline = build_pipeline(estimator)
        # 학습 시작
        start = time.perf_counter()
        try:
            pipeline.fit(X_train, y_train)
        # 학습 실패 시 ValueError 또는 MemoryError 발생 시 건너뜀
        except (ValueError, MemoryError) as e:
            print(f"  [{name}] 학습 실패, 이 후보는 건너뜀: {e}")
            continue
        # 학습 시간 계산
        fit_seconds = time.perf_counter() - start
        # 평가

        preds = pipeline.predict(X_test)
        # R2 계산
        r2 = pipeline.score(X_test, y_test)
        # MAE 계산
        mae = mean_absolute_error(y_test, preds)
        # 점수 저장
        scores[name] = {"r2": r2, "mae": mae, "fit_seconds": fit_seconds}
        # 학습된 Pipeline 저장
        fitted_pipelines[name] = pipeline
        # 결과 출력
        print(f"  [{name}] R2={r2:.4f}, MAE={mae:,.0f}, 학습시간={fit_seconds:.1f}s")

    # 모든 후보가 실패했다면 더 진행할 수 없으므로 RuntimeError
    if not scores:
        raise RuntimeError("모든 후보 모델의 학습이 실패했습니다")

    # R2가 가장 높은 모델 선택
    best_name = max(scores, key=lambda n: scores[n]["r2"])
    # 선택된 모델 저장
    best_pipeline = fitted_pipelines[best_name]
    print(f"  -> 최고 성능 모델 선택: {best_name} (R2={scores[best_name]['r2']:.4f})")
    print("  (unit_price는 amount와 결정론적 관계라 피처에서 제외 -> 전반적으로 낮은 R2는 데이터 누수를 피한 결과)")

    # 모델 저장
    save_model(best_pipeline, model_path)

    # 모델 재로딩
    reloaded = load_model(model_path)
    reload_r2 = reloaded.score(X_test, y_test)

    # 재로딩한 모델의 결과가 원본과 다르면 RuntimeError 발생
    if abs(reload_r2 - scores[best_name]["r2"]) > 1e-9:
        raise RuntimeError(f"재로딩한 모델의 결과가 원본과 다릅니다: {reload_r2} != {scores[best_name]['r2']}")
    print(f"  재로딩 검증 완료: 저장/로딩 후 R2 동일하게 재현됨 ({reload_r2:.4f})")

    return best_pipeline


# ---------------------------------------------------------------------------
# joblib 저장/로딩 + 예외 처리
# ---------------------------------------------------------------------------
def save_model(model: Pipeline, path: Path) -> None:
    try:
        joblib.dump(model, path)
    except OSError as e:
        raise OSError(f"모델 저장 실패: {path} ({e})") from e
    print(f"  모델 저장 완료: {path}")


def load_model(path: Path) -> Pipeline:
    try:
        return joblib.load(path)
    except FileNotFoundError:
        raise FileNotFoundError(f"저장된 모델 파일을 찾을 수 없습니다: {path}") from None
    except (EOFError, ValueError) as e:
        raise ValueError(f"모델 파일이 손상되었습니다: {path} ({e})") from e


# ---------------------------------------------------------------------------
# 4) Plotly 인터랙티브 차트
#  요구사항
#   - 지역·카테고리별 총매출을 Plotly Express 막대 차트로 만들고 HTML로 저장
#  예외 처리
#   - write_html 실패(권한/디스크 등)는 OSError로 원인을 보존해 재발생
# ---------------------------------------------------------------------------
def save_plotly_bar_chart(agg_df: pd.DataFrame, save_path: Path) -> None:
    # Plotly Express 막대 차트 생성
    fig = px.bar(
        agg_df,
        x="region",
        y="total",
        color="category",
        barmode="group",
        title="지역·카테고리별 총매출",
        labels={"total": "총매출", "region": "지역", "category": "카테고리"},
    )
    # HTML로 저장
    try:
        fig.write_html(str(save_path))
    except OSError as e:
        raise OSError(f"Plotly 차트 저장 실패: {save_path} ({e})") from e
    print(f"  Plotly 인터랙티브 차트 저장: {save_path}")


if __name__ == "__main__":
    # practice3 재사용 -> 시각화 -> 통계 검정 -> Pipeline -> Plotly 순서로 실행.
    # 각 단계에서 발생 가능한 예외를 한 곳에서 받아 원인 메시지를 출력하고
    # 종료 코드 1로 안전하게 종료한다.
    try:
        print("=" * 20, "0) practice3 연계 - IQR 정제 데이터 로딩", "=" * 20)
        practice3 = load_practice3_module()
        df_clean, lo, hi = practice3.explore_and_get_outlier_bounds(practice3.CSV_PATH)

        print("\n" + "=" * 20, "1) EDA 시각화 4종 (2x2 서브플롯)", "=" * 20)
        plot_eda_grid(df_clean, CHART_PNG_PATH)
        print(f"  저장 완료: {CHART_PNG_PATH}")

        print("\n" + "=" * 20, "2) 통계 검정 (t-test / 카이제곱)", "=" * 20)
        run_ttest(df_clean, "region", AMOUNT_COL, "서울", "부산")
        run_chi_square(df_clean, "region", "category")

        print("\n" + "=" * 20, "3) sklearn Pipeline 모델 비교·선택·저장·재로딩", "=" * 20)
        df_raw = practice3.load_csv(practice3.CSV_PATH)  # 원본(IQR 미적용) -> Pipeline 학습 데이터
        compare_models_and_select_best(df_raw, MODEL_PATH)

        print("\n" + "=" * 20, "4) Plotly 인터랙티브 차트", "=" * 20)
        region_category_totals = practice3.pandas_named_aggregation(df_clean)
        save_plotly_bar_chart(region_category_totals, PLOTLY_HTML_PATH)

        print("\n모든 단계 정상 완료.")

    except (
        FileNotFoundError,
        ImportError,
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
        KeyError,
        ValueError,
        RuntimeError,
        OSError,
    ) as e:
        print(f"\n[오류] practice4 파이프라인 실행 실패: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)
