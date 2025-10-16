package web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class HttpResponseSender {

    public void sendOkResponse(Map<String, Object> data) {
        String json = mapToJson(data);
        sendRawJsonResponse(json, 200, "OK");
    }

    public void sendBadRequest(String message) {
        String json = "{\"reason\":\"" + escapeJson(message) + "\"}";
        sendRawJsonResponse(json, 400, "Bad Request");
    }

    public void sendMethodNotAllowed(String message) {
        String json = "{\"reason\":\"" + escapeJson(message) + "\"}";
        sendRawJsonResponse(json, 405, "Method Not Allowed");
    }

    public void sendServerError(String message) {
        String json = "{\"reason\":\"" + escapeJson(message) + "\"}";
        sendRawJsonResponse(json, 500, "Internal Server Error");
    }

    private void sendRawJsonResponse(String json, int statusCode, String statusText) {
        StringBuilder headers = new StringBuilder();
        headers.append(String.format("Status: %d %s\r\n", statusCode, statusText));
        headers.append("Content-Type: application/json; charset=utf-8\r\n");
        headers.append("Access-Control-Allow-Origin: *\r\n");
        headers.append(String.format("Content-Length: %d\r\n\r\n", json.getBytes(StandardCharsets.UTF_8).length));
        headers.append(json);
        writeResponse(headers.toString());
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(escapeJson(entry.getKey())).append("\":");
            Object value = entry.getValue();
            if (value == null) {
                json.append("null");
            } else if (value instanceof String) {
                json.append("\"").append(escapeJson((String) value)).append("\"");
            } else if (value instanceof Boolean) {
                json.append(value.toString());
            } else {
                json.append("\"").append(escapeJson(value.toString())).append("\"");
            }
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    private String escapeJson(String str) {
        return str.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    private void writeResponse(String response) {
        try {
            System.out.write(response.getBytes(StandardCharsets.UTF_8));
            System.out.flush();
        } catch (IOException e) {
            System.err.println("Failed to write response: " + e.getMessage());
        }
    }
}