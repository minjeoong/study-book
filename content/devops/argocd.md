---
title: "Argo CD"
en: "Argo CD"
summary: "Git에 저장된 원하는 상태(Desired State)와 실제 클러스터 상태(Actual State)를 계속 비교해 일치시키는 쿠버네티스용 GitOps CD 도구"
importance: 3
order: 10
tags:
  - Argo CD
  - GitOps
  - CD
keypoints:
  - "Application: Git 경로(source)를 어느 클러스터·NS(destination)에 배포할지"
  - "syncPolicy.automated: prune(Git에 없으면 삭제), selfHeal(수동 변경 되돌림)"
  - "AppProject는 권한·대상 제한, ApplicationSet은 Application 일괄 생성"
qa:
  - q: "Argo CD의 selfHeal과 prune은?"
    a: "automated 동기화를 켜면 Git 변경이 자동으로 클러스터에 반영된다. prune: true는 Git에서 사라진 리소스를 클러스터에서도 삭제하고, selfHeal: true는 누군가 kubectl로 클러스터를 직접 바꾸면 Git 상태로 되돌린다. 실습에서 Deployment를 지워도 Argo CD가 다시 만들었고, kubectl scale로 replicas를 바꿔도 Git의 값으로 복원된다. 기본은 Manual sync다."
  - q: "Application, AppProject, ApplicationSet의 관계는?"
    a: "Application은 하나의 배포 단위로 어떤 Git 저장소의 어느 경로·브랜치를 어느 클러스터·네임스페이스에 배포할지 정의한다. AppProject는 Application들을 묶어 허용할 소스 저장소, 배포 대상, 만들면 안 되는 클러스터·네임스페이스 리소스(ClusterRole, RoleBinding 등)를 제한한다. ApplicationSet은 generator(예: list)의 값으로 템플릿을 채워 dev·prod 같은 여러 Application을 자동 생성한다."
related:
  - gitops
  - kustomize
  - helm-chart
source: "Day2(10/13) 슬라이드 p.234–267 (05.argocd: cluster·repository Secret, application, application-kustomize, applicationset, application-helm)"
---

```flow
Repository 등록 :: Git URL + PAT (Secret, label secret-type: repository)
Application 생성 :: source: gitops 브랜치·kustomize/overlays/dev, destination: 내 네임스페이스
비교 :: Git 매니페스트 vs 클러스터 실제 상태 (Synced / OutOfSync)
Sync :: 차이를 apply, prune·selfHeal로 drift 제거
상태 확인 :: Synced · Healthy, 새 커밋은 최대 약 3분 내 반영
```

| 리소스 | 역할 | 핵심 필드 |
| --- | --- | --- |
| Application | 하나의 배포 단위 | `source.repoURL·path·targetRevision`, `destination.server·namespace`, `syncPolicy` |
| AppProject | 그룹화 + 권한·대상 제한 | `sourceRepos`, `destinations`, `clusterResourceBlacklist`, `namespaceResourceBlacklist` |
| ApplicationSet | 템플릿으로 여러 Application 생성 | `generators`(list 등), `template` (`{{environment}}` 치환) |
| Cluster Secret | 배포 대상 클러스터 | label `argocd.argoproj.io/secret-type: cluster`, server·config |
| Repository Secret | Git·Helm 저장소 | label `secret-type: repository`, url·username·password |

> [!tip] syncOptions
> `ApplyOutOfSyncOnly=true`는 바뀐 리소스만 apply, `PrunePropagationPolicy=background`는 부모를 먼저 지우고 자식은 백그라운드로 정리(리소스가 많을 때 빠름). `allowEmpty: false`면 path가 통째로 비었을 때 전부 지워지는 사고를 막음. Application에 `resources-finalizer.argocd.argoproj.io`가 있으면 Application 삭제 시 배포된 리소스도 함께 삭제.
