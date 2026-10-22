---
title: 동기 REST vs 비동기 Kafka 이벤트
en: Synchronous REST vs Asynchronous Messaging (Kafka)
summary: "결과를 지금 알아야 하면 REST, 사실을 알리기만 하면 Kafka — Producer가 Topic에 발행하고 Consumer가 구독하는 느슨한 결합"
importance: 3
order: 12
tags:
  - MSA
  - Kafka
  - 이벤트 기반
keypoints:
  - "즉시 응답 필요 → REST(동기), 느슨한 결합·이벤트 전파 → Kafka(비동기)"
  - "Producer → Topic(Partition) → Consumer Group, 같은 key는 같은 파티션"
  - "실패 대비: 재시도·Dead Letter Topic, 이벤트 필드명이 서비스 간 계약"
qa:
  - q: "서비스 간 통신에서 동기와 비동기는 어떻게 고르나?"
    a: "결과를 받아야 다음 줄을 실행할 수 있으면 동기 REST를 쓴다. 수강신청 시 강의가 존재하는지, 결제가 성공했는지는 바로 알아야 하므로 REST다. 사실을 알리기만 하고 후속 처리는 받는 쪽에 맡겨도 되면 Kafka 이벤트를 쓴다. 결제 서비스가 payment.completed를 발행하면 수강 서비스가 받아 ACTIVE로 바꾸고, 수강 서비스가 enrollment.completed를 발행하면 추천 서비스가 받아 추천을 갱신한다."
  - q: "Kafka를 쓰면 무엇이 좋아지나? 대가는?"
    a: "발행하는 서비스는 누가 구독하는지 몰라도 된다. 나중에 '결제가 끝나면 알림도 보내자'는 요구가 생기면 알림 서비스가 같은 토픽을 구독하면 되고 결제 서비스 코드는 한 줄도 바뀌지 않는다. 사용자도 결제 응답을 먼저 받고 활성화는 뒤에서 진행되니 기다리지 않는다. 대신 상태 반영이 즉시가 아니라(PENDING → ACTIVE) 화면이 목록을 다시 조회해야 하고, 이벤트 필드명이 어긋나면 예외 없이 조용히 null이 될 수 있다."
  - q: "Consumer 처리가 실패하면 어떻게 하나?"
    a: "재시도하고, 계속 실패하는 메시지는 Dead Letter Topic으로 옮겨 따로 처리한다. 실습 코드는 이벤트의 중요도에 따라 발행 실패 처리도 달리했다. 결제 완료 이벤트는 놓치면 수강이 영영 활성화되지 않으므로 전송 결과를 최대 10초 동기로 기다리고 실패 시 예외를 던지지만, 추천 갱신 이벤트는 놓쳐도 서비스가 깨지지 않아 로그만 남긴다."
related:
  - service-decomposition-data
  - msa-components
  - service-discovery-eureka
source: "2026-08-26 교재 p.33 (동기 vs 비동기 선택 기준) · 2026-08-27 교재 p.75–78 (Kafka 기본, Sprint 3 Planning, Producer/Consumer 구현 프로세스, 수강신청 이벤트 데모), p.97 (서비스간 통신 설계 시퀀스) · 실습 가이드 3 Step 4 · 실습 코드 PaymentKafkaProducer, EnrollmentKafkaConsumer"
---

```flow
Producer :: 데이터를 생성해 Topic으로 전송 — KafkaTemplate.send()
Topic :: 메시지가 저장·분류되는 논리 채널 — 이벤트 성격이 드러나는 이름 (payment.completed)
Consumer :: Topic을 구독해 메시지를 읽음 — @KafkaListener
```

| 구간 | 방식 | 이유 |
| --- | --- | --- |
| Enrollment → Course | REST | 강의 존재 여부를 즉시 확인 |
| Enrollment → Payment | REST | 결제 결과가 즉시 필요 |
| Recommend → Enrollment · Course | REST | 수강 이력·강의 목록 조회 |
| Payment → Enrollment | Kafka `payment.completed` | 수강 상태를 ACTIVE로 변경 |
| Enrollment → Recommend | Kafka `enrollment.completed` | 추천 결과 갱신 트리거 |

```java
// enrollment-service — 결제 완료 이벤트 수신 → 수강 활성화
@KafkaListener(topics = "${kafka.topic.payment-completed}",
               groupId = "${spring.kafka.consumer.group-id}")
public void handlePaymentCompleted(Map<String, Object> event) {  // 타입 헤더 없이 Map으로 수신
    Long userId = ((Number) event.get("userId")).longValue();
    Long courseId = ((Number) event.get("courseId")).longValue();
    enrollmentService.activateEnrollment(userId, courseId);
    // PENDING → ACTIVE, course-service 수강생 수 증가, enrollment.completed 발행
}
```

> [!warn] 헷갈리기 쉬움
> 메시지 key를 userId로 주면 같은 사용자의 이벤트는 같은 파티션에 들어가 순서가 보장된다(토픽 전체 순서는 보장 안 됨). 또 서비스마다 패키지가 달라 Consumer는 특정 DTO 클래스가 아닌 Map으로 받는다 — MSA에서 이벤트 계약은 클래스가 아니라 필드 이름이다.
