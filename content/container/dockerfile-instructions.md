---
title: "Dockerfile 주요 지시어"
en: "Dockerfile Instructions"
summary: "이미지 빌드 절차 명세서. RUN·COPY·ADD는 레이어를 만들고 CMD·ENV·EXPOSE·USER 등은 실행 설정(config)만 기록한다"
importance: 3
order: 4
tags:
  - Dockerfile
  - 이미지
  - 보안
keypoints:
  - "RUN·COPY·ADD만 파일시스템 레이어 생성, 나머지는 config 메타데이터"
  - "ARG는 빌드 시점만, ENV는 런타임까지 유지되고 docker run -e로 덮어씀"
  - "EXPOSE는 문서일 뿐 실제 공개는 -p, USER로 non-root 실행이 보안 기본"
qa:
  - q: "ARG와 ENV의 차이는?"
    a: "ARG는 docker build --build-arg로 넘기는 빌드 시점 변수라서 완성된 이미지를 실행할 때는 남지 않는다. ENV는 이미지에 기록되어 컨테이너 런타임까지 유지되고 docker run --env로 덮어쓸 수 있다. FROM 앞에 선언한 ARG를 스테이지 안에서 쓰려면 ARG 이름을 한 번 더 선언해야 한다."
  - q: "COPY와 ADD의 차이와 무엇을 써야 하는지?"
    a: "둘 다 빌드 컨텍스트의 파일을 이미지 안으로 복사해 레이어를 만든다. ADD는 URL 다운로드와 tar 압축 자동 해제까지 하므로 의도치 않은 동작이 생길 수 있어 기본은 COPY를 쓴다. COPY는 --from으로 이전 빌드 스테이지의 산출물을 가져올 수 있어 멀티 스테이지 빌드의 핵심이다."
  - q: "EXPOSE를 쓰면 포트가 열리나?"
    a: "열리지 않는다. EXPOSE는 컨테이너가 어떤 포트를 Listen하는지 알려 주는 문서 역할로 이미지 config의 ExposedPorts에만 기록된다. 실제 연결은 docker run -p 호스트:컨테이너로 하고, -P를 쓰면 EXPOSE된 포트를 호스트의 임의 포트에 연결한다."
related:
  - multi-stage-build
  - cmd-vs-entrypoint
  - container-image-registry
  - k8s-advanced/security-context
source: "Day1(8/21) 슬라이드 p.68–119 (01.answer-code/03.dockerfile/02.command 실습)"
---

```compare
레이어 생성 명령 | 실행 설정 명령
지시어 | RUN, COPY, ADD | ENTRYPOINT, CMD, ENV, WORKDIR, EXPOSE, USER, VOLUME, LABEL
결과 | 읽기 전용 레이어 (RootFS.Layers) | 이미지 config JSON의 메타데이터
크기 영향 | 있음 (줄 수·설치 파일만큼 커짐) | 거의 없음
```

| 지시어 | 하는 일 | 실무 포인트 |
| --- | --- | --- |
| FROM | 베이스 이미지 지정 | 반드시 첫 줄(앞에는 ARG만), `AS 이름`으로 스테이지 지정 |
| RUN | 빌드 시 명령 실행 | `&&`로 묶고 캐시 정리까지 한 레이어에, 같은 명령은 캐시 재사용 |
| COPY / ADD | 파일 복사 | 빌드 컨텍스트 기준(`../` 불가), `--chown`, `--from` |
| ARG | 빌드 변수 | `--build-arg UBUNTU_VERSION=24.04`, 런타임엔 없음 |
| ENV | 환경 변수 | 런타임 유지, 비밀값은 넣지 않음 |
| WORKDIR | 작업 디렉터리 | 없으면 자동 생성, 상대 경로는 직전 경로에 이어 붙음 |
| USER | 실행 계정 | 계정은 자동 생성 안 됨, `RUN useradd`가 먼저 |
| EXPOSE | 포트 문서화 | 프로토콜 생략 시 tcp, 실제 공개는 `-p` |
| LABEL | 메타데이터 | 빌드·실행 영향 없음, `docker inspect`로 조회 |
| CMD / ENTRYPOINT | 시작 명령 | ENTRYPOINT vs CMD 노트 참고 |

> [!warn] USER skala 실습에서 만난 두 가지 오류
> non-root로 바꾸자 nginx가 ① `/var/lib/nginx`, `/var/log/nginx`에 쓸 권한이 없고 ② 1024 미만 포트(80)를 바인딩할 수 없어 실패함. `chown -R skala:skala`로 런타임 디렉터리 소유권을 넘기고, 기본 사이트를 `listen 8080`으로 바꿔 해결.
