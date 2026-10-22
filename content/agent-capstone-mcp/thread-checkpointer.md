---
title: Thread와 Checkpointer — 세션 상태 관리
en: thread_id, Checkpointer, Stateless Session
summary: "thread_id로 대화를 격리하고, checkpointer가 그래프 매 step의 상태 스냅샷을 저장·복원해 멀티턴을 이어 감"
importance: 3
order: 4
tags: [LangGraph, Checkpointer, Session, FastAPI]
keypoints:
  - "thread_id는 대화 방 번호, checkpoint_id는 스텝별 스냅샷"
  - "Thread Owner: Backend 발급(Stateful) vs Frontend 생성(Stateless)"
  - "MemorySaver는 재시작 시 손실 → AsyncPostgresSaver를 외부 주입"
qa:
  - q: "LangGraph에서 멀티턴 대화는 어떻게 유지되나?"
    a: "invoke할 때 config={'configurable': {'thread_id': ...}}로 대화 단위를 지정하면 checkpointer가 그래프의 매 step마다 메시지와 도구 호출 이력이 담긴 state snapshot을 저장한다. 같은 thread_id로 다시 요청하면 이전 상태를 복원해 '방금 그 시스템' 같은 지시어를 이해하고, thread_id가 다르면 서로 섞이지 않는다. 실습에서도 같은 thread로 후속 질문하면 auth-service를 기억했고, 새 대화로 thread를 바꾸자 어떤 절차인지 되물었다."
  - q: "thread_id는 Frontend와 Backend 중 누가 만들어야 하나?"
    a: "Backend가 uuid4로 발급하면 Frontend는 몰라도 되고 CLI·모바일 등 다양한 클라이언트에서 자연스럽고 인증 사용자 추적이 쉽지만, Backend가 active thread를 추적해야 해 Stateful해지고 분산 시 인스턴스 간 공유가 필요하다. Frontend가 crypto.randomUUID()로 만들면 '새 대화' 버튼 같은 UI 이벤트로 수명주기를 정하고 localStorage로 새로고침 후에도 이어 갈 수 있으며 Backend는 Stateless에 가까워 로드밸런서 뒤에 자유롭게 늘릴 수 있다. 대신 Backend가 전달받은 thread_id의 소유권을 매번 검증해야 한다."
  - q: "Stateful에서 Stateless로 어떻게 전환하나?"
    a: "MemorySaver는 상태를 Backend 프로세스 RAM의 dict에 둬서 재시작하면 모두 사라지고 인스턴스와 상태가 강하게 묶인다. AsyncPostgresSaver처럼 외부 저장소 구현체로 바꾸면 여러 인스턴스가 같은 thread 상태를 공유한다. checkpointer는 DB connection pool을 가진 자원이라 요청마다 만들지 않고 FastAPI lifespan에서 한 번 생성해 app.state에 두고, build_supervisor_graph(checkpointer)처럼 그래프에 외부 주입한다."
related: [integration-architecture, sse-streaming, ai-agent/langgraph-state-graph, ai-agent/langchain-middleware]
source: "2026-10-21 · slides-agent-capstone.pdf p.28 (Session 3A–3C), p.32–35 (Thread 관리, Thread Owner 결정, RFC 4122 UUID v4), p.38 SUMMARY · 2026-10-23(예정) p.83–88 (Session, thread_id vs checkpoint_id, Checkpointer, AsyncPostgresSaver, Lifespan, Checkpointer 외부 주입), p.93 SUMMARY · submission-fastapi.zip T3, submission-streaming.zip F2–F4"
---

```compare
(A) Backend가 thread_id 발급 | (B) Frontend가 thread_id 생성
생성 | `uuid.uuid4()` — 새 요청이면 Backend가 만들어 응답에 포함 | `crypto.randomUUID()` — "새 대화" 버튼에서 생성
Backend 상태 | active thread 추적 → Stateful | 받은 thread_id 그대로 사용 → Stateless에 가까움
새로고침 | Frontend가 id를 잃음, "마지막 thread" 요청 필요 | localStorage에 두면 같은 thread로 이어 감
다양한 Client | CLI·script·모바일에서도 자연스러움 | 모든 Client가 UUID 생성 로직 필요
인증·분산 | 인증 사용자 thread 추적 쉬움, 인스턴스 간 상태 공유 필요 | 소유권을 매번 검증, LB 뒤에 인스턴스 자유 배치
```

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: checkpointer 생성 + connection pool 활성화 (요청마다 만들면 비효율·누수)
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as cp:
        await cp.setup()                               # 최초 1회 테이블 준비
        app.state.checkpointer = cp
        app.state.graph = build_supervisor_graph(cp)   # MemorySaver 하드코딩 대신 외부 주입
        yield
    # Shutdown: async with 블록이 끝나며 pool 정리

app = FastAPI(lifespan=lifespan)
config = {"configurable": {"thread_id": str(thread_id)}}   # uuid4()는 UUID 객체 → str() 필요
```

- 실습(Streaming)은 (B) 방식: `thread.ts`가 localStorage의 thread_id 사용 → 새로고침 후 화면 메시지는 사라졌지만(Frontend state) Backend in-memory checkpointer에는 대화가 남아 이어서 기억
- checkpoint_id: Node가 끝날 때마다 상태를 버저닝하는 Git 커밋 해시 같은 값. 특정 checkpoint로 되돌아가는 Time travel 지원

> [!warn] crypto.randomUUID는 Secure Context 필요
> HTTPS 또는 localhost에서만 동작해 사내망 IP로 접근하면 `crypto is undefined` 에러. localhost·https로 접근하거나 `uuid` npm 패키지로 fallback. 반대로 Python `uuid.uuid4()`는 UUID 객체라 dict 키·JSON 직렬화 전에 `str()` 변환.
