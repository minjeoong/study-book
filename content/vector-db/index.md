---
summary: "비정형 텍스트를 의미 좌표(임베딩)로 바꿔 저장하고, 유사도·ANN(HNSW)·조건 필터로 빠르게 찾는 Vector DB(Qdrant)의 원리와 RAG 연결"
keywords:
  - 비정형 데이터
  - TF-IDF
  - Vocabulary Mismatch
  - Dense Embedding
  - BGE-M3
  - Cosine Similarity
  - ANN
  - HNSW
  - Qdrant
  - Payload Filtering
  - RAG
materials:
  - file: slides-vector-db.pdf
    title: "강의 슬라이드 — Vector DB"
    type: slides
    date: 2026-10-08
---

## 한눈에 보기

```flow
비정형 데이터 :: 기업 지식의 80%, 글자 비교로는 검색 실패
전통 수치화의 한계 :: 원-핫·BoW·TF-IDF는 동의어·어순을 모르는 희소 벡터
Dense 임베딩 :: 뜻이 같으면 가까운 의미 좌표 (OpenAI, BGE-M3, E5)
유사도 :: 텍스트는 길이에 둔감한 코사인 유사도
ANN · HNSW :: 다층 그래프로 수백만 건을 ms 단위 근사 검색
Qdrant :: Collection·Point·Payload 저장, 조건 필터 + 의미 검색, RAG의 검색 엔진
```

- "휴대폰 액정이 깨졌어요"로 "스마트폰 디스플레이 파손 가이드"를 찾으려면 글자가 아닌 의미로 비교해야 한다는 문제의식에서 출발.
- 텍스트를 Dense 벡터로 바꾸고(임베딩), 방향으로 비교하고(코사인), 전수 비교 대신 그래프로 근사 탐색(HNSW)하는 것이 Vector DB의 세 기둥.
- Qdrant는 탐색 도중 payload 조건을 같이 검사하는 single-stage 필터링으로 "인사팀 문서 중에서만" 같은 실무 조건 검색을 빠르게 처리하며, RAG의 Retrieval 단계를 담당.

## 수업 흐름

2026-10-08 (하루), 페이지는 PDF 기준.

1. **비정형 데이터와 텍스트 수치화 기법** (p.3–56) — 정형 vs 비정형 데이터, 원-핫 인코딩·BoW(CountVectorizer)·TF-IDF와 각각의 한계, 어휘 불일치와 동의어 사전의 실패, 신경망 기반 Dense Embedding(의미 좌표), 임베딩 모델 생태계(OpenAI 3세대·MRL, BGE·BGE-M3, E5)와 선택 기준
2. **벡터 유사도와 Vector DB의 등장** (p.57–84) — 유클리드 거리 vs 코사인 유사도, 전수 조사의 한계와 ANN, HNSW 3계층 동작 원리, RDBMS vs Vector DB, Qdrant를 쓰는 이유(Rust, 대시보드, single-stage 필터)
3. **RAG 아키텍처와 Qdrant 핵심 기능** (p.85–111) — LLM 환각과 RAG(오픈북)의 원리, RAG 파이프라인 3단계(청킹·오버랩 → Qdrant 검색 → 생성), Qdrant 구성 요소(Collection·Point·Payload·Vector), Payload Filtering(사후·사전·single-stage)
4. **실습** (p.112–114) — Docker로 Qdrant 실행 + uv 가상환경, 실습1 컬렉션 생성·CRUD·대시보드 확인, 실습2 문장 임베딩 저장·검색, 실습3 필터 검색과 가벼운 하이브리드 검색
5. **종합실습** (p.115–116) — 사내 매뉴얼 기반 스마트 Q&A 검색기

RAG 원리·청킹 오버랩 부분(p.86–102)은 RAG Pipeline 과목과 겹쳐 별도 노트를 만들지 않음 — RAG Pipeline 과목의 "RAG 개요와 필요성", "Text Splitter와 청킹 전략" 노트 참고.

## 실습 정리

- **환경**: `docker run`으로 Qdrant 컨테이너 기동(REST 6333, 대시보드 `http://localhost:6333/dashboard`), uv로 파이썬 가상환경과 qdrant-client 설치
- **실습1**: 컬렉션 생성(차원·거리 지정) → 포인트 추가·조회·수정·삭제(CRUD) → 대시보드에서 포인트·payload 확인
- **실습2**: 주어진 문장들을 임베딩해 저장 → 질문 문장으로 유사도 검색
- **실습3**: payload 조건 필터를 건 검색, Dense + 키워드를 섞은 가벼운 하이브리드 검색
- **종합실습**: 사내 FAQ·규정을 문맥 단위로 쪼개 부서명·작성자 메타데이터 부착 → 임베딩 후 Qdrant 일괄 적재 → "인사팀 규정 중 '연차 사용 방법'과 가장 가까운 문단 3개" 필터 검색 함수 → 검색 문단으로 질문-답변 프롬프트 완성

```python
# 실습 노트북은 자료에 없어 실습 목표를 qdrant-client API로 옮긴 예시
client.create_collection("company_manuals",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE))
client.upsert("company_manuals", points=[
    PointStruct(id=i, vector=embed(c["text"]), payload=c) for i, c in enumerate(chunks)])

hits = client.query_points("company_manuals", query=embed("연차 사용 방법"),
    query_filter=Filter(must=[FieldCondition(key="department", match=MatchValue(value="인사팀"))]),
    limit=3).points
prompt = f"아래 규정만 근거로 답하세요.\n{[h.payload['text'] for h in hits]}\n질문: 연차는 어떻게 쓰나요?"
```
