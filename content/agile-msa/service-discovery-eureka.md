---
title: 서비스 디스커버리 — Eureka
en: Service Discovery, Netflix Eureka
summary: "IP 대신 서비스 이름으로 호출하게 해주는 전화번호부 — 기동 시 등록, 하트비트로 생존 확인, 호출 측은 이름으로 조회해 로드밸런싱"
importance: 2
order: 11
tags:
  - MSA
  - Spring Cloud
  - Eureka
keypoints:
  - "등록(Register): 기동 시 이름·호스트·포트 등록, 30초마다 하트비트"
  - "조회(Discovery): 이름으로 인스턴스 목록 조회 → lb://로 로드밸런싱"
  - "고정 IP 제거 — 재배포·스케일 아웃에도 호출 코드는 그대로"
qa:
  - q: "Service Discovery가 왜 필요한가?"
    a: "모놀리식은 다른 기능을 메서드로 부르니 주소 개념이 없지만, 서비스가 쪼개져 컨테이너로 뜨면 재시작할 때마다 IP가 바뀌고 인스턴스 수도 달라진다. 호출하는 코드에 IP를 적어 두면 상대가 재배포될 때마다 이쪽도 고쳐야 한다. Eureka 같은 디스커버리는 각 서비스가 자기 위치를 등록하고, 호출하는 쪽은 이름으로 조회하게 해서 이 문제를 없앤다."
  - q: "Eureka의 등록·조회 흐름은?"
    a: "각 서비스는 기동하면서 spring.application.name과 호스트·포트를 Eureka 서버(8761)에 등록하고 30초 간격으로 하트비트를 보낸다. 하트비트가 끊기면 목록에서 내려간다. 호출하는 쪽은 'AUTH-SERVICE 어디 있어?'처럼 이름으로 인스턴스 목록을 받아 하나를 골라 호출하는데, Gateway의 lb://course-service나 @LoadBalanced WebClient가 이 역할을 한다. Gateway도 Eureka에 등록되는 클라이언트이면서 목록을 조회하는 클라이언트다."
  - q: "Docker Compose의 서비스 이름 DNS가 있는데 Eureka가 또 필요한가?"
    a: "Compose는 같은 네트워크 안에서 서비스 이름으로 컨테이너를 찾게 해주는 내부 DNS를 제공하므로, 실습 규모에서는 둘 다 '이름으로 찾기'를 해준다. Eureka는 여기에 인스턴스 여러 개의 목록 관리, 하트비트 기반 생존 확인, 클라이언트 측 로드밸런싱을 더한다. 쿠버네티스로 가면 Service 오브젝트와 클러스터 DNS가 이 역할을 맡아 Eureka 없이 운영하는 경우도 많다."
related:
  - msa-components
  - auth-server-gateway
  - kafka-event-driven
source: "2026-08-27 교재 p.71–74 (Eureka & 서비스 간 통신, Sprint 2 Planning, 등록/조회 연동 프로세스, 탐색 흐름 데모), p.98 (Eureka 대시보드) · 실습 가이드 3 (eureka-server 설정) · 보강 자료 2 Ⅷ (Compose 네트워크와 내부 DNS)"
---

```flow
① 수강신청 요청 수신 :: 학생이 발급받은 토큰으로 /api/courses/apply 호출
② Eureka 조회 :: 수강신청 서비스 → "AUTH-SERVICE 어디 있어?"
③ 위치 응답 :: Eureka가 인증서버의 현재 IP:Port 응답
④ REST 호출 :: 해당 위치로 직접 호출해 사용자 유효성 확인
⑤ 신청 처리 :: 확인 후 수강신청 완료
```

```java
// enrollment-service — IP 대신 서비스 이름으로 호출
@Bean
@LoadBalanced                                   // http://서비스명 → Eureka 조회 + 로드밸런싱
public WebClient.Builder loadBalancedWebClientBuilder() {
    return WebClient.builder();
}

Boolean exists = webClientBuilder.build().get()
        .uri("http://course-service/api/courses/internal/exists/{id}", courseId)
        .retrieve().bodyToMono(Boolean.class)
        .block();                               // 동기 REST — 강의가 있어야 신청 가능
```

- Sprint 2 Task: Eureka Server 구축(3) → 각 서비스에 Client 등록(3) → Gateway를 서비스명 기반 동적 라우팅으로 전환, 고정 IP 제거(3) → 서비스 간 REST 호출 구현(5)
- Eureka 서버 설정: port 8761, register-with-eureka·fetch-registry false (단일 인스턴스라 자기 자신 등록·조회 불필요)

> [!warn] self-preservation
> 하트비트가 한꺼번에 많이 끊기면 Eureka는 네트워크 문제로 보고 목록을 지우지 않는다(보호 모드). 운영에서는 유용하지만 컨테이너를 자주 내렸다 올리는 실습에서는 죽은 서비스가 목록에 남아 혼란스러워 `enable-self-preservation: false`로 껐다.
