---
title: "SFT 데이터셋 설계"
en: "SFT Dataset (Instruction SFT, Context-based QA SFT)"
summary: "system·user·assistant 대화형 messages로 '이 지시 + 이 질문 → 이런 답'을 가르치는 학습 데이터 — 형식, 거절 샘플, 길이가 성능을 좌우"
importance: 3
order: 8
tags: [SFT, Dataset, Chat Template, Hallucination, max_length]
keypoints:
  - "messages = system + user → assistant, loss는 assistant 응답에만"
  - "규정에 없는 질문 + '확인 필요' 답변 샘플로 Hallucination 억제"
  - "max_length는 감이 아니라 토큰 길이 분포를 보고 정함"
qa:
  - q: "Instruction SFT와 Context-based QA SFT의 차이는?"
    a: "Instruction SFT는 사람이 이미 작성·검수한 Q&A messages를 형식 검증한 뒤 train/validation/evaluation으로 나눠 정제된 지시-응답 스타일을 학습한다. Context-based QA SFT는 원천 문서를 규정 Section으로 쪼개 질문 6종과 '결론 + 적용 규정 원문' 구조의 정답을 자동 생성해 문서 근거 기반 응답을 학습한다. 앞쪽은 원본 Q&A 품질에, 뒤쪽은 문서 구조에 결과가 좌우되며, 실습에선 둘 다 같은 train_lora.py로 하나의 어댑터에 학습했다."
  - q: "SFT 데이터로 Hallucination을 줄이려면?"
    a: "'개인 여행 경비를 전액 지원하나요?'처럼 규정에 없는 질문과 '현재 규정에서는 확인할 수 없으니 인사팀에 확인하라'는 안전 답변을 train·validation·evaluation에 함께 넣는다. 실습 데이터는 582건 중 6건(약 1%)이 이런 거절 샘플이었다. 거절 샘플이 아예 없으면 모델은 어떤 질문에도 답을 만들어내는 게 정답이라고 배우게 된다."
  - q: "max_length는 어떻게 정해야 하나?"
    a: "학습 데이터를 Chat Template까지 적용해 토큰 길이 분포를 먼저 본다. 실습에서 권장값 384를 썼더니 평균 길이가 386토큰이라 25.4%가 뒤에서 잘렸고, 하필 assistant 답변 끝의 거절 문장·예외 조건·EOS가 사라졌다. 512로 올리면 잘림이 3.1%로 줄어서, p95 정도를 기준으로 잡는 게 안전하다. 손실도 assistant_only_loss에 맞춰 응답 구간 기준으로 재야 보인다."
related: [fine-tuning-objectives, sft-training, sft-evaluation, rag-vs-finetuning]
source: "Day1(8/28) 슬라이드 p.32–41, 가이드2 4장, Day1 과제 5장, Day2 서브노트 부록 C"
---

```flow
원천 문서 :: hr_manual_v1.txt (Human AI Corporation 인사 규정)
Section 분리 :: '제3장', '3.1 연차' 같은 제목 패턴으로 96개 규정 섹션
질문·정답 생성 :: 섹션당 질문 7종 + '결론 / 적용 규정 원문 / 확인 안내' 3단 정답
거절 샘플 추가 :: 규정 밖 질문 + '확인할 수 없습니다, 인사팀 확인' 답변
분리 :: train 582(섹션당 6 + 거절 6) / validation 97 / evaluation 20 (평가셋은 학습에 미사용)
```

```compare
Instruction SFT | Context-based QA SFT
입력 | 검수 완료 Q&A messages (hr_sft_all.jsonl) | 원천 문서 hr_manual_v1.txt
생성 방식 | 형식 검증 후 train/val/eval 분리 | 문서를 Section으로 나눠 질문·정답 자동 생성
정답 | 사람이 미리 작성한 assistant 답변 | 결론 + 적용 규정(context 원문) 구조화 답변
학습 목적 | 정제된 지시-응답 스타일 | 문서 근거 응답 + Hallucination 방지
한계 | 원본 Q&A 품질에 좌우 | 문서 구조에 따라 질문 다양성 제한
```

```python
{"messages": [
  {"role": "system", "content": "당신은 Human AI Corporation의 인사 규정 안내 도우미입니다."},
  {"role": "user", "content": "AURORA 재택근무 등급에 대한 규정을 설명해 주세요."},
  {"role": "assistant", "content": "결론: ...\n\n적용 규정: AURORA-A 주 3일 ... AURORA-X 전면 금지\n\n"
                                   "위 규정만으로 판단하기 어려운 개별 상황은 인사팀에 확인해야 합니다."}]}
```

> [!warn] 데이터의 어느 부분이 잘리는가
> Truncation은 뒤에서 자르고, 뒤에는 assistant 답변의 끝(거절 문장·예외 조건·EOS)이 있음. 잘린 148건 중 143건이 마무리 문장을 잃었고, 평가 키워드 BLUE-7이 든 섹션은 학습 샘플 6건 모두에서 잘려 끝까지 복구되지 않음.
