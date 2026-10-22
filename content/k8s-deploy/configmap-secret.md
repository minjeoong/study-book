---
title: "ConfigMap과 Secret"
en: "ConfigMap · Secret"
summary: "환경마다 달라지는 설정은 이미지 밖 ConfigMap으로, 비밀값은 Secret으로 분리해 env 또는 볼륨으로 주입한다. Secret은 base64 인코딩일 뿐 암호화가 아니다"
importance: 3
order: 10
tags:
  - ConfigMap
  - Secret
  - 12-Factor
keypoints:
  - "빌드는 한 번, 배포는 여러 환경: 설정을 이미지에 넣지 않음 (12-Factor 3번)"
  - "env 주입은 시작 시 고정(바꾸면 rollout restart), 볼륨 마운트는 파일이 자동 갱신"
  - "Secret은 base64라 누구나 디코딩 → RBAC·etcd 암호화·외부 저장소로 보호"
qa:
  - q: "ConfigMap을 수정했는데 앱에 반영이 안 되는 이유는?"
    a: "환경변수로 주입한 값은 컨테이너 시작 시점에 고정되므로 ConfigMap을 고쳐도 기존 Pod는 모른다. kubectl rollout restart나 Pod 템플릿에 ConfigMap 내용의 해시 애노테이션을 넣어 롤아웃을 일으켜야 한다. 볼륨으로 마운트한 경우 파일은 수십 초~1분 안에 자동으로 바뀌지만, 앱이 그 파일을 다시 읽어야 의미가 있다."
  - q: "Secret은 안전한가?"
    a: "기본 Secret은 base64 인코딩이라 한 줄로 되돌릴 수 있고 etcd에도 기본 설정에서는 암호화 없이 저장된다. base64를 쓰는 이유는 TLS 키 같은 바이너리와 YAML 특수문자를 안전하게 담기 위해서지 보안 때문이 아니다. 실제 보호는 RBAC으로 Secret 읽기 권한을 제한하고, etcd 저장 암호화, External Secrets·Vault·Secrets Manager 같은 외부 저장소로 하며 Git에는 절대 커밋하지 않는다."
related:
  - pv-pvc
  - k8s-advanced/cert-manager-https-ingress
  - devops/kustomize
  - devops/helm-chart
source: "Day2(9/8) 슬라이드 p.150–158 · 심화: k8s-advanced Day2(10/16) p.195–227 (ConfigMap·Secret 실습, Secret 유형 p.210–218)"
---

```compare
환경변수 주입 | 볼륨 마운트
방법 | `env.valueFrom.configMapKeyRef`, `envFrom` | `volumes.configMap` + `volumeMounts`
형태 | 키 하나 = 변수 하나 | 키 하나 = 파일 하나
ConfigMap 수정 시 | 반영 안 됨 → rollout restart 필요 | 파일 자동 갱신 (앱이 다시 읽어야)
Secret에 쓰면 | 크래시 덤프·/proc·로그에 노출 위험 | 파일 권한(defaultMode 0400)으로 더 안전한 편
주의 | envFrom은 무엇이 들어가는지 매니페스트로 안 보임 | mountPath의 기존 파일이 통째로 가려짐
```

| Secret 타입 | 용도 | 주요 키 |
| --- | --- | --- |
| Opaque | 일반 키-값 | 사용자 정의 |
| kubernetes.io/dockerconfigjson | 프라이빗 레지스트리 pull (`imagePullSecrets`) | `.dockerconfigjson` |
| kubernetes.io/basic-auth | HTTP Basic 인증 (nginx Ingress auth) | username, password |
| kubernetes.io/ssh-auth | Git clone용 SSH 키 (CI/CD) | ssh-privatekey |
| kubernetes.io/tls | Ingress HTTPS 인증서 | tls.crt, tls.key |
| service-account-token | ServiceAccount 토큰 | token, ca.crt, namespace |

> [!tip] 설정 우선순위와 확인 습관
> 컨테이너 `env` > `envFrom`(ConfigMap·Secret) > 이미지의 `ENV` > 앱 기본값. `stringData`에 평문을 쓰면 API 서버가 base64로 바꿔 `data`에 저장. 설정이 이상하면 매니페스트를 읽지 말고 `kubectl exec <pod> -- env`로 실물을 본다.
