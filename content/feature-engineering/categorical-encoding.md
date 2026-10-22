---
title: 범주형 인코딩
en: Label, One-Hot, Dummy Encoding & High Cardinality
summary: 문자열 범주를 알고리즘이 계산할 수 있는 수치로 바꾸되, 순서가 없는 범주에 크기 관계가 생기지 않도록 방식을 고른다
importance: 3
order: 7
tags: [인코딩, One-Hot, Dummy, Label Encoding, Cardinality]
keypoints:
  - Label Encoding은 범주를 정수로 바꿔 간단하지만, 없는 크기·순서 관계가 생겨 모델을 왜곡할 수 있다
  - One-Hot은 범주 k개 → k열, Dummy는 k−1열 (빠진 범주가 기준, Dummy Variable Trap 회피)
  - 범주가 아주 많으면 유사값 그룹화, 저빈도 '기타' 묶기, 타깃 조건부 통계(Bin Counting)
qa:
  - q: Label Encoding과 One-Hot Encoding의 차이와 선택 기준은?
    a: "Label Encoding은 San Francisco=1, New York=2, Seattle=3처럼 정수를 붙여 간단하지만, 모델이 3이 1보다 크다거나 2와 3이 비슷하다고 오해해 성능이 떨어질 수 있습니다. 그래서 순서가 있는 변수(품질 등급)나 분류 문제의 Target, 트리 모델에 주로 씁니다. One-Hot은 범주마다 0/1 열을 만들어 크기 관계 문제를 없애지만 열이 늘어 학습 속도와 메모리 부담이 커집니다."
  - q: Dummy Variable Trap이란?
    a: "One-Hot으로 k개 열을 모두 만들면 k−1개 열을 알면 나머지 하나가 자동으로 결정되어 독립변수 간 완전한 종속성, 즉 다중공선성이 생깁니다. 선형회귀에서 계수 추정이 불안정해지므로 한 범주를 빼고 k−1개만 만드는 Dummy Coding을 씁니다. 빠진 범주가 기준(Reference Category)이 되어 다른 범주의 효과는 그 기준 대비 상대값으로 해석합니다."
  - q: 범주 수가 매우 많은 변수(High Cardinality)는 어떻게 처리하나요?
    a: "사용자 ID 10만 개를 One-Hot하면 열이 폭발하고 성능이 급격히 떨어집니다. 의미가 비슷한 고유값을 묶거나, 빈도가 낮은 값들을 '기타'로 합치거나, 범주별로 열을 만드는 대신 그 범주일 때 타깃의 조건부 통계(평균, 비율)로 바꾸는 Bin Counting(Target Encoding)을 씁니다. 타깃 통계는 Train에서만 계산해야 누수가 없습니다."
related: [question-driven-eda, preprocessing-leakage, feature-creation, data-stats/regression-assumptions]
source: 9/14 슬라이드 p.20 (Cardinality Case Study), p.47–51 (Data Encoding, Label Encoding, One-Hot Encoding, Dummy Coding, Large-size Category Problem), 실습 2 11번 (ordinal / onehot / dummy)
---

```compare
Label | One-Hot | Dummy
방식 | 범주 → 정수 1, 2, 3 | 범주 k개 → 0/1 열 k개 | 범주 k개 → 0/1 열 k−1개
장점 | 간단, 열 수 그대로 | 크기 관계 문제 해소 | 불필요한 열 없음, 해석 용이
단점 | 거짓 크기·순서 관계 | 다중공선성(Trap), 열 폭증 | 기준 범주 대비 상대 해석, 누락 처리 어려움
쓰임 | 순서형 변수, 분류 Target, 트리 | 트리·신경망, 정규화 모델 | 선형회귀 (절편 있는 모델)
```

```python
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)   # One-Hot
dummy = OneHotEncoder(drop="first", handle_unknown="ignore")         # Dummy (k−1)
ordinal = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
ohe.fit(X_train[["Neighborhood"]])           # 범주 목록은 Train에서만 학습
X_test_enc = ohe.transform(X_test[["Neighborhood"]])   # Test의 새 범주는 0 벡터
```

> [!tip] 면접 팁
> "값이 얼마나 차이 나는지가 중요한가(수치형), 단지 다르기만 하면 되는가(범주형)"가 인코딩 선택의 출발점. 실습 Ames의 Neighborhood는 28개 범주 중 Landmrk 1건, GrnHill 2건처럼 희소 범주가 있어 묶기를 검토할 만하다.
