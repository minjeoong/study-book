---
summary: 데이터 분석에 쓰는 Python을 언어 내부(실행 구조, 자료구조, 함수)에서 엔지니어링(검증, 테스트, 비동기)과 분석 도구(Pandas, Polars, 시각화, ML Pipeline)까지 이어서 익히는 과목
keywords: [바이트코드, PVM, 시간복잡도, 컴프리헨션, 제너레이터, 클로저, 데코레이터, 예외 처리, logging, 타입 힌트, Pydantic, pytest, Ruff, pre-commit, GIL, asyncio, multiprocessing, Pandas, Polars, DuckDB, Parquet, Seaborn, Plotly, CRISP-DM, sklearn Pipeline]
materials:
  - file: slides-python-data-analysis.pdf
    title: "강의 슬라이드 — 데이터 분석을 위한 Python 이해"
    type: slides
    date: 2026-08-06
  - file: guide-python-ide.pdf
    title: "Python IDE 설정 가이드"
    type: slides
    date: 2026-08-06
  - file: practice1.py
    title: "실습 — Practice 1 풀이"
    type: lab
    date: 2026-08-06
  - file: practice2.py
    title: "실습 — Practice 2 풀이"
    type: lab
    date: 2026-08-06
  - file: submission-day1-python-lab.pdf
    title: "과제 제출 — Day1 종합실습 보고서"
    type: etc
    date: 2026-08-06
  - file: submission-day1-python-lab.zip
    title: "과제 제출 — Day1 종합실습 코드 (테스트 포함)"
    type: lab
    date: 2026-08-06
  - file: practice3.py
    title: "실습 — Practice 3 풀이"
    type: lab
    date: 2026-08-07
  - file: practice4.py
    title: "실습 — Practice 4 풀이"
    type: lab
    date: 2026-08-07
  - file: submission-day2-python-lab.pdf
    title: "과제 제출 — Day2 종합실습 보고서"
    type: etc
    date: 2026-08-07
  - file: submission-day2-team3-code.zip
    title: "과제 제출 — Day2 종합실습 3조 코드"
    type: lab
    date: 2026-08-07
  - file: submission-day2-team3-results.zip
    title: "과제 제출 — Day2 종합실습 3조 (결과 이미지 포함)"
    type: lab
    date: 2026-08-07
  - file: lab-data-analysis-for-servitization.zip
    title: "팀 실습 — Data Analysis for Servitization"
    type: lab
    date: 2026-08-07
---

## 한눈에 보기

```layers
분석 자동화 · 구조화 :: schedule, Jinja2 리포트, 노트북은 탐색 / src는 재사용, 재현성
통계 · ML 연결 :: scipy.stats 검정, CRISP-DM, ColumnTransformer + Pipeline + joblib
분석 도구 :: Pandas 2.x, Polars Lazy, DuckDB SQL, Matplotlib · Seaborn · Plotly
엔지니어링 :: 예외 · 로깅 · .env, 타입 힌트 · Pydantic, pytest · Ruff · pre-commit, GIL · asyncio
언어 기초 :: 실행 구조(바이트코드 · PVM), 자료구조 · 복잡도, 컴프리헨션 · 제너레이터, 클로저 · 데코레이터
```

- Day1은 아래 두 층: "Python이 어떻게 돌아가고, 분석 코드를 어떻게 안전하고 빠르게 짜는가"
- Day2는 위 세 층: "그 Python으로 데이터를 읽고, 그리고, 검정하고, 모델까지 파이프라인으로 묶는가"
- 실습마다 채점 기준이 코드 커뮤니케이션(주석·머리말), 간결성, 오류·예외 처리, 1시간 납기라서 모든 실습 코드에 try-except와 logging이 기본으로 들어감

## 수업 흐름

**Day1 (8/6) Python 언어와 엔지니어링**

- Python Summary — 변수·자료형, 문자열·리스트·튜플·사전·집합, 파일 입출력, 함수, 클래스, 예외처리 복습
- 1 실행 구조와 개발 환경 — 인터프리터, AST·dis, 바이트코드(.pyc), PVM, 메모리 모델(참조 카운팅 + GC), venv · uv
- 2 자료구조와 컴프리헨션 — 제어문, 단락 평가, list·tuple·set·dict·deque, collections(Counter, defaultdict), heapq, bisect, 시간복잡도, zip, 제너레이터, dataclass
- Practice 1 — 리스트 + 딕셔너리 필터링기, 심화: 컴프리헨션 · Counter · defaultdict · 제너레이터 집계
- 3 함수 · 파일 · 예외 처리 — *args·**kwargs, 일급 함수, 람다, 고차함수, 클로저, 내장 함수·표준 라이브러리, CSV·JSON·Parquet, 데코레이터·functools.wraps, 사용자 정의 예외, logging, .env
- 4 타입 힌트와 데이터 모델링 — Optional·Union·Literal·Any, Generic, Protocol, Callable, mypy, Pydantic v2
- Practice 2 — 파일 I/O + 예외 처리 + Pydantic 검증 파이프라인
- 5 코드 품질과 기초 테스트 — 디버깅(pdb, traceback), pytest·pytest.ini·fixture, pytest-cov, black, PEP 8, pre-commit, GitHub Actions, Ruff
- 6 비동기와 병렬 처리 — 동시성 vs 병렬성, GIL, threading, multiprocessing, asyncio + httpx, timeit · cProfile
- Day1 종합 실습 — 데이터 수집 미니 파이프라인 (비동기 수집 → 스키마 검증 → CSV · Parquet 저장 → 테스트 · 커밋)

**Day2 (8/7) 분석 도구와 파이프라인**

