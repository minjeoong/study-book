---
title: .gitignore와 비밀 값 관리
en: .gitignore, .env, Secrets
summary: 의존성·빌드 산출물·API 키처럼 저장소에 올리면 안 되는 파일을 .gitignore로 제외하고, 비밀 값은 환경 변수 파일로 분리한다
importance: 2
order: 8
tags:
  - Git
  - 보안
  - 환경 변수
keypoints:
  - node_modules, dist, .env, 로그·에디터·OS 파일은 .gitignore로 추적 제외
  - API 키는 .env로 분리하고, 필요한 키 이름만 .env.example로 공유
  - 이미 커밋된 파일은 .gitignore만으로 안 빠짐 — git rm --cached, 키는 재발급
qa:
  - q: API 키를 실수로 GitHub에 올렸다면 어떻게 하나요?
    a: 가장 먼저 해당 키를 폐기하고 새로 발급받아야 합니다. 커밋을 지워도 이미 누군가 복제했거나 이력에 남아 있을 수 있기 때문입니다. 그다음 파일을 git rm --cached로 추적에서 빼고 .gitignore에 추가하며, 필요하면 이력에서 완전히 지우는 도구로 정리합니다. 처음부터 키는 .env 같은 환경 변수 파일에 두고 .gitignore에 등록하는 것이 원칙입니다.
  - q: .gitignore에는 무엇을 넣나요?
    a: npm install로 언제든 다시 받을 수 있는 node_modules, 빌드 결과물인 dist, API 키가 담긴 .env, 개인 에디터 설정과 OS가 만드는 파일, 로그처럼 재생성 가능하거나 개인적이거나 비밀인 파일을 넣습니다. Vue 과목 마지막 과제에서도 API 키를 환경 변수로 빼고 Git에 올라가지 않도록 하는 것이 요구사항이었습니다.
related:
  - git-three-areas
  - github-pull-request
  - vue/vite-build-deploy
source: vue 슬라이드 p.32 (.gitignore·.gitattributes 역할), p.265–266 (환경 변수 분리 — 보안성·환경별 유연성, VITE_ 규칙), p.274 (과제 — API 키 환경 변수, Git 미업로드), vue 과제 제출물 .gitignore·.env.example, web-basics·vue 슬라이드 p.5 (Public 저장소 제출)
---

```layers
.env :: 실제 키 — VITE_API_KEY=발급받은 키 (Git 제외, 로컬에만)
.env.example :: 키 이름만 — VITE_API_KEY=your_openweathermap_api_key (커밋해서 공유)
.gitignore :: node_modules, dist, .env 등 추적 제외 목록
코드 :: import.meta.env.VITE_API_KEY로 읽기
```

```bash
# .gitignore — Vue 과제 제출물에서 발췌
node_modules
dist
*.log
.DS_Store
.vscode/
.env
.env.*
# 예외 — 키 이름 안내 파일은 커밋 (.gitignore 주석은 줄 맨 앞 #만 인정)
!.env.example
```

> [!warn] 헷갈리기 쉬움
> 프론트엔드 환경 변수(`VITE_`)는 빌드된 JS에 그대로 들어가 브라우저에서 누구나 볼 수 있다. .gitignore는 저장소 노출만 막을 뿐이므로 진짜 비밀 키는 백엔드에 두고, 프론트는 백엔드를 거쳐 외부 API를 호출하는 것이 안전하다.
