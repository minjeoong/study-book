---
title: "Feature Engineering"
en: "Feature Extraction, Feature Selection, Curse of Dimensionality"
summary: "원본 데이터를 모델 성능에 도움이 되는 Feature로 가공하는 모든 과정 — 만들고(Extraction) 고르기(Selection)"
importance: 3
order: 2
tags: [Feature Engineering, 파생변수, Feature Selection, 차원의 저주, PCA]
keypoints:
  - "Extraction = 기계적 변환(Transformation) + 도메인 기반 파생(Creation)"
  - "변수가 많으면 차원의 저주 → 빈 공간에 규칙을 만들어 과적합"
  - "Selection은 신뢰성 → 중요도 → 논리성(Logical Trend) 검증 순"
qa:
  - q: "Feature Transformation과 Feature Creation의 차이는?"
    a: "Transformation은 결측 대체, 표준화, Min-Max, One-Hot처럼 데이터의 통계·수학적 구조에서 기계적으로 만드는 Feature로 사람의 해석 없이도 생성된다. Creation은 업무 이해를 바탕으로 의미 있는 파생 변수를 만드는 창의 영역으로, 가입기간(현재일 − 가입일)이나 소득 대비 부채 비율(DTI)이 예다. 종합실습에서도 나이 45–62세 플래그, 비활성 + 상품 1개 같은 파생 변수가 성능을 올렸다."
  - q: "차원의 저주란?"
    a: "변수(차원)가 늘수록 제대로 학습하는 데 필요한 데이터가 기하급수적으로 늘어나는 문제다. 10개 점을 1차원 4칸에 두면 밀도가 2.5인데, 2차원 16칸이면 0.625, 3차원 64칸이면 0.156으로 공간이 비어 간다. 데이터가 부족한데 차원만 크면 모델이 빈 공간에서도 규칙을 만들어 Train은 좋고 Test는 폭락하는 과적합이 생긴다. 대응은 Feature Selection이나 PCA 같은 차원 축소인데, PCA는 개별 변수 해석이 어려워진다."
  - q: "Feature Selection은 어떤 순서로 하나?"
    a: "도메인 지식으로 후보를 만든 뒤 기초 탐색으로 신뢰성을 검증하고(단일값·결측·이상), 통계·ML로 중요도를 검증하고(상관, Feature Importance), 마지막으로 업무 논리로 검증한다. 슬라이드 예시로 후보 100개 → 90개 → 30개 → 25개가 된다. Logical Trend 분석은 변수 영향의 방향·크기가 비즈니스적으로 맞는지와 기간별로 안정적인지를 같이 본다."
related: [modeling-process, data-leakage, overfitting-underfitting, shap-model-interpretation]
source: "9/28–29 슬라이드 p.15–23, 9/29 노트북 Feature Creation ~ PCA 섹션"
---

```flow
최초 정의 (후보 100개) :: 도메인 지식·경험·사례로 후보 Feature 생성 — 업무 + 분석
신뢰성 검증 (90개) :: 기초 탐색으로 데이터 신뢰성 확인 — 분석 + IT
중요도 검증 (30개) :: 통계 / ML 분석으로 Feature 중요도 확인 — 분석
논리성 검증 (25개) :: Logical Trend — 방향·크기가 업무 논리에 맞고 기간별로 안정적인가
최종 선정 :: x2, x7, x9 … → Machine Learning
```

| 노트북 변환 단계 | 방법 | 포인트 |
|---|---|---|
| 결측 (연속형) | Train 중앙값으로 대체 | 중앙값은 Train에서만 계산 |
| 결측 (범주형) | 새 범주 'Unknown' | 결측 자체가 신호일 수 있음 |
| 분포 변환 | signed log1p | 0에 몰리거나 치우친 분포 완화 |
| Scaling | Min-Max (`fit`은 Train만) | 트리 모델은 영향 없음 |
| 범주 인코딩 | One-Hot + `reindex(columns=Train)` | Valid·Test 컬럼 구조를 Train에 맞춤 |
| 1차 Selection | 단일값 제거, 상관 높은 변수 제거, RF 중요도 | 순서: 파생 → 분할 → 변환 → 선택 |

> [!tip] 왜 Feature Engineering인가
> 모델 개발 파라미터 우선순위 조사에서 Feature Engineering이 25%로 Data Cleaning(20%), Model Training(15%), Algorithm Selection(10%)보다 높음. "Robust Model은 Robust Feature에 기초함".
