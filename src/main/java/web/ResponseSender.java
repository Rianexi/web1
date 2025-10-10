package web;

import com.fastcgi.FCGIInterface;
import java.math.BigDecimal;
import java.util.Map;

public class ResponseSender { // данген мастер в мире обработки хттп
    private final RequestParser parser;
    private final PointService pointService;
    private final HttpResponseSender httpSender;
    

    public ResponseSender(Configuration config) {
        this.parser = new JsonParser();

        Checker checker = new Checker();
        HistoryRepository historyRepo = new HistoryRepository();
        JsonSerializer jsonSerializer = new JsonSerializer();

        this.httpSender = new HttpResponseSender(jsonSerializer);
        this.pointService = new PointService(checker, historyRepo, jsonSerializer, config.getHistoryLimit(), this.httpSender);
        
    }

    public void sendResponse() {
        try {
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            String requestUri = FCGIInterface.request.params.getProperty("REQUEST_URI");

            if (method == null || !"POST".equalsIgnoreCase(method)) {
                httpSender.sendMethodNotAllowed("Only POST is allowed. Received: " + method);
                return;
            }

            String path = (requestUri == null ? "/calculate" : requestUri).toLowerCase();
            if (path.equals("/calculate")) {
                handleCalculation();
            } else if (path.equals("/calculate/circle")) {
                handleShape("circle");
            } else if (path.equals("/calculate/rectangle")) {
                handleShape("rectangle");
            } else if (path.equals("/calculate/triangle")) {
                handleShape("triangle");
            } else {
                httpSender.sendBadRequest("Unknown path: " + path);
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
        if (read <= 0) return "";
        return new String(buf, java.nio.charset.StandardCharsets.UTF_8);
    }

    private void handleCalculation() throws Exception {
        long t0 = System.nanoTime();
        String body = readBody();
        BigDecimal[] data = parser.getBigDecimals(body);
        Map<String, Object> result = pointService.checkPoint(
                data[0], data[1], data[2], parser.getOriginalYString()
        );
        long t1 = System.nanoTime();
        double serverTotalMs = (t1 - t0) / 1_000_000.0;
        result.put("serverTotalMs", String.format(java.util.Locale.US, "%.3f", serverTotalMs));

        httpSender.sendOkResponse(result);
    }

    private void handleShape(String shape) throws Exception {
        long t0 = System.nanoTime();
        String body = readBody();
        BigDecimal[] data = parser.getBigDecimals(body);
        Map<String, Object> result = pointService.checkPointForShape(
                data[0], data[1], data[2], shape, parser.getOriginalYString()
        );
        long t1 = System.nanoTime();
        double serverTotalMs = (t1 - t0) / 1_000_000.0;
        result.put("serverTotalMs", String.format(java.util.Locale.US, "%.3f", serverTotalMs));
        httpSender.sendOkResponse(result);
    }

    
}