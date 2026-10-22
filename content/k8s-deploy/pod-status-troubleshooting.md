---
title: "Pod 상태로 진단하기"
en: "Pod Status · Troubleshooting with kubectl"
summary: "apply 한 줄이 컨테이너가 되기까지 단계마다 다른 상태 이름이 나온다. get → describe Events → logs --previous → exec/debug 순서로 좁힌다"
importance: 3
order: 4
tags:
  - kubectl
  - 트러블슈팅
  - Pod
keypoints:
  - "Pending=스케줄러, ImagePullBackOff=레지스트리, CrashLoopBackOff=앱"
  - "Running인데 READY 0/1이면 readiness 실패, Endpoints에서 빠져 503"
  - "CrashLoop은 logs --previous, Pending·ImagePull은 로그가 없으니 describe"
qa:
  - q: "Pod가 CrashLoopBackOff일 때 어떻게 진단하나?"
    a: "먼저 kubectl get pod로 RESTARTS와 READY를 보고, describe pod의 Events와 Last State(OOMKilled 여부, 종료 코드)를 확인한다. 지금 컨테이너는 막 재시작해 로그가 거의 없으므로 kubectl logs --previous로 직전에 죽은 컨테이너의 마지막 로그를 본다. 대부분 설정·환경변수·의존성 문제이거나 liveness가 너무 민감한 경우이고, 재시도 간격은 5초, 10초, 20초… 최대 5분까지 늘어난다."
  - q: "Pod가 Pending에 머물러 있다면?"
    a: "Pending은 아직 노드에 배치되지 않았거나 준비 중인 상태라 컨테이너가 없어 로그도 없다. describe pod의 Events에 0/N nodes are available과 이유가 나오는데, 보통 requests를 수용할 노드 자원 부족, taint·nodeSelector·affinity 불일치, PV의 AZ 불일치 때문이다. 각각 requests 조정이나 노드 증설, 제약 완화, WaitForFirstConsumer로 해결한다."
related:
  - k8s-architecture
  - probes
  - service-endpoints
  - resources-qos
source: "Day1(9/7) 슬라이드 p.38–39, p.58–85, p.90–91, p.100 · Day2(9/8) p.178–179 · 실습 가이드 실습 5–8"
---

```flow
kubectl → API 서버 :: 인증·RBAC 실패면 Unauthorized·Forbidden
스케줄러 노드 배정 :: 못 하면 Pending
kubelet 볼륨·설정 준비 :: 오래 걸리면 ContainerCreating, CreateContainerConfigError
런타임 이미지 pull :: 경로·태그·권한·플랫폼 문제면 ImagePullBackOff
컨테이너 실행 :: 앱이 죽으면 CrashLoopBackOff, 메모리 초과면 OOMKilled
프로브 → Endpoints 등록 :: readiness 실패면 Running 0/1 → 503
```

| STATUS | 뜻 | 먼저 볼 곳 |
| --- | --- | --- |
| Pending | 노드 배정 전, 자원 부족 | describe의 `0/N nodes` |
| ContainerCreating | 볼륨·설정 준비 중 | describe Events (ConfigMap·PVC) |
| ImagePullBackOff | 이미지를 못 받음 | Events의 unauthorized / not found |
| Running (0/1) | readiness 실패 | `get endpoints`, 프로브 경로·포트 |
| CrashLoopBackOff | 떴다 죽기를 반복 | `logs --previous` |
| OOMKilled | 메모리 limit 초과 | describe의 Last State |
| Completed | 정상 종료 (Job이면 정상) | Deployment면 비정상 |
| Evicted | 노드 자원 부족으로 축출 | QoS 클래스, `top nodes` |
| Terminating (오래) | 종료가 안 끝남 | finalizer, 볼륨 detach |

> [!tip] 진단 순서 (손에 붙일 명령)
> ① `kubectl get pod -o wide` (READY·RESTARTS·NODE) → ② `kubectl describe pod <이름> | tail -30` (Events는 아래에서 위로) → ③ `kubectl logs <이름> --previous` → ④ `kubectl exec -it <이름> -- sh`, 셸 없는 이미지는 `kubectl debug -it <이름> --image=busybox --target=app`. 권한 문제는 추측하지 말고 `kubectl auth can-i`, 필드 이름은 `kubectl explain`.

> [!warn] 지우기 전에 get
> 실습 네임스페이스는 반 전체가 공유. `delete pod --all`은 옆 사람 것까지 지운다. delete 앞에는 같은 조건으로 `get`을 먼저 친다.
