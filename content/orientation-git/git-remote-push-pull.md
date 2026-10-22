---
title: 원격 저장소 — clone, push, pull, fetch
en: Remote Repository, clone / fetch / pull / push
summary: 로컬 저장소와 GitHub 원격 저장소를 연결해 내 커밋은 push로 올리고, 팀원의 커밋은 fetch·pull로 받아 온다
importance: 3
order: 5
tags:
  - Git
  - GitHub
  - push
  - pull
keypoints:
  - clone은 원격 저장소를 이력째 복사하고 origin이라는 이름으로 자동 연결
  - pull = fetch(가져오기만) + merge(현재 브랜치에 합치기)
  - push가 거절되면 원격이 앞서 있다는 뜻 — pull로 합친 뒤 다시 push
qa:
  - q: git fetch와 git pull의 차이는?
    a: fetch는 원격 저장소의 새 커밋을 origin/main 같은 원격 추적 브랜치로 내려받기만 하고 내 작업 브랜치는 건드리지 않아, 무엇이 바뀌었는지 먼저 확인할 수 있습니다. pull은 fetch 후 바로 현재 브랜치에 merge까지 하는 명령이라 편하지만 곧바로 충돌이 날 수 있습니다. 협업에서는 fetch로 확인하고 합치는 습관이 안전합니다.
  - q: push가 rejected 되었습니다. 왜 그렇고 어떻게 하나요?
    a: 내가 마지막으로 받은 이후 다른 사람이 같은 브랜치에 push해서 원격 이력이 내 로컬보다 앞서 있기 때문입니다. git pull로 원격 변경을 받아 합치고 충돌이 있으면 해결한 뒤 다시 push합니다. force push는 다른 사람의 커밋을 지울 수 있어 공유 브랜치에서는 쓰지 않습니다.
related:
  - git-branch-merge
  - github-pull-request
  - git-version-control
source: OT 슬라이드 p.21 (사전학습 Git 환경 설정 — 원격 저장소에 내 코드 push, 팀원 코드 pull), web-basics·vue 슬라이드 p.4–5 (Git Clone, Download ZIP, GitHub Fork, Public 저장소 제출), Git 강의 자료 미보관 + 면접 대비 일반 지식
---

```layers
GitHub 원격 저장소 (origin) :: 팀이 공유하는 저장소 — 과제 제출용 Public 저장소
원격 추적 브랜치 (origin/main) :: fetch로 받아 온 원격 상태의 로컬 사본
로컬 브랜치 (main) :: 내가 커밋하는 곳 — merge로 origin/main 반영
작업 폴더 :: 실제 파일
```

| 명령 | 방향 | 하는 일 |
| --- | --- | --- |
| `git clone <URL>` | 원격 → 로컬 | 저장소 전체 복사 + origin 등록 |
| `git remote -v` / `git remote add origin <URL>` | | 원격 주소 확인 / 등록 |
| `git fetch` | 원격 → 로컬 | 새 커밋을 받아 origin/main만 갱신 |
| `git pull` | 원격 → 로컬 | fetch + merge |
| `git push -u origin main` | 로컬 → 원격 | 커밋 업로드, -u로 추적 관계 설정 (이후 git push만) |

> [!tip] 면접 팁
> 수업 소스를 받는 세 방법의 차이: Git Clone은 이력까지 복사하고 원격과 연결, Download ZIP은 파일만 받아 Git 이력이 없음, GitHub Fork는 저장소를 내 계정으로 복사해 자유롭게 push할 수 있음.
