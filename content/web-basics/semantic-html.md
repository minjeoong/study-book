---
title: 시맨틱 HTML과 문서 구조
en: Semantic HTML, Accessibility
summary: 태그 이름으로 내용의 역할을 드러내는 HTML — header, main, section, article로 화면 골격을 짜고 접근성·SEO를 얻는다
importance: 2
order: 2
tags:
  - HTML
  - 시맨틱
  - 접근성
keypoints:
  - div 대신 의미 태그를 쓰면 구조가 코드에 그대로 드러난다
  - 장점은 가독성 · 접근성(스크린리더) · SEO(검색엔진) 세 가지
  - 문서 골격은 DOCTYPE → html → head(메타데이터) + body(화면 내용)
qa:
  - q: 시맨틱 태그를 쓰는 이유는?
    a: 태그 자체가 내용의 역할을 설명하므로 코드를 읽고 유지보수하기 쉬워집니다. 스크린리더가 header, main, nav 같은 랜드마크로 페이지를 건너뛰며 탐색할 수 있어 접근성이 좋아지고, 검색엔진도 본문과 부가 영역을 구분해 SEO에 유리합니다. 화면 모양은 div와 같아도 의미 정보가 더해진다는 점이 핵심입니다.
  - q: section과 article의 차이는?
    a: article은 따로 떼어 내도 의미가 통하는 독립 콘텐츠(게시글, 카드 한 장)이고, section은 주제별로 묶은 문서의 한 구획입니다. 실습에서는 입력 영역과 목록 영역을 section으로, 차량 카드 하나하나를 article로 만들었습니다. 둘 다 보통 제목(h2, h3)을 함께 둡니다.
  - q: 웹 접근성을 높이려면 HTML을 어떻게 작성하나요?
    a: 시맨틱 태그로 구조를 드러내고, h1~h6 제목을 계층 순서대로 씁니다. img에는 alt로 이미지 내용을 말로 설명하고, label의 for와 input의 id를 연결해 스크린리더가 입력칸에 포커스가 갔을 때 무엇을 적는 칸인지 읽게 합니다. 수업의 포털 Hub 과제도 index.html을 nav, main, aside로 나눠 만들었습니다.
related:
  - html-forms
  - browser-rendering
  - dom-manipulation
source: Day1 슬라이드 p.24–32 (HTML 개요·역사, Page Structure, 주요 태그), p.42–44 (요소, 속성, 전역 속성 id·class·data-*), p.87–92 (Semantic Layout Tags, head, 웹 접근성), p.94 (과제 포털 Hub), Day2 가이드 p.2–3, index.html, app.js createCarCard (article)
---

```layers
header.page-header :: 페이지 제목 h1 + 설명 p (Day2 HTML TODO 1)
main.container :: 본문 — 2열 레이아웃의 부모
section.form-card :: 차량 정보 입력 폼
section.list-card :: 검색·필터 + 차량 목록
article.car-card :: 차량 1대 카드 — JS가 createElement로 생성
```

| 태그 | 의미 | 비고 |
| --- | --- | --- |
| `header` / `footer` | 머리말 / 꼬리말 | 페이지 또는 섹션 단위 |
| `nav` | 주요 내비게이션 링크 묶음 | Day1 포털 Hub 과제의 바로가기 메뉴 |
| `main` | 문서의 핵심 콘텐츠 | 페이지당 1개 |
| `section` | 주제별 구획 | 제목과 함께 |
| `article` | 독립적으로 배포 가능한 콘텐츠 | 글, 카드, 댓글 |
| `aside` | 본문과 간접 관련된 부가 정보 | 사이드바 |
| `figure` + `figcaption` | 이미지·도표와 그 설명 | |
| `div` / `span` | 의미 없음 — 스타일용 묶음 | block / inline |

> [!tip] 면접 팁
> "div와 화면은 같지만 브라우저·스크린리더·검색엔진에게 의미를 알려 준다"로 한 문장 정리하면 충분하다. head 안의 `meta charset`, `meta viewport`, `title`, `link`, `script`는 화면에 안 보이는 메타데이터.
