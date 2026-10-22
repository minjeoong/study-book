---
title: "Probe 3종 (startup · liveness · readiness)"
en: "Startup · Liveness · Readiness Probe"
summary: "kubelet이 직접 호출하는 헬스체크. readiness 실패는 트래픽만 끊고, liveness 실패는 컨테이너를 재시작, startup은 느린 기동을 기다려 준다"
importance: 3
order: 6
tags:
  - Probe
  - Health Check
  - Spring Boot Actuator
keypoints:
  - "readiness 실패 → Endpoints에서 제외(재시작 없음), liveness 실패 → 재시작"
  - "startupProbe가 성공할 때까지 liveness·readiness는 실행되지 않음"
  - "liveness에 DB 확인 금지: DB가 흔들리면 전 Pod 재시작 폭풍"
qa:
  - q: "liveness와 readiness probe의 차이는?"
    a: "readiness는 이 Pod가 지금 트래픽을 받아도 되는지를 보며, 실패하면 Endpoints에서 빠져 요청이 오지 않지만 컨테이너는 그대로 둔다. liveness는 프로세스가 살아 있는지를 보며, 실패하면 kubelet이 컨테이너를 죽이고 재시작한다. 실습에서 /api/unready로 readiness만 내리자 READY 0/1, RESTARTS 0으로 트래픽만 끊기는 것을 확인했다."
  - q: "startupProbe는 왜 필요한가?"
    a: "JVM처럼 기동이 느린 앱은 liveness가 기동 중에 실패로 판단해 계속 재시작시킬 수 있다. startupProbe는 성공할 때까지 다른 프로브를 멈추고 기동 유예를 준다. periodSeconds 5, failureThreshold 30이면 최대 150초를 기다리되 빨리 뜨면 즉시 넘어가므로 initialDelaySeconds를 고정하는 것보다 낫다."
  - q: "liveness에 DB 연결 확인을 넣으면 왜 위험한가?"
    a: "DB가 잠깐 흔들리면 모든 복제본의 liveness가 동시에 실패해 전 Pod가 한꺼번에 재시작되는 재시작 폭풍이 생기고, 재시작해도 DB 문제는 풀리지 않는다. 의존성 확인은 트래픽만 끊는 readiness에 넣고 liveness는 프로세스 자체만 가볍게 본다. Spring Boot 기본 /actuator/health는 DB까지 보므로 /actuator/health/liveness와 /readiness 그룹을 나눠 쓴다."
related:
  - pod-basics
  - deployment-rolling-update
  - service-endpoints
  - k8s-advanced/pod-lifecycle-hooks
source: "Day1(9/7) 슬라이드 p.93–94 · Day2(9/8) p.171, p.174 · 실습 가이드 실습 7(프로브를 직접 흔들어 본다) · 심화: k8s-advanced Self Study p.298–312"
---

```compare
startupProbe | livenessProbe | readinessProbe
묻는 것 | 다 떴나 | 살아 있나 | 트래픽 받아도 되나
실패하면 | 컨테이너 재시작 | 컨테이너 재시작 | Endpoints에서 제외 (재시작 X)
언제 | 기동이 오래 걸리는 앱 | 데드락 등 스스로 못 푸는 상태 | 기동 중·과부하·의존성 장애
잘못 쓰면 | 없으면 liveness가 기동 중에 죽임 | 너무 민감하면 무한 재시작 | 없으면 준비 전에 503
```

```yaml
startupProbe:                  # 기동 유예 최대 5 × 30 = 150초
  httpGet: { path: /actuator/health/liveness, port: mgmt }
  periodSeconds: 5
  failureThreshold: 30
livenessProbe:                 # 가볍게 — 의존성 확인 X
  httpGet: { path: /actuator/health/liveness, port: mgmt }
  periodSeconds: 10
  timeoutSeconds: 3            # 기본 1초는 JVM에 짧다
  failureThreshold: 3
readinessProbe:                # 의존성까지 — 실패 시 트래픽만 끊김
  httpGet: { path: /actuator/health/readiness, port: mgmt }
  periodSeconds: 5
  timeoutSeconds: 3
```

> [!tip] 관리 포트 분리
> Actuator를 `management.server.port: 8081`로 분리하고 프로브는 8081(mgmt)을 보게 하면, Service·Ingress는 8080만 노출하므로 `/actuator`가 인터넷에 열리지 않음. `management.endpoint.health.probes.enabled: true`로 liveness/readiness 그룹을 켜야 함.
