# SKALA 개념 노트

SKALA 4기 수업을 교육 달력 순서대로 정리한 면접 대비 개념 노트.

- 배포: Vercel — 저장소에 푸시하면 `vercel.json` 설정대로 자동 배포. 원본 자료는 사이트에 싣지 않고 GitHub 원본(raw.githubusercontent.com)에서 불러온다
- 일정: `src/data/schedule.ts` — student.skala-ai.com 달력 기준
- 노트: `content/<과목 id>/` — 형식은 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)
- 원본 자료: `public/materials/<과목 id>/` — 사이트의 자료 뷰어에서 바로 열림

## 명령

```bash
npm install
npm run dev             # 개발 서버
npm run check           # 노트 형식 검사
npm run build           # dist/ (자료까지 함께 싣는 정적 빌드)
npm run build:vercel    # dist/ (Vercel 용, 자료는 GitHub 원본에서 불러옴)
npm run build:artifact  # dist-artifact/ (claude.ai Artifact 용)
```

## 수업 자료를 추가하는 순서

1. 슬라이드 PDF, 노트북, 실습 파일을 `public/materials/<과목 id>/` 에 넣는다.
2. `content/<과목 id>/index.md` 에 `materials` 를 등록하고 개념 노트를 쓴다.
3. `npm run check` 로 형식을 확인한다.
