---
title: 브랜치와 병합, 충돌 해결
en: Branch, Merge, Conflict, Rebase
summary: 브랜치는 커밋을 가리키는 가벼운 포인터 — 기능별로 갈라져 작업한 뒤 merge로 합치고, 같은 부분을 고쳤으면 충돌을 직접 해결한다
importance: 3
order: 4
tags:
  - Git
  - branch
  - merge
  - conflict
keypoints:
  - 브랜치 = 특정 커밋을 가리키는 포인터, HEAD는 지금 작업 중인 브랜치
  - fast-forward는 포인터만 이동, 3-way merge는 병합 커밋 생성
  - 충돌은 같은 파일의 같은 부분을 양쪽이 고쳤을 때 — 직접 고르고 add·commit
qa:
  - q: 브랜치를 왜 나눠서 작업하나요?
    a: main 브랜치는 항상 배포 가능한 안정 상태로 두고, 새 기능이나 버그 수정은 별도 브랜치에서 진행하기 위해서입니다. 여러 사람이 서로의 미완성 코드에 영향을 받지 않고 동시에 작업할 수 있고, 실패한 실험은 브랜치째 버리면 됩니다. 완성되면 리뷰를 거쳐 main에 병합합니다.
  - q: merge 충돌은 언제 생기고 어떻게 해결하나요?
    a: 두 브랜치가 같은 파일의 같은 부분을 서로 다르게 고친 뒤 병합하면 Git이 어느 쪽을 택할지 몰라 충돌로 멈춥니다. 파일에 표시된 충돌 구간(HEAD 쪽과 병합하려는 브랜치 쪽)을 열어 남길 코드를 직접 정하고 표시를 지운 뒤, git add와 git commit으로 병합을 완료합니다. 충돌을 줄이려면 작업 전에 최신 상태를 받고, 브랜치를 작게 자주 병합하며, Prettier처럼 포맷을 통일합니다.
  - q: merge와 rebase의 차이는?
    a: merge는 두 브랜치의 이력을 그대로 두고 병합 커밋으로 합쳐 실제 작업 흐름이 보존되지만 그래프가 복잡해집니다. rebase는 내 커밋들을 대상 브랜치의 최신 커밋 뒤로 옮겨 다시 쌓아 일직선 이력을 만들지만 커밋 해시가 바뀝니다. 그래서 이미 원격에 올려 다른 사람과 공유한 브랜치는 rebase하지 않는 것이 원칙입니다.
related:
  - git-three-areas
  - git-remote-push-pull
  - github-pull-request
source: Git 강의 자료 미보관 — 7/14 Git 이해/활용(OT 슬라이드 p.6) + 면접 대비 일반 지식, vue 슬라이드 p.259 (Prettier로 포맷 통일 → 불필요한 Git 충돌 감소)
---

```flow
분기 :: git switch -c feature/login — main에서 새 브랜치
작업 :: 브랜치에 커밋을 쌓음 (그동안 main도 진행될 수 있음)
병합 :: git switch main → git merge feature/login
충돌 시 :: 충돌 표시 구간 정리 → git add → git commit
정리 :: git branch -d feature/login
```

```compare
merge | rebase
결과 | 병합 커밋 생성, 갈래 이력 보존 | 내 커밋을 최신 위로 재배치, 일직선 이력
커밋 해시 | 유지 | 새로 만들어짐
장점 | 실제 흐름 보존, 안전 | 깔끔한 이력
주의 | 그래프가 복잡해짐 | 공유된 브랜치에 쓰면 안 됨
```

```js
<<<<<<< HEAD
const API_URL = '/api/v1'     // 현재 브랜치(main) 쪽 내용
=======
const API_URL = '/api/v2'     // 병합하려는 feature/login 쪽 내용
>>>>>>> feature/login
```
