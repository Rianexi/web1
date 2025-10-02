package web;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class Checker {
    private final BigDecimal X_MIN = new BigDecimal("-2");
    private final BigDecimal X_MAX = new BigDecimal("2");
    private final BigDecimal Y_MIN = new BigDecimal("-3");
    private final BigDecimal Y_MAX = new BigDecimal("5");
    private final BigDecimal R_MIN = BigDecimal.ONE;
    private final BigDecimal R_MAX = new BigDecimal("3");
    private final BigDecimal TWO = new BigDecimal("2");
    private final MathContext mathContext = new MathContext(10, RoundingMode.HALF_UP);

    public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(X_MIN) < 0 || x.compareTo(X_MAX) > 0)
            throw new IllegalArgumentException("X должен быть в диапазоне [-2; 2]");
        // Делаем границы Y включительными: [-3; 5]
        if (y.compareTo(Y_MIN) < 0 || y.compareTo(Y_MAX) > 0)
            throw new IllegalArgumentException("Y должен быть в диапазоне [-3; 5]");
        if (r.compareTo(R_MIN) < 0 || r.compareTo(R_MAX) > 0)
            throw new IllegalArgumentException("R должен быть в диапазоне [1; 3]");
    }

    public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
        return (checkRectangle(x, y, r) || checkCircle(x, y, r) || checkTriangle(x, y, r));
    }

    // ОБЛАСТЬ 1: Прямоугольник в 1-м квадранте (как на фронтенде)
    // X: от 0 до R/2, Y: от 0 до R
    private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        BigDecimal halfR = r.divide(TWO, mathContext);
        return (x.compareTo(BigDecimal.ZERO) >= 0 &&
                x.compareTo(halfR) <= 0 &&
                y.compareTo(BigDecimal.ZERO) >= 0 &&
                y.compareTo(r) <= 0);
    }

    // ОБЛАСТЬ 2: Четверть круга в 3-м квадранте (СЛЕВА СНИЗУ)
    // Радиус R/2, X <= 0, Y <= 0
    private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) {
            return false;
        }

        BigDecimal halfR = r.divide(TWO, mathContext);
        BigDecimal radiusSquared = halfR.multiply(halfR);
        BigDecimal distanceSquared = x.multiply(x).add(y.multiply(y));

        return distanceSquared.compareTo(radiusSquared) <= 0;
    }

    // ОБЛАСТЬ 3: Треугольник в 4-м квадранте (как на фронтенде)
    // X: от 0 до R, Y: от -R до 0, ограничен линией x - y = R (т.е. x + |y| <= R)
    private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) > 0) {
            return false;
        }

        return (x.compareTo(r) <= 0 &&
                y.compareTo(r.negate()) >= 0 &&
                x.add(y.abs()).compareTo(r) <= 0);
    }
}
