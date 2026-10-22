---
title: "OverlayFS와 Copy-on-Write"
en: "OverlayFS · Copy-on-Write"
summary: "읽기 전용 이미지 레이어(lowerdir)와 컨테이너 쓰기 층(upperdir)을 merged 디렉터리 하나로 겹쳐 보여 주는 계층 파일시스템"
importance: 2
order: 9
tags:
  - OverlayFS
  - 이미지
  - 파일시스템
keypoints:
  - "lowerdir(이미지, RO) + upperdir(컨테이너 변경, RW) → merged = 컨테이너 rootfs"
  - "수정 시 원본을 upperdir로 복사한 뒤 변경(CoW), 이미지 원본은 불변"
  - "runc가 pivot_root로 merged 디렉터리를 컨테이너의 /로 전환"
qa:
  - q: "같은 이미지로 컨테이너를 100개 띄워도 디스크를 적게 쓰는 이유는?"
    a: "OverlayFS가 이미지 레이어를 읽기 전용 lowerdir로 두고 모든 컨테이너가 이를 공유하며, 각 컨테이너는 자기 변경분만 upperdir에 쓰기 때문이다. 파일을 수정하면 그 파일만 upperdir로 복사한 뒤 바꾸는 Copy-on-Write 방식이라 원본 레이어는 그대로다. 그래서 컨테이너를 지우면 upperdir, 즉 쓰기 층과 그 안의 데이터도 함께 사라진다."
  - q: "컨테이너 안에서 만든 파일이 재시작 후 사라지는 이유는?"
    a: "컨테이너가 쓴 파일은 그 컨테이너 전용 upperdir에만 저장되고 이미지 레이어에는 반영되지 않는다. 컨테이너를 새로 만들면 새 upperdir가 생기므로 이전 변경분은 보이지 않는다. 남겨야 하는 데이터는 볼륨에, 로그는 stdout으로 내보낸다."
related:
  - container-image-registry
  - namespace-cgroup
  - container-runtime-oci
  - docker-cli-volumes
source: "Day2(8/24) 슬라이드 p.187–192 (08.overlayfs 실습)"
---

```layers
merged (/) :: 컨테이너가 보는 rootfs, 아래 층을 합쳐 하나로 보여 줌
upperdir (RW) :: 컨테이너 변경 내용, 같은 파일이면 여기가 우선
lowerdir N … 1 (RO) :: 이미지 레이어, 수정·삭제 불가, 컨테이너끼리 공유
workdir :: 생성·삭제·rename 등에 쓰는 OverlayFS 내부 작업 공간
```

```bash
# 컨테이너 안(--privileged)에서 직접 OverlayFS 만들기
mkdir -p /mnt/ovtest && mount -t tmpfs tmpfs /mnt/ovtest
mkdir -p /mnt/ovtest/{lower,upper,work,merged}
echo "AAA from lower" > /mnt/ovtest/lower/a.txt
mount -t overlay overlay \
  -o lowerdir=/mnt/ovtest/lower,upperdir=/mnt/ovtest/upper,workdir=/mnt/ovtest/work \
  /mnt/ovtest/merged
echo "add line test" >> /mnt/ovtest/merged/a.txt
cat /mnt/ovtest/lower/a.txt   # 원본 그대로
cat /mnt/ovtest/upper/a.txt   # 복사된 뒤 수정된 파일 (Copy-on-Write)
```

> [!note] 실제 위치
> containerd는 `/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/<id>/fs/` 아래에 레이어를 풀어 두고, 병합 결과를 `/run/containerd/.../rootfs`로 마운트함. 리눅스 커널 3.18부터 정식 포함.
