function drawCoordinatePlane() {
    const canvas = document.getElementById('coordinatePlane');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 25;

    const colors = {
        bg: '#1a1a1a',
        grid: '#333',
        axis: '#666',
        area: 'rgba(0, 212, 255, 0.3)',
        border: '#00d4ff',
        text: '#b0b0b0'
    };

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (selectedR) {
        const r = selectedR * scale;
        ctx.fillStyle = colors.area;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2;

        ctx.fillRect(centerX, centerY - r, r/2, r);
        ctx.strokeRect(centerX, centerY - r, r/2, r);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + r, centerY);
        ctx.lineTo(centerX, centerY + r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, r/2, Math.PI/2, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = -7; i <= 7; i++) {
        if (i !== 0) {
            const x = centerX + i * scale;
            const y = centerY + i * scale;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    for (let i = -6; i <= 6; i++) {
        if (i !== 0) {
            ctx.fillText(i, centerX + i * scale, centerY + 15);
            ctx.fillText(i, centerX - 15, centerY - i * scale + 4);
        }
    }

    if (selectedR) {
        const results = getResults().filter(result => Math.abs(result.r - selectedR) < 0.001);

        results.forEach(result => {
            const x = centerX + result.x * scale;
            const y = centerY - result.y * scale;

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                ctx.fillStyle = result.hit ? '#00ff88' : '#ff4757';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }
}