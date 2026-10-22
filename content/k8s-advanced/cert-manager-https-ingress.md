---
title: "cert-manager로 HTTPS Ingress 구성"
en: "cert-manager · ACME · TLS Ingress"
summary: "cert-manager가 개인키를 만들고 Let's Encrypt(ACME)에서 인증서를 받아 kubernetes.io/tls Secret으로 저장하면, Ingress가 그 Secret으로 TLS를 종료한다"
importance: 2
order: 5
tags:
  - Ingress
  - HTTPS
  - cert-manager
  - Let's Encrypt
keypoints:
  - "ClusterIssuer(CA·검증 방식) → Certificate(도메인) → TLS Secret"
  - "HTTP-01은 와일드카드 불가, DNS-01(TXT 레코드)은 가능"
  - "Ingress에 cluster-issuer 애노테이션만 달면 Certificate가 자동 생성"
qa:
  - q: "cert-manager는 인증서를 어떻게 발급받나?"
    a: "Certificate 리소스에 도메인과 ClusterIssuer를 지정하면 cert-manager가 tls.key와 공개키를 만들고 도메인 정보를 담은 CSR을 Let's Encrypt에 보낸다. Let's Encrypt가 ACME Challenge로 도메인 소유권을 확인하면 서명한 tls.crt를 돌려주고, cert-manager는 둘을 kubernetes.io/tls 타입 Secret에 저장하며 만료 전에 자동 갱신한다. Ingress는 spec.tls의 secretName으로 그 Secret을 참조해 HTTPS를 처리한다."
  - q: "HTTP-01과 DNS-01 Challenge의 차이는?"
    a: "HTTP-01은 Let's Encrypt가 도메인의 80 포트 특정 URL로 검증 토큰을 요청해 확인하므로 LB에 80 포트가 열려 있어야 하고 와일드카드 인증서는 받을 수 없다. DNS-01은 _acme-challenge 도메인에 TXT 레코드를 만들어 확인하는 방식이라 Route53 같은 DNS API 권한이 필요하지만 *.class-0.skala-us.com 같은 와일드카드 인증서를 받을 수 있다."
related:
  - tls-handshake
  - k8s-deploy/ingress
  - k8s-deploy/configmap-secret
  - blue-green-canary
source: "Day2(10/16) 슬라이드 p.228–252 (wild-cert-ingress.yaml 실습)"
---

```flow
ClusterIssuer :: Let's Encrypt ACME 서버, 계정 키, solver(HTTP-01 / DNS-01 Route53)
Certificate :: dnsNames: *.class-0.skala-us.com, secretName 지정
cert-manager :: tls.key 생성 → CSR을 Let's Encrypt에 전달
ACME Challenge :: 도메인 소유권 확인 후 CA가 tls.crt 서명·발급
TLS Secret :: kubernetes.io/tls (tls.crt + tls.key) 저장, 만료 전 자동 갱신
Ingress :: spec.tls.secretName으로 참조해 TLS 종료
```

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-class-0-skala-us-com
  namespace: class-0
spec:
  secretName: wildcard-class-0-skala-us-com-tls   # 최종 생성되는 TLS Secret
  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }
  dnsNames: ["*.class-0.skala-us.com", "class-0.skala-us.com"]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sk000-cert-ingress
spec:
  ingressClassName: nginx
  tls:
    - hosts: ["sk000-cert-ingress.class-0.skala-us.com"]
      secretName: wildcard-class-0-skala-us-com-tls
  rules:
    - host: sk000-cert-ingress.class-0.skala-us.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: sk000-my-app, port: { number: 8080 } } }
```

> [!tip] Certificate를 명시적으로 만드는 경우
> Ingress에 `cert-manager.io/cluster-issuer: letsencrypt-prod` 애노테이션만 달아도 자동 발급되지만, Ingress가 아닌 Gateway(Envoy·Istio·Kong)에 인증서가 필요할 때, 하나의 인증서를 여러 Ingress가 공유할 때, 인증서 정책을 엄격히 관리하거나 GitOps에 리소스를 명시하고 싶을 때는 Certificate를 따로 만든다.
