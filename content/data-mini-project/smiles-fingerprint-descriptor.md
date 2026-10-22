---
title: 분자 표현 — SMILES · Fingerprint · Descriptor
en: Molecular Representation (SMILES, ECFP/FCFP/PTFP, RDKit Descriptors)
summary: 화합물 구조를 문자열(SMILES), 부분구조 유무 비트 벡터(Fingerprint), 물리화학 수치(Descriptor)로 바꿔 머신러닝 입력으로 쓴다
importance: 3
order: 2
tags: [SMILES, Fingerprint, ECFP, Descriptor, RDKit, clogP]
keypoints:
  - SMILES는 원자·결합·고리·방향족·가지를 한 줄 문자열로 (CO₂ → O=C=O), 분자의 고유 이름표
  - Fingerprint는 분자 안 작은 조각의 유무를 1,024칸 0/1로 기록, ECFP(원소)·FCFP(기능 역할)·PTFP(경로 패턴)
  - "Descriptor 4개: MolWt(분자량), clogP(지용성), sa_score(합성 난이도 1~10), qed(약물 유사성)"
qa:
  - q: 분자를 머신러닝 입력으로 어떻게 바꾸나요?
    a: "SMILES 문자열을 RDKit으로 분자 객체로 파싱한 뒤 두 종류의 피처를 만듭니다. Fingerprint는 각 원자 주변의 부분구조가 있으면 1, 없으면 0인 고정 길이 이진 벡터라 유사도 검색과 분류에 바로 쓰이고, Descriptor는 분자량, 지용성(logP), 합성 난이도, 약물 유사도 같은 연속형 물성 값입니다. 이 과제의 train.csv에는 세 가지 지문 각 1,024비트와 서술자 4개가 미리 계산되어 있었습니다."
  - q: ECFP, FCFP, PTFP는 어떻게 다른가요?
    a: "ECFP는 각 원자에서 2칸 안의 주변 원자 모양을 원소 이름(C, N, O)으로 구분해 구조 유사성을 봅니다. FCFP는 같은 범위를 보되 원소 대신 수소결합 주개·받개 같은 기능적 역할로 구분해 O와 N이 같은 역할이면 같은 원자로 봅니다. PTFP는 결합을 따라 최대 7칸까지 이어지는 경로 패턴의 유무를 기록합니다. 셋 다 같은 조각이 여러 번 나와도 1이고, 입체 방향(3차원 배치)은 구분하지 못합니다."
  - q: Fingerprint의 한계를 데이터에서 확인한 적이 있나요?
    a: "SMILES는 다른데 지문이 완전히 같은 행이 534개(241그룹)였고, 그중 33그룹은 라벨까지 서로 달랐습니다. 대부분 거울상인 입체이성질체로, ECFP가 chirality 없이 생성되어 구분하지 못한 것이 원인이었습니다. 그래서 같은 그룹이 Train과 Validation에 나뉘지 않도록 GroupKFold를 검토하고, 입체정보를 포함한 chiral ECFP를 추가 피처로 만들었습니다."
related: [toxicity-problem-framing, toxicity-eda-findings, cv-threshold-ensemble, feature-engineering/feature-creation]
source: 10/19 슬라이드 p.8–10 (SMILES 표기법, Fingerprint, ECFP·FCFP·PTFP), p.13 (Train 데이터 속성), p.16 (Descriptor, RDKit·Mordred), 5조 EDA 보고서 p.6–8 (FP 비교, SMILES는 다른데 FP는 같은 케이스), 챌린지 quality_summary
---

```compare
ECFP | FCFP | PTFP
무엇을 보나 | 각 원자와 2칸 안 주변 원자 모양 | ECFP와 같은 범위 | 결합을 따라 최대 7칸 경로
원자 구분 기준 | 원소 이름 (C, N, O) | 기능적 역할 (수소결합 주개·받개, 이온화) | 원소 이름
에탄올(C-C-O)에서 찾는 조각 | C 하나 / C에 C가 붙은 모양 등 | 같은 모양을 역할로 표시 | C-C / C-O / C-C-O
구분하지 못하는 것 | 조각 개수, 먼 원자 관계, 입체 방향 | ECFP 한계 + 역할이 같은 다른 원소 | 7칸보다 긴 경로, 입체 방향
```

| Descriptor | 의미 | 범위·해석 |
| --- | --- | --- |
| MolWt | 분자량, 탄소 기준 상대 원자 질량의 합 | 염(salt) 포함 시 상대이온만큼 부풀려짐 |
| clogP | 계산된 분배계수, 지용성 | 높을수록 지용성, 이 과제에서 독성과 가장 강한 연관 |
| sa_score | 합성 가능성 (Synthetic Accessibility) | 1 = 쉬움 ~ 10 = 어려움 |
| qed | 약물 유사성 (Drug-likeness) | 0~1, 높을수록 약물다움 |

> [!warn] 헷갈리기 쉬움
> 피처가 계산값이라 결측이 구조적으로 0건이었다 (SMILES 8,349개 100% 파싱). 대신 "같은 분자의 다른 표기(clogP 차이 9.45)", "염 포함 262행(MolWt 평균 +62.6)"처럼 계산 전 표준화 문제가 숨은 품질 이슈였다.
