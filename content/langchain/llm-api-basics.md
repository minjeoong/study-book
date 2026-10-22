---
title: "LLM API 호출과 대화 기억"
en: "LLM API Basics (Hugging Face, Gemini, OpenAI), Stateless Chat"
summary: "LLM API는 요청마다 독립(stateless)이라, 대화를 이어가려면 이전 메시지를 매번 함께 보내야 한다"
importance: 3
order: 3
tags:
  - LLM
  - OpenAI
  - Gemini
  - Hugging Face
keypoints:
  - "LLM은 빈칸 채우기로 학습한 다음 토큰 예측기, system·user·assistant 역할로 대화를 흉내"
  - "OpenAI chat.completions는 단발성 — messages에 user·assistant 기록을 직접 누적"
  - "Gemini SDK는 chats.create() 세션 객체가 history를 자동 누적"
qa:
  - q: "ChatGPT API에 '내 이름 기억해?'라고 물으면 왜 기억하지 못하고, 어떻게 해결하나?"
    a: "Chat Completions API는 요청마다 독립적인 stateless 호출이라 서버가 이전 대화를 보관하지 않는다. 그래서 이전 user 메시지와 assistant 답변을 messages 리스트에 차례로 append해 매 요청에 통째로 보내야 맥락이 이어진다. 대화가 길수록 입력 토큰 비용이 커지므로 실무에서는 오래된 대화를 요약하거나 최근 N턴만 남기는 메모리 전략을 함께 쓴다."
  - q: "글을 이어 쓰기만 하는 LLM이 어떻게 질문에 답하는 챗봇이 되나?"
    a: "LLM은 다음에 올 토큰을 확률로 고르는 모델이라 'I love you 를 번역해 봐' 뒤에 엉뚱한 문장을 이어 쓸 수도 있다. 입력을 system, user, assistant 역할이 붙은 대화 형식으로 만들면 모델은 assistant 차례에 올 그럴듯한 답을 이어 쓰게 된다. 여기에 지시를 따르도록 추가 학습을 거친 모델이라 질문에 답하는 형태로 동작한다."
related:
  - langchain-chat-model
  - messages-prompt-template
  - agent-memory
  - prompt-context/token
  - llm-transformer/rlhf
source: "Day1(9/9) 슬라이드 p.29–58, 실습 [2] LLM과 친해지기 1–3장"
---

```compare
Gemini SDK | OpenAI SDK
호출 방식 | client.chats.create() 세션 객체 | client.chat.completions.create() 단발 호출
기록 관리 | 세션 객체가 history 자동 누적 | 개발자가 messages에 직접 누적
대화 이어가기 | chat.send_message()가 이전 맥락 자동 전달 | 매번 전체 기록을 다시 보냄
역할 부여 | config의 system_instruction | role이 system인 메시지
```

```python
messages = [{"role": "system", "content": "너는 사용자를 도와주는 상담사야."}]
while True:
    user_input = input("사용자: ")
    if user_input == "exit":
        break
    messages.append({"role": "user", "content": user_input})
    answer = client.chat.completions.create(
        model="gpt-4o", temperature=0.9, messages=messages
    ).choices[0].message.content
    messages.append({"role": "assistant", "content": answer})   # 기록 누적 = 기억
```

| Hugging Face pipeline task | 실습 모델 | 결과 |
| --- | --- | --- |
| text-classification | twitter-roberta-base-sentiment | positive·negative·neutral + score |
| text-generation | gpt2 | 프롬프트 뒤를 이어 씀 |
| question-answering | distilbert-base-cased-distilled-squad | context에서 답 구간 추출 |
| sentiment-analysis | korean_sentiment | 한국어 긍·부정 (LABEL_1·0) |

> [!tip] max_length vs max_new_tokens
> max_length는 프롬프트 + 생성 토큰 합계 상한, max_new_tokens는 새로 생성할 토큰만 제한하며 우선 적용됨.
