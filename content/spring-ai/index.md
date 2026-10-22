---
summary: Spring Boot 계층 위에 ChatClient로 LLM을 얹고, 구조화 출력·RAG·Tool Calling·Advisor 체인으로 근거 있고 통제된 상담 에이전트(HelpDesk AI)까지 만든 3일 과정
keywords:
  - ChatClient
  - ChatModel
  - EmbeddingModel
  - VectorStore
  - PromptTemplate
  - ChatOptions
  - SSE 스트리밍
  - 구조화 출력
  - RAG
  - QuestionAnswerAdvisor
  - HyDE
  - Tool Calling
  - ToolContext
  - MCP
  - Advisor
  - ChatMemory
  - 관찰 가능성
materials:
  - file: slides-spring-ai.pdf
    title: "강의 슬라이드 — Spring AI 이해 및 활용 (1~13장, Day 1~3 실습)"
    type: slides
    date: 2026-08-18
  - file: submission-day1-spring-ai.pdf
    title: "과제 제출 — Day1 계층 위에 AI 얹기 (주문 요약 API)"
    type: etc
    date: 2026-08-18
  - file: lab-spring-ai-samples.zip
    title: "실습 — Spring AI 샘플 코드 (01~14 미니 실습, ch03~ch12 예제)"
    type: lab
    date: 2026-08-18
  - file: submission-day2-spring-ai.pdf
    title: "과제 제출 — Day2 사내 문서 Q&A (RAG)"
    type: etc
    date: 2026-08-19
  - file: submission-day3-spring-ai.pdf
    title: "과제 제출 — Day3 상담 에이전트 (Tool·권한·Advisor)"
    type: etc
    date: 2026-08-20
  - file: submission-spring-ai-final.pdf
    title: "과제 제출 — 종합 실습 HelpDesk AI 구현 보고서"
    type: etc
    date: 2026-08-20
  - file: submission-spring-ai-final-code.zip
    title: "과제 제출 — 종합 실습 HelpDesk AI 프로젝트 코드"
    type: lab
    date: 2026-08-20
---

## 한눈에 보기

```layers
web (Controller) :: REST·SSE 입구 — AI를 모른다, 인증 주체에서 userId를 꺼낸다
service :: 업무 흐름·프롬프트 조립·폴백 — ChatClient는 여기서 부른다
ChatClient + Advisor 체인 :: 계측 → 차단 → 메모리 → RAG → 감사, order가 곧 정책
근거 (RAG) :: 문서 인제스트 → VectorStore 유사도 검색 → 출처
행동 (Tool) :: 주문 조회·티켓 접수 — 권한은 ToolContext와 쿼리, 승인은 사람
모델 (ChatModel) :: OpenAI gpt-4o-mini — 공급자는 의존성과 yml로 교체
```

- 3일을 한 줄로 하면 구조 → 근거 → 행동. Day 1은 계층과 ChatClient(부르는 법), Day 2는 프롬프트·구조화 출력·RAG(잘 묻고 근거로 답하기), Day 3은 Tool·Advisor·운영(일하는 AI를 통제하기).
- 일관된 원칙: AI는 새 계층이 아니라 기존 Controller·Service·Repository 위에 얹히는 관심사이고, 권한·승인·차단처럼 지켜져야 하는 것은 프롬프트가 아니라 코드로 강제한다.
- 모든 실습은 Swagger와 측정(골든 세트, 토큰·지연 지표)으로 검증하고, "검색 결과를 먼저 눈으로 본다"를 디버깅 순서로 반복함.

## 수업 흐름

**Day 1 (08-18)** — 기초와 구조

