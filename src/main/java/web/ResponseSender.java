package web;

import com.fastcgi.FCGIInterface;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

public class ResponseSender {
    private final Checker checker = new Checker();
    private final JsonParser parser = new JsonParser();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

    public void sendResponse() {
        try {
            long startTime = System.nanoTime();

            // Проверка метода запроса
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            if (method == null || !"POST".equalsIgnoreCase(method)) {
                sendMethodNotAllowed("Only POST method is allowed. Received: " + method);
                return;
            }

            // Получение параметров из QUERY_STRING (ваш фронт отправляет как /calculate?x=1&y=2&r=3)
            String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");
            BigDecimal[] data = parser.parseUrlParams(queryString);
            BigDecimal x = data[0];
            BigDecimal y = data[1];
            BigDecimal r = data[2];

            // Валидация на сервере
            try {
                this.checker.validate(x, y, r);
            } catch (IllegalArgumentException e) {
                sendError(e.getMessage());
                return;
            }

            boolean hit = this.checker.isHit(x, y, r);
            long endTime = System.nanoTime();
            long scriptTimeNs = endTime - startTime;
            long scriptTimeMs = Math.max(0, scriptTimeNs / 1_000_000);

            // Формат ответа под ваш фронтенд
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("result", hit); // ваш фронт ждет data.result
            response.put("now", dateFormat.format(new Date())); // ваш фронт ждет data.now
            response.put("time", scriptTimeNs); // nanoseconds (для совместимости)
            response.put("timeMs", scriptTimeMs); // миллисекунды для нормального отображения

            sendJson(response);
        } catch (IllegalArgumentException e) {
            sendError(e.getMessage());
        } catch (Exception e) {
            sendServerError("Server error: " + e.getMessage());
        }
    }

    private void sendJson(Map<String, Object> map) {
        String json = toJson(map);
        String httpResponse = String.format(
                "Status: 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
                json.getBytes(StandardCharsets.UTF_8).length, json
        );
        try {
            System.out.write(httpResponse.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendError(String message) {
        String json = String.format("{\"reason\":\"%s\"}", escapeJson(message));
        String httpResponse = String.format(
                "Status: 400 Bad Request\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
                json.getBytes(StandardCharsets.UTF_8).length, json
        );
        try {
            System.out.write(httpResponse.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendMethodNotAllowed(String message) {
        String json = String.format("{\"reason\":\"%s\"}", escapeJson(message));
        String httpResponse = String.format(
                "Status: 405 Method Not Allowed\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAllow: POST\r\nContent-Length: %d\r\n\r\n%s",
                json.getBytes(StandardCharsets.UTF_8).length, json
        );
        try {
            System.out.write(httpResponse.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendServerError(String message) {
        String json = String.format("{\"reason\":\"%s\"}", escapeJson(message));
        String httpResponse = String.format(
                "Status: 500 Internal Server Error\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
                json.getBytes(StandardCharsets.UTF_8).length, json
        );
        try {
            System.out.write(httpResponse.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;

            sb.append("\"").append(escapeJson(entry.getKey())).append("\":");
            Object val = entry.getValue();
            if (val instanceof String) {
                sb.append("\"").append(escapeJson((String)val)).append("\"");
            } else {
                sb.append(val);
            }
        }
        sb.append("}");
        return sb.toString();
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}