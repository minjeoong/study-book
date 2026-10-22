---
title: "StatefulSet과 Headless Service"
en: "StatefulSet · Headless Service"
summary: "StatefulSet은 Pod마다 고정 이름(app-0, app-1)·전용 PVC·안정적 DNS를 주는 상태 보유 워크로드, Headless Service(clusterIP: None)는 그 Pod IP를 DNS로 직접 돌려준다"
importance: 3
order: 4
tags:
  - StatefulSet
  - Headless Service
  - Stateful
keypoints:
  - "volumeClaimTemplates로 Pod별 PVC, 스케일 다운해도 PVC는 남음"
  - "순서 보장: 생성 0→1→2, 업데이트는 큰 번호부터 하나씩"
  - "Pod DNS: <pod>.<headless-svc>.<ns>.svc.cluster.local → Pod IP 직접"
qa:
  - q: "Deployment와 StatefulSet의 차이는?"
    a: "Deployment는 무상태 앱용이라 Pod가 서로 구분되지 않고 이름이 매번 바뀌며 ReplicaSet으로 복제한다. StatefulSet은 Pod마다 순번이 붙은 고정 이름과 hostname, volumeClaimTemplates로 만든 전용 PVC, Headless Service를 통한 고정 DNS 이름을 주고, 생성·삭제·업데이트를 순서대로 하나씩 진행한다. 그래서 MySQL Primary/Replica, Kafka 브로커, Redis Cluster, Elasticsearch처럼 각 Pod가 고유 역할과 데이터를 가지는 시스템에 쓴다."
  - q: "StatefulSet은 왜 ReplicaSet을 쓰지 않나?"
    a: "ReplicaSet은 Pod를 서로 대체 가능한 복제본으로 보고 롤링 업데이트 중 잠시 개수를 늘리는 것도 허용한다. 상태 있는 Pod는 같은 이름과 같은 스토리지를 쓰는 Pod가 동시에 둘 있으면 데이터가 깨질 수 있으므로, StatefulSet 컨트롤러는 Pod를 직접 하나씩 삭제하고 같은 ordinal 이름으로 재생성해 Ready가 된 뒤에 다음으로 넘어간다."
  - q: "Headless Service는 일반 Service와 무엇이 다른가?"
    a: "clusterIP: None으로 만들어 가상 IP가 없고 kube-proxy 부하 분산도 거치지 않는다. CoreDNS가 Service 이름 조회에 Pod IP 목록을 돌려주고, StatefulSet의 serviceName과 연결하면 my-app-0.my-headless.ns.svc.cluster.local처럼 특정 Pod를 이름으로 직접 호출할 수 있다. 클라이언트가 특정 Primary나 특정 브로커와 계속 통신해야 할 때 쓴다."
related:
  - volume-provisioning-csi
  - k8s-deploy/pv-pvc
  - k8s-deploy/service-endpoints
  - service-deep-dive
source: "Day2(10/16) 슬라이드 p.179–194 (statefulset.yaml, headless.yaml 실습)"
---

```compare
Deployment | StatefulSet
목적 | Stateless (Web, API) | Stateful (DB, Kafka)
Pod 이름 | 매번 바뀜 (`-7d9f8-x2k4l`) | 고정 (`-0`, `-1`, `-2`)
Pod별 저장소 | 기본 개념 아님 | volumeClaimTemplates로 Pod별 PVC
네트워크 이름 | Service 뒤에서 구분 안 함 | Headless로 Pod별 DNS
생성·업데이트 순서 | 보장 안 함, 동시 진행 | 순서 보장, 하나씩
하위 컨트롤러 | ReplicaSet | 없음 (직접 Pod 제어)
```

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sk000-myfirst-api-server
spec:
  replicas: 2
  serviceName: sk000-myfirst-api-server-headless   # Headless Service 먼저 배포 권고
  selector:
    matchLabels: { app: sk000-myfirst-api-server }
  template:
    metadata:
      labels: { app: sk000-myfirst-api-server }
    spec:
      containers:
        - name: myfirst-api-server
          image: <레지스트리>/sk000-myfirst-api-server:2.0
          volumeMounts: [ { name: data, mountPath: /data } ]
  volumeClaimTemplates:              # Pod마다 data-<pod이름> PVC 생성
    - metadata: { name: data }
      spec:
        accessModes: ["ReadWriteMany"]
        storageClassName: efs-sc-shared
        resources: { requests: { storage: 100Mi } }
---
apiVersion: v1
kind: Service
metadata:
  name: sk000-myfirst-api-server-headless
spec:
  clusterIP: None                    # Headless
  selector: { app: sk000-myfirst-api-server }
  ports: [ { name: http, port: 8080, targetPort: 8080 } ]
```

> [!warn] EBS와 AZ, 노드 장애
> EBS는 AZ를 넘어 마운트되지 않아 StatefulSet Pod가 AZ에 묶이므로 AZ 의존을 없애려면 EFS를 권고(수업 기준). 노드 장애·네트워크 단절로 Pod가 Unknown이면 같은 이름 Pod를 중복으로 만들지 않으려고 자동 교체가 안 될 수 있어 `kubectl delete pod <pod>-0 --force`가 필요할 수 있음.
