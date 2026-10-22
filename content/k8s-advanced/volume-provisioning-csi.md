---
title: "볼륨 프로비저닝과 CSI"
en: "Static · Dynamic Provisioning · CSI"
summary: "PV를 관리자가 미리 만드는 Static, PVC가 StorageClass로 PV를 자동 생성하는 Dynamic 방식이 있고, 실제 생성·attach·mount는 CSI 드라이버가 한다"
importance: 2
order: 3
tags:
  - PV
  - StorageClass
  - CSI
  - EBS
  - EFS
keypoints:
  - "EBS는 블록·RWO·AZ 종속, EFS는 파일·RWX·VPC 전체"
  - "CSI Controller는 생성·attach, Node Plugin은 포맷·mount"
  - "EBS는 WaitForFirstConsumer로 Pod 배치 후 같은 AZ에 생성"
qa:
  - q: "Static과 Dynamic 프로비저닝의 차이는?"
    a: "Static은 관리자가 EFS나 EBS를 먼저 만들고 그 접속 정보(volumeHandle, 예: EFS 파일시스템 ID와 Access Point)를 담은 PV를 수동으로 만들어 두면, 사용자의 PVC가 조건이 맞는 PV에 바인딩되는 방식이다. Dynamic은 PVC에 storageClassName만 지정하면 CSI external-provisioner가 PVC를 감지해 실제 스토리지를 만들고 PV를 자동 생성·바인딩한다. 운영에서는 대부분 StorageClass 기반 Dynamic을 쓴다."
  - q: "EBS StorageClass에 WaitForFirstConsumer가 필요한 이유는?"
    a: "EBS는 특정 AZ에 묶이는 블록 스토리지라 PVC 생성 즉시(Immediate) 볼륨을 만들면 나중에 Pod가 다른 AZ의 노드에 스케줄될 때 붙일 수 없다. WaitForFirstConsumer는 PVC를 쓰는 Pod가 실제로 노드에 배치될 때까지 기다렸다가 그 노드의 AZ에 볼륨을 만든다. EFS는 VPC 전체에서 마운트되므로 Immediate로도 된다."
  - q: "Pod가 PVC를 마운트하기까지의 흐름은?"
    a: "PVC가 PV와 Bound되면 스케줄러가 Pod를 노드에 배치한다. 그 노드의 kubelet이 PV의 CSI 드라이버와 volumeHandle을 읽고, EBS라면 CSI Controller가 볼륨을 노드에 attach한 뒤 CSI Node Plugin이 블록 디바이스를 포맷·마운트한다. EFS(NFS)는 attach 없이 노드에 바로 마운트하고, 마지막으로 컨테이너의 mountPath에 bind mount한다."
related:
  - k8s-deploy/pv-pvc
  - statefulset-headless
source: "Day2(10/16) 슬라이드 p.138–178 (13.volume: 01.emptydir, 03.pvc, StorageClass 동적 할당, 짝꿍 공유 실습)"
---

```flow
PVC 생성 :: storageClassName: efs-sc-shared, ReadWriteMany, 5Gi
external-provisioner :: CSI Controller의 사이드카가 PVC 감지 → 볼륨 생성 요청
PV 자동 생성·Bound :: EFS는 PVC마다 Access Point(디렉터리) 생성
Pod 스케줄 :: kubelet이 PV의 driver·volumeHandle 확인
CSI Node Plugin :: (EBS면 attach 후) 노드에 mount → 컨테이너 /data 에 bind mount
```

```compare
EBS (Block) | EFS (File)
CSI 드라이버 | `ebs.csi.aws.com` | `efs.csi.aws.com`
접근 모드 | RWO (한 노드) | RWX (여러 노드 동시)
범위 | 단일 AZ | 멀티 AZ, VPC 전체
attach 단계 | 필요 (노드 블록 디바이스 → ext4 mount) | 불필요 (NFS mount)
성능 | 고성능·저지연, DB에 적합 | 네트워크 지연, 공유 파일에 적합
비용 | 프로비저닝 용량 기준 | 사용량 기준
bindingMode | WaitForFirstConsumer | Immediate 가능
```

> [!tip] StorageClass 주요 필드
> `provisioner`(CSI 드라이버), `parameters`(EBS `type: gp3`·`fsType: ext4`, EFS `provisioningMode: efs-ap`·`fileSystemId`·`basePath`), `reclaimPolicy`(Delete면 PVC 삭제 시 볼륨도 삭제, Retain이면 데이터 보존), `volumeBindingMode`, `allowVolumeExpansion`. Access Mode에는 RWO·ROX·RWX 외에 단일 Pod만 쓰는 ReadWriteOncePod(RWOP)도 있음.
