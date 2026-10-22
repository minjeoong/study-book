---
title: 분석 자동화와 코드 구조화
en: Automation, ETL Pipeline, Project Structure
summary: 반복 분석은 schedule·Jinja2로 자동화하고, 노트북(탐색)과 src 모듈(재사용)을 분리해 누구나 같은 결과를 재현하는 프로젝트로 만든다
importance: 1
order: 13
tags: [자동화, ETL, Jinja2, 프로젝트 구조, 재현성]
keypoints:
  - 좋은 파이프라인은 단계 분리 + 오류 기록 + 재현 가능 + 테스트 가능
  - schedule·cron으로 주기 실행, Jinja2 템플릿에 결과를 주입해 리포트 자동 생성
  - 노트북은 탐색, 검증된 함수는 src/로 모듈화, data/raw는 git 제외, README·requirements로 재현
qa:
  - q: Jupyter 노트북과 .py 스크립트는 언제 각각 쓰나요?
    a: "노트북은 EDA, 시각화 중심의 탐색, 한 번 실행으로 끝나는 분석, 교육 자료에 적합합니다. 반복 실행 자동화, Git 버전 관리와 pytest, 코드 리뷰, CI/CD 통합이 필요한 코드는 .py로 둡니다. 노트북에서 검증된 함수는 src/clean.py 같은 모듈로 옮기고 노트북은 그것을 import해서 씁니다."
  - q: 재현 가능한 분석을 위해 무엇을 남기나요?
    a: "requirements.txt(또는 lock 파일), .env.example, README의 실행 가이드 세 가지가 있으면 누구나 같은 환경과 결과를 재현할 수 있습니다. 원본 데이터는 data/raw에 두고 절대 수정하지 않으며 git에 올리지 않고 출처 URL이나 다운로드 스크립트를 README에 기록합니다. random_state 고정과 실행 로그도 함께 남깁니다."
  - q: 리포트를 자동화하면 무엇이 좋은가요?
    a: "매주 수작업으로 만들던 리포트가 0분이 되고, 복붙 오류가 사라지며, 같은 코드가 항상 같은 결과를 냅니다. 지역이 10개든 100개든 코드는 같아서 확장 비용이 거의 없습니다. 실습에서는 각 단계가 반환한 값을 그대로 report.md 템플릿에 넣어 화면 출력과 문서 수치가 항상 일치하게 했습니다."
related: [code-quality-testing, exception-logging, stats-to-ml-pipeline]
source: Day2 (8/7) 슬라이드 p.303–308 (자동화의 이유, schedule·cron, Jinja2 리포트, LLM API 구조, ETL 원칙), p.309–314 (Jupyter vs .py, 폴더 구조, 모듈화, README·GitHub, 구조화 원칙), Day2 종합실습 (report.md 자동 생성)
---

```flow
Extract :: API·DB·파일에서 수집, 건수 로깅
Validate :: Pydantic 스키마 검증, 오류 건수 경고
Transform :: 정제·집계 (각 단계는 독립 함수 → pytest 가능)
Load · Report :: Parquet·DB 저장, Jinja2로 리포트 생성, 실패 시 어느 단계인지 로그로 즉시 파악
```

```layers
data/raw · processed · external :: 원본은 수정 금지, git 제외
notebooks/ :: 01_eda.ipynb, 02_feature_exploration.ipynb (탐색·실험)
src/ :: __init__.py, clean.py, viz.py, run_pipeline.py (재사용 모듈)
tests/ · outputs/ :: pytest 테스트, 리포트·그림·모델 산출물
README · requirements.txt · .env.example :: 6개월 뒤 동료가 README만 보고 실행 가능해야 함
```

- 스케줄: `schedule.every().day.at("08:00").do(run_daily_report)`, OS 레벨은 cron·launchd
- LLM API는 벤더가 달라도 HTTP POST로 메시지 배열 + 모델 파라미터를 보내고 content를 받는 구조, 입력+출력 토큰으로 과금
- 노트북 공유는 `jupyter nbconvert --to html`
