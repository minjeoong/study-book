---
title: 되돌리기 — restore, reset, revert
en: git restore / reset / revert / commit --amend
summary: 아직 커밋 전이면 restore, 로컬 커밋을 지우려면 reset, 이미 공유된 커밋은 되돌리는 새 커밋을 만드는 revert
importance: 2
order: 7
tags:
  - Git
  - reset
  - revert
keypoints:
  - restore는 작업 폴더·스테이징 변경 취소 (커밋 전)
  - reset은 브랜치 포인터를 과거로 이동 — soft·mixed·hard로 보존 범위가 다름
  - revert는 반대 내용의 새 커밋 — 이력을 지우지 않아 공유 브랜치에 안전
qa:
  - q: reset과 revert의 차이는?
    a: reset은 브랜치가 가리키는 커밋을 과거로 옮겨 이후 커밋을 이력에서 없애는 것이라, 이미 push한 커밋에 쓰면 다른 사람의 이력과 어긋나 force push가 필요해집니다. revert는 특정 커밋의 변경을 정반대로 적용하는 새 커밋을 추가해 이력은 그대로 두고 결과만 되돌립니다. 그래서 로컬에서만 정리할 때는 reset, 공유된 브랜치를 되돌릴 때는 revert를 씁니다.
  - q: 방금 한 커밋의 메시지를 고치거나 빠뜨린 파일을 넣으려면?
    a: 빠뜨린 파일을 add한 뒤 git commit --amend를 하면 직전 커밋을 새 내용과 메시지로 교체합니다. amend도 커밋 해시가 바뀌므로 push하기 전에만 쓰는 것이 안전합니다.
related:
  - git-three-areas
  - git-branch-merge
source: Git 강의 자료 미보관 — 7/14 Git 이해/활용(OT 슬라이드 p.6) + 면접 대비 일반 지식
---

```compare
--soft | --mixed (기본) | --hard
커밋 | 취소 | 취소 | 취소
스테이징 | 유지 | 비움 | 비움
작업 폴더 변경 | 유지 | 유지 | 삭제 (복구 어려움)
쓰임 | 커밋만 다시 | add부터 다시 | 변경 전부 버리기
```

```bash
git restore app.js                  # 작업 폴더 수정 취소 (커밋 전)
git restore --staged app.js         # add 취소
git reset --soft HEAD~1             # 마지막 커밋만 취소, 변경은 스테이징에 남김
git revert a1b2c3d                  # 해당 커밋을 되돌리는 새 커밋 (push한 뒤에도 안전)
git commit --amend -m "fix: 메시지 수정"   # 직전 커밋 교체 (push 전에만)
```

> [!warn] 헷갈리기 쉬움
> `reset --hard`와 `push --force`는 남의 작업이나 내 변경을 지울 수 있다. 실수했다면 `git reflog`로 이전 HEAD 위치를 찾아 그 커밋으로 돌아가면 대부분 복구된다.
