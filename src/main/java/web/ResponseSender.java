package web;

import com.fastcgi.FCGIInterface;
import java.math.BigDecimal;
import java.util.Map;

public class ResponseSender {
    private final RequestParser parser;
    private final PointService pointService;
    private final HttpResponseSender httpSender;
    private final QueryParameterExtractor paramExtractor;

    public ResponseSender(Configuration config) {
        this.parser = new JsonParser();

        Checker checker = new Checker();
        HistoryRepository historyRepo = new HistoryRepository(config.getHistoryFile());
        JsonSerializer jsonSerializer = new JsonSerializer();

        this.pointService = new PointService(checker, historyRepo, jsonSerializer, config.getHistoryLimit());
        this.httpSender = new HttpResponseSender(jsonSerializer);
        this.paramExtractor = new QueryParameterExtractor();
    }

    public void sendResponse() {
        try {
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");
            String action = paramExtractor.getParameter(queryString, "action");

            if (action == null || action.isEmpty()) {
                action = "calc";
            }

            switch (action.toLowerCase()) {
                case "calc":
                    handleCalculation(method, queryString);
                    break;
                case "history":
                    handleHistory();
                    break;
                case "clear":
                    handleClear();
                    break;
                case "clearselected":
                    handleClearSelected(queryString);
                    break;
                default:
                    httpSender.sendBadRequest("Unknown action: " + action);
            }
        } catch (IllegalArgumentException e) {
            httpSender.sendBadRequest(e.getMessage());
        } catch (Exception e) {
            httpSender.sendServerError("Server error: " + e.getMessage());
        }
    }

    private void handleCalculation(String method, String queryString) {
        if (!"POST".equalsIgnoreCase(method)) {
            httpSender.sendMethodNotAllowed("Only POST is allowed for calc. Received: " + method);
            return;
        }

        BigDecimal[] data = parser.getBigDecimals(queryString);
        Map<String, Object> result = pointService.checkPoint(
                data[0], data[1], data[2], parser.getOriginalYString()
        );

        httpSender.sendOkResponse(result);
    }

    private void handleHistory() {
        String historyJson = pointService.getHistory();
        httpSender.sendRawJsonResponse(historyJson, 200, "OK");
    }

    private void handleClear() {
        pointService.clearHistory();
        httpSender.sendOkResponse(Map.of("success", true));
    }

    private void handleClearSelected(String queryString) {
        String ids = paramExtractor.getParameter(queryString, "ids");
        pointService.clearSelectedHistory(ids);
        httpSender.sendOkResponse(Map.of("success", true));
    }
}