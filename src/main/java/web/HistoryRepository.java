package web;

import com.fastcgi.FCGIInterface;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class HistoryRepository {
    private final String cookieName;

    public HistoryRepository() {
        this.cookieName = "history";
    }

    public String readJsonArray() { // читаем историю из печенек
        try {
            Properties props = FCGIInterface.request.params;
            String cookieHeader = props.getProperty("HTTP_COOKIE");
            if (cookieHeader == null || cookieHeader.isEmpty()) return "[]";
            String[] cookies = cookieHeader.split(";\\s*");
            for (String c : cookies) {
                int idx = c.indexOf('=');
                if (idx <= 0) continue;
                String name = c.substring(0, idx).trim();
                String value = c.substring(idx + 1).trim();
                if (cookieName.equals(name)) {
                    try {
                        String decoded = URLDecoder.decode(value, StandardCharsets.UTF_8);
                        String s = decoded.trim();
                        if (s.isEmpty()) return "[]";
                        if (s.charAt(0) == '[' && s.charAt(s.length()-1) == ']') return s;
                        return "[]";
                    } catch (Exception e) {
                        return "[]";
                    }
                }
            }
            return "[]";
        } catch (Exception e) {
            return "[]";
        }
    }

    public void writeJsonArray(String json) {
    }

    public List<String> readObjects() { // парсинг json массива для лута обьектов
        String json = readJsonArray();
        List<String> res = new ArrayList<>();
        String s = json.trim();
        if (s.length() < 2 || s.charAt(0) != '[' || s.charAt(s.length()-1) != ']') return res;
        s = s.substring(1, s.length()-1).trim();
        if (s.isEmpty()) return res;
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

    public void writeObjects(List<String> objects) { // запись списка обьектов в массивчик json
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < objects.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(objects.get(i));
        }
        sb.append(']');
        writeJsonArray(sb.toString());
    }
}