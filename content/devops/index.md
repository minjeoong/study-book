---
summary: "CI 전용 빌드 도구(Kaniko·Buildah·BuildKit)와 Kustomize·Helm으로 배포 YAML을 다루고, Jenkins CI + Argo CD GitOps로 내 앱의 빌드부터 EKS 배포까지 파이프라인을 구성"
keywords:
  - DevOps
  - CI/CD
  - Continuous Delivery
  - Kaniko
  - Buildah
  - BuildKit
  - Multi-platform Image
  - Kustomize
  - Helm
  - Jenkinsfile
  - JCasC
  - PollSCM
  - Webhook
  - GitOps
  - Argo CD
materials:
  - file: slides-devops.pdf
    title: "강의 슬라이드 — DevOps 이해 및 활용"
    type: slides
    date: 2026-10-12
---

## 한눈에 보기

```flow
commit · push :: 개발자가 myfirst-api-server 저장소에 push
Jenkins CI :: clone → maven build → 이미지 태그 계산 → BuildKit·Buildah·Kaniko로 build·push
GitOps 갱신 :: gitops 브랜치 kustomize/overlays/dev의 이미지 태그 수정·push
Argo CD :: Git 변경 감지(최대 3분) → 클러스터와 동기화
EKS :: 새 이미지로 롤링 업데이트
```

- Day1(10/12)은 DevOps·CI/CD 개념 위에, 쿠버네티스 안에서 데몬 없이 이미지를 빌드하는 도구와 멀티 플랫폼 이미지, 배포 YAML을 환경별로 다루는 Kustomize와 패키지 매니저 Helm(템플릿 문법 포함)을 익힘.
- Day2(10/13)는 Jenkinsfile로 CI/CD 파이프라인을 코드화하고(로컬 → k8s 배포 Jenkins, PollSCM → Webhook), CI는 이미지 빌드와 GitOps 저장소 갱신까지만, 배포는 Argo CD가 맡는 GitOps 구조로 완성함.
- 마지막 과제는 자기 frontend·backend를 새 Git 저장소 + Jenkinsfile + Argo CD Application으로 엮는 "나만의 파이프라인".

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준.

### Day1 (10/12) — 빌드 도구와 배포 패키징

1. **실습 환경 구성** — 학번 표기(`sk000`), `setup.sh`로 kubeconfig(토큰·CA), `myfirst-api-server` GitHub 저장소, Fine-grained PAT(Contents read/write), `env.properties` + `gen-yaml.sh` (p.4–22)
2. **DevOps 개요** — 전통적 개발의 벽, Dev+Ops, 문화·자동화, DevOps 프로세스, CI/CD 정의·이점, 이 과정의 파이프라인(Jenkins/Tekton + Argo CD) (p.23–34)
3. **CI 전용 컨테이너 빌드 도구** — 도구 점유율, Kaniko(docker run, Pod, initContainer로 maven 후 빌드), Buildah, 멀티 플랫폼 빌드(Manifest List·OCI Image Index), BuildKit 비교, 도구별 build·push 실습 (p.35–66)
4. **Kustomize** — base/overlays, kustomization.yaml 역할, patch, `kubectl kustomize`·`apply -k`, `kustomize edit set image` (p.67–79)
5. **Helm Chart** — 패키지 문제, 템플릿 구조, 동작 방식, 명령어, 4가지 효과(복잡도·업데이트·공유·롤백), Chart.yaml·values.yaml·templates·_helpers.tpl, install·upgrade·rollback, GitHub Pages·파일서버 레포지토리, Umbrella Chart·global, Artifact Hub (p.80–128)
6. **Helm 기본 문법** — `.`과 `$`, 공백 제어, if/else, default·required, 파이프라인·toYaml·nindent, with·range, define·include (p.129–145)

### Day2 (10/13) — Jenkins CI/CD와 GitOps

