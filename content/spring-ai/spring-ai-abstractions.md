---
title: Spring AI 3대 추상화와 공급자 독립성
en: ChatModel, EmbeddingModel, VectorStore, Auto-configuration
summary: 코드는 ChatModel·EmbeddingModel·VectorStore 인터페이스에만 의존하고, 공급자는 의존성과 yml로 바꾼다
importance: 3
order: 2
tags:
  - Spring AI
  - 아키텍처
  - 설정
keypoints:
  - 3대 추상화 — ChatModel · EmbeddingModel · VectorStore
  - 공급자 교체는 스타터 한 줄 + yml, 비즈니스 코드는 그대로
  - API 키는 환경변수·시크릿으로만 — 소스와 로그에 절대 남기지 않는다
qa:
  - q: Spring AI를 쓰는 이유는 무엇인가?
    a: AI 모델 호출을 HTTP 요청·JSON 파싱·인증으로 직접 다루지 않고, 익숙한 의존성 주입·AutoConfiguration·빈 위에서 메서드 호출로 쓰게 해 주는 공식 프레임워크다. 코드는 ChatClient·ChatModel 같은 추상화에만 의존하므로 OpenAI에서 다른 공급자로 바꿀 때 스타터 의존성과 application.yml만 바꾸면 된다. Advisor·Tool처럼 공통 처리를 끼워 넣는 지점도 표준화되어 있다.
  - q: ChatModel, EmbeddingModel, VectorStore는 각각 무엇인가?
    a: ChatModel은 프롬프트를 받아 텍스트를 돌려주는 가장 기본 추상화로 대화·요약·생성에 쓰고, 실무에서는 그 위의 ChatClient로 감싸 쓴다. EmbeddingModel은 텍스트를 의미 벡터로 바꿔 검색·RAG·분류의 재료를 만든다. VectorStore는 벡터를 저장하고 질문 벡터와 가까운 조각을 찾는 저장소 추상화로, 인메모리부터 pgvector·Redis·Chroma까지 같은 인터페이스로 쓴다.
  - q: 같은 설정이 여러 곳에 있으면 무엇이 이기나?
    a: 우선순위는 커맨드라인 인자, OS 환경변수, application-프로파일.yml, application.yml, 코드의 @Value 기본값 순이다. 운영에서는 컨테이너·K8s 환경변수나 시크릿이 파일을 이기도록 의도된 설계라, spring.ai.openai.api-key는 SPRING_AI_OPENAI_API_KEY처럼 점·하이픈을 밑줄로 바꾼 대문자 환경변수로 주입한다. "바꿨는데 안 먹는다"는 대부분 이 순서를 몰라서 생긴다.
related:
  - chatclient
  - rag-ingest
  - ai-layered-architecture
  - prompt-context/token
source: 슬라이드 p.42–58(2장 LLM과 토큰·Spring AI·아키텍처·3대 추상화·공급자 독립성·공급자별 옵션·속담 유사도 실습), p.59–66(3장 build.gradle·키 보관·벡터 DB·트러블슈팅), p.67–73(4장 BOM·스타터·모듈 지도·yml·프로파일·설정 우선순위·AutoConfiguration) — Day 1 (08-18), 실습 02_속담유사도, 03_작명봇
---

```flow
애플리케이션 코드 :: ChatClient·ChatModel 인터페이스만 주입받아 사용
Spring AI 추상화 :: ChatModel · EmbeddingModel · VectorStore
AutoConfiguration :: 스타터 + application.yml을 보고 빈을 자동 구성
공급자 :: OpenAI, Anthropic, Azure OpenAI … — 설정으로 교체
```

| 구분 | 무엇을 넣나 | 예 |
| --- | --- | --- |
| BOM | 모듈 버전을 한 줄로 일괄 관리 | `platform("org.springframework.ai:spring-ai-bom:2.0.0")` |
| 모델 스타터 | 공급자 연동 + 자동 구성 (하나만) | `spring-ai-starter-model-openai` |
| 벡터 저장소 스타터 | VectorStore 자동 구성 | `spring-ai-starter-vector-store-pgvector` |
| MCP 스타터 | MCP 클라이언트·서버 | `spring-ai-starter-mcp-client` |
| 기타 | RAG Advisor, 모듈형 RAG, 문서 Reader | `spring-ai-advisors-vector-store`, `spring-ai-rag`, tika·pdf reader |

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}      # 환경변수에서 주입 — 소스에 키를 쓰지 않는다
      chat:
        options:
          model: gpt-4o-mini           # dev 프로파일은 소형 모델, prod는 고성능
          temperature: 0.0
```

> [!warn] 키를 커밋했다면
> 히스토리에서 지워도 이미 유출된 것으로 본다. 순서는 즉시 폐기·재발급이 먼저, 히스토리 정리는 그다음. 개발은 셸 환경변수·launch.json, CI는 저장소 Secret, 운영은 K8s Secret·Vault로 보관한다.
