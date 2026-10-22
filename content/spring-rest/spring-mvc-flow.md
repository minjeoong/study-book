---
title: Spring MVC 요청 흐름과 @RestController
en: DispatcherServlet, HandlerMapping, HandlerAdapter, HttpMessageConverter
summary: DispatcherServlet이 HTTP 요청을 컨트롤러 메서드에 연결하고, 반환 객체를 JSON으로 바꿔 응답하는 구조
importance: 3
order: 9
tags:
  - Spring MVC
  - DispatcherServlet
  - Controller
keypoints:
  - 모든 요청은 프론트 컨트롤러 DispatcherServlet을 거친다
  - HandlerMapping이 메서드를 찾고 HandlerAdapter가 파라미터 바인딩 후 호출
  - "@RestController = @Controller + @ResponseBody (JSON 반환)"
qa:
  - q: Spring MVC에서 요청이 처리되는 흐름은?
    a: 톰캣 같은 서블릿 컨테이너가 TCP 소켓으로 들어온 HTTP를 파싱해 HttpServletRequest를 만들고 DispatcherServlet에 넘긴다. DispatcherServlet은 HandlerMapping으로 URL에 맞는 컨트롤러 메서드를 찾고, HandlerAdapter가 @PathVariable·@RequestBody 등을 바인딩해 리플렉션으로 메서드를 호출한다. @RestController면 반환 객체를 HttpMessageConverter(Jackson)가 JSON으로 바꿔 응답하고, @Controller면 ViewResolver가 뷰 이름으로 템플릿을 렌더링한다.
  - q: "@Controller와 @RestController의 차이는?"
    a: "@Controller는 뷰 이름을 반환해 Thymeleaf 같은 템플릿으로 HTML을 그리는 MVC용이고, JSON을 주려면 메서드에 @ResponseBody를 따로 붙여야 한다. @RestController는 @Controller와 @ResponseBody를 합친 것이라 클래스의 모든 메서드 반환값이 HTTP 본문(JSON)이 된다. 종합 실습에서도 화면은 @Controller, API는 @RestController로 나눴다."
  - q: "@PathVariable, @RequestParam, @RequestBody는 언제 쓰나?"
    a: "@PathVariable은 /users/{id}처럼 경로에 박힌 값, @RequestParam은 ?name=kim 같은 쿼리스트링이나 폼 값을 받고 required·defaultValue를 줄 수 있다. @RequestBody는 POST·PUT 본문의 JSON을 객체로 변환한다. 보통 자원 식별은 경로, 검색·필터는 쿼리, 생성·수정 데이터는 본문으로 받는다."
related:
  - rest-api
  - layered-dto-validation
  - reflection-annotation
  - ioc-di-bean
source: 2부 슬라이드 p.48–56(MVC·DispatcherServlet·View·Servlet 동작), p.57–77(Controller·@RestController·@RequestMapping·파라미터 바인딩·UserController 실습), p.94–96(17.http-api-server) — Day 3 오후 (08-12); 1부 슬라이드 p.349–362(Socket·ServerSocket·Simple HTTP), 실습 02.layer/01.myapp-controller
---

```flow
톰캣 (Servlet Container) :: TCP 소켓 수신 → HTTP 파싱 → HttpServletRequest 생성
DispatcherServlet :: 모든 요청의 입구 (Front Controller)
HandlerMapping :: URL + 메서드 → 컨트롤러 메서드 검색 (@GetMapping 정보)
HandlerAdapter :: ArgumentResolver로 파라미터 바인딩 → Method.invoke
Controller → Service → Repository :: 업무 처리 후 객체 반환
HttpMessageConverter :: 반환 객체 → JSON, HttpServletResponse로 전송
```

| 어노테이션 | 받는 값 | 예 |
| --- | --- | --- |
| @PathVariable | URL 경로 변수 | `GET /users/100` → id = 100 |
| @RequestParam | 쿼리스트링·폼 | `?keyword=Spring`, `required = false, defaultValue = "all"` |
| @RequestBody | 본문 JSON → 객체 | POST·PUT·PATCH |
| @RequestHeader | 헤더 값 | `Authorization: Bearer ...` |
| @CookieValue | 쿠키 값 | `visitTime` |
| @ModelAttribute | 폼·쿼리 → 객체 | 화면 폼 전송 |

```java
@RestController
@RequestMapping("/api")                      // 클래스 공통 prefix
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/users")                    // GET /api/users?name=alice
    public List<User> getAllUsers(@RequestParam(required = false) String name) {
        return userService.getAllUsers(name);
    }

    @GetMapping("/users/{id}")               // GET /api/users/2
    public ResponseEntity<User> getUser(@PathVariable long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());   // 없으면 404
    }

    @PostMapping("/users")                   // 본문 JSON → UserRequest
    public User createUser(@RequestBody UserRequest request) {
        return userService.createUser(request);
    }
}
```

> [!tip] 실습 연결
> 1부에서 ServerSocket으로 `GET /users HTTP/1.1` 텍스트를 직접 읽고 `HTTP/1.1 200 OK` 응답을 써 봤고, 17.http-api-server에서는 커스텀 @GetMapping을 리플렉션으로 읽어 라우팅까지 흉내 냈다. 톰캣과 DispatcherServlet이 그 일을 대신해 주는 것이 Spring MVC다.
