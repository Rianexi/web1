package web;

import com.fastcgi.FCGIInterface;

public class Main {
    public static void main(String[] args) {
        // Порт задаётся через переменную окружения/аргументы JVM. Не переопределяем здесь.
        FCGIInterface fcgiInterface = new FCGIInterface();
        ResponseSender sender = new ResponseSender();
        while (fcgiInterface.FCGIaccept() >= 0)
            sender.sendResponse();
    }
}