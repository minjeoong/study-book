---
title: "추론 효율화: Speculative Decoding · KV Cache · MoE"
en: "Inference Optimization"
summary: "모델의 연산·구조를 손봐 같은 품질의 답을 더 빠르고 싸게 내는 기법 — 양자화, MoE, Speculative Decoding, KV Cache 최적화"
importance: 2
order: 14
tags: [Inference Optimization, Speculative Decoding, KV Cache, GQA, PagedAttention, MoE]
keypoints:
  - "Speculative Decoding — 작은 Draft가 여러 토큰 제안, 큰 Target이 한 번에 검증"
  - "KV Cache는 이전 토큰 K·V 재사용, 길이에 비례해 메모리 병목"
  - "PagedAttention·MQA·GQA로 캐시 관리·크기 축소 (Qwen2.5는 GQA)"
qa:
  - q: "Speculative Decoding의 원리와 품질이 유지되는 이유는?"
    a: "작고 빠른 Draft 모델이 다음 여러 토큰을 싸게 미리 예측하고, 크고 정확한 Target 모델이 그 후보들을 한 번의 순전파로 병렬 검증한다. 일치한 토큰은 한꺼번에 채택해 여러 토큰을 한 번에 생성한 효과를 얻고, 불일치 지점부터는 Target이 다시 생성한다. 최종 출력은 Target 기준으로 검증된 것이라 품질이 유지된다."
  - q: "KV Cache란 무엇이고 왜 최적화가 필요한가?"
    a: "Transformer는 토큰을 하나 생성할 때마다 이전 토큰들의 Key·Value를 다시 계산하지 않도록 캐시에 저장해 재사용한다. 그런데 시퀀스가 길어질수록 캐시가 선형으로 커져 메모리 병목이 된다. 그래서 캐시를 페이지 단위로 관리해 단편화를 줄이는 PagedAttention, 여러 Query가 K·V를 공유해 캐시를 줄이는 MQA, 그룹 단위로 공유하는 절충안 GQA를 쓴다."
  - q: "실습 모델에서 GQA는 어디에서 보였나?"
    a: "Qwen2.5-1.5B는 Query 헤드 12개, Key/Value 헤드 2개인 GQA 구조다. 그래서 k_proj·v_proj 출력 차원이 1536이 아니라 2 × 128 = 256이고, LoRA를 붙였을 때 v_proj의 B 행렬도 [256, r] 모양이 됐다. KV 캐시를 줄이려는 추론 효율화 설계가 파인튜닝 파라미터 수에도 영향을 준 사례다."
related: [quantization-qlora, sllm-three-axes, lora-config, llm-transformer/distillation-moe, llm-transformer/multi-head-attention]
source: "Day2(8/31) 슬라이드 p.76–81, Day1 서브노트 4장 (GQA 관찰)"
---

```flow
Draft 예측 :: 작은 모델이 다음 여러 토큰을 순차 예측 (저비용)
Target 검증 :: 큰 모델(예: Qwen2.5-1.5B)이 후보를 한 번의 순전파로 병렬 검증
일괄 채택 :: 일치한 토큰은 그대로 채택 → 여러 토큰을 한 번에 생성
재생성 :: 불일치 지점부터 Target이 다시 생성 → 품질은 Target 기준 유지
```

| KV Cache 최적화 | 핵심 아이디어 | 적합한 상황 |
|---|---|---|
| PagedAttention | 캐시를 페이지 단위로 관리해 메모리 단편화 최소화 | 긴 대화, 다중 요청 동시 처리 서빙 |
| MQA (Multi-Query) | 모든 Query가 하나의 K·V 공유, 캐시 크기 축소 | 메모리 제약이 큰 On-Device |
| GQA (Grouped-Query) | 그룹 단위로 K·V 공유 — MQA와 기존 방식의 절충 | Qwen2.5 등 최근 sLLM이 채택 |

> [!tip] 나머지 두 기법
> Quantization은 정밀도를 FP16 → INT8·INT4로 낮춰 메모리·연산을 줄임(양자화 노트). MoE는 Router가 입력마다 소수 Expert만 활성화해 큰 모델의 표현력을 유지하면서 연산을 줄이며, 최근 open-weight 모델에서 채택이 늘어나는 추세.
