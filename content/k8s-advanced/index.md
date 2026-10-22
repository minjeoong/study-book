---
summary: "k8s-deploy의 기본기를 내부 흐름(pause·admission·kube-proxy)까지 다시 짚고, StatefulSet·Headless·동적 볼륨·cert-manager HTTPS·Blue/Green·Canary와 Self Study(TLS·Job·Graceful Shutdown·Service 심화·SecurityContext·PriorityClass)로 운영 수준까지 확장"
keywords:
  - pause container
  - command/args
  - init container
  - sidecar
  - ReplicaSet
  - StorageClass
  - CSI
  - StatefulSet
  - Headless Service
  - Secret
  - cert-manager
  - Blue/Green
  - Canary
  - TLS
  - Job
  - CronJob
  - EndpointSlice
  - SecurityContext
  - PriorityClass
materials:
  - file: slides-k8s-advanced.pdf
    title: "강의 슬라이드 — 쿠버네티스 실무 심화 (v4.1)"
    type: slides
    date: 2026-10-14
---

## 한눈에 보기

```flow
리마인드 :: Pod·Deployment·Service·Namespace·Label을 내부 구조까지
내부 흐름 :: admission → controller → kubelet → containerd·runc, CoreDNS → iptables
Pod 설계 :: command/args와 PID 1, init container, sidecar, RollingUpdate 전략
상태와 설정 :: PV·StorageClass·CSI, StatefulSet + Headless, ConfigMap·Secret
외부 노출과 배포 :: cert-manager HTTPS Ingress, Blue/Green·Canary
```

- Day1(10/14)은 k8s-deploy에서 배운 리소스를 "apply 한 줄이 runc까지 가는 길"과 "Service 이름이 Pod IP로 바뀌는 길"로 다시 따라가고, Pod 설계 요소(command/args, init container, nginx sidecar, ReplicaSet 롤링 전략)를 실습함.
- Day2(10/16, 10/15는 SKCT로 휴강)는 상태를 가진 앱(PV/PVC, StorageClass, StatefulSet, Headless)과 설정(ConfigMap·Secret), HTTPS Ingress와 무중단 배포 전략(Blue/Green, Canary)을 다룸.
- 슬라이드 후반 Self Study로 TLS 원리, Job/CronJob, Graceful Shutdown, Probe 핸들러, Service 심화, SecurityContext, QoS·PriorityClass가 이어짐.

## 수업 흐름

슬라이드 페이지는 PDF 페이지 번호 기준. 기본 개념(선언형, 아키텍처, 프로브, 롤링 업데이트, Service, ConfigMap·Secret, PVC, QoS)은 k8s-deploy 노트에 정리하고 여기서는 새로 다룬 내용 위주로 노트를 만듦.

### Day1 (10/14) — 쿠버네티스 리마인드와 내부 흐름

1. **실습 환경 구성** — `setup.sh`로 kubeconfig(토큰·CA), `kcns`, `gen-yaml.sh`, Harbor에 spring·fastapi·frontend·vue 이미지를 buildx 멀티 플랫폼으로 push (p.5–31)
2. **쿠버네티스 리마인드** — 선언적 방식(부장님 비유), spec/status, Pod(정의·라이프사이클·실행 범위·pause·공유 네임스페이스·플랫 네트워크), Deployment, Service·Endpoints·EndpointSlice (p.32–60)
3. **Namespace** — 격리·멀티테넌시·RBAC 경계·ResourceQuota/LimitRange, namespace scope vs cluster scope 리소스 (p.61–69)
4. **Label과 Selector** — 느슨한 연결, label 추가·`--overwrite`·삭제 (p.70–76)
5. **쿠버네티스 구조** — API 서버 Admission Control Flow, 컨트롤 플레인·데이터 플레인, CRI·CNI·sandbox(pause), hostPID Pod로 노드 프로세스 확인, `ctr` (p.77–89)
6. **전체 흐름 이해** — Deployment apply부터 runc까지, 장애 Pod 삭제 후 재생성, Service 호출 시 CoreDNS → kube-proxy iptables → Pod (p.90–98)
7. **Pod Argument 전달** — command/args, `sh -c`와 `exec`, PID 1 문제 (p.99–105)
8. **Init Container** — `active.enabled` 파일을 기다리는 init, readinessProbe 연동 (p.106–111)
9. **Sidecar** — Istio envoy 예시, nginx sidecar 리버스 프록시 실습 (p.112–118)
10. **ReplicaSet** — Deployment·RS 관계, maxSurge/maxUnavailable CASE 1·2, 기본값 25%, RollingUpdate vs Recreate, rollout undo 실습 (p.119–137)

### Day2 (10/16) — 상태·설정·외부 노출·무중단 배포

1. **Persistent Volume** — 로컬 vs 외부 볼륨, emptyDir·hostPath·EBS·EFS, PV/PVC Static, 볼륨 연결 과정, CSI, StorageClass 동적 프로비저닝, Access Mode, 짝꿍 PVC 공유 실습 (p.138–178)
2. **StatefulSet** — Deployment의 한계, 고정 이름·volumeClaimTemplates, 스케일·잃어버린 Pod 교체·순차 업데이트, ReplicaSet을 쓰지 않는 이유 (p.179–188)
3. **Headless Service** — `clusterIP: None`, Pod DNS 이름, 사용 시나리오 (p.189–194)
4. **ConfigMap** — Key-Value 환경변수 주입(dev/prod 전환 + rollout restart), 파일 마운트(자동 반영) (p.195–208)
5. **Secret** — 유형(Opaque·dockerconfigjson·basic-auth·ssh-auth·tls·SA token), data vs stringData, base64의 의미 (p.209–227)
6. **HTTPS Ingress** — Ingress·Controller, HTTPS 암호 요소, cert-manager(ClusterIssuer·Certificate·HTTP-01/DNS-01), 와일드카드 인증서 Ingress (p.228–252)
7. **무중단 배포** — Blue/Green(Service·Ingress 기반), Canary(Service 기반, Ingress header·cookie·weight), ModHeader 실습 (p.253–267)

### Self Study (슬라이드 후반부)

1. **TLS 보안 메커니즘** — 대칭·비대칭키, 해시, 전자서명, CA·인증서, TLS 1.2 흐름, self-signed 인증서 Ingress (p.268–285)
2. **Job과 CronJob** (p.286–291)
3. **Graceful Shutdown** — preStop/postStart, 종료 7단계 (p.292–297)
4. **Pod Lifecycle 관리** — 3가지 Probe, 핸들러(exec·tcp·http), readiness/liveness 실습 (p.298–312)
5. **Service 깊이 이해** — resolv.conf, EndpointSlice, 수동 Endpoints, `kubernetes.default`, NodePort·HostPort, LoadBalancer target type, ExternalName (p.313–338)
6. **Pod SecurityContext** — runAsNonRoot, privileged, capabilities, hostNetwork/PID/IPC (p.339–346)
7. **QoS Class와 PriorityClass** — 축출 순서, Node Pressure (p.347–355)

## 실습 정리

실습 저장소 `skala-ddive-kube`. 리소스 이름에 `sk000`(학번)을 붙이고 반 네임스페이스(`class-N`)에 배포.

- **nginx sidecar**: 한 Pod에 Spring Boot(8080) + nginx(80). 같은 network namespace라 nginx가 `127.0.0.1:8080`으로 프록시하고 `X-Sidecar-Proxy` 헤더를 붙임. `port-forward deploy/... 8081:80`으로 확인

```yaml
containers:
  - name: myfirst-api-server            # Main
    image: skala-registry.skala-ai.com/class-0/skala-myfirst-api-server:1.0
  - name: nginx-sidecar                 # Sidecar: proxy_pass http://127.0.0.1:8080
    image: nginx:1.27-alpine
    volumeMounts:
      - name: nginx-config
        mountPath: /etc/nginx/conf.d/default.conf
        subPath: default.conf
volumes:
  - name: nginx-config
    configMap: { name: skala-nginx-sidecar-config }
```

- **ReplicaSet 롤링**: deploy-v1.0 → v2.0 apply, `get replicaset`으로 옛 RS가 0으로 남는 것 확인, `rollout history`·`undo`·`--to-revision`
- **볼륨**: emptyDir로 한 Pod 두 컨테이너 파일 공유 → EFS Static PV/PVC로 replicas 2 공유 → StorageClass(`efs-sc-shared`) 동적 PVC, 삭제 후 재배포해도 파일 유지 → 짝꿍 PVC 마운트 + `kubectl cp`
- **StatefulSet + Headless**: Deployment를 StatefulSet으로 전환해 `-0`, `-1` 이름·hostname·PVC 확인, curl Pod에서 `pod-0.headless-svc:8080/python/hostname`으로 특정 Pod 직접 호출
- **ConfigMap·Secret**: dev → prod 값으로 바꾸면 env는 `rollout restart` 후에야, 파일 마운트는 30초 내외로 자동 반영
- **HTTPS·무중단 배포**: 미리 만든 와일드카드 Certificate Secret으로 TLS Ingress → blue/green Deployment + Service selector 교체 → canary Ingress(header `x-region: ap-suwon`, cookie `canary-session=always`, weight 40)

```bash
kubectl apply -f ./blue && kubectl apply -f ./green
kubectl apply -f service.yaml                 # selector version: "1.0" → blue
kubectl apply -f change-green-service.yaml    # selector version: "2.0" → 한 번에 green 으로
kubectl apply -f canary-weight-ingress.yaml   # 6:4 로 blue:green 분산
```

- **Self Study**: openssl self-signed 인증서로 TLS Secret·Ingress, Job(completions 3·parallelism 2)·CronJob(`*/3 * * * *`, Forbid), preStop/postStart 로그, readiness DOWN 시 Endpoints 제거·liveness DOWN 시 재시작, 수동 Endpoints·NodePort·ExternalName, runAsNonRoot·privileged·NET_ADMIN, BestEffort → Burstable → Guaranteed 전환
