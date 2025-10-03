package web;

import java.math.BigDecimal;

public interface RequestParser { // интерфуха для входных данных
    BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException;
    String getOriginalYString();
}