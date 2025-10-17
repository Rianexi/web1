package web;

public class Configuration {
    private final String fcgiPort;
    private final int historyLimit;

    public Configuration() {
        this.fcgiPort = System.getenv().getOrDefault("FCGI_PORT", "25502");
        this.historyLimit = 1000;
    }

    public String getFcgiPort() { return fcgiPort; }
    public int getHistoryLimit() { return historyLimit; }
}
