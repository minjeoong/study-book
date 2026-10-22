---
title: "VM vs 컨테이너"
en: "Virtual Machine vs Container"
summary: "VM은 하이퍼바이저 위에 Guest OS째로 올리고, 컨테이너는 호스트 커널을 공유한 채 앱과 라이브러리만 격리해 실행"
importance: 3
order: 1
tags:
  - 가상화
  - Hypervisor
  - 컨테이너
keypoints:
  - "VM은 Guest OS 포함 수 GB·부팅 수십 초, 컨테이너는 수십~수백 MB·밀리초~초"
  - "커널 공유라 이식성·집적도는 높지만 Host와 같은 OS 계열만 실행 가능"
  - "Type 1(ESXi·KVM)은 베어메탈 위, Type 2(VirtualBox)는 Host OS 위에서 동작"
qa:
  - q: "VM과 컨테이너의 차이를 설명해 달라."
    a: "VM은 하이퍼바이저가 가상 하드웨어를 만들고 그 위에 Guest OS 전체를 올리기 때문에 이미지가 수 GB이고 부팅에 수십 초 이상 걸린다. 컨테이너는 호스트의 리눅스 커널을 공유하고 namespace로 프로세스만 격리하므로 이미지에는 앱과 bin/lib만 들어가 수십~수백 MB이고 기동은 프로세스 실행 수준이다. 그래서 집적도와 이식성은 컨테이너가 높지만, 커널을 공유하므로 Host와 다른 OS 계열은 돌릴 수 없고 격리 강도는 VM이 더 강하다."
  - q: "컨테이너가 VM보다 안전한가?"
    a: "아니다. 컨테이너는 같은 커널을 공유하므로 커널 취약점 하나가 모든 컨테이너에 영향을 줄 수 있다. 그래서 non-root 실행, capabilities 최소화, SELinux/AppArmor, seccomp 같은 추가 장치를 함께 쓴다. 더 강한 격리가 필요하면 gVisor(runsc)나 Kata 같은 경량 VM 기반 런타임을 쓴다."
related:
  - namespace-cgroup
  - container-runtime-oci
  - k8s-deploy/declarative-reconciliation
source: "Day1(8/21) 슬라이드 p.11–23"
---

```layers
App A · App B · App C :: 컨테이너마다 앱 + 필요한 bin/lib만 (OS 이미지 없음)
Container Engine :: Docker·containerd가 namespace·cgroup으로 격리
Host OS (Linux Kernel) :: 모든 컨테이너가 하나의 커널을 공유
Hardware :: 물리 서버 또는 클라우드 VM
```

```compare
VM | 컨테이너
격리 | 하이퍼바이저 + VM마다 Guest OS | 호스트 커널 공유 + namespace
이미지 | OS·가상 디바이스 포함, 수 GB~수십 GB | 앱 + bin/lib, 수십~수백 MB
기동 | OS 부팅, 수십 초~수 분 | 프로세스 실행, 밀리초~초
집적도 | 물리 서버당 4~6 VM | 물리 서버당 20~30 컨테이너
이식성 | 같은 하이퍼바이저끼리 | 물리·가상·클라우드 어디서나 동일
이기종 OS | 가능 | 불가 (Host와 같은 OS 계열)
베어메탈 대비 성능 | 50~80% | 약 98%
```

| 하이퍼바이저 | 구조 | 예 | 용도 |
| --- | --- | --- | --- |
| Type 1 (Bare-metal) | 하드웨어 위에 바로, OS 오버헤드 없음 | VMware ESXi, Hyper-V, KVM, Xen | 데이터센터·클라우드 |
| Type 2 (Hosted) | 기존 Host OS 위 프로그램 | VMware Workstation, VirtualBox, Parallels | 개발자 PC 테스트 |

> [!tip] 면접 팁
> VM의 고질적 문제 세 가지(거대한 이미지, 느린 시작, VM 간 환경 불일치)를 먼저 말하고, 컨테이너가 "OS를 이미지에서 빼고 앱 실행 환경만 묶어서" 해결했다고 연결하면 깔끔함.
