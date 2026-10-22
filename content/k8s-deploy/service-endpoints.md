---
title: "Service와 Endpoints"
en: "Service · Endpoints · Cluster DNS"
summary: "계속 바뀌는 Pod IP 앞에 고정 가상 IP(ClusterIP)와 DNS 이름을 주고, selector로 찾은 Ready Pod 목록(Endpoints)으로 분산하는 추상화"
importance: 3
order: 8
tags:
  - Service
  - kube-proxy
  - CoreDNS
  - 네트워크
keypoints:
  - "Service는 실체가 없다: kube-proxy가 각 노드에 깐 iptables DNAT 규칙"
  - "Endpoints가 비면 즉시 거부(503): 원인은 selector 오타 아니면 Ready 아님"
  - "DNS: 서비스.네임스페이스.svc.cluster.local, 같은 NS면 이름만"
qa:
  - q: "Service가 필요한 이유와 동작 원리는?"
    a: "Pod는 재시작·스케일·배포 때마다 IP가 바뀌므로 설정에 적어 둘 수 없다. Service는 클러스터 수명 동안 바뀌지 않는 ClusterIP와 DNS 이름을 주고, selector 라벨과 맞는 Ready Pod를 Endpoints로 관리한다. 실제 분산은 kube-proxy가 각 노드에 설치한 iptables/IPVS 규칙이 ClusterIP:port를 Pod IP:targetPort 중 하나로 DNAT하는 방식이라, ClusterIP로 ping은 안 되고 curl은 된다."
  - q: "ClusterIP, NodePort, LoadBalancer의 차이는?"
    a: "ClusterIP는 기본값으로 클러스터 안에서만 쓰는 가상 IP다. NodePort는 모든 노드의 30000–32767 포트를 열어 노드IP:nodePort → ClusterIP:port → PodIP:targetPort로 넘긴다. LoadBalancer는 그 위에 클라우드 LB(EKS는 NLB)를 자동 생성하는데 Service마다 LB가 하나라 비싸서, HTTP는 Ingress 하나로 묶는 것이 보통이다."
  - q: "Pod는 Running인데 Service로 503이 나면?"
    a: "kubectl get endpoints부터 본다. 비어 있다면 Service selector와 Pod 라벨이 다르거나, Pod가 readiness 실패로 READY 0/1인 경우다. describe svc의 Selector와 get pods --show-labels로 라벨을 대조하고, Endpoints가 차 있는데 안 된다면 targetPort 불일치나 앱이 127.0.0.1에만 바인딩한 것처럼 Pod 쪽 문제를 본다."
related:
  - ingress
  - probes
  - declarative-reconciliation
  - k8s-advanced/service-deep-dive
  - k8s-advanced/statefulset-headless
source: "Day2(9/8) 슬라이드 p.115–138 (호출 흐름 추적 포함) · 실습 가이드 실습 10(Endpoints에서 빠지는 순간)"
---

```flow
http://shop-api:80 :: 앱은 IP가 아니라 Service 이름으로 호출
CoreDNS :: 이름 → ClusterIP (resolv.conf search 목록 덕에 짧은 이름 가능)
iptables DNAT ① :: 노드 커널이 ClusterIP:80 을 가로챔
iptables DNAT ② :: Endpoints 중 하나의 PodIP:8080 으로 (확률 분산)
Pod :: 0.0.0.0:8080 으로 Listen 하는 앱 프로세스
```

| 종류 | 접근 범위 | 동작 | 실무 |
| --- | --- | --- | --- |
| ClusterIP | 클러스터 안 | 가상 IP + kube-proxy 규칙 | 기본값, 대부분 |
| NodePort | 노드IP:30000–32767 | 모든 노드에 같은 포트 개방 | 테스트·온프레미스 진입점 |
| LoadBalancer | 외부 | 클라우드 LB 자동 생성 (EKS: NLB) | Service당 LB 하나, 비쌈 |
| ExternalName | DNS | CNAME 반환 | 외부 RDS를 이름으로 |
| Headless | 클러스터 안 | `clusterIP: None`, Pod IP 직접 반환 | StatefulSet |

> [!tip] 진단은 아래 층부터 (netshoot 임시 Pod 안에서)
> ① Pod IP로 직접 curl → 앱 응답 확인 ② Service IP로 → kube-proxy 규칙 ③ Service 이름으로 → DNS ④ `kubectl get endpoints`. ①은 되는데 ②가 안 되면 Service 설정(포트·셀렉터), ②는 되는데 ③이 안 되면 DNS 문제. 다른 네임스페이스면 `이름.네임스페이스`로 부른다.

> [!warn] 세션
> 기본은 요청마다 다른 Pod로 가므로 메모리 세션은 깨짐. 정답은 세션을 Redis·DB나 JWT로 밖에 빼는 것, `sessionAffinity: ClientIP`는 임시방편.
