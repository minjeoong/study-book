---
title: "Helm Chart"
en: "Helm Chart"
summary: "여러 쿠버네티스 리소스를 템플릿 + values로 묶어 하나의 릴리스로 설치·업그레이드·롤백·공유하게 해 주는 쿠버네티스 패키지 매니저"
importance: 3
order: 5
tags:
  - Helm
  - 패키지 매니저
  - 배포
keypoints:
  - "Chart.yaml(메타) + values.yaml(값) + templates/(Go 템플릿)"
  - "values 우선순위: 차트 values.yaml < -f 파일(뒤가 우선) < --set"
  - "upgrade --install --atomic으로 배포, history·rollback으로 복구"
qa:
  - q: "Helm을 쓰는 이유는?"
    a: "앱 하나를 배포하려면 Deployment, Service, Ingress, ConfigMap, Secret, PVC 등 여러 YAML을 각각 관리해야 하고, 앱 단위의 버전이나 롤백 개념이 없으며 환경별 값을 바꾸기도 어렵다. Helm은 이들을 차트 하나로 묶고 환경별 차이는 values 파일로만 바꿔 같은 차트를 dev·stage·prod에 배포한다. 릴리스 이력이 남아 helm rollback으로 되돌릴 수 있고, tgz로 패키징해 레포지토리로 공유할 수 있다."
  - q: "Chart.yaml의 version과 appVersion의 차이는?"
    a: "version은 차트 패키지 자체의 SemVer 버전으로 템플릿이나 차트 구조를 바꾸면 올린다. appVersion은 차트가 배포하는 애플리케이션의 실제 버전이다. 둘은 독립적이라 앱 코드가 그대로여도 차트를 고치면 version만 올린다."
  - q: "helm upgrade --install --atomic은 무엇을 하나?"
    a: "--install은 릴리스가 없으면 설치, 있으면 업그레이드라 CI에서 같은 명령을 반복 실행할 수 있게 해 준다. --atomic은 리소스가 정상 상태가 될 때까지 기다리고(--timeout), 실패하면 자동으로 이전 정상 리비전으로 롤백한다. 적용 전에는 --dry-run --debug로 렌더링 결과를 확인한다."
related:
  - helm-template-syntax
  - kustomize
  - argocd
source: "Day1(10/12) 슬라이드 p.80–128 (03.helm 실습, GitHub Pages·파일서버 레포지토리, Umbrella Chart)"
---

```flow
Chart :: templates/ 에 변수화한 K8s 리소스 틀
values.yaml :: 환경별 실제 값 (dev·stage·prod 파일 분리)
helm 렌더링 :: 템플릿 + values 병합 → 매니페스트
릴리스 설치 :: helm upgrade --install, 리비전 1, 2, …
운영 :: history로 이력, rollback으로 이전 리비전 복귀
```

| 목적 | 명령 |
| --- | --- |
| 설치·업그레이드 | `helm upgrade --install <릴리스> <차트> -f values.yaml --atomic --timeout 3m` |
| 일부 값만 변경 | `helm upgrade <릴리스> <차트> --reuse-values -f values-2.0.yaml` |
| 일회성 덮어쓰기 | `--set image.tag=2.0.0` (최우선) |
| 이력·롤백 | `helm history <릴리스>`, `helm rollback <릴리스> <리비전>` |
| 상태·결과 확인 | `helm list`, `helm status`, `helm get manifest`, `helm get values` |
| 렌더링만 | `helm template . --show-only templates/deployment.yaml` |
| 공유 | `helm package ./chart` → `helm repo index . --url <URL>` → push |
| 받아 쓰기 | `helm repo add myrepo <URL>` → `helm repo update` → `helm install myrepo/<차트> --version 0.0.1` |

> [!note] Umbrella Chart
> 상위 차트의 `charts/` 아래에 springboot·vuejs·python 서브차트와 외부 의존성(예: Bitnami MariaDB, `Chart.yaml`의 dependencies)을 묶어 한 번에 배포. `global:` 값은 모든 서브차트에서 `.Values.global.registry`로 볼 수 있지만, 자동으로 이미지 앞에 붙여 주지는 않으므로 템플릿에서 직접 조합해야 함.
