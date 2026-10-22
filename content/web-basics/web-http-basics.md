---
title: 웹 통신의 기초 — TCP/IP와 HTTP
en: Internet, TCP/IP, DNS, HTTP
summary: 인터넷(TCP/IP 통신망) 위에서 웹은 URL로 자원을 찾고 HTTP 요청·응답으로 HTML을 주고받는 서비스
importance: 3
order: 1
tags:
  - 네트워크
  - HTTP
  - TCP/IP
  - DNS
keypoints:
  - TCP/IP 4계층 — 네트워크 접근 · 인터넷(IP) · 전송(TCP/UDP) · 응용(HTTP)
  - 접속 순서는 DNS 조회 → TCP 3-way handshake → HTTP 요청·응답
  - HTTP 메시지는 시작줄 + 헤더 + 바디, 결과는 상태 코드(2xx~5xx)로 판단
qa:
  - q: 브라우저 주소창에 URL을 입력하면 어떤 일이 일어나나요?
    a: 먼저 DNS 서버에 도메인의 IP 주소를 묻습니다. 그 IP의 웹 서버와 TCP 3-way handshake(SYN, SYN+ACK, ACK)로 연결을 맺고, HTTPS라면 TLS로 암호화 채널을 만든 뒤 HTTP GET 요청을 보냅니다. 서버가 상태 코드와 HTML을 응답하면 브라우저가 파싱해 DOM과 CSSOM을 만들고 화면을 그립니다.
  - q: TCP와 UDP의 차이는?
    a: TCP는 연결 지향 프로토콜로 3-way handshake로 연결을 맺은 뒤 보내고, 데이터가 유실되면 재전송하며 순서를 보장해 웹, 파일 전송, 이메일에 씁니다. UDP는 연결 과정 없이 일방적으로 보내 헤더가 가볍고 빠르지만 유실이나 순서 뒤바뀜을 처리하지 않아 실시간 스트리밍과 온라인 게임에 씁니다.
  - q: HTTP와 HTTPS의 차이, 그리고 주요 상태 코드는?
    a: HTTPS는 HTTP에 SSL/TLS 암호화를 더한 것으로 요청·응답의 헤더와 바디가 암호화되지만 목적지 도메인과 IP는 암호화되지 않습니다. 상태 코드는 2xx 성공(200 OK, 201 Created), 3xx 리다이렉션(304 Not Modified), 4xx 클라이언트 오류(400 Bad Request, 404 Not Found), 5xx 서버 오류(500)로 나뉩니다.
related:
  - browser-rendering
  - async-javascript
  - vue/axios-rest-api
source: Day1 슬라이드 p.9–23 (Internet History, TCP/IP 4계층, MAC·IP·NAT, TCP/UDP, DNS, Web Connection Workflow, WWW, URL, HTTP Request/Response, HTTPS), p.37–38 (실습 What is my IP, HTTP Request Circle)
---

```flow
DNS 조회 :: 도메인 → IP 주소 (nslookup으로 확인)
TCP 연결 :: 3-way handshake — SYN → SYN+ACK → ACK
HTTP 요청 :: Request Line(메서드, URL, 버전) + Header + Body
HTTP 응답 :: Status Line(버전, 상태 코드, 메시지) + Header + Body(HTML, JSON)
렌더링 :: 브라우저가 HTML·CSS·JS를 해석해 화면 표시
```

```layers
응용 계층 (Application) :: HTTP/HTTPS, DNS, FTP, SSH, SMTP — 단위 Message
전송 계층 (Transport) :: TCP(신뢰·순서 보장) / UDP(빠름) — 단위 Segment / Datagram
인터넷 계층 (Internet) :: IP 주소로 최적 경로 찾기, ICMP — 단위 Packet
네트워크 접근 계층 :: Ethernet, Wi-Fi, MAC 주소(하드웨어 고유 48비트) — 단위 Frame, Bit
```

| 구분 | 내용 |
| --- | --- |
| 웹 3요소 | 어떻게 = HTTP, 어디로 = URL, 무엇을 = HTML |
| URL 구조 | 프로토콜 `http://` + 호스트·도메인 + 포트 `:80` + 경로 `/codns/` + 파일 + 쿼리 `?id=1` |
| 주요 메서드 | GET 조회, POST 생성·전송, PUT/PATCH 수정, DELETE 삭제 |
| IP | 공인 IP(WAN에서 유일) / 사설 IP(LAN 내부) — 라우터의 NAT가 서로 변환 |
| 확인 실습 | `ipconfig /all`(사설 IP) vs whatismyip(공인 IP), 개발자 도구 Network 탭에서 Header·Response·Timing |

> [!warn] 헷갈리기 쉬움
> 인터넷 ≠ 웹. 인터넷은 케이블·라우터로 이어진 물리적 통신망(인프라)이고, 웹은 그 위의 응용 계층에서 HTML·HTTP·URL로 동작하는 서비스 중 하나다. 이메일(SMTP), 파일 전송(FTP), 원격 접속(SSH)도 인터넷 위의 다른 서비스.
