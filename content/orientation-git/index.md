---
summary: SKALA 4기 첫날 — 과정 오리엔테이션과 협업의 기본 도구 Git (로컬 커밋, 브랜치, 원격 저장소 push/pull, GitHub 협업 흐름)
keywords:
  - SKALA
  - 커리큘럼
  - Git
  - GitHub
  - 버전 관리
  - Staging Area
  - commit
  - branch
  - merge
  - conflict
  - rebase
  - push
  - pull
  - fetch
  - Pull Request
  - reset
  - revert
  - .gitignore
materials:
  - file: slides-orientation.pdf
    title: "입과 오리엔테이션 슬라이드 (판교캠퍼스)"
    type: slides
    date: 2026-07-14
---

## 한눈에 보기

```flow
과정 이해 :: SKALA 커리큘럼 4단계, 마일스톤, 출결·학습 지원
Git 준비 :: 설치, user.name·email 설정, init 또는 clone
로컬 기록 :: add로 스테이징 → commit으로 스냅샷
브랜치 :: 기능별 분기 → merge, 충돌 해결
원격 협업 :: push·pull·fetch, Fork·Pull Request, .gitignore
```

- 7/14 첫날은 입과 오리엔테이션(과정 소개·운영 안내) 후 팀빌딩과 Git 이해/활용(5시간)으로 진행.
- 이후 모든 과목의 실습 소스는 강사 GitHub 저장소(clone, fork)로 받고 과제는 본인 Public 저장소로 제출하므로, Git은 과정 전체의 기본기.
- Git 수업 슬라이드는 자료에 없어서, Git 노트는 OT의 사전학습 안내(p.21)와 이후 과목에서 실제로 쓴 Git 활용(과제 제출 규칙, .gitignore·환경 변수)을 바탕으로 면접 대비 일반 지식을 더해 정리함.

## 수업 흐름

**7/14 (화)** — 입과 오리엔테이션, 팀빌딩, Git 이해/활용

1. 시작 전 6가지 동의서·서약서 응답 안내 — p.2
2. SKALA 소개: SK가 직접 만든 AI 실무형 교육, 취업을 목표로 역설계한 과정 (실무 프로젝트, 포트폴리오, 취업 역량, 협업 경험) — p.3–4
3. 커리큘럼 4단계와 교육 일정표(1주차 첫날: 팀빌딩·Git 이해/활용 5h), 과정 마일스톤(정규교과 → 프로젝트 시작 → 중간점검 → 최종평가 → 수료식) — p.5–7
4. 판교캠퍼스 안내: 교육장(4층 401–405호, 5층 501–505호), 식당, 편의시설 — p.8–13
5. 학습 지원: 교육지원금·성장지원금, 교육장비, 현직자 멘토링, Udemy 구독(사전학습 — Git 환경 설정, HTML·CSS·JS 기초, Python 기초), 우수팀 시상, 취업 컨설팅 — p.14–23
6. 출결: LMS(교육장 Wi-Fi 본인확인) + 2주간 수기 출석부 병행 — p.16
7. 운영진 안내, 지켜야 할 것(Slack 알림, 공지 채널 확인, 출결 특이사항은 LMS 기록), 대한상공회의소 AI Campus(출결, 수당) 안내 — p.24–26
8. 오후: 팀빌딩(아이스브레이킹), Git 이해/활용 (강의 자료 미보관)

## 실습 정리

Git 실습 자료는 따로 없음. 대신 과정 내내 Git을 실제로 쓴 장면을 정리.

| 장면 | Git 활용 | 출처 |
| --- | --- | --- |
| 과목 소스 받기 | 강사 저장소(skala-front, skala-vue)를 Git Clone / Download ZIP / GitHub Fork | web-basics·vue 슬라이드 p.4 |
| 과제 제출 | 본인 GitHub Public 저장소 URL 제출, 시크릿 창에서 로그인 없이 보이는지 확인 — Private면 채점 불가 | web-basics·vue 슬라이드 p.5–6 |
| 비밀 값 관리 | API 키는 `.env`(VITE_ 변수)에, `.gitignore`로 커밋 제외, `.env.example`로 키 이름만 공유 | vue 슬라이드 p.265–266, p.274, vue 과제 제출물 |
| 코드 스타일 | Prettier로 포맷 통일 → 불필요한 Git 충돌 감소 | vue 슬라이드 p.259 |
| 배포 | 빌드 결과(dist)를 GitHub Pages에 올려 정적 호스팅 | vue 슬라이드 p.274 |

기본 흐름 — 강사 저장소를 받아 내 Public 저장소로 제출

```bash
# 1. 수업 소스 받기 (또는 GitHub에서 Fork한 뒤 내 저장소를 clone)
git clone https://github.com/bottletiger/skala-vue.git
cd skala-vue

# 2. 제출용 내 Public 저장소로 원격 주소 변경
git remote set-url origin https://github.com/<내 계정>/skala-vue.git

# 3. 작업 → 확인 → 기록 → 업로드
git status
git add .
git commit -m "feat: 날씨 대시보드 Router 적용"
git push -u origin main
```
