---
title: "sLLM 성능·효율 최적화 3축"
en: "Model Tuning, Context & Reasoning, Inference Optimization"
summary: "같은 오픈 모델이라도 결과를 가르는 세 가지 설계 축 — 파라미터 학습, 맥락 처리(Context & Reasoning), 추론 효율화"
importance: 2
order: 11
tags: [sLLM, PEFT 트렌드, DoRA, Context & Reasoning, Inference Optimization]
keypoints:
  - "① 모델 성능 향상 — LoRA·QLoRA·DoRA로 정확성 자체를 올림"
  - "② Context & Reasoning — RAG·Prompt Compression·Long-Context"
  - "③ 추론 효율화 — Quantization·MoE·Speculative Decoding·KV Cache"
qa:
  - q: "같은 Open Weight sLLM에 같은 파인튜닝을 해도 팀마다 성능이 크게 다른 이유는?"
    a: "차이를 만드는 건 모델 자체가 아니라 방법론이기 때문이다. 어떤 파라미터를 얼마나 학습시키는지, 맥락을 어떻게 압축·제시해 이해시키는지, 얼마나 효율적으로 추론하는지의 설계가 다르다. 세 축은 배타적이지 않아서 실전에선 LoRA + 맥락 압축 + Quantization을 동시에 조합하는 경우가 많다."
  - q: "PEFT 기법은 어떻게 발전해 왔나?"
    a: "2019년 Adapter가 레이어 사이에 작은 모듈을 넣는 방식으로 시작했고, 2021년 LoRA가 저랭크 행렬로 가중치 변화량만 학습하는 방식으로 표준이 됐다. 2023년 QLoRA는 4비트 양자화와 LoRA를 결합해 메모리 제약을 풀었고, 2024년 DoRA는 가중치를 크기와 방향으로 분리해 LoRA보다 표현력을 높였다. 대부분 LoRA 구조를 확장한 형태라 LoRA를 정확히 이해하면 파생 기법도 쉽게 이해된다."
related: [peft-overview, rag-vs-finetuning, sllm-service-pipeline, inference-optimization]
source: "Day2(8/31) 슬라이드 p.52–55, p.75, p.77, p.96"
---

```layers
① 모델 성능 향상 (파라미터 학습) :: 정확성을 어떻게 높이나? — Adapter → LoRA → QLoRA → DoRA
② Context & Reasoning (맥락 처리) :: 맥락을 어떻게 이해시키나? — RAG 압축, Prompt Compression(LLMLingua), 요약 압축, Long-Context
③ 추론 효율화 (Inference Optimization) :: 어떻게 더 빠르고 싸게? — Quantization, MoE, Speculative Decoding, KV Cache
```

| 기법 (SOTA 패턴표) | 핵심 아이디어 | 현장 적용 상황 |
|---|---|---|
| QLoRA | 4비트 양자화 + LoRA | 메모리 제약 환경에서 큰 모델 파인튜닝 |
| DoRA | 가중치 크기·방향 분리 학습 | LoRA보다 높은 표현력이 필요할 때 |
| Prompt Compression | 중요도 기반 토큰 제거 | 긴 문서를 짧은 컨텍스트로 압축 |
| Instruction Tuning | 지시-응답 쌍 학습 | 응답 스타일·형식을 사내 기준에 정렬 |

> [!tip] 과정의 결론 (p.96)
> sLLM은 도메인 버티컬 지식 주입에 특화된 서비스이며, 세 축을 함께 설계해야 성능이 나옴. 이 성능을 사람이 매번 감시·재학습할 수는 없으므로 Agentic AI가 성능 저하를 감지·대응하는 AIOps 체계로 이어짐.
