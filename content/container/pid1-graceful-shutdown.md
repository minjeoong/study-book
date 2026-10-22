---
title: "PID 1과 Graceful Shutdown (CMD 최적화)"
en: "PID 1 Signal Handling"
summary: "컨테이너의 첫 프로세스(PID 1)가 SIGTERM을 받아야 graceful shutdown이 된다. Shell form은 sh가 PID 1이 되어 앱이 신호를 못 받는다"
importance: 3
order: 7
tags:
  - CMD
  - SIGTERM
  - Graceful Shutdown
keypoints:
  - "Exec form CMD [python3, app.py]는 앱이 직접 PID 1 (강력 권고)"
  - "Shell form은 /bin/sh가 PID 1, 앱은 자식이라 SIGTERM 미전달 → 유예 후 SIGKILL"
  - "셸이 꼭 필요하면 sh -c 'exec 앱'으로 셸을 앱으로 치환"
qa:
  - q: "컨테이너에서 PID 1이 왜 중요한가?"
    a: "docker stop이나 쿠버네티스 Pod 삭제는 컨테이너의 PID 1에 SIGTERM을 보낸다. Shell form으로 실행하면 /bin/sh가 PID 1이 되고 실제 앱은 자식 프로세스라서, sh가 신호를 앱에 전달하지 않아 앱은 종료 준비를 하지 못한다. 결국 docker는 10초, 쿠버네티스는 30초 유예 뒤 SIGKILL로 강제 종료하므로 처리 중 요청 유실, 연결 끊김, 배포 지연이 생긴다."
  - q: "환경 변수를 써야 해서 셸이 필요하면 어떻게 하나?"
    a: "sh -c 뒤 명령 앞에 exec를 붙인다. 셸이 환경 변수를 치환한 다음 exec로 자기 자신을 앱 프로세스로 교체하므로 새 프로세스를 fork하지 않고 앱이 PID 1이 되어 SIGTERM을 직접 받는다. 수업의 Spring Boot Dockerfile도 sh -c 'exec java $JAVA_OPTS -jar app.jar' 형태를 썼다."
related:
  - cmd-vs-entrypoint
  - k8s-advanced/command-args
  - k8s-advanced/pod-lifecycle-hooks
  - k8s-deploy/deployment-rolling-update
source: "Day1(8/21) 슬라이드 p.132–145 (05.cmd 실습 1–3, webserver.py SIGTERM handler)"
---

```compare
Exec form (직접 실행) | Shell form (포크 실행) | Shell + exec (치환 실행)
작성 | `CMD ["python3", "webserver.py"]` | `CMD ["/bin/sh", "-c", "python3 webserver.py"]` | `CMD ["/bin/sh", "-c", "exec python3 webserver.py"]`
PID 1 | python3 | /bin/sh (python3은 자식) | python3
docker stop | SIGTERM 즉시 수신 | 신호 미수신, 10초 뒤 SIGKILL | SIGTERM 즉시 수신
권고 | 강력 권고 | 비권고 | 환경 변수 처리 필요 시 조건부
```

```flow
docker stop / kubectl delete :: 런타임이 PID 1에 SIGTERM
앱의 SIGTERM handler :: 새 요청 거부, 처리 중 요청 마무리, 자원 해제
정상 종료 :: exit 0
유예 초과 시 :: SIGKILL(137) 강제 종료 (docker 10초, k8s 30초)
```

```bash
# Shell form 으로 띄운 컨테이너 안
ps -ef
# PID PPID CMD
#   1    0 /bin/sh -c python3 webserver.py   ← 신호를 받는 쪽
#   7    1 python3 webserver.py              ← 정작 앱은 신호를 못 받음
```

> [!warn] 프레임워크도 신호가 와야 동작
> Spring Boot·FastAPI는 SIGTERM을 받으면 graceful shutdown(처리 중 요청 완료, 연결 해제)을 하지만, Shell form이면 신호 자체가 오지 않아 이 기능이 무력화됨. 쿠버네티스에서 배포할 때마다 502가 나는 원인 중 하나.
