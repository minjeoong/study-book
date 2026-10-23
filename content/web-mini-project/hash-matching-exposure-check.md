---
title: 해시 대조로 유출 대상 확인
en: Hash Matching for Breach Exposure Check
summary: 기업은 피해자 이메일을 SHA-256 해시로만 제출하고, 사용자가 확인을 누르면 로그인 이메일 해시와 대조해 결과만 기록하는 방식
importance: 3
order: 5
tags: [해시, SHA-256, 개인정보 최소화, Privacy by Design, 보안]
keypoints:
  - 기업이 낸 이메일 원문은 받지 않고 incident_affected_identifier에 해시(char 64)만 저장
  - 사고 승인 시 해시가 일치하는 사용자에게만 incident_alert를 만들어 확인을 유도
  - 사용자가 "내 유출 여부 확인"을 누르는 순간 대조해 exposure_check에 결과 기록
qa:
  - q: 왜 이메일 원문 대신 해시를 받았나요?
    a: '유출 피해자 명단 자체가 민감한 개인정보라서, 플랫폼이 원문을 받으면 또 하나의 유출 지점이 됩니다. 해시는 같은 입력이면 항상 같은 값이 나오고 거꾸로 원문을 계산할 수 없기 때문에, 원문을 몰라도 "이 사용자가 명단에 있는가"만 판별할 수 있습니다. 그래서 기업은 SHA-256 해시만 제출하고, 서버는 로그인 이메일을 같은 방식으로 해시해 비교한 뒤 결과만 저장했습니다.'
  - q: 이메일 SHA-256 해시만으로 충분히 안전한가요?
    a: '완벽하지는 않습니다. 이메일은 추측 가능한 값이라 공격자가 흔한 이메일 목록을 미리 해시해 대조하면 원문을 알아낼 수 있습니다(사전 공격). 보완한다면 플랫폼과 기업이 공유하는 비밀 키로 HMAC-SHA256을 쓰고, 해시 전에 이메일을 소문자·공백 제거로 정규화해 같은 주소가 다른 해시가 되는 일을 막겠습니다.'
  - q: 알림과 직접 확인을 둘 다 둔 이유는?
    a: '승인 시점에 해시가 일치하는 사용자에게 알림을 자동으로 만들어 모르고 지나치는 문제를 줄이고, 사용자가 확인 버튼을 누르면 그 시점에 대조해 이력을 남깁니다. 알림은 "확인해 보세요"라는 유도이고 exposure_check는 사용자가 실제로 확인했다는 기록이라 역할이 다릅니다. 홈 화면은 이 확인 이력을 최신순으로 보여 줍니다.'
related: [privacyon-erd, privacyon-problem-solution, smart-data/db-security-ha]
source: 개요 PDF p.20 (사고 상세 — 내 유출 여부 확인), p.24 (실제 API에는 이메일 원문 대신 SHA-256 해시만 전송), p.33 (정보유출 대상 확인 설계 포인트 ①②), p.37 (POST /incidents/{incidentId}/exposure-check — 원문 미전달). 보완점(사전 공격, HMAC, 정규화)과 코드 예시는 면접 대비 일반 지식
---

```flow
기업 제출 :: 피해 대상 이메일 → SHA-256 해시만 전송 (원문 미전달)
저장 :: incident_affected_identifier.identifier_hash — char(64)
관리자 승인 :: disclosedAt 확정, 해시 일치 사용자에게 incident_alert 생성
사용자 확인 :: 로그인 이메일 해시 ↔ 기업 제출 해시 대조
결과 기록 :: exposure_check — AFFECTED / NOT_AFFECTED, checked_at
```

설계를 코드로 옮기면 (예시)

```java
@Transactional
public ExposureCheck check(Long incidentId, Member me) {
    String hash = sha256Hex(me.getEmail());                 // 원문은 비교에만 쓰고 저장하지 않음
    boolean affected = identifierRepository
            .existsByIncidentIdAndIdentifierHash(incidentId, hash);
    return exposureCheckRepository.save(new ExposureCheck(
            incidentId, me.getId(),
            affected ? ExposureStatus.AFFECTED : ExposureStatus.NOT_AFFECTED,
            LocalDateTime.now()));
}
```

> [!warn] 해시 ≠ 암호화
> 암호화는 키로 되돌릴 수 있고 해시는 되돌릴 수 없다. SHA-256 출력은 256비트 = 16진수 64자라서 컬럼이 char(64)다. 비밀번호(password_hash)는 SHA-256 같은 빠른 해시가 아니라 bcrypt처럼 솔트가 들어간 느린 해시로 저장해야 한다.
