---
title: "TLS와 HTTPS 동작 원리"
en: "TLS Handshake · HTTPS"
summary: "비대칭키와 CA 서명 인증서로 서버 신원을 확인하고 세션 대칭키를 안전하게 공유한 뒤, 실제 데이터는 빠른 대칭키로 암호화하는 하이브리드 방식"
importance: 3
order: 7
tags:
  - TLS
  - HTTPS
  - 인증서
  - 암호화
keypoints:
  - "대칭키(AES)는 빠르지만 키 공유가 문제, 비대칭키는 공유 문제를 풀지만 느림"
  - "인증서(tls.crt) = 서버 공개키 + 도메인 + 유효기간 + CA 전자서명"
  - "전자서명: 해시를 개인키로 서명, 공개키로 검증 → 무결성·신원 보증"
qa:
  - q: "HTTPS(TLS) 핸드셰이크 과정을 설명해 달라."
    a: "클라이언트가 지원하는 TLS 버전과 암호 알고리즘 목록, 랜덤값을 보내면 서버가 선택한 방식과 자기 랜덤값, 서버 인증서(tls.crt)를 보낸다. 클라이언트는 브라우저에 미리 내장된 루트 CA 공개키로 인증서의 CA 서명을 검증해 서버 신원을 확인한다. 이후 서버 공개키로 Pre-Master Secret을 암호화해 보내면 양쪽이 두 랜덤값과 함께 같은 세션 대칭키를 만들고, Finished 메시지를 교환한 뒤 데이터는 그 대칭키로 암호화한다."
  - q: "왜 대칭키와 비대칭키를 함께 쓰나?"
    a: "대칭키는 암복호화가 빠르지만 같은 키를 상대에게 안전하게 전달하기 어렵고, 비대칭키는 공개키만 공유하면 되지만 계산량이 커서 대용량 데이터에 비효율적이다. 그래서 TLS는 비대칭키로 서버를 인증하고 세션 키를 교환하는 데만 쓰고, 실제 데이터 암호화는 대칭키로 하는 하이브리드 방식을 쓴다."
  - q: "self-signed 인증서로 만든 HTTPS Ingress에 브라우저가 경고를 띄우는 이유는?"
    a: "브라우저는 내장된 신뢰 루트 CA 목록의 공개키로 인증서 서명을 검증하는데, self-signed 인증서는 자기 개인키로 서명해서 신뢰 체인이 없다. 암호화 자체는 되지만 서버 신원을 보증할 수 없어 경고가 뜬다. 운영에서는 cert-manager와 Let's Encrypt 같은 공인 CA로 발급받는다."
related:
  - cert-manager-https-ingress
  - k8s-deploy/ingress
source: "Self Study 슬라이드 p.268–285 (01.gen-cert.sh, 02.create-tls-secret.sh 실습)"
---

```flow
ClientHello :: TLS 버전, 지원 암호 목록, 클라이언트 랜덤
ServerHello + Certificate :: 선택한 방식, 서버 랜덤, tls.crt (공개키 + CA 서명)
인증서 검증 :: tbsCertificate 해시 vs CA 공개키로 푼 Signature 비교
키 교환 :: 공개키로 암호화한 Pre-Master Secret → 양쪽이 세션 대칭키 생성
Finished → 데이터 :: 이후 모든 데이터는 세션 대칭키로 암호화
```

```compare
대칭키 | 비대칭키
키 | 암호화·복호화에 같은 키 | 공개키로 암호화, 개인키로 복호화 (서명은 반대)
속도 | 빠름 | 느림 (계산량 큼)
약점 | 키를 안전하게 나누기 어려움 | 대용량 데이터에 비효율
대표 | AES | RSA, ECDHE
TLS에서 | 세션 키로 실제 데이터 암호화 | 서버 인증, 세션 키 교환
```

```bash
# self-signed 서버 인증서 발급 → TLS Secret → Ingress spec.tls 에서 참조
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -subj "/CN=${STUDENT_NUM}-ingress.${CLASS_NAME}.skala-us.com/O=com.sk.skala" \
  -keyout tls.key -out tls.crt
openssl x509 -in tls.crt -pubkey -noout          # 인증서 안의 공개키 확인
kubectl create secret tls ${STUDENT_NUM}-manual-tls-secret \
  --key tls.key --cert tls.crt -n ${CLASS_NAME}
```

> [!tip] 해시와 전자서명 한 줄 정리
> SHA-256은 어떤 데이터든 고정 길이(256비트) 지문을 만들고 원문 복원이 불가해 무결성 확인에 씀. 전자서명은 원문의 해시를 보낸 쪽 개인키로 서명하고, 받는 쪽이 공개키로 푼 해시와 직접 계산한 해시를 비교해 "누가 썼고 바뀌지 않았다"를 증명함. CA는 이 방식으로 서버 공개키+도메인에 서명해 준 기관.
