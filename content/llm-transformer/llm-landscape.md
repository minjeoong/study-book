---
title: "LLM Landscape — 리더보드와 주요 모델"
en: "LLM Landscape, Leaderboard"
summary: "LLM 성능을 비교하는 리더보드·벤치마크와 GPT·Gemini·Claude·Grok·LLaMA 등 주요 모델의 특징"
importance: 2
order: 11
tags:
  - LLM
  - 벤치마크
  - 리더보드
  - 오픈소스
keypoints:
  - "리더보드 3종 — HELM(학계), Vellum(산업계), HF(오픈소스)"
  - "벤치마크는 능력별 — MMLU 지식, GSM8K 수학, HumanEval 코딩"
  - "폐쇄형 API(GPT·Gemini·Claude) vs 가중치 공개형(LLaMA)"
qa:
  - q: "LLM 성능은 어떻게 비교하나? 대표 벤치마크는?"
    a: "공통 벤치마크 점수를 모은 리더보드로 비교한다. 지식·추론은 MMLU(57개 분야)와 GPQA, 수학은 GSM8K·AIME, 코딩은 HumanEval·SWE-Bench, 사실성은 TruthfulQA가 대표적이다. 실무에서는 정확도뿐 아니라 컨텍스트 길이, 토큰당 비용, 속도, 안전성까지 함께 본다."
  - q: "오픈소스(가중치 공개) 모델의 장단점은?"
    a: "LLaMA처럼 가중치를 내려받아 직접 파인튜닝하고 자체 환경에 배포할 수 있어 데이터 보안과 커스터마이징에 유리하다. 대신 인프라와 튜닝 역량이 필요하고, 라이선스상 대규모 기업이나 특정 분야 사용이 제한되는 'openwashing' 이슈도 있다. 폐쇄형 API는 성능과 편의성이 높지만 비용과 데이터 외부 전송을 고려해야 한다."
related:
  - transfer-learning
  - software-3-0
  - prompt-context/genai-trend
source: "Day2 슬라이드 p.19–43"
---

```compare
Stanford HELM | Vellum | HF Open LLM
관점 | 학계 | 산업계·실무 | 연구자·오픈소스
특징 | 정확도·보정·공정성·강건성·효율·안전성 종합 | 최신 SOTA 모델의 추론·수학·코딩·도구 사용 | 오픈소스 모델을 표준 벤치마크로 자동 평가
대표 지표 | Accuracy, Calibration, Toxicity | GPQA, AIME, SWE-Bench, BFCL | MMLU, HellaSwag, ARC, GSM8K
```

| 모델 | 회사 | 포지셔닝 |
|---|---|---|
| GPT-5.x | OpenAI | 자동 라우팅(빠른 main ↔ 깊은 thinking), PhD 수준 추론·코딩, 환각 감소 |
| Gemini 3.x | Google DeepMind | 텍스트·이미지·음성·코드 멀티모달, Gmail·Docs 등 Workspace 연동 |
| Claude | Anthropic | 코딩·긴 문서 처리에 강점, 사고 파트너(thinking partner) |
| Grok 4 | xAI | DeepSearch로 X(트위터) 실시간 데이터 활용 |
| LLaMA 4 | Meta | 가중치 공개, 7B~2T 다양한 크기, 파인튜닝 가능, 파트너 생태계 |

> [!tip] 벤치마크 한 줄 정리
> MMLU(57개 분야 지식) · HellaSwag(상식 문장 완성) · ARC(과학 문제) · TruthfulQA(헛소리 방지) · Winogrande(상식 대명사 해석) · GSM8K(초등 수학) · HumanEval(파이썬 코딩) · Humanity's Last Exam(최고난도 종합)
