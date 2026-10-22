---
title: "이미지 태그 전략과 다이제스트"
en: "Image Tag · Digest"
summary: "태그는 사람이 붙인 움직이는 이름, 다이제스트(sha256)는 매니페스트 내용의 해시. 운영 배포는 불변 태그(버전+커밋 SHA)로"
importance: 2
order: 2
tags:
  - 이미지
  - 태그
  - 배포
keypoints:
  - "latest는 무엇이 도는지 모르고 롤백도 불가, 운영 금지"
  - "권장: 버전+커밋 SHA 불변 태그 (shop-api:1.4.2-a3f9c21), 덮어쓰기 금지"
  - "실제 실행 이미지는 Pod status의 imageID(@sha256)로 확인"
qa:
  - q: "latest 태그를 운영에서 쓰면 안 되는 이유는?"
    a: "latest는 가변 태그라 같은 이름이 어제와 오늘 다른 이미지를 가리킬 수 있다. 그래서 지금 무엇이 실행 중인지 알 수 없고, 롤백은 결국 이전 태그로 되돌리는 일인데 태그가 움직이면 롤백도 불가능하다. 커밋 SHA를 넣은 불변 태그를 쓰면 장애 때 어느 커밋이 돌고 있는지 바로 알 수 있다."
  - q: "이미지 태그와 다이제스트의 차이는?"
    a: "태그는 사람이 붙이는 이름이라 다른 이미지로 옮겨 붙일 수 있다. 다이제스트는 레지스트리에 저장된 이미지 매니페스트의 sha256 해시라 내용이 1비트만 달라도 바뀌므로 정확히 그 이미지를 가리킨다. 재현 가능한 빌드를 위해 FROM에 다이제스트를 고정하기도 하지만, 그러면 보안 패치가 자동으로 들어오지 않아 주기적으로 올려 주는 절차가 함께 필요하다."
related:
  - container/container-image-registry
  - container/multi-stage-build
  - resources-qos
  - devops/multi-platform-image
source: "Day1(9/7) 슬라이드 p.20–33 · 실습 가이드 실습 1(로컬에서 먼저 실행), 실습 3(Harbor에 이미지 올리기)"
---

| 태그 방식 | 예 | 판단 |
| --- | --- | --- |
| latest | `shop-api:latest` | 로컬 실습만. 무엇이 도는지 모름 |
| 시맨틱 버전 | `shop-api:1.4.2` | 릴리스용, 읽기 좋지만 수동 관리 |
| Git 커밋 SHA | `shop-api:a3f9c21` | CI 자동 배포에 가장 안전, 코드와 1:1 |
| 버전+SHA | `shop-api:1.4.2-a3f9c21` | 운영 권장, 읽기 좋고 추적도 됨 |
| 환경 태그 | `shop-api:prod` | 지양, 가변 태그라 latest와 같은 문제 |

```compare
태그 | IMAGE ID | RepoDigest
무엇 | 사람이 붙인 이름 | 로컬 config 문서의 해시 | 레지스트리 매니페스트의 해시
예 | `1.0.0`, `latest` | `d7c0cdd200be` | `sha256:d59a78…`
변하나 | 다른 이미지로 옮겨 붙일 수 있음 | push 전후로 달라질 수 있음 | 내용이 같으면 불변
쓸 곳 | 일상적 지정 | 로컬 구분 | 재현·검증, `FROM img@sha256:…`
```

> [!tip] 컨테이너 이미지 만들 때 판단 기준 (p.33)
> 레이어 캐시(의존성 → 소스 순서), 멀티 스테이지(700MB → 200MB), exec 형식 ENTRYPOINT(SIGTERM 전달), non-root, 맥 M시리즈는 `--platform linux/amd64`, 비밀값은 이미지에 넣지 않기. 지금 도는 이미지는 `kubectl get pod -o jsonpath='{.status.containerStatuses[0].imageID}'`로 확인.
