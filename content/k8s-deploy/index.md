---
summary: "Spring Boot 앱을 컨테이너로 만들어 EKS(skala-2026)에 올리고 Service·Ingress로 도메인 접속, 프로브·롤링 업데이트로 무중단 배포까지 — 명령어보다 '내 앱을 내가 배포하고 고치는' 판단 기준"
keywords:
  - Declarative API
  - Reconciliation Loop
  - Control Plane
  - kubelet
  - kubectl
  - Pod
  - Probe
  - Deployment
  - Rolling Update
  - Service
  - Endpoints
  - Ingress
  - ConfigMap
  - Secret
  - PVC
  - requests/limits
  - QoS
  - EKS
materials:
  - file: slides-k8s-deploy.pdf
    title: "강의 슬라이드 — 쿠버네티스 이해 및 앱 배포"
    type: slides
    date: 2026-09-07
  - file: lab-k8s-deploy-guide.pdf
    title: "실습 가이드 — 쿠버네티스 앱 배포"
    type: lab
    date: 2026-09-07
  - file: lab-shop-api.zip
    title: "실습 코드 — shop-api (Spring Boot, Dockerfile)"
    type: lab
    date: 2026-09-07
  - file: lab-eks-skala-2026.zip
    title: "실습 매니페스트 — EKS skala-2026"
    type: lab
    date: 2026-09-07
---

## 한눈에 보기

```layers
바깥 :: 사용자 → DNS(*.skala-ai.com) → 공용 LB
들어오는 문 :: Ingress (ingress-nginx), 호스트·경로로 분기
고정 주소 :: Service (ClusterIP), Endpoints로 Ready Pod에 분산
실행 단위 :: Deployment → ReplicaSet → Pod → Container
붙는 것 :: ConfigMap · Secret · PVC (설정과 데이터는 Pod 밖에)
```

- 목표는 "Spring Boot 앱 하나를 컨테이너로 감싸 EKS에 올리고, 도메인으로 접속되게 한 뒤 무중단으로 고쳐 배포하는 것". 리소스는 수십 가지지만 앱을 올리는 데 쓰는 8개(Pod·Deployment·Service·Ingress·ConfigMap·Secret·PVC·StatefulSet)에 집중함.
- Day1(9/7)은 선언형 API와 조정 루프, 이미지 만들기, 컨트롤 플레인·워커 노드 구조, kubectl 진단 습관, Pod 개념을 다룸.
- Day2(9/8)는 프로브·롤링 업데이트·Service·Ingress·ConfigMap/Secret·PVC·requests/limits를 한 장의 완성 매니페스트로 묶고, 상태 이름에서 원인으로 가는 진단표로 마무리함.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준. 실습 클러스터는 EKS `skala-2026`(ap-northeast-2, 단일 AZ), 반별 네임스페이스 `class-6`~`class-10` 공유, 레지스트리는 사내 Harbor.

### Day1 (9/7) — 컨테이너, 클러스터 구조, kubectl, Pod

1. **왜 쿠버네티스인가** — 물리→VM→컨테이너, docker run만으로 부족한 운영 작업, 선언형 API와 조정 루프, 명령형 vs 선언형, Manifest vs Resource, spec/status, YAML 실수, 개발자가 알아야 할 8개 리소스, 노드·파드·컨테이너, 책임 경계, 관리형 EKS (p.3–19)
2. **컨테이너와 이미지** — namespace·cgroup·union FS, 이미지와 쓰기 층, 레이어 캐시 순서, Dockerfile 지시어, Spring Boot 멀티 스테이지, 컨테이너 안 JVM 메모리, 태그 전략·다이제스트, 레지스트리 인증, 로컬 검증 (p.20–33)
3. **쿠버네티스 아키텍처** — 컨트롤 플레인·워커 노드, `kubectl apply`의 8단계 여정, Pod가 뜨기까지, 오브젝트 공통 구조, 라벨과 셀렉터, 네임스페이스, 애드온 (p.34–44)
4. **클러스터 내부 동작** — EKS 아키텍처, API 서버 요청 관문, 컨트롤러들, 스케줄러 필터·점수, etcd, CCM, kubelet, CRI, kube-proxy와 iptables, 컴포넌트 장애 영향 (p.45–57)
5. **실습 환경과 kubectl** — 도구 버전, `update-kubeconfig`, 컨텍스트, 명령 문법, get/describe, 정렬·필터, jsonpath, logs·exec, apply·diff, heredoc, 정리 (p.58–72)
6. **kubectl 실무** — port-forward, exec·debug, top, label·annotate, apply/edit/patch/replace, delete, cp, k9s, `--raw` API, explain, dry-run (p.73–85)
7. **Pod** — 정의, 매니페스트, 생명주기·상태 이름, initContainer, 프로브 3종, 종료 순서, 재시작 정책, 멀티 컨테이너 패턴, Downward API, 네이키드 Pod, 디버깅 도구 상자 (p.86–101)

### Day2 (9/8) — 배포, 네트워크, 설정, 실전

