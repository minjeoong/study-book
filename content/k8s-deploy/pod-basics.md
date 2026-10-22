---
title: "Pod 구조와 멀티 컨테이너 패턴"
en: "Pod · Init Container · Sidecar"
summary: "Pod는 네트워크·볼륨을 공유하며 같은 노드에서 함께 살고 죽는 컨테이너 묶음이자 스케줄링 최소 단위"
importance: 2
order: 5
tags:
  - Pod
  - initContainer
  - Sidecar
keypoints:
  - "같은 Pod 컨테이너는 IP 하나를 공유해 localhost로 통신, 파일은 볼륨으로만 공유"
  - "initContainer는 순서대로 끝까지 성공해야 본 컨테이너 시작, 멱등해야 함"
  - "사이드카·앰배서더·어댑터만 묶고, 독립 앱 두 개를 한 Pod에 넣지 않음"
qa:
  - q: "Pod와 컨테이너의 차이는?"
    a: "컨테이너는 격리된 프로세스이고, Pod는 쿠버네티스가 배포·스케줄링하는 최소 단위로 하나 이상의 컨테이너를 묶은 껍데기다. 같은 Pod의 컨테이너는 네트워크 네임스페이스(IP·포트 공간·localhost)를 공유하고 볼륨을 함께 마운트할 수 있으며, 항상 같은 노드에 배치되고 생명주기를 같이한다. 대부분의 Pod는 컨테이너 하나이고, 보조 역할이 필요할 때만 사이드카를 붙인다."
  - q: "init container는 언제 쓰나?"
    a: "본 컨테이너보다 먼저 순서대로 실행되어 성공해야 하는 준비 작업에 쓴다. DB가 열릴 때까지 기다리기, 마이그레이션, 설정 파일 다운로드 같은 의존성 대기를 앱 코드가 아니라 매니페스트로 처리한다. 실패하면 Pod 전체가 재시작되므로 여러 번 실행해도 안전(멱등)하게 만들어야 하고, 상태는 Init:0/2처럼 보이며 로그는 -c 이름으로 본다."
  - q: "Pod를 직접 만들지 않고 Deployment를 쓰는 이유는?"
    a: "관리자 없는 네이키드 Pod는 노드가 죽으면 그대로 사라지고 아무도 다시 만들지 않으며 복제·롤링 업데이트도 안 된다. Deployment는 ReplicaSet으로 개수를 유지하고 버전 교체와 롤백까지 해 준다. 상태가 있으면 StatefulSet, 노드마다 하나면 DaemonSet, 배치는 Job/CronJob을 쓰고, Pod를 직접 만드는 건 디버깅용 임시 Pod뿐이다."
related:
  - probes
  - k8s-advanced/pod-pause-container
  - k8s-advanced/statefulset-headless
  - k8s-advanced/job-cronjob
source: "Day1(9/7) 슬라이드 p.86–89, p.92, p.96–99 · 심화: k8s-advanced Day1(10/14) p.106–118 (init container·nginx sidecar 실습)"
---

```compare
공유한다 | 공유하지 않는다
네트워크 | IP·포트 공간 하나 → 같은 포트를 두 컨테이너가 못 씀 | —
통신 | localhost(127.0.0.1)로 서로 호출 | —
저장소 | 같은 볼륨을 각자 마운트 가능 | 각자 이미지의 루트 파일시스템
생명주기·노드 | 같이 뜨고 같이 종료, 항상 같은 노드 | 프로세스(기본은 PID 네임스페이스 분리)
```

| 패턴 | 무엇 | 예 |
| --- | --- | --- |
| 사이드카 | 앱을 돕는 보조 컨테이너 (가장 흔함) | 로그 수집, 프록시, 인증서 갱신, Istio envoy |
| 앰배서더 | 외부 연결을 대신 맡음 | DB 프록시, 서비스 메시 프록시 |
| 어댑터 | 출력 형식 변환 | 앱 지표를 Prometheus 형식으로 |
| 안티패턴 | 독립 앱 두 개를 한 Pod에 | API + 배치 워커 → 각각 Deployment로 분리 |

> [!tip] Downward API
> `env.valueFrom.fieldRef`로 `metadata.name`, `spec.nodeName`, `status.podIP`를, `resourceFieldRef`로 `limits.memory`를 앱에 주입. 로그·지표에 POD_NAME을 붙이면 "특정 복제본만 느리다"를 바로 찾을 수 있음.
