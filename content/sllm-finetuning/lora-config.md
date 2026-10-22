---
title: "LoRA 설정과 파라미터 계산"
en: "LoRA rank, alpha, target_modules"
summary: "어디에 붙일지(target_modules)와 얼마나 크게 만들지(r)가 학습 파라미터 수·용량·메모리를 정한다"
importance: 3
order: 6
tags: [LoRA, rank, target_modules, GQA, Qwen2.5]
keypoints:
  - "결정할 것은 두 가지 — target_modules(범위)와 r(깊이)"
  - "A·B 모양은 붙는 Linear 층 W를 따라감 (GQA면 k·v 출력은 256)"
  - "q_proj 하나를 지정해도 28개 층 전부에 각각 독립 A·B가 붙음"
qa:
  - q: "Qwen2.5-1.5B에 LoRA(q_proj·v_proj, r=8)를 붙이면 학습 파라미터는 몇 개인가?"
    a: "1,089,536개로 전체의 0.07%다. q_proj는 A가 8×1536, B가 1536×8이라 층당 24,576개이고, v_proj는 B가 256×8이라 14,336개다. v_proj 출력이 256인 이유는 Key/Value 헤드가 2개(2×128)인 GQA 구조이기 때문이다. 층당 38,912개 × 28개 층이 정확히 1,089,536개다."
  - q: "r과 target_modules는 어떻게 정하나?"
    a: "r을 2배로 올리면 A·B가 r에 비례하므로 학습 파라미터도 정확히 2배가 되고 표현 용량이 커진다. target_modules는 실습 워밍업에선 q·v만 붙여 원리를 보고, 실제 SFT에선 Attention 4개 + MLP 3개로 넓혀 18,464,768개(1.18%)를 학습했다. 다만 r·모듈·학습률은 검증된 범위에서 고르면 차이가 크지 않고, 결과 품질은 데이터를 어떻게 설계하느냐가 더 크게 좌우한다."
  - q: "용도별 LoRA 어댑터를 여러 개 동시에 얹어 쓸 수 있나?"
    a: "이미지 생성 모델에선 인물·배경 스타일 LoRA를 가중 합성하는 방식이 흔하지만, 언어모델은 서로 다른 문체·규칙을 배운 어댑터가 문장 단위로 충돌(간섭)해 답이 뒤섞이기 쉽다. 그래서 실전에서는 여러 목적을 하나의 데이터셋으로 합쳐 한 어댑터로 학습하는 쪽을 선호한다. Base 하나에 어댑터를 상황에 따라 갈아 끼우는 건 가능하다."
related: [lora, sft-training, inference-optimization, llm-transformer/multi-head-attention]
source: "가이드3 Q6–Q12·Q14–Q16, Day1(8/28) 슬라이드 p.43, Day1·Day2 서브노트 (파라미터 비교, 어댑터 파일 분석)"
---

```formula
q_proj 층당: 8×1536 + 1536×8 = 24,576 :: hidden 1536 → 1536
v_proj 층당: 8×1536 + 256×8 = 14,336 :: GQA, KV 헤드 2개 × 128 = 256
(24,576 + 14,336) × 28층 = 1,089,536 :: print_trainable_parameters 값과 일치
```

| 설정 (Qwen2.5-1.5B) | target_modules | r | 학습 파라미터 | 비율 | 어댑터 (FP32) |
|---|---|---|---|---|---|
| 워밍업 노트북 | q, v | 8 | 1,089,536 | 0.071% | 4.2 MB |
| rank만 4 | q, v | 4 | 544,768 | 0.035% | 2.1 MB |
| rank만 16 | q, v | 16 | 2,179,072 | 0.141% | 8.3 MB |
| Attention 전체 | q, k, v, o | 8 | 2,179,072 | 0.141% | 8.3 MB |
| `train_lora.py` 실제 | q, k, v, o + gate, up, down | 16 | 18,464,768 | 1.18% | 70.4 MB |

> [!tip] 모듈마다 비용이 다르다
> MLP는 intermediate 8960 차원이라 gate·up·down 3개가 어댑터의 76.4%를 차지하고 Attention 4개는 23.6%뿐. 같은 예산(2,179,072)이라도 "q·v를 r=16으로 깊게"와 "q·k·v·o를 r=8로 넓게"는 다른 선택이며, 파라미터 수만으로 우열을 말할 수 없음.
