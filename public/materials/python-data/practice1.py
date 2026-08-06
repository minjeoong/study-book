# ===================================================
# ========== [ 제출자 : 판교 9반 P282 김민정 ] =========
# ============= [ 제출일 : 2026.08.06 ] ============= 
# ====== 데이터 분석을 위한 python 이해 - 심화 실습 ======
# ===================================================

import json
import logging
import sys
from collections import Counter, defaultdict
from pathlib import Path

# 추가적인 부분
# - 오류와 에러처리 + 로그 남기는 것.
# - try  catch, except 

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

DATA_PATH = Path(__file__).parent / "Python_Practice1_Data.json"


def load_data():
    try:
        with open(DATA_PATH, encoding="utf-8") as file:
            data = json.load(file)
        if not isinstance(data, list):
            raise ValueError("sales 데이터는 리스트여야 합니다.")
        logger.info("데이터 %d건 로드 완료", len(data))
        return data
    except FileNotFoundError:
        logger.error("파일을 찾을 수 없습니다: %s", DATA_PATH)
        raise
    except json.JSONDecodeError as e:
        logger.error("JSON 파싱 오류: %s", e)
        raise



# ===========================================================================

# 1) 리스트/딕셔너리 컴프리헨션
# -  Python_Practice1_Data.json(Sales)
#     리스트에서
#     ① amount ≥ 1000인 거래만 필터링하고,
#     ② 지역별 총매출 dict를 컴프리헨션으로 계산
# - point) region_total 값 정확 (assert 통과)
# - caution) 컴프리헨션 대신 for 루프만 사용 (-2)

print("==============  1 번  ==================")

# 1-1. 데이터 로드
sales = load_data()

if not sales:
    logger.warning("sales 데이터가 비어 있습니다.")

# 1-2. amount >= 1000 인 거래만 필터링
filtered_sales = [sale for sale in sales if isinstance(sale.get("amount"), (int, float)) and sale["amount"] >= 1000]

if not filtered_sales:
    logger.warning("amount >= 1000 조건에 맞는 거래가 없습니다.")

# 1-3. 지역별 총매출 dict를 컴프리헨션으로 계산
region_total = {region: sum(sale["amount"] for sale in filtered_sales if sale["region"] == region) for region in set(sale["region"] for sale in filtered_sales)}
print("\n [지역별 총매출 dict] \n", region_total)

# ===========================================================================

# 2) Counter + defaultdict
# - Counter로 지역별 거래 건수를, defaultdict로 카테고리별 amount 리스트
# - point) Counter.most_common() 순서 정확
# - caution) defaultdict 대신 if key not in dict 패턴 (-1)

print("==============  2 번  ==================")

# 2-1. Counter로 지역별 거래 건수를
if not sales:
    logger.warning("지역별 건수 집계: sales 데이터가 비어 있습니다.")
    region_count = []
else:
    region_count = Counter(sale["region"] for sale in sales if sale.get("region")).most_common()
    if not region_count:
        logger.warning("지역별 건수 집계: 집계할 region 데이터가 없습니다.")
print("\n [지역별 거래 건수] \n", region_count)

# 2-2. defaultdict로 카테고리별 amount 리스트
valid_pairs = [
    (sale["category"], sale["amount"])
    for sale in sales
    if sale.get("category") and isinstance(sale.get("amount"), (int, float))
]
if len(valid_pairs) < len(sales):
    logger.warning("category/amount 없는 행 %d건 제외됨", len(sales) - len(valid_pairs))

category_amount = defaultdict(list)
for category, amount in valid_pairs:
    category_amount[category].append(amount)

if not category_amount:
    logger.warning("카테고리별 amount: 집계 결과가 없습니다.")
    
print("\n [카테고리별 amount 리스트] \n", category_amount)

# ===========================================================================
print("==============  3 번  ==================")

# 3) 제너레이터 - 메모리 비교
# - system.getsizeof() 함수 쓰면 되고 - 어떠한 경우에는 제너레이터가 큰데 이유보다는 확인에 초점
# - amount > 1000 인 행만 yield 하는 제너레이터를 작성하고, 리스트 버전과 메모리 크기를 비교
# - point) generator sys.getsizeof < list 확인
# - caution) 제너레이터를 list로 변환해 비교 (메모리 차이 미확인,-2)

# 3-1. amount > 1000 인 행만 yield 하는 제너레이터
def generator(sales):
    for sale in sales:
        try:
            if sale["amount"] > 1000:
                yield sale
        except (KeyError, TypeError) as e:
            logger.warning("잘못된 거래 데이터 스킵: %s (%s)", sale, e)
            continue

filtered_list = [sale for sale in sales if isinstance(sale.get("amount"), (int, float)) and sale["amount"] > 1000]

if not filtered_list:
    logger.warning("amount > 1000 조건에 맞는 거래가 없습니다.")

# 3-2. 리스트 버전과 메모리 크기 비교
gen_size = sys.getsizeof(generator(sales))
list_size = sys.getsizeof(filtered_list)
print("제너레이터 메모리 크기: ", gen_size)
print("리스트 메모리 크기: ", list_size)
print("제너레이터 < 리스트:", gen_size < list_size)

# ===========================================================================

# 4) 종합 - 월별 카테고리 매출 집계
# - 내림차순
# - (컴프리헨션 + defaultdict)사용
# - sales 데이터를 month,category 기준으로 그룹핑해 총매출 dict를 완성
# - point) top3 금액 내림차순 정렬 정확
# - caution) Counter 대신 직접 루프로 카운팅 (-1)

print("==============  4 번  ==================")

# 4-1. month,category 기준으로 그룹핑
grouped = defaultdict(list)
for sale in sales:
    grouped[sale["month"] + " " + sale["category"]].append(sale)

# 4-2. 컴프리헨션으로 총매출 dict
whole_sales = {month_category: sum(sale["amount"] for sale in grouped[month_category]) for month_category in grouped}
print("\n [총매출 dict] \n", whole_sales)

# 4-3. top3 금액 내림차순 정렬
top3 = Counter(whole_sales).most_common(3)
print("\n [top3 금액 내림차순 정렬] \n", top3)

