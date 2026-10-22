---
title: 변수 변환 (로그 변환)
en: Variable Transformation (Log, Box-Cox, Yeo-Johnson)
summary: 정보와 순서는 유지하면서 표현 방식을 바꿔 치우친 분포를 대칭으로, 비선형 관계를 선형에 가깝게 만드는 전처리
importance: 2
order: 8
tags: [로그변환, log1p, Box-Cox, Yeo-Johnson, 왜도]
keypoints:
  - 효과는 왜도 감소, 극단값 영향 완화, 선형성 개선, 분산 안정화
  - 로그는 큰 값을 강하게 압축하고 절대 차이를 배수 차이로 바꾼다 (10배 증가 → log₁₀ 1 증가)
  - 0이 있으면 log1p = log(x + 1), 음수가 있으면 Yeo-Johnson, 해석은 원래 단위가 아닌 로그 스케일
qa:
  - q: 로그 변환은 왜, 언제 하나요?
    a: "소득, 집값, 면적처럼 오른쪽 꼬리가 길고 값의 범위가 넓은 변수에 씁니다. 큰 값이 압축되어 왜도가 줄고 이상치의 영향이 작아지며, 곡선 관계가 직선에 가까워져 선형회귀의 가정에 잘 맞고 해석력과 예측 성능이 좋아집니다. 극단값을 제거하는 것이 아니라 상대적인 영향력만 줄이는 방법입니다."
  - q: 0이나 음수가 있는 변수는 어떻게 변환하나요?
    a: "로그는 양수에서만 정의되므로 0이 섞인 데이터는 실무에서 log(x + 1)인 np.log1p를 씁니다. 음수까지 있으면 Box-Cox를 음수로 확장한 Yeo-Johnson 변환을 쓰고, Box-Cox는 양수 데이터에서 최적의 λ를 추정해 적절한 변환을 찾아 줍니다. 횟수 같은 count 데이터는 로그보다 완만한 제곱근 변환도 씁니다."
  - q: Target에 로그를 씌워 학습하면 평가는 어떻게 하나요?
    a: "모델은 log1p(y)를 예측하므로 expm1로 원래 단위로 되돌린 뒤 MAE, RMSE를 계산해야 Baseline과 공정하게 비교됩니다. sklearn의 TransformedTargetRegressor(func=np.log1p, inverse_func=np.expm1)를 쓰면 이 과정을 자동으로 처리합니다. 실습 Ames의 SalePrice는 왜도 1.74에서 log1p 후 약 0으로 대칭에 가까워졌습니다."
related: [outlier-detection, feature-scaling, data-stats/skewness-kurtosis, data-stats/regression-assumptions]
source: 9/14 슬라이드 p.53–57 (Variable Transformation 개념, Why · Effects, Logarithm, Log Transformation, 유의점, Other Transformation Options), 실습 1 7–8번 (SalePrice 분포, 왜도), 실습 2 10번 (log1p, log_target)
---

```flow
큰 값 압축 :: 1,000,000 → 6, 1,000 → 3 (log₁₀)
왜도 감소 :: 오른쪽 꼬리가 줄어 대칭에 가까워짐
이상치 영향 감소 :: 제거 없이 상대적 영향력만 축소
선형성 개선 :: 곡선 관계가 직선에 가까워짐
예측 성능·해석력 향상 :: 오차의 퍼짐도 일정해짐 (분산 안정화)
```

| 변환 | 언제 | 효과 |
| --- | --- | --- |
| Log | 오른쪽 꼬리가 길고 값의 범위가 넓을 때 | 큰 값을 강하게 압축 |
| Square Root | 횟수·건수 같은 Count 데이터 | 로그보다 완만하게 압축 |
| Box-Cox | 양수 데이터에 적절한 변환을 탐색할 때 | 최적의 λ 추정 |
| Yeo-Johnson | 0이나 음수가 포함된 데이터 | Box-Cox를 음수까지 확장 |

> [!warn] 헷갈리기 쉬움
> 0이 아주 많은 변수(실습 Total_Bsmt_SF는 지하실 없는 집 79채가 0)에 log1p를 씌우면 0이 왼쪽 끝에 몰려 오히려 강한 왼쪽 왜도가 생긴다. 이런 변수는 '지하실 있음' 플래그와 면적을 나누는 편이 낫다. 로그변환은 분포 모양을, 스케일링은 크기를 조정하는 것으로 역할이 다르다.
