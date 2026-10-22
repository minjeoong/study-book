---
title: Chain of Thought와 Self-Consistency
en: Chain of Thought (CoT), Self-Consistency
summary: "중간 추론 단계를 쓰게 해 정확도를 높이는 CoT, 여러 추론 경로를 뽑아 다수결로 답을 고르는 Self-Consistency"
importance: 3
order: 8
tags:
  - 프롬프트
  - 추론
keypoints:
  - "CoT = 문제를 작은 단계로 나눠 추론 과정을 먼저 쓰게 함, 다른 기법의 기반"
  - "Self-Consistency = 여러 CoT 경로를 생성해 다수결(voting)로 답 선택"
  - "CoT는 ~100B 이상 대형 모델에서만 효과, 작은 모델은 오히려 성능 저하"
qa:
  - q: "CoT 프롬프팅이란? 장점은?"
    a: "'단계적으로 생각해줘', '결론 전에 추론 과정을 먼저 보여줘'처럼 중간 추론 단계를 생성하게 해 복잡한 문제를 작은 단계로 나눠 푸는 기법이다. 적은 노력으로 정확도를 높이고, 추론 과정이 보여 해석 가능성이 높고 오답 원인을 찾기 쉽다. 또 LLM을 바꿔도 CoT를 쓴 프롬프트가 성능 변화가 덜해 강건하다."
  - q: "Self-Consistency는 CoT와 무엇이 다른가?"
    a: "CoT는 한 번의 추론 경로에서 탐욕적으로 답을 정해서, 중간에 실수하면 그대로 오답이 된다. Self-Consistency는 같은 질문에 Temperature를 높여 서로 다른 CoT 추론을 여러 번 생성하고, 가장 많이 나온 답을 최종 답으로 고른다. 샘플링과 다수결을 결합해 정확도와 일관성을 높이지만 호출 횟수만큼 비용이 든다."
  - q: "CoT는 만능인가?"
    a: "아니다. 원 논문에서 CoT는 파라미터 약 100B 이상 모델에서만 수학·상식 추론 성능을 올렸고, 작은 모델에서는 오히려 떨어졌다. 또 사람이 사고 과정을 문장으로 설계해야 하는 번거로움이 있고, 프롬프트 완성도가 낮으면 결과도 좋지 않다."
related:
  - few-shot
  - step-back-prompting
  - sampling-controls
  - prompt-research-papers
source: 슬라이드 p.59, p.63, p.86, 실습 TODO 5
---

```flow
질문 + CoT 프롬프트 :: 누군가 슈퍼에서 우유를 훔쳤다면 정당화될 수 있나요?
여러 번 샘플링 :: 높은 Temperature로 서로 다른 reasoning path 5개
답 모으기 :: 상황에 따라 다르다 3회, 부도덕하다 2회
다수결 (voting) :: 최종 답 = 상황에 따라 다르다
```

```
아래 수율 저하 현상의 원인을 분석할 때 단계적으로 생각해줘.
Step 1. 증상을 정확히 기술해
Step 2. 가능한 원인 후보를 모두 나열해
Step 3. 각 원인 후보를 증거와 대조해서 가능성 높은 순으로 순위를 매겨
Step 4. 가장 가능성 높은 원인에 대한 검증 방법을 제안해
Step 5. 즉각 조치와 근본 대책을 구분해서 제안해

현상: TSV 공정 후 수율이 전월 대비 8% 하락. 특정 장비 라인에서만 발생. 재료 변경 없음.
```

> [!warn] 모델 크기 조건
> "CoT only yields performance gains when used with models of ~100B parameters." 큰 모델 + CoT로 수학·상식 추론 벤치마크 90.2% 달성, 작은 모델에서는 기법 성능이 떨어짐.
