---
title: "Jenkins 빌드 트리거 (PollSCM vs Webhook)"
en: "Jenkins Build Trigger · PollSCM · GitHub Webhook"
summary: "코드 변경을 감지해 파이프라인을 자동 시작하는 방법. PollSCM은 Jenkins가 주기적으로 Git을 확인, Webhook은 GitHub가 push 즉시 Jenkins를 호출"
importance: 2
order: 8
tags:
  - Jenkins
  - Webhook
  - CI
keypoints:
  - "PollSCM: Jenkins가 cron 주기로 Git 확인, 외부 노출 불필요·지연 있음"
  - "Webhook: GitHub가 push 즉시 /github-webhook/ 호출 (끝 / 필수)"
  - "로컬 Jenkins는 PollSCM, Ingress로 노출한 k8s Jenkins는 Webhook"
qa:
  - q: "PollSCM과 Webhook의 차이는?"
    a: "PollSCM은 Jenkins가 정해진 주기마다 Git 저장소에 변경이 있는지 물어보는 pull 방식이라 Jenkins가 외부에 노출되지 않은 로컬 환경에서도 동작하지만, 주기만큼 지연이 생기고 변경이 없어도 계속 조회한다. Webhook은 GitHub가 push 이벤트가 생기는 즉시 Jenkins의 github-webhook 엔드포인트를 호출하는 push 방식이라 즉각적이고 낭비가 없지만 Jenkins가 GitHub에서 접근 가능한 주소여야 한다."
  - q: "Jenkins cron 표현식의 H는 무엇인가?"
    a: "H는 해시 값으로, 잡 이름을 기준으로 분산된 시각을 정해 준다. 예를 들어 H/15 * * * *는 매 15분이지만 모든 잡이 정각 0분에 몰리지 않고 잡마다 7분, 22분, 37분처럼 다른 오프셋에 실행되어 서버 부하가 분산된다."
related:
  - jenkins-pipeline
  - gitops
source: "Day2(10/13) 슬라이드 p.214–229 (Local PollSCM, k8s에 Jenkins 배포, GitHub webhook)"
---

```compare
PollSCM | GitHub Webhook
방향 | Jenkins → Git (주기적으로 물어봄) | GitHub → Jenkins (이벤트 즉시 호출)
설정 위치 | 파이프라인 Triggers의 Poll SCM schedule | 저장소 Settings → Webhooks → Payload URL
반응 속도 | 주기만큼 지연 (예: 1분) | push 즉시
조건 | Jenkins가 Git에 접근만 되면 됨 | Jenkins가 외부에서 접근 가능해야 함
수업 | 로컬 Jenkins (`* * * * *`, 1분 내 빌드 시작 확인) | k8s Jenkins + Ingress (`.../github-webhook/`)
```

| 표현식 | 의미 |
| --- | --- |
| `* * * * *` | 매 1분 |
| `H/15 * * * *` | 15분마다, 잡별로 분산된 분 (예: 7·22·37·52분) |
| `45 9-16/2 * * 1-5` | 평일 9:45부터 16:45까지 2시간마다 |
| `H H 1,15 1-11 *` | 12월 제외 매월 1일·15일 하루 한 번 |

> [!note] k8s에 띄운 Jenkins의 kubeconfig 우선순위 (p.219)
> `--kubeconfig` 옵션 > `KUBECONFIG` 환경변수 > `~/.kube/config` 순으로 파일을 찾고, 그 안에서 `--context` 또는 current-context를 고름. 아무 파일도 없는 Pod 안에서는 ServiceAccount 토큰(`/var/run/secrets/kubernetes.io/serviceaccount/`)으로 in-cluster 접근.
