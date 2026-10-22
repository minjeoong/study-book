---
title: "Pod 라이프사이클 훅과 Probe 핸들러"
en: "Lifecycle Hooks (preStop · postStart) · Probe Handlers"
summary: "postStart·preStop 훅으로 기동 직후·종료 직전 작업을 넣고, Probe는 exec·tcpSocket·httpGet 세 방식으로 상태를 판정한다"
importance: 2
order: 9
tags:
  - Lifecycle
  - preStop
  - Probe
  - Graceful Shutdown
keypoints:
  - "종료: Endpoints 제거 → preStop → SIGTERM → 유예 초과 시 SIGKILL"
  - "preStop sleep으로 iptables·DNS 반영 지연 동안 트래픽 유실 방지"
  - "Probe 성공: exec는 exit 0, TCP는 연결, HTTP는 200–399"
qa:
  - q: "preStop과 postStart는 언제 쓰나?"
    a: "preStop은 컨테이너에 SIGTERM이 가기 전에 실행되어 서비스 디스커버리 등록 해제, LB 전파 대기(sleep 5–10초), 로그 플러시 같은 종료 준비에 쓰며 적극 권고된다. postStart는 컨테이너 시작과 동시에 실행되어 앱과의 순서가 보장되지 않으므로, 앱보다 먼저 끝나야 하는 초기화는 initContainer로 하고 postStart는 동시에 돌아도 되는 작업에만 쓴다."
  - q: "Pod 안 여러 컨테이너의 종료 순서를 제어하려면?"
    a: "SIGTERM은 Pod의 모든 컨테이너에 동시에 전달되므로 순서가 필요하면 컨테이너별 preStop sleep 시간을 다르게 준다. 예를 들어 앱은 sleep 5, 앞단 프록시 사이드카는 sleep 15로 두어 앱이 먼저 요청을 마치고 프록시가 나중에 내려가게 한다. 이때 terminationGracePeriodSeconds는 가장 긴 preStop과 앱 종료 시간의 합보다 길어야 한다."
related:
  - k8s-deploy/probes
  - k8s-deploy/deployment-rolling-update
  - container/pid1-graceful-shutdown
  - command-args
source: "Self Study 슬라이드 p.292–312 (Graceful Shutdown, Pod Lifecycle 관리, 10.probe 실습)"
---

```flow
삭제 요청 :: 사용자 delete 또는 liveness 실패
Terminating :: API 서버가 etcd 상태 갱신, Endpoints에서 제거 (ready: false)
preStop 훅 :: 컨테이너별로 실행 (sleep으로 전파 대기, 정리 작업)
SIGTERM :: Pod의 모든 컨테이너에 동시에 전달 → 앱 graceful shutdown
SIGKILL :: terminationGracePeriodSeconds(기본 30초) 초과 시 강제 종료
```

```compare
exec | tcpSocket | httpGet
방식 | 컨테이너 안에서 명령 실행 | 지정 포트에 TCP 연결 | 엔드포인트에 HTTP 요청
성공 기준 | exit code 0 | 연결 성공 | 응답 코드 200–399
예 | `cat /tmp/healthy` | `port: 3306` (DB) | `path: /actuator/health/liveness`
```

```yaml
lifecycle:
  postStart:
    exec:
      command: ["sh", "-c", "echo postStart container started > /proc/1/fd/1"]
  preStop:
    exec:
      command: ["sh", "-c", "sleep 5"]     # 1.29+ 는 preStop: { sleep: { seconds: 10 } }
terminationGracePeriodSeconds: 30           # preStop + 앱 종료 시간보다 길게
```

> [!tip] 왜 sleep인가
> Terminating이 되면 Endpoints에서는 Pod IP가 빠지지만 각 노드의 iptables와 CoreDNS·Ingress에 반영되기까지 시간 차가 있음. 바로 SIGTERM으로 앱이 내려가면 그 사이 들어온 요청이 실패하므로, preStop sleep으로 반영을 기다린 뒤 종료를 시작. Spring Boot는 SIGTERM·SIGINT에서 shutdown hook(`@PreDestroy`)을 실행하지만 SIGKILL에서는 실행하지 않음.
