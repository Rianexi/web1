---

## Группа 1: Основы Веб-Протокола HTTP

### 1. Протокол HTTP — особенности и основные концепции.
**Что это?**
HTTP (HyperText Transfer Protocol) — протокол прикладного уровня для передачи гипертекстовых документов. Это основа работы веба.

**Ключевые особенности:**
*   **Без состояния (Stateless):** Каждый запрос клиента к серверу независим. Сервер не хранит информацию о предыдущих запросах. Сессии эмулируются через cookies или токены.
*   **Запрос-Ответ:** Клиент отправляет запрос (Request), сервер отвечает ответом (Response).
*   **Текстовый формат:** Сообщения (заголовки, тело) читаются человеком.
*   **Порт по умолчанию:** 80 (HTTP), 443 (HTTPS).

**Основные концепции:**
*   **Методы запроса:** `GET`, `POST`, `PUT`, `DELETE`, `HEAD`, `OPTIONS` и др. Определяют действие, которое нужно выполнить.
*   **Коды состояния:** Числовые коды (200, 404, 500 и т.д.), указывающие на результат обработки запроса.
*   **Заголовки:** Дополнительная информация о запросе/ответе (например, `Content-Type`, `User-Agent`, `Cookie`).
*   **Тело сообщения:** Данные, передаваемые в запросе (например, данные формы) или в ответе (HTML-страница, JSON).

---

### 2. HTTP Методы (Описание и назначение)
Вот 7 ключевых методов:

1.  **`GET`**: Запрос на получение ресурса. Данные передаются в URL. Идемпотентен и безопасен (не должен изменять состояние сервера).
2.  **`POST`**: Отправка данных на сервер для создания/обновления ресурса. Данные передаются в теле запроса. Не идемпотентен.
3.  **`PUT`**: Обновление существующего ресурса или создание нового по указанному URI. Идемпотентен.
4.  **`DELETE`**: Удаление ресурса по указанному URI. Идемпотентен.
5.  **`HEAD`**: Запрос заголовков ресурса без его тела. Полезен для проверки доступности или получения метаданных.
6.  **`OPTIONS`**: Запрос информации о возможностях сервера или методах, поддерживаемых для конкретного ресурса.
7.  **`PATCH`**: Частичное обновление ресурса. Более гибкий, чем `PUT`.

---

### 3. Коды состояния HTTP (Классификация и примеры)
Коды состояния делятся на 5 групп по первому числу:

*   **1xx (Информационные):** Запрос принят, продолжается обработка.
    *   `100 Continue`: Клиент может продолжать отправлять тело запроса.
*   **2xx (Успешные):** Запрос успешно обработан.
    *   `200 OK`: Запрос выполнен успешно.
    *   `201 Created`: Ресурс успешно создан.
    *   `204 No Content`: Запрос выполнен, но нет содержимого для возврата.
*   **3xx (Перенаправления):** Требуется дополнительное действие для завершения запроса.
    *   `301 Moved Permanently`: Ресурс перемещен навсегда.
    *   `302 Found`: Ресурс временно перемещен.
    *   `304 Not Modified`: Ресурс не изменился, можно использовать кэш.
*   **4xx (Ошибки клиента):** Ошибка вызвана клиентом.
    *   `400 Bad Request`: Неверный синтаксис запроса.
    *   `401 Unauthorized`: Требуется аутентификация.
    *   `403 Forbidden`: Доступ запрещен.
    *   `404 Not Found`: Ресурс не найден.
*   **5xx (Ошибки сервера):** Сервер не смог выполнить корректный запрос.
    *   `500 Internal Server Error`: Внутренняя ошибка сервера.
    *   `502 Bad Gateway`: Неверный ответ от прокси или шлюза.
    *   `503 Service Unavailable`: Сервис временно недоступен.

---

### 4. Структура HTTP Запроса
Пример запроса для отправки логина и пароля:

```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 27

username=john&password=secret123
```

*   **Строка запроса:** `METHOD PATH HTTP/VERSION` (`POST /login HTTP/1.1`)
*   **Заголовки:** Информация о запросе (например, `Host`, `Content-Type`, `Content-Length`). `Content-Type: application/x-www-form-urlencoded` говорит серверу, что данные формы закодированы в URL.
*   **Тело запроса:** Данные, отправляемые на сервер. В данном случае `username=john&password=secret123`.

---

### 5. Заголовки HTTP
Заголовки — это пары "ключ: значение", передаваемые в запросе или ответе. Они предоставляют метаданные.

*   **Общие:** Применяются как к запросу, так и к ответу (например, `Date`, `Cache-Control`).
*   **Запроса:** Содержат информацию о клиенте и запрашиваемом ресурсе (например, `User-Agent`, `Accept`, `Authorization`).
*   **Ответа:** Содержат информацию о сервере и ресурсе (например, `Server`, `Content-Type`, `Set-Cookie`).
*   **Сущности:** Описывают тело сообщения (например, `Content-Length`, `Content-Type`).

---

## Группа 2: Языки и Фреймворки для Веб-Разработки (Java)

### 1. JSP (JavaServer Pages) — основы
JSP — технология для создания динамических веб-страниц на Java. Это HTML-страница с внедренным Java-кодом.

**Основные элементы:**
*   **Директивы (`<%@ ... %>`):** Управляют обработкой страницы (например, `page`, `include`, `taglib`).
*   **Скриптлеты (`<% ... %>`):** Вставляют Java-код в сервлет.
*   **Выражения (`<%= ... %>`):** Выводят значение выражения.
*   **Действия (`<jsp:...>`):** Выполняют действия (например, `useBean`, `include`).

**Жизненный цикл JSP:**
1.  **Перевод (Translation):** JSP-файл компилируется в Java-сервлет.
2.  **Компиляция (Compilation):** Полученный сервлет компилируется в байт-код.
3.  **Загрузка и инициализация (Loading & Initialization):** Сервлет загружается в контейнер и инициализируется.
4.  **Обработка запросов (Request Processing):** Для каждого запроса вызывается метод `service()`.
5.  **Уничтожение (Destruction):** При выгрузке сервлета вызывается `destroy()`.

---

### 2. JSP Expression Language (EL)
**Что это?** Язык выражений, позволяющий легко получать данные из JavaBeans, параметров запроса, сессии и т.д. без написания Java-кода.

**Зачем нужен?** Упрощает доступ к данным в JSP, делает код более читаемым и отделенным от бизнес-логики.

**Синтаксис:** `${переменная}` или `${объект.свойство}`.

**Как работает:** Веб-контейнер во время выполнения заменяет `${...}` на соответствующее значение, используя механизм поиска в областях видимости (page, request, session, application).

**Пример:**
```jsp
<p>Имя пользователя: ${user.name}</p>
<p>Параметр запроса: ${param.username}</p>
```

---

### 3. JSTL (JavaServer Pages Standard Tag Library)
**Что это?** Набор стандартных тегов для JSP, которые упрощают работу с условными операторами, циклами, форматированием и т.д.

**Зачем использовать, если есть JSP-элементы?**
*   **Читаемость:** Код становится более похожим на XML и легче читается.
*   **Безопасность:** Уменьшает риск инъекций, так как данные автоматически экранируются.
*   **Удобство:** Предоставляет готовые решения для часто встречающихся задач (циклы, условия, форматирование дат, SQL-запросы).

**Основные теги:**
*   **Условные:** `<c:if>`, `<c:choose>`, `<c:when>`, `<c:otherwise>`
*   **Циклы:** `<c:forEach>`, `<c:forTokens>`
*   **Форматирование:** `<fmt:formatDate>`, `<fmt:formatNumber>`
*   **Управление данными:** `<c:set>`, `<c:remove>`, `<c:out>`
*   **URL-обработка:** `<c:url>`, `<c:redirect>`

---

### 4. Servlets — основы и жизненный цикл
**Что это?** Классы Java, которые расширяют возможности сервера, обрабатывая HTTP-запросы и формируя ответы.

**Жизненный цикл:**
1.  **Инициализация (`init()`):** Вызывается один раз при загрузке сервлета. Используется для инициализации ресурсов.
2.  **Обработка запросов (`service()`):** Вызывается для каждого запроса. Определяет тип запроса (GET, POST) и вызывает соответствующий метод (`doGet()`, `doPost()`).
3.  **Уничтожение (`destroy()`):** Вызывается при выгрузке сервлета. Используется для освобождения ресурсов.

**Преимущества перед CGI/FastCGI:**
*   **Производительность:** Сервлеты работают внутри JVM сервера, не требуют создания нового процесса для каждого запроса.
*   **Портативность:** Написаны на Java, работают на любой платформе с JVM.
*   **Интеграция:** Легко интегрируются с другими Java-технологиями (JSP, JDBC, EJB).

---

### 5. Диспетчеризация запросов. Интерфейс RequestDispatcher
**Что это?** Механизм для перенаправления запроса от одного сервлета к другому или к JSP-странице.

**Интерфейс `RequestDispatcher`:**
*   **`forward(ServletRequest, ServletResponse)`:** Передает запрос и ответ следующему ресурсу. Происходит внутри сервера, клиент не знает об этом.
*   **`include(ServletRequest, ServletResponse)`:** Включает вывод другого ресурса в текущий ответ.

**Где используется?** В паттерне Model 2 (MVC) для передачи управления между контроллером и представлением (view).

---

### 6. ServletContext
**Что это?** Интерфейс, представляющий контекст приложения (веб-приложения). Доступен всем сервлетам и JSP-страницам в приложении.

**Для чего применяется:**
*   Получение параметров инициализации приложения.
*   Получение информации о сервере и приложении.
*   Обмен данными между сервлетами (через атрибуты).
*   Логирование сообщений.

---

### 7. Конфигурация сервлетов. Файл web.xml
**Что это?** Дескриптор развертывания веб-приложения. Описывает конфигурацию сервлетов, фильтров, слушателей, параметров и т.д.

**Пример конфигурации сервлета:**
```xml
<servlet>
    <servlet-name>MyServlet</servlet-name>
    <servlet-class>org.example.MyServlet</servlet-class>
    <init-param>
        <param-name>config</param-name>
        <param-value>value</param-value>
    </init-param>
</servlet>

<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/my-servlet</url-pattern>
</servlet-mapping>
```

**Аннотации (альтернатива web.xml):**
```java
@WebServlet(urlPatterns = {"/my-servlet", "*.html", "*.xhtml"})
public class MyServlet extends HttpServlet {
    // ...
}
```

---

### 8. Фильтры (Filters)
**Что это?** Компоненты, которые могут перехватывать запросы и ответы до того, как они достигнут сервлета или после того, как сервлет их обработал.

**Пост- и предобработка:**
*   **Предобработка:** Выполняется до вызова сервлета (например, проверка аутентификации, логирование).
*   **Постобработка:** Выполняется после вызова сервлета (например, сжатие ответа, добавление заголовков).

**Пример фильтра для авторизации:**
```java
@WebFilter("/*")
public class AuthFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        if (req.getHeader("X-Application-User") == null) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

---

### 9. Архитектура Jakarta EE
**Что это?** Платформа для разработки корпоративных приложений на Java (ранее Java EE).

**Основные компоненты:**
*   **Сервлеты (Servlets)**
*   **JSP (JavaServer Pages)**
*   **JSF (JavaServer Faces)**
*   **EJB (Enterprise JavaBeans)**
*   **JPA (Java Persistence API)**
*   **JMS (Java Message Service)**

**Контейнер:** Программная среда, которая управляет жизненным циклом компонентов (сервлетов, JSP, EJB) и предоставляет им системные услуги (безопасность, транзакции, управление памятью).

---

## Группа 3: Языки и Фреймворки для Веб-Разработки (PHP)

### 1. PHP — особенности синтаксиса и использование
**Что это?** Язык сценариев общего назначения, особенно подходящий для веб-разработки.

**Особенности синтаксиса:**
*   Код PHP заключается в теги `<?php ... ?>`.
*   Переменные начинаются с `$` (например, `$name = "John";`).
*   Типы данных: скалярные (`int`, `float`, `string`, `bool`), составные (`array`, `object`), специальные (`null`, `resource`).
*   Суперглобальные массивы: `$_GET`, `$_POST`, `$_SESSION`, `$_COOKIE`, `$_SERVER` и др.

**Использование в веб-приложениях:**
*   Генерация динамического HTML-кода.
*   Обработка форм.
*   Работа с базами данных.
*   Управление сессиями.

---

### 2. Интеграция PHP с веб-сервером
**Способы:**
*   **CGI (Common Gateway Interface):** Каждый запрос запускает новый процесс PHP. Медленно, но просто.
*   **FastCGI:** Модифицированная версия CGI. Процессы PHP остаются в памяти, что значительно повышает производительность.
*   **Модуль Apache (mod_php):** PHP работает как модуль веб-сервера Apache. Очень быстро, но менее гибко.
*   **SAPI (Server API):** Общий интерфейс для интеграции PHP с различными веб-серверами.

---

### 3. CGI vs FastCGI
**CGI:**
*   **Плюсы:** Простота, универсальность.
*   **Минусы:** Низкая производительность (запуск нового процесса для каждого запроса), высокое потребление памяти.

**FastCGI:**
*   **Плюсы:** Высокая производительность (процессы остаются в памяти), масштабируемость, возможность работы с несколькими серверами.
*   **Минусы:** Более сложная настройка.

---

## Группа 4: Шаблонизаторы и Фронтенд

### 1. FreeMarker Template Engine
**Что это?** Шаблонизатор на Java для генерации текстового вывода (HTML, XML, текст и т.д.).

**Архитектура и принцип работы:**
*   **Шаблон:** Файл с текстом и директивами FreeMarker (например, `${variable}`, `<#if condition>`).
*   **Модель данных:** Объект Java (обычно `Map` или JavaBean), содержащий данные для шаблона.
*   **Движок:** Объект `Configuration`, который загружает шаблон и объединяет его с моделью данных, создавая выходной текст.

**Особенности:**
*   Легко интегрируется с Java-приложениями.
*   Поддерживает сложную логику (условия, циклы, макросы).
*   Безопасен: данные автоматически экранируются.

---

### 2. Thymeleaf
**Что это?** Шаблонизатор для Java, который позволяет создавать HTML-шаблоны, которые можно просматривать в браузере даже без сервера.

**Отличия от FreeMarker:**
*   **HTML-дружественность:** Шаблоны Thymeleaf являются валидным HTML, их можно открывать в браузере.
*   **Синтаксис:** Использует атрибуты HTML (например, `th:text`, `th:if`) вместо собственных тегов.
*   **Интеграция:** Хорошо интегрируется с Spring Framework.

**Стандартные выражения:**
*   `${...}`: Переменные.
*   `*{...}`: Переменные в контексте объекта.
*   `#{...}`: Сообщения (i18n).
*   `@{...}`: URL.
*   `~{...}`: Фрагменты.

---

### 3. LESS, SASS, SCSS
**Что это?** Препроцессоры CSS, которые добавляют в CSS функциональность, недоступную в обычном CSS.

**Особенности и отличия:**
*   **LESS:** Синтаксис похож на CSS. Использует `@` для переменных.
*   **SASS (Indented Syntax):** Синтаксис с отступами (как Python). Использует `$` для переменных.
*   **SCSS (Sassy CSS):** Синтаксис, совместимый с CSS. Использует `$` для переменных.

**Дополнительные функции:**
*   **Переменные:** Хранение значений (цветов, размеров).
*   **Вложенность:** Структурирование CSS-правил.
*   **Миксины:** Переиспользуемые блоки CSS.
*   **Наследование:** Расширение стилей.
*   **Операции:** Математические операции над значениями.

**Совместимость с браузером:** Браузеры не понимают LESS/SASS/SCSS напрямую. Их нужно "компилировать" в обычный CSS с помощью инструментов (например, `node-sass`, `dart-sass`, `gulp-sass`).

---

## Группа 5: JavaScript и Асинхронность

### 1. Принципы асинхронного исполнения JS
JavaScript — однопоточный язык. Асинхронность реализуется через **Event Loop**.

**Концептуальные отличия от параллельных программ (Java):**
*   **Однопоточность:** JS выполняет код в одном потоке. Параллельные задачи выполняются не одновременно, а по очереди.
*   **Event Loop:** Механизм, который обрабатывает события и коллбэки. Когда основной поток свободен, он берет задачу из очереди (callback queue) и выполняет ее.
*   **Неблокирующие операции:** Операции ввода-вывода (сетевые запросы, чтение файлов) не блокируют выполнение кода. Они отправляются в фон, а когда завершаются, их коллбэк помещается в очередь.

**Пример:**
```javascript
console.log('Start');
setTimeout(() => console.log('Timeout'), 0);
console.log('End');
// Вывод: Start, End, Timeout
```

---

### 2. AJAX и DHTML
**AJAX (Asynchronous JavaScript and XML):** Технология для асинхронного обмена данными между браузером и сервером без перезагрузки страницы.

**DHTML (Dynamic HTML):** Совокупность технологий (HTML, CSS, JavaScript) для создания динамических веб-страниц.

**Сходства и различия:**
*   **Сходства:** Обе технологии используют JavaScript для изменения содержимого страницы.
*   **Различия:** AJAX фокусируется на асинхронном обмене данными с сервером, в то время как DHTML — на динамическом изменении содержимого и стиля страницы на стороне клиента.

---

### 3. Fetch API, XMLHttpRequest, SuperAgent
**Fetch API:** Современный способ отправки HTTP-запросов. Возвращает Promise, что делает код более читаемым.

**XMLHttpRequest (XHR):** Старый способ отправки HTTP-запросов. Использует коллбэки, что может приводить к "аду коллбэков".

**SuperAgent:** Библиотека для отправки HTTP-запросов, которая предоставляет более удобный API, чем XHR, но менее популярна, чем Fetch.

**Пример Fetch:**
```javascript
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data));
```

---

### 4. jQuery
**Что это?** Библиотека JavaScript, упрощающая работу с DOM, событиями, AJAX и анимациями.

**Основные возможности:**
*   **Выбор элементов:** `$('#id')`, `$('.class')`, `$('tag')`.
*   **Манипуляция DOM:** `.text()`, `.html()`, `.attr()`, `.addClass()`.
*   **События:** `.click()`, `.on()`, `.hover()`.
*   **AJAX:** `$.ajax()`, `$.get()`, `$.post()`.
*   **Анимации:** `.fadeIn()`, `.slideUp()`, `.animate()`.

**Пример отправки POST-запроса:**
```javascript
$.post('/api/data', { key: 'value' }, function(data) {
    console.log(data);
});
```

---

### 5. DOM и BOM
**DOM (Document Object Model):** Программный интерфейс для HTML и XML-документов. Представляет документ в виде дерева объектов, что позволяет JavaScript взаимодействовать с элементами страницы.

**BOM (Browser Object Model):** Программный интерфейс для взаимодействия с браузером. Включает объекты `window`, `navigator`, `location`, `history`, `screen`.

**Пример использования BOM:**
```javascript
// Закрыть окно, если открыт Google
if (window.location.href === 'https://www.google.ru') {
    window.close();
}
```

---

## Группа 6: Практические Задачи (Лаконичный код)

### 1. Сделать HTTP запрос с отправкой логина и пароля
**Используя Fetch API:**
```javascript
fetch('/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'username=john&password=secret123'
})
.then(response => response.text())
.then(data => console.log(data));
```

---

### 2. Написать JSP, выводящую ошибку, если нет jsessionid
```jsp
<%@ page errorPage="error.jsp" %>
<%
if (request.getSession(false) == null) {
    throw new Exception("No jsessionid found!");
}
%>
<!-- Ваш контент -->
```

---

### 3. CSS-правило: посещённые ссылки, кроме тех, что в классе students
```css
a:visited:not(.students) {
    background-color: blue;
}
```

---

### 4. Подчеркнуть все посещенные ссылки, не лежащие в <H2>
```css
h2 a:visited,
a:visited {
    text-decoration: underline;
}
h2 a:visited {
    text-decoration: none;
}
```
*(Это немного некрасиво, но работает. Более правильный вариант — использовать `:not(h2 a)`)*

```css
a:visited:not(h2 a) {
    text-decoration: underline;
}
```

---

### 5. Повернуть все изображения в форме с id="javaIsBullShit" на 270 градусов
```css
#javaIsBullShit img {
    transform: rotate(270deg);
}
```

---

### 6. Написать функцию на JS, меняющую все `<a>` на `<button>`
```javascript
document.querySelectorAll('a').forEach(link => {
    const button = document.createElement('button');
    button.textContent = link.textContent;
    link.replaceWith(button);
});
```

---

### 7. Реализовать функцию на JS, закрывающую окно, если открыт google.ru
```javascript
if (window.location.href === 'https://www.google.ru') {
    window.close();
}
```

---

### 8. Функция на JS, запрещающая ввод не латинских букв и цифр в текстовые поля
```javascript
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keypress', e => {
        if (!/[a-zA-Z0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});
```

---

### 9. Написать сервлет, показывающий значение параметра username или "Anonymous user"
```java
@WebServlet("/user")
public class UserServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        if (username == null || username.isEmpty()) {
            username = "Anonymous user";
        }
        response.getWriter().println(username);
    }
}
```

---

### 10. Код фильтра, запрещающего доступ без заголовка "X-Application-User"
```java
@WebFilter("/*")
public class AuthFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        if (req.getHeader("X-Application-User") == null) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

---

### 11. HTML форма для отправки ответа на вопрос теста
```html
<form action="/submit-answer" method="POST">
    <input type="hidden" name="questionNumber" value="1">
    <input type="radio" name="answer" value="a"> A
    <input type="radio" name="answer" value="b"> B
    <input type="radio" name="answer" value="c"> C
    <input type="radio" name="answer" value="d"> D
    <input type="submit" value="Отправить">
</form>
```

---

### 12. JSP страница, показывающая количество пользователей за последние 60 секунд
*(Предполагая, что есть bean `UserCounter`)*
```jsp
<%@ page import="com.example.UserCounter" %>
<%
UserCounter counter = (UserCounter) application.getAttribute("userCounter");
if (counter == null) {
    counter = new UserCounter();
    application.setAttribute("userCounter", counter);
}
int count = counter.getUsersInLastMinute();
%>
<p>Пользователей за последнюю минуту: <%= count %></p>
```

---

### 13. Написать сервлет, перенаправляющий все запросы на https://google.com
```java
@WebServlet("/*")
public class RedirectServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect("https://google.com");
    }
}
```

---

### 14. HTML страница и сервлет, возвращающий количество сессий
**HTML:**
```html
<!DOCTYPE html>
<html>
<head><title>Sessions</title></head>
<body>
    <h1>Количество активных сессий: <span id="sessions">...</span></h1>
    <script>
        fetch('/sessions')
            .then(r => r.text())
            .then(sessions => document.getElementById('sessions').textContent = sessions);
    </script>
</body>
</html>
```

**Servlet:**
```java
@WebServlet("/sessions")
public class SessionCounterServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int activeSessions = getServletContext().getAttribute("activeSessions") != null ?
                (Integer) getServletContext().getAttribute("activeSessions") : 0;
        response.setContentType("text/plain");
        response.getWriter().write(String.valueOf(activeSessions));
    }
}
```

---

### 15. Код JSP, отображающий корзину покупателя
*(Предполагая, что есть managed bean `cart` со списком `ShoppingItem`)*
```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<h2>Корзина</h2>
<c:if test="${empty cart.items}">
    <p>Корзина пуста.</p>
</c:if>
<c:forEach var="item" items="${cart.items}">
    <div>
        <span>${item.name}</span>
        <span>${item.price} руб.</span>
        <span>Кол-во: ${item.quantity}</span>
    </div>
</c:forEach>
```

---

### 16. Написать правило CSS, чтобы по клику все ссылки, кроме внутри h1, подчеркивались
```css
a:link, a:visited {
    text-decoration: none;
}
a:link:active, a:visited:active {
    text-decoration: underline;
}
h1 a:link:active, h1 a:visited:active {
    text-decoration: none;
}
```

---

### 17. HTML+CSS: скрывать содержимое, если экран < 1024px
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        @media (max-width: 1023px) {
            body {
                display: none;
            }
            .message {
                display: block;
                font-size: 24px;
                text-align: center;
                margin-top: 20%;
            }
        }
        .message {
            display: none;
        }
    </style>
</head>
<body>
    <div class="content">
        <!-- Ваше основное содержимое -->
    </div>
    <div class="message">Разрешение экрана не поддерживается</div>
</body>
</html>
```

---

### 18. Написать фрагмент кода, блокирующий контент при ширине экрана < 1024 пикселей
```css
@media (max-width: 1023px) {
    body {
        display: none;
    }
    body::after {
        content: "Разрешение экрана не поддерживается";
        display: block;
        font-size: 24px;
        text-align: center;
        padding: 20px;
    }
}
```

---

### 19. Написать js функцию, заменяющую содержимое <div class="nyan"> на изображение
```javascript
document.querySelector('.nyan').innerHTML = '<img src="http://www.example.com/nyancat.gif">';
```

---

### 20. Написать js функцию, заменяющую все текстовые поля на кнопки с тем же текстом
```javascript
document.querySelectorAll('input[type="text"]').forEach(input => {
    const button = document.createElement('button');
    button.textContent = input.value;
    input.replaceWith(button);
});
```

---

### 21. Написать сценарий, считающий количество слов "де-факто" в div class="lecture"
```javascript
let count = 0;
document.querySelectorAll('div.lecture').forEach(div => {
    const text = div.textContent;
    const matches = text.match(/де-факто/gi);
    if (matches) count += matches.length;
});
console.log(count);
```

---

### 22. Написать AJAX запрос, получающий JSON и выводящий его элементы
```javascript
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        for (let key in data) {
            console.log(`${key}: ${data[key]}`);
        }
    });
```

---

### 23. Написать правило CSS, рисующее границу в 1 пиксель для картинок в блоках новостей при наведении
```css
.news img:hover {
    border: 1px solid black;
}
```

---

### 24. Написать правило CSS, устанавливающее жёлтый фон для всех посещённых ссылок, кроме тех, кто лежит в news
```css
a:visited {
    background-color: yellow;
}
.news a:visited {
    background-color: transparent;
}
```

---

### 25. Написать структуру HTTP запроса, отправляющего логин и пароль
```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 27

username=john&password=secret123
```

---

### 26. Написать JSP страницу, проверяющую jsessionid
```jsp
<%
if (request.getSession(false) == null) {
    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Session ID not found");
    return;
}
%>
<!-- Ваш контент -->
```

---

### 27. Написать код сервлета, принимающего параметр name и выводящего его
```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String name = request.getParameter("name");
        response.getWriter().println("Hello, " + name + "!");
    }
}
```

---

### 28. Написать конфигурацию сервлета с помощью аннотации
```java
@WebServlet(urlPatterns = {"*.html", "*.xhtml"})
public class MyServlet extends HttpServlet {
    // ...
}
```

---

### 29. Написать код фильтра, определяющего наличие атрибута
```java
@WebFilter("/*")
public class AttributeFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request.getAttribute("requiredAttribute") == null) {
            ((HttpServletResponse) response).sendError(HttpServletResponse.SC_BAD_REQUEST, "Required attribute missing");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

---

### 30. Написать функцию на JavaScript, запрещающую ввод не латинских букв и цифр
```javascript
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keypress', e => {
        if (!e.key.match(/[a-zA-Z0-9]/)) {
            e.preventDefault();
        }
    });
});
```

---

### 31. Написать код JSP, который заменяет все гиперссылки на текстовое поле со значением ссылки
```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:forEach var="link" items="${links}">
    <input type="text" value="${link.href}" readonly>
</c:forEach>
```

---

### 32. Написать шаблон и код инициализации контекста Thymeleaf для курсов валют
**Шаблон (currency.html):**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head><title>Курсы валют</title></head>
<body>
    <h2>Курсы валют</h2>
    <table>
        <tr>
            <th>Валюта</th>
            <th>Курс</th>
            <th>Динамика</th>
        </tr>
        <tr th:each="currency : ${currencies}">
            <td th:text="${currency.name}">USD</td>
            <td th:text="${currency.rate}">75.00</td>
            <td th:text="${currency.change}">+0.5%</td>
        </tr>
    </table>
</body>
</html>
```

**Код инициализации (в сервлете или контроллере):**
```java
// Создание контекста
Context context = new Context();
context.setVariable("currencies", currencyService.getCurrencyRates());

// Обработка шаблона
String html = templateEngine.process("currency", context);

// Отправка ответа
response.setContentType("text/html; charset=UTF-8");
response.getWriter().write(html);
```

---

### 33. Написать JSP страницу, отсортированную по времени получения оценки (FreeMarker)
**Шаблон (grades.ftl):**
```ftl
<#list grades?sort_by("time") as grade>
    <p>${grade.studentName}: ${grade.grade} (${grade.time})</p>
</#list>
```

**Код в сервлете:**
```java
// Создание модели данных
Map<String, Object> model = new HashMap<>();
model.put("grades", gradesList); // Список объектов с полями studentName, grade, time

// Обработка шаблона
Template template = cfg.getTemplate("grades.ftl");
template.process(model, response.getWriter());
```

---

### 34. Написать функцию на JavaScript, которая закроет текущее окно, если в нем открыт https://www.google.ru
```javascript
if (window.location.href === 'https://www.google.ru') {
    window.close();
}
```

---

### 35. Написать CSS правило, устанавливающее красную границу для картинок в блоках новостей при наведении
```css
.news img:hover {
    border: 1px solid red;
}
```

---

### 36. Написать правило CSS, устанавливающее синий цвет фона для всех посещенных ссылок, кроме тех, которые находятся в элементах с классом students
```css
a:visited {
    background-color: blue;
}
.students a:visited {
    background-color: transparent;
}
```

---

### 37. Написать код JSP, который будет выводить ошибку и стек ошибки, если не отправлен jsessionid
```jsp
<%@ page isErrorPage="true" %>
<%
if (request.getSession(false) == null) {
    out.println("<h1>Error: No jsessionid found!</h1>");
    exception.printStackTrace(out);
}
%>
```

---

### 38. Написать HTML форму, отправляющую ответ на вопрос из теста
```html
<form action="/submit-answer" method="POST">
    <input type="hidden" name="questionNumber" value="1">
    <label><input type="radio" name="answer" value="a"> A</label>
    <label><input type="radio" name="answer" value="b"> B</label>
    <label><input type="radio" name="answer" value="c"> C</label>
    <input type="submit" value="Отправить">
</form>
```

---

### 39. Написать код фильтра, запрещающего доступ к приложению неавторизованным пользователям
```java
@WebFilter("/*")
public class AuthFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        if (req.getHeader("X-Application-User") == null) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

---

### 40. Написать код сервлета, который будет перенаправлять все запросы на https://google.com
```java
@WebServlet("/*")
public class RedirectServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect("https://google.com");
    }
}
```

---

### 41. Написать код JSP, отображающий корзину покупателя
```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<h2>Корзина</h2>
<c:forEach var="item" items="${cart.items}">
    <div>
        <span>${item.name}</span>
        <span>${item.price} руб.</span>
        <span>Кол-во: ${item.quantity}</span>
    </div>
</c:forEach>
```

---

