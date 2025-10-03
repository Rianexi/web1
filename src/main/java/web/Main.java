package web;

import com.fastcgi.FCGIInterface;

public class Main {
    public static void main(String[] args) {
        System.setProperty("FCGI_PORT", "25502");
        FCGIInterface fcgiInterface = new FCGIInterface();
        ResponseSender sender = new ResponseSender();
        while (fcgiInterface.FCGIaccept() >= 0)
            sender.sendResponse();
    }
}