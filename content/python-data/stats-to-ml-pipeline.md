---
title: 통계 검정에서 sklearn Pipeline까지
en: CRISP-DM, scipy.stats, sklearn Pipeline, joblib
summary: CRISP-DM 흐름에서 기술통계·가설검정으로 데이터를 이해하고, 전처리와 모델을 Pipeline 하나로 묶어 학습·평가·저장·재사용한다
importance: 3
order: 12
tags: [CRISP-DM, t-test, 카이제곱, Pipeline, ColumnTransformer, joblib]
keypoints:
  - "CRISP-DM: 업무 이해 → 데이터 이해 → 준비 → 모델링 → 평가 → 배포, 준비가 80~90%"
  - 두 그룹 평균 차이는 ttest_ind, 범주 × 범주 독립성은 chi2_contingency, p < 0.05면 H₀ 기각
  - ColumnTransformer(수치 스케일링 + 범주 원핫) + 모델을 Pipeline으로 묶고 joblib.dump로 통째 저장
qa:
  - q: sklearn Pipeline을 쓰는 이유는?
    a: "전처리와 모델을 하나의 객체로 묶으면 fit()은 학습 데이터에만 적용되고, predict() 때는 같은 전처리가 같은 순서로 자동 적용됩니다. 그래서 테스트 데이터 정보가 스케일러나 인코더에 새는 데이터 누수를 막고, joblib으로 Pipeline 전체를 저장하면 배포 환경에서도 학습 때와 똑같은 전처리와 예측이 보장됩니다."
  - q: ColumnTransformer는 무엇이고 handle_unknown='ignore'는 왜 넣나요?
    a: "ColumnTransformer는 수치형 컬럼에는 결측 중앙값 대체 후 StandardScaler, 범주형 컬럼에는 최빈값 대체 후 OneHotEncoder처럼 컬럼 그룹별로 다른 전처리를 적용합니다. OneHotEncoder에 handle_unknown='ignore'를 주면 테스트나 운영 데이터에 학습 때 못 본 범주가 나와도 오류 없이 0 벡터로 처리됩니다."
  - q: t-test 결과를 해석할 때 주의할 점은?
    a: "먼저 정규성과 등분산성을 확인하고, 등분산이 보장되지 않으면 Welch's t-test(equal_var=False)를 씁니다. 표본이 수만 건이면 아주 작은 차이도 p < 0.05가 되므로 Cohen's d 같은 효과크기를 함께 봐야 하고, 범주형 연관도 카이제곱 p-value보다 Cramér's V로 강도를 판단합니다."
related: [data-stats/hypothesis-testing, data-stats/statistical-tests, pandas-essentials, automation-project-structure]
source: Day2 (8/7) 슬라이드 p.292–297 (기술통계, t-test·카이제곱, CRISP-DM, sklearn Pipeline·joblib, 통계와 ML 연결), Practice 4 (t-test·카이제곱·Pipeline 저장·재로딩), Day2 종합실습 (Adult Census Income)
---

```flow
업무 이해 :: 문제 정의, 기술보다 올바른 질문이 먼저
데이터 이해 :: EDA, 기술통계(describe, skew, kurt), 상관행렬, 검정
데이터 준비 :: 결측·이상치·인코딩·스케일링·파생 변수 (전체 작업의 80~90%)
모델링 :: 알고리즘 선택, Pipeline 학습
평가 :: R², Accuracy, F1, ROC-AUC 등 목적에 맞는 지표
배포 :: joblib으로 저장한 Pipeline을 서비스에 적용 (MLOps의 시작)
```

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
import joblib

prep = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat_cols),
])
model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_train, y_train)
print(model.score(X_test, y_test))
joblib.dump(model, "model.joblib")            # 전처리 + 모델 통째 저장
assert (joblib.load("model.joblib").predict(X_test) == model.predict(X_test)).all()
```

> [!tip] 면접 팁
> 실습에서 amount = quantity × unit_price가 정확히 성립해 unit_price를 피처로 넣으면 R²가 1에 가까운 무의미한 모델이 된다는 것을 발견하고 제외했다. "점수가 너무 좋으면 누수부터 의심한다"는 경험담으로 쓰기 좋다.
