---
title: "Full Fine-Tuning vs PEFT"
en: "Parameter-Efficient Fine-Tuning"
summary: "원본 가중치는 동결하고 극히 일부 파라미터만 추가로 학습해, 적은 비용으로 모델을 특화하는 파인튜닝 방식"
importance: 3
order: 4
tags: [PEFT, LoRA, Adapter, Prompt Tuning, Catastrophic Forgetting]
keypoints:
  - "Full FT는 비용이 크고 기존 지식을 잃는 Catastrophic Forgetting 위험"
  - "PEFT 4종 — LoRA(병렬), Adapter(직렬), Prefix, Prompt Tuning"
  - "도메인 지식 주입은 LoRA, 극소 자원 On-Device는 Prompt Tuning"
qa:
  - q: "Full Fine-Tuning 대신 PEFT를 쓰는 이유는?"
    a: "Full Fine-Tuning은 전체 파라미터와 옵티마이저 상태까지 메모리에 올려야 해 비용이 크고, 새 지식을 얻는 대신 기존 일반 지식을 잃는 Catastrophic Forgetting 위험이 있다. PEFT는 원본을 동결하고 작은 파라미터만 학습해 메모리·저장 비용이 작고 원본 능력도 보존된다. 결과물도 전체 모델이 아니라 작은 어댑터라 용도별로 갈아 끼울 수 있다."
  - q: "LoRA와 Prompt Tuning은 각각 무엇을 학습하나?"
    a: "LoRA는 지정한 Linear 층 옆에 저랭크 행렬 A·B를 병렬로 붙여 가중치 변화량을 학습하고, 슬라이드 예시로 1.3B 중 4.2M(0.32%)이 학습 대상이다. Prompt Tuning은 모델 가중치는 그대로 두고 입력 앞에 붙는 가상 토큰 임베딩 20개 정도만 학습해 20K(0.0015%) 수준이다. 그래서 도메인 지식을 깊게 넣을 땐 LoRA, 저장·연산이 극도로 제한된 On-Device에는 Prompt Tuning이 맞다."
related: [fine-tuning-objectives, lora, quantization-qlora, sllm-three-axes]
source: "Day1(8/28) 슬라이드 p.23–28, 가이드1 2장, 가이드3 들어가는 말"
---

```compare
Full Fine-Tuning | LoRA | Prompt Tuning
학습 대상 | 전체 가중치 | Linear 층 옆 저랭크 A·B | 입력 앞 가상 토큰 임베딩
학습 비율 (1.3B 예시) | 100% | 0.32% (4.2M) | 0.0015% (20K)
원본 가중치 | 덮어씀 | 동결 | 동결
결과물 | 모델 전체 | 어댑터 파일 | Prompt Embedding
적합 상황 | 자원 충분, 대규모 변화 | 도메인 지식 주입 | 극소 자원 On-Device
```

| PEFT 기법 | 가이드1 비유 (공장) | 붙는 방식 |
|---|---|---|
| LoRA | 핵심 기계 옆 병렬 우회 보정 장치 | Linear 층과 병렬, 추론 시 원본에 병합도 가능 |
| Adapter | 작업 라인 중간의 직렬 보정 스테이션 | 레이어 사이에 작은 모듈 삽입 |
| Prefix-Tuning | 모든 라인 작업반장에게 쥐여준 메모 | 각 층에 학습 가능한 prefix |
| Prompt-Tuning | 정문에 붙인 오늘의 작업 지시서 | 입력 앞 virtual token만 학습 (가장 가벼움) |

> [!tip] 시나리오별 기법 매핑 (p.24)
> HR 문서 요약처럼 도메인 지식 주입 → LoRA / Adapter, On-Device 극소 자원 → Prompt / Prefix Tuning, 복잡 QA의 지시 이해 → Instruction Tuning + LoRA. 실무에서는 LoRA(및 QLoRA)가 사실상 표준.
