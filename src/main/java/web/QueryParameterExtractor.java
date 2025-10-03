package web;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class QueryParameterExtractor { // для извлечения параметров из query string

    public String getParameter(String queryString, String key) {
        if (queryString == null || queryString.isEmpty() || key == null) return null;
        try {
            String[] parts = queryString.split("&");
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
}