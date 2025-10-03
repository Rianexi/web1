package web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class HttpResponseSender {
    private final JsonSerializer jsonSerializer;

    public HttpResponseSender(JsonSerializer jsonSerializer) {
        this.jsonSerializer = jsonSerializer;
    }

    public void sendJsonResponse(Map<String, Object> data, int statusCode, String statusText) {
        String json = jsonSerializer.toJson(data);
        sendRawJsonResponse(json, statusCode, statusText);
    }

    public void sendRawJsonResponse(String json, int statusCode, String statusText) { // отправка готового джсон строки с заголовками
        String response = String.format(
                "Status: %d %s\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\n\r\n%s",
                statusCode, statusText, json.getBytes(StandardCharsets.UTF_8).length, json
        );
        writeResponse(response);
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