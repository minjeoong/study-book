---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: SKALA 개념 노트 (전체 사이트)

Scope: 사이트 전체 셸과 모든 화면 (홈, 교육 일정, 과목, 개념, 면접 질문, 자료실, 자료 뷰어). Mode: Read (개념을 찾아 읽음) + Operate (검색, 플래시카드).
Audience/job: SKALA 4기 수강생 한 명. 면접 직전 개념을 10초 안에 찾아 한 줄 정의·3줄 요약·그림·예상 질문으로 떠올린다. 노트북과 휴대폰 비슷하게 사용.
Constraints: 콘텐츠·기능·해시 라우트 유지. 라이트/다크. GitHub Pages(주) + claude.ai Artifact(보조).

## Direction contract

THESIS: 커리큘럼은 열차 운행표다. 과목은 역, 분야는 노선, 오늘 수업은 '운행 중'. 문서 사이트 기본형(사이드바 트리 + 옅은 색 카드)을 거부하고, 인쇄된 철도 시각표의 정밀한 표와 노선도로 길을 찾게 한다.

OWN-WORLD: 흰 종이, 검정 잉크, 신호 빨강 하나, 시각표 회색 넷만. 노선은 색이 아니라 문자 배지(A·D·W·I·P 검정 사각형)로 구분. 굵은 고정폭 숫자(Archivo 좁은 폭)로 날짜·코드, 본문은 Pretendard. 상태는 표식: ● 지남 ◉ 운행 중(빨강) ○ 예정. 표는 가는 괘선, 그림자·그라데이션·틴트 카드 없음.

STORY: 들어오면 지금 어느 역(오늘 수업)인지와 다음 정차를 보고, 운행표에서 역을 골라 개념으로 내려가거나 검색으로 바로 찾는다. 개념에서는 정의 → 3줄 → 그림 → 질문 순서로 읽고 스스로 답해 본다.

FIRST VIEWPORT: 화면 폭 전체 빨간 마스트헤드(이름, 운행 기간 07.14 → 11.04, 운행 중 표시, 검색). 아래 왼쪽 큰 숫자 날짜와 '지금 운행 중' 역 이름, 역 진행 표식(●─◉─○), 다음 정차. 오른쪽 역 찾기 검색 입력이 1차 행동. 그 아래 바로 월별 운행표 첫 줄들(코드·역·출발·도착·개념 수·상태).

FORM: 열차 시각표 (철도 운행표 인쇄물), 우리 목록 7번. seed:f64d781b9ca7ff95

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
