---
title: "Kustomize (base + overlay)"
en: "Kustomize"
summary: "원본 YAML(base)은 표준 문법 그대로 두고 환경별 차이(delta)만 overlay의 patch로 덮어써 최종 매니페스트를 만드는 도구"
importance: 3
order: 4
tags:
  - Kustomize
  - 매니페스트
  - 환경 분리
keypoints:
  - "base: 공통 리소스, overlays/dev·prod: replicas·env·configmap patch"
  - "kubectl kustomize로 결과 확인, kubectl apply -k로 배포"
  - "images.newTag 변경은 kustomize edit set image (CI가 태그 갱신에 사용)"
qa:
  - q: "Kustomize는 무엇이고 언제 쓰나?"
    a: "공통 매니페스트를 base에 두고 dev, staging, prod처럼 환경별로 달라지는 부분만 overlay의 patch로 덮어써 최종 YAML을 만드는 도구다. 템플릿 언어 없이 순수 YAML만 쓰므로 러닝 커브가 낮고 최종 값이 명확하며, kubectl에 내장되어 apply -k로 바로 배포할 수 있다. Git에 선언형 YAML을 그대로 두고 환경별 overlay를 배포하는 GitOps와 잘 맞는다."
  - q: "Kustomize와 Helm의 차이는?"
    a: "Kustomize는 원본 YAML을 그대로 두고 패치로 차이를 덮어쓰는 방식이라 템플릿이 없고 단순하다. Helm은 Go 템플릿에 values를 주입해 리소스를 생성하고, 차트를 패키지로 버전 관리·공유하며 릴리스 단위로 롤백하는 패키지 매니저다. 우리 앱의 환경별 설정 관리에는 Kustomize가, 여러 리소스를 묶어 재사용·배포하거나 외부 솔루션을 설치할 때는 Helm이 유리하다."
related:
  - helm-chart
  - gitops
  - argocd
source: "Day1(10/12) 슬라이드 p.67–79 (01.spring-backend-v1.0/kustomize 실습)"
---

```layers
overlays/prod :: replicas 5, 운영 env·configmap
overlays/dev :: replicas 2, SPRING_PROFILES_ACTIVE 등 dev 값만 patch
base :: deployment.yaml · service.yaml · kustomization.yaml (공통, 순수 K8s YAML)
최종 매니페스트 :: kubectl kustomize overlays/dev = base + dev patch
```

```yaml
# overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base                 # base 상속
namespace: class-0             # 환경별 격리
namePrefix: skala-
commonLabels:
  skala.io/managed-by: class-0-skala
patches:
  - path: patch-deployment.yaml   # replicas·env·volume patch
images:
  - name: skala-registry.skala-ai.com/class-0/skala-webserver
    newTag: "2.0"              # kustomize edit set image 로 변경
```

> [!warn] selector는 불변
> 공통 label을 `includeSelectors: true`로 추가하면 `spec.selector.matchLabels`에도 들어가는데, 이미 배포된 Deployment의 selector는 바꿀 수 없어 `field is immutable` 에러가 남. `kubectl apply -k overlays/dev --dry-run=server`로 먼저 검증.
