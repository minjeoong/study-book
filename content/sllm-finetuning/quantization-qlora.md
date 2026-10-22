---
title: "양자화와 QLoRA"
en: "Quantization, QLoRA (Quantized Low-Rank Adaptation)"
summary: "가중치 정밀도를 FP16에서 INT8·INT4로 낮춰 메모리를 줄이는 양자화, 그리고 4bit로 압축한 Base 위에서 LoRA를 학습하는 QLoRA"
importance: 3
order: 7
tags: [Quantization, QLoRA, NF4, bitsandbytes, PTQ, QAT]
keypoints:
  - "INT8은 메모리 약 50%, INT4는 약 25% — 대신 정확도 손실 가능"
  - "PTQ는 학습 후 간단 적용, QAT는 학습 중 반영해 손실 최소화"
  - "QLoRA = 4bit NF4 Base(동결) + LoRA, 학습 대상은 LoRA와 동일"
qa:
  - q: "LoRA와 QLoRA의 차이는?"
    a: "학습 대상인 LoRA 어댑터는 완전히 같고, 동결된 Base 가중치를 얼마나 압축해 보관하느냐만 다르다. LoRA는 Base를 16비트 그대로 GPU에 올리고, QLoRA는 4비트 NF4로 압축해 두었다가 계산할 때만 compute dtype으로 펼쳐 쓴다. 그래서 훨씬 큰 모델을 저사양 GPU에서 파인튜닝할 수 있지만, 압축·해제 때문에 약간 느리고 미세한 정보 손실이 생길 수 있다."
  - q: "PTQ와 QAT의 차이는?"
    a: "PTQ(Post-Training Quantization)는 학습이 끝난 모델의 가중치를 낮은 정밀도로 바꾸는 방식으로 적용이 간단하지만 정확도 손실이 생길 수 있다. QAT(Quantization-Aware Training)는 학습 과정에서 양자화 오차를 미리 반영해 손실을 최소화한다. INT4(GPTQ, AWQ)처럼 많이 낮출수록 미세 조정 없이는 손실이 커질 수 있다."
  - q: "실습 코드는 실행 환경마다 학습 방식을 어떻게 바꿨나?"
    a: "train_lora.py가 CUDA → MPS → CPU 순으로 장치를 감지해 프로파일을 고른다. CUDA면 기본값이 bitsandbytes 4bit NF4 QLoRA(lr 2e-4)이고 USE_QLORA=False면 FP16 LoRA(lr 1e-4)다. bitsandbytes 4bit는 CUDA 전용이라 Apple MPS는 속도보다 안정성을 택해 FP32 LoRA, CPU는 FP32 LoRA에 max_length를 256으로 줄인다."
related: [lora, peft-overview, inference-optimization, sllm-three-axes]
source: "Day1(8/28) 슬라이드 p.42, Day2(8/31) 슬라이드 p.74·p.78, 가이드1 5장"
---

```compare
Full Fine-Tuning | LoRA | QLoRA
Base 가중치 | 전체가 학습 대상 | FP16·FP32 그대로 동결 | 4bit NF4로 압축해 동결
학습 대상 | 전체 파라미터 | LoRA A·B만 | LoRA A·B만 (LoRA와 동일)
GPU 메모리 | 가장 큼 (옵티마이저 상태 포함) | 작음 | 가장 작음
트레이드오프 | 비용, Catastrophic Forgetting | Base 메모리는 그대로 | 압축·해제로 약간 느림, 미세 손실
실습 환경 | — | MPS·CPU FP32, CUDA FP16 | CUDA 기본값 (USE_QLORA=True)
```

```compare
FP16 | INT8 | INT4 (GPTQ, AWQ)
메모리 | 기준 100% | 약 50% | 약 25%
추론 속도 | 1x | 약 1.5–2x | 약 2–3x
정확도 | 손실 없음 | 경미한 손실 | 미세 조정 없으면 손실 가능
```

```python
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_compute_dtype=torch.float16,
                         bnb_4bit_use_double_quant=True)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, quantization_config=bnb, device_map="auto")
model = prepare_model_for_kbit_training(model)   # 이후 LoraConfig·SFTTrainer는 LoRA와 동일
```

> [!tip] 가이드1 비유 — 설계도 압축 창고
> LoRA는 원본 설계도(가중치)를 고해상도 16비트 그대로 창고(GPU 메모리)에 보관, QLoRA는 4비트 초압축 요약본으로 보관하다가 계산할 때만 잠깐 펼침. 보정 장치(LoRA)는 똑같음.