1. 오리엔테이션 · 용어 정리(토큰, 컨텍스트 윈도우, 임베딩, RAG, Tool, Advisor) — p.3–9
2. 1장 Spring Boot 기초: 계층을 나누는 이유, 어노테이션 지도, 빈·생성자 주입, DTO, @Configuration·@Bean, AOP, 검증·예외 처리, Swagger, 프로파일, 슬라이스 테스트, 로깅, AI는 어느 계층에 두나 — p.10–41
3. 2장 개요와 아키텍처: LLM과 토큰, 3대 추상화(ChatModel·EmbeddingModel·VectorStore), 공급자 독립성, 속담 유사도 실습 — p.42–58
4. 3장 개발환경: build.gradle·BOM, API 키 보관 단계별 원칙, pgvector docker-compose, 첫 실행과 트러블슈팅 — p.59–66
5. 4장 의존성·설정과 ChatClient: 스타터, application.yml·프로파일·설정 우선순위, AutoConfiguration, 빌더·Fluent API, 용도별 ChatClient 빈, call·stream·entity, 응답 메타데이터, 파라미터 바인딩 — p.67–93
6. Day 1 실습: 계층 위에 AI 얹기 — 주문 요약 API — p.94–104

**Day 2 (08-19)** — 프롬프트와 RAG

1. 5장 프롬프트·옵션·스트리밍: PromptTemplate·StringTemplate, 4요소, 시스템 프롬프트 체크리스트, Few-shot·CoT, 프롬프트 파일, ChatOptions, 안티패턴, SSE·취소·타임아웃 — p.105–129
2. 6장 구조화 출력·멀티모달·임베딩: .entity, JSON Schema, 중첩·목록, 타입 함정, 복구 전략, 이미지 입력, Map-Reduce 요약, 토큰 비용 — p.130–150
3. 7장 LLM 활용 심화: Mock 테스트·결정론적 테스트, 모델 선택, 캐시·프롬프트 캐싱, Router·워크플로 패턴·병렬·Evaluator-Optimizer·배치 — p.151–171
4. 8장 RAG: 파이프라인, 임베딩 모델 선택, Reader·청킹·메타데이터, VectorStore·pgvector·HNSW, ETL, QuestionAnswerAdvisor, 필터, 실패 진단표, 위키 Q&A 실습 — p.172–199
5. 9장 RAG 심화: HyDE, 모듈형 RAG·질문 변환, Contextual Retrieval, Agentic RAG, Parent-Child, 재순위, Hybrid, GraphRAG, RAG vs 파인튜닝, RAG 평가 — p.200–219
6. Day 2 실습: 사내 문서 Q&A — 인제스트·검색·근거 답변·골든 세트·실험표 — p.220–230

**Day 3 (08-20)** — 도구·에이전트·운영

1. 10장 Tool Calling·Agent·MCP: @Tool·스키마·ToolContext·병렬 호출·실패 처리, ReAct, MCP 클라이언트·서버 — p.231–258
2. 11장 Tool·Agent 심화: 감사 로깅 AOP, @PreAuthorize, 승인 게이트, Tool 설계 원칙, 루프 상한, 반환값 설계, 멀티 에이전트, 도구 테스트 — p.259–275
3. 12장 Advisors·메모리·운영: Advisor 체인과 order, 메모리 Advisor·영속·요약 메모리, 커스텀 Advisor·토큰 계측·스트리밍 Advisor, SafeGuard, 관찰 가능성, 폴백, ChatMemory 저장소, 개인정보 — p.276–296
4. Day 3 실습: 상담 에이전트 — 도구·권한·승인 게이트·Advisor 순서·멀티턴·관찰·레드팀 — p.297–308
5. 13장 종합 실습 HelpDesk AI: 요구사항, 아키텍처, Phase 1~6 구현, 검증 시나리오 — p.309–323

## 실습 정리

- 샘플 코드는 장마다 독립 Spring Boot 프로젝트(Gradle). `/labN/...` 엔드포인트를 curl·Swagger로 호출하고, 모델을 안 부르는 단위 테스트를 함께 둠

