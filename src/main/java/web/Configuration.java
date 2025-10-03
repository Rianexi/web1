package web;

public class Configuration {
    private final String fcgiPort;
    private final String historyFile;
    private final int historyLimit;

    public Configuration() {
        this.fcgiPort = System.getenv().getOrDefault("FCGI_PORT", "25502");
        this.historyFile = System.getenv().getOrDefault("HISTORY_FILE", "history.json");
        this.historyLimit = 1000;
    }

    public String getFcgiPort() { return fcgiPort; }
    public String getHistoryFile() { return historyFile; }
    public int getHistoryLimit() { return historyLimit; }
}
