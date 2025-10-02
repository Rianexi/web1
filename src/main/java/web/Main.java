package web;

import com.fastcgi.FCGIInterface;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class Main {
    private static final String RESULT_JSON = """
            {
                "time": "%s",
                "now": "%s",
                "result": %b
            }
            """;
    private static final String ERROR_JSON = """
            {
                "now": "%s",
                "reason": "%s"
            }
            """;

    private static String buildCgiResponse(int statusCode, String statusText, String bodyUtf8) {
        int contentLength = bodyUtf8.getBytes(StandardCharsets.UTF_8).length;
        return "Status: " + statusCode + " " + statusText + "\r\n"
                + "Content-Type: application/json\r\n"
                + "Content-Length: " + contentLength + "\r\n"
                + "\r\n"
                + bodyUtf8;
    }

    public static void main(String[] args) {
        var fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            try {
                var queryParams = System.getProperties().getProperty("QUERY_STRING");
                // Лог входящего запроса на бэкенде
                System.err.println("[FCGI] Incoming request: QUERY_STRING=" + queryParams);

                var params = new Params(queryParams);

                var startTime = Instant.now();
                var result = calculate(params.getX(), params.getY(), params.getR());
                var endTime = Instant.now();

                var nanos = ChronoUnit.NANOS.between(startTime, endTime);
                var json = String.format(RESULT_JSON, nanos, LocalDateTime.now(), result);
                var response = buildCgiResponse(200, "OK", json);
                // Лог успешного результата на бэкенде
                System.err.println("[FCGI] OK x=" + params.getX() + ", y=" + params.getY() + ", r=" + params.getR() + ", timeNanos=" + nanos + ", result=" + result);
                System.out.println(response);
            } catch (ValidationException e) {
                var json = String.format(ERROR_JSON, LocalDateTime.now(), e.getMessage());
                var response = buildCgiResponse(400, "Bad Request", json);
                // Лог ошибки на бэкенде
                System.err.println("[FCGI] ERROR: " + e.getMessage());
                System.out.println(response);
            }
        }
    }

    private static boolean calculate(float x, float y, float r) {
        // Прямоугольник в I четверти: 0 <= x <= r/2, 0 <= y <= r
        if (x >= 0 && y >= 0) {
            return x <= r / 2 && y <= r;
        }

        // Четверть круга во II четверти: x^2 + y^2 <= (r/2)^2
        if (x <= 0 && y >= 0) {
            return (x * x + y * y) <= (r / 2) * (r / 2);
        }

        // Треугольник в IV четверти: 0 <= x <= r, -r <= y <= 0 и y >= x - r
        if (x >= 0 && y <= 0) {
            return x <= r && y >= -r && y >= x - r;
        }

        // В III четверти область отсутствует
        return false;
    }
}