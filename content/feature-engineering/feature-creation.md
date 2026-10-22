---
title: 파생변수 생성
en: Feature Creation (Derived Features)
summary: 원본 변수를 결합·변환·집계해 문제를 더 잘 표현하는 새 Feature를 만드는 것, 출발점은 계산식이 아니라 질문과 도메인 지식
importance: 3
order: 10
tags: [파생변수, 상호작용, Binning, RFM, 도메인 지식]
keypoints:
  - "Combine(비율·차이·상호작용), Transform(날짜·구간화), Aggregate(집계) 세 가지 전략"
  - 좋은 Feature는 '무엇을 계산할까?'가 아니라 '무엇을 표현할까?'에서 시작한다
  - BMI, Sharpe Ratio, MDD, Credit Utilization, RFM은 도메인에서 오래 검증된 파생변수
qa:
  - q: 파생변수는 어떻게 만드나요?
    a: "원본 변수에 빠져 있는 정보가 무엇인지 질문하는 것에서 시작합니다. 키와 몸무게로 체형을 표현하려면 비율인 BMI, 주문일과 배송일로 배송 소요를 보려면 차이, 면적과 층수의 결합 효과는 곱인 상호작용, 생년월일은 연령대로 구간화, 구매 기록은 고객별 평균·횟수로 집계합니다. 가능한 계산은 많지만 의미 있는 Feature는 도메인 지식이 결정합니다."
  - q: RFM이란?
    a: "고객 가치를 Recency(오늘 − 마지막 구매일, 최근에 샀는가), Frequency(구매 횟수, 얼마나 자주), Monetary(총 구매금액, 얼마나 많이) 세 축으로 표현하는 파생변수입니다. 거래 단위 데이터를 고객 단위로 집계해 만들며, 예를 들어 A 고객은 R 3일, F 3회, M 160,000원처럼 '어떤 고객이 좋은 고객인가'라는 질문에 답합니다."
  - q: 파생변수를 만들 때 주의할 점은?
    a: "Target을 계산에 쓰면 정답을 미리 넣는 누수가 되므로 설명변수만 씁니다. Train과 Test에 같은 이름과 같은 계산식을 적용하고, 나눗셈은 0으로 나누는 경우를 처리합니다. 또 원본과 거의 같은 정보를 반복하는 변수는 다중공선성만 키우므로 상관을 확인하고, Baseline 대비 성능이 실제로 좋아졌는지 검증합니다."
related: [question-driven-eda, categorical-encoding, preprocessing-leakage]
source: 9/14 슬라이드 p.69–74 (Creating Better Features, Feature Creation Strategies, From Questions to Features, RFM, Where Do Good Features Come From), 실습 2 9번 (Total_Area, Quality_Area, House_Age, Area_per_Bedroom)
---

```flow
원본 변수 :: Height·Weight / Order·Delivery Date / 고객별 거래 기록
질문 :: 체형을 더 잘 표현할 수 있을까? 배송은 얼마나 걸렸을까? 어떤 고객이 좋은 고객인가?
새 Feature :: BMI (Ratio) / Delivery Time (Difference) / RFM (Aggregation)
검증 :: Train·Test 동일 계산식, Target 미사용, Baseline 대비 성능 확인
```

| 전략 | 방법 | 개념 | 예 |
| --- | --- | --- | --- |
| Combine | 비율 (Ratio) | 변수 간 상대적 크기 | 구매금액 / 구매횟수, BMI, DTI(대출/소득), 평균 속도 |
| Combine | 차이 (Difference) | 간격이나 변화 | 배송일 − 주문일 |
| Combine | 상호작용 (Interaction) | 결합 효과 | 면적 × 층수, 품질 × 면적 |
| Transform | 날짜 (Date) | 날짜에서 시간 정보 추출 | 요일, 월, 가입 경과일, 마지막 로그인 후 일수 |
| Transform | 구간화 (Binning) | 연속값을 의미 있는 구간으로 | 연령대, 가격대 |
| Aggregate | 집계 (Aggregation) | 여러 행을 하나의 요약으로 | 고객별 구매금액 평균·횟수 (RFM) |

```python
X["Total_Area"] = X["Gr_Liv_Area"] + X["Total_Bsmt_SF"]                 # 전체 면적
X["Quality_Area"] = X["Overall_Qual"] * X["Gr_Liv_Area"]                # 상호작용
X["House_Age"] = 2010 - X["Year_Built"]                                 # 연식 (기준연도 2010)
X["Area_per_Bedroom"] = X["Gr_Liv_Area"] / X["Bedroom_AbvGr"].replace(0, 1)  # 0 나눗셈 방지

rfm = tx.groupby("customer").agg(
    R=("date", lambda d: (today - d.max()).days), F=("date", "count"), M=("amount", "sum"))
```

> [!tip] 면접 팁
> "파생변수 = 계산식"이 아니라 "파생변수 = 문제를 더 잘 표현하는 방법". 도메인 예시 하나(투자의 Sharpe Ratio = 위험 대비 수익, 신용의 한도 사용률)를 들면 설득력이 높다.
