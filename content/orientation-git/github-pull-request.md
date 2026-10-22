---
title: GitHub 협업 — Fork와 Pull Request
en: Fork, Pull Request, GitHub Flow, Code Review
summary: 기능 브랜치(또는 Fork)에서 작업해 Pull Request로 병합을 요청하고, 코드 리뷰를 거쳐 main에 합치는 협업 흐름
importance: 2
order: 6
tags:
  - GitHub
  - Pull Request
  - 협업
  - 코드 리뷰
keypoints:
  - GitHub Flow — main은 항상 배포 가능, 기능 브랜치 → PR → 리뷰 → merge
  - Fork는 남의 저장소를 내 계정으로 복사, 쓰기 권한 없이 PR로 기여
  - PR은 변경 설명 + diff + 리뷰 코멘트 + 자동 검사 결과를 한곳에서 검토하는 단위
qa:
  - q: Pull Request는 무엇이고 왜 쓰나요?
    a: 내 브랜치의 변경을 대상 브랜치에 합쳐 달라고 요청하는 GitHub 기능입니다. 병합 전에 팀원이 diff를 보며 코드 리뷰를 하고 자동 테스트·린트 결과를 확인할 수 있어 버그를 줄이고 지식을 공유하는 장치가 됩니다. main에 직접 push하지 못하게 하고 PR로만 병합하도록 브랜치 보호 규칙을 거는 것이 일반적입니다.
  - q: Fork와 Branch는 어떻게 다른가요?
    a: Branch는 같은 저장소 안에서 갈라지는 작업 줄기라 그 저장소에 쓰기 권한이 있는 팀원끼리 씁니다. Fork는 저장소 자체를 내 계정으로 복사하는 것이라 원본에 권한이 없어도 내 사본에서 자유롭게 작업하고, 원본에 반영하고 싶으면 PR을 보냅니다. 수업에서도 강사 저장소를 Fork해 실습 소스를 받을 수 있었습니다.
related:
  - git-branch-merge
  - git-remote-push-pull
  - gitignore-secrets
source: web-basics·vue 슬라이드 p.4 (소스 받기 — Git Clone, Download ZIP, GitHub Fork), p.5–6 (과제 제출 — 본인 Public 저장소, 시크릿 창 확인, 평가 기준표), Git 강의 자료 미보관 + 면접 대비 일반 지식
---

```flow
브랜치 :: main에서 feature 브랜치 생성 (Fork면 내 사본에서)
커밋·push :: 작게 자주 커밋한 뒤 원격 브랜치에 push
Pull Request :: 무엇을·왜 바꿨는지 설명, 리뷰어 지정
리뷰·검사 :: 코멘트 반영 커밋, 테스트·린트 통과 확인
merge :: main에 병합 후 브랜치 삭제 → 배포
```

| 과제 제출 규칙 (web-basics·vue 공통) | 내용 |
| --- | --- |
| 저장소 | 본인 GitHub 계정의 Public 저장소 (예: github.com/계정/skala-vue) |
| 확인 | 시크릿 창(Ctrl+Shift+N, Mac은 Cmd+Shift+N)에서 로그인 없이 소스가 보이는지 |
| 감점 | Private 설정으로 소스 확인이 불가능하면 채점 불가 (61–70점 구간) |
| 가점 | 기본 요구사항 완벽 충족 + 지시되지 않은 추가 실습 (91–100점), 호스팅 URL은 선택·권장 |
