---
summary: "요구사항은 반드시 바뀐다는 전제 — 일하는 방식(Agile·Scrum)과 그걸 받쳐주는 구조(MSA)를 Sprint로 직접 돌려 본 2일"
keywords:
  - Agile
  - Waterfall
  - Scrum
  - Sprint
  - User Story
  - INVEST
  - Story Point
  - MoSCoW
  - MSA
  - 모놀리식
  - Bounded Context
  - Database per Service
  - 12 Factor
  - API Gateway
  - OAuth 2.0
  - JWT
  - Eureka
  - Kafka
  - Circuit Breaker
  - SOLID
  - Docker Compose
materials:
  - file: slides-agile-msa.pdf
    title: "강의 교재 — Agile 방법론 및 MSA 개발"
    type: slides
    date: 2026-08-26
  - file: slides-supplement1-agile-msa-cases.pdf
    title: "보강 자료 1 — 사례로 살펴보는 Agile, MSA"
    type: slides
    date: 2026-08-26
  - file: slides-supplement2-docker-basics.pdf
    title: "보강 자료 2 — Docker 컨테이너 기초 가이드"
    type: slides
    date: 2026-08-26
  - file: guide1-agile-msa-process.pdf
    title: "실습 가이드 1 — Agile, MSA 진행"
    type: lab
    date: 2026-08-26
  - file: guide2-agile-msa-lab.pdf
    title: "실습 가이드 2 — Agile, MSA 실습"
    type: lab
    date: 2026-08-26
  - file: guide3-msa-code-template.pdf
    title: "실습 가이드 3 — 코드 템플릿 설명 (msa-practice 시나리오)"
    type: lab
    date: 2026-08-26
  - file: lab-msa-lecture.zip
    title: "실습 코드 — msa-lecture (도커 이미지 tar, node_modules 제외)"
    type: lab
    date: 2026-08-26
  - file: assignment-code-review-template1.docx
    title: "개인과제 템플릿 1 — 코드 이해"
    type: etc
    date: 2026-08-26
  - file: assignment-code-review-template2.docx
    title: "개인과제 템플릿 2 — 코드 이해"
    type: etc
    date: 2026-08-26
  - file: assignment-code-review-template3.docx
    title: "개인과제 템플릿 3 — 코드 이해"
    type: etc
    date: 2026-08-26
  - file: submission-day1-sprint-planning.pdf
    title: "과제 제출 — Day1 개인 서브노트 (MSA 구성요소, 도메인 매핑, 스프린트 분할)"
    type: etc
    date: 2026-08-26
  - file: submission-blueberry-smoothie.zip
    title: "과제 제출 — blueberry-smoothie 팀 MSA 프로젝트"
    type: lab
    date: 2026-08-26
  - file: submission-day2-team4-proposal.pdf
    title: "과제 제출 — Day2 4조 기획서"
    type: etc
    date: 2026-08-27
  - file: submission-day2-team4-presentation.pdf
    title: "과제 제출 — Day2 4조 발표자료"
    type: etc
    date: 2026-08-27
  - file: submission-day2-team4-code.zip
    title: "과제 제출 — Day2 4조 프론트엔드 코드"
    type: lab
    date: 2026-08-27
---

## 한눈에 보기

```flow
Agile 개요 :: Waterfall의 한계 → 짧은 반복, 잦은 피드백
Scrum :: 역할 3 · 이벤트 4 · 산출물 3, DoD, Timebox
User Story · 백로그 :: Epic → Story → Task, INVEST, MoSCoW, Story Point
MSA 설계 :: 모놀리식 vs MSA, Bounded Context, DB 분리, 12 Factor
MSA 구성요소 :: Gateway + 인증서버, Eureka, Kafka, Circuit Breaker
Sprint 실행 :: 템플릿을 팀 도메인으로 치환 → Review(데모) → Retro(KPT)
```

- Agile은 "어떻게 일할 것인가"(방법론), MSA는 그 방식을 가능하게 하는 "기술 구조". 둘 다 "요구사항은 반드시 바뀐다"는 전제에서 출발함.
- Day 1은 Scrum과 User Story로 Product Backlog → Sprint Backlog를 만들고, Day 2는 그 백로그를 Sprint 1·2로 나눠 MSA 코드 템플릿(온라인 교육 플랫폼)을 팀 도메인으로 바꿔 구현.
- 결론은 "MSA가 정답"이 아니라 "값을 치르고 사는 구조". 팀 규모·배포 주기·부하·기술 스택이 서로 다를 때만 이득이며, 변경이 잦은 AI 서비스와 잘 맞는 편.

## 수업 흐름

**Day 1 (2026-08-26)** — Agile 방법론 & Sprint 운영 (교재 p.3–46, 이론 4h + 실습 4h)

