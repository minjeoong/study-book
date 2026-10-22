---
title: 배치 vs 실시간 추론과 서빙 패턴
en: Batch vs Real-time Inference, REST / gRPC / WebSocket / WebRTC
summary: "정해진 시간에 대량을 한꺼번에 처리하는 배치 추론과 요청 즉시 응답하는 실시간 추론, 그리고 프로토콜 × 처리방식으로 고르는 서빙 패턴"
importance: 3
order: 2
tags: [배치 추론, 실시간 추론, REST, gRPC, WebSocket, WebRTC]
keypoints:
  - "배치는 처리량 우선(야간 리포트), 실시간은 지연 우선(추천 API, 이상 거래 탐지)"
  - "REST + 비동기(FastAPI)가 과정의 기본, gRPC는 내부 고성능 통신"
  - "WebSocket으로 대상 탐색·시그널링, 확정되면 WebRTC P2P로 미디어 직접 전송"
qa:
  - q: "배치 추론과 실시간 추론은 언제 쓰나요?"
    a: "배치 추론은 대량의 데이터를 정해진 시간에 한꺼번에 처리하는 방식으로, 야간 리포트나 대량 고객 세그먼트 분류처럼 지연시간보다 처리량이 중요할 때 씁니다. 실시간 추론은 요청이 오는 즉시 응답하는 방식으로 챗봇, 추천 API, 이상 거래 탐지처럼 즉각적인 응답이 필수일 때 씁니다. 같은 모델이라도 결과를 언제 써야 하는지에 따라 서빙 구조와 자원 사용 패턴이 달라집니다."
  - q: "REST, gRPC, WebSocket은 어떻게 다른가요?"
    a: "REST는 HTTP 요청마다 연결해 응답받는 방식이라 구현과 디버깅이 쉬워 대부분의 모델 API에 씁니다. gRPC는 강타입 스키마와 낮은 지연시간이 강점이라 서비스 간 내부 통신이나 고성능 환경에 적합합니다. WebSocket은 연결을 유지한 채 양방향으로 메시지를 주고받아 화상회의의 채널 탐색이나 WebRTC 시그널링 중계에 쓰고, 실제 음성·영상은 WebRTC가 클라이언트 간 P2P로 직접 전송합니다."
related: [serving-aiops-overview, fastapi-pydantic, async-batching]
source: "Day1 슬라이드 p.11–16 (학습 vs 서빙, 배치 vs 실시간 추론, 프로토콜 × 처리방식 매트릭스, WebSocket 채널·대상 탐색, WebRTC P2P 전환), Day1 녹취"
---

```compare
배치 추론 | 실시간 추론
처리 방식 | 대량 데이터를 정해진 시간에 한꺼번에 | 요청이 오는 즉시 응답
우선 지표 | 처리량 (Throughput) | 지연시간 (Latency)
예시 | 야간 리포트, 대량 고객 세그먼트 분류 | 챗봇·추천 API, 이상 거래 탐지
```

| 패턴 | 특징 | 적합한 상황 |
| --- | --- | --- |
| REST + 동기 | 구현 간단, 디버깅 쉬움 | 소규모 API, 프로토타입 |
| REST + 비동기 | 동시 요청 처리량 개선 | 이번 과정의 기본 형태 (FastAPI) |
| gRPC (동기·비동기) | 낮은 지연시간, 강타입 스키마 | 서비스 간 내부 통신, 고성능 환경 |
| WebSocket | 지속 연결, 양방향 메시지 | 채널·대상 탐색, WebRTC 시그널링 중계 |
| WebRTC (P2P) | 초저지연 실시간 스트림, 브라우저 직접 지원 | 실시간 음성·영상 기반 AI 서비스 |

```flow
WebSocket 연결 :: 지금 연결 가능한 대상 탐색 (find_peer)
SDP · ICE 교환 :: FastAPI는 연결 수립을 중개만 함
WebRTC P2P :: 오디오·영상은 클라이언트 간 직접 전송
```

> [!tip] 판단 기준
> 과정 원칙은 "완벽한 커버리지가 아니라 MVP가 지금 당장 동작하는가". REST + 비동기를 기본으로 두고, 실시간 채널이 필요한 시나리오에서만 WebSocket·WebRTC를 붙인다.
