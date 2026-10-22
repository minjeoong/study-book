---
title: "PriorityClass와 축출(Eviction) 순서"
en: "PriorityClass · Preemption · Node-pressure Eviction"
summary: "PriorityClass는 Pod의 스케줄링·선점 우선순위, QoS는 노드 자원 압박 시 축출 그룹을 정한다. 축출은 QoS로 그룹을 고르고 그 안에서 Priority로 순서를 정한다"
importance: 2
order: 12
tags:
  - PriorityClass
  - QoS
  - Eviction
keypoints:
  - "value가 클수록 우선, 미지정 Pod는 0 또는 globalDefault"
  - "자원 부족 시 낮은 우선순위 Pod를 선점(Preemption)"
  - "Node Pressure(memory.available<100Mi 등)에서 kubelet이 축출"
qa:
  - q: "PriorityClass와 QoS는 어떻게 다르고 함께 어떻게 쓰이나?"
    a: "QoS는 requests/limits 설정 결과로 자동으로 정해지는 자원 보장 수준이고, PriorityClass는 value 정수로 명시하는 Pod의 중요도다. 스케줄링 대기열에서는 Priority가 높은 Pod가 앞서고, 자원이 없으면 스케줄러가 노드를 골라 낮은 Priority Pod를 축출(Preemption)해 자리를 만든다. 노드 압박으로 kubelet이 축출할 때는 requests를 초과해 쓰는 그룹(BestEffort, 초과 Burstable)을 먼저 고르고 그 안에서 Priority가 낮은 것, 같으면 초과량이 큰 것부터 내보내며 Guaranteed는 마지막까지 보호한다."
  - q: "선점(Preemption)된 Pod는 어떻게 되나?"
    a: "스케줄러가 높은 우선순위 Pod를 놓을 노드를 정하면 그 노드의 낮은 우선순위 Pod들에 SIGTERM을 보내 축출하고 자원을 확보한다. 축출된 Pod는 다시 Pending 상태로 스케줄링 대기열에 들어가 자리가 날 때까지 기다린다. 그래서 중요한 워크로드에는 높은 PriorityClass와 Guaranteed QoS를 함께 준다."
related:
  - k8s-deploy/resources-qos
  - k8s-deploy/pod-status-troubleshooting
source: "Self Study 슬라이드 p.347–355 (11.qos 실습)"
---

```flow
Node Pressure 감지 :: kubelet이 메모리·디스크·inode 임계값 확인
1순위 그룹 :: requests 초과 사용 (BestEffort, 초과 Burstable)
그룹 안 순서 :: PriorityClass 낮은 Pod → 같으면 초과량 큰 Pod
2순위 그룹 :: requests 이내 사용 Burstable, PriorityClass 낮은 순
최후 :: Guaranteed (시스템 컴포넌트 제외, 정말 위험할 때만)
```

| 신호 | 기본 임계값 | 의미 |
| --- | --- | --- |
| memory.available | 100Mi 미만 | 사용 가능한 메모리 부족 |
| nodefs.available | 10% 미만 | 루트 파일시스템 여유 부족 |
| imagefs.available | 15% 미만 | 이미지 저장 디스크 여유 부족 |
| nodefs.inodesFree | 5% 미만 | inode 부족 |

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 100000               # 클수록 우선, 최대 10억
globalDefault: false        # true면 지정 안 한 Pod에 기본 적용
description: "중요한 워크로드용"
---
# Pod/Deployment 에서는 spec.priorityClassName: high-priority
```

> [!tip] 확인 명령
> `kubectl get priorityclass`로 목록, `kubectl get pods -A -o custom-columns=NAME:.metadata.name,PRIORITY:.spec.priority`로 Pod별 우선순위, `kubectl describe pod`의 `QoS Class`로 클래스 확인.