| 미니 실습 | 장 | 핵심 |
| --- | --- | --- |
| 01 간식추천 3계층 · 07 주문 요약 | 1·4장 | Controller → Service → Repository, 컨트롤러에 ChatClient 없음 |
| 02 속담 유사도 | 2장 | EmbeddingModel.embed + 코사인 유사도 직접 계산 |
| 03 작명봇 · 04 말투 바꾸기 | 3·4장 | 키 누락 시 502 재현, 용도별 ChatClient 빈(온도 0.2 vs 0.9) |
| 05 이모지 요약기 · 06 별점 카드 | 5·6장 | 4요소 프롬프트로 형식 고정, enum + record로 `.entity()` |
| 07 라우터와 교정 | 7장 | 분류 → 경로별 모델 → 자가 채점, 교정은 if 1회 |
| 08 위키 Q&A · 09 HyDE 비교 | 8·9장 | delete 후 add 재색인, 검색 먼저 보기, 가상 답변으로 검색 |
| 10 점심 추천 도구 · 11 승인 게이트 | 10·11장 | @Tool 설명이 곧 스펙, 접수까지만 하는 도구 + 감사 Aspect |
| 12 Advisor 순서 · 13 병목과 캐시 · 14 SSE와 추적 ID | 12장 | 차단 order 100 ↔ 250 실험, 구간 시간·캐시·@Retryable 폴백, token·done 이벤트 |

- 내 과제 결과 (Spring Boot 3.5 · Spring AI 1.1 · gpt-4o-mini · text-embedding-3-small)

| 과제 | 만든 것 | 측정·발견 |
| --- | --- | --- |
| Day 1 주문 요약 | `GET /lab1/orders/{id}/summary`, 요약 전용 ChatClient(온도 0, maxTokens 120), 404·503 예외 처리, AI 실패 시 상품·상태 폴백 | 온도 0이면 3회 동일 문장, maxTokens 20이면 문장 잘림, eta를 빼면 거절 대신 조용히 생략 → "없음"을 명시해 해결 |
| Day 2 사내 문서 Q&A | `POST /lab2/ingest`, `GET /lab2/retrieve`(점수 노출), `POST /lab2/ask` → `AnswerDto(answer, sources, grounded)` | threshold 0.5에서 전부 거절 → 원점수 0.15~0.41 확인 후 0.15로 조정, 골든 세트 10/10, 실험표 A~F(0.7이면 1/10) |
| Day 3 상담 에이전트 | 주문 조회·환불 접수 도구, ToolContext 권한, Advisor 체인 Metrics(10)→InjectionGuard(100)→Memory(200)→QA(300) | 권한 5개·멀티턴 5턴 통과, 차단 order를 250으로 옮기면 인젝션 문장이 이력에 남음, 레드팀 8/8 방어 |
| 종합 HelpDesk AI | REST API 13개, Advisor 5개, @Tool 3종, 승인 게이트·감사·토큰 비용 계측·폴백·SSE, 복합 질의, 중복 접수 방지(SHA-256 키) | 단위 테스트 12/12, 골든 세트 6/6, 19회 호출 50,182토큰 ≈ 0.0082 USD(프롬프트가 완성의 32배) |

핵심 코드 — 종합 실습의 Advisor 체인 조립 (내 `AiConfig`)

```java
@Bean
public ChatClient helpDeskChatClient(ChatClient.Builder builder, VectorStore vectorStore,
                                     ChatMemory chatMemory, HelpDeskProperties props, ...) {
    return builder
        .defaultSystem(SYSTEM_PROMPT)
        .defaultAdvisors(
            tokenMeterAdvisor,                                    // order  10 전체 지연·토큰
            new SafeGuardAdvisor(100),                            // order 100 차단은 저장보다 먼저
            MessageChatMemoryAdvisor.builder(chatMemory).order(200).build(),
            QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(SearchRequest.builder()
                    .topK(props.rag().topK())
                    .similarityThreshold(props.rag().similarityThreshold()).build())
                .promptTemplate(QA_TEMPLATE)                      // 기본 템플릿이 도구 호출을 막아 교체
                .order(300).build(),
            ragTraceAdvisor,                                      // order 310 검색 근거 로그
            auditAdvisor)                                         // order 900 통과한 턴만 감사
        .defaultTools(orderTools, ticketTools)
        .build();
}
```
