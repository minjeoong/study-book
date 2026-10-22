---
title: "컨테이너 런타임 구조와 OCI"
en: "Container Runtime · OCI"
summary: "docker run은 dockerd → containerd → containerd-shim → runc로 위임되고, runc가 OCI 번들(config.json + rootfs)로 namespace·cgroup을 만들어 프로세스를 실행"
importance: 3
order: 10
tags:
  - containerd
  - runc
  - OCI
  - CRI
keypoints:
  - "dockerd(진입점) → containerd(고수준: 이미지·생명주기) → shim → runc(저수준)"
  - "OCI 표준 3가지: 이미지 형식, 런타임 번들(config.json+rootfs), 배포 API"
  - "쿠버네티스는 Docker 없이 kubelet → CRI → containerd/CRI-O → runc"
qa:
  - q: "docker run을 치면 내부에서 무슨 일이 일어나나?"
    a: "docker CLI가 UDS(/var/run/docker.sock)로 dockerd에 요청하고 dockerd는 실행을 containerd에 위임한다. containerd는 OverlayFS로 rootfs를 준비하고 실행 설정을 OCI config.json으로 만든 뒤 containerd-shim을 띄운다. shim이 runc를 호출하면 runc가 namespace·cgroup을 설정하고 pivot_root로 루트를 바꾼 다음 CMD/ENTRYPOINT 프로세스를 PID 1로 exec하고 빠지며, 이후 shim이 그 프로세스를 감시하고 로그·exec I/O를 연결한다."
  - q: "OCI 표준이 왜 중요한가?"
    a: "OCI는 이미지 형식, 런타임 번들, 레지스트리 배포 API를 표준화했다. 덕분에 Docker, BuildKit, Kaniko, Buildah로 만든 이미지를 Harbor에 올리고 쿠버네티스의 containerd나 CRI-O가 그대로 받아 실행할 수 있어 특정 벤더에 종속되지 않는다. 이미지 규격(OCI)과 kubelet이 런타임과 대화하는 규격(CRI)은 별개라는 점도 함께 말하면 좋다."
related:
  - namespace-cgroup
  - overlayfs-copy-on-write
  - k8s-deploy/k8s-architecture
  - devops/ci-image-build-tools
source: "Day2(8/24) 슬라이드 p.193–198, p.209–223 (09.runc 실습 1–5), p.260–266"
---

```flow
docker CLI :: UDS(/var/run/docker.sock)로 요청
dockerd :: Docker 진입점, 실행을 containerd에 위임
containerd :: 이미지 pull, OverlayFS rootfs 준비, config.json 생성
containerd-shim :: runc 호출 후 PID 감시·I/O 연결 (podman·CRI-O는 conmon)
runc :: namespace·cgroup 설정 → pivot_root → init 프로세스(PID 1) exec
```

```compare
고수준 런타임 | 저수준 런타임
하는 일 | 이미지 pull, 컨테이너 생명주기 관리, 저수준 런타임 호출 | namespace·cgroup 설정 후 프로세스 실행
예 | containerd, CRI-O, Docker Engine | runc(OCI 참조 구현), crun, youki, runsc(gVisor), kata-runtime
쿠버네티스 | kubelet이 CRI로 직접 호출 | 고수준 런타임이 호출
```

```bash
# runc 를 직접 호출해 보기 (containerd-shim 역할을 사람이 대신)
mkdir -p mybundle/rootfs && cd mybundle
docker export $(docker create alpine:latest) | tar -C rootfs -xf -   # rootfs 준비
runc spec                  # 기본 config.json 생성 → OCI 번들 = config.json + rootfs
runc run mycontainer       # namespace·cgroup 적용 후 sh 가 PID 1
runc list ; runc kill mycontainer KILL ; runc delete mycontainer
```

> [!tip] 컨테이너 생성 흐름 요약
> containerd가 번들을 만들고 → shim이 runc를 fork·exec → runc가 ① namespace 생성·cgroup 설정 ② pivot_root로 / 교체 ③ execve로 init 프로세스 실행 후 PID를 shim에 넘김. 컴포넌트 간 통신은 모두 Unix Domain Socket.
