---
title: "namespace · cgroup · capabilities"
en: "Linux Namespace · cgroup · Capabilities"
summary: "컨테이너는 VM이 아니라 namespace로 보이는 세상을 나누고 cgroup으로 자원을 제한한 리눅스 프로세스 묶음"
importance: 3
order: 8
tags:
  - Linux Kernel
  - 격리
  - 보안
keypoints:
  - "namespace: PID·Network·Mount·UTS·IPC·User를 분리해 독립 OS처럼 보이게 함"
  - "cgroup: CPU·Memory·Block I/O·PIDs 제한, 메모리 초과 시 OOM Kill(137)"
  - "capabilities가 root 권한을 약 40개로 쪼개고, SELinux가 접근을 강제 통제"
qa:
  - q: "컨테이너 격리는 어떤 커널 기능으로 구현되나?"
    a: "namespace와 cgroup이 핵심이다. namespace는 PID, Network, Mount, UTS, IPC, User 같은 커널 자원의 뷰를 분리해 컨테이너 안에서는 PID 1부터 시작하는 자기 프로세스 트리, 자기 네트워크, 자기 루트 파일시스템만 보이게 한다. cgroup은 프로세스 그룹의 CPU, 메모리, I/O, 프로세스 수를 제한·측정한다. 여기에 capabilities, SELinux/AppArmor, seccomp로 권한을 더 좁힌다."
  - q: "컨테이너가 메모리 limit을 넘으면 어떻게 되나?"
    a: "cgroup의 memory limit을 넘으면 리눅스 커널의 OOM Killer가 프로세스를 강제 종료한다. containerd-shim이 PID 1 종료를 감지해 containerd에 알리고, Docker에서는 Exited(137), 쿠버네티스에서는 OOMKilled로 표시된다. CPU는 limit을 넘어도 죽지 않고 스로틀링으로 느려진다."
  - q: "root로 실행하는 컨테이너가 위험한 이유와 capabilities의 역할은?"
    a: "전통 리눅스는 UID 0이면 시스템 전체를 할 수 있어서, 80번 포트 하나를 쓰려고 root로 띄운 프로세스가 탈취되면 전체 권한이 넘어간다. capabilities는 root 권한을 NET_BIND_SERVICE(1024 미만 포트), NET_ADMIN(네트워크 설정), SYS_ADMIN(mount 등)처럼 약 40개로 나눠 필요한 것만 준다. SELinux는 root이고 모든 capability가 있어도 정책에 allow가 없으면 커널 단에서 접근을 막는다."
related:
  - vm-vs-container
  - overlayfs-copy-on-write
  - container-runtime-oci
  - k8s-advanced/security-context
  - k8s-advanced/pod-pause-container
source: "Day2(8/24) 슬라이드 p.179–186, p.224–225 · runc 실습 3–4 (p.220–221)"
---

```layers
컨테이너 프로세스 :: 호스트에서 ps로 보이는 일반 리눅스 프로세스
namespace :: 시야 격리 — PID·NET·MNT·UTS·IPC·USER
cgroup :: 자원 제한 — cpu·memory·blkio·pids
capabilities · SELinux · seccomp :: 권한 최소화
rootfs (OverlayFS) :: 이미지 레이어를 합친 독립 루트 파일시스템
Host Linux Kernel :: 모든 컨테이너가 공유
```

| namespace | 분리하는 것 |
| --- | --- |
| PID | 프로세스 테이블. 컨테이너 안에서 PID 1부터 시작, 다른 컨테이너 프로세스 접근 불가 |
| Network | veth, IP, 포트, 라우팅·필터링 테이블 |
| Mount | 파일시스템 트리. 특정 디렉터리를 루트(rootfs)로 보이게 함 |
| UTS | hostname, domain name |
| IPC | 공유 메모리, 메시지 큐, 세마포어 |
| User | UID/GID 공간 |

> [!tip] cgroup은 docker run 옵션으로 체감
> `docker run --cpus="2.0" --memory="512m" nginx`. 컨트롤러별 동작: cpu는 CFS quota·period로 제한, memory는 초과 시 OOM kill, blkio는 읽기/쓰기 속도 제한, pids는 프로세스 수 제한. 네트워크 대역폭은 cgroup만으로는 제한 불가(tc 필요).

> [!note] runc 실습에서 확인한 것
> config.json의 namespaces에서 `pid`를 빼면 컨테이너 안 `ps -ef`에 호스트 프로세스가 보이고, `network`를 빼면 호스트의 eth0가 그대로 보임. 컨테이너는 결국 "런타임이 격리·제한해 둔 프로세스의 모음".
