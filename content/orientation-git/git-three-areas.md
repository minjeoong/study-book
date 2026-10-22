---
title: Git의 세 영역과 커밋
en: Working Directory, Staging Area, Repository
summary: 작업 폴더에서 고친 파일을 add로 스테이징 영역에 올리고, commit으로 저장소에 스냅샷을 남긴다
importance: 3
order: 3
tags:
  - Git
  - commit
  - staging
keypoints:
  - Working Directory → (add) → Staging Area → (commit) → Repository
  - 스테이징 영역 덕분에 바뀐 파일 중 원하는 것만 골라 커밋
  - 커밋 = 스냅샷 + 작성자·시간·메시지 + 부모 커밋을 가리키는 해시 ID
qa:
  - q: Staging Area는 왜 있나요?
    a: 작업 폴더에서 여러 파일을 고쳤더라도 그중 하나의 의미 있는 변경만 골라 커밋하기 위해서입니다. 예를 들어 버그 수정과 스타일 변경을 동시에 했다면 버그 수정 파일만 add해서 먼저 커밋하고, 나머지는 따로 커밋해 이력을 깔끔하게 나눌 수 있습니다. 커밋 직전에 git diff --staged로 올라갈 내용을 검토하는 단계 역할도 합니다.
  - q: 좋은 커밋 메시지는 어떻게 쓰나요?
    a: 한 커밋에는 한 가지 목적의 변경만 담고, 제목에 무엇을 왜 바꿨는지 짧게 씁니다. 팀에서는 feat, fix, refactor, docs 같은 접두어 규칙(Conventional Commits)을 맞춰 이력만 보고도 변경 종류를 알 수 있게 합니다.
related:
  - git-version-control
  - git-branch-merge
  - git-undo-reset-revert
source: Git 강의 자료 미보관 — 7/14 Git 이해/활용(OT 슬라이드 p.6), p.21 사전학습 안내 + 면접 대비 일반 지식
---

```flow
Working Directory :: 실제 작업 폴더 — 파일 수정 (untracked, modified)
Staging Area :: git add — 다음 커밋에 넣을 변경 목록 (staged)
Local Repository :: git commit — 스냅샷과 메시지를 이력에 저장 (committed)
Remote Repository :: git push — GitHub에 업로드
```

| 명령 | 하는 일 |
| --- | --- |
| `git status` | 파일 상태 확인 (untracked, modified, staged) |
| `git add <파일>` / `git add .` | 스테이징 |
| `git commit -m "feat: 날씨 카드 추가"` | 스테이징된 변경을 커밋 |
| `git diff` / `git diff --staged` | 작업 폴더 변경 / 스테이징된 변경 비교 |
| `git log --oneline --graph` | 커밋 이력과 브랜치 그래프 |
| `git restore <파일>` / `git restore --staged <파일>` | 수정 취소 / 스테이징 취소 |

> [!warn] 헷갈리기 쉬움
> `git add .`는 .env, node_modules까지 올릴 수 있다. .gitignore를 먼저 만들고 `git status`로 확인한 뒤 커밋한다.