1. **Agile 개요** (p.4–9) — 필요한 상황, Waterfall vs Agile, 도입 5단계 로드맵, 흔한 실패(무늬만 Agile 등), 전환 체크리스트
2. **Scrum 핵심 요소** (p.10–16) — Scrum 5 values, 역할 3, 이벤트 4, 산출물 3 + DoD, 2주 Sprint 캘린더, Daily Scrum 대화 예시, Sprint 0를 붙인 Agile Delivery 공정
3. **User Story & 백로그** (p.17–30) — Epic → Story → Task, INVEST, 그루밍, Before/After, MoSCoW, 인수 기준(Given/When/Then), Release Planning, Sprint Planning, Daily Scrum
4. **모의 프로젝트 소개·가이드** (p.31–38) — Auth·Eureka·Gateway·Kafka 아키텍처, REST vs Kafka 선택 기준, PO/SM/Dev 배분, 샘플 스토리 3종
5. **모의 프로젝트 설계 실습** (p.39–44) — Story Point(피보나치), Task 분할, 칸반 보드, Day1 → Day2 실행 로드맵
6. **Agile 적용 실패 사유** (p.45–46) — State of Agile: 조직 문화 63%가 1위, Boss vs Leader
7. **보강 자료 1** — 사례: FBI VCF(Waterfall 실패), Netflix(모놀리식 → MSA), Prime Video(다시 모놀리식), Shopify(모듈러 모놀리식), 아키텍처 선택 기준표
8. **실습 가이드 1–3** — 2일 운영 일정, "알아야 할 것 vs 몰라도 되는 것", 도메인 매핑표, 기획서 6단계, 코드 템플릿 설명 → 개인 서브노트 작성·제출

**Day 2 (2026-08-27)** — MSA 개발, Sprint Backlog 구현 (교재 p.47–100)

1. **MSA 개요** (p.51–63) — 필요성(Time to market, Cost of quality), Safety·Scale·Speed, 적합 영역, Bounded Context Map, DB 분리, Cloud Ready/Friendly/Native, 12 Factor, ReArchitecture(BFF·API GW·ACL), MSA 구성요소
2. **SOLID 리팩토링** (p.64–66) — Pure Java LoginService → SRP·OCP·DIP 분리 → 인증서버 컴포넌트로 이관
3. **인증서버 & API Gateway** (p.67–70) — OAuth 2.0, JWT 발급·검증, Gateway 인증 필터 (Sprint 1)
4. **Eureka & 서비스 간 통신** (p.71–74) — 등록/조회, `lb://` 라우팅 (Sprint 2)
5. **Kafka 기본** (p.75–78) — Producer·Topic·Consumer, course-applied 이벤트, Dead Letter Topic (Sprint 3)
6. **서비스 간 통신 패턴** (p.79–81) — Circuit Breaker + fallback, Anti-corruption Layer, Monitoring
7. **MSA에서 Data 처리** (p.82–84) — DB 조인 vs WAS 조인, Consistent Mode, "MSA에서도 ERD 작성 + 조인 SQL"
8. **Sprint 실행 → Review → Retrospective** (p.85–93) — Task 현황판, 데모 순서, 계획 대비 실행 갭 분석, KPT 회고
9. **MSA 웹서비스 구축** (p.94–100) — 요구사항 분석 → 도메인 분리 → 인프라 → 통신 설계(시퀀스) → Eureka 대시보드·Swagger·프론트 시연
10. **보강 자료 2** — Docker Q&A: 격리, 이미지 vs 컨테이너, 멀티스테이지 빌드(JDK로 빌드, JRE로 실행), 비 root 실행, `-p` 포트 매핑, `--env-file`, Compose 네트워크 DNS

## 실습 정리

**코드 템플릿 — 온라인 교육 플랫폼 (msa-lecture)**

- 스택: Spring Boot 3.4 · Java 21 · Gradle, Spring Cloud Gateway, Eureka, Spring Authorization Server, Kafka(KRaft), MariaDB 단일 인스턴스(테이블 단위 분리), 추천만 FastAPI, 프론트 Vue 3 + Vite + Pinia
- 기동 순서(depends_on): MariaDB·Kafka → Eureka → Auth Server → Gateway + 4개 서비스 → Recommend
- 인증서버·Gateway는 난이도 때문에 이미지(tar)로만 배포, 학생은 course·enrollment·payment·recommend·vue-frontend만 수정
- Sprint 1 = 워킹 스켈레톤(서비스 2~3개 안에서 로그인 → 신청 한 흐름 완성), Sprint 2 = 결제·Kafka 이벤트·추천 확장

