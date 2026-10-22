---
title: "Docker 기본 명령과 볼륨"
en: "Docker CLI · Volumes"
summary: "run·ps·exec·stop·rm으로 컨테이너 수명주기를 다루고, 일회성(ephemeral)인 컨테이너의 데이터는 Named Volume·Bind Mount로 밖에 둔다"
importance: 2
order: 3
tags:
  - Docker
  - CLI
  - Volume
keypoints:
  - "run 옵션: -d 백그라운드, -it 입출력, -p·-v는 호스트:컨테이너"
  - "컨테이너를 지우면 쓰기 층도 사라지므로 남길 데이터는 볼륨에 둔다"
  - "Named는 런타임이 관리, Bind는 호스트 경로, Anonymous는 VOLUME 지시어"
qa:
  - q: "Named Volume과 Bind Mount의 차이는?"
    a: "Named Volume은 이름을 붙여 컨테이너 런타임이 /var/lib/docker/volumes 아래에서 관리하는 볼륨이라 호스트 경로를 몰라도 되고 이식성이 좋다. Bind Mount는 호스트의 특정 디렉터리를 컨테이너 경로에 그대로 붙이는 방식이라 소스·설정 파일 공유에 편하지만 호스트 디렉터리 구조에 의존한다. 둘 다 컨테이너를 지워도 데이터가 남는다."
  - q: "docker stop과 docker rm의 차이는?"
    a: "stop은 컨테이너의 PID 1에 SIGTERM을 보내고 기본 10초 안에 끝나지 않으면 SIGKILL로 정지시킨다. 정지된 컨테이너는 Exited 상태로 남아 docker ps -a에 보이고 start로 다시 띄울 수 있다. rm은 정지된 컨테이너와 그 쓰기 층을 삭제하는 것으로, 같은 이름으로 다시 run하려면 먼저 rm해야 이름 충돌(Conflict) 에러가 나지 않는다."
related:
  - container-image-registry
  - pid1-graceful-shutdown
  - docker-compose
  - k8s-deploy/pv-pvc
source: "Day1(8/21) 슬라이드 p.24–34(MariaDB), p.47–67(기본 명령), p.120–131(볼륨 연결)"
---

| 명령 | 하는 일 |
| --- | --- |
| `docker run -d --name x -p 8080:80 img:tag` | 이미지로 컨테이너 생성 + 실행 (태그 생략 시 latest) |
| `docker ps` / `docker ps -a` | 실행 중 / 정지 포함 전체 목록 |
| `docker exec -it x /bin/bash` | 실행 중인 컨테이너 안에서 셸 실행 |
| `docker logs -f x` | 표준 출력 로그 따라가기 |
| `docker stop` / `start` / `restart x` | SIGTERM 후 정지 / 다시 시작 |
| `docker rm x` / `docker rmi img` | 컨테이너 / 이미지 삭제 |
| `docker inspect x` | 마운트·네트워크·환경변수·restart 정책 등 메타데이터 JSON |
| `docker system prune -a` | 미사용 컨테이너·네트워크·이미지·빌드 캐시 정리 |

```compare
Named Volume | Bind Mount | Anonymous Volume
지정 | `-v demo:/usr/share` | `-v $(pwd)/data:/data` | Dockerfile `VOLUME`
실제 위치 | `/var/lib/docker/volumes/demo/_data` | 호스트의 지정 경로 | 런타임이 임의 이름으로 생성
inspect Type | volume | bind | volume
쓰임 | DB 데이터 영속 | 소스·설정 파일 공유 | 이미지가 지정한 데이터 경로
```

> [!tip] 옵션 읽는 법
> `-p 8888:80`, `-v 호스트:컨테이너` 모두 왼쪽이 호스트, 오른쪽이 컨테이너. `-it`의 `-i`는 로컬 STDIN을 컨테이너 프로세스에 연결, `-t`는 가상 터미널(pty) 할당.

> [!warn] 경로 표기
> macOS·Linux는 `$(pwd)`, Windows PowerShell에서 안 되면 `${PWD}`를 쓴다.
