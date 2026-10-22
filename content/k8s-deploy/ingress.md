---
title: "Ingress와 Ingress Controller"
en: "Ingress · Ingress Controller"
summary: "Ingress는 호스트·경로별로 어느 Service로 보낼지 적은 L7 라우팅 규칙이고, 실제 트래픽은 그 규칙을 읽는 Ingress Controller(nginx·ALB)가 처리"
importance: 3
order: 9
tags:
  - Ingress
  - L7
  - ingress-nginx
  - ALB
keypoints:
  - "LB 하나에 여러 서비스를 경로·호스트로 분기 (LoadBalancer Service는 서비스마다 LB)"
  - "ingressClassName이 처리할 컨트롤러를 정하고, 애노테이션 접두어도 컨트롤러별로 다름"
  - "pathType 우선순위: Exact > 긴 Prefix > 짧은 Prefix, path: / 는 맨 아래"
qa:
  - q: "Ingress와 Ingress Controller의 차이는?"
    a: "Ingress는 도메인과 경로를 어느 Service로 보낼지 선언한 규칙 리소스일 뿐이라 혼자서는 아무 일도 하지 않는다. Ingress Controller가 API 서버의 Ingress를 watch해 실제 LB 설정으로 만든다. ingress-nginx는 모든 Ingress를 nginx 설정 한 벌로 합쳐 클러스터 안 nginx Pod가 트래픽을 받고, AWS Load Balancer Controller는 ALB를 만들어 Pod IP로 직접 보낸다."
  - q: "LoadBalancer Service 대신 Ingress를 쓰는 이유는?"
    a: "LoadBalancer Service는 L4라 서비스 하나당 LB 하나가 생겨 서비스가 5개면 LB 요금도 5배다. Ingress는 L7(HTTP)이라 LB 하나에서 호스트·경로·헤더로 여러 서비스를 분기하고 TLS 종료, WAF·인증 같은 기능도 붙이기 쉽다. 단 HTTP가 아닌 gRPC·TCP·DB 같은 트래픽은 Ingress로 못 받아 LoadBalancer나 다른 방법을 쓴다."
related:
  - service-endpoints
  - k8s-advanced/cert-manager-https-ingress
  - k8s-advanced/blue-green-canary
source: "Day2(9/8) 슬라이드 p.131–149 · lab-eks-skala-2026 l18-complete/20-service-ingress.yaml"
---

```flow
사용자 → DNS :: *.skala-ai.com 이 공용 LB 주소를 가리킴
LB :: 대상그룹에 ingress-nginx(또는 target-type: ip면 Pod IP 직접)
Ingress Controller :: host·path 규칙으로 Service 선택
Service → Endpoints :: Ready Pod 중 하나
Pod → 컨테이너 → 프로세스 :: targetPort, 0.0.0.0 바인딩
```

```yaml
# 실습 클러스터(판교판): ALB 컨트롤러가 없고 ingress-nginx 하나를 공유
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-__ME__
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "8m"   # nginx 가 읽는 접두어
spec:
  ingressClassName: nginx
  rules:
    - host: shop-__ME__.skala-ai.com          # 호스트가 겹치면 먼저 만든 쪽이 이김
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: shop-__ME__, port: { number: 80 } }
```

> [!warn] HTTPS 뒤의 앱은 평문을 받는다
> TLS는 LB·Ingress에서 끝나므로 앱의 `request.isSecure()`는 false. `X-Forwarded-Proto`를 믿도록 Spring Boot `server.forward-headers-strategy: framework`를 설정하지 않으면 로그인 후 `http://`로 튕기는 리다이렉트 문제가 생김. EKS ALB면 ACM 인증서 ARN 애노테이션 + `ssl-redirect`.

> [!note] Ingress 장애 표 요약
> ADDRESS가 비어 있음 → 컨트롤러·IAM·서브넷 태그 / 502 → 타깃 Pod 응답 없음 / 503 → 등록된 타깃 없음(Endpoints) / 504 → 앱 응답이 유휴 타임아웃(60초) 초과 / 일부 경로만 404 → path 순서·pathType.
