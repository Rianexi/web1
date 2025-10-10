package web;

public class Configuration { // кфг для всего
    private final String fcgiPort;
    private final int historyLimit;

    public Configuration() { // мб убрать если не то то то но мб подумать и забить
        this.fcgiPort = System.getenv().getOrDefault("FCGI_PORT", "25502");
        this.historyLimit = 1000;
    }

    public String getFcgiPort() { return fcgiPort; }
    public int getHistoryLimit() { return historyLimit; }
}
