---
title: 과적합과 규제 (L1·L2)
en: Overfitting, Regularization, LASSO, Ridge
summary: "학습 데이터의 노이즈까지 외워 새 데이터 성능이 떨어지는 과적합을, 파라미터에 패널티를 줘 모델 복잡도를 제한하는 규제로 완화"
importance: 3
order: 5
tags: [Overfitting, Regularization, LASSO, Ridge, L1, L2, 일반화]
keypoints:
  - "과적합은 예외가 아니라 ML 구조상 늘 생김 → Train·Valid·Test 성능 비교 필수"
  - "L1(LASSO) = |w| 합 패널티, 일부 계수를 0으로 → 변수 선택"
  - "L2(Ridge) = w² 합 패널티, 모든 계수를 0 근처로 수축 → 다중공선성 완화"
qa:
  - q: "과적합은 언제 생기고 어떻게 확인하나요?"
    a: "학습 데이터의 노이즈나 특수 패턴까지 학습해 test나 실서비스에서 성능이 떨어지는 현상으로, 모의고사 답을 외워 100점을 받고 수능에서 50점을 받는 것과 같습니다. 깊은 트리나 파라미터가 많은 복잡한 모델, 적은 학습 데이터, 많은 Feature, 많은 노이즈에서 잘 생깁니다. Train 성능은 계속 오르는데 Valid 성능이 정체되거나 떨어지면 과적합 신호입니다."
  - q: "L1과 L2 규제의 차이는?"
    a: "L1(LASSO)은 가중치 절댓값 합에 패널티를 줘 중요하지 않은 계수를 정확히 0으로 만들기 때문에 변수 선택 효과가 있고, 해석 가능한 간결한 모델이 필요할 때 씁니다. L2(Ridge)는 가중치 제곱합에 패널티를 줘 모든 계수를 0 근처로 고르게 줄이므로 변수를 모두 쓰면서 다중공선성을 완화하고 싶을 때 씁니다. 발표 자료 30장을 5장으로 줄일 때 필요 없는 장을 삭제하면 L1, 모든 장을 조금씩 줄이면 L2입니다."
related: [svm-kernel, batch-dropout-batchnorm, data-stats/regression-assumptions]
source: "Day1 슬라이드 p.52 (Overfitting), p.59–61 (Regularization, L1/L2 쉽게 이해하기, LASSO·Ridge), TODAY QUIZ Q7 p.70"
---

```formula
Loss = MSE + α · Σ|wᵢ| :: L1 (LASSO), 작은 계수는 0으로. alpha 0.1 정도부터 조심스럽게
Loss = MSE + α · Σwᵢ² :: L2 (Ridge), 계수를 0 근처로 수축. alpha 1.0 정도부터
```

```compare
정상적인 학습 | Overfitting
학습 대상 | 데이터의 본질적 패턴 | 노이즈·특수 상황까지
모델 복잡도 | 적절, 규칙적 구조 | 과도하게 복잡
검증 성능 | 안정적 유지 | 낮거나 안정적으로 유지되지 못함
```

| 규제 방법 | 원리 | 수업 |
| --- | --- | --- |
| L2 (Ridge) | 가중치 제곱합 패널티 → 큰 가중치 억제 | Day1 |
| L1 (LASSO) | 가중치 절댓값 합 패널티 → 일부 0 (변수 선택) | Day1 |
| Dropout | 학습 중 뉴런 무작위 비활성화 | Day2, 실습 11 |
| Batch Normalization | 층 입력 정규화, 부수적 규제 효과 | Day2, 실습 12 |
| Early Stopping | valid loss가 개선 안 되면 학습 중단 | 보조 교재, 실습 11 |

> [!tip] TODAY QUIZ Q7
> 변수가 수백 개, 대체로 선형, 진짜 중요한 변수만 남긴 간결하고 해석 가능한 모델 → LASSO. 다중공선성이 걱정되거나 변수를 모두 쓰고 싶으면 Ridge.
