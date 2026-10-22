---
title: "Pod 내부 구조와 pause 컨테이너"
en: "Pod Sandbox · pause Container"
summary: "Pod마다 pause(sandbox) 컨테이너가 먼저 떠 Network·IPC·UTS 네임스페이스를 잡고, 앱 컨테이너들이 거기에 합류해 IP와 localhost를 공유"
importance: 2
order: 1
tags:
  - Pod
  - pause
  - namespace
  - CNI
keypoints:
  - "pause는 아무 일도 안 하며 Pod 네임스페이스·veth·Pod IP를 붙잡아 둠"
  - "공유: Network·UTS·IPC / 분리: PID(기본)·Mount·User"
  - "컨테이너가 죽으면 kubelet이 그 컨테이너만 재시작, Pod IP·볼륨은 유지"
qa:
  - q: "pause 컨테이너는 왜 있나?"
    a: "Pod의 네트워크 네임스페이스와 IP를 특정 앱 컨테이너의 수명과 분리하기 위해서다. kubelet이 Pod를 만들면 먼저 pause 이미지로 sandbox 컨테이너를 띄워 네임스페이스를 만들고 CNI가 veth와 IP를 붙인다. 앱 컨테이너들은 setns로 이 네임스페이스에 합류하므로 앱 컨테이너가 재시작돼도 Pod IP는 그대로이고, 네임스페이스 수명이 곧 Pod 수명이 된다."
  - q: "같은 Pod의 컨테이너는 무엇을 공유하고 무엇을 공유하지 않나?"
    a: "Network(IP·포트 공간·localhost), UTS(호스트명), IPC(공유 메모리·세마포어)는 공유한다. PID 네임스페이스는 기본적으로 분리되고 spec.shareProcessNamespace: true일 때만 공유하며, 루트 파일시스템(Mount)도 분리되어 파일은 volumeMounts로만 공유한다. 그래서 두 컨테이너가 같은 포트를 Listen할 수 없다."
related:
  - k8s-deploy/pod-basics
  - container/namespace-cgroup
  - k8s-deploy/k8s-architecture
source: "Day1(10/14) 슬라이드 p.42–50, p.86–89"
---

```layers
Pod (스케줄링·배포 최소 단위) :: Pod IP 하나, 같은 노드에서 함께 생성·종료
앱 컨테이너 · 사이드카 :: setns로 pause의 네임스페이스에 합류, 각자 rootfs
pause (sandbox) 컨테이너 :: Network·IPC·UTS 네임스페이스 생성·유지, 아무 일도 안 함
CNI 플러그인 :: veth pair 생성, IP 할당, 브리지·오버레이(EKS는 VPC IP) 연결
kubelet → CRI → containerd :: sandbox부터 만들고 컨테이너를 차례로 실행
```

| 네임스페이스 | Pod 내 공유 | 비고 |
| --- | --- | --- |
| Network | O | 같은 IP·포트 공간, localhost 통신 |
| UTS | O | 호스트명 = Pod 이름 |
| IPC | O | 공유 메모리, 세마포어 |
| PID | X (기본) | `shareProcessNamespace: true`면 공유 |
| Mount | X | 파일은 volumeMounts로만 공유 |
| User | X | User Namespaces 사용 시 개별 매핑 |

> [!note] Pod 네트워크 모델
> 클러스터의 모든 Pod는 하나의 평평한(flat) 주소 공간에 있어 Pod 사이에 NAT가 없고 서로 Pod IP로 직접 통신함. 그래도 Pod IP는 재생성 시 바뀌므로 직접 호출하지 않고 Service를 쓴다.
