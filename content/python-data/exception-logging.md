---
title: 예외 처리, 로깅, 환경변수
en: Exception Handling, logging, .env
summary: try-except-else-finally로 실패를 다루고, print 대신 레벨·핸들러가 있는 logging으로 흐름을 남기며, 비밀값은 .env로 코드 밖에 둔다
importance: 2
order: 5
tags: [예외처리, logging, 파일 I/O, dotenv, 보안]
keypoints:
  - except는 구체적인 예외부터 잡고, else는 성공했을 때, finally는 항상 실행 (파일·연결 정리)
  - 도메인 오류는 Exception을 상속한 사용자 정의 예외로 표현하고 raise로 상위에 전파
  - logging은 5단계 레벨 + 핸들러별 출력 대상·레벨·포맷, API 키는 .env + .gitignore
qa:
  - q: 오류(Error)와 예외(Exception)의 차이는?
    a: "괄호를 안 닫은 SyntaxError처럼 실행 전에 발생하는 문법 오류는 코드를 고쳐야만 해결됩니다. 반면 ZeroDivisionError, FileNotFoundError, KeyError처럼 실행 중에 발생하는 예외는 try-except로 잡아 프로그램을 계속 실행할 수 있습니다."
  - q: 왜 print 대신 logging을 쓰나요?
    a: "print는 레벨 구분도 저장도 안 되어 운영 환경에서 문제를 추적할 수 없습니다. logging은 DEBUG·INFO·WARNING·ERROR·CRITICAL 레벨로 개발용과 운영용 로그를 나누고, 콘솔에는 INFO 이상, 파일에는 DEBUG까지, error.log에는 ERROR만 따로 저장하며 날짜별 회전(TimedRotatingFileHandler)도 됩니다."
  - q: API 키나 DB 비밀번호는 어떻게 관리하나요?
    a: "코드에 하드코딩하면 GitHub에 올라가는 순간 보안 사고가 납니다. .env 파일에 두고 python-dotenv의 load_dotenv()와 os.getenv()로 읽으며, .env는 .gitignore에 넣고 키 이름만 적은 .env.example을 공유합니다. CI/CD에서는 GitHub Actions Secrets로 대체합니다."
related: [closure-decorator, type-hints-pydantic, automation-project-structure]
source: Day1 (8/6) 슬라이드 p.126–130 (파일 읽기·쓰기, CSV·JSON·Parquet, pathlib), p.147–152 (오류와 예외, try-except, 사용자 정의 예외, 파이프라인 안정성 패턴), p.153–159 (logging 레벨, 핸들러 구조), p.160–166 (.env, 환경변수, 보안), Practice 2 (safe_load_csv)
---

```flow
try :: 예외가 날 수 있는 코드 (파일 열기, API 호출, 변환)
except 구체적 예외 :: FileNotFoundError → None 반환 + logger.error, 넓은 Exception은 마지막에
else :: 예외 없이 성공했을 때만 실행
finally :: 성공·실패와 무관하게 항상 실행 (로딩 종료 로그, 연결 닫기)
```

```python
class DataValidationError(ValueError):            # 도메인 예외
    def __init__(self, col, val):
        super().__init__(f"{col}={val} 검증 실패")

def safe_load(path: Path):
    try:
        df = pd.read_parquet(path)
        if df.empty:
            raise DataValidationError("rows", 0)
        return df
    except FileNotFoundError:
        logger.error(f"파일 없음: {path}")
        return None
    except DataValidationError as e:
        logger.warning(str(e))
        return None
    finally:
        logger.info(f"로딩 시도: {path}")
```

```layers
Logger (getLogger, DEBUG) :: 로그를 만들어 핸들러들로 보냄
ConsoleHandler :: INFO 이상만 화면 출력
FileHandler app.log :: DEBUG 이상 전부, 자정마다 회전 (backupCount=7)
FileHandler error.log :: ERROR 이상만 별도 저장
```

> [!tip] 면접 팁
> 파일은 `with open(..., encoding="utf-8")`로 열어 자동으로 닫고, 경로는 pathlib.Path로 다룬다. 한글 JSON 저장은 `json.dump(..., ensure_ascii=False)`를 빼먹지 말 것 (실습 감점 항목).
