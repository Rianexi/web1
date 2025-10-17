package web;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class Checker {
    private final BigDecimal X_MIN = new BigDecimal("-3");
    private final BigDecimal X_MAX = new BigDecimal("5");
    private final BigDecimal Y_MIN = new BigDecimal("-5");
    private final BigDecimal Y_MAX = new BigDecimal("5");
    private final BigDecimal R_MIN = BigDecimal.ONE;
    private final BigDecimal R_MAX = new BigDecimal("3");
    private final BigDecimal TWO = new BigDecimal("2");
    private final MathContext mc = new MathContext(10, RoundingMode.HALF_UP);

    public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(X_MIN) < 0 || x.compareTo(X_MAX) > 0)
            throw new IllegalArgumentException("X должен быть в диапазоне [-3; 5]");
        if (y.compareTo(Y_MIN) < 0 || y.compareTo(Y_MAX) > 0)
            throw new IllegalArgumentException("Y должен быть в диапазоне [-5; 5]");
        if (r.compareTo(R_MIN) < 0 || r.compareTo(R_MAX) > 0)
            throw new IllegalArgumentException("R должен быть в диапазоне [1; 3]");
    }

    public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
        return checkRectangle(x, y, r) || checkCircle(x, y, r) || checkTriangle(x, y, r);
    }

    public boolean isHitCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return checkCircle(x, y, r);
    }

    public boolean isHitRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return checkRectangle(x, y, r);
    }

    public boolean isHitTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return checkTriangle(x, y, r);
    }

    private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        BigDecimal halfR = r.divide(TWO, mc);
        return x.compareTo(BigDecimal.ZERO) >= 0 && x.compareTo(halfR) <= 0 &&
                y.compareTo(BigDecimal.ZERO) >= 0 && y.compareTo(r) <= 0;
    }

    private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) return false;
        BigDecimal halfR = r.divide(TWO, mc);
        return x.multiply(x).add(y.multiply(y)).compareTo(halfR.multiply(halfR)) <= 0;
    }

    private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) > 0) return false;
        return x.compareTo(r) <= 0 && y.compareTo(r.negate()) >= 0 && x.add(y.abs()).compareTo(r) <= 0;
    }
}