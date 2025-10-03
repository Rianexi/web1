package web;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

public class PointService { // зависимости
    private final Checker checker;
    private final HistoryRepository historyRepo;
    private final JsonSerializer jsonSerializer;
    private final SimpleDateFormat dateFormat;
    private final int historyLimit;

    public PointService(Checker checker, HistoryRepository historyRepo, JsonSerializer jsonSerializer, int historyLimit) {
        this.checker = checker; // принятие зависимостей
        this.historyRepo = historyRepo;
        this.jsonSerializer = jsonSerializer;
        this.dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
        this.historyLimit = historyLimit;
    }
   // главная проверка точки
    public Map<String, Object> checkPoint(BigDecimal x, BigDecimal y, BigDecimal r, String originalYString) {
        long startTime = System.nanoTime();

        checker.validate(x, y, r);
        boolean hit = checker.isHit(x, y, r);

        long endTime = System.nanoTime();
        long scriptTimeNs = endTime - startTime;
        long scriptTimeMs = Math.max(0, scriptTimeNs / 1_000_000);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("x", x);
        result.put("y", originalYString != null ? originalYString : y.toString());
        result.put("r", r);
        result.put("result", hit);
        result.put("now", dateFormat.format(new Date()));
        result.put("timeMs", scriptTimeMs);
        result.put("time", scriptTimeNs);

        saveToHistory(result);

        return result;
    }

    private void saveToHistory(Map<String, Object> result) {
        List<String> history = historyRepo.readObjects();
        Map<String, Object> historyItem = new LinkedHashMap<>(result);
        historyItem.remove("time");
        history.add(0, jsonSerializer.toJson(historyItem));
        if (history.size() > historyLimit) {
            history = new ArrayList<>(history.subList(0, historyLimit));
        }
        historyRepo.writeObjects(history);
    }

    public String getHistory() {
        return historyRepo.readJsonArray();
    }

    public void clearHistory() {
        historyRepo.writeJsonArray("[]");
    }

    public void clearSelectedHistory(String ids) {
        if (ids == null || ids.isEmpty()) return;

        List<String> history = historyRepo.readObjects();
        String[] parts = ids.split(",");

        List<Integer> indices = new ArrayList<>();
        for (String part : parts) {
            try {
                int idx = Integer.parseInt(part.trim());
                if (idx >= 0 && idx < history.size()) {
                    indices.add(idx);
                }
            } catch (NumberFormatException ignore) {}
        }

        indices.sort(Collections.reverseOrder());
        for (int idx : indices) {
            history.remove(idx);
        }

        historyRepo.writeObjects(history);
    }
}