let selectedX = null;
let selectedR = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEventListeners();
    drawCoordinatePlane();
    loadHistory();
});

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = getCookie('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        setCookie('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        setTimeout(() => drawCoordinatePlane(), 150);
    });
}

function initializeEventListeners() {
    document.querySelectorAll('.x-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectX(this.dataset.value);
        });
    });

    document.querySelectorAll('input[name="r"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedR = parseFloat(this.value);
            updateCurrentPoint();
            drawCoordinatePlane();
        });
    });

    document.getElementById('y-input').addEventListener('input', validateY);
    document.getElementById('pointForm').addEventListener('submit', handleSubmit);
    document.getElementById('coordinatePlane').addEventListener('click', handleCanvasClick);
    document.getElementById('clearAll').addEventListener('click', clearAllResults);
    document.getElementById('clearSelected').addEventListener('click', clearSelectedResults);

    document.getElementById('selectAll').addEventListener('change', function() {
        document.querySelectorAll('.result-checkbox').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
}

function selectX(value) {
    selectedX = parseFloat(value);
    document.getElementById('x-input').value = selectedX;
    document.querySelectorAll('.x-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === value);
    });
    updateCurrentPoint();
}

function validateY() {
    const input = document.getElementById('y-input');
    const error = document.getElementById('y-error');
    const value = input.value.trim();

    if (value === '') {
        error.textContent = '';
        return true;
    }

    if (!/^-?\d*\.?\d*$/.test(value)) {
        error.textContent = 'Только числа';
        return false;
    }

    const num = parseFloat(value);
    if (isNaN(num) || num < -5 || num > 5) {
        error.textContent = 'Значение должно быть от -5 до 5';
        return false;
    }

    error.textContent = '';
    updateCurrentPoint();
    return true;
}

function updateCurrentPoint() {
    const yValue = document.getElementById('y-input').value;
    const pointDisplay = document.getElementById('currentPoint');

    const displayX = selectedX !== null ? selectedX : '—';
    const displayY = yValue !== '' ? parseFloat(yValue) : '—';
    const displayR = selectedR !== null ? selectedR : '—';

    pointDisplay.textContent = `X: ${displayX}   Y: ${displayY}   R: ${displayR}`;
}

function handleSubmit(e) {
    e.preventDefault();

    const yInput = document.getElementById('y-input').value.trim();

    if (selectedX === null) {
        alert('Выберите значение X');
        return;
    }
    if (!validateY() || !yInput) {
        alert('Введите корректное значение Y');
        return;
    }
    if (selectedR === null) {
        alert('Выберите значение R');
        return;
    }

    const url = `/calculate`;
    const startTime = performance.now();

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            x: selectedX,
            y: yInput,
            r: selectedR
        })
    })
        .then(async (response) => {
            const duration = (performance.now() - startTime).toFixed(3);
            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error('Некорректный ответ сервера');
            }

            if (!response.ok) {
                throw new Error(data?.reason || `HTTP ${response.status}`);
            }

            addResultRow({
                x: selectedX,
                y: yInput,
                r: selectedR,
                hit: Boolean(data.result),
                time: data.now || new Date().toLocaleString(),
                duration: data.serverTotalMs ? `${data.serverTotalMs} ms` : `${duration} ms`
            }, true); // true = сохранить в cookies

            drawCoordinatePlane();
            console.log('Результат добавлен');
        })
        .catch(error => {
            alert(`Ошибка: ${error.message}`);
        });
}

function addResultRow(result, saveToCookies = false) {
    const resultsDiv = document.getElementById('results');
    const resultRow = document.createElement('div');
    resultRow.className = `result-row ${result.hit ? 'hit' : 'miss'}`;

    resultRow.innerHTML = `
        <input type="checkbox" class="result-checkbox">
        <div>X: ${result.x}</div>
        <div>Y: ${result.y}</div>
        <div>R: ${result.r}</div>
        <div>${result.hit ? 'Попадание' : 'Промах'}</div>
        <div>${result.time}</div>
        <div>${result.duration}</div>
    `;

    resultsDiv.insertBefore(resultRow, resultsDiv.firstChild);

    // Сохранить в cookies только если флаг установлен
    if (saveToCookies) {
        const results = getResults();
        results.unshift(result);
        if (results.length > 100) {
            results.splice(100);
        }
        setResults(results);
    }
}

function loadHistory() {
    const results = getResults();
    results.reverse().forEach(result => addResultRow(result, false)); // false = НЕ сохранять в cookies
}

function clearAllResults() {
    document.getElementById('results').innerHTML = '';
    setResults([]);
    drawCoordinatePlane();
}

function clearSelectedResults() {
    const checkboxes = document.querySelectorAll('.result-checkbox:checked');
    checkboxes.forEach(checkbox => {
        checkbox.closest('.result-row').remove();
    });

    const remainingResults = [];
    document.querySelectorAll('.result-row').forEach(row => {
        const cells = row.querySelectorAll('div');
        if (cells.length >= 6) {
            remainingResults.push({
                x: parseFloat(cells[0].textContent.split(': ')[1]),
                y: parseFloat(cells[1].textContent.split(': ')[1]),
                r: parseFloat(cells[2].textContent.split(': ')[1]),
                hit: cells[3].textContent === 'Попадание',
                time: cells[4].textContent,
                duration: cells[5].textContent
            });
        }
    });
    setResults(remainingResults);
    drawCoordinatePlane();
}

function handleCanvasClick(e) {
    if (!selectedR) {
        alert('Сначала выберите значение R');
        return;
    }

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scale = 25;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mathX = (clickX - centerX) / scale;
    const mathY = (centerY - clickY) / scale;

    const roundedX = Math.round(mathX * 10) / 10;
    const roundedY = Math.round(mathY * 10) / 10;

    if (roundedX < -5 || roundedX > 5 || roundedY < -5 || roundedY > 5) {
        alert('Координаты должны быть в пределах от -5 до 5');
        return;
    }

    document.getElementById('y-input').value = roundedY;
    selectX(roundedX.toString());
    validateY();
}

function drawCoordinatePlane() {
    const canvas = document.getElementById('coordinatePlane');
    const ctx = canvas.getContext('2d');
    const scale = 25;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (selectedR) {
        ctx.fillStyle = isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        ctx.strokeStyle = isDark ? '#00d4ff' : '#3b82f6';
        ctx.lineWidth = 2;

        ctx.fillRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);
        ctx.strokeRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + selectedR * scale, centerY);
        ctx.lineTo(centerX, centerY + selectedR * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, (selectedR/2) * scale, Math.PI/2, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.strokeStyle = isDark ? '#333' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = -7; i <= 7; i++) {
        if (i !== 0) {
            ctx.beginPath();
            ctx.moveTo(centerX + i * scale, 0);
            ctx.lineTo(centerX + i * scale, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, centerY + i * scale);
            ctx.lineTo(canvas.width, centerY + i * scale);
            ctx.stroke();
        }
    }

    ctx.strokeStyle = isDark ? '#666' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    ctx.strokeStyle = isDark ? '#00d4ff' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, centerY - 5);
    ctx.lineTo(canvas.width - 2, centerY);
    ctx.lineTo(canvas.width - 10, centerY + 5);
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 2);
    ctx.lineTo(centerX + 5, 10);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#b0b0b0' : '#475569';
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

                ctx.strokeStyle = isDark ? '#000' : '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }
}

// Утилиты для работы с cookies
function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';').map(x => x.trim());
    const cookie = cookies.find(c => c.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

function setResults(results) {
    setCookie('results', JSON.stringify(results));
}

function getResults() {
    const data = getCookie('results');
    try {
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}