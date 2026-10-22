# 노트 작성 가이드

이 사이트는 **면접 직전에 개념을 빠르게 찾아보는** 용도다. 모든 노트는 "한 눈에 읽히는가"를 기준으로 쓴다.
긴 문단보다 한 줄 정의, 3줄 요약, 그림(시각화 블록), 표, 면접 Q&A가 먼저다.

## 폴더 구조

```
content/<course-id>/            # course-id 는 src/data/schedule.ts 의 COURSES[].id
  index.md                      # 과목 개요 (한 개)
  <concept-slug>.md             # 개념 노트 (여러 개, 영문 kebab-case 파일명)
public/materials/<course-id>/   # 원본 수업 자료 (슬라이드 PDF, 노트북, 실습 zip)
```

## 과목 개요: `content/<course-id>/index.md`

```markdown
---
summary: 이 과목을 한 문장으로. (예: LLM에게 일을 잘 시키는 법 — 프롬프트 구조와 맥락 설계)
keywords: [Zero-shot, Few-shot, CoT, Context Window]
materials:
  - file: slides-day1-prompt-context.pdf     # public/materials/<course-id>/ 안의 파일명
    title: 강의 슬라이드 — Prompt 설계와 Context Engineering
    type: slides                              # slides | notebook | lab | etc
    date: 2026-07-15                          # 이 자료를 쓴 수업일
  - file: lab-few-shot-market-research.ipynb
    title: 실습 — Few-shot 시장조사 프롬프트 (LangChain)
    type: notebook
    date: 2026-07-15
---

## 한눈에 보기
(이 과목 전체 흐름을 flow 또는 layers 블록 하나로. 그 아래 2~4문장)

## 수업 흐름
(Day별로 무엇을 배웠는지 짧은 목록. Day가 하나면 시간 순서)

## 실습 정리
(노트북/실습에서 한 일: 데이터셋, 목표, 핵심 코드 1~2개)
```

## 개념 노트: `content/<course-id>/<concept-slug>.md`

```markdown
---
title: Few-shot Prompting            # 화면 제목 (한국어 or 원어, 짧게)
en: Few-shot Prompting                # 영문/원어 표기 (검색용, 제목과 같으면 생략)
summary: 예시 몇 개를 프롬프트에 넣어 모델이 원하는 형식·말투를 따라 하게 만드는 기법   # 한 줄 정의, 60자 안팎
importance: 3                         # 면접 빈출도 1(참고) 2(알아두기) 3(자주 나옴)
order: 2                              # 과목 안에서의 순서 (수업 순서대로)
tags: [프롬프트, LangChain]
keypoints:                            # 정확히 3개. 각 40자 안팎. 면접에서 바로 말할 수 있는 문장으로
  - 예시가 곧 출력 형식의 명세가 된다
  - 예시 수·순서·다양성이 결과에 영향을 준다 (recency bias)
  - LangChain에서는 FewShotChatMessagePromptTemplate 로 구성
qa:                                   # 면접 질문 1~3개. 답은 2~4문장, 말로 할 수 있는 길이
  - q: Zero-shot과 Few-shot의 차이는?
    a: Zero-shot은 지시만 주고, Few-shot은 입력-출력 예시를 함께 준다. ...
related: [zero-shot, chain-of-thought] # 같은 과목 또는 다른 과목 개념의 slug (다른 과목은 course-id/slug)
source: 슬라이드 p.23–31, 실습 TODO 2–5   # 어떤 수업 자료에서 나온 내용인지
---

본문 (선택). 시각화 블록, 표, 코드, 콜아웃으로 짧게.
```

### 본문에서 쓸 수 있는 시각화 블록

**flow** — 순서가 있는 과정. 한 줄에 한 단계, `제목 :: 설명` (설명 생략 가능). 3~6단계.

````
```flow
질문 입력 :: 사용자의 원 질문
임베딩 :: 질문을 벡터로
검색 :: 비슷한 문서 top-k
프롬프트 결합 :: 질문 + 문서
생성 :: LLM 답변
```
````

**layers** — 위에서 아래로 쌓이는 구조/계층. 한 줄에 한 층, `이름 :: 설명`.

````
```layers
System :: 역할, 규칙, 말투
Few-shot 예시 :: 입력-출력 쌍
Context :: 검색 문서, 대화 기록
User :: 이번 질문
```
````

**compare** — 둘~셋을 나란히 비교. 첫 줄은 비교 대상 이름을 `|`로, 그다음 줄부터 `항목 | 값 | 값`.

````
```compare
평균 | 중앙값
정의 | 모든 값의 합 ÷ 개수 | 정렬했을 때 가운데 값
이상치 영향 | 크게 받음 | 거의 안 받음
언제 | 대칭 분포 | 치우친 분포 (소득, 집값)
```
````

**formula** — 수식. 한 줄에 하나, `수식 :: 읽는 법/의미`. 유니코드로 쓴다 (LaTeX 금지).

````
```formula
z = (x − μ) / σ :: 평균에서 표준편차 몇 개만큼 떨어졌나
```
````

**콜아웃** — 한 노트에 1~2개까지.

```
> [!tip] 면접 팁
> 숫자 예시를 하나 들면 설명이 쉬워진다.

> [!warn] 헷갈리기 쉬움
> 표준편차와 표준오차는 다르다.
```

일반 마크다운 표, 코드 블록(```python, ```js, ```java, ```bash, ```yaml, ```sql)도 쓸 수 있다.

## 원칙

- 수업 자료(슬라이드, 노트북)에 나온 개념을 수업 순서대로 노트로 만든다. 자료에 없는 일반 지식은 면접 답변을 보강할 때만 쓴다.
- 과목당 개념 노트 6~14개. 너무 잘게 쪼개지 말고, 면접 질문 하나가 나올 단위로 묶는다.
- 본문은 짧게: 시각화 블록 1~2개 + 표 또는 코드 1개 + 콜아웃 0~2개. 긴 서술 문단 금지.
- 이모지 금지. 존댓말 대신 개조식(~다, ~함).
- 수업 자료 원본은 `public/materials/<course-id>/` 에 의미 있는 영문 kebab-case 이름으로 저장하고 index.md `materials`에 등록한다.
  - 슬라이드: `slides-day1-<주제>.pdf`, 노트북: `lab-<주제>.ipynb`, 정답/풀이본이면 `-solution` 접미사.
