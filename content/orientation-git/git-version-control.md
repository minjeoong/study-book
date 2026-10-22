---
title: Git과 버전 관리
en: Version Control System, Git vs GitHub
summary: Git은 파일 변경 이력을 커밋(스냅샷)으로 저장하는 분산 버전 관리 도구, GitHub는 Git 저장소를 올려 두고 협업하는 원격 호스팅 서비스
importance: 2
order: 2
tags:
  - Git
  - 버전 관리
  - 협업
keypoints:
  - 버전 관리 — 누가·언제·무엇을·왜 바꿨는지 기록하고 되돌릴 수 있게 함
  - 분산형 — 모든 개발자가 전체 이력을 가진 로컬 저장소를 갖는다
  - Git은 로컬 도구, GitHub는 원격 저장소 + 협업 기능(PR, 이슈, Pages)
qa:
  - q: Git과 GitHub의 차이는?
    a: Git은 내 컴퓨터에서 동작하는 버전 관리 프로그램으로, 인터넷 없이도 커밋하고 브랜치를 만들 수 있습니다. GitHub는 Git 저장소를 인터넷에 올려 두는 원격 호스팅 서비스로, Pull Request, 코드 리뷰, 이슈, GitHub Pages 같은 협업 기능을 더합니다. SKALA에서도 강사 저장소를 clone하거나 fork해 소스를 받고, 과제는 본인 GitHub Public 저장소로 제출했습니다.
  - q: 중앙집중형과 분산형 버전 관리의 차이는?
    a: SVN 같은 중앙집중형은 이력이 중앙 서버에만 있어 서버에 연결되어야 커밋할 수 있고 서버 장애가 곧 전체 장애입니다. Git 같은 분산형은 clone할 때 전체 이력을 복사해 각자 로컬 저장소에서 커밋, 브랜치, 이력 조회를 할 수 있고, 원격 저장소가 망가져도 누군가의 로컬 복사본으로 복구할 수 있습니다.
related:
  - git-three-areas
  - git-remote-push-pull
  - skala-program
source: Git 강의 자료 미보관 — 7/14 일정표(OT 슬라이드 p.6, Git 이해/활용 5h), p.21 (사전학습 Git 환경 설정 — push·pull 흐름 익히기), web-basics·vue 슬라이드 p.4–5 (소스 받기·과제 제출) + 면접 대비 일반 지식
---

```compare
중앙집중형 (SVN) | 분산형 (Git)
이력 위치 | 중앙 서버에만 | 모든 로컬 저장소에 전체 이력
커밋 | 서버 연결 필요 | 오프라인 로컬 커밋 가능
브랜치 | 무겁고 느림 | 가볍고 빠름 (커밋을 가리키는 포인터)
장애 영향 | 서버 장애 = 전체 중단 | 로컬 복사본으로 복구 가능
```

```bash
git config --global user.name "홍길동"          # 커밋 작성자 정보 (최초 1회)
git config --global user.email "me@example.com"
git init                                        # 현재 폴더를 새 저장소로
git clone https://github.com/bottletiger/skala-vue.git   # 원격 저장소를 이력째 복사
```

> [!note] 메모
> Git은 변경분이 아니라 커밋 시점 전체의 스냅샷을 저장하고, 바뀌지 않은 파일은 이전 것을 가리켜 공간을 아낀다. 커밋마다 내용으로 만든 해시 ID가 붙는다.
