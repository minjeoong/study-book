---
title: 반도체 FAB 운영과 제조 AI
en: Semiconductor FAB, Facility Maintenance, Manufacturing AI (TTTM)
summary: "가장 작은 스위치를 가장 거대한 FAB에서 — 설비 유지보수(PM·BM·CM)와 데이터 표준화(TTTM) 위에서 이상 탐지·분류·예측·처방 AI를 쓴다"
importance: 3
order: 4
tags:
  - 반도체
  - 스마트 팩토리
  - 제조 AI
keypoints:
  - "FAB(공조·Main FAB) — CSF(부대장비) — FSF(인프라) 수직 구조, 순도·진동·습도 관리"
  - "설비 관리: PM 예방보전 → BM 고장수리 → CM 개조개선"
  - "제조 AI 4단계: 데이터·직무 정의 → 도메인 지식 → ML·LLM 의사결정 → 업무 재배치"
qa:
  - q: "반도체 제조에서 AI는 어디에 쓰이나?"
    a: "센서 시계열(FDC)로 장비 이상을 잡는 이상 탐지, 웨이퍼 맵의 불량 패턴을 묶는 클러스터링, 결함 이미지를 자동 분류하는 분류, 측정하지 않은 웨이퍼 값을 추정하는 가상 계측과 칩 품질 예측, 머신러닝으로 장비 조건을 자동 보정하는 처방(APC)이 대표적이다. 분석은 해석 → 진단 → 예측 → 규칙 → 자동화로 갈수록 어렵고 가치도 커진다. 삼성은 CNN으로 웨이퍼 BIN 맵을 분류하고 원인을 찾는 알고리즘을 개발한 사례가 있다."
  - q: "제조 현장에 AI를 도입할 때 가장 먼저 확인할 것은?"
    a: "모델보다 데이터와 직무다. 강사는 4단계를 제시했다. 데이터가 있고 직무가 정의되어 있는가, Bayesian 같은 도메인 지식이 있는가, LLM·DL·ML로 의사결정하고 실제로 추진하는가, 자동화된 업무 재배치와 인적자원 전환까지 가는가. 반도체는 '디지털이 아닌 아날로그, 이미지가 아닌 물질'이라 제품은 자동화를 이끌지만 제조 기술은 가장 자동화되지 않은 영역이고, 그래서 도메인 지식이 데이터만큼 중요하다."
  - q: "TTTM이란?"
    a: "Tool-to-Tool Matching으로, 같은 공정을 하는 장비 간 차이를 없애기 위해 장비 데이터를 연결하는 5단계 정보 체계다. 물질·배관 정보(Gas, Chemical, UPW의 유량·압력) → 장비 하드웨어(Chamber, Robot, 센서·구동 상태) → 장비별 최적 운전 조건인 BKM(Recipe, SPC 기준) → Fab 전체 운영 데이터 → 수율·Electrical Test 결과로 이어진다. 이 연결과 표준화가 공정 최적화와 수율 향상의 기반이다."
related:
  - semiconductor-process
  - hbm-advanced-packaging
source: "2026-09-04 특강 교안 p.71–76 (설계·공정·설비·품질 직무), p.77–92 (스마트 팩토리의 변화: FAB 구조, 장비 분류, Materials for Purity, 설비 관리, 파티클 원인), p.93–101 (반도체에서 AI 활용, TTTM, 데이터 분석 방식)"
---

```layers
공조 (Plenum) :: 청정도 관리 — Class 숫자 = 1ft³당 0.5㎛ 이상 먼지 개수
Main FAB :: FAB 장비 — 웨이퍼에 직접 반응, FOUP로 웨이퍼 이송
CSF (Clean Sub FAB) :: 부대장비 — Pump(압력), Chiller(온도), Scrubber(반응 불순물)
FSF (Facility Sub FAB) :: 인프라 — UPW·DI 용수, UPS 전력, Gas·Chemical·Slurry(GCS) 공급
```

```flow
1단계 물질 · 배관 :: Gas, Chemical, Slurry, UPW의 유량·압력
2단계 장비 HW :: Chamber, Robot, PLC — 온도·압력·진동
3단계 장비 BKM :: Recipe, Process Window, SPC 기준·인터락 조건
4단계 Fab Data :: 장비·공정·품질·물류 데이터 통합
5단계 수율 · ET :: Yield, Electrical Test, Lot별 품질 지표
```

| 분석 방식 | 반도체 적용 |
| --- | --- |
| 이상 탐지 (Outlier Detection) | 센서 데이터로 장비 이상 탐지 (FDC) |
| 클러스터링 | 웨이퍼 맵 불량 패턴 그룹핑 |
| 분류 | 이미지에서 불량 탐지·자동 분류 |
| 예측 | 테스트 효율화를 위한 칩 품질 점수 예측, 미측정 값을 추정하는 가상 계측 |
| 처방 | 머신러닝 기반 최적 장비 제어 (APC, Advanced Process Control) |

> [!tip] 설비 관리 용어
> PM(Preventive, 예방보전) → BM(Breakdown, 고장수리) → CM(Corrective, 개조개선). 공정은 제품 세대마다 약 25% 바뀌어, 이상적으로는 센서 기반 설비 진단으로 PM 주기를 늘리고 CM으로 성능을 올려야 하지만 현실은 단순 대응에 머물기 쉽다. 파티클 원인은 기계적(마모·크랙), 화학적(과반응·산화), 소스(잔류·역류오염), 전기적(정전기·플라즈마 아킹)으로 나눠 분석한다.
