package web;

import com.fastcgi.FCGIInterface;
import java.math.BigDecimal;
import java.util.Map;

public class ResponseSender {
    private final PointService pointService;
    private final HttpResponseSender httpSender;

    public ResponseSender(Configuration config) {
        Checker checker = new Checker();
        this.httpSender = new HttpResponseSender();
        this.pointService = new PointService(checker, this.httpSender);
    }

    public void sendResponse() {
        try {
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            String requestUri = FCGIInterface.request.params.getProperty("REQUEST_URI");

            if (!"POST".equalsIgnoreCase(method)) {
                httpSender.sendMethodNotAllowed("Only POST allowed. Received: " + method);
                return;
            }

            String path = (requestUri == null ? "/calculate" : requestUri).toLowerCase();
            switch (path) {
                case "/calculate": handleCalculation(); break;
                case "/calculate/circle": handleShape("circle"); break;
                case "/calculate/rectangle": handleShape("rectangle"); break;
                case "/calculate/triangle": handleShape("triangle"); break;
                default: httpSender.sendBadRequest("Unknown path: " + path);
            }
        } catch (IllegalArgumentException e) {
            httpSender.sendBadRequest(e.getMessage());
        } catch (Exception e) {
            httpSender.sendServerError("Server error: " + e.getMessage());
        }
    }

    private String readBody() throws Exception {
        FCGIInterface.request.inStream.fill();
        int len = FCGIInterface.request.inStream.available();
        if (len <= 0) return "";
        byte[] buf = new byte[len];
        int read = FCGIInterface.request.inStream.read(buf, 0, len);
        return read <= 0 ? "" : new String(buf, java.nio.charset.StandardCharsets.UTF_8);
    }

    private BigDecimal[] parseJson(String json) {
        String clean = json.replaceAll("[{}\"]", "");
        String[] parts = clean.split(",");

        String x = null, y = null, r = null;
        for (String part : parts) {
            String[] kv = part.split(":");
            if (kv.length == 2) {
                String key = kv[0].trim();
                String value = kv[1].trim();
                switch (key) {
                    case "x": x = value; break;
                    case "y": y = value; break;
                    case "r": r = value; break;
                }
            }
        }

        if (x == null || y == null || r == null) {
            throw new IllegalArgumentException("Missing x, y or r");
        }

        return new BigDecimal[]{new BigDecimal(x), new BigDecimal(y), new BigDecimal(r)};
    }

    private void handleCalculation() throws Exception {
        long t0 = System.nanoTime();
        String body = readBody();
        BigDecimal[] data = parseJson(body);

        Map<String, Object> result = pointService.checkPoint(data[0], data[1], data[2], data[1].toString());

        double serverTotalMs = (System.nanoTime() - t0) / 1_000_000.0;
        result.put("serverTotalMs", String.format(java.util.Locale.US, "%.3f", serverTotalMs));

        httpSender.sendOkResponse(result);
    }

    private void handleShape(String shape) throws Exception {
        long t0 = System.nanoTime();
        String body = readBody();
        BigDecimal[] data = parseJson(body);

        Map<String, Object> result = pointService.checkPointForShape(data[0], data[1], data[2], shape, data[1].toString());

        double serverTotalMs = (System.nanoTime() - t0) / 1_000_000.0;
        result.put("serverTotalMs", String.format(java.util.Locale.US, "%.3f", serverTotalMs));

        httpSender.sendOkResponse(result);
    }
}