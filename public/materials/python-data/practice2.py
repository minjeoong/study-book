"""
===================================================

제출자 : 판교 9반 P282 김민정
제출일 : 2026.08.06
데이터 분석을 위한 Python 이해 [실습 2]

===================================================


============== 프로그램 설명 ==============
Python_Practice1_Data.json 판매 데이터를 CSV로 변환한 뒤,
safe_load_csv로 로드하고 Pydantic v2 스키마로 검증하여
유효(valid) / 오류(errors) 레코드를 분리·저장하는 파이프라인 프로그램.

- json_to_csv: Python_Practice1_Data.json 전체를 CSV로 변환
- safe_load_csv: 변환된 CSV를 dict 리스트로 로드 (try-except-finally)
- SalesRecord: month·region 비공백, amount > 0, category 선택 필드 검증
- validate_data / save_results: valid·errors 분리 저장 및 재로딩 검증
===================================================
"""

import csv
import json
import logging
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, ValidationError, field_validator

# 로깅 설정 — 파일 I/O 및 검증 결과 추적용
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# 스크립트 기준 경로
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = BASE_DIR / "Python_Practice1_Data.json"
CSV_PATH = BASE_DIR / "Python_Practice1_Data.csv"


# ---------------------------------------------------------------------------
# 0) JSON → CSV 변환
# - Python_Practice1_Data.json 전체를 CSV로 변환 후  사용
# ---------------------------------------------------------------------------
def json_to_csv(json_path, csv_path):
    try:
        with open(json_path, "r", encoding="utf-8") as file:
            all_data = json.load(file)

        fieldnames = ["month", "region", "amount", "category"]
        with open(csv_path, "w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            for row in all_data:
                writer.writerow({
                    "month": row["month"],
                    "region": row["region"],
                    "amount": row["amount"],
                    "category": row.get("category") or "",
                })
        logger.info("JSON -> CSV 변환 완료: %s -> %s", json_path, csv_path)
    except FileNotFoundError as e:
        logger.error("변환할 JSON 파일을 찾을 수 없습니다: %s", e)
        raise
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("JSON -> CSV 변환 오류: %s", e)
        raise


# ---------------------------------------------------------------------------
# 1) 예외 처리 + 파일 읽기
# - 함수명 : safe_load_csv()
# - 완성파일 없으면 None 반환·logger.error , 성공 시 dict 리스트 반환·logger.info, finally에서 '로딩 종료' 출력
# - point) safe_load_csv 동작 + assert None 통과
# - caution) try-except 없이 파일 읽기 (-3)
#            finally 블록 누락 (-1)
# ---------------------------------------------------------------------------
def safe_load_csv(file_path):
    data = None
    logger.info("파일 로드 시작: %s", file_path)
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            data = [dict(row) for row in reader]
        logger.info("파일 로드 성공: %s (%d건)", file_path, len(data))
    except FileNotFoundError as e:
        logger.error("파일을 찾을 수 없습니다: %s", e)
        return None
    except Exception as e:
        logger.error("파일 읽기 오류: %s", e)
        return None
    finally:
        print("로딩 종료")
    return data


# ---------------------------------------------------------------------------
# 2) Pydantic v2 스키마 정의
# - SalesRecord 모델을 완성
# - month, region: 비어있으면 안 됨
#   amount: 0 초과
#   category: 없어도 됨
# ---------------------------------------------------------------------------
class SalesRecord(BaseModel):
    month: str
    region: str
    amount: float
    category: Optional[str] = None

    @field_validator("month", "region")
    @classmethod
    def must_not_be_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("값이 비어 있으면 안 됩니다.")
        return value.strip()

    @field_validator("amount")
    @classmethod
    def must_be_positive(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("amount는 0보다 커야 합니다.")
        return value


# ---------------------------------------------------------------------------
# 3) 검증 파이프라인 (valid / errors 분리)
# -     raw_data를 순회하며 SalesRecord로 변환
# - 성공 -> model_dump() 결과를 valid에 추가
# - 실패 -> ValidationError 내용 출력 후 errors에 {row, error} 추가
# ---------------------------------------------------------------------------
def validate_data(raw_data):
    valid = []
    errors = []

    for row in raw_data:
        # amount 빈 문자열/숫자 아닌 값도 pydantic이 캐스팅·검증을 같이 처리하도록
        # 미리 float() 변환하지 않고 원본 str 그대로 SalesRecord에 넘긴다.
        if row.get("category") == "":
            row["category"] = None

        try:
            record = SalesRecord(**row)
            valid.append(record.model_dump())
        except ValidationError as e:
            print(f"[ValidationError] row={row}\n{e}")
            errors.append({"row": row, "error": str(e)})

    return valid, errors


# ---------------------------------------------------------------------------
# 4) 결과 파일 저장 + 재로딩 확인
# - caution) model_dump() 대신 dict 직접 구성 (-1)
#            json.dump ensure_ascii=False 미설정 (한글 깨짐,-1)
# ---------------------------------------------------------------------------
def save_results(valid, errors, valid_csv_path, errors_json_path):
    try:
        # valid -> CSV 저장
        fieldnames = ["month", "region", "amount", "category"]
        with open(valid_csv_path, "w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(valid)

        # errors -> JSON 저장
        with open(errors_json_path, "w", encoding="utf-8") as file:
            json.dump(errors, file, ensure_ascii=False, indent=2)
        logger.info("결과 저장 완료: valid=%s, errors=%s", valid_csv_path, errors_json_path)
    except OSError as e:
        logger.error("결과 저장 오류: %s", e)
        raise

    # 재로딩 후 건수 검증용
    reloaded = safe_load_csv(valid_csv_path)
    return reloaded


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    valid_path = BASE_DIR / "valid_output.csv"
    errors_path = BASE_DIR / "errors_output.json"

    # JSON → CSV 변환 후 1번 작업(safe_load_csv) 실행
    json_to_csv(JSON_PATH, CSV_PATH)

    # 1) 변환된 CSV 로드
    raw_data = safe_load_csv(CSV_PATH)
    assert raw_data is not None, f"CSV 로드 실패: {CSV_PATH}"
    logger.info("CSV 로드 성공: %s (%d건)", CSV_PATH, len(raw_data))

    # 2~4) 검증 및 저장
    valid, errors = validate_data(raw_data)
    reloaded = save_results(valid, errors, valid_path, errors_path)

    # 재로딩 건수 == valid 건수
    assert len(reloaded) == len(valid), f"재로딩 {len(reloaded)}건 != valid {len(valid)}건"

    print(f"\n검증 완료 — valid: {len(valid)}건, errors: {len(errors)}건, 재로딩: {len(reloaded)}건")
