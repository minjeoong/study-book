---
title: "RLHF"
en: "Reinforcement Learning from Human Feedback"
summary: "사람의 선호 피드백으로 보상 모델을 만들고 강화학습해 LLM을 사람 의도에 맞게 정렬하는 기법"
importance: 3
order: 12
tags:
  - RLHF
  - Alignment
  - Fine-tuning
  - PPO
keypoints:
  - "사전학습만 한 LLM은 지식은 많지만 사람이 원하는 답을 모름"
  - "SFT → Reward Model → 강화학습(PPO) 3단계로 정렬"
  - "부작용 — Reward Hacking, 아첨(sycophancy), 평가자 편향"
qa:
  - q: "RLHF의 3단계를 설명해 달라."
    a: "먼저 사람이 작성한 모범 답변으로 지도학습 파인튜닝(SFT)을 한다. 다음으로 한 질문에 대한 여러 답변을 사람이 순위 매긴 선호 데이터로, 답변 점수를 예측하는 Reward Model을 학습한다. 마지막으로 LLM이 답변을 만들면 Reward Model이 점수를 주고, 그 보상을 최대화하도록 PPO 같은 강화학습으로 정책(LLM)을 업데이트한다."
  - q: "RLHF의 한계는?"
    a: "모델이 실제로 좋은 답보다 보상을 잘 받는 말투를 학습하는 Reward Hacking이 생기고, 무난하고 안전한 답만 하며 다양성이 줄 수 있다. 2025년 GPT-4o 업데이트 후 사용자에게 지나치게 맞장구친 아첨 문제가 대표 사례다. 또 사람마다 선호가 달라 Reward Model에 편향이 들어가고, 사람 라벨링 비용이 크다."
related:
  - transfer-learning
  - scaling-law
source: "Day2 슬라이드 p.44–51"
---

```flow
SFT :: 모범 답변으로 지도학습
선호 데이터 :: 한 질문의 여러 답변을 사람이 순위 매김
Reward Model :: 사람의 선호를 점수로 예측
강화학습 (PPO) :: 답변 생성 → 보상 점수 → 정책 업데이트 반복
```

```compare
사전학습만 한 LLM | RLHF 적용 LLM
목표 | 다음 단어를 잘 예측 | 사람이 더 선호하는 답변 생성
"리스트 뒤집는 법?" | reverse()를 쓰면 됩니다. | reverse()는 원본 변경, 슬라이싱은 새 리스트 생성 — 상황에 맞게 선택
문제점 | 무례·장황·의도를 벗어난 답 | Reward Hacking, 지나친 아첨
```

> [!warn] 아첨(sycophancy)은 RLHF의 부작용
> "친근하고 기꺼이 돕는" 답변을 보상한 결과, "모니터를 발로 차다니 멋져요" 식의 과잉 칭찬이 나옴. 2025.04 OpenAI가 GPT-4o 업데이트를 수정함.
