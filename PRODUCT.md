# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript, 단일 HTML 파일로 빌드 (vite-plugin-singlefile). 노트는 `content/` 마크다운, 일정은 `src/data/schedule.ts`.
배포: claude.ai Artifact 링크(비공개) + GitHub Pages 워크플로 준비 (저장소가 비공개라 Pages는 공개 전환 또는 Pro 필요).

## Users

SKALA 4기(SK AX 채용연계형 AI 교육, 2026-07-14 ~ 2026-11) 수강생 한 명. 수업이 끝날 때마다 받은 슬라이드·노트북을 정리해 두고,
면접 직전에 "이 개념 설명할 수 있나?"를 빠르게 확인한다. 노트북으로 정리·복습하고, 이동 중에는 휴대폰으로 훑어본다 (두 기기 비중 비슷).

## Product Purpose

교육 달력 순서대로 과목별 핵심 개념을 한 눈에 읽히게 정리한 개인 학습 노트. 성공 기준: 면접에서 나올 개념을 10초 안에 찾고,
한 줄 정의 · 3줄 요약 · 그림 · 예상 질문으로 바로 떠올릴 수 있다.

## Positioning

일반 개념 사전이 아니라 이 사람이 실제로 들은 SKALA 4기 수업의 순서와 자료(슬라이드 페이지, 실습 노트북)에 묶인 노트.
모든 개념은 어느 날 어느 수업, 어느 자료에서 나왔는지 거슬러 올라갈 수 있다.

## Operating Context

- 원본 일정: student.skala-ai.com/schedule (로그인 필요). 사용자가 보낸 달력 캡처(7월~10월)를 `src/data/schedule.ts`로 옮김.
- 원본 자료: 수업일마다 사용자가 업로드하는 강의 PDF, Jupyter 노트북, 실습 zip. `public/materials/<course-id>/`에 보관.
- 면접 준비: 개념 설명, 비교 질문(A vs B), 실습에서 한 일 설명.

## Capabilities and Constraints

- 일정순 과목 목록, 과목 페이지, 개념 노트, 전체 검색, 면접 질문 모아보기/플래시카드, 자료실.
- 자료가 아직 없는 과목은 일정만 보이고 "자료 대기"로 표시 (내용을 지어내지 않음).
- 팀프로젝트(11/2~) 이후 일정은 아직 모름.

## Evidence on Hand

- 업로드된 자료: 7/15 Prompt 설계와 Context Engineering, 7/16·7/20 데이터 분석 개요 및 기초통계, 7/21·7/22 LLM과 Transformer, 7/24 HTML/CSS/JavaScript.
- 후기, 성적, 수료 결과 등은 없음. 지어내지 않는다.

## Product Principles

1. 한 눈에: 문단보다 한 줄 정의, 3줄 요약, 그림, 표가 먼저.
2. 수업 순서가 뼈대: 달력 순서와 날짜가 모든 화면의 기준.
3. 출처가 있는 노트: 개념마다 수업일과 자료 위치를 남긴다.
4. 스스로 확인: 면접 질문은 답을 가린 채 먼저 떠올려 보게 한다.

## Accessibility & Inclusion

한국어 본문 가독성(16px 이상, 충분한 행간), 휴대폰 한 손 사용, 키보드 검색(⌘K / Ctrl+K), 다크 모드.
