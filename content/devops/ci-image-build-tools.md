---
title: "CI용 데몬리스 이미지 빌드 (Kaniko · Buildah · BuildKit)"
en: "Daemonless Image Build for CI"
summary: "CI 파이프라인과 쿠버네티스 Pod 안에서는 Docker 데몬 없이 Dockerfile을 빌드·푸시하는 도구를 쓴다"
importance: 2
order: 2
tags:
  - Kaniko
  - Buildah
  - BuildKit
  - CI
keypoints:
  - "Kaniko: executor 이미지로 build+push, 순차 실행, 아카이브됨"
  - "Buildah: Red Hat, 완전 데몬리스·rootless, OpenShift·Tekton 환경"
  - "BuildKit/buildx: 사실상 표준, 병렬 빌드·캐시·멀티 플랫폼"
qa:
  - q: "쿠버네티스 CI에서 docker build를 바로 쓰기 어려운 이유와 대안은?"
    a: "쿠버네티스 노드는 Docker가 아니라 containerd·CRI-O로 컨테이너를 돌리므로 Pod 안에서 docker build를 하려면 docker.sock을 마운트하거나 privileged로 데몬을 띄워야 해 보안상 위험하다. 그래서 데몬 없이 컨테이너 안에서 Dockerfile을 해석해 레이어를 만들고 레지스트리에 바로 푸시하는 Kaniko, Buildah, rootless BuildKit을 쓴다. 수업에서는 이 도구들을 Pod로 띄우고 initContainer에서 git clone과 maven build를 먼저 수행했다."
  - q: "Kaniko, Buildah, BuildKit을 비교하면?"
    a: "BuildKit은 Docker 23 이상과 buildx의 기본 빌더로 DAG 기반 병렬 실행, 로컬·원격·마운트 캐시, 멀티 플랫폼을 단일 명령으로 지원해 사실상 표준이다. Kaniko는 구글이 만든 executor 이미지로 쿠버네티스에서 간단히 쓸 수 있었지만 Dockerfile을 라인 단위로 순차 처리하고 공식 아카이브되어 BuildKit으로 옮겨 가는 추세다. Buildah는 데몬 없는 단일 CLI로 rootless 보안에 강해 OpenShift·Podman 생태계와 보안이 엄격한 멀티테넌트 환경에서 쓰인다."
related:
  - multi-platform-image
  - jenkins-pipeline
  - container/container-runtime-oci
  - container/multi-stage-build
source: "Day1(10/12) 슬라이드 p.35–57, p.63–66 (02.build-platform 실습)"
---

```compare
BuildKit | Kaniko | Buildah
만든 곳 | Moby(Docker) | Google | Red Hat
상태 | 사실상 표준 (약 65~75%) | 공식 아카이브, 하락세 | Red Hat 생태계 주력
데몬 | buildkitd (rootless 가능) | 없음, executor 컨테이너 실행 | 없음, 단일 CLI
실행 방식 | DAG 병렬 | 라인 단위 순차 | 명령 기반 커밋
멀티 플랫폼 | 단일 명령으로 OCI Index | 자체 지원 불가 | manifest CLI로 가능
주 사용처 | Docker·GitHub Actions·고성능 CI | K8s Pod 빌드 (Tekton 등) | OpenShift, rootless 환경
```

```yaml
# Kaniko 를 Pod 로: initContainer 가 소스를 준비하고 executor 가 build + push
apiVersion: v1
kind: Pod
metadata:
  name: sk000-kaniko-pod-springboot
spec:
  initContainers:
    - name: build
      image: maven:3.8.5-openjdk-17
      workingDir: /workspace
      command: ["/bin/bash", "-c"]
      args: ["git clone https://github.com/<id>/myfirst-api-server.git . && mvn clean install -DskipTests"]
  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:latest
      args:
        - --dockerfile=/workspace/Dockerfile
        - --context=dir:///workspace
        - --destination=<레지스트리>/<프로젝트>/sk000-myfirst-api-server:1.0
      volumeMounts:
        - { name: kaniko-secret, mountPath: /kaniko/.docker }   # dockerconfigjson
        - { name: workspace, mountPath: /workspace }
  restartPolicy: Never
```

> [!note] 레지스트리 인증
> Kaniko는 `/kaniko/.docker/config.json`의 `auths`로 push 권한을 얻음. Pod에서는 `kubectl create secret docker-registry harbor-registry-secret ...`로 만든 dockerconfigjson Secret을 그 경로에 마운트. 실행이 끝나면 Pod는 Completed.