1. **Deployment와 롤아웃** — Deployment·ReplicaSet 관계, 매니페스트, 롤링 업데이트 단계, rollout status·멈춘 배포·undo·history, 스케일, 무중단 배포 조건 (p.102–114)
2. **Service와 클러스터 네트워킹** — Pod IP를 못 쓰는 이유, 실체 없는 Service, Endpoints, Service 종류·NodePort, 클러스터 DNS·CoreDNS, EKS LoadBalancer(NLB), 세션, 진단 순서와 함정 (p.115–130)
3. **호출 흐름 추적** — 사용자→LB→Pod→컨테이너→프로세스 6구간, 구간별 운영 권장, 복구 우선 순서 (p.131–138)
4. **Ingress와 외부 노출** — LB 하나로 묶기, 컨트롤러 비교, ingress-nginx 내부, 경로·호스트 분기, pathType 우선순위, HTTPS(ACM), Ingress 장애 표 (p.139–149)
5. **설정과 스토리지** — 설정 분리 원칙, ConfigMap 주입(env·볼륨)·우선순위·재시작, Secret, 볼륨 수명, PV·PVC·StorageClass, 접근 모드 (p.150–165)
6. **리소스와 배포 실전** — requests/limits·단위·QoS, 12-Factor 조건, Actuator 헬스, graceful 종료 시간 검산, 완성 매니페스트, 배포 전 점검표, 장애 대응·진단표, 운영 전환 체크 (p.166–180)

## 실습 정리

공통 규칙: `export ME=p000`(자기 식별자), 네임스페이스를 반 전체가 공유하므로 모든 리소스 이름에 `-$ME`를 붙이고, `render.sh`로 자리표시자(`__ME__`, `__REG__`)를 채워 **눈으로 읽은 뒤** `kubectl apply -f -`로 적용. 이 클러스터는 노드가 Harbor에서 바로 받으므로 imagePullSecrets가 없다.

| 실습 | 내용 | 확인한 것 |
| --- | --- | --- |
| 1 | 로컬 빌드·실행 (`--memory=1g`) | 클러스터 limit을 미리 흉내, 관리 포트 분리로 8080의 `/actuator/health`는 404가 정상 |
| 2 | 조정 루프와 술래잡기 | 지워도 3개, `--cascade=orphan`으로 Deployment→RS→Pod 소유 사슬 끊기 |
| 3 | Harbor에 이미지 올리기 | `docker login`에 `https://` 붙이면 401, `--platform linux/amd64` 필수 |
| 4 | 라벨 하나로 트래픽 훔치기 | 라벨을 떼면 RS가 새 Pod 생성, 다른 Service 라벨을 붙이면 Endpoints에 끼어듦 |
| 5 | 권한의 경계 | `kubectl auth can-i`, 다른 반·네임스페이스 생성은 Forbidden |
| 6 | 매니페스트를 30초에 | `--dry-run=client -o yaml`로 뼈대, `explain`, `diff` 후 apply |
| 7 | 프로브 흔들기 | `/api/unready`로 readiness만 내리면 READY 0/1, RESTARTS 0 |
| 8 | 로그 제대로 보기 | `-l`, `--since`, `--previous`, `--max-log-requests` |
| 9 | 실패하는 배포 | 없는 태그로 배포해도 maxUnavailable 0이라 200만 응답, `rollout undo` |
| 10 | Endpoints에서 빠지는 순간 | readiness 실패 Pod의 IP가 Endpoints에서 사라짐 |

```bash
# 실습 3 — Harbor push (프로젝트 = 반 이름)
docker login skala-registry.skala-ai.com -u class-6        # https:// 붙이지 않는다
IMG=skala-registry.skala-ai.com/class-6/shop-$ME:1.0.0
docker build --platform linux/amd64 -t $IMG . && docker push $IMG

# 실습 9 — 실패하는 배포를 만들고 되돌리기
kubectl set image deploy/shop-$ME app=skala-registry.skala-ai.com/class-6/shop-$ME:9.9.9
kubectl rollout status deploy/shop-$ME --timeout=60s     # 타임아웃으로 실패
kubectl rollout undo deploy/shop-$ME
```

`shop-api` Dockerfile: 멀티 스테이지(JDK로 bootJar → JRE), uid 10001 non-root, exec 형식 ENTRYPOINT, `-XX:MaxRAMPercentage=75`. `application.yml`은 `server.shutdown: graceful`, 관리 포트 8081 분리, liveness/readiness 그룹 분리, `forward-headers-strategy: framework`.

```yaml
# l18-complete/10-deployment.yaml 핵심 (판교판)
spec:
  strategy: { rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } }
  template:
    spec:
      terminationGracePeriodSeconds: 40        # preStop 5 + Spring 25 < 40
      securityContext: { runAsNonRoot: true, runAsUser: 10001 }
      containers:
        - name: app
          image: __REG__/shop-__ME__:__TAG__
          envFrom:
            - configMapRef: { name: shop-config-__ME__ }
            - secretRef:    { name: shop-secret-__ME__ }
          resources:
            requests: { cpu: 200m, memory: 512Mi }
            limits:   { cpu: "1",  memory: 1Gi }
          startupProbe:   { httpGet: { path: /actuator/health/liveness,  port: mgmt }, periodSeconds: 5, failureThreshold: 30 }
          livenessProbe:  { httpGet: { path: /actuator/health/liveness,  port: mgmt }, periodSeconds: 10 }
          readinessProbe: { httpGet: { path: /actuator/health/readiness, port: mgmt }, periodSeconds: 5 }
          lifecycle:
            preStop: { exec: { command: ["sh", "-c", "sleep 5"] } }
```

추가 매니페스트: `l14-pvc-pod.yaml`(ebs-sc RWO — replicas 2에서 두 번째가 Pending), `l15-efs-shared.yaml`(efs-sc RWX — 두 줄만 다름), `l16-oom.yaml`(limit 256Mi로 OOMKilled 재현), `l18-complete/`(ConfigMap·Secret·Deployment·Service·Ingress(nginx)·HPA·PDB).
