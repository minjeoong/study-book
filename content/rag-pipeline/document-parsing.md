---
title: "Document Loader와 문서 파싱"
en: "Document Loading, PDF Parsing, Preprocessing"
summary: "RAG 품질의 출발점 — 원문을 깨짐 없이 읽고, 노이즈를 걷어내고, 표·계층 구조와 메타데이터를 살려 로드"
importance: 2
order: 3
tags:
  - RAG
  - Preprocessing
  - PDF
keypoints:
  - "로더 선택 기준: 한글·특수문자 원형 보존, 메타데이터 범위(page·표·속성), 처리 속도"
  - "텍스트 위주 PyMuPDF·PyPDF, 표 PDFPlumber, 구조 분할 Unstructured — 실험 후 결정"
  - "표 파싱: 단순 표 PdfPlumber, 스캔 표 OCR + 좌표 클러스터링, 중첩 표 VLM + JSON 스키마"
qa:
  - q: "PDF를 RAG에 넣을 때 전처리에서 신경 쓸 점은?"
    a: "먼저 페이지 단위로 파싱해 표나 문단이 페이지 경계에서 잘리는지 확인한다. 반복되는 헤더·푸터와 여백은 검색에 계속 걸리므로 영역을 잘라내고, 줄바꿈 하이픈 복원, 유니코드 정규화, 깨진 문자 비율을 점검한다. 다단 레이아웃은 글자 좌표로 읽기 순서를 재구성하고, 표는 캡션과 함께 묶되 각주는 분리하며, 청크마다 출처·페이지·섹션 메타데이터를 붙인다."
  - q: "표가 많은 문서는 어떻게 파싱하나?"
    a: "텍스트만 뽑으면 행과 열의 관계가 무너지고 병합 셀이 빈 값으로 바뀌어 의미가 사라진다. 텍스트 레이어가 있는 단순 표는 PdfPlumber로 좌표 기반 추출 후 빈 셀을 보정하고, 스캔 이미지 표는 OCR로 글자와 좌표를 뽑아 Y좌표 기준으로 행을 다시 만든다. 중첩된 복잡한 표는 비용이 들더라도 VLM에 JSON 스키마를 주고 의미 단위로 구조화한다."
related:
  - rag-pipeline-process
  - chunking-strategies
  - vector-db/payload-filtering
source: "Day1(9/18) 슬라이드 p.29–31, p.40–44, 구현 노트 10-DocumentLoader, 실습 11-TextSplitter/10-custom-parser·11-Parser-with-VLM"
---

| PDF Loader | 텍스트 정확도 | 이미지 | 표 | 문단 구조 | 속도 | 주요 용도 |
| --- | --- | --- | --- | --- | --- | --- |
| PyPDFLoader | 보통 | X | X | X | 빠름 | 일반 문서, 페이지 단위 + source·page 메타 |
| PyMuPDFLoader | 높음 | O | 보통 | O | 빠름 | 텍스트·이미지 혼합 문서 |
| PDFPlumberLoader | 보통 | X | O | 보통 | 느림 | 표 추출, 메타데이터 풍부 |
| UnstructuredPDFLoader | 높음 | O | O | O | 가장 느림 | 고품질 구조 단위 분할 |

```compare
PdfPlumber | OCR + Clustering | VLM
원리 | PDF 텍스트 레이어 좌표 추출 | 이미지 속 글자 좌표를 클러스터링 | 시각적 추론으로 JSON 구조화
장점 | 빠르고 비용 없음 | 스캔 이미지에도 적용 | 중첩·복잡한 표에 압도적
단점 | 텍스트 레이어 없으면 불가 | 좌표 오차로 열 섞임 | API 비용, 느림
```

> [!warn] 파싱 후 품질 검증 필수
> 실습에서 PyMuPDFLoader로 읽은 SPRi AI Brief(한글 hwpx를 인쇄한 PDF)는 숫자·단어가 줄마다 흩어져 나옴. 추출 실패, 빈 텍스트, 깨진 문자 비율을 보고 로더를 바꾸거나 후처리. 메타데이터에는 chunk_id, source, page, section, updated_at, access_tag 같은 항목을 프로젝트 목적에 맞게 정의.

> [!tip] 법령·규정처럼 계층이 있는 문서
> 조·항·호 청크는 소속 조를 잃고, "제15조제1항에 따라" 같은 교차 참조와 단서·예외, 개정 시점이 빠지면 답이 틀어짐. 규칙 기반 계층 파싱(정규식 트리 + 상위 경로 메타데이터) → LLM 기반 구조화(암묵적 참조) → 참조 그래프(GraphRAG, multi-hop) 순으로 강화.
