---
title: "Deployment 롤링 업데이트와 무중단 배포"
en: "Deployment · Rolling Update · Zero-downtime"
summary: "Deployment는 버전(ReplicaSet)을, ReplicaSet은 개수를 관리한다. 새 Pod가 Ready가 되면 옛 Pod를 줄이는 롤링 업데이트와 rollout undo 롤백"
importance: 3
order: 7
tags:
  - Deployment
  - ReplicaSet
  - Rolling Update
  - Graceful Shutdown
keypoints:
  - "새 버전마다 새 ReplicaSet, 옛 RS는 replicas=0으로 남아 롤백 재료가 됨"
  - "maxSurge(더 만들 수)·maxUnavailable(줄어도 되는 수), 기본 25%/25%"
  - "무중단 조건: readiness, maxUnavailable 0, preStop, graceful, 2개 이상"
qa:
  - q: "롤링 업데이트는 어떻게 동작하나?"
    a: "이미지를 바꾸면 Deployment가 새 ReplicaSet을 만들고 maxSurge만큼 새 Pod를 띄운다. 새 Pod가 readinessProbe를 통과해 Ready가 되면 옛 ReplicaSet의 Pod를 하나 줄이고, 이를 반복해 새 RS가 목표 개수가 되면 옛 RS는 0으로 남는다. replicas 3, maxSurge 1, maxUnavailable 0이면 Pod 수는 3과 4 사이를 오가며 서비스 가능한 Pod가 3 아래로 내려가지 않는다."
  - q: "롤백은 어떻게 하고 무엇이 돌아오나?"
    a: "kubectl rollout undo로 직전 리비전, --to-revision으로 특정 리비전으로 돌아간다. 옛 ReplicaSet을 다시 키우는 것이라 빠르지만, 돌아오는 것은 매니페스트일 뿐 DB 스키마나 데이터는 돌아오지 않는다. 또 Git은 그대로이므로 코드도 함께 되돌려야 다음 배포에서 문제 버전이 다시 올라가지 않고, change-cause 애노테이션을 남겨 두면 어느 리비전으로 갈지 바로 판단할 수 있다."
  - q: "Pod가 종료될 때 502가 나는 이유와 해결책은?"
    a: "Pod 삭제 시 Endpoints 제거와 SIGTERM 전달이 거의 동시에 일어나는데, Endpoints 제거가 각 노드의 iptables와 LB에 전파되기까지 시간이 걸려 이미 라우팅된 요청이 종료 중인 Pod로 간다. preStop에 sleep 5를 두어 전파를 기다린 뒤 SIGTERM을 받게 하고, 앱은 server.shutdown: graceful로 처리 중 요청을 마친다. terminationGracePeriodSeconds는 preStop과 앱 유예 시간의 합보다 길게(5 + 25 < 40) 잡는다."
related:
  - probes
  - declarative-reconciliation
  - container/pid1-graceful-shutdown
  - k8s-advanced/blue-green-canary
  - k8s-advanced/pod-lifecycle-hooks
source: "Day1(9/7) 슬라이드 p.95 · Day2(9/8) p.102–114, p.172 · 실습 가이드 실습 9(실패하는 배포 만들기) · 심화: k8s-advanced Day1(10/14) p.119–137"
---

```flow
set image / apply :: 새 ReplicaSet 생성
새 Pod 1개 추가 :: maxSurge 1 → 잠깐 4개
readiness 통과 :: 새 Pod Ready (이걸 기다리는 게 핵심)
옛 Pod 1개 종료 :: maxUnavailable 0 → 서비스 가능 3개 유지
반복 후 완료 :: 새 RS 3, 옛 RS 0 (롤백용으로 남음)
```

```flow
삭제 표시 :: deletionTimestamp, Terminating
Endpoints 제거 :: 새 트래픽 차단 (비동기, 전파 지연)
preStop 훅 :: sleep 5로 전파 대기
SIGTERM :: 앱이 graceful shutdown 시작
grace period 초과 :: SIGKILL (기본 30초)
```

| 무중단에 필요한 것 | 없으면 | 설정 |
| --- | --- | --- |
| readinessProbe | 기동 중 Pod로 트래픽 | `/actuator/health/readiness` |
| maxUnavailable: 0 | 배포 중 용량 감소 | `strategy.rollingUpdate` |
| preStop sleep | 종료 중 Pod로 트래픽 → 502 | `lifecycle.preStop` |
| graceful shutdown | 처리 중 요청 끊김 | `server.shutdown: graceful` |
| 복제본 2개 이상 | 교체 동안 서비스 공백 | `replicas >= 2` |
| PodDisruptionBudget | 노드 작업 시 한꺼번에 내려감 | `minAvailable` |

> [!tip] 실습 9: 실패하는 배포
> 없는 태그로 `set image` → 새 Pod는 ImagePullBackOff, 기존 Pod는 그대로 Running이라 호출 루프에 200만 찍힘. 새 Pod가 Ready가 안 되니 옛 Pod를 영원히 안 내리기 때문. 기본값 25%였다면 용량이 75%로 줄어든 채 멈춤. CI는 `kubectl rollout status --timeout`의 종료 코드로 성공을 판단해야 함.

> [!warn] 헷갈리기 쉬움
> HPA를 붙였으면 매니페스트에서 `replicas`를 빼야 apply마다 3으로 되돌아가지 않음. RWO 볼륨을 쓰는 Deployment는 새 Pod가 볼륨을 못 붙여 교착되므로 `strategy: Recreate`(다운타임 발생).
