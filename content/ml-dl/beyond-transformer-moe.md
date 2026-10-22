---
title: Beyond Transformer — Linear RNN과 MoE
en: Linear Recurrent Models (SSM, DeltaNet), Mixture of Experts, Kimi Linear
summary: "Transformer의 O(n²) 계산·KV cache 비용을 줄이려는 두 갈래 — RNN식 고정 상태를 병렬화한 선형 모델(효율), 필요한 전문가만 켜는 MoE(확장)"
importance: 2
order: 13
tags: [KV Cache, O(n²), SSM, Mamba, DeltaNet, MoE, Switch Transformer, Kimi Linear]
keypoints:
  - "Transformer는 과거 KV를 전부 보관해 정확(recall↑), 대신 토큰당 O(L)·메모리 누적"
  - "Linear RNN(SSM, RetNet, DeltaNet)은 고정 상태 + 병렬 학습, hₜ = hₜ₋₁ + Δ"
  - "MoE는 토큰마다 일부 Expert만 활성화 (Sparsely-Gated Top-2, Switch Top-1)"
qa:
  - q: "Transformer와 RNN의 trade-off를 설명해 주세요."
    a: "Transformer는 과거 토큰의 Key·Value를 압축 없이 모두 보관해 필요한 정보를 원본 그대로 꺼낼 수 있어 정확하지만, 토큰 하나를 생성할 때마다 전체를 다시 참조하고 메모리가 길이에 비례해 누적됩니다. RNN은 과거를 고정 크기 상태 하나로 압축해 토큰당 비용 O(1), 메모리 고정으로 빠르지만 덮어쓴 정보는 복원할 수 없습니다. 비용은 버그가 아니라 각 설계 철학의 결과이고, 최근 선형 모델은 RNN의 효율만 가져오고 손실은 줄이려는 시도입니다."
  - q: "MoE는 무엇이고 Switch Transformer는 무엇을 바꿨나요?"
    a: "MoE는 여러 전문가(Expert)와 라우터를 두고 토큰마다 일부 전문가만 계산해, 전체 파라미터는 키우면서 실제 연산량은 늘리지 않는 조건부 연산 구조입니다. 처음 제안된 Sparsely-Gated MoE는 토큰마다 Top-2 전문가를 골라 전문가 간 통신 비용이 컸고, Switch Transformer는 Top-1 라우팅으로 단순화해 통신 부담을 줄이고 1조 파라미터급까지 확장했습니다. 대신 라우팅이 한쪽으로 쏠리면 특정 전문가에 부하가 몰리므로 게이트(라우터) 학습이 중요합니다."
related: [transformer-bert, rnn-lstm, llm-transformer/distillation-moe]
source: "Day3 슬라이드 p.84–100 (Beyond Transformer, Transformer가 풀지 못한 한계, 계산량 쉽게 이해하기, 왜 RNN을 다시 보는가, 회의록 비유, Linear Recurrent Models, DeltaNet, MoE, Kimi Linear), 과정 안내 Assignment 선택 논문"
---

```compare
Transformer | RNN
과거 처리 | 원본 KV 전부 보존 (무압축) | 단일 고정 상태로 압축
토큰당 생성 비용 | O(L), 매번 전체 재참조 | O(1), 고정 상태만 참조
메모리 | 길이에 비례해 누적 | 고정
조회 정확도 (recall) | 최대, 원본 그대로 | 덮어써서 복원 불가
```

```flow
RNN :: 1번 → 2번 → … 순차 state update, 길수록 느림
SSM (S4, Mamba) :: 과거를 펼쳐 한꺼번에 계산 → 병렬 학습, 선형 비용
Chunk-wise (RetNet) :: 구간 내부는 순차, 구간끼리는 병렬
DeltaNet :: hₜ = hₜ₋₁ + Δ, 새 입력과 기억의 차이만 갱신
Kimi Linear :: KDA 3 : MLA 1 하이브리드 + MoE (2025-11)
```

| 트랙 | 전략 | 대표 |
| --- | --- | --- |
| Efficient-oriented | Attention 구조 자체를 대체해 장문 처리·계산 효율 개선 | S4, Mamba, RetNet, DeltaNet, Gated DeltaNet, Kimi Linear |
| Scaling-oriented | 파라미터는 늘리되 실제 계산량은 최소화 | Sparsely-Gated MoE, GShard, Switch Transformer, GLaM, Mixtral 8×7B, DeepSeekMoE |

> [!tip] 회의록 비유
> Transformer는 발언이 나올 때마다 지금까지의 녹취를 전부 다시 읽는다(n명 회의면 n² 참조). DeltaNet은 기존 회의록을 유지하고 달라진 부분만 고치고, Chunk-wise는 10분 단위로 나눠 여러 명이 동시에 정리한 뒤 이어 붙인다.
