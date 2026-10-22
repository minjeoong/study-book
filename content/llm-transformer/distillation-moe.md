---
title: "Knowledge Distillation과 MoE"
en: "Knowledge Distillation, Mixture of Experts"
summary: "거대 모델의 비용 문제를 푸는 두 방법 — 작은 모델로 능력을 옮기는 증류, 필요한 전문가만 켜는 MoE"
importance: 3
order: 14
tags:
  - Distillation
  - MoE
  - DeepSeek
  - 경량화
keypoints:
  - "증류 = Teacher의 답변·추론 과정으로 작은 Student를 학습"
  - "Soft Label은 클래스 간 유사성까지 담아 일반화에 유리"
  - "MoE는 Router가 토큰마다 Top-n Expert만 활성화"
qa:
  - q: "Knowledge Distillation이란? Soft Label을 쓰는 이유는?"
    a: "성능 좋은 큰 Teacher 모델이 만든 답변과 추론 과정으로 작은 Student 모델을 학습시켜 비슷한 성능을 내게 하는 기법이다. 정답만 1로 표시하는 Hard Label과 달리 Soft Label은 '고양이 0.7, 개 0.2'처럼 클래스 간 유사성 정보를 담아 Student의 일반화 성능과 학습 안정성을 높인다. DeepSeek-R1은 자신이 생성한 추론 데이터로 1.5B~32B 크기의 오픈 모델들을 증류했다."
  - q: "MoE(Mixture of Experts)는 어떻게 동작하고 장점은?"
    a: "Transformer 블록의 FFN 자리에 여러 Expert와 Router(게이팅 네트워크)를 둔다. Router가 입력 토큰마다 각 Expert 점수를 계산하고 Softmax로 확률화해 상위 n개 Expert만 활성화한 뒤 출력을 가중합한다. 전체 파라미터는 크지만 토큰당 일부만 계산하므로 비용이 줄어든다. 예를 들어 DeepSeek-R1은 671B 중 37B만 활성화된다."
related:
  - scaling-law
  - transformer-architecture
source: "Day2 슬라이드 p.57–64"
---

```compare
Knowledge Distillation | MoE (Mixture of Experts)
목표 | 작은 모델로 큰 모델 수준 성능 | 큰 모델을 적은 연산으로 실행
방법 | Teacher의 답변·추론 데이터로 Student 학습 | Router가 토큰별 Top-n Expert 선택
결과 | 모델 자체가 작아짐 | 전체 파라미터는 크고 활성은 일부
예시 | DeepSeek-R1 → 1.5B~32B Student | DeepSeek-R1 671B (활성 37B), Mixtral
```

```formula
Score = x · W_r :: Router(선형층)가 Expert별 점수 계산, Router도 학습 대상
Pᵢ = e^sᵢ ÷ Σⱼ e^sⱼ :: Softmax로 Expert 선택 확률, 상위 n개만 활성화
```

| 구분 | Hard Label | Soft Label |
|---|---|---|
| 형태 | One-hot 확정 레이블 | 모델이 예측한 확률 분포 |
| 예 | 고양이 = 1, 개 = 0 | 고양이 = 0.7, 개 = 0.2, 여우 = 0.1 |
| 정보량 | 정답만, 낮음 | 클래스 간 유사성 포함, 높음 |

> [!warn] 증류는 단순 압축이 아님
> 정답만이 아니라 "생각하는 방법(추론 과정)"까지 Teacher에서 Student로 전달하는 것. Expert 전문화도 처음엔 모두 같다가, Router가 비슷한 토큰을 같은 Expert로 반복해 보내면서 생김.
