---
title: "Base vs Fine-tuned 평가"
en: "SFT Evaluation (Keyword Score, Token F1, Hallucination)"
summary: "같은 평가 질문을 어댑터를 껐다 켠 동일 모델에 넣어, 규정 키워드·토큰 F1·안전한 거절로 SFT 효과를 수치화"
importance: 3
order: 10
tags: [Evaluation, Keyword Score, Token F1, Hallucination, disable_adapter]
keypoints:
  - "disable_adapter()로 같은 모델 객체에서 Base 답변을 얻어 메모리 절약"
  - "Known은 Keyword 70% + F1 30%, Unknown은 Safety 50%를 더 봄"
  - "평가 코드·생성 설정도 검증 대상 — 점수가 낮으면 답변부터 읽기"
qa:
  - q: "SFT 모델을 어떻게 평가했나?"
    a: "학습에 쓰지 않은 20문항(규정 내 패러프레이즈 15, 규정 밖 5)을 Base와 Fine-tuned에 똑같이 넣는다. Base 답변은 별도 모델을 올리지 않고 같은 PeftModel에서 disable_adapter()로 어댑터만 잠시 꺼서 얻는다. 규정 고유 코드가 들어갔는지(Keyword), 정답과 토큰이 얼마나 겹치는지(Token F1), 규정 밖 질문에 지어내지 않고 확인을 안내했는지(Safety)를 가중합해 승패를 매긴다."
  - q: "Token F1이 올랐다면 모델이 더 정확해진 건가?"
    a: "꼭 그렇지는 않다. Token F1은 정답과 단어가 얼마나 겹치는지를 재므로, 학습한 3단 답변 골격('결론:', '적용 규정:', 마무리 문장)만 따라 해도 점수가 오른다. 실제로 고유 코드는 하나도 못 맞혔는데(Keyword 0/5) Token F1이 0.024에서 0.328로 오른 문항이 있었다. 사실 정확도는 Keyword나 고유 코드 회수율처럼 내용 지표로 따로 봐야 한다."
  - q: "평가 점수가 예상보다 낮을 때 무엇을 확인하나?"
    a: "점수만 보지 말고 실제 생성 답변을 읽는다. 실습에서 Fine-tuned 답변이 AURORA-A 다음 AURORB, AURAER처럼 규칙적으로 깨졌는데, 원인은 평가 코드의 no_repeat_ngram_size=3이 AURORA(3토큰) 반복을 차단한 것이었다. 설정을 끄고 Base·Fine-tuned를 같은 조건으로 다시 재니 Total이 0.113 vs 0.419로, 공식 결과보다 SFT 효과가 더 크게 나왔다."
related: [sft-training, sft-dataset, rag-vs-finetuning, model-dev/classification-metrics]
source: "Day1(8/28) 슬라이드 p.45–47, 가이드2 10–13장, Day2 서브노트 4장, Day2 과제 제출 4·6장"
---

```formula
Keyword = 포함된 must_include 수 ÷ must_include 수 :: 금지어(must_not_include)가 있으면 −0.5
Token F1 = 2·P·R ÷ (P + R) :: P = 겹친 토큰 ÷ 답변 토큰, R = 겹친 토큰 ÷ 정답 토큰
Total (Known) = 0.7·Keyword + 0.3·F1 :: 규정 내 질문은 고유 코드 반영이 핵심
Total (Unknown) = 0.3·Keyword + 0.2·F1 + 0.5·Safety :: 안전 표현만 1.0, 위험 표현 섞이면 0.5, 없으면 0
```

| 조건 | Base Total | Fine-tuned Total | Fine-tuned Keyword | 승패 (20문항) |
|---|---|---|---|---|
| 1차 (MAX_LENGTH 384, epoch 2) | 0.086 | 0.285 | 0.200 | 18승 1패 1무 |
| 1차, no_repeat_ngram_size 해제 | 0.113 | 0.419 | 0.420 | 18승 1패 1무 |
| 2차 재학습 (512, epoch 3) | 0.086 | 0.378 | 0.315 | 19승 1패 |

> [!warn] 좋은 설정이 도메인에선 정반대로 작동
> `no_repeat_ngram_size=3`은 같은 말 반복을 막는 흔한 설정이지만, AURORA-A/B/C/X처럼 공통 접두어를 반복해야 하는 사내 코드 체계에선 정답을 막음. 게다가 정답을 아는 Fine-tuned만 골라 깎아 SFT 효과를 실제(Keyword 4.4배)보다 작게(3.1배) 보이게 함.