1. **Jenkins CI/CD** — 파이프라인 단계, Jenkins 특징·흐름, JCasC(jenkins.yaml), Jenkins vs Tekton, 로컬 실행·플러그인, Jenkinsfile 블록(options·environment·post), 따옴표 해석, DSL·Step, withCredentials, basic → CICD-docker → CICD-buildah, Pipeline script vs from SCM (p.146–203)
2. **Jenkins CI** — clone → maven → Compute Image Meta → build·push → GitOps update, CI-docker·buildkit·buildah (p.204–213)
3. **Local Jenkins PollSCM** — Build Trigger cron, README push로 확인 (p.214–216)
4. **k8s에 Jenkins 배포** — 조별 Jenkins, kubeconfig 로딩 우선순위, Credential 등록, GitHub webhook (p.217–229)
5. **GitOps 기반 CD** — 기존 운영의 문제와 GitOps 장점, Argo CD 개념, CRD(Application·AppProject·ApplicationSet), Cluster·Repository Secret, syncPolicy, 콘솔·YAML로 Application 등록, kustomize·helm Application (p.230–267)
6. **나만의 파이프라인 구성** — 자기 frontend·backend + 새 Git 저장소 + CI Jenkinsfile + Argo CD (p.268–271)

## 실습 정리

실습 저장소 `skala-devops`(02.build-platform, 03.helm, 04.jenkins, 05.argocd)와 각자 만든 `myfirst-api-server` 저장소를 사용. 이미지는 사내 Harbor(`skala-registry`)에 `sk000-...` 이름으로 push.

- **CI 빌드 도구**: Kaniko를 `docker run`으로 → Pod로(ConfigMap에 Dockerfile·소스, `harbor-registry-secret`은 dockerconfigjson) → initContainer에서 git clone + `mvn clean install` 후 Kaniko 빌드. 같은 흐름을 Buildah, BuildKit(rootless)으로 반복

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v $(pwd)/auth/config.json:/kaniko/.docker/config.json \
  gcr.io/kaniko-project/executor:latest \
  --dockerfile=/workspace/Dockerfile \
  --context=dir:///workspace \
  --destination=<레지스트리>/<프로젝트>/sk000-myfirst-api-server:1.0.kaniko \
  --custom-platform=linux/amd64
```

- **Kustomize**: `01.spring-backend-v1.0/kustomize`의 overlays/dev로 replicas·env·configmap patch → `kubectl kustomize overlays/dev`로 확인 → `apply -k --dry-run=server` 검증 → 배포 → `kustomize edit set image`로 태그 2.0
- **Helm**: `helm create`로 차트 생성 → values 수정 → `helm upgrade --install --atomic` → `values-2.0.yaml`로 upgrade(tag 2.0, replicas 2) → `helm rollback` → `helm package` + `helm repo index`로 GitHub Pages·파일서버 레포 구성 후 `helm repo add`로 설치

```bash
helm upgrade --install ${STUDENT_NUM}-myfirst-helm ./myfirst-helmchart \
  --atomic --timeout 3m \
  -f ./skala-value/skala-values.yaml
helm history ${STUDENT_NUM}-myfirst-helm
helm rollback ${STUDENT_NUM}-myfirst-helm 1 --wait --timeout 3m
```

- **Jenkins**: 로컬 컨테이너(admin/admin) → 기본 파이프라인(build·test·deploy 출력) → Agent를 docker로 → Credential 검증 → `Jenkinsfile-CICD-docker`(clone → maven → BuildKit build·push → k8s manifest 갱신 → kubectl 배포) → Pipeline script from SCM → `Jenkinsfile-CI-*`(gitops 브랜치 갱신) → PollSCM → k8s에 조별 Jenkins + GitHub webhook
- **Argo CD**: 콘솔에서 Repository(PAT) 등록 → Application 생성(source: gitops 브랜치·`kustomize/overlays/dev`, destination: 자기 네임스페이스) → Deployment를 지워도 되살아나는 selfHeal 확인 → Jenkins CI 실행 후 새 태그 자동 반영

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: sk000-myapp-kustomize
  namespace: argocd
spec:
  project: class-0
  source:
    repoURL: https://github.com/<계정>/myfirst-api-server.git
    targetRevision: gitops
    path: kustomize/overlays/dev
  destination:
    server: https://kubernetes.default.svc
    namespace: class-0
  syncPolicy:
    automated: { prune: true, selfHeal: true }
```
