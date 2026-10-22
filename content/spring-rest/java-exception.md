---
title: 예외 처리 (Checked vs Unchecked)
en: Java Exception Handling
summary: Checked(처리 강제)와 Unchecked(RuntimeException)로 나뉘고, 외부 자원은 try-with-resources로 닫는다
importance: 3
order: 2
tags:
  - Java
  - 예외
  - try-with-resources
keypoints:
  - Exception은 Checked와 Unchecked(RuntimeException)로 나뉜다
  - Checked만 컴파일러가 try-catch 또는 throws를 강제한다
  - Socket·File·DB Connection은 try-with-resources로 자동 close
qa:
  - q: Checked Exception과 Unchecked Exception의 차이는?
    a: Checked는 RuntimeException이 아닌 Exception 하위로, IOException·SQLException처럼 파일·네트워크·DB 같은 외부 환경에서 생겨 복구 가능성이 높으므로 컴파일러가 try-catch나 throws를 강제한다. Unchecked는 RuntimeException 하위로 NullPointerException·IllegalArgumentException처럼 개발자 실수에서 생기며 처리를 강제하지 않는다. 스프링 @Transactional도 기본적으로 Unchecked와 Error에서만 롤백하므로, Checked까지 롤백하려면 rollbackFor를 지정한다.
  - q: throw와 throws의 차이는?
    a: throw는 throw new Exception("...")처럼 예외 객체를 실제로 던지는 문장이다. throws는 메서드 선언부에 붙여 이 메서드가 해당 예외를 던질 수 있으니 호출한 쪽이 처리하라고 책임을 위임하는 표시다. 실습의 buyStock(int amount) throws Exception이 둘을 함께 쓴 예다.
  - q: try-with-resources를 쓰는 이유는?
    a: Socket·File·DB Connection 같은 외부 자원은 OS가 발급한 파일 디스크립터를 쓰므로 반드시 close해야 하고, 빠뜨리면 포트 고갈·Too many open files·메모리 누수가 생긴다. finally에서 역순으로 null 체크하며 일일이 닫는 대신 try 괄호 안에 자원을 선언하면 블록이 끝날 때 자동으로 닫힌다.
related:
  - jvm-memory
  - persistence-context-transaction
source: Java 슬라이드 p.131–136(throw·throws, try-catch-finally, try-with-resources, Custom Exception, 계산기 0으로 나누기), p.147–149(Exception 계층, Checked 이유) — Day 1 (08-10), 실습 06.exception/Calculator.java
---

```compare
Checked | Unchecked
상속 | Exception (RuntimeException 제외) | RuntimeException
원인 | 외부 환경 — 파일, 네트워크, DB | 개발자 실수 — null, 잘못된 인자
컴파일러 | try-catch 또는 throws 강제 | 강제 안 함
예 | IOException, SQLException, InterruptedException | NullPointerException, ArithmeticException, ClassCastException
@Transactional 기본 롤백 | 안 됨 (rollbackFor 필요) | 됨
```

```java
// try-with-resources — 괄호 안 자원은 자동 close
try (Socket client = serverSocket.accept();
     InputStream in = client.getInputStream()) {
    // ...
} catch (IOException e) {
    e.printStackTrace();
}

// Custom Exception — 예외 상황을 이름으로 구분
public class CustomException extends Exception {
    public CustomException(String message) { super(message); }
}
```

> [!tip] 실습에서 한 것
> 계산기에서 `/` 연산의 두 번째 숫자가 0이면 `throw new ArithmeticException("0으로 나눌 수 없습니다.")`를 던지고, catch에서 메시지를 출력한 뒤 `continue`로 다시 입력을 받게 고쳤다. 프로그램이 죽지 않고 계속 도는 것이 예외 처리의 목적.
