---
title: "DevOps와 CI/CD"
en: "DevOps · Continuous Integration / Delivery / Deployment"
summary: "개발과 운영이 같은 목표로 협업하고 빌드·테스트·배포·모니터링을 자동화해 빠르고 안정적으로 SW를 제공하는 문화이자 프로세스"
importance: 3
order: 1
tags:
  - DevOps
  - CI/CD
  - 자동화
keypoints:
  - "Dev와 Ops의 책임 전가 대신 같은 KPI, 협업 문화와 자동화가 두 축"
  - "CI: 자주 병합하고 자동 빌드·테스트로 통합 문제를 조기 발견"
  - "Continuous Delivery는 승인 후 배포, Continuous Deployment는 승인 없이 자동 배포"
qa:
  - q: "DevOps란 무엇인가?"
    a: "개발과 운영이 분리되어 서로 책임을 떠넘기던 구조에서 벗어나, 같은 목표와 KPI 아래 협업하고 개발부터 운영까지의 과정을 표준화·자동화하는 문화이자 프로세스다. Plan, Code, Build, Test, Release, Deploy, Operate, Monitor가 순환하고 운영 결과가 다시 개발로 피드백된다. 이를 실현하는 대표 자동화가 CI/CD 파이프라인이다."
  - q: "Continuous Delivery와 Continuous Deployment의 차이는?"
    a: "둘 다 CI 결과물을 자동으로 준비해 언제든 운영에 배포할 수 있는 상태로 만든다는 점은 같다. Continuous Delivery는 마지막 운영 반영을 사람이 승인(Manual Approval)해 상황을 보고 배포 여부를 정하고, Continuous Deployment는 승인 없이 모든 변경이 자동으로 운영까지 배포된다."
related:
  - jenkins-pipeline
  - gitops
  - argocd
source: "Day1(10/12) 슬라이드 p.23–34"
---

```flow
Plan · Code :: 계획, 개발
Build · Test :: 빌드, 단위·정적 분석 테스트 (CI)
Release · Deploy :: 이미지 등록, 운영 반영 (CD)
Operate · Monitor :: 운영, 관측
피드백 :: 운영 결과를 다시 개발에 반영
```

```compare
Continuous Integration | Continuous Delivery | Continuous Deployment
개념 | 코드 변경을 중앙 저장소에 자주 병합 | CI 결과를 언제든 배포 가능한 상태로 준비 | Delivery의 확장, 운영까지 자동 배포
목적 | 자동 빌드·테스트로 통합 문제 조기 발견 | 항상 배포 준비 상태 유지 | 모든 변경을 즉시 사용자에게
사람 개입 | 없음 | 운영 반영 전 승인 | 없음
도구 예 | Jenkins, GitLab CI, GitHub Actions | Jenkins + 승인 단계 | Argo CD 자동 동기화
```

> [!tip] CI/CD 도입 이점 (p.30)
> 빠른 배포, 지속적 테스트로 높은 품질, 반복 작업 자동화로 효율 향상, 작은 변경을 자주 배포해 리스크 감소, 빠른 릴리스로 고객 만족. "작게 자주 배포하면 문제 범위가 작고 되돌리기 쉽다"를 핵심으로 말하면 됨.
