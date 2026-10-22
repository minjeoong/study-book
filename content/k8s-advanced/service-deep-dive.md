---
title: "Service 심화 (DNS · EndpointSlice · ExternalName)"
en: "Service Deep Dive"
summary: "Service 이름은 Pod의 resolv.conf search 목록과 CoreDNS로 풀리고, Pod 목록은 EndpointSlice로 쪼개 관리된다. selector 없는 Service·ExternalName으로 외부 대상도 Service처럼 부른다"
importance: 2
order: 10
tags:
  - Service
  - CoreDNS
  - EndpointSlice
  - NodePort
keypoints:
  - "resolv.conf: nameserver=CoreDNS ClusterIP, search 목록, ndots:5"
  - "EndpointSlice: 100개 단위로 쪼개 바뀐 조각만 갱신"
  - "ExternalName은 CNAME만 반환, selector 없는 Service는 수동 Endpoints"
qa:
  - q: "Pod 안에서 서비스 이름이 어떻게 IP로 풀리나?"
    a: "kubelet이 Pod의 /etc/resolv.conf에 nameserver로 CoreDNS의 ClusterIP(10.100.0.10), search로 <ns>.svc.cluster.local, svc.cluster.local, cluster.local, 그리고 options ndots:5를 넣는다. 점이 5개 미만인 이름은 search 도메인을 차례로 붙여 조회하므로 같은 네임스페이스에서는 서비스 이름만으로 CoreDNS가 ClusterIP를 돌려주고, 이후 iptables가 Pod IP로 DNAT한다. 반대로 외부 도메인도 search를 먼저 시도해서 조회가 느려질 수 있다."
  - q: "Endpoints 대신 EndpointSlice가 나온 이유는?"
    a: "Endpoints는 Service 하나의 모든 Pod IP를 객체 하나에 담아서, Pod 300개 중 하나만 바뀌어도 전체 객체를 갱신하고 모든 노드의 kube-proxy가 규칙을 다시 계산해야 했다. EndpointSlice는 기본 100개 단위로 나눠 바뀐 슬라이스만 갱신하므로 대규모 클러스터에서 부하가 크게 준다. v1.33부터 v1 Endpoints는 deprecated이고 내부는 EndpointSlice로 동작한다."
  - q: "NodePort와 HostPort의 차이는?"
    a: "NodePort는 노드에서 실제로 Listen하는 프로세스가 없고, kube-proxy가 만든 netfilter 규칙(KUBE-NODEPORTS → KUBE-SVC → KUBE-SEP)이 모든 노드에서 패킷을 가로채 Pod IP로 DNAT한다. HostPort는 Pod가 그 노드의 포트를 실제로 점유하는 방식이라 docker run -p와 비슷하고, 같은 노드에 같은 포트의 Pod를 하나만 둘 수 있다."
related:
  - k8s-deploy/service-endpoints
  - statefulset-headless
  - k8s-deploy/ingress
source: "Self Study 슬라이드 p.313–338 (10.service: 수동 Endpoints, NodePort, ExternalName 실습)"
---

```flow
앱이 http://myfirst-api-server:8080 호출 :: 점이 ndots(5)보다 적은 짧은 이름
resolv.conf search 적용 :: myfirst-api-server.class-0.svc.cluster.local
CoreDNS (10.100.0.10) :: Service 이름 → ClusterIP
kube-proxy iptables :: ClusterIP → EndpointSlice의 Pod IP 중 하나로 DNAT
Pod :: 컨테이너 8080 수신
```

| 기능 | 무엇 | 쓸 곳 |
| --- | --- | --- |
| selector 없는 Service + 수동 Endpoints | Endpoints를 직접 작성해 원하는 IP로 라우팅 | 클러스터 밖 DB·레거시 서버를 Service 이름으로 |
| `kubernetes.default.svc` | selector 없이 API 서버 IP가 수동 등록된 Service | Pod 안에서 API 서버 호출 |
| ExternalName | ClusterIP·Endpoints·iptables 없이 CNAME만 반환 | 외부 API·DB 이름 추상화, 대상 교체 |
| LoadBalancer target type | instance: NLB → NodeIP:NodePort → Pod / ip: NLB → Pod IP 직접 | EKS는 ip 권장 (Fargate도 가능) |

> [!warn] LoadBalancer Service를 고를 때
> Service 하나당 LB 하나라 비용이 늘고, 경로 기반 라우팅·TLS 종료가 없음. HTTP 서비스가 여럿이면 Ingress, LoadBalancer는 외부에서 직접 붙어야 하는 TCP/UDP 서비스(SSH 22, MySQL 3306, Redis 6379, Kafka 9092 등)나 Ingress Controller 자신의 노출에 쓴다.
