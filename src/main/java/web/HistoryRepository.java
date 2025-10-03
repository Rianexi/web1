package web;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class HistoryRepository {
    private final String historyFilePath;

    public HistoryRepository(String historyFilePath) {
        this.historyFilePath = historyFilePath;
    }

    public String readJsonArray() {
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

    public void writeJsonArray(String json) {
        try {
            try (FileOutputStream out = new FileOutputStream(new File(historyFilePath))) {
                out.write(json.getBytes(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            // ignore
        }
    }

    public List<String> readObjects() {
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

    public void writeObjects(List<String> objects) {
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