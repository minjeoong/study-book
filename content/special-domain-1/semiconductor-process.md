---
title: 반도체 공정 — 전공정과 후공정
en: Front-end (FAB) and Back-end (Packaging) Process
summary: "웨이퍼 위에 회로를 새기는 전공정(약 8주·900공정)과 칩을 잘라 포장·테스트하는 후공정(약 4주·300공정)"
importance: 2
order: 3
tags:
  - 반도체
  - 공정
  - 패키징
keypoints:
  - "8대 공정: 노광·식각·세정·CMP·증착·금속·확산·이온주입 + 계측(MI)"
  - "찍고(Photo) → 깎고(Etch) → 채우고(CVD·Metal) → 불순물 넣고 → 들여다본다"
  - "패키지 목적: 전원 공급, 신호 연결, 열 방출, 외부 보호"
qa:
  - q: "반도체 8대 공정을 설명해 보라."
    a: "웨이퍼 제조와 산화로 시작해, 감광액을 바르고 빛으로 회로 설계도를 찍는 노광(Photo), 필요 없는 부분을 깎아내는 식각(Etch)과 세정, 깎은 곳에 물질을 채우는 증착(CVD)과 금속 배선, 표면을 평탄하게 가는 CMP, 전기적 특성을 만들려고 불순물을 넣는 확산과 이온주입을 반복한다. 사이사이 계측·검사(MI)로 선폭과 정렬을 들여다본다. DRAM은 설계도(마스크) 약 40장을 900개 공정으로 쌓는다."
  - q: "후공정(패키징)은 왜 하고 어떻게 바뀌고 있나?"
    a: "패키지는 칩에 전원을 공급하고, 칩과 메인 PCB 사이 신호를 연결하고, 칩에서 나는 열을 방출하고, 습기·불순물로부터 칩을 보호한다. 연결 방식은 리드프레임에서 솔더볼을 쓰는 BGA, 칩을 뒤집어 범프로 붙이는 Flip chip으로 바뀌며 처리 가능한 신호 수가 100개 미만에서 1,000개 이상으로 늘었다. 지금은 전·후공정이 겹치는 WLP(Wafer Level Packaging)와 첨단 패키징으로 가고 있다."
related:
  - semiconductor-value-chain
  - smart-factory-ai
  - hbm-advanced-packaging
source: "2026-09-04 특강 교안 p.58–70 (전공정과 후공정, 8대 공정, FAB Process modeling, 후공정 흐름, 패키지 변화), p.31–32 (공정별 장비 기업과 점유율)"
---

```flow
노광 (Photo) :: 설계도를 찍는다 — EUV·ArF 스캐너, 감광액(PR)
식각 · 세정 (Etch, Clean) :: 설계도대로 깎아낸다 — Ashing·Strip으로 PR 제거
증착 · 금속 · CMP (CVD, Metal) :: 깎아낸 곳에 물질을 채우고 평탄화
확산 · 이온주입 (Diffusion, IMP) :: 불순물을 주입한다
계측 (MI) :: 들여다본다 — CD, Overlay 검사
```

```flow
Back Grinding → Sawing :: 웨이퍼 뒷면을 얇게 갈고 개별 다이로 자른다
Die Attach → Wire Bonding :: 기판에 칩을 붙이고 금선으로 전기 연결
Molding → Marking :: EMC로 감싸고 레이저로 제품 정보 각인
Solder Ball Mount → PKG Sawing :: 솔더볼로 외부 단자를 만들고 개별 반도체로 절단
```

| 공정 | 대표 장비사 (해외 / 국내) | 포인트 |
| --- | --- | --- |
| 노광 EUV | ASML / 없음 | 점유율 100% 독점 |
| 식각 | Lam Research, TEL, AMAT / 세메스 | Lam 1위, 7nm 이하 초미세 식각 |
| 증착 CVD · ALD · PVD | AMAT, ASMI, TEL / 원익IPS, 주성, 유진테크 | CVD·PVD는 AMAT, ALD는 ASMI 선도 |
| 세정 | Screen, TEL / 세메스, 제우스 | Screen 약 40% |
| CMP | AMAT, Ebara / 케이씨텍 | AMAT 글로벌 리더 |
| 그라인딩 · 쏘잉 | DISCO / 한미반도체 | DISCO 70~80% |
| TC 본더 (HBM) | ASMPT / 한미반도체, 세메스 | 한미반도체 독보적 공급 실적 |
| 하이브리드 본더 | Besi-AMAT 연합 / 한미반도체(개발 중) | 차세대 시장 선점 경쟁 |

- 패키지 변화: Lead frame(와이어 본딩, 신호 100개 미만, 메모리) → BGA(PCB + 솔더볼, 500~600개) → Flip chip(범프 + Underfill, 1,000개 이상, S.LSI) → WLP
