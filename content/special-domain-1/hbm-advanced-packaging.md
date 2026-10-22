---
title: HBM과 첨단 패키징
en: HBM (High Bandwidth Memory), TSV, MR-MUF, TC-NCF, Hybrid Bonding
summary: "DRAM 다이를 수직으로 쌓고 TSV로 관통 연결해 대역폭을 키운 AI용 메모리 — 적층 공법(MR-MUF vs TC-NCF)과 패키징이 경쟁력"
importance: 3
order: 5
tags:
  - 반도체
  - HBM
  - 패키징
  - AI 인프라
keypoints:
  - "HBM = DRAM 다이 적층 + TSV + 베이스(로직) 다이, 인터포저 위에서 GPU 옆에"
  - "MR-MUF(일괄 리플로우 + 액상 몰딩, 열 방출) vs TC-NCF(필름 + 열압착, 한 층씩)"
  - "16단부터 하이브리드 본딩, 패키징은 Cost center → Profit center"
qa:
  - q: "HBM이란? 왜 AI에 필요한가?"
    a: "여러 장의 DRAM 다이를 수직으로 쌓고 실리콘을 관통하는 전극(TSV)으로 연결해 데이터 통로 수를 크게 늘린 고대역폭 메모리다. 기존 와이어 본딩 멀티칩 패키지는 전송 경로 수에 제약이 있었지만 TSV로 이를 넘었다. AI 가속기는 연산보다 데이터를 나르는 대역폭이 병목이라, 인터포저 위에서 GPU 바로 옆에 붙는 HBM이 필수가 됐다. 강의 자료 기준 AI 랙 원가에서 HBM이 약 30%로 GPU(약 50%) 다음으로 크다."
  - q: "MR-MUF와 TC-NCF의 차이는?"
    a: "TC-NCF는 칩마다 비전도성 필름(NCF)을 깔고 열과 압력으로 한 층씩 눌러 붙이는 방식으로, 적층 단수 확대와 웨이퍼 휨 최소화에 유리하지만 필름 두께 제어가 어렵고 Die slip·Bump crack이 생길 수 있다. MR-MUF는 칩을 쌓은 뒤 오븐에서 솔더볼을 한 번에 녹여 붙이고(Mass Reflow) 칩 사이를 액상 몰딩재로 채우는(Molded Underfill) 방식이라 대량 생산과 열 방출에 유리하지만 고열로 인한 Warpage가 약점이다. SK하이닉스는 임시 접합으로 Warpage를 잡은 Advanced MR-MUF로 HBM3·3E 세대에서 앞섰다."
  - q: "HBM과 패키징은 앞으로 어디로 가나?"
    a: "HBM4의 12~16단부터는 범프 없이 구리와 구리를 직접 붙이는 하이브리드 본딩이 거론된다. 무어의 법칙이 한계에 다다르면서 성능·전력·면적·비용(PPAC)을 칩렛과 이기종 집적(Heterogeneous Integration)으로 개선하는 패키지 주도 기술이 중요해졌고, 기판도 PCB → RDL·WLP → 유리기판(2028년 상용화 목표)으로 미세화되고 있다. 그래서 패키징은 비용 부서에서 이익을 만드는 부서로 바뀌고 있다."
related:
  - memory-vs-system-semiconductor
  - semiconductor-process
  - semiconductor-supply-chain-strategy
source: "2026-09-04 특강 교안 p.107–110 (미세화 → 3D·소자·Package, Tech node, DRAM 생산 점유율), p.111–124 (AI 데이터센터 수요, AI 랙 원가, 로드맵, HBM 구조·적층 방식·시장 규모), p.125–129 (첨단 패키징)"
---

```layers
HBM DRAM Die × 4~16단 :: TSV(실리콘 관통 전극)와 Microbump로 수직 연결
Logic (Base) Die :: 맨 아래 로직 다이 — DRAM 스택과 GPU 사이 신호 처리
Silicon Interposer :: 1㎛급 배선 — HBM과 GPU·SoC를 나란히 연결
Package Substrate :: 10㎛급 PCB 기판 → 보드로
```

```compare
TC-NCF | MR-MUF
방식 | 칩마다 NCF 필름 + 열·압력으로 한 층씩 접합 | 쌓은 뒤 한 번에 리플로우 + 칩 사이 액상 몰딩재 주입
장점 | 적층 단수 확대에 용이, 웨이퍼 휨 최소화 | 대량 생산 유리, 열 방출 우수
단점 | 필름 두께·물성 제어 어려움, Die slip·Bump crack | 고열로 Warpage, 칩이 얇고 단수가 늘수록 심화
```

- Advanced MR-MUF: 층을 쌓을 때마다 순간 열로 임시 접합해 Warpage를 잡고(MR-MUF 단점 보완), 방열이 개선된 새 몰딩 소재로 수율·열 방출을 높여 생산성을 기존 대비 3배로(TC-NCF 대비 강점)

| 세대 | 적층 방식 | 적층 단수 | 상대 열저항 |
| --- | --- | --- | --- |
| HBM2 | TC-NCF | 4Hi / 8Hi | 1.0 |
| HBM2E · HBM3 | MR-MUF | 4Hi / 8Hi | 0.65 · 0.55 |
| HBM3 12Hi · HBM3E | Advanced MR-MUF | 8Hi / 12Hi | 0.5 |
| HBM4 | Advanced MR-MUF 또는 Hybrid Bonding (TBD) | 12Hi / 16Hi | 0.4–0.5 |

- AI 랙 1개(약 450억 원) 원가: GPU 50% · HBM 30% · 광기술(Transceiver·CPO) 12% · 기판·첨단 패키징·냉각 8%
- HBM 시장 규모: 2024년 143억 달러 → 2029년 418억 달러 전망(Yole) — 적층 기술 수요가 커질수록 Advanced MR-MUF의 중요성도 커짐
- DRAM 웨이퍼 생산 비중: 삼성 : SK하이닉스 : 마이크론 : 중국 = 4 : 3 : 2 : 1, 2030년 중국이 약 18%까지 확대 전망

> [!tip] SK 면접 포인트
> "HBM 경쟁력은 D램 셀만이 아니라 쌓고 붙이는 패키징 공법에서 나온다" — MR-MUF의 열 방출 강점, 그리고 16단 이후 하이브리드 본딩 전환이 다음 격차 포인트. 열저항 표의 숫자가 왜 MR-MUF를 택했는지 보여준다.
