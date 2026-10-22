---
title: "Blue/Green과 Canary 배포"
en: "Blue/Green · Canary Deployment"
summary: "Blue/Green은 두 버전을 모두 띄워 두고 트래픽을 한 번에 전환, Canary는 새 버전에 일부 트래픽(헤더·쿠키·가중치)만 보내 검증 후 늘린다"
importance: 3
order: 6
tags:
  - 무중단 배포
  - Blue/Green
  - Canary
  - Ingress
keypoints:
  - "Blue/Green은 한 번에 전환·즉시 복귀, 대신 자원 2배"
  - "Service selector의 version 라벨만 바꿔 Blue → Green 전환"
  - "nginx Ingress canary: by-header, by-cookie, weight 애노테이션"
qa:
  - q: "Rolling, Blue/Green, Canary 배포를 비교하면?"
    a: "Rolling Update는 쿠버네티스 기본 방식으로 Pod를 하나씩 새 버전으로 교체해 추가 자원이 적지만 교체 중 두 버전이 섞인다. Blue/Green은 새 버전(Green)을 전부 띄워 검증한 뒤 Service나 Ingress의 대상을 한 번에 바꾸므로 전환과 롤백이 즉시지만 자원이 두 배 든다. Canary는 새 버전에 일부 사용자나 일정 비율의 트래픽만 보내 영향을 보면서 점차 늘리는 방식이다."
  - q: "쿠버네티스에서 Blue/Green을 어떻게 구현했나?"
    a: "app 라벨은 같고 version 라벨만 1.0과 2.0으로 다른 blue·green Deployment를 둘 다 배포한다. Service의 selector에 version: 1.0을 넣어 두었다가 2.0으로 바꾸면 Endpoints가 green Pod로 교체되어 트래픽이 한 번에 넘어가고, 되돌릴 때는 selector만 다시 1.0으로 바꾼다. Ingress 기반이면 backend의 service 이름을 sk000-blue에서 sk000-green으로 바꾼다."
  - q: "nginx Ingress로 Canary를 어떻게 구성하나?"
    a: "기존 Ingress는 그대로 두고 같은 host로 canary용 Ingress를 하나 더 만들어 nginx.ingress.kubernetes.io/canary: true를 단다. canary-by-header(예: x-region: ap-suwon), canary-by-cookie(canary-session=always), canary-weight(예: 40)로 어떤 요청을 새 버전으로 보낼지 정한다. 헤더나 쿠키로 내부 테스터만 먼저 보내고, 문제가 없으면 weight로 비율을 늘린다."
related:
  - k8s-deploy/deployment-rolling-update
  - k8s-deploy/ingress
  - cert-manager-https-ingress
source: "Day2(10/16) 슬라이드 p.253–267 (blue·green Deployment, change-green-service, canary header·cookie·weight Ingress 실습)"
---

```compare
Rolling Update | Blue/Green | Canary
방식 | Pod를 점진적으로 교체 | 새 버전 전체를 띄운 뒤 한 번에 전환 | 일부 트래픽만 새 버전으로
추가 자원 | 적음 (maxSurge만큼) | 2배 | 새 버전 일부
롤백 속도 | rollout undo (다시 롤링) | selector·backend만 되돌림, 즉시 | canary 제거, 즉시
두 버전 공존 | 교체 중 섞임 | 대기만 하고 트래픽은 한쪽 | 의도적으로 공존
쿠버네티스 구현 | Deployment 기본 | Service selector 또는 Ingress backend 교체 | Service(라벨로 Pod 비율) 또는 nginx canary Ingress
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sk000-canary-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    # ① 헤더 기반: x-region: ap-suwon 인 요청만 green
    nginx.ingress.kubernetes.io/canary-by-header: "x-region"
    nginx.ingress.kubernetes.io/canary-by-header-value: "ap-suwon"
    # ② 쿠키 기반: canary-session=always 이면 green
    # nginx.ingress.kubernetes.io/canary-by-cookie: "canary-session"
    # ③ 가중치 기반: 40% 를 green 으로 (blue 60 : green 40)
    # nginx.ingress.kubernetes.io/canary-weight: "40"
spec:
  ingressClassName: nginx
  rules:
    - host: sk000-cert-ingress.class-0.skala-us.com     # 기존 blue Ingress 와 같은 host
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: sk000-green, port: { number: 8080 } } }
```

> [!note] Service 기반 Canary
> Service selector에서 version 필드를 빼고 app 라벨만 남기면 blue·green Pod가 모두 Endpoints에 들어가 Pod 수 비율(예: v1 3개 : v2 2개 = 60:40)로 트래픽이 나뉨. 정밀한 비율·헤더 라우팅은 Ingress나 API Gateway·Istio가 필요.
