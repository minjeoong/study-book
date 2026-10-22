---
title: Cloud Native 전환과 12 Factor
en: Cloud Ready / Cloud Friendly / Cloud Native, 12-Factor App
summary: "레거시를 클라우드로 옮기는 3단계(Replatform → Refactor → ReArchitect)와 클라우드 앱 표준 설계 원칙 12 Factor"
importance: 2
order: 7
tags:
  - Cloud
  - MSA
  - DevOps
keypoints:
  - "Cloud Ready(Replatform) → Friendly(Refactor) → Native(ReArchitect)"
  - "12 Factor: 설정·의존성은 코드 밖으로, 무상태, 빠른 기동, 환경 일치"
  - "PaaS·DevOps만으로 4~7개 달성, 나머지는 코드 리팩토링 필요"
qa:
  - q: "12 Factor App이란? 기억나는 원칙은?"
    a: "클라우드 애플리케이션을 만들기 위한 표준 설계 원칙으로 개발 방법과 개발·운영 환경까지 포함한다. 예를 들어 개발·운영을 하나의 저장소로 관리하고, 의존성은 소스가 아닌 Maven·Gradle 설정으로, 설정값은 코드가 아닌 환경변수로 관리한다. DB 같은 연계는 교체 가능한 Backing Service로 보고, 프로세스는 무상태로 만들어 스케일 아웃하고, 빠른 부팅과 Graceful 셧다운, 개발·검증·운영 환경 일치, 플랫폼 중앙 로깅을 지킨다."
  - q: "Cloud Ready, Cloud Friendly, Cloud Native의 차이는?"
    a: "Cloud Ready는 Replatforming으로 JDK·Spring·라이브러리 버전과 3rd party 라이선스를 맞춰 PaaS에 올릴 수 있게 만드는 단계다. Cloud Friendly는 Refactoring으로 12 Factor 위배 요소를 고쳐 스케일링·설정 자동화·CI/CD가 가능하게 한다. Cloud Native는 ReArchitecting으로 Microservice, Design for failure, API first, Event driven 설계를 적용해 변화와 장애에 유연한 구조로 바꾼다. 한 번에 가기 어려워 시스템 특성상 효과가 큰 단계까지만 적용한다."
related:
  - monolith-vs-msa
  - msa-components
source: "2026-08-27 교재 p.53 (On Premise · IaaS · PaaS · XaaS), p.58–62 (Cloud Application 유형별 비교, Replatforming, Refactoring, 12 factors, ReArchitecture)"
---

```compare
Cloud Ready | Cloud Friendly | Cloud Native
전환 유형 | Replatforming | Refactoring | ReArchitecting
고려 사항 | PaaS 배포를 위해 고칠 것 (JDK, Spring 버전, 3rd party 라이브러리·라이선스) | Scalability, 설정 자동화, 코드·환경 분리, CI/CD | Microservice
기술 요건 | PaaS 플랫폼 특징 이해 | 12 Factor, 배포 파이프라인 | Design for failure, API first, Event driven
전환 목적 | 진화를 위한 첫 단계 | 현재 구조에서 클라우드 효과 최대화 | 변화·장애에 유연한 구조
```

| # | Factor | 의미 | 달성 방법 |
| --- | --- | --- | --- |
| 1 | 동일한 Repo | 개발·운영을 하나의 저장소로 | DevOps Pipeline |
| 2 | 의존성 설정 | 소스가 아닌 설정으로 의존성 관리 | Maven |
| 3 | 환경변수 | 소스가 아닌 환경변수로 설정 관리 | ENV, Spring Config |
| 4 | 서비스 바인딩 | DB·연계는 바인딩된 서비스로 간주 | Backing Services |
| 5 | 릴리스 분리 | 빌드·릴리스·실행 완전 분리 | DevOps Pipeline |
| 6 | 무상태 | 무상태 처리를 기본으로 | Stateless / Shared Nothing |
| 7 | Self-Contained | 컨테이너가 아닌 앱 자체가 URL | Manifest & Container |
| 8 | 동시성 | 스케일 아웃을 위한 프로세스 모델 | Router, Microservices |
| 9 | 빠른 Reboot | 빠른 부팅, Graceful 셧다운 | Cloud Foundry Container |
| 10 | 실행환경 일치 | 개발·검증·운영 환경 일치 | DevOps Pipeline |
| 11 | 중앙 로깅 | 플랫폼이 이벤트 로그 수집 | Metric & Logging |
| 12 | JOB 관리 | DB 변경 같은 Job을 소스에 포함 | Infrastructure as Code |

- 서비스 모델: On Premise(인프라·서비스·보고 전부 직접) → IaaS(인프라 제공) → PaaS(인프라·서비스 아키텍처 제공, 앱만 관리) → XaaS(결과만 받음)
- 12 Factor 위배 요소는 코드 인스펙터로 검출 가능 — 예: 이메일 주소를 소스에 하드코딩(위배) → 설정 파일·환경변수에서 읽기(준수)

> [!tip] 실습과 연결
> 3번(환경변수)은 Docker의 `--env-file`과 `.env`(시크릿은 .gitignore), 우리 팀이 소스 없는 Gateway 이미지에 `application.yml`을 볼륨으로 덮어써 라우팅을 바꾼 것과 같은 원리. "코드는 그대로, 설정만 바깥에서 바꾼다".
