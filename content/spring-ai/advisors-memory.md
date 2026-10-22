---
title: Advisor 체인과 대화 메모리
en: Advisors, ChatMemory, MessageChatMemoryAdvisor, SafeGuard
summary: 요청 길목에 메모리·RAG·안전·로깅을 끼우는 인터셉터 체인 — order가 곧 정책이다
importance: 3
order: 13
tags:
  - Spring AI
  - Advisor
  - 메모리
  - 보안
keypoints:
  - Advisor는 모델 호출을 감싸는 인터셉터 — 서블릿 필터·AOP와 같은 발상
  - order가 작을수록 바깥, 요청은 바깥→안, 응답은 안→바깥
  - 차단(SafeGuard)은 반드시 메모리 저장보다 앞 — 순서가 곧 정책
qa:
  - q: Advisor란 무엇이고 order는 왜 중요한가?
    a: Advisor는 ChatClient의 모델 호출을 감싸 요청 단계에서 맥락을 주입하고 응답 단계에서 후처리하는 인터셉터로, 감사·차단·메모리·RAG·토큰 계측 같은 공통 관심사를 서비스 코드 대신 한곳에 모은다. getOrder 값이 작을수록 바깥에 있어 요청은 낮은 order부터, 응답은 역순으로 지나간다. 차단 Advisor가 메모리 Advisor보다 안쪽에 있으면 걸러야 할 문장이 이미 대화 이력에 저장된 뒤라, 다음 턴에 그 문장이 맥락으로 다시 모델에 들어간다.
  - q: 대화 메모리는 어떻게 동작하고 무엇을 조심해야 하나?
    a: 모델은 기억하지 못하므로 MessageChatMemoryAdvisor가 같은 conversationId의 이전 대화를 불러와 프롬프트에 넣고 응답 후 이력을 저장한다. MessageWindowChatMemory로 최근 20개처럼 창을 두거나 오래된 대화를 요약해 토큰을 통제하고, 운영은 재시작·스케일아웃에도 이어지도록 JDBC·Redis 저장소를 쓴다. conversationId 규칙(테넌트:사용자:세션)을 한 곳에서 만들지 않으면 남의 대화가 섞이는 사고가 나고, 사용자 식별자가 없으면 삭제 요청에도 응답할 수 없다.
  - q: 커스텀 Advisor는 어떻게 만들고, 스트리밍에서 주의할 점은?
    a: BaseAdvisor를 구현해 before에서 요청 프롬프트를 바꿔(augmentSystemMessage 후 request.mutate()) 넘기고, after에서 응답을 후처리하며, getName과 getOrder로 이름과 순서를 정한다. CallAdvisor만 구현하면 스트리밍 경로에서는 그 Advisor가 그냥 건너뛰어지므로, 감사·토큰 계측처럼 빠지면 안 되는 것은 StreamAdvisor도 함께 구현한다. 순서는 테스트로 safety의 order가 chatMemory보다 작은지 못 박아 둔다.
related:
  - rag-retrieval
  - tool-safety
  - observability-fallback
  - spring-rest/proxy-aop
source: 슬라이드 p.189–191(QuestionAnswerAdvisor·대화 메모리·RAG+메모리 결합) — Day 2 (08-19); p.276–296(12장 Advisor·메모리 Advisor·영속 메모리·요약 메모리·커스텀 Advisor·순서·토큰 사용량 Advisor·BaseAdvisor·스트리밍 Advisor·SafeGuard·ChatMemory 저장소·메모리와 개인정보·순서 실험), p.302–303(Day 3 실습 Step 4·5) — Day 3 (08-20), 실습 12_Advisor순서, ch11_advisors, 과제 Day 3
---

```layers
AuditAdvisor (order 0) :: 가장 바깥 — 감사 기록 시작
SafeGuard (order 100) :: 민감어·프롬프트 인젝션 입력 차단 — 저장보다 먼저
MessageChatMemoryAdvisor (order 200) :: 같은 conversationId의 이전 대화 주입·저장
QuestionAnswerAdvisor (order 300) :: VectorStore 검색 근거 주입
SimpleLoggerAdvisor (order 400) :: 모델로 나가는 최종 요청 로깅
모델 :: 응답은 Logger → QA → Memory → SafeGuard → Audit 순으로 돌아 나온다
```

```java
@Bean
ChatClient assistantChatClient(ChatClient.Builder builder, VectorStore vs, ChatMemory memory) {
    return builder.defaultAdvisors(
            new AuditAdvisor(),                                 // order   0
            new SafetyAdvisor(),                                // order 100 차단
            MessageChatMemoryAdvisor.builder(memory).build(),   // order 200 기억
            QuestionAnswerAdvisor.builder(vs).build())          // order 300 근거
        .build();
}

@Bean
ChatMemory chatMemory(ChatMemoryRepository repo) {
    return MessageWindowChatMemory.builder()
            .chatMemoryRepository(repo)       // InMemory · JDBC · Redis 교체 가능
            .maxMessages(20)                  // 최근 20개만 — 토큰 통제
            .build();
}

// 호출부 — 대화 ID는 한 곳의 규칙으로 (tenant:user:session)
chat.prompt().user(question)
    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId(tenant, user, session)))
    .call().content();
```

> [!tip] 내 과제에서 재현한 것
> 인젝션 차단 Advisor의 order를 100에서 250(메모리 뒤)으로 바꾸고 같은 인젝션 문장을 보냈더니, 응답은 똑같이 차단 문구였지만 `/chat/history`에 그 문장이 남아 있었다. 이번 턴은 막혀도 다음 턴에 오염된 맥락이 들어간다 — 순서가 곧 정책이라는 말의 실제 의미.
