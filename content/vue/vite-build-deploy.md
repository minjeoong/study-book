---
title: Vite와 빌드·배포
en: Vite, npm, ESLint, Environment Variables, Build
summary: Node.js 위에서 도는 Vite가 개발 서버(HMR)를 띄우고, npm run build로 .vue 파일을 브라우저용 정적 파일(dist)로 번들링
importance: 2
order: 3
tags:
  - Vite
  - npm
  - 빌드
  - 환경 변수
  - ESLint
keypoints:
  - Node.js는 Vite 실행 엔진 + npm 패키지 관리 + 로컬 개발 서버 역할
  - npm run dev는 HMR 개발 서버, npm run build는 Rollup 번들링 → dist
  - 환경 변수는 .env에 VITE_ 접두사로, 키 파일은 .gitignore로 Git에서 제외
qa:
  - q: 번들러(빌드 도구)가 왜 필요한가요?
    a: 개발할 때는 유지보수를 위해 코드를 수백 개 파일과 .vue, .scss, .ts 같은 형식으로 나누지만 브라우저는 이를 그대로 읽지 못합니다. Vite 같은 빌드 도구가 이를 표준 HTML·JS·CSS로 변환하고, 의존성을 분석해 몇 개의 파일로 묶고 압축하며 안 쓰는 코드를 털어냅니다(트리 셰이킹). 개발 중에는 저장하면 바뀐 모듈만 즉시 반영하는 HMR 개발 서버도 제공합니다.
  - q: 빌드 결과 파일 이름 뒤에 붙는 해시는 무엇인가요?
    a: index-hkOuYOvA.js처럼 파일 내용으로 만든 해시값이라 내용이 바뀌면 이름도 바뀝니다. 브라우저가 이전 버전 파일을 캐시해 화면이 갱신되지 않는 문제를 막는 웹 배포 표준 방식입니다. 이 dist 폴더를 그대로 AWS S3, Nginx, Netlify, Vercel, GitHub Pages 같은 정적 호스팅에 올리면 배포가 끝납니다.
  - q: ESLint와 Prettier의 차이는?
    a: ESLint는 코드를 실행하지 않고 구문 트리로 분석하는 정적 분석 도구로, 변수명 오타, 안 쓰는 변수, == 같은 버그 가능성을 배포 전에 잡습니다. Prettier는 들여쓰기, 따옴표, 세미콜론 같은 모양만 팀 규칙대로 자동 정렬해 불필요한 Git 충돌을 줄입니다. 그래서 스타일 규칙은 ESLint에서 끄고(skipFormatting) Prettier에 맡기는 구성을 씁니다.
related:
  - sfc-composition-api
  - orientation-git/gitignore-secrets
  - web-basics/browser-rendering
source: Day1(7/31) 슬라이드 p.22–35 (Node.js 역할, fnm·VS Code·Devtools 개발환경, npm create vue, 프로젝트 실행·소스 구조, 도구 유형, Vite, npm 명령어), Day4(8/5) p.252–274 (ESLint 개요·규칙·설정, Prettier, vite.config.js, 환경 변수 작성 규칙·빌드 모드, Bundling and Build, dist, 과제 완성)
---

```flow
npm create vue@latest :: 스캐폴딩 — Router, Pinia, ESLint, Prettier 선택
npm install :: package.json을 읽어 node_modules 설치
npm run dev :: Vite 개발 서버 localhost:5173, HMR
npm run lint · format :: ESLint 정적 분석, Prettier 정렬
npm run build :: Rollup 번들링 + 트리 셰이킹 → dist/ (해시 파일명)
배포 :: dist를 정적 호스팅에 업로드
```

| 도구 유형 | 역할 | 예 |
| --- | --- | --- |
| Packager | 패키지 설치·의존성 관리 | npm, yarn, pnpm |
| Compiler · Transpiler | 다른 형식·문법으로 변환 (TS → JS, ES6+ → ES5) | TypeScript, Babel |
| Bundler · Build Tool | 모듈 묶기, 압축, 최적화 | Vite(개발 ESM, 빌드 Rollup), Webpack |
| Linter · Formatter | 버그 패턴 검사 / 코드 모양 정렬 | ESLint / Prettier |
| 환경 변수 | `.env.staging`, `.env.production`의 `VITE_API_URL` → `import.meta.env.VITE_API_URL` | `vite build --mode staging` |

> [!warn] 헷갈리기 쉬움
> `VITE_` 변수는 빌드된 JS에 그대로 박혀 브라우저에서 누구나 볼 수 있다. `.env`를 .gitignore에 넣는 것은 저장소 노출을 막을 뿐이므로, 진짜 비밀 키는 백엔드에 두고 프론트는 백엔드를 거쳐 호출한다.
