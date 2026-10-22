---
title: "requests · limits와 QoS 클래스"
en: "Resource Requests · Limits · QoS Class"
summary: "requests는 스케줄러가 보는 보장량, limits는 커널(cgroup)이 강제하는 상한. 둘의 조합이 QoS 클래스와 축출 순서를 정한다"
importance: 3
order: 12
tags:
  - Resources
  - QoS
  - OOMKilled
  - JVM
keypoints:
  - "CPU 초과는 스로틀링(느려짐), 메모리 초과는 OOMKilled(즉시 종료)"
  - "Guaranteed(req=limit) > Burstable > BestEffort(미지정) 순으로 오래 살아남음"
  - "JVM은 힙 외 메모리가 limit의 20~25%라 -XX:MaxRAMPercentage=75가 기본값"
qa:
  - q: "requests와 limits의 차이는?"
    a: "requests는 스케줄러가 노드 배치 때 보는 값으로 이만큼은 보장받는다는 의미이고, 적지 않으면 0으로 보아 노드가 과밀해진다. limits는 노드 커널의 cgroup이 강제하는 상한으로, CPU를 넘으면 스로틀링으로 느려지고 메모리를 넘으면 OOMKilled로 즉시 종료된다. 그래서 메모리 limit이 더 위험하고, 값은 추측이 아니라 kubectl top과 며칠 치 지표로 정한다."
  - q: "QoS 클래스는 어떻게 정해지고 무엇에 쓰이나?"
    a: "QoS는 직접 설정하는 값이 아니라 requests와 limits를 어떻게 적었는지에 따라 자동으로 정해진다. 모든 컨테이너가 requests와 limits를 같게 지정하면 Guaranteed, 일부만 있거나 값이 다르면 Burstable, 아무것도 없으면 BestEffort다. 노드 자원이 부족하면 kubelet이 BestEffort부터, 그다음 requests를 많이 초과해 쓰는 Burstable 순으로 축출하고 Guaranteed는 마지막까지 보호한다."
  - q: "힙은 안 찼는데 컨테이너가 OOMKilled 되는 이유는?"
    a: "JVM은 힙 외에도 메타스페이스, 스레드 스택(스레드당 약 1MB), 코드 캐시, 다이렉트 버퍼로 메모리를 쓰고 이 오버헤드가 limit의 20~25% 정도다. 힙을 limit의 90%로 잡으면 힙 밖 메모리가 모자라 컨테이너 전체가 커널에 죽고 앱 로그에는 아무것도 남지 않는다. -Xmx 대신 MaxRAMPercentage=75를 쓰면 limit 기준 비율이라 limit을 바꿔도 이미지를 다시 빌드할 필요가 없다."
related:
  - pod-status-troubleshooting
  - container/namespace-cgroup
  - k8s-advanced/priority-class-eviction
source: "Day1(9/7) 슬라이드 p.26 · Day2(9/8) p.166–169, p.178 · lab-eks-skala-2026 l16-oom.yaml"
---

```compare
requests | limits
누가 보나 | kube-scheduler | 노드 커널 cgroup
의미 | 이만큼은 보장 | 이 이상은 못 씀
CPU 초과 | — | 스로틀링, 느려지지만 안 죽음
메모리 초과 | — | OOMKilled, 즉시 종료
안 적으면 | 스케줄러가 0으로 봄 → 노드 과밀 | 무제한 → 노드 전체 위협
권장 | 실사용 p50~p70 | CPU는 requests의 2~4배, 메모리는 1.2~1.5배
```

| QoS | 조건 | 축출 순서 | 쓸 곳 |
| --- | --- | --- | --- |
| Guaranteed | 모든 컨테이너 requests = limits | 가장 나중 | DB, 핵심 API |
| Burstable | 일부만 지정 또는 requests < limits | 중간 (초과량 큰 것부터) | 일반 웹 서비스 |
| BestEffort | 아무것도 안 적음 | 가장 먼저 | 배치·실험 |

> [!warn] 단위
> CPU `1000m` = vCPU 1개, `200m` = 0.2 vCPU. 메모리는 항상 `Mi`·`Gi`(1024 기반)를 쓴다. `M`(1000 기반)과 섞으면 약 5~7% 차이. 노드가 실제로 줄 수 있는 양은 예약분을 뺀 Allocatable(`kubectl describe node`).
