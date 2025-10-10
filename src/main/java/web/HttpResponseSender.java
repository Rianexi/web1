package web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

public class HttpResponseSender {
    private final JsonSerializer jsonSerializer;
    private final List<String> setCookieHeaders = new ArrayList<>();

    public HttpResponseSender(JsonSerializer jsonSerializer) {
        this.jsonSerializer = jsonSerializer;
    }

    public void addCookie(String name, String value, String attributes) {
        if (name == null || name.isEmpty()) return;
        String encodedValue;
        try {
            encodedValue = URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            encodedValue = value == null ? "" : value;
        }
        String attr = (attributes == null || attributes.isEmpty()) ? "" : "; " + attributes;
        setCookieHeaders.add(name + "=" + encodedValue + attr);
    }

    public void sendJsonResponse(Map<String, Object> data, int statusCode, String statusText) {
        String json = jsonSerializer.toJson(data);
        sendRawJsonResponse(json, statusCode, statusText);
    }

    public void sendRawJsonResponse(String json, int statusCode, String statusText) { // отправка готового джсон строки с заголовками
        StringBuilder headers = new StringBuilder();
        headers.append(String.format("Status: %d %s\r\n", statusCode, statusText));
        headers.append("Content-Type: application/json; charset=utf-8\r\n");
        headers.append("Access-Control-Allow-Origin: *\r\n");
        for (String cookie : setCookieHeaders) {
            headers.append("Set-Cookie: ").append(cookie).append("\r\n");
        }
        headers.append(String.format("Content-Length: %d\r\n\r\n", json.getBytes(StandardCharsets.UTF_8).length));
        headers.append(json);
        writeResponse(headers.toString());
        setCookieHeaders.clear();
    }

    public void sendOkResponse(Map<String, Object> data) {
        sendJsonResponse(data, 200, "OK");
    }

    public void sendErrorResponse(String message, int statusCode, String statusText) {
        Map<String, Object> error = Map.of("reason", message);
        sendJsonResponse(error, statusCode, statusText);
    }

    public void sendBadRequest(String message) {
        sendErrorResponse(message, 400, "Bad Request");
    }

    public void sendMethodNotAllowed(String message) {
        sendErrorResponse(message, 405, "Method Not Allowed");
    }

    public void sendServerError(String message) {
        sendErrorResponse(message, 500, "Internal Server Error");
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