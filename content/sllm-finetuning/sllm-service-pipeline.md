---
title: "sLLM 서비스 파이프라인 (RAG + 맥락 압축 + LoRA)"
en: "sLLM Service Pipeline, Context Compression, Long-Context"
summary: "질의 임베딩 → 벡터 검색 → 맥락 압축 → LoRA 적용 sLLM 생성 → FastAPI 서빙으로 이어지는 결합형 서비스 구조"
importance: 2
order: 13
tags: [Context Compression, Long-Context, YaRN, FastAPI, Qwen2.5, BGE-M3]
keypoints:
  - "RAG는 찾고, 맥락 압축은 줄이고, LoRA 모델은 도메인 방식으로 답함"
  - "압축(요약해 넣기) vs Long-Context(통째로 넣기)는 트레이드오프"
  - "어댑터는 병합하지 않고 Base + Adapter로 자동 연결 (MODEL_VARIANT=auto)"
qa:
  - q: "실습한 sLLM 서비스 아키텍처를 설명해 달라."
    a: "사용자 질의를 BGE-M3로 임베딩해 벡터DB에서 관련 청크를 검색하고(Dense+Sparse 하이브리드 가능), 검색 문서를 그대로 넣지 않고 맥락 압축으로 핵심만 추려 LoRA가 적용된 Qwen2.5-1.5B에 전달한다. CUDA에선 4bit NF4로 로드해 메모리를 줄이고, 최종 답변은 FastAPI 엔드포인트로 제공한다. RAG와 파라미터 학습이 함께 작동하는 결합형 파이프라인이다."
  - q: "Context Compression과 Long-Context 방식의 차이는?"
    a: "Context Compression은 검색된 문서를 요약하거나 중요도가 낮은 토큰을 지워(LLMLingua 계열) 짧은 컨텍스트로 만들어 넣는 방식이다. Long-Context는 YaRN 같은 RoPE 스케일링으로 컨텍스트 창을 늘려(예: 32K × 4) 문서 전체를 압축 없이 넣는다. 압축은 빠르고 싸지만 과하면 핵심 정보가 유실되고, Long-Context는 정보 손실은 적지만 비용이 크고 안정성이 모델·버전에 따라 다르다."
  - q: "PEFT 시나리오는 어떻게 도출하나?"
    a: "먼저 내부 보안, 도메인 버티컬, 둘의 결합 중 목적을 정하고, RAG용 도메인 문서와 Fine-Tuning용 학습 데이터를 구분해 확보한다. 다음으로 맥락 압축과 파라미터 학습의 비중을 정하고, 정확도·응답 속도·비용 같은 성공 기준을 미리 정의한다. 예를 들어 계약서 검토 sLLM은 긴 계약서 요약 압축 60% + 법무 용어 LoRA 40%로 배분하고 위험 조항 탐지 정확도·근거 제시·지연시간으로 검증한다."
related: [rag-vs-finetuning, sllm-three-axes, inference-optimization, lora]
source: "Day2(8/31) 슬라이드 p.61–75, p.82–95"
---

```flow
질의 임베딩 :: bge_m3.encode(normalize) — 질문을 벡터로
벡터 검색 (선택) :: vector_db.search(top_k=5) — 관련 청크
맥락 처리 :: compress_context(max_tokens=500) 또는 Long-Context(YaRN)
LoRA sLLM 생성 :: Qwen2.5-1.5B + hr-qwen-lora, CUDA면 4bit NF4
서빙 :: FastAPI POST /pipeline, Swagger로 통합 테스트
```

| sllm_service 구성 | 역할 |
|---|---|
| `config.py` | 모델명(Qwen2.5-1.5B-Instruct), 임베딩(BAAI/bge-m3), USE_4BIT, MODEL_VARIANT 등 환경변수 설정 |
| `runtime.py` | CUDA 4bit / FP16, MPS FP16, CPU FP32로 Base 로딩 + 어댑터 자동 감지·연결 |
| `services/` | 프롬프트 구성·생성, 문서 청크·임베딩, Top-K 검색, 벡터 인덱스 추상화(Mac NumPy / Colab FAISS) |
| `routers/` | Health Check, 문서 업로드, RAG·압축·Long-Context API, 통합 Pipeline API |

> [!tip] 어댑터 운영 정책
> MODEL_VARIANT=auto면 `adapter_config.json`과 `adapter_model.safetensors`가 있을 때만 LoRA, 없으면 Base로 대체. MERGE_LORA_ADAPTER는 False 권장(Base + Adapter 형태 유지). 배포 전 체크: 적용 전후 같은 질문 비교, 압축으로 핵심 유실 여부, 평균 지연(예: 3초 이내), 검색 결과 없음·토큰 초과 예외 처리.
