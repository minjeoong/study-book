---
title: "볼륨과 PV · PVC · StorageClass"
en: "Volume · PersistentVolume · PersistentVolumeClaim · StorageClass"
summary: "앱은 PVC로 '이만큼, 이런 접근 모드로'만 요청하고, StorageClass가 실제 디스크(PV)를 동적으로 만들어 바인딩한다"
importance: 3
order: 11
tags:
  - PV
  - PVC
  - StorageClass
  - EBS
  - EFS
keypoints:
  - "볼륨 수명: 없음(컨테이너) < emptyDir(Pod) < PVC(Pod와 무관하게 유지)"
  - "PVC=요청서(네임스페이스), PV=실제 볼륨(클러스터 범위), StorageClass=만드는 방법"
  - "EBS는 RWO(한 노드), EFS는 RWX(여러 노드 공유)"
qa:
  - q: "PV, PVC, StorageClass의 관계는?"
    a: "PVC는 앱 팀이 작성하는 요청서로 크기, 접근 모드, StorageClass를 적는다. StorageClass는 인프라 팀이 정의한 디스크 생성 방법(gp3, EFS 등)이고, PVC가 들어오면 CSI 프로비저너가 실제 볼륨을 만들고 그것을 가리키는 PV를 생성해 PVC와 바인딩한다. 앱은 어떤 디스크인지 몰라도 PVC 이름만 마운트하면 된다."
  - q: "RWO 볼륨을 쓰는 Deployment를 2개로 늘리면?"
    a: "EBS 같은 ReadWriteOnce 볼륨은 한 노드에만 붙을 수 있어서 두 번째 Pod가 다른 노드에 스케줄되면 볼륨을 붙이지 못해 Pending에 머문다. 같은 이유로 롤링 업데이트에서 새 Pod가 볼륨을 못 붙여 교착될 수 있어 strategy를 Recreate로 둔다. 여러 Pod가 공유해야 하면 EFS 같은 RWX 스토리지를 쓰고, 업로드 파일은 S3를 먼저 검토한다."
related:
  - configmap-secret
  - k8s-advanced/volume-provisioning-csi
  - k8s-advanced/statefulset-headless
source: "Day2(9/8) 슬라이드 p.159–165 · lab-eks-skala-2026 l14-pvc-pod.yaml(RWO), l15-efs-shared.yaml(RWX)"
---

```flow
Pod :: volumes에 persistentVolumeClaim.claimName
PVC :: 10Gi, ReadWriteOnce, storageClassName: gp3 요청
StorageClass :: CSI 드라이버가 EBS 볼륨 생성 → PV 자동 생성·Bound
노드 attach :: 스케줄된 노드에 디스크 연결
컨테이너 mount :: mountPath(/data/uploads)로 마운트
```

| 용도 | 권장 | 이유 |
| --- | --- | --- |
| 로그 | stdout·stderr | 볼륨 불필요, 수집기가 가져감 |
| 업로드 파일 | S3 등 오브젝트 스토리지 | 무한 확장, Pod와 무관 |
| 임시 작업 파일·캐시 | emptyDir | Pod와 함께 사라져도 됨 |
| DB 데이터 | ebs-sc (RWO) | 빠름, 한 노드 전용 |
| 여러 Pod 공유 | efs-sc (RWX) | 느리고 비싸지만 동시 접근 |
| 설정 파일 | ConfigMap·Secret | 볼륨이 아니라 설정 |

> [!note] Pending이 정상인 PVC
> ebs-sc는 `volumeBindingMode: WaitForFirstConsumer`라 PVC만 만들면 Pending. Pod가 노드에 배치된 뒤 그 AZ에 볼륨을 만든다. `reclaimPolicy: Delete`면 PVC를 지울 때 EBS와 데이터도 같이 사라지고, PVC를 안 지우면 요금이 계속 나감.

> [!warn] hostPath
> 노드 파일시스템을 그대로 여는 볼륨이라 `/var/run/docker.sock` 같은 걸 열면 컨테이너 탈출로 이어짐. 앱에는 쓰지 않는다.
