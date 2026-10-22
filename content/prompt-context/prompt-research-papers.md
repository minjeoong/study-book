---
title: 논문으로 본 프롬프트 효과
en: Prompt Engineering in Papers (Politeness, EmotionPrompt)
summary: "공손한 말투, 감정 자극, 예시 형식, 모델 크기 같은 요소가 LLM 성능에 실제로 영향을 준다는 연구 결과 모음"
importance: 1
order: 12
tags:
  - 논문
  - 프롬프트
keypoints:
  - "무례한 프롬프트는 성능 저하, 과도한 공손함이 더 낫다는 보장은 없음"
  - "적절한 공손함 수준은 언어(영·중·일)와 문화에 따라 다름"
  - "감정 자극 문장(EmotionPrompt)을 붙이면 45개 작업에서 성능 향상"
qa:
  - q: "프롬프트의 말투나 감정 표현이 LLM 성능에 영향을 주나?"
    a: "영향을 준다는 연구들이 있다. 'Should We Respect LLMs?'(2024)는 무례한 프롬프트가 종종 낮은 성능을 냈지만 지나치게 공손하다고 항상 좋지는 않았고, 적정 수준이 언어마다 달랐다고 보고했다. EmotionPrompt(2023) 연구는 'This is very important to my career.' 같은 감정 자극 문장을 붙이면 Llama 2, GPT-4 등 여러 LLM의 45개 작업 성능이 올랐다고 했다. LLM이 사람 글에 담긴 문화적 규범과 감정 표현까지 학습했다는 해석이다."
  - q: "프롬프트 기법은 어떻게 분류할 수 있나?"
    a: "Prompt Engineering 서베이(arXiv 2402.07927)는 목적별로 나눈다. 새 과제 대응(Zero/Few-shot), 추론·논리(CoT, Self-Consistency, Tree-of-Thoughts 등), Hallucination 감소(RAG, ReAct, Chain-of-Verification 등), 그리고 감정·톤 관리, 코드 생성, 메타인지·자기성찰(Take a Step Back) 같은 갈래가 있다. 수업에서 다룬 기법은 대부분 추론과 메타인지 갈래에 속한다."
related:
  - few-shot
  - chain-of-thought
  - sampling-controls
source: 슬라이드 p.74–86
---

| 논문 | 결론 | 관련 노트 |
| --- | --- | --- |
| Language Models are Few-Shot Learners (2020) | Few-shot은 파라미터가 충분히 클 때(175B) 효과 | few-shot |
| Rethinking the Role of Demonstrations (2022) | 랜덤 라벨도 큰 손해 없음, 입력-라벨 형식 유지가 필수 | few-shot |
| Should We Respect LLMs? (2024.02) | 무례하면 성능 저하, 과도한 공손함도 보장 없음, 언어별 적정 수준 다름 | — |
| EmotionPrompt (2023.11) | 감정 자극 문장 추가 시 45개 작업에서 성능 향상 | — |
| Is Temperature the Creativity Parameter of LLMs? (2024.05) | 온도는 참신성과 약한 상관, 불일치성과 적당한 상관 | sampling-controls |
| Chain-of-Thought Prompting (2022) | 약 100B 이상 모델에서만 효과 | chain-of-thought |

```compare
Politeness | Impoliteness
예시 | ~좀 해줄 수 있어? / 고마워, 너 정말 대단하다 | 이것밖에 못해? / 너 진짜 멍청하다
결과 | 사람처럼 순응답 효과 | 혐오감으로 응답 품질 저하 가능
주의 | 지나친 공손함이 항상 낫진 않음 | 언어·문화마다 영향 정도가 다름
```

> [!tip] EmotionPrompt 예시
> "나는 박사과정 5년 차 학생이야. 이번이 마지막 논문 투고 기회야. 형식적인 위로는 필요 없어. 이 상태로 투고했을 때 정말 문제가 되는 부분만 알려줘."
