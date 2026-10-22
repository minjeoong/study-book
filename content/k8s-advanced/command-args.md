---
title: "Pod command · args와 PID 1"
en: "Pod command · args"
summary: "Pod 스펙의 command는 이미지의 ENTRYPOINT를, args는 CMD를 대체한다. sh -c로 감쌀 때는 exec를 붙여 앱이 PID 1로 SIGTERM을 받게 한다"
importance: 2
order: 2
tags:
  - Pod
  - command
  - args
  - PID 1
keypoints:
  - "args만 쓰면 ENTRYPOINT는 유지하고 실행 옵션만 교체 (일반적 방식)"
  - "환경변수 치환이 필요하면 command: [sh, -c] + args에 명령 문자열"
  - "exec 없으면 sh가 PID 1 → SIGTERM 미전달 → grace period 후 SIGKILL"
qa:
  - q: "쿠버네티스 command/args와 Dockerfile ENTRYPOINT/CMD는 어떻게 대응되나?"
    a: "command는 ENTRYPOINT를, args는 CMD를 대체한다. command를 주면 이미지의 ENTRYPOINT와 CMD가 모두 무시되고, args만 주면 ENTRYPOINT는 그대로 두고 인자만 바뀐다. 예를 들어 command: [python3], args: [fastserver.py, --host, 0.0.0.0, --port, 8080]이면 python3 fastserver.py --host 0.0.0.0 --port 8080이 실행된다."
  - q: "command에 sh -c를 쓸 때 주의할 점은?"
    a: "sh -c로 여러 명령이나 환경변수 치환을 하면 sh가 PID 1, 앱은 그 자식이 된다. PID 1은 시그널 핸들러가 없으면 SIGTERM을 무시하고 sh는 자식에게 전달하지도 않아, Pod 삭제 시 앱이 graceful shutdown을 못 하고 유예 시간 뒤 SIGKILL로 죽어 로그 유실·연결 끊김이 생긴다. 마지막 명령 앞에 exec를 붙여 셸을 앱 프로세스로 치환하면 앱이 PID 1이 되어 해결된다."
related:
  - container/cmd-vs-entrypoint
  - container/pid1-graceful-shutdown
  - pod-lifecycle-hooks
source: "Day1(10/14) 슬라이드 p.99–105 (02.cmdargs 실습)"
---

```compare
Dockerfile | Kubernetes Pod
메인 명령 | ENTRYPOINT | command
기본 인자 | CMD | args
args만 지정 | — | ENTRYPOINT 유지 + CMD만 교체
command 지정 | — | ENTRYPOINT·CMD 모두 무시
```

```yaml
containers:
  - name: webserver
    image: <레지스트리>/sk000-webserver:2.0.0
    command: ["sh", "-c"]
    args:
      - |
        echo "starting... port=${SERVER_PORT}"
        exec python3 fastserver.py --host 0.0.0.0 --port ${SERVER_PORT}
    # exec 가 없으면: PID 1 = sh, python3 는 자식 → SIGTERM 을 못 받음
```

> [!warn] PID 1의 시그널 규칙
> 일반 프로세스는 SIGTERM 기본 동작이 종료지만, PID 1은 핸들러를 등록하지 않으면 SIGTERM을 무시함. `kubectl delete pod` → kubelet이 PID 1(sh)에 SIGTERM → sh는 처리·전달 안 함 → 앱 계속 실행 → grace period(30초) 뒤 SIGKILL.
