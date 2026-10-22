---
title: 코드 품질과 테스트 자동화
en: pytest, Ruff, pre-commit, GitHub Actions CI
summary: pytest로 함수 단위 동작을 검증하고, Ruff·mypy를 pre-commit과 CI에 걸어 품질 검사를 사람 대신 자동으로 돌린다
importance: 2
order: 7
tags: [pytest, Ruff, pre-commit, CI, PEP8, 디버깅]
keypoints:
  - pytest는 test_*.py 파일의 test_ 함수를 자동 탐색, assert로 검증, fixture로 공통 데이터 공유
  - Ruff는 flake8 + black + isort를 하나로 합친 Rust 린터·포매터 (10~100배 빠름)
  - 커밋 직전 pre-commit hook, push 후 GitHub Actions CI로 이중 방어 (커버리지 80% 목표)
qa:
  - q: pre-commit과 CI는 무엇이 다른가요?
    a: "pre-commit은 git commit 직전에 내 로컬에서 Ruff, mypy 같은 검사를 돌려 문제가 있으면 커밋 자체를 막습니다. CI(GitHub Actions)는 push나 PR 시점에 깨끗한 서버 환경에서 의존성을 새로 설치하고 린트와 pytest를 다시 돌리므로, 로컬 설정 차이나 hook을 건너뛴 경우까지 잡아 줍니다."
  - q: 데이터 분석 코드에도 테스트가 필요한가요?
    a: "분석 스크립트도 GitHub에 올리는 순간 팀 자산이고, 6개월 뒤에도 같은 결과가 나와야 신뢰할 수 있습니다. 결측치 처리 함수가 행 수를 유지하는지, 검증 함수가 잘못된 타입을 걸러내는지 같은 핵심 로직을 pytest로 고정해 두면 리팩터링과 리뷰가 쉬워지고, requirements.txt와 함께 재현성을 보장합니다."
  - q: pytest의 fixture와 parametrize는?
    a: "fixture는 여러 테스트가 공유하는 샘플 DataFrame이나 설정을 함수로 만들어 인자로 주입하는 기능입니다. parametrize는 같은 테스트를 여러 입력 케이스로 반복 실행합니다. pytest -v로 상세 결과, -x로 첫 실패에서 중단, --cov로 커버리지를 봅니다."
related: [type-hints-pydantic, automation-project-structure, python-execution-model]
source: Day1 (8/6) 슬라이드 p.190–196 (디버깅, 예외 타입, pdb, flake8·pylint), p.197–206 (프로젝트 구조, pytest, pytest.ini, fixture, pytest-cov), p.207–212 (black, PEP 8), p.213–223 (pre-commit, requirements.txt, GitHub Actions, VS Code, Ruff), IDE 가이드 (uv, pyproject.toml), Day1 종합실습 (pytest·ruff·Git 커밋)
---

```flow
작성 :: src/에 기능, tests/에 test_*.py
pre-commit :: git commit 시 ruff --fix, ruff-format, mypy 자동 실행, 실패하면 커밋 차단
로컬 테스트 :: pytest tests/ -v --cov=src --cov-report=term-missing
push :: GitHub Actions가 checkout → pip install -r → ruff → mypy → pytest
```

```python
import pytest, pandas as pd
from src.clean import clean_nulls

@pytest.fixture
def sample_df():
    return pd.DataFrame({"a": [1, None, 3], "b": ["x", "y", None]})

def test_clean_removes_nulls(sample_df):
    assert clean_nulls(sample_df, cols=["a"])["a"].isna().sum() == 0

def test_shape_preserved(sample_df):
    assert clean_nulls(sample_df).shape[0] == 3   # 행 수 유지
```

| 도구 | 역할 |
| --- | --- |
| pytest / pytest-cov | 단위 테스트 자동 탐색 실행 / 테스트 안 된 줄 확인 |
| black | PEP 8 기반 자동 포매터, 줄 길이 88, "스타일보다 일관성" |
| flake8 · pylint | 스타일·오류 린트 (Ruff가 대체) |
| Ruff | 린트 + 포맷 통합, `ruff check --fix .`, `ruff format .` |
| mypy | 정적 타입 검사 |
| uv + pyproject.toml | pip·venv·poetry 통합 패키지 관리, 설정 파일 하나로 통합 (`uv sync`, `uv lock`) |

> [!tip] 면접 팁
> print 디버깅 대신 VS Code 중단점(F9 → F5)과 변수 인스펙터로 DataFrame 상태를 확인한다. PEP 8의 "8"은 8번째 제안서 번호이지 버전이 아니다.
