---
title: SVM과 커널
en: Support Vector Machine, Kernel, Soft Margin
summary: "두 그룹 사이 경계(margin)가 가장 넓은 선형식을 찾고, 선형으로 안 나뉘면 커널로 특징 공간을 바꿔 나누는 분류기"
importance: 2
order: 4
tags: [SVM, Kernel, Margin, RBF, C, gamma]
keypoints:
  - "Maximum Margin — 그룹 간 경계가 가장 큰 선형식을 찾음"
  - "Kernel — 선형 분리가 안 되면 feature space를 변형해 분리 (2D 원형 → 3D 평면)"
  - "C는 오분류 벌점, gamma는 거리 민감도 — 크면 과적합, 작으면 과소적합"
qa:
  - q: "SVM의 C와 gamma는 무엇을 조절하나요?"
    a: "C는 오분류에 얼마나 벌점을 줄지 정하는 규제 파라미터로, 크면 오분류를 줄이려고 마진이 좁아져 과적합 위험이 커지고 작으면 일부 오분류를 허용하며 마진을 넓혀 과소적합될 수 있습니다. gamma는 RBF 커널에서 두 샘플 사이 거리에 얼마나 민감하게 반응할지를 정해 경계의 복잡도를 조절하고, 클수록 경계가 구불구불해져 과적합됩니다. 두 값을 함께 조절해 최적화합니다."
  - q: "커널은 왜 쓰나요?"
    a: "원형으로 섞인 데이터처럼 원래 공간에서 직선으로 나눌 수 없을 때, 커널 함수로 데이터를 더 높은 차원의 특징 공간에 옮기면 평면 하나로 나눌 수 있습니다. 커널은 두 개체 사이의 관계(유사도)를 나타내는 함수라, 좌표를 직접 변환하지 않고 그 공간의 내적만 계산해 비용을 줄입니다. 표본은 수백 개인데 변수는 수천 개이고 비선형 경계가 필요한 문제에서 SVM을 우선 고려합니다."
related: [overfitting-regularization, ensemble-boosting]
source: "Day1 슬라이드 p.56–58 (SVM #kernel #margin, Kernel·Feature Space·Decision Surface, 모델 복잡도 gamma·C), TODAY QUIZ Q6 p.69"
---

```flow
선형 분류 :: 두 그룹을 나누는 직선부터 찾음
Maximum Margin :: 그룹 간 경계가 가장 큰 선형식 선택
Kernel :: 선형 분리 불가면 특징 공간 변형 (2D → 3D)
Soft Margin :: 경계는 크게, 분류 오류는 작게 타협
```

```compare
값이 클 때 | 값이 작을 때
C (Cost) | 오분류 최소화, 마진 좁음 → 과적합 | 마진 넓음, 일부 오분류 허용 → 과소적합
gamma | 거리에 민감, 경계 복잡 → 과적합 | 경계 완만 → 과소적합
```

```python
from sklearn.svm import SVC

svm = SVC(kernel="rbf", random_state=1, gamma=0.008, C=0.1)
svm.fit(X_train_std, y_train)   # 거리 기반이라 표준화한 입력 사용
```

> [!tip] 용어
> Kernel은 독일어 Kern(core, essence)에서 유래 — 수학에서는 두 개체 사이의 관계나 핵심을 나타내는 함수.
