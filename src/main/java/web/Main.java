package web;

import com.fastcgi.FCGIInterface;

public class Main {
    public static void main(String[] args) {
        Configuration config = new Configuration();
        System.setProperty("FCGI_PORT", config.getFcgiPort());

        FCGIInterface fcgiInterface = new FCGIInterface();
        ResponseSender sender = new ResponseSender(config);

        System.out.println("FastCGI server starting on port " + config.getFcgiPort());
        System.out.println("History file: " + config.getHistoryFile());

        while (fcgiInterface.FCGIaccept() >= 0) {
            sender.sendResponse();
        }
    }
}