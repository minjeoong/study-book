---
title: MSA 구성요소와 장애 대응 패턴
en: API Gateway, Service Discovery, Config Server, Circuit Breaker, Anti-corruption Layer
summary: "MSA를 굴리는 공통 부품 — 단일 진입점(Gateway), 이름으로 찾기(Discovery), 설정 일원화(Config), 추적, 장애 전파 차단(Circuit Breaker)"
importance: 3
order: 8
tags:
  - MSA
  - Spring Cloud
  - 장애 대응
keypoints:
  - "API Gateway(단일 진입점) + Service Discovery(이름 호출) + Config Server(설정 일원화)"
  - "Circuit Breaker: 장애 서비스 호출 차단 + fallback으로 연쇄 장애 방지"
  - "ACL: 서비스 간 모델 공유 금지, 받은 API 결과를 내 모델로 변환"
qa:
  - q: "Circuit Breaker란? 왜 필요한가?"
    a: "MSA는 서비스 간 호출이 많아서, 한 서비스가 느려지거나 죽으면 호출한 쪽 스레드가 묶이면서 장애가 연쇄로 번진다. Circuit Breaker는 서비스 간 의존성이 생기는 접근 지점에 두어, 오류가 나는 서비스에 대해 회로를 열어 호출 자체를 막고 fallback 함수로 기본 응답을 돌려준다. 회로 상태는 Hystrix 같은 대시보드로 모니터링한다. 실패를 전제로 한 설계(Design for failure)의 대표 패턴이다."
  - q: "Anti-corruption Layer(ACL)는 무엇인가?"
    a: "서비스끼리는 API로만 통신하고 서로 모델(클래스)을 공유하지 않되, 호출한 쪽에 ACL을 두어 받은 결과를 자기 도메인 모델로 가공하는 계층이다. 다른 서비스의 모델이 바뀌어도 내 도메인이 오염되지 않아 각 서비스를 독립적으로 개발할 수 있다. 대가로 서비스별 중복 코드와 중복 데이터가 생기는 것은 감수한다. 레거시 시스템과 연동할 때도 ACL로 감싸 어댑터 역할을 시킨다."
  - q: "Config Server와 Tracing은 왜 필요한가?"
    a: "서비스가 많아지면 설정도 흩어지므로 Config Server가 설정을 git 저장소 한곳에 모아 관리 포인트를 일원화한다. 설정이 바뀌어도 앱을 다시 빌드·배포하지 않고 저장소에 push만 하면 된다. 또 하나의 요청이 여러 서비스를 거치므로 Tracing Monitor로 서비스별 타이밍 데이터와 요청 종속성을 모아 어디서 느려졌는지 찾고, 서비스 단위와 연계 관계 모두를 모니터링한다."
related:
  - auth-server-gateway
  - service-discovery-eureka
  - kafka-event-driven
  - cloud-native-12factor
source: "2026-08-27 교재 p.62 (ReArchitecture: BFF, API GW, ACL), p.63 (Component for MSA Service), p.79–81 (서비스간 통신: Circuit Breaker, Anti-corruption Layer, Monitoring)"
---

```layers
Client :: Web UI, Mobile UI, 3rd Party UI
BFF (Backend For Frontend) :: 화면·채널별로 데이터를 가공해 전달
API Gateway :: 단일 진입점, 인증·권한, 프로토콜 변환, 로드밸런싱
Microservices :: Discovery로 이름 호출, Config Server로 설정, Circuit Breaker로 장애 차단
ACL → Legacy :: 레거시 모델 변경이 서비스로 번지지 않게 감싸는 어댑터
```

| 구성요소 | 역할 |
| --- | --- |
| API Gateway | API 단일 진입 포인트, 인증·권한 부여, 프로토콜 변경 |
| Service Discovery | 서비스 네트워크 위치를 등록, 서비스 이름으로 통신 |
| Config Server | 여러 서비스 설정을 git 한곳에, 재빌드·재배포 없이 반영 |
| Tracing Monitor | 서비스 타이밍 데이터 수집, 요청 종속성 확인 |
| Circuit Breaker & Monitor | 오류 서비스를 사용 불가로 전환, 연쇄 오류 방지, fallback |

> [!tip] 실습 코드에서 본 "실패 처리의 차등"
> 같은 호출 실패라도 중요도에 따라 다르게 처리했다. 수강(구독) 신청 중 강의 존재 확인이 실패하면 예외를 던져 신청 자체를 막지만(핵심 거래), 추천 서비스는 이력 조회가 실패해도 빈 이력을 돌려 인기순 목록으로 대체한다(부가 기능, graceful degradation). Circuit Breaker의 fallback과 같은 발상.
