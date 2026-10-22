---
title: "Docker Compose"
en: "Docker Compose"
summary: "여러 컨테이너로 된 앱을 docker-compose.yaml 하나로 정의하고 up/down 한 번으로 실행·정리하는 단일 노드 오케스트레이션 도구"
importance: 3
order: 12
tags:
  - Docker Compose
  - healthcheck
  - 네트워크
keypoints:
  - "services 단위 정의, custom bridge 자동 생성 → 서비스 이름으로 통신"
  - "depends_on + condition: service_healthy + healthcheck로 기동 순서 제어"
  - "ports는 외부 공개, expose·미지정은 내부 전용, internal: true 네트워크로 DB 격리"
qa:
  - q: "depends_on만 쓰면 DB가 준비된 뒤 백엔드가 뜨나?"
    a: "아니다. depends_on은 컨테이너 시작 순서만 보장하고 DB가 요청을 받을 준비가 됐는지는 모른다. db에 healthcheck(pg_isready 등)를 넣고 backend의 depends_on에 condition: service_healthy를 주면 db가 healthy가 된 뒤 backend를 띄운다. 단, compose의 healthcheck는 healthy/unhealthy 표시만 하고 재시작 같은 복구는 하지 않으며 그건 쿠버네티스 probe의 영역이다."
  - q: "restart: always와 unless-stopped의 차이는?"
    a: "둘 다 PID 1의 비정상 종료(OOM, crash, SIGKILL), dockerd 재시작, 서버 재부팅 시 컨테이너를 다시 띄운다. 차이는 사용자가 docker stop으로 일부러 멈춘 경우로, always는 데몬이나 서버가 재시작되면 다시 올리지만 unless-stopped는 멈춘 상태를 유지한다. 기본값은 no이고 on-failure는 비정상 종료일 때만 재시작한다."
  - q: "compose에서 컨테이너끼리 localhost로 부르면 안 되는 이유는?"
    a: "각 컨테이너는 자기 network namespace를 가지므로 localhost는 그 컨테이너 자신을 가리킨다. 같은 compose 네트워크에서는 내장 DNS가 서비스 이름을 컨테이너 IP로 풀어 주므로 http://backend:8080, jdbc:postgresql://db:5432처럼 서비스 이름으로 호출한다. IP는 컨테이너를 재생성하면 바뀔 수 있어 쓰지 않는다."
related:
  - docker-network
  - cmd-vs-entrypoint
  - k8s-deploy/probes
  - k8s-deploy/service-endpoints
source: "Day2(8/24) 슬라이드 p.226–259 (10.docker-compose 01.base·02.add-fe·03.full), p.267–269 종합 실습"
---

```flow
db (private) :: postgres + 볼륨 + healthcheck(pg_isready)
healthy 대기 :: depends_on condition: service_healthy
backend (public + private) :: 빌드 후 9090:8080, healthcheck /health
healthy 대기 :: backend가 healthy가 되면
frontend (public) :: nginx 8080:80, /api 를 backend:8080 으로 프록시
```

```compare
ports | expose | 미지정
예 | `"8080:80"` | `- "8080"` | 아무것도 안 씀
호스트에서 접근 | O (`127.0.0.1:8080:80`이면 로컬만) | X | X
같은 네트워크 컨테이너 | O | O (포트 명시용) | O
쓰임 | 외부 진입점 (frontend) | 문서·가독성 | DB 같은 내부 서비스
```

```bash
docker compose up --build -d          # 빌드 + 백그라운드 실행
docker compose ps                     # 서비스 상태 요약
docker compose logs -f backend        # 특정 서비스 로그
docker compose exec backend sh        # 컨테이너 안으로 (ping db 로 DNS 확인)
docker compose up -d --force-recreate backend   # 설정 반영 재생성
docker compose down -v                # 컨테이너 + 네트워크 + 볼륨 삭제
```

> [!tip] 환경변수 주입 세 가지
> `environment:`(map 또는 list), `env_file: [env.dev]`, 같은 폴더의 `.env`를 `${PORT}`로 치환(`--env-file`로 다른 파일 지정). Dockerfile의 CMD는 `command:`로, ENTRYPOINT는 `entrypoint:`로 덮어씀.