| 컨테이너 | 포트 | 역할 |
| --- | --- | --- |
| api-gateway | 8080 | 단일 진입점, JWT 검증, `X-User-Id` 헤더 전파 |
| eureka-server | 8761 | 서비스 등록·탐색 |
| auth-server | 9000 | OAuth2 토큰 발급, JWK 공개키 제공 |
| user / course / enrollment / payment | 8081–8084 | 도메인 서비스 (Spring Boot) |
| recommend-service | 8085 | 수강 이력 기반 규칙 추천 (FastAPI) |
| kafka / mariadb | 9092 / 3306 | 이벤트 버스 / DB |

**팀 프로젝트 — 9반 4조 블루베리스무디, SK AM (SK API Marketplace)**

- 아이디어: SK 계열사·파트너사의 AI 엔진을 API 단위 월정액 구독 상품으로 파는 B2B 마켓플레이스. 템플릿 구조는 그대로 두고 도메인만 치환
- 역할: 김민정 PO·프론트엔드(본인), 김지수 SM·기획, 박규리 백엔드, 오승민 프론트엔드, 전경호 발표·기획
- Pain Point: 구매 기업(AX 통째 도입 부담, 종량제 예산 예측 어려움) / API 공급사(대형 계약 편중, 매출 불안정) / 플랫폼(계열사별 품질·인증·과금 제각각)
- 도메인 매핑: 강사·학생 → API Vendor·구매 기업, 과목 → API 상품, 수강신청 → 구독, 수강생 수 → 구독 기업 수, 추천 → 사용 패턴 기반 API 추천
- 엔드포인트 19개를 그대로 재사용 (신규 0건, 경로 치환 12건, 필드 치환 6종, Enum 치환 Category 8종·Status·Role)

| Sprint | 범위 (User Story) | 계획 SP | 완료 SP | 달성률 |
| --- | --- | --- | --- | --- |
| Sprint 1 (MVP) | 회원가입·로그인·로그아웃, API 등록·조회, 구독 신청, 내 구독 (US-01~07) | 24 | 24 | 100% |
| Sprint 2 (확장) | 카테고리 필터, 구독 결제, 결제 내역, 추천, 구독 기업 수 (US-08~12) | 18 | 13 | 72% (US-09 추천 5점 이월) |

- Story Point 기준: US-01(회원가입·로그인) = 3을 기준점으로, 연동 서비스 수·비동기 여부·처음 다루는 정도로 가중
- 협업: Notion 칸반(상태별 뷰 + 흐름 단계별 뷰), GitHub 개인 브랜치 → PR → main (39 커밋, PR 6건)
- 트러블슈팅: tar로 로드한 이미지 때문에 재빌드해도 컨테이너가 갱신되지 않음 → 레지스트리 정석 배포로 되돌리고, 429 Too Many Requests는 회선 변경으로 회피

```java
// prebuilt auth-server가 users.role을 STUDENT/INSTRUCTOR enum으로 읽기 때문에
// DB 저장값은 레거시로 고정하고, 앱·API·프론트만 BUYER/PROVIDER로 통일
@Converter
public class RoleConverter implements AttributeConverter<User.Role, String> {
    public String convertToDatabaseColumn(User.Role role) {
        return role == User.Role.PROVIDER ? "INSTRUCTOR" : "STUDENT";
    }
    public User.Role convertToEntityAttribute(String db) {
        return switch (db) {
            case "INSTRUCTOR", "PROVIDER" -> User.Role.PROVIDER;
            case "STUDENT", "BUYER" -> User.Role.BUYER;
            default -> throw new IllegalStateException("알 수 없는 role: " + db);
        };
    }
}
```

```yaml
# 소스 없는 Gateway 이미지의 라우팅 바꾸기 — ./config/application.yml이 jar 내부 설정보다 우선
api-gateway:
  volumes:
    - ./api-gateway-config/application.yml:/app/config/application.yml:ro
# spring.cloud.gateway.routes는 리스트라 부분 병합이 안 됨 → 라우트 6개를 전부 다시 적어야 함
```

**개인 서브노트** — MSA 인프라 구성요소, Swagger로 API 명세 확인(Gateway 401 vs 서비스 포트 직접 호출 200), 도메인 매핑, 스프린트 분할 기준, AI 서비스와 MSA 적합성, 아키텍처 선택 체크리스트, 부록(제로 트러스트, 설정 덮어쓰기, 트러블슈팅)을 정리해 제출.

> [!tip] 수업에서 남은 한 문장
> "MSA 설계 기준이 결국 데이터베이스인가?"라는 질문에 교수님 답은 "맞다, DB를 어떻게 나누고 누가 소유하는지가 매우 중요하다". 템플릿도 테이블마다 주인 서비스가 하나이고, 남의 테이블은 API로만 접근한다.
