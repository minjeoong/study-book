---
title: "LangChain과 Chat Model"
en: "LangChain, Chat Model, init_chat_model"
summary: "여러 LLM 벤더를 같은 인터페이스로 감싸 모델 교체를 쉽게 하는 LangChain의 추론 엔진 컴포넌트"
importance: 2
order: 4
tags:
  - LangChain
  - Chat Model
  - 파라미터
keypoints:
  - "LangChain 가치: 모델 독립성, LCEL 파이프라인, 모듈화된 부품, 컨텍스트(메모리·RAG) 관리"
  - "init_chat_model('gpt-5-nano')는 모델명으로 벤더 클래스를 찾아 생성 (패키지 설치는 필요)"
  - "invoke 전체 응답, stream 청크 단위, batch 병렬 (max_concurrency로 rate limit 방어)"
qa:
  - q: "LangChain을 쓰는 이유는?"
    a: "OpenAI, Anthropic, Google, 오픈소스 모델을 ChatModel이라는 표준 인터페이스로 추상화해 벤더를 바꿀 때 모델명만 바꾸면 된다. 프롬프트 | 모델 | 파서를 파이프로 잇는 LCEL 덕분에 흐름이 한눈에 읽히고, 문서 로더·텍스트 분할기·벡터DB 연동 같은 부품이 이미 모듈화돼 MVP를 빨리 만든다. 가벼운 작업은 저렴한 모델로, 복잡한 추론은 고성능 모델로 라우팅하는 구조도 쉽게 짠다."
  - q: "temperature, timeout, max_tokens는 각각 왜 설정하나?"
    a: "temperature는 답변의 무작위성으로, RAG·데이터 추출·코드 생성은 0~0.1로 사실 위주로, 카피라이팅·브레인스토밍은 0.7~1.0으로 둔다. timeout은 장애 방지용으로, 응답이 늦을 때 서버 스레드가 무한 대기하지 않게 빠르게 실패시키고 재시도한다. max_tokens는 비용 방어막으로 프롬프트 인젝션이나 무한 반복으로 답이 끝없이 길어지는 것을 막지만, 요약·번역처럼 긴 출력이 필요한 작업에선 너무 낮추지 않는다."
related:
  - lcel-runnable
  - messages-prompt-template
  - llm-api-basics
  - prompt-context/sampling-controls
source: "Day1(9/9) 슬라이드 p.59–67, 실습 [3] 1장 Chat Model"
---

```compare
invoke | stream | batch
반환 | 생성이 끝난 뒤 응답 객체 1개 | AIMessageChunk 제너레이터 | 입력 리스트에 대한 응답 리스트
장점 | 가장 단순 | 첫 글자까지 시간 단축, 체감 속도 개선 | 스레드 풀로 동시 요청, 대량 처리
주의 | 긴 답변은 기다림 | print(..., end='', flush=True) | 제공사 초당 요청 제한 → max_concurrency
```

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5-nano", temperature=0.0)   # 벤더 패키지(langchain-openai 등) 설치 필요
model.invoke("안녕하세요. 당신은 누구입니까?").content

for chunk in model.stream("AI Agent란 무엇인지 설명해 주세요"):
    print(chunk.content, end="", flush=True)

model.batch(inputs, config={"max_concurrency": 3})       # 최대 3개씩만 동시 처리
```

> [!tip] 벤더 클래스를 직접 써도 된다
> `ChatOpenAI(model_name="gpt-4o", temperature=0)`, `ChatAnthropic(...)`처럼 직접 생성할 수도 있지만, `init_chat_model`을 쓰면 비즈니스 로직은 그대로 두고 모델명 문자열만 바꿔 교체 가능.
