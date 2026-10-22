---
title: "선언형 API와 조정 루프"
en: "Declarative API · Reconciliation Loop"
summary: "매니페스트에 원하는 상태(spec)를 적으면 컨트롤러가 현재 상태(status)와 계속 비교해 차이를 메우는 쿠버네티스의 핵심 동작 원리"
importance: 3
order: 1
tags:
  - Kubernetes
  - 선언형
  - Controller
  - Label
keypoints:
  - "spec은 내가 쓰는 소원, status는 클러스터가 채우는 현실"
  - "Pod를 지워도 다시 생기는 건 ReplicaSet이 라벨로 개수를 세서 새로 만들기 때문"
  - "디버깅은 명령형(run·scale), 운영은 선언형(apply -f + Git)"
qa:
  - q: "쿠버네티스의 선언형 방식이란?"
    a: "무엇을 하라는 명령 대신 어떤 상태여야 하는지를 매니페스트의 spec에 적어 API 서버에 제출하는 방식이다. 컨트롤러는 etcd에 저장된 spec과 실제 status를 계속 비교하고 차이가 있으면 Pod를 만들거나 지워 맞춘다. 이 반복이 조정 루프이고, 그래서 replicas: 3인 Deployment의 Pod를 지워도 이름이 다른 새 Pod가 생겨 3개로 돌아온다."
  - q: "명령형 kubectl과 선언형 apply의 차이는?"
    a: "kubectl create나 scale은 지금 할 동작을 지시하므로 두 번 실행하면 이미 있다는 에러가 나고 누가 무엇을 바꿨는지 기록이 남지 않는다. kubectl apply -f는 파일에 적은 최종 상태로 맞추므로 몇 번 실행해도 결과가 같은 멱등성이 있고, 파일을 Git에 두면 Git 이력이 곧 변경 이력이며 클러스터가 사라져도 재현할 수 있다. 그래서 실습·디버깅은 명령형, 운영은 선언형으로 한다."
  - q: "Deployment는 자기 Pod를 어떻게 알아보나?"
    a: "이름이 아니라 라벨로 찾는다. ReplicaSet은 selector.matchLabels와 같은 라벨을 가진 Pod가 몇 개인지만 센다. 실습에서 Pod 하나의 app 라벨을 떼자 ReplicaSet이 하나 모자란다며 새 Pod를 만들었고, 라벨을 뗀 Pod는 종료되지 않고 고아로 남았다. Deployment의 selector는 만든 뒤 바꿀 수 없다."
related:
  - k8s-architecture
  - deployment-rolling-update
  - service-endpoints
  - devops/gitops
source: "Day1(9/7) 슬라이드 p.3–19, p.40–41 · 실습 가이드 실습 2(조정 루프와 술래잡기), 실습 4(라벨 하나로 트래픽을 훔친다)"
---

```flow
매니페스트 작성 :: spec.replicas: 3 — 명령이 아니라 원하는 상태
kubectl apply :: API 서버가 검증 후 etcd에 저장
컨트롤러 watch :: 현재 status와 spec을 비교
차이 해소 :: 부족하면 template으로 Pod 생성, 남으면 삭제
반복 :: status가 spec을 따라잡을 때까지 계속
```

```compare
명령형 | 선언형
명령 | `kubectl run`, `create`, `scale --replicas=5` | `kubectl apply -f`
적는 것 | 지금 할 동작 | 최종 상태
두 번 실행 | 이미 있음 에러 | 결과가 같다 (멱등)
변경 기록 | 남지 않음 | Git 이력이 곧 변경 이력
클러스터 유실 시 | 복원 불가 | apply로 재현
쓸 곳 | 임시 확인, 디버깅 Pod | 운영에 올라가는 모든 것
```

> [!note] Manifest vs Resource
> Manifest는 내 노트북·Git에 있는 YAML 요청서, Resource는 etcd에 만들어진 실물. 파일을 지워도 리소스는 남고, 파일을 고쳐도 apply하기 전에는 클러스터가 바뀌지 않음. `kubectl get deploy`의 READY가 2/3이면 status가 spec을 아직 못 따라잡은 것.

> [!warn] kubectl edit의 함정
> 운영 클러스터를 `edit`로 고치면 Git과 실제가 어긋나고 다음 apply 때 되돌아감. 급하면 고치되 그날 안에 파일에 반영.
