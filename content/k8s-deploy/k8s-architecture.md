---
title: "쿠버네티스 아키텍처"
en: "Kubernetes Architecture"
summary: "컨트롤 플레인(API 서버·etcd·스케줄러·컨트롤러 매니저)이 결정하고 워커 노드(kubelet·kube-proxy·컨테이너 런타임)가 실행한다. 모든 대화는 API 서버를 거친다"
importance: 3
order: 3
tags:
  - Control Plane
  - kubelet
  - etcd
  - Scheduler
keypoints:
  - "API 서버가 유일한 관문, etcd에는 API 서버만 쓰고 나머지는 watch"
  - "스케줄러: 하드 제약으로 거르고(requests·taint·nodeSelector) 점수로 고른다"
  - "API 서버가 멈춰도 돌던 Pod는 계속 동작, 조회·변경만 막힌다"
qa:
  - q: "쿠버네티스 컨트롤 플레인 구성요소와 역할은?"
    a: "kube-apiserver는 모든 요청의 관문으로 인증·인가·검증 후 etcd에 기록한다. etcd는 Raft 합의 기반 분산 키-값 저장소로 클러스터의 유일한 상태 저장소이고, kube-scheduler는 새 Pod를 어느 노드에 둘지 정한다. kube-controller-manager는 Deployment·ReplicaSet·Node·Endpoint 같은 컨트롤러 묶음으로 조정 루프를 돌리고, cloud-controller-manager는 LoadBalancer·노드·EBS 같은 클라우드 자원을 연동한다."
  - q: "워커 노드에는 무엇이 있고 각각 무슨 일을 하나?"
    a: "kubelet은 API 서버를 watch해 자기 노드에 배정된 Pod를 컨테이너 런타임(containerd)에 CRI로 실행시키고, 프로브를 직접 호출하며, 상태를 보고하고, 자원이 부족하면 Pod를 축출한다. kube-proxy는 Service 가상 IP를 Pod IP로 바꾸는 iptables/IPVS 규칙만 설치하고 패킷을 직접 나르지 않는다. 여기에 CNI 플러그인이 Pod IP와 네트워크를, CSI 드라이버가 볼륨을 붙인다."
  - q: "API 서버에서 요청은 어떤 순서로 처리되나?"
    a: "HTTP 핸들러가 요청을 API 객체로 바꾸면 인증(누구인가, 실패 시 Unauthorized)과 인가(RBAC, 실패 시 Forbidden)를 거친다. 그다음 Mutating Admission이 기본 ServiceAccount나 사이드카를 채워 넣고, 스키마 검증, Validating Admission(쿼터·보안 정책)을 통과하면 etcd에 저장된다. 권한은 있는데 거부되면 RBAC이 아니라 Validating Admission의 정책 문제다."
related:
  - declarative-reconciliation
  - pod-status-troubleshooting
  - container/container-runtime-oci
  - k8s-advanced/pod-pause-container
source: "Day1(9/7) 슬라이드 p.34–57 · 심화: k8s-advanced Day1(10/14) p.77–98"
---

```layers
kubectl · CI :: 모든 요청은 API 서버로만
kube-apiserver :: 인증·인가·admission·검증 후 etcd 저장, watch 알림
etcd :: 모든 리소스의 spec·status (클러스터의 유일한 기억)
scheduler · controller-manager · CCM :: 노드 배정, 조정 루프, 클라우드 자원
kubelet · kube-proxy · containerd :: 워커 노드에서 실행·규칙 설치·컨테이너 실행
CNI · CSI :: Pod IP·네트워크, 볼륨 연결
```

```flow
HTTP Handler :: 요청을 API 객체로 (400)
인증 authn :: 토큰·인증서, 누구인가 (Unauthorized)
인가 authz :: RBAC, 할 수 있나 (Forbidden)
Mutating Admission :: 기본값·사이드카 주입
Schema + Validating Admission :: 필드 검증, 쿼터·보안 정책
etcd 저장 :: 여기까지 오면 성공
```

| 멈춘 것 | 계속 되는 것 | 안 되는 것 |
| --- | --- | --- |
| API 서버 | 돌던 Pod, 기존 트래픽 | 조회·배포·모든 변경 |
| etcd | 돌던 Pod | API 서버도 사실상 마비 |
| 스케줄러 | 돌던 Pod, 기존 Pod 재시작 | 새 Pod 배치 (Pending) |
| 컨트롤러 매니저 | 돌던 Pod | 자동 복구·롤아웃 |
| kubelet (한 노드) | 다른 노드 Pod | 그 노드 NotReady → 축출 |
| CoreDNS | IP로 하는 통신 | 이름으로 하는 모든 통신 |

> [!tip] 스케줄러 두 단계
> ① 거르기(하드): requests가 들어갈 자리, nodeSelector, taint/toleration, 노드당 Pod 상한, PV의 AZ. ② 점수(소프트): 자원 균형, affinity, topologySpread. 모든 노드가 ①에서 탈락하면 Pending이고 describe에 `0/N nodes are available` 뒤로 이유가 붙음.
