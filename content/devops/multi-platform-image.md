---
title: "멀티 플랫폼 이미지와 OCI Image Index"
en: "Multi-platform Image · Manifest List · OCI Image Index"
summary: "하나의 태그 아래 amd64·arm64용 이미지를 함께 묶어, pull하는 노드의 CPU 아키텍처에 맞는 이미지를 받게 하는 방식"
importance: 2
order: 3
tags:
  - Multi-platform
  - buildx
  - OCI
keypoints:
  - "태그 → Image Index(Manifest List) → 플랫폼별 Manifest → 레이어 Blobs"
  - "buildx --platform linux/amd64,linux/arm64 --push 한 줄로 병렬 빌드·묶음"
  - "M 시리즈 맥에서 그냥 빌드하면 arm64 → x86 노드에서 exec format error"
qa:
  - q: "멀티 플랫폼 이미지는 레지스트리에 어떻게 저장되나?"
    a: "태그는 Image Index(도커 규격 이름은 Manifest List)를 가리키고, Index 안에 linux/amd64, linux/arm64 같은 플랫폼별 매니페스트의 다이제스트 목록이 있다. 각 매니페스트는 그 아키텍처용 config와 레이어 해시 목록을 가진다. 클라이언트는 같은 태그를 pull해도 자기 플랫폼에 맞는 매니페스트를 골라 해당 레이어만 받는다."
  - q: "맥북에서 빌드한 이미지가 EKS에서 exec format error로 죽는 이유는?"
    a: "Apple Silicon 맥에서 플랫폼을 지정하지 않고 빌드하면 arm64 이미지가 만들어지는데 노드는 x86_64(amd64)라 바이너리를 실행할 수 없다. docker build --platform linux/amd64로 빌드하거나 buildx로 amd64·arm64를 함께 빌드해 Image Index로 푸시하면 해결된다. 빌드 엔진은 TARGETPLATFORM, TARGETARCH 빌드 인자를 플랫폼별로 자동 주입한다."
related:
  - ci-image-build-tools
  - container/container-image-registry
  - k8s-deploy/image-tag-digest
source: "Day1(10/12) 슬라이드 p.58–62 · k8s-deploy 실습 가이드 실습 3(--platform)"
---

```layers
태그 my-app:1.0 :: 사람이 부르는 이름
Image Index (Manifest List) :: 플랫폼 목록 — amd64 → sha256:aaaa, arm64 → sha256:bbbb
플랫폼별 Image Manifest :: 그 아키텍처의 config + 레이어 해시 목록
Layer Blobs :: 실제 파일시스템 레이어 (tar.gz)
```

```compare
Manifest List | OCI Image Index
제정 | Docker Inc. (v2 schema 2) | OCI (리눅스 재단) 국제 표준
미디어 타입 | `application/vnd.docker.distribution.manifest.list.v2+json` | `application/vnd.oci.image.index.v1+json`
배경 | 도커가 멀티 아키텍처용으로 먼저 도입 | 벤더 종속을 없애려 표준화
```

```bash
# BuildKit(buildx): 한 번에 두 플랫폼 빌드 + Index 로 push
docker buildx build --platform linux/amd64,linux/arm64 \
  -t skala-registry.skala-ai.com/class-0/my-app:1.0 --push .

# Buildah: 플랫폼별 빌드를 manifest 로 묶어 OCI 형식으로 push
buildah bud --platform linux/amd64,linux/arm64 --manifest my-app:1.0 .
buildah manifest push --format oci --all my-app:1.0 \
  docker://skala-registry.skala-ai.com/class-0/my-app:1.0
```
