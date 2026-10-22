---
title: "LoRA"
en: "Low-Rank Adaptation"
summary: "원본 가중치 W는 동결하고, 옆에 작은 저랭크 행렬 B·A를 병렬로 붙여 그 변화량만 학습하는 PEFT 기법"
importance: 3
order: 5
tags: [LoRA, PEFT, 저랭크 가설, Adapter]
keypoints:
  - "출력 = W·x + B·A·x — W는 Frozen, A·B만 Trainable"
  - "근거는 저랭크 가설 — 파인튜닝 변화량 ΔW는 몇 개 방향이면 충분"
  - "A는 작은 무작위, B는 0으로 초기화 → 시작 시 Base와 출력 동일"
qa:
  - q: "LoRA의 동작 원리를 설명해 달라."
    a: "Linear 층의 원래 가중치 W는 동결하고, 같은 입력을 받는 좁은 우회 경로로 r×k 행렬 A와 d×r 행렬 B를 붙인다. 두 경로의 출력을 더하므로 B·A가 가중치 변화량 ΔW 역할을 하고, 학습은 A·B만 갱신한다. 1536×1536 층이면 236만 개 대신 r=8 기준 약 2.5만 개만 학습하면 된다. 이게 가능한 근거는 파인튜닝에 필요한 변화가 원본보다 훨씬 단순하다는 저랭크 가설이다."
  - q: "B를 0으로 초기화하는 이유는?"
    a: "B가 0이면 B·A도 0이라 어댑터를 붙인 직후의 모델 출력이 Base와 완전히 같다. 어댑터를 붙였다는 이유만으로 성능이 망가지지 않고, 변화량이 0에서부터 학습 데이터에 맞게 쌓인다. A까지 0이면 기울기가 흐르지 않으므로 A는 작은 무작위 값으로 둔다."
  - q: "LoRA는 15억 개 파라미터 중 일부를 골라 학습하는 건가?"
    a: "아니다. 기존 15억 개는 전부 동결하고 새 파라미터를 추가로 얹는 방식이다. 실습에서 전체 파라미터는 1,543,714,304개에서 1,544,803,840개로 오히려 늘었고, 늘어난 1,089,536개가 정확히 학습 대상 수와 같았다. 효율적이라는 건 모델이 작아진다는 뜻이 아니라 역전파할 대상이 줄어든다는 뜻이다."
related: [peft-overview, lora-config, quantization-qlora, llm-transformer/multi-head-attention]
source: "가이드3 Q1–Q5·Q11·Q13, Day1(8/28) 슬라이드 p.25, Day1 노트북 peft_lora_parameter_compare"
---

```formula
출력 = W·x + (α / r)·B·A·x :: W는 동결, B·A가 학습된 변화량 ΔW (α/r은 반영 세기)
A: r×k, B: d×r, rank(B·A) ≤ r :: 큰 변화량을 홀쭉한 두 행렬의 곱으로 근사
d·k → r·(d + k) :: 1536×1536 = 2,359,296개 → r=8이면 24,576개만 학습
```

```flow
붙이기 :: get_peft_model — target_modules와 r로 A·B의 모양·개수 즉시 확정 (구조)
초기화 :: A 무작위, B = 0 → B·A = 0, Base와 출력 동일
학습 :: forward → loss → backward → optimizer step, A·B 값만 갱신
저장 :: adapter_config.json + adapter_model.safetensors (Base 미포함)
사용 :: Base + Adapter = Fine-tuned, 필요하면 W에 병합
```

> [!warn] 구조 생성과 값 학습은 다른 시점
> `print_trainable_parameters()`가 붙이자마자 숫자를 보여주는 건 "빈 트레이싱지의 크기(슬롯 수)"를 센 것. 그 위에 의미 있는 보정선(A·B 값)이 그려지는 건 학습 루프를 돌 때다. 같은 Base·설정이라도 시드·데이터 순서·정밀도가 다르면 학습된 값은 달라짐.
