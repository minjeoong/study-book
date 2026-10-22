---
title: Zero-shot · One-shot · Few-shot
en: Few-shot Prompting
summary: "원하는 응답의 예시를 0개·1개·여러 개 넣어 모델이 형식과 패턴을 따라 하게 만드는 기법"
importance: 3
order: 7
tags:
  - 프롬프트
  - In-context Learning
  - LangChain
keypoints:
  - "Zero-shot은 지시만, Few-shot은 보통 3~5개 예시로 패턴을 따르게 함"
  - "파라미터가 충분히 큰 모델에서 효과적 (GPT-3 175B, Brown et al. 2020)"
  - "정답 라벨보다 입력-라벨 형식 유지가 더 중요 (Min et al. 2022)"
qa:
  - q: "Zero-shot과 Few-shot의 차이는?"
    a: "Zero-shot은 예시 없이 과제 설명과 지시만 주는 가장 간단한 방식으로, 모델의 기본 추론 능력에 의존한다. Few-shot은 입력-출력 예시를 여러 개, 보통 3~5개 함께 줘서 모델이 원하는 패턴과 형식을 따를 확률을 높인다. 예시 수는 과제 복잡도와 예시 품질, 모델의 입력 길이 제한에 따라 조절한다."
  - q: "Few-shot 예시의 라벨이 틀리면 성능이 크게 떨어지나?"
    a: "'Rethinking the Role of Demonstrations'(2022)에 따르면 정답 라벨이 가장 좋지만 랜덤 라벨을 써도 성능이 크게 떨어지지 않았다. 오히려 입력-라벨의 형식을 유지하는 것이 성능 최적화에 필수적이었다. 모델이 예시에서 정답 매핑보다 출력 형식, 라벨 공간, 입력 분포를 더 많이 배운다는 뜻이다."
  - q: "LangChain에서 Few-shot 프롬프트는 어떻게 구성하나?"
    a: "예시 dict 리스트를 만들고, ChatPromptTemplate로 human-ai 메시지 쌍인 example_prompt를 정의한다. 이 둘을 FewShotChatMessagePromptTemplate에 넣고, 최종 ChatPromptTemplate에서 system, few-shot, human 순서로 배치한다. 실습에서는 이를 prompt | llm | StrOutputParser LCEL 체인으로 실행했다."
related:
  - rice-framework
  - chain-of-thought
  - prompt-engineering
  - prompt-research-papers
source: 슬라이드 p.57–58, p.76–79, 실습 TODO 2–4, 10–11, 15–16
---

```compare
Zero-shot | One-shot | Few-shot
예시 수 | 0개 | 1개 | 여러 개 (보통 3~5개)
장점 | 간단하고 빠름 | 모방할 표본 제공 | 패턴을 따를 확률이 높아짐
의존 | 모델의 기본 추론 능력 | 예시 1개의 품질 | 예시 품질·다양성, 입력 길이 한도
```

```python
examples = [
    {"industry": "전기차 시장", "analysis": "- 시장 규모: ...\n- 주요 경쟁사: ...\n- 시장 전망: ..."},
    {"industry": "스마트팩토리 시장", "analysis": "- 시장 규모: ...\n- 주요 경쟁사: ...\n- 시장 전망: ..."},
]
example_prompt = ChatPromptTemplate.from_messages([
    ("human", "산업 : {industry}"),
    ("ai", "{analysis}"),
])
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)
final_prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 Gartner의 Senior Research Analyst입니다."),
    few_shot_prompt,          # human/ai 예시 쌍이 이 자리에 펼쳐짐
    ("human", "{input}"),
])
```

> [!tip] 논문 결과로 답하기
> 모델 크기: 예시 수(k)를 늘리면 1.3B는 거의 그대로, 13B는 완만하게, 175B는 가파르게 정확도가 오름. 예시 품질: "이건 정말 굉장해! //부정"처럼 라벨이 틀려도 형식만 유지하면 성능이 유지됨.
