---
title: "GitOps"
en: "GitOps"
summary: "Git을 단일 진실 원천(SSOT)으로 두고 선언형 매니페스트의 변경(commit·PR)만으로 운영 환경을 바꾸며, 도구가 Git 상태와 클러스터를 자동 동기화하는 운영 방식"
importance: 3
order: 9
tags:
  - GitOps
  - CD
  - IaC
keypoints:
  - "운영 변경도 커밋·PR·리뷰 → 이력·감사 추적, git revert로 롤백"
  - "CI는 이미지 빌드 후 매니페스트 저장소(gitops 브랜치)의 이미지 태그만 갱신"
  - "CD는 Argo CD·Flux가 Git을 pull해 클러스터를 맞춤 (pull 기반)"
qa:
  - q: "GitOps란 무엇이고 장점은?"
    a: "운영 환경의 원하는 상태를 선언형 매니페스트로 Git에 저장하고, Git을 단일 진실 원천으로 삼아 Argo CD 같은 도구가 클러스터를 그 상태와 계속 동기화하는 방식이다. 모든 변경이 커밋과 PR로 남아 누가 언제 무엇을 바꿨는지 추적되고, 문제가 생기면 git revert로 이전 상태로 돌아간다. 사람이 서버에 들어가 직접 고치는 일이 사라져 환경 불일치와 휴먼 에러가 줄어든다."
  - q: "GitOps에서 CI와 CD는 어떻게 나뉘나?"
    a: "CI(Jenkins)는 소스 저장소에서 코드를 받아 빌드·테스트하고 이미지를 레지스트리에 푸시한 뒤, 매니페스트 저장소(수업에서는 gitops 브랜치의 kustomize/overlays/dev)의 이미지 태그를 새 버전으로 바꿔 커밋·푸시하는 데까지만 한다. CD는 Argo CD가 그 Git 변경을 감지해 클러스터에 반영한다. 그래서 CI가 클러스터 접근 권한을 가질 필요가 없고 배포 이력이 곧 Git 이력이 된다."
related:
  - argocd
  - jenkins-pipeline
  - kustomize
  - k8s-deploy/declarative-reconciliation
source: "Day2(10/13) 슬라이드 p.204–213 (Jenkinsfile-CI-docker·buildkit·buildah), p.230–233, p.243"
---

```flow
Commit code :: 개발자가 소스 저장소에 push
Jenkins CI :: build·test → 이미지 push (태그 예: 1.0.0-ea0f6f578576)
GitOps update :: gitops 브랜치 kustomize/overlays/dev 의 이미지 태그 갱신·push
Argo CD :: Git 변경 감지 (webhook 또는 polling)
Sync :: 클러스터를 Git 상태로 맞춤 (dev·stage·prod 클러스터)
```

```compare
Jenkins CI/CD (직접 배포) | Jenkins CI + Argo CD (GitOps)
배포 주체 | Jenkins가 kubectl apply·rollout | Argo CD가 Git을 보고 동기화
방식 | push 기반 | pull 기반
클러스터 권한 | CI 서버가 kubeconfig 보유 | Argo CD만 클러스터 접근
누가 무엇을 바꿨나 | Jenkins 빌드 로그 | Git 커밋 이력 (PR 리뷰 가능)
수동 변경(drift) | 그대로 남음 | selfHeal로 Git 상태 복원
롤백 | 이전 빌드 재실행 | git revert
```

> [!tip] 면접 포인트
> GitOps의 핵심 단어 세 개: 선언형(Declarative), 단일 진실 원천(SSOT, Git), 자동 동기화(Reconcile). 쿠버네티스의 조정 루프를 "클러스터 밖 Git까지 확장한 것"이라고 설명하면 연결이 자연스러움.
