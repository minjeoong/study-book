---
title: Python 실행 구조
en: Python Execution Model (AST, Bytecode, PVM)
summary: 소스코드를 AST와 바이트코드(.pyc)로 컴파일한 뒤 스택 기반 가상 머신(PVM)이 해석·실행하는 하이브리드 방식
importance: 2
order: 1
tags: [Python, 인터프리터, 바이트코드, PVM, GC, venv]
keypoints:
  - 인터프리터 언어지만 바이트코드라는 중간 표현을 거친다 (컴파일 + 인터프리트)
  - 메모리는 참조 카운팅으로 즉시 해제, 순환 참조는 GC가 따로 수거
  - venv로 프로젝트별 인터프리터·패키지 격리, requirements.txt는 커밋
qa:
  - q: Python은 컴파일 언어인가요, 인터프리터 언어인가요?
    a: "보통 인터프리터 언어라고 부르지만 실제로는 하이브리드입니다. CPython은 소스코드를 파싱해 AST를 만들고 바이트코드로 컴파일한 뒤, 스택 기반 가상 머신(PVM)이 바이트코드를 하나씩 해석해 실행합니다. __pycache__ 폴더의 .pyc 파일이 그 바이트코드 캐시이고, 덕분에 OS와 무관하게 이식성이 높습니다."
  - q: Python은 메모리를 어떻게 관리하나요?
    a: "모든 값은 type, refcount, value를 가진 객체로 힙에 저장되고, 참조 수가 0이 되면 바로 해제됩니다. 서로를 참조하는 순환 참조는 참조 카운팅만으로 지울 수 없어서 Cycle Detector(gc 모듈)가 주기적으로 찾아 해제합니다."
  - q: 가상환경(venv)은 왜 쓰나요?
    a: "프로젝트마다 필요한 패키지 버전이 달라서 전역 설치를 하면 충돌이 납니다. venv로 프로젝트별 인터프리터와 패키지를 격리하고, requirements.txt(또는 pyproject.toml + lock 파일)를 커밋하면 팀원 누구나 같은 환경을 재현할 수 있습니다. ModuleNotFoundError의 대부분은 venv 활성화 여부와 인터프리터 경로 문제입니다."
related: [comprehension-generator, gil-concurrency, code-quality-testing]
source: Day1 (8/6) 슬라이드 p.16–32 (인터프리터, 실행 흐름, AST와 dis, 바이트코드, PVM, 메모리 모델, venv 환경 구성), p.125 (인터프리터 vs 컴파일러), IDE 가이드 p.3–9 (uv, pyproject.toml)
---

```flow
소스코드 (.py) :: 개발자가 작성
파싱 → AST :: Lexer로 토큰화 후 문법 트리 생성, 문법 오류 감지 (ast 모듈)
컴파일 → 바이트코드 (.pyc) :: __pycache__에 캐시, OS 독립 중간 표현 (py_compile)
PVM 실행 :: 스택 기반 VM이 opcode + 인자를 하나씩 해석·실행
결과 · 예외 :: Traceback은 PVM 실행 스택을 그대로 보여줌
```

```python
import dis
def add(x, y): return x + y
dis.dis(add)
# LOAD_FAST x → LOAD_FAST y → BINARY_OP (+) → RETURN_VALUE
# x, y를 스택에 올리고, 두 값을 pop해 더한 결과를 push 후 반환
```

```compare
인터프리터 (Python) | 컴파일러 (C, Java)
실행 방식 | 한 줄씩 해석하며 실행 | 전체를 번역한 뒤 실행
속도 | 느림 (실시간 해석) | 빠름 (미리 번역)
오류 발견 | 실행 중 발견 | 컴파일 단계에서 발견
장점 | REPL로 대화형 탐색, 데이터 분석에 적합 | 성능, 저수준 제어
```

> [!tip] 면접 팁
> "실행 구조를 알면 왜 컴프리헨션이 빠른지, 왜 Polars가 Pandas보다 빠른지(Rust, 멀티스레드) 설명할 수 있다"로 연결하면 좋다. 2026 기준 환경 도구는 pip + venv를 통합한 uv (`uv init`, `uv add`, `uv sync`)와 pyproject.toml이 표준으로 소개됨.
