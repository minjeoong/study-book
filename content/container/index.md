---
summary: "VM과 컨테이너의 차이에서 출발해 Dockerfile·볼륨·CMD 최적화로 내 서비스를 컨테이너화하고, namespace·cgroup·OverlayFS·runc로 내부를 뜯어본 뒤 docker compose로 묶기까지"
keywords:
  - VM vs Container
  - Dockerfile
  - Multi-stage Build
  - ENTRYPOINT vs CMD
  - PID 1
  - SIGTERM
  - Volume
  - Namespace
  - cgroup
  - OverlayFS
  - OCI
  - runc
  - Docker Network
  - Docker Compose
materials:
  - file: slides-container.pdf
    title: "강의 슬라이드 — 컨테이너 이해 및 애플리케이션 컨테이너화"
    type: slides
    date: 2026-08-21
  - file: lab-skala-container.zip
    title: "실습 저장소 — 샘플 컨테이너와 정답 코드"
    type: lab
    date: 2026-08-21
---

## 한눈에 보기

```flow
Dockerfile 작성 :: FROM·RUN·COPY·CMD로 빌드 절차를 선언
이미지 빌드 :: 읽기 전용 tar 레이어 + config (OCI 이미지)
레지스트리 push/pull :: Harbor(skala-registry)에 태그로 저장
컨테이너 실행 :: dockerd → containerd → shim → runc가 namespace·cgroup 적용
compose로 묶기 :: frontend·backend·db를 YAML 하나로 실행
```

- Day1(8/21)은 가상화와 VM의 한계에서 출발해 docker 명령, Dockerfile 지시어, 볼륨, CMD exec form과 SIGTERM을 익히고, Spring Boot·nginx·Vue 컨테이너를 skala bridge 네트워크로 MariaDB와 연결함.
- Day2(8/24)는 `docker save`로 이미지를 tar로 풀어 레이어를 확인한 뒤 namespace·cgroup·capabilities, OverlayFS, dockerd/containerd/runc, OCI, Docker 네트워크를 직접 실습하고 docker compose로 마무리함.
- 핵심 메시지: 컨테이너는 VM이 아니라 "커널 기능으로 격리·제한된 프로세스", 이미지는 "tar 레이어 + 메타데이터 묶음".

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준.

### Day1 (8/21) — 컨테이너 이해와 Dockerfile

1. **환경 구성** — Docker Desktop·로그인, 실습 저장소 clone, 자주 나는 에러(daemon 연결 실패, 8080 포트 선점) (p.3–10)
2. **컨테이너의 이해** — 가상화·Hypervisor Type 1/2, VM의 고질적 문제(이미지 크기·기동 시간·환경 불일치), 컨테이너 특징, VM 비교표, Dockerfile 맛보기 (p.11–23)
3. **나의 데이터베이스 만들기** — MariaDB 컨테이너 실행, `docker exec`로 접속해 테이블 생성, DBeaver, `inspect`, `prune`으로 정리 (p.24–34)
4. **컨테이너 기본 활용** — 이미지 라이프사이클, Registry/Repository/Tag, 레이어 구조, search·pull·run·ps·start·exec·stop·rm·rmi, `-v` 마운트, 운영 명령 (p.35–67)
5. **Dockerfile 작성** — FROM(멀티 스테이지)·RUN·ARG·LABEL·CMD·EXPOSE·COPY·WORKDIR·USER·ENV·ENTRYPOINT, 레이어 생성 명령 vs 실행 설정 명령 (p.68–119)
6. **컨테이너 볼륨 연결** — Named/Bind/Anonymous, MariaDB 데이터 bind mount, 컨테이너 안에서 python 웹서버를 수동 실행한 뒤 Dockerfile로 옮기기 (p.120–131)
7. **CMD 명령 최적화** — Exec form / Shell form / Shell+exec 세 실습으로 PID 1과 SIGTERM 수신 비교 (p.132–145)
8. **웹 서비스 컨테이너 만들기** — Spring Boot(eclipse-temurin) + MariaDB(skala 네트워크) + nginx frontend(`/api` 프록시) + Vue 멀티 스테이지 (p.146–159)

### Day2 (8/24) — 컨테이너 내부 구조와 compose

1. **컨테이너 이미지 구조** — tar, `docker save` → manifest.json·blobs, 레이어마다 Dockerfile 어느 줄인지 확인, mariadb 이미지 해부 (p.160–177)
2. **컨테이너 구조** — Docker 아키텍처, libcontainer·runc, namespace·cgroup·capabilities·SELinux, OOM 처리, OverlayFS 실습, dockerd→containerd→shim→runc, OCI 3대 스펙, Docker 네트워크·CIDR·UDS, runc 직접 실행 실습 1–5, "컨테이너의 실행 주체는 프로세스" (p.178–225)
3. **Docker Compose 명령어** — up·down·build·logs·exec·ps, `-f`·`-p`, 실습 compose 시작·frontend 추가 (p.226–239)
4. **Docker Compose 이해** — command·entrypoint 덮어쓰기, build args, restart 정책, healthcheck, 환경변수 주입 3가지, 서비스 이름 통신, ports·expose·networks 분리, depends_on condition, 03.full 실습 (p.240–259)
5. **컨테이너 관련 도구** — 통합 플랫폼(docker·podman·Rancher Desktop·Colima), 빌드 도구(BuildKit·Kaniko·Buildah·Jib…), 고수준/저수준 런타임, 쿠버네티스 안의 컨테이너 실행, 오케스트레이션 (p.260–266)
6. **종합 실습** — 나만의 frontend·API 서버·DB를 docker compose로 전환 (p.267–269)

## 실습 정리

저장소 `skala-container`: `00.sample-container`(spring-backend v1.0, fastapi-backend v2.0, nginx frontend, vue-frontend) + `01.answer-code`(01.mariadb … 10.docker-compose).

- **MariaDB 컨테이너**: custom bridge `skala`를 만들고 그 위에 MariaDB 실행. 이후 `-v $(pwd)/db-data:/var/lib/mysql`로 데이터 영속화

```bash
docker network create --driver bridge skala
docker run -d --name mariadb \
  -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=skala \
  -e MYSQL_USER=user -e MYSQL_PASSWORD=password \
  --network skala -p 3306:3306 \
  -v $(pwd)/db-data:/var/lib/mysql \
  mariadb:latest
```

- **Dockerfile 단계별 실습** (`linux-container:1.0`): ARG로 ubuntu 버전 주입 → LABEL → `CMD nginx` → EXPOSE → WORKDIR + COPY index.html → `USER skala`(권한 오류 확인 후 chown + listen 8080으로 해결) → `ENTRYPOINT ["ping"]` + CMD 기본 인자
- **CMD 최적화**: `webserver.py`에 SIGTERM handler 등록 → exec form / shell form / `sh -c "exec ..."` 각각 `ps -ef`로 PID 1 확인, `docker stop` 시 로그 비교
- **웹 서비스**: `spring-backend:1.0`(`--network skala`, `SPRING_PROFILES_ACTIVE=local-mariadb`) + `frontend:1.0`(9090, nginx가 `/api`를 `spring-backend:8080`으로 프록시) + `vue-frontend:1.0`(8090)

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ADD ./target/*.jar app.jar
# sh -c 로 환경변수를 풀되 exec 로 java 를 PID 1 로 만든다
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
```

- **이미지 해부**: `docker save` → `tar xvf` → `manifest.json`의 Layers를 하나씩 `tar tvf`로 열어 FROM·RUN·WORKDIR·COPY 레이어 대응 확인
- **runc 직접 실행**: `docker export $(docker create alpine) | tar -C rootfs -xf -`, `runc spec`으로 OCI 번들을 만들고 `runc run`. config.json에 bind mount 추가, pid·network namespace를 빼서 호스트와 공유되는 것 확인, init.sh를 PID 1로 실행
- **docker compose 03.full**: db는 private(internal) 네트워크만, backend는 public+private, frontend는 public. 기동 순서 db(healthy) → backend(healthy) → frontend

```yaml
services:
  db:
    image: postgres:15
    volumes: ["./db_data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      retries: 5
    networks: [private]
  backend:
    build: { context: ./backend, dockerfile: Dockerfile.backend }
    ports: ["9090:8080"]
    depends_on:
      db: { condition: service_healthy }
    restart: unless-stopped
    networks: [public, private]
networks:
  public:
  private:
    internal: true
```
