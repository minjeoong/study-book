---
title: "Docker 네트워크 (bridge · host · custom)"
en: "Docker Networking"
summary: "컨테이너마다 veth 가상 NIC를 주고 docker0 같은 리눅스 브리지(L2)에 연결, 외부 포트는 iptables DNAT로 컨테이너 IP:포트에 매핑"
importance: 2
order: 11
tags:
  - 네트워크
  - bridge
  - NAT
keypoints:
  - "bridge(docker0): 기본값, 격리 O, 컨테이너 이름 DNS 해석 X"
  - "custom bridge: 내장 DNS로 이름 통신, 실무 기본 / host: NAT 없음, 최고 성능"
  - "-p 8888:8080은 netfilter PREROUTING에서 DNAT로 172.17.0.x:8080에 전달"
qa:
  - q: "기본 bridge와 사용자 정의 bridge의 차이는?"
    a: "둘 다 컨테이너를 리눅스 브리지에 veth로 연결하고 격리하지만, 기본 docker0 bridge에는 DNS가 없어 IP로만 통신한다. docker network create로 만든 custom bridge는 Docker 내장 DNS가 동작해 컨테이너 이름이나 서비스 이름으로 서로를 부를 수 있다. 그래서 수업에서도 skala 네트워크를 만들어 spring-backend가 mariadb를, nginx가 spring-backend를 이름으로 찾게 했다."
  - q: "호스트 포트로 들어온 요청이 컨테이너까지 가는 경로는?"
    a: "패킷이 호스트 NIC로 들어오면 netfilter PREROUTING의 NAT 규칙이 목적지를 컨테이너 IP:포트로 DNAT한다. 커널 라우팅 테이블이 172.17.0.0/16 대역을 docker0로 보내고, 커널이 ARP 테이블로 컨테이너 MAC을 찾아 프레임을 만들면 docker0 브리지가 FDB에서 그 MAC에 해당하는 veth 포트를 찾아 컨테이너 eth0로 전달한다."
related:
  - docker-compose
  - namespace-cgroup
  - k8s-deploy/service-endpoints
source: "Day2(8/24) 슬라이드 p.199–210 (Calico·CIDR·UDS 참고 포함)"
---

```compare
bridge (docker0) | custom bridge | host
생성 | 기본 | `docker network create my-bridge` | `--network host`
격리 | O | O | X (호스트 네트워크 그대로)
이름(DNS) 해석 | X | O (내장 DNS) | X
성능 | 보통 | 보통 | 최고 (veth·NAT 없음)
용도 | 단순 테스트 | 실무 기본 | 성능 최우선
```

```flow
외부 Client → Host eth0 :: 192.168.1.22:8888 로 요청
netfilter PREROUTING :: iptables NAT 규칙으로 172.17.0.3:8080 DNAT
커널 라우팅 :: 172.17.0.0/16 → docker0 결정
docker0 브리지 (L2) :: FDB에서 목적지 MAC의 veth 포트 검색
veth → 컨테이너 eth0 :: 컨테이너 프로세스가 8080에서 수신
```

> [!note] 쿠버네티스로 가면
> Docker 네트워크는 단일 노드 통신만 정의함. 쿠버네티스는 CNI 플러그인(Calico, EKS VPC CNI)이 멀티 노드 Pod 통신을 맡고, 서비스 디스커버리는 CoreDNS, 보안 정책은 NetworkPolicy가 담당.
