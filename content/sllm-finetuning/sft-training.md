---
title: "SFTTrainer로 LoRA SFT 학습"
en: "Supervised Fine-Tuning with TRL SFTTrainer"
summary: "Base 모델 + LoRA 설정 + 대화형 데이터를 SFTTrainer에 넣고, validation loss가 가장 낮은 어댑터만 저장하는 학습 과정"
importance: 3
order: 9
tags: [SFT, SFTTrainer, TRL, Gradient Accumulation, eval_loss]
keypoints:
  - "학습 루프 = forward → loss → backward → optimizer step (LoRA만 갱신)"
  - "epoch마다 eval → load_best_model_at_end로 eval_loss 최저 체크포인트 채택"
  - "batch 1 × gradient accumulation 8 = 실질 batch 8, 메모리 절약"
qa:
  - q: "실습에서 어떤 설정으로 학습했고 결과는 어땠나?"
    a: "Qwen2.5-1.5B-Instruct에 r=16, alpha=32, Attention·MLP 7개 모듈 LoRA를 붙이고 Apple MPS에서 FP32로 MAX_LENGTH 384, epoch 2, lr 1e-4, gradient accumulation 8로 학습했다. 582건 ÷ 8 = epoch당 73 step, 총 146 step에 32분이 걸렸다. train loss는 1.97에서 0.26, validation loss는 0.462에서 0.217로 내려갔고, 결과물은 Qwen 전체가 아니라 70.5MB 어댑터다."
  - q: "train loss와 eval loss를 비교할 때 주의할 점은?"
    a: "로그의 final_train_loss 0.674는 146 step 전체 평균이라 초반의 큰 loss가 섞여 있고, eval_loss 0.217은 학습 끝 시점 값이라 그대로 비교하면 안 된다. 학습 중에는 lora_dropout이 켜지고 평가 때는 꺼진다는 차이도 있다. 같은 시점끼리 보면 train 0.26, eval 0.22로 붙어 있고 eval_loss가 아직 내려가는 중이라 과적합보다 학습 부족에 가까웠다."
  - q: "token accuracy가 95%인데 실제 생성은 왜 깨질 수 있나?"
    a: "학습 중 정확도는 정답 토큰을 앞에 넣어 준 상태에서 다음 토큰 하나를 맞히는 Teacher Forcing 기준이다. 실제 생성은 모델이 만든 토큰 위에 다음 토큰을 쌓기 때문에 한 번 틀리면 오류가 누적된다(LYN 다음 A를 잘못 뽑으면 LYNA로 계속 감). 그래서 loss·accuracy만으로는 부족하고 실제로 생성시켜 채점하는 평가가 필요하다."
related: [sft-dataset, lora-config, sft-evaluation, model-dev/overfitting-underfitting]
source: "Day1(8/28) 슬라이드 p.42–47, 가이드1 4장, 가이드2 5–9장, Day2 서브노트 부록 A, 제출 코드 training_log.json"
---

```flow
환경 감지 :: CUDA → MPS → CPU 순, 장치별 학습 프로파일 선택
데이터·토크나이저 :: messages 형식 검증, pad = eos, Chat Template 적용 확인
모델·LoRA :: Base 로드(Frozen) + LoraConfig(r 16, alpha 32, 7개 모듈)
학습 루프 :: forward → loss(assistant 토큰만) → backward → optimizer step
epoch마다 평가 :: validation eval_loss 측정 + 체크포인트 저장
저장 :: eval_loss 최저 어댑터 → models/hr-qwen-lora/
```

```python
SFTConfig(num_train_epochs=2, learning_rate=1e-4, max_length=384,
          per_device_train_batch_size=1, gradient_accumulation_steps=8,   # 실질 batch 8
          lr_scheduler_type="cosine", warmup_ratio=0.05, max_grad_norm=1.0,
          eval_strategy="epoch", save_strategy="epoch",
          load_best_model_at_end=True, metric_for_best_model="eval_loss",
          assistant_only_loss=True, packing=False)
```

> [!tip] 숫자로 읽는 학습 로그
> step 5 → 145에서 loss 1.97 → 0.26, token accuracy 0.57 → 0.95, entropy 1.61 → 0.44. 처음엔 "뭐라고 답할지" 후보가 넓게 퍼져 있다가 답변 형식이 거의 결정된 상태가 됨. 2차 재학습(MAX_LENGTH 512, epoch 3, 219 step)에서 train loss는 0.43까지 내려감.
