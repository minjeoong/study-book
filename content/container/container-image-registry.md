---
title: "컨테이너 이미지와 레지스트리"
en: "Container Image · Registry"
summary: "이미지는 rootfs를 tar 레이어로 직렬화해 manifest·config와 묶은 배포 패키지, 레지스트리는 이를 태그 단위로 저장·배포하는 서버"
importance: 3
order: 2
tags:
  - 이미지
  - 레이어
  - Harbor
  - Registry
keypoints:
  - "이름 구조: 레지스트리/프로젝트/이미지:태그, 생략하면 docker.io/library/…:latest"
  - "이미지 = 읽기 전용 레이어 묶음, 이미 있는 레이어는 다시 받거나 올리지 않음"
  - "docker save로 풀면 manifest.json + config + 레이어 blobs(tar)"
qa:
  - q: "컨테이너 이미지가 레이어 구조인 이유는?"
    a: "Dockerfile의 RUN·COPY·ADD 한 줄이 파일시스템 변경분 하나, 즉 레이어 하나가 된다. 레이어는 내용의 sha256 해시로 식별되므로 여러 이미지가 같은 베이스 레이어를 공유하고, 이미 받은 레이어는 다시 다운로드·업로드하지 않는다. 덕분에 저장 공간과 전송 시간이 줄고 빌드 캐시도 레이어 단위로 동작한다."
  - q: "Registry와 Repository의 차이는?"
    a: "Registry는 여러 이미지를 저장·제공하는 서버 전체(Docker Hub, Harbor)이고, Repository는 그 안에서 특정 이미지 계열을 관리하는 개별 저장소다. 예를 들어 skala-registry.skala-ai.com/class-0/skala-webserver:1.0에서 도메인이 레지스트리, class-0이 프로젝트, skala-webserver가 리포지토리, 1.0이 태그다."
related:
  - dockerfile-instructions
  - overlayfs-copy-on-write
  - k8s-deploy/image-tag-digest
  - devops/multi-platform-image
source: "Day1(8/21) 슬라이드 p.36–46 · Day2(8/24) p.160–177 (07.in-images 실습, mariadb 이미지 해부)"
---

```flow
Dockerfile :: 이미지 빌드 절차 명세
docker build :: 레이어 + config로 이미지 생성
docker push :: 레지스트리(Harbor)에 태그로 저장
docker pull :: 로컬에 없는 레이어만 내려받음
docker run :: 이미지 위에 쓰기 층을 얹어 컨테이너 실행
```

```bash
# 이름 구조: 레지스트리 도메인 / 프로젝트 / 이미지 이름 : 태그
skala-registry.skala-ai.com/class-0/skala-webserver:1.0
docker pull nginx               # = docker.io/library/nginx:latest

# 이미지를 tar 로 풀어 레이어 확인 (Day2 실습)
docker save indepth-container:1.0 -o indepth-container.tar
tar xvf indepth-container.tar
cat manifest.json | jq          # Config + Layers(blobs/sha256/...) 목록
tar tvf blobs/sha256/<레이어>    # 예: COPY index.html 로 생긴 파일만 들어 있음
```

> [!note] 레이어 공유 예시 (p.43)
> 이미지 A를 지워도 이미지 B가 함께 쓰는 레이어 1·2·3은 남는다. 이미지 C를 받은 상태라면 D는 C에 없는 레이어 8만 받고, 레이어가 모두 있는 E는 다운로드할 것이 없다.

> [!tip] 이미지의 정의 (p.161)
> "프로세스 실행에 필요한 OS 루트 파일시스템(rootfs)과 앱 실행 환경을 tar 레이어 단위로 직렬화해 메타데이터와 함께 묶은 배포용 아카이브"라고 한 문장으로 말할 수 있으면 됨.
