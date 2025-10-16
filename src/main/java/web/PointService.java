package web;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

public class PointService {
    private final Checker checker;
    private final SimpleDateFormat dateFormat;
    private final HttpResponseSender httpSender;

    public PointService(Checker checker, HttpResponseSender httpSender) {
        this.checker = checker;
        this.httpSender = httpSender;
        this.dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
    }

    public Map<String, Object> checkPoint(BigDecimal x, BigDecimal y, BigDecimal r, String originalYString) {
        long startTime = System.nanoTime();

        checker.validate(x, y, r);
        boolean hit = checker.isHit(x, y, r);

        long endTime = System.nanoTime();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("x", x);
        result.put("y", originalYString != null ? originalYString : y.toString());
        result.put("r", r);
        result.put("result", hit);
        result.put("now", dateFormat.format(new Date()));

        return result;
    }

    public Map<String, Object> checkPointForShape(BigDecimal x, BigDecimal y, BigDecimal r, String shape, String originalYString) {
        long startTime = System.nanoTime();

        checker.validate(x, y, r);
        boolean hit;
        switch (shape == null ? "" : shape.toLowerCase()) {
            case "circle":
                hit = checker.isHitCircle(x, y, r);
                break;
            case "rectangle":
                hit = checker.isHitRectangle(x, y, r);
                break;
            case "triangle":
                hit = checker.isHitTriangle(x, y, r);
                break;
            default:
                throw new IllegalArgumentException("Unknown shape: " + shape);
        }

        long endTime = System.nanoTime();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("x", x);
        result.put("y", originalYString != null ? originalYString : y.toString());
        result.put("r", r);
        result.put("result", hit);
        result.put("shape", shape);
        result.put("now", dateFormat.format(new Date()));

        return result;
    }
}