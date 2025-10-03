package web;

import java.math.BigDecimal;
import java.math.MathContext;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class JsonParser implements RequestParser {
    private static final MathContext MC = new MathContext(100);
    private String originalYString = null;

    @Override
    public BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException {
        if (requestString == null || requestString.trim().isEmpty()) {
            throw new IllegalArgumentException("Отсутствуют параметры запроса");
        }
        requestString = requestString.trim();

        if (requestString.startsWith("{") && requestString.endsWith("}")) {
            return parseJsonLike(requestString);
        } else {
            return parseQueryString(requestString);
        }
    }

    @Override
    public String getOriginalYString() {
        return originalYString;
    }

    private BigDecimal[] parseJsonLike(String json) {
        try {
            String cleaned = json.replaceAll("[{}\"]", "");
            String[] parts = cleaned.split(",");

            String xStr = null, yStr = null, rStr = null;
            for (String part : parts) {
                String[] kv = part.split(":");
                if (kv.length != 2) continue;
                String key = kv[0].trim();
                String value = kv[1].trim().replace(",", ".");
                if ("x".equals(key)) xStr = value;
                else if ("y".equals(key)) yStr = value;
                else if ("r".equals(key)) rStr = value;
            }

            if (xStr == null || yStr == null || rStr == null) {
                throw new IllegalArgumentException("Invalid JSON: missing x, y or r");
            }

            this.originalYString = yStr;
            if (!yStr.matches("^-?\\d*\\.?\\d+$")) {
                throw new IllegalArgumentException("Y must be a valid decimal number");
            }

            BigDecimal x = new BigDecimal(xStr, MC);
            BigDecimal y = new BigDecimal(yStr, MC);
            BigDecimal r = new BigDecimal(rStr, MC);
            return new BigDecimal[] { x, y, r };
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JSON format: " + e.getMessage());
        }
    }

    private BigDecimal[] parseQueryString(String query) {
        try {
            String[] params = query.split("&");
            String xStr = null, yStr = null, rStr = null;
            for (String p : params) {
                String[] kv = p.split("=");
                if (kv.length != 2) continue;
                String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(kv[1], StandardCharsets.UTF_8).replace(",", ".");
                if ("x".equals(key)) xStr = value;
                else if ("y".equals(key)) yStr = value;
                else if ("r".equals(key)) rStr = value;
            }
            if (xStr == null || yStr == null || rStr == null) {
                throw new IllegalArgumentException("Отсутствуют обязательные параметры x, y или r");
            }
            this.originalYString = yStr;
            BigDecimal x = new BigDecimal(xStr, MC);
            BigDecimal y = new BigDecimal(yStr, MC);
            BigDecimal r = new BigDecimal(rStr, MC);
            return new BigDecimal[] { x, y, r };
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Некорректное числовое значение");
        } catch (Exception e) {
            throw new IllegalArgumentException("Ошибка парсинга параметров");
        }
    }
}