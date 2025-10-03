package web;

import com.fastcgi.FCGIInterface;
import java.io.IOException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.net.URLDecoder;

public class ResponseSender {
    private final Checker checker = new Checker();
    private final JsonParser parser = new JsonParser();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
    private static final int HISTORY_LIMIT = 1000;
    private final String historyFilePath = System.getenv().getOrDefault("HISTORY_FILE", "history.json");

    public void sendResponse() {
        try {
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");

            // Единая точка входа под /fcgi-bin/labwork1.jar
            String action = getQueryParam(queryString, "action");
            if (action == null || action.isEmpty()) action = "calc"; // по умолчанию расчёт

            // Разрешаем GET для истории и очисток; POST обязателен только для calc
            if ("calc".equalsIgnoreCase(action)) {
                if (method == null || !"POST".equalsIgnoreCase(method)) {
                    sendMethodNotAllowed("Only POST is allowed for calc. Received: " + method);
                    return;
                }
            }
            if ("history".equalsIgnoreCase(action)) {
                String historyJson = readHistoryJson();
                sendRawJsonArray(historyJson);
                return;
            }
            if ("clear".equalsIgnoreCase(action)) {
                writeHistoryJson("[]");
                sendJson(Map.of("success", true));
                return;
            }
            if ("clearSelected".equalsIgnoreCase(action)) {
                String ids = getQueryParam(queryString, "ids");
                if (ids != null && !ids.isEmpty()) {
                    List<String> list = readHistoryObjects();
                    String[] parts = ids.split(",");
                    for (int i = parts.length - 1; i >= 0; i--) {
                        try {
                            int idx = Integer.parseInt(parts[i].trim());
                            if (idx >= 0 && idx < list.size()) list.remove(idx);
                        } catch (NumberFormatException ignore) {}
                    }
                    writeHistoryObjects(list);
                }
                sendJson(Map.of("success", true));
                return;
            }

            long startTime = System.nanoTime();
            BigDecimal[] data = parser.getBigDecimals(queryString);
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
            item.put("y", parser.getOriginalYString() != null ? parser.getOriginalYString() : y.toString());
            item.put("r", r);
            item.put("result", hit);
            item.put("now", dateFormat.format(new Date()));
            item.put("timeMs", scriptTimeMs);

            // Персистим в history.json (препендим запись)
            List<String> history = readHistoryObjects();
            history.add(0, toJson(item));
            if (history.size() > HISTORY_LIMIT) history = new ArrayList<>(history.subList(0, HISTORY_LIMIT));
            writeHistoryObjects(history);

            Map<String, Object> response = new LinkedHashMap<>();
            response.putAll(item);
            response.put("time", scriptTimeNs);
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
                "Status: 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
                json.getBytes(StandardCharsets.UTF_8).length, json
        );
        try {
            System.out.write(httpResponse.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendRawJsonArray(String jsonArray) {
        String json = (jsonArray == null || jsonArray.isBlank()) ? "[]" : jsonArray;
        String httpResponse = String.format(
                "Status: 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
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

    private String getQueryParam(String query, String key) {
        if (query == null || query.isEmpty() || key == null) return null;
        try {
            String[] parts = query.split("&");
            for (String p : parts) {
                int eq = p.indexOf('=');
                if (eq <= 0) continue;
                String k = URLDecoder.decode(p.substring(0, eq), StandardCharsets.UTF_8);
                if (key.equals(k)) {
                    return URLDecoder.decode(p.substring(eq + 1), StandardCharsets.UTF_8);
                }
            }
        } catch (Exception ignore) {}
        return null;
    }

    private String readHistoryJson() {
        try {
            File f = new File(historyFilePath);
            if (!f.exists()) return "[]";
            try (FileInputStream in = new FileInputStream(f)) {
                byte[] data = in.readAllBytes();
                String s = new String(data, StandardCharsets.UTF_8).trim();
                if (s.isEmpty()) return "[]";
                return s;
            }
        } catch (IOException e) {
            return "[]";
        }
    }

    private void writeHistoryJson(String json) {
        try {
            try (FileOutputStream out = new FileOutputStream(new File(historyFilePath))) {
                out.write(json.getBytes(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            // ignore
        }
    }

    private List<String> readHistoryObjects() {
        String json = readHistoryJson();
        List<String> res = new ArrayList<>();
        String s = json.trim();
        if (s.length() < 2 || s.charAt(0) != '[' || s.charAt(s.length()-1) != ']') return res;
        s = s.substring(1, s.length()-1).trim();
        if (s.isEmpty()) return res;
        // Разбираем по верхнеуровневым запятым
        int depth = 0; int start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '{') depth++;
            else if (c == '}') depth--;
            else if (c == ',' && depth == 0) {
                res.add(s.substring(start, i).trim());
                start = i + 1;
            }
        }
        res.add(s.substring(start).trim());
        return res;
    }

    private void writeHistoryObjects(List<String> objects) {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < objects.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(objects.get(i));
        }
        sb.append(']');
        writeHistoryJson(sb.toString());
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