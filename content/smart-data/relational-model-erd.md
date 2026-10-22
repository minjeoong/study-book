---
title: "관계형 모델: 키 · 관계 · ERD"
en: Relational Model, PK · FK · UK, ERD
summary: "행·열 테이블에 PK로 행을 식별하고 FK로 테이블을 잇는 관계형 모델, 그리고 이를 그림으로 설계하는 ERD"
importance: 3
order: 2
tags: [관계형 모델, PK, FK, ERD, 데이터 모델링, 교차 테이블]
keypoints:
  - PK는 NULL·중복 불가, UK는 중복 불가지만 NULL 허용
  - FK는 다른 테이블 PK를 참조해 참조 무결성 보장 (CASCADE 등 옵션)
  - N:M은 직접 못 만들고 두 FK를 가진 교차 테이블로 푼다
qa:
  - q: PK와 UNIQUE 제약의 차이는?
    a: "둘 다 중복을 막지만 PK는 NULL을 허용하지 않고 테이블당 하나이며 행을 식별하는 기준입니다. UNIQUE는 NULL을 허용하고 여러 개 둘 수 있어서 이메일처럼 유일하지만 비어 있을 수 있는 값에 씁니다. 종합실습 1에서도 학번은 NOT NULL UNIQUE로, 이메일은 아직 등록하지 않은 학생을 고려해 NULL을 허용하는 UNIQUE로 설계했습니다."
  - q: 다대다(N:M) 관계는 어떻게 구현하나요?
    a: "관계형 DB는 N:M을 직접 표현할 수 없어서 양쪽 PK를 FK로 가진 교차 테이블을 둡니다. 학생과 강좌라면 수강신청 테이블에 (student_id, course_id) 복합 PK를 걸어 중복 신청을 막고, 신청일·점수 같은 관계의 속성도 여기에 둡니다. 강좌 기준 조회도 잦으면 (course_id, student_id) 인덱스를 하나 더 만듭니다."
  - q: 개념적·논리적·물리적 모델링의 차이는?
    a: "개념적 모델링은 요구사항에서 엔티티와 관계를 뽑아 ERD로 그리는 단계로 DBMS와 무관합니다. 논리적 모델링은 이를 테이블·PK·FK로 옮기고 정규화를 적용합니다. 물리적 모델링은 특정 DBMS에 맞춰 데이터 타입, 인덱스, 파티셔닝까지 정하는 단계입니다."
related: [normalization, sql-basics, spring-rest/jpa-entity-repository]
source: Day1 (7/27) 슬라이드 p.23–34 (테이블·키·FK 옵션·관계, PK·FK 부여 예시), p.52–73 (ERD, 속성 종류, IE 표기법, 개념→논리→물리, 약한 엔티티, N:M 설계), 종합실습 1 학사관리 ERD
---

```layers
개념적 모델 :: 요구사항에서 엔티티(명사)와 관계 도출, ERD로 이해관계자와 소통 (DBMS 독립)
논리적 모델 :: 엔티티 → 테이블, PK·FK 설정, 정규화, 산출물은 논리 ERD와 데이터 사전
물리적 모델 :: DBMS별 타입(NUMERIC, TIMESTAMPTZ), 인덱스, 파티셔닝, Lock 전략
```

| FK 옵션 | 부모 행을 지우면 | 사용 예 |
| --- | --- | --- |
| ON DELETE CASCADE | 자식도 함께 삭제 | 주문 삭제 → 주문 항목 삭제 |
| ON DELETE SET NULL | 자식의 FK를 NULL로 | 직원 퇴사 → 담당 고객의 담당자 NULL |
| ON DELETE RESTRICT | 자식이 있으면 삭제 거부 | 담당 강좌가 남은 교수는 삭제 불가 (실습 1) |
| NO ACTION | RESTRICT와 비슷, 검사 시점만 다름 | 대부분 DBMS의 기본값 |
| ON UPDATE CASCADE | 부모 PK 변경을 자식에 전파 | 자연키(학번) 변경 — 대체키 권장 |

- 관계: 1:1(학생-학생증), 1:N(학생-성적, 가장 흔함), N:M(학생-강좌 → 수강 교차 테이블)
- IE(까마귀발) 표기: `│` 하나, 까마귀발 여럿, `○` 0 또는 1 / 실선 = 식별 관계(FK가 자식 PK의 일부), 점선 = 비식별 관계
- 약한 엔티티: 혼자 식별 불가 → 부모 PK + 부분키로 복합 PK, 부모 삭제 시 CASCADE (OrderItem(order_id, item_no))
- 속성 종류: 복합 속성(주소 = 시 + 구 + 동), 다중값 속성(이메일 여러 개 → 별도 테이블), 유도 속성(나이 → 생년월일에서 계산, 저장 안 함)

> [!tip] 면접 팁
> 실무 PK는 의미 없는 대체키(BIGINT IDENTITY)가 기본. 학번 같은 자연키는 바뀔 수 있어 UNIQUE로 두고, UUID는 인덱스가 커지는 점을 함께 언급하면 좋다.
