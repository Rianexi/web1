package web;

import com.fastcgi.FCGIInterface;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.List;

public class ResponseSender {
    private final Checker checker = new Checker();
    private final JsonParser parser = new JsonParser();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
    // Простое хранение истории в памяти процесса FastCGI
    private static final List<Map<String, Object>> HISTORY = new LinkedList<>();
    private static final int HISTORY_LIMIT = 1000;

    public void sendResponse() {
        try {
            String uri = FCGIInterface.request.params.getProperty("REQUEST_URI");
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            if (uri == null || uri.isEmpty()) {
                // Fallback: определяем по PATH_INFO или SCRIPT_NAME
                String pathInfo = FCGIInterface.request.params.getProperty("PATH_INFO");
                String scriptName = FCGIInterface.request.params.getProperty("SCRIPT_NAME");
                if (pathInfo != null && !pathInfo.isEmpty()) uri = pathInfo;
                else if (scriptName != null && !scriptName.isEmpty()) uri = scriptName;
                else uri = "/calculate"; // по умолчанию основной эндпоинт
            }

            if (uri.startsWith("/history")) {
                // Отдаём историю GET-запросом
                sendJsonList(HISTORY);
                return;
            }

            if (!uri.startsWith("/calculate")) {
                sendError("Unknown endpoint: " + uri);
                return;
            }

            long startTime = System.nanoTime();
            if (method == null || !"POST".equalsIgnoreCase(method)) {
                sendMethodNotAllowed("Only POST method is allowed. Received: " + method);
                return;
            }

            String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");
            BigDecimal[] data = parser.parseUrlParams(queryString);
            BigDecimal x = data[0];
            BigDecimal y = data[1];
            BigDecimal r = data[2];

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

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("x", x);
            item.put("y", y);
            item.put("r", r);
            item.put("result", hit);
            item.put("now", dateFormat.format(new Date()));
            item.put("timeMs", scriptTimeMs);

            synchronized (HISTORY) {
                HISTORY.add(0, item);
                if (HISTORY.size() > HISTORY_LIMIT) {
                    HISTORY.remove(HISTORY.size() - 1);
                }
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.putAll(item);
            response.put("time", scriptTimeNs);
            response.put("history", HISTORY);

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

    private void sendJsonList(List<Map<String, Object>> list) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Map<String, Object> item : list) {
            if (!first) sb.append(",");
            first = false;
            sb.append(toJson(item));
        }
        sb.append("]");
        String json = sb.toString();
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
            sb.append(toJsonValue(entry.getValue()));
        }
        sb.append("}");
        return sb.toString();
    }

    private String toJsonValue(Object value) {
        if (value == null) return "null";
        if (value instanceof String) {
            return "\"" + escapeJson((String) value) + "\"";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return String.valueOf(value);
        }
        if (value instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = (Map<String, Object>) value;
            return toJson(m);
        }
        if (value instanceof Iterable) {
            StringBuilder arr = new StringBuilder("[");
            boolean first = true;
            for (Object item : (Iterable<?>) value) {
                if (!first) arr.append(",");
                first = false;
                arr.append(toJsonValue(item));
            }
            arr.append("]");
            return arr.toString();
        }
        return "\"" + escapeJson(String.valueOf(value)) + "\"";
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