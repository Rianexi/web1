package web;

import java.math.BigDecimal;

public class JsonParser {

    // Парсинг URL параметров из GET/POST запроса вида: x=1&y=2&r=3
    public BigDecimal[] parseUrlParams(String queryString) throws IllegalArgumentException {
        if (queryString == null || queryString.trim().isEmpty()) {
            throw new IllegalArgumentException("Отсутствуют параметры запроса");
        }

        try {
            String[] params = queryString.split("&");
            BigDecimal x = null, y = null, r = null;

            for (String param : params) {
                String[] keyValue = param.split("=");
                if (keyValue.length != 2) continue;

                String key = keyValue[0].trim();
                String value = keyValue[1].trim().replace(",", ".");

                switch (key) {
                    case "x":
                        x = new BigDecimal(value);
                        break;
                    case "y":
                        y = new BigDecimal(value);
                        break;
                    case "r":
                        r = new BigDecimal(value);
                        break;
                }
            }

            if (x == null || y == null || r == null) {
                throw new IllegalArgumentException("Отсутствуют обязательные параметры x, y или r");
            }

            return new BigDecimal[] { x, y, r };

        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Некорректное числовое значение");
        } catch (Exception e) {
            throw new IllegalArgumentException("Ошибка парсинга параметров");
        }
    }
}