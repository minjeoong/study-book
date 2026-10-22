---
title: "멀티 스테이지 빌드"
en: "Multi-stage Build"
summary: "한 Dockerfile에서 빌드 스테이지와 실행 스테이지를 나누고, 최종 이미지에는 빌드 산출물만 COPY --from으로 가져오는 방식"
importance: 3
order: 5
tags:
  - Dockerfile
  - 이미지 최적화
  - 빌드 캐시
keypoints:
  - "FROM ... AS builder로 빌드, 두 번째 FROM에서 COPY --from=builder"
  - "JDK·Maven·node_modules·소스가 빠져 수백 MB→수십 MB, 공격면도 축소"
  - "의존성 파일 먼저 COPY → 설치 → 소스 COPY 순서로 레이어 캐시를 살림"
qa:
  - q: "멀티 스테이지 빌드를 쓰는 이유는?"
    a: "빌드에는 JDK, Maven, node_modules 같은 도구가 필요하지만 실행에는 JRE와 jar, 또는 nginx와 정적 파일만 있으면 된다. 빌드 스테이지에서 산출물을 만들고 실행 스테이지에 COPY --from으로 결과만 가져오면 최종 이미지가 작아지고, 소스와 빌드 도구가 남지 않아 공격면도 줄어든다. 수업의 Vue 예시는 node로 npm run build를 한 뒤 nginx:alpine에 dist만 복사했다."
  - q: "Dockerfile에서 빌드 캐시를 잘 활용하려면?"
    a: "레이어는 바뀐 줄부터 아래가 전부 다시 빌드되므로 자주 바뀌는 것을 아래로 내린다. package.json이나 pom.xml 같은 의존성 정의를 먼저 COPY해 설치하고 소스는 그다음에 COPY하면, 소스만 바뀐 커밋에서는 의존성 설치 레이어가 캐시에서 재사용되어 CI 빌드 시간이 크게 준다."
related:
  - dockerfile-instructions
  - k8s-deploy/image-tag-digest
  - devops/ci-image-build-tools
source: "Day1(8/21) 슬라이드 p.78, p.83–87, p.153, p.157–159 (06.execise-source/vue-frontend, Dockerfile.maven)"
---

```flow
빌드 스테이지 :: node·JDK 이미지에서 의존성 설치 + 빌드
산출물 :: dist/ 정적 파일 또는 target/*.jar
실행 스테이지 :: nginx·JRE 같은 가벼운 베이스로 새로 시작
COPY --from :: 빌드 스테이지의 산출물만 복사
최종 이미지 :: 소스·빌드 도구·캐시 없음
```

```dockerfile
# ── 빌드 스테이지 ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./          # 의존성 정의만 먼저 → 캐시 대상
RUN npm ci
COPY . .
RUN npm run build

# ── 배포 스테이지 ──
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/        # 정적 서빙 + /api 프록시
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

> [!tip] ARG와 멀티 스테이지 (p.87)
> `ARG TAG=18-alpine`을 FROM 앞에 두면 `FROM node:${TAG}`에 쓸 수 있지만, 스테이지 안의 RUN에서 쓰려면 `ARG TAG`를 한 번 더 선언해야 함.
