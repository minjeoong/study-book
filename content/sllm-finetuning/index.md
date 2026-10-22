---
summary: "사내 데이터로 작은 LLM을 특화하는 법 — CLM 기반 SFT를 LoRA·QLoRA로 가볍게 학습하고, RAG·맥락 압축·추론 효율화와 묶어 서비스까지"
keywords:
  - sLLM
  - CLM
  - SFT
  - Instruction Tuning
  - PEFT
  - LoRA
  - QLoRA
  - Quantization
  - RAG vs Fine-Tuning
  - Context Compression
  - KV Cache
  - Qwen2.5
materials:
  - file: slides-sllm-finetuning.pdf
    title: "강의 교재 — sLLM 구현 및 Fine Tuning"
    type: slides
    date: 2026-08-28
  - file: guide1-sllm-finetuning-intro.pdf
    title: "실습 가이드 1 — sLLM Fine Tuning 입문"
    type: lab
    date: 2026-08-28
  - file: guide2-sllm-finetuning-lab.pdf
    title: "실습 가이드 2 — sLLM Fine Tuning 실습"
    type: lab
    date: 2026-08-28
  - file: guide3-lora-parameters.pdf
    title: "실습 가이드 3 — LoRA 파라미터 구조 이해"
    type: lab
    date: 2026-08-28
  - file: lab-sllm-main-std.zip
    title: "실습 코드 — sllm-main-std (배포본)"
    type: lab
    date: 2026-08-28
  - file: subnote-day1.pdf
    title: "실습 서브노트 Day1"
    type: etc
    date: 2026-08-28
  - file: subnote-day1.html
    title: "실습 서브노트 Day1 (HTML)"
    type: etc
    date: 2026-08-28
  - file: submission-day1-sllm-finetuning.pdf
    title: "과제 제출 — sLLM Fine Tuning Day1"
    type: etc
    date: 2026-08-28
  - file: subnote-day2.pdf
    title: "실습 서브노트 Day2"
    type: etc
    date: 2026-08-31
  - file: subnote-day2.html
    title: "실습 서브노트 Day2 (HTML)"
    type: etc
    date: 2026-08-31
  - file: demo-1-sft-only-aurora.jpg
    title: "데모 캡처 1 — SFT 단독 비교 (AURORA)"
    type: etc
    date: 2026-08-31
  - file: demo-2-rag-compare-aurora.jpg
    title: "데모 캡처 2 — RAG 보강 비교 (AURORA)"
    type: etc
    date: 2026-08-31
  - file: demo-3-rag-compare-score.jpg
    title: "데모 캡처 3 — RAG 보강 비교 점수"
    type: etc
    date: 2026-08-31
  - file: demo-4-rag-compare-blue-miss.jpg
    title: "데모 캡처 4 — RAG 보강 비교 (BLUE 검색 실패)"
    type: etc
    date: 2026-08-31
  - file: submission-day2-sllm-finetuning.pdf
    title: "과제 제출 — sLLM Fine Tuning Day2"
    type: etc
    date: 2026-08-31
  - file: submission-sllm-main-std.zip
    title: "과제 제출 — sllm-main-std 코드 (모델 체크포인트 제외)"
    type: lab
    date: 2026-08-31
---

## 한눈에 보기

```flow
왜 sLLM인가 :: 데이터 주권 + 도메인 버티컬, 사내망 안의 내부 파이프라인
무엇을 학습하나 :: CLM(Decoder-only) 모델에 SFT — 지시 + 질문 → 원하는 형식의 답
어떻게 가볍게 :: PEFT — 원본 동결 + LoRA 어댑터, CUDA에서는 4bit QLoRA
어떻게 검증하나 :: 같은 질문으로 Base vs Fine-tuned — Keyword · Token F1 · Hallucination
어떻게 서비스하나 :: RAG 검색 + 맥락 압축 + LoRA 모델 + 추론 효율화, FastAPI 서빙
```

- Day1은 "왜 sLLM을 쓰는가(What)" — 내부 파이프라인, MLM vs CLM, LLM vs sLLM, PEFT 기법을 배우고 LoRA 구조를 코드로 확인함.
- Day2는 "현장에서 어떻게 구현하는가(How)" — RAG와 Fine-Tuning의 경계, 성능·효율 3축(파라미터 학습 / Context & Reasoning / 추론 효율화), 서비스 파이프라인 조립까지 다룸.
- 실습은 가상 회사 Human AI Corporation의 HR 규정으로 Qwen2.5-1.5B-Instruct에 LoRA SFT를 수행하고 Base 모델과 비교함. 결론은 "SFT는 형식·태도, RAG는 사실" — 둘은 대체재가 아니라 보완재.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준.

### Day1 (8/28) — sLLM 구현 및 Fine Tuning

1. **LLM 파이프라인 개요** — 외부(상용 LLM) vs 내부(sLLM) 파이프라인, 상용 LLM을 사내망에 둬도 남는 한계, 내부 파이프라인의 두 목적 (p.6–9)
2. **MLM vs CLM** — 구조 비교, Fine-Tuning이 CLM 중심인 이유, BERT → GPT 시대 동향, 상용 CLM 튜닝 기법 (p.10–14)
3. **LLM vs sLLM** — 버티컬 sLLM 요건 5가지, 다차원 비교표, Fine-Tuning이 sLLM 특성을 완성 (p.15–18)
4. **sLLM Use Case** — 상용 LLM을 쓰기 어려운 5가지 상황, 활용 사례 3선, 사내 문서 Q&A(RAG) 시나리오 (p.19–22)
5. **Fine Tuning 전략** — 시나리오별 PEFT 매핑, LoRA·Prompt Tuning 코드, 개선 전후 비교표 (p.23–28)
6. **PEFT 기초 실습** — sllm-main 구조, Instruction SFT vs Context-based QA SFT, 데이터 생성 → `train_lora.py` → `evaluate_model.py` 코드 리뷰 (p.29–48)
7. **실습 가이드** — 가이드1(비유로 보는 파인튜닝 지도: 구조 → 도구 → 목적 → 원리 → 최적화), 가이드3(LoRA 파라미터 Q1–Q16), 노트북 2개(Knowledge 검색, LoRA 파라미터 비교)

