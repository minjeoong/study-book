---
title: Sampling Controls와 출력 제어 파라미터
en: Temperature, Top-k, Top-p, reasoning.effort
summary: "다음 토큰을 고르는 방식을 정하는 설정 — Temperature는 무작위성, Top-k/Top-p는 후보군, Max tokens는 길이"
importance: 3
order: 5
tags:
  - LLM
  - 파라미터
keypoints:
  - "Temperature 0 = Greedy(최고 확률만), 높을수록 분포가 평평해져 창의적"
  - "Top-k·Top-p·Min-p로 후보를 거른 뒤 Temperature 적용 후 샘플링"
  - "GPT-5.x: reasoning.effort는 추론 깊이, verbosity는 답변 상세도"
qa:
  - q: "Temperature, Top-k, Top-p의 차이는?"
    a: "Temperature는 확률 분포를 날카롭게 또는 평평하게 만들어 토큰 선택의 무작위성을 조절한다. Top-k는 확률 상위 k개 토큰만 후보로 남기고, Top-p는 누적 확률이 p를 넘지 않는 상위 토큰만 남긴다. 둘을 같이 쓰면 둘 다 통과한 토큰에 Temperature를 적용하고 그 안에서 확률적으로 샘플링한다."
  - q: "사실 기반 답변과 창의적 답변에서 Temperature를 어떻게 설정하나?"
    a: "범위 0~2 기준으로 사실적인 응답은 0.2~0.4, 창의적인 응답은 1.6~1.8 정도를 쓴다. 0에 가까우면 항상 최고 확률 토큰을 고르는 Greedy decoding이 되어 수학 문제처럼 정답이 하나인 과제에 맞다. 너무 높이면 의미 없는 다국어 문자열이 섞일 정도로 출력이 무너질 수 있다."
  - q: "reasoning.effort와 Temperature는 무엇이 다른가?"
    a: "reasoning.effort는 최종 답변 전에 내부 추론을 얼마나 깊이 할지(none~xhigh), Temperature는 얼마나 다양하게 표현하고 선택할지를 정한다. 문제마다 필요한 추론량이 다른데 모든 질문을 최고 수준으로 추론하는 건 비효율적이라 생긴 옵션이다. 깊게 분석하면서도 일관된 답을 원하면 Reasoning Effort=High, Temperature=0처럼 조합한다."
related:
  - token
  - llm-hallucination
  - chain-of-thought
source: 슬라이드 p.35–46, p.84–85, 실습 TODO 1
---

```flow
후보 확률 계산 :: 사전학습된 분포 (Roof 0.5, School 0.03, Chair 0.02 ...)
후보 거르기 :: Top-k, Top-p, Min-p — 설정한 기준을 모두 통과한 토큰만
Temperature 적용 :: 낮으면 분포가 뾰족(사실적), 높으면 평평(창의적)
샘플링 :: 확률 기반 선택, Temperature 최소면 Greedy decoding
Max tokens 도달 시 중단 :: 생성 토큰 수 상한
```

| 파라미터 | 역할 | 값 해석 |
| --- | --- | --- |
| Temperature | 선택의 무작위성 | 0~2. 사실 0.2~0.4, 창의 1.6~1.8 |
| Top-k | 상위 k개 토큰만 후보 | 클수록 창의적, 작을수록 사실적 |
| Top-p | 누적 확률 p 이내 상위 토큰 | 0이면 최고 확률 1개, 1이면 어휘 전체 |
| Min-p | 너무 낮은 확률 토큰 제거 | 0.01이면 1% 미만 제거 |
| Max tokens | 생성 토큰 수 상한 | 줄여도 문체가 간결해지지 않고 그냥 끊김 → 길이에 맞는 프롬프트 필요 |
| reasoning.effort | 답변 전 내부 추론 깊이 (GPT-5.x) | none / minimal / low / medium / high / xhigh |
| verbosity | 답변 상세도 (GPT-5.x) | low 핵심만 / medium 근거 포함 / high 배경·예시까지 |

> [!warn] 프롬프트로 "temperature=0.2로 해라"는 안 통함
> Temperature는 API 파라미터라 프롬프트 안에서 직접 제어할 수 없다. 대신 "확정된 사실만, 모호한 표현 금지, 결과는 재현 가능해야 한다"처럼 **출력 성격을 규정하는 문장**으로 쓰는 것이 안정적이다.

> [!tip] Temperature와 Hallucination (2024.05 논문)
> "높은 온도 = Hallucination"으로 알려져 있지만, 온도는 참신성과 약한 상관, 불일치성과 적당한 상관만 있었고 응집성·전형성과는 무관했다. 온도를 올려도 의미적·어휘적 다양성이 크게 늘지는 않는다.
