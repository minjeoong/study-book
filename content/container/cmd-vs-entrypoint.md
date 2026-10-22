---
title: "ENTRYPOINT vs CMD"
en: "ENTRYPOINT vs CMD"
summary: "ENTRYPOINT는 컨테이너가 반드시 실행할 메인 명령, CMD는 기본 명령·인자. docker run 뒤 인자는 CMD를 대체하고 ENTRYPOINT 뒤에 붙는다"
importance: 3
order: 6
tags:
  - Dockerfile
  - ENTRYPOINT
  - CMD
keypoints:
  - "CMD는 여러 개면 마지막 하나만 유효, run 뒤 인자가 오면 통째로 대체"
  - "ENTRYPOINT는 --entrypoint 플래그로만 교체, run 뒤 인자는 뒤에 추가"
  - "실무 조합: ENTRYPOINT [실행 파일] + CMD [기본 인자]"
qa:
  - q: "ENTRYPOINT와 CMD의 차이는?"
    a: "ENTRYPOINT는 이 컨테이너가 어떤 도구인지 정하는 고정 명령이고, CMD는 사용자가 아무것도 안 줬을 때 쓰는 기본 명령이나 인자다. docker run 이미지 뒤에 인자를 주면 CMD는 완전히 대체되고, ENTRYPOINT가 있으면 그 인자가 ENTRYPOINT 뒤에 붙는다. 수업 예시처럼 ENTRYPOINT [ping], CMD [-c, 3, localhost]이면 기본은 ping -c 3 localhost, docker run img google.com이면 ping google.com이 된다."
  - q: "쿠버네티스나 compose에서는 어떻게 덮어쓰나?"
    a: "쿠버네티스 Pod 스펙의 command는 ENTRYPOINT를, args는 CMD를 대체한다. docker compose의 command는 CMD를 덮어쓰고 ENTRYPOINT는 유지하며, entrypoint를 지정하면 Dockerfile의 CMD도 무시되므로 command를 다시 선언해야 한다."
related:
  - pid1-graceful-shutdown
  - dockerfile-instructions
  - docker-compose
  - k8s-advanced/command-args
source: "Day1(8/21) 슬라이드 p.92–95, p.113–118 (Dockerfile.entrypoint 실습) · Day2(8/24) p.241"
---

```compare
ENTRYPOINT | CMD
의미 | 컨테이너가 실행할 메인 명령 (본질) | 기본 명령 또는 기본 인자
run 뒤 인자를 주면 | ENTRYPOINT 뒤에 인자로 추가 | 완전히 무시되고 대체
강제로 바꾸려면 | `--entrypoint` 플래그 필요 | 이미지 이름 뒤에 명령 입력
여러 번 쓰면 | 마지막 것만 유효 | 마지막 것만 유효
흔한 형태 | `ENTRYPOINT ["python"]` | `CMD ["app.py"]`
```

```dockerfile
FROM alpine:latest
ENTRYPOINT ["ping"]                                  # 고정: 이 컨테이너는 ping 도구
CMD ["-c", "3", "skala-fileserver.skala-ai.com"]    # 기본 인자
# docker run --rm check-ping            → ping -c 3 skala-fileserver.skala-ai.com
# docker run --rm check-ping google.com → ping google.com (CMD 대체)
```

> [!tip] 눈으로 확인 문제 (p.118)
> `ENTRYPOINT ["echo", "This"]` + `CMD ["is", "the default command"]`이면 그냥 실행 시 `This is the default command`, `docker run img "is the custom CMD"`이면 `This is the custom CMD`가 출력됨.
