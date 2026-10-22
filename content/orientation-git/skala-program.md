---
title: SKALA 과정 구성
en: SKALA (SK AI Leader Academy) Curriculum
summary: SK가 직접 만든 취업 목표형 AI 실무 교육 — SW 기초 → AI 서비스화 → 배포·운영 → 생성형 AI 고도화 4단계 후 팀프로젝트
importance: 1
order: 1
tags:
  - SKALA
  - 커리큘럼
  - 자기소개
keypoints:
  - 4단계 — Full-stack, 데이터 분석·AIOps, Cloud Native AI, 생성형 AI 서비스
  - 정규교과 중 Mini-project 3회 (웹서비스 개발, 데이터 분석, 생성형 AI)
  - 7/14~10/26 정규교과 → 10/29 프로젝트 시작 → 12/16~17 최종평가 → 12/18 수료
qa:
  - q: SKALA 과정에서 무엇을 배웠는지 소개해 주세요.
    a: SKALA는 SK가 만든 AI 실무 인재 양성 과정으로, AI 서비스 하나를 처음부터 끝까지 만드는 흐름으로 구성되어 있습니다. Vue.js와 Spring Boot로 웹 서비스를 만드는 Full-stack 기초, Python·통계·머신러닝으로 데이터를 분석하고 모델을 서빙하는 AIOps, 컨테이너와 쿠버네티스로 배포·운영하는 Cloud Native, 그리고 LLM, RAG, AI Agent로 서비스를 고도화하는 생성형 AI 단계를 거쳤습니다. 단계마다 미니 프로젝트를 하고 마지막에 팀 프로젝트로 실제 서비스를 구현합니다.
related:
  - git-version-control
  - web-basics/web-http-basics
source: OT 슬라이드 p.3–4 (SKALA 소개 — 실무형 교육, 취업 목표 역설계), p.5 (SKALA 커리큘럼), p.6 (교육 일정), p.7 (과정 주요 Milestone), p.21 (Udemy 사전학습 — Git, HTML·CSS·JS, Python 기초)
---

```layers
01 AI 서비스를 위한 SW 기초 :: Full-stack Engineering — Git, 프론트엔드(Vue.js), 스마트데이터, 백엔드(Java, Spring Boot, REST API), Spring AI
02 AI의 서비스화 :: 데이터 분석 및 AIOps — Python, 기초통계, 머신러닝·딥러닝, Feature Engineering, 모델 개발·최적화, 모델 서빙·AIOps
03 AI 서비스 배포 및 운영 :: Cloud Native AI — Agile·MSA, 컨테이너화, 쿠버네티스 배포·실무 심화, DevOps
04 AI 서비스의 고도화 :: 생성형 AI 서비스 개발 — LLM, Vector DB, RAG Pipeline, LangChain, AI Agent, sLLM Fine Tuning, Agent Capstone(MCP)
```

```flow
7/14~10/26 정규교과 :: 수업(퀴즈·실습) + Mini-project (웹서비스 개발, 데이터 분석, 생성형 AI)
10/29 프로젝트 시작 :: AI 프로젝트 방법론, 팀 편성, 주제 선정, 멘토링
11/20 중간점검 :: 방향성·요구사항 명확화, 아키텍처 설계 점검 (평가보다 피드백)
12/16~17 최종평가 :: 구현 서비스와 개발 산출물 평가 (예선/본선)
12/18 수료식 :: 회고, 시상
```

> [!tip] 면접 팁
> 과정 소개는 "웹 서비스 → 데이터·모델 → 배포 인프라 → 생성형 AI로 이어지는 AI 서비스 전체 흐름을 직접 만들어 봤다"로 한 문장 요약하고, 가장 깊게 한 프로젝트 하나로 넘어간다.