### Day2 (8/31) — sLLM 서비스 설계 및 PEFT 응용

1. **sLLM·PEFT 트렌드** — 성능·효율 향상의 3축, "모델보다 기법 설계가 성패를 가른다" (p.52–55)
2. **목적별 PEFT 기법 선택** — RAG/벡터DB vs Fine-Tuning, 목적별 파이프라인·임베딩·기법, 시행착오 노하우 (p.56–60)
3. **PEFT 시나리오 도출** — 맥락 압축 + 파인튜닝 결합, 도출 프레임워크 4단계, 계약서 검토 sLLM 예시 (p.61–64)
4. **sLLM 서비스 설계** — Qwen2.5-1.5B + BGE-M3 아키텍처, 한국어 대안 EXAONE 3.5, 벡터DB 선정 기준 (p.65–68)
5. **sLLM 서비스 구현** — Fine-Tuning 필요 카테고리, Context Compression·YaRN Long-Context·QLoRA 코드 모듈, SOTA 패턴표 (p.69–75)
6. **추론 효율화** — Quantization, MoE, Speculative Decoding, KV Cache 최적화 (p.76–81)
7. **PEFT 응용 실습** — `sllm_service` 패키지(FastAPI), LoRA 어댑터 자동 연결, 통합 테스트, 배포 체크리스트 (p.82–96)
8. **실습** — 가이드2대로 LoRA SFT 학습·평가, 데모 사이트에서 SFT 단독 / RAG 보강 비교

## 실습 정리

### Day1 — Knowledge 검색과 LoRA 구조 확인

- **Knowledge Asset 데모**: HR 규정 6건 → BGE-M3 임베딩(1024차원, 정규화) → FAISS `IndexFlatIP`(전수 내적 = 코사인) → 질문과 가까운 top-2 → Qwen System Prompt의 `[Retrieved Knowledge]`에 주입
- **결과**: 범위 안 질문(유사도 0.69–0.81)은 정답, 범위 밖 질문(0.56)은 "확인할 수 없습니다"로 거절. 하지만 "수료율 70%면 지원되나요?"는 정답 문서(80% 미만 제외)를 찾고도 "지원된다"고 오답 — 검색은 맞아도 작은 모델의 조건 판단은 보증 못 함 → SFT 필요성
- **추가 실험(임계값)**: 범위 안·밖 질문 12개씩으로 늘리니 Top-1 점수 분포가 겹침(범위 안 최저 0.546 < 범위 밖 최고 0.551). τ = 0.56이면 범위 밖 100% 차단 대신 오거절 8% — 임계값은 "안전 vs 응답률"을 고르는 운영 값
- **LoRA 파라미터 비교**: Qwen2.5-1.5B 전체 1,543,714,304개 → LoRA(q_proj·v_proj, r=8) 적용 후 학습 대상 1,089,536개(0.07%). 전체 수는 오히려 늘고, 늘어난 만큼이 전부 학습 대상

```python
lora_config = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05, bias="none",
                         target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # trainable 1,089,536 || all 1,544,803,840 || 0.0705%
```

### Day2 — LoRA SFT 학습과 Base vs Fine-tuned 평가

- **데이터**: train 582건(96개 규정 섹션 × 질문 6종 + 거절 6건), validation 97건(섹션당 1건 + 거절 1건), evaluation 20건(규정 내 15 + 규정 밖 5, 학습에 미사용)
- **1차 학습**: Apple MPS FP32 LoRA, r=16·alpha=32·7개 모듈, MAX_LENGTH 384, epoch 2, lr 1e-4, grad accum 8 → 146 step, 32분, eval_loss 0.462 → 0.217, 어댑터 70.5MB(18,464,768개, 전체의 1.18%)
- **1차 평가**: 20문항 중 Fine-tuned 18승 1패 1무, Total 0.086 → 0.285. 3단 답변 형식("결론 → 적용 규정 → 인사팀 확인")은 완벽히 학습했지만 고유 코드(AURORA-A, BLUE-7 등)는 깨짐
- **원인 분석**: ① MAX_LENGTH 384가 샘플 25.4%의 뒷부분(거절 문장·예외 조건·EOS)을 잘라냄 ② 평가 코드의 `no_repeat_ngram_size=3`이 'A','UR','ORA' 3-gram 반복을 막아 AURORA-B/C/X를 쓸 수 없게 함 → 해제 후 동일 조건 재측정 시 Total Base 0.113 vs Fine-tuned 0.419
- **2차 재학습**: MAX_LENGTH 512, epoch 3(219 step) → 19승 1패, Keyword 0.200 → 0.315, Total 0.285 → 0.378. 그래도 Keyword 0인 문항이 7개 남음 — SFT만으로는 고유 사실 주입에 한계
- **데모(2×2)**: SFT 단독은 형식만 맞고 코드는 창작, RAG 보강 시 Base·SFT 모두 AURORA 키워드 1.00, 검색이 빗나간 BLUE 질문은 둘 다 약함 — 형식은 SFT, 사실은 RAG

```bash
SFT_MAX_LENGTH=512 SFT_EPOCHS=3 SFT_LEARNING_RATE=1e-4 python scripts/train_lora.py
python scripts/evaluate_model.py   # outputs/evaluation_summary.json
```