- 8 Pandas 2.x 실전 — 기초 EDA, 결측치 · 이상치(IQR), groupby · pivot_table · merge, Copy-on-Write, apply vs 벡터화
- 9 Polars + DuckDB — Eager vs Lazy, Pandas 대응 문법, 파일 직접 SQL, 도구 선택, Apache Arrow
- Practice 3 — Pandas EDA · Polars Lazy · DuckDB SQL 동일 집계와 성능 비교
- 10 데이터 시각화 — Anscombe, Matplotlib Figure · Axes · subplots, Seaborn, Plotly Express, Altair, 도구 선택
- 11 기초 통계와 ML 파이프라인 — 기술통계, t-test · 카이제곱, CRISP-DM, sklearn Pipeline + joblib
- Practice 4 — 시각화 4종 · 통계 검정 · Pipeline 저장 · Plotly HTML (실습 3 산출물 연계)
- 12 분석 자동화 — schedule · cron, Jinja2 리포트, LLM API 구조, ETL 원칙
- 13 분석 코드 구조화 — Jupyter vs .py, 폴더 구조, 모듈화, README · GitHub
- Day2 종합 실습 — 팀별 End-to-End 분석 프로젝트 + 5분 발표

## 실습 정리

**Practice 1 · 2 (8/6) — 판매 데이터 JSON (month, region, amount, category)**

- 실습 1: 직원 리스트 필터링(Engineering & salary ≥ 80000, 30세 이상 튜플, 급여 top3), 심화로 amount ≥ 1000 필터 + 지역별 총매출 dict 컴프리헨션, Counter.most_common 지역별 건수, defaultdict 카테고리별 금액, 제너레이터 vs 리스트 sys.getsizeof 비교, month × category 총매출 top3
- 실습 2: safe_load_csv(파일 없으면 None + logger.error, finally에서 로딩 종료) → SalesRecord(Pydantic) 행 검증 → valid 4건 / errors 3건 분리 → valid는 CSV, errors는 JSON(ensure_ascii=False) 저장 후 재로딩 건수 검증

**Day1 종합 실습 — 데이터 수집 미니 파이프라인**

- Open-Meteo(서울 3일 시간대별 기온 · 강수확률, 72행), Countries.dev(한국), ip-api(8.8.8.8) 3개 API를 asyncio.gather로 동시 수집
- WeatherRecord · CountryInfo · IPInfo 모델로 필요한 필드만 뽑아 범위 검증(강수확률 0~100, 위도 −90~90), KeyError · TypeError · ValidationError를 나눠 로깅
- CSV · Parquet 저장 시간 비교: Parquet 첫 읽기만 느린 원인이 pyarrow 엔진 초기화 비용임을 찾아 예열 후 측정, 72행 규모에서는 포맷 차이가 오차 범위
- pytest(정상 + 필드 누락 · 타입 오류 · 범위 오류 케이스), ruff check 통과, Git 커밋

**Practice 3 · 4 (8/7) — sales_100k.csv**

- 실습 3: IQR 이상치 제거(제거 전 · 후 행 수) → region × category named aggregation → 같은 집계를 Polars Lazy(scan_csv → collect)와 DuckDB SQL로 → 파일 로딩부터 정렬까지 동일 범위, 동일 number로 timeit 비교
- 실습 4: 실습 3 모듈을 importlib로 불러와 재사용, 2×2 EDA 차트, 서울 vs 부산 Welch t-test, region × category 카이제곱, Ridge · RandomForest · HistGradientBoosting을 같은 분할로 비교해 최고 R² Pipeline만 저장 · 재로딩 검증, Plotly 막대 차트 HTML 저장
- 설계 포인트: amount = quantity × unit_price라 unit_price를 피처로 쓰면 누수 → 제외

**Day2 종합 실습 — 3조 Adult Census Income (32,561행 × 15열, 목표 income)**

- 로딩: Pandas vs Polars shape · 결측 일치, 메모리 17.57MB vs 3.95MB
- 전처리: 결측 4,262건(workclass 1,836 · occupation 1,843 · native-country 583), 중복 24건 제거 → 32,537행, income 불균형 75.9% vs 24.1%
- 통계(내 담당): 상관 education-num 0.335 · age 0.234, 카이제곱 + Cramér's V(relationship 0.45 최강), Levene 기각 → Welch t-test로 고소득 집단 주당 근로시간 +6.63시간, t = 45.1, Cohen's d = 0.55 (중간)
- 모델: ColumnTransformer + LogisticRegression Pipeline, Accuracy 0.856 · F1 0.675 · ROC-AUC 0.910, 5-fold F1 0.658 ± 0.005, 심화 비교에서 HistGradientBoosting F1 0.725 최고, class_weight='balanced'는 Recall 0.867, F1 최대 임계값 0.32
- 자동화: 각 단계 반환값으로 report.md 자동 생성, 산출물 10종 생성 검증, GitHub 브랜치 협업(merge conflict 해결)

```python
_, p_lev = levene(high, low, center="median")             # 등분산 검정
t, p = ttest_ind(high, low, equal_var=p_lev >= ALPHA)     # 기각되면 Welch's t-test
pooled = np.sqrt(((n_a - 1) * var_a + (n_b - 1) * var_b) / (n_a + n_b - 2))
d = (high.mean() - low.mean()) / pooled                   # 효과크기 (p-value와 별도로 보고)
```

```python
async with httpx.AsyncClient() as client:                 # Day1: 3개 API 동시 수집
    outcomes = await asyncio.gather(*(fetch_json(client, n, u) for n, u in APIS.items()))
records = [WeatherRecord(time=t, temperature_2m=tp, precipitation_probability=pp)
           for t, tp, pp in zip(h["time"], h["temperature_2m"], h["precipitation_probability"], strict=True)]
```
