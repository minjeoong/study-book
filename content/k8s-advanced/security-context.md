---
title: "Pod SecurityContext"
en: "Pod SecurityContext"
summary: "Pod·컨테이너가 어떤 UID/GID, 권한(privileged·capabilities), 파일시스템 제약으로 실행될지 정하는 설정. 리눅스 커널 보안 기능을 쿠버네티스에서 켜는 인터페이스"
importance: 2
order: 11
tags:
  - Security
  - SecurityContext
  - Capabilities
keypoints:
  - "runAsNonRoot·runAsUser·runAsGroup으로 root 실행 차단"
  - "privileged 대신 필요한 capability만 add (예: NET_ADMIN)"
  - "운영 기본: 권한 상승 금지, 읽기 전용 rootfs, capability drop ALL"
qa:
  - q: "privileged와 capabilities의 차이는?"
    a: "privileged: true는 컨테이너에 노드 커널의 거의 모든 권한을 줘 격리를 사실상 해제하는 것이라 kube-proxy처럼 iptables를 고쳐야 하는 시스템 컴포넌트에만 쓴다. capabilities는 root 권한을 CHOWN, NET_BIND_SERVICE, NET_ADMIN, SYS_ADMIN 등으로 쪼갠 것이라, iptables 조회가 필요하면 privileged 대신 NET_ADMIN만 추가하는 식으로 최소 권한을 준다. 운영 앱은 drop: [ALL]로 전부 뺀 뒤 꼭 필요한 것만 add한다."
  - q: "운영 Pod에 기본으로 넣을 보안 설정은?"
    a: "Pod 수준에 runAsNonRoot: true와 runAsUser, seccompProfile: RuntimeDefault를, 컨테이너 수준에 allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, capabilities drop ALL을 둔다. 이미지도 Dockerfile의 USER로 non-root여야 runAsNonRoot와 충돌하지 않고, 루트 파일시스템이 읽기 전용이면 /tmp는 emptyDir로 마운트한다. hostNetwork·hostPID·hostIPC와 hostPath는 디버깅·시스템 용도 외에는 쓰지 않는다."
related:
  - container/namespace-cgroup
  - container/dockerfile-instructions
  - pod-pause-container
source: "Self Study 슬라이드 p.339–346 · k8s-deploy 슬라이드 p.174, lab l18-complete/10-deployment.yaml"
---

```layers
Pod securityContext :: runAsNonRoot·runAsUser·runAsGroup·fsGroup·seccompProfile, 모든 컨테이너 공통
Container securityContext :: allowPrivilegeEscalation·readOnlyRootFilesystem·capabilities·privileged
Linux 커널 보안 기능 :: UID/GID, capabilities, seccomp, SELinux로 실제 강제
노드 수준 특권 :: hostNetwork·hostPID·hostIPC, hostPath — 디버깅·시스템 용도 외 금지
```

| Capability | 허용하는 것 | 위험도 |
| --- | --- | --- |
| CHOWN | 파일 소유자 변경 | 낮음 |
| NET_BIND_SERVICE | 1024 미만 포트 바인딩 (nginx 80) | 낮음 |
| KILL | 다른 프로세스 종료 | 중간 |
| DAC_OVERRIDE | 파일 권한 무시하고 읽기·쓰기 | 높음 |
| NET_ADMIN | iptables·인터페이스 설정 | 높음 |
| NET_RAW | RAW 소켓 (ping, nmap) | 높음 |
| SYS_ADMIN | mount·hostname 변경 등, 거의 root | 매우 높음 |
| SYS_MODULE | 커널 모듈 로딩 | 매우 높음 |

```yaml
spec:
  securityContext:                    # Pod 수준: 모든 컨테이너에 적용
    runAsNonRoot: true
    runAsUser: 10001
    runAsGroup: 10001
    fsGroup: 10001
    seccompProfile: { type: RuntimeDefault }
  containers:
    - name: app
      securityContext:                # 컨테이너 수준
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities: { drop: ["ALL"] }     # 필요하면 add: ["NET_BIND_SERVICE"]
      volumeMounts: [ { name: tmp, mountPath: /tmp } ]
  volumes: [ { name: tmp, emptyDir: {} } ]
```

> [!warn] 노드 수준 특권
> `hostNetwork`·`hostPID`·`hostIPC: true`면 Pod가 노드의 기본 네임스페이스를 그대로 써서 노드의 프로세스·네트워크가 다 보임. 수업에서는 `privileged` + hostPath(`/`)로 노드에 들어가 `chroot /host systemctl status kubelet`을 확인했는데, 이런 Pod는 노드 탈취와 같으므로 디버깅 외에는 금지.
