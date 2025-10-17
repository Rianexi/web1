let selectedX = null;
let selectedR = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    drawCoordinatePlane();
    loadHistory();
});

function initializeEventListeners() {
    document.querySelectorAll('.x-btn').forEach(btn => {
        btn.addEventListener('click', () => selectX(btn.dataset.value));
    });

    document.querySelectorAll('input[name="r"]').forEach(radio => {
        radio.addEventListener('change', () => {
            selectedR = +radio.value;
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
    selectedX = +value;
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

    const num = +value;
    if (isNaN(num) || num < -5 || num > 5) {
        error.textContent = 'Значение от -5 до 5';
        return false;
    }

    error.textContent = '';
    updateCurrentPoint();
    return true;
}

function updateCurrentPoint() {
    const yValue = document.getElementById('y-input').value;
    const display = document.getElementById('currentPoint');

    const x = selectedX !== null ? selectedX : '—';
    const y = yValue !== '' ? yValue : '—';
    const r = selectedR !== null ? selectedR : '—';

    display.textContent = `X: ${x}   Y: ${y}   R: ${r}`;
    display.title = `X: ${x}   Y: ${y}   R: ${r}`;
}

function handleSubmit(e) {
    e.preventDefault();
    const yInput = document.getElementById('y-input').value.trim();

    if (selectedX === null) return alert('Выберите X');
    if (!validateY() || !yInput) return alert('Введите корректное Y');
    if (selectedR === null) return alert('Выберите R');

    const startTime = performance.now();
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({x: selectedX, y: yInput, r: selectedR})
    })
        .then(response => response.json())
        .then(data => {
            if (data.reason) throw new Error(data.reason);

            const duration = (performance.now() - startTime).toFixed(3);
            addResultRow({
                x: selectedX,
                y: yInput,
                r: selectedR,
                hit: Boolean(data.result),
                time: data.now || new Date().toLocaleString(),
                duration: data.serverTotalMs ? `${data.serverTotalMs} ms` : `${duration} ms`
            }, true);

            drawCoordinatePlane();
        })
        .catch(error => alert(`Ошибка: ${error.message}`));
}

function addResultRow(result, saveToCookies = false) {
    const resultsDiv = document.getElementById('results');
    const row = document.createElement('div');
    row.className = `result-row ${result.hit ? 'hit' : 'miss'}`;

    row.innerHTML = `
        <input type="checkbox" class="result-checkbox">
        <div title="X: ${result.x}">X: ${result.x}</div>
        <div title="Y: ${result.y}">Y: ${result.y}</div>
        <div title="R: ${result.r}">R: ${result.r}</div>
        <div>${result.hit ? 'Попадание' : 'Промах'}</div>
        <div title="${result.time}">${result.time}</div>
        <div title="${result.duration}">${result.duration}</div>
    `;

    resultsDiv.insertBefore(row, resultsDiv.firstChild);

    if (saveToCookies) {
        const results = getResults();
        results.unshift(result);
        if (results.length > 100) results.splice(100);
        setResults(results);
    }
}

function loadHistory() {
    getResults().reverse().forEach(result => addResultRow(result, false));
}

function clearAllResults() {
    document.getElementById('results').innerHTML = '';
    setResults([]);
    drawCoordinatePlane();
}

function clearSelectedResults() {
    const checkboxes = document.querySelectorAll('.result-checkbox:checked');
    checkboxes.forEach(checkbox => checkbox.closest('.result-row').remove());

    const remaining = [];
    document.querySelectorAll('.result-row').forEach(row => {
        const cells = row.querySelectorAll('div');
        remaining.push({
            x: +cells[0].textContent.split(': ')[1],
            y: +cells[1].textContent.split(': ')[1],
            r: +cells[2].textContent.split(': ')[1],
            hit: cells[3].textContent === 'Попадание',
            time: cells[4].textContent,
            duration: cells[5].textContent
        });
    });
    setResults(remaining);
    drawCoordinatePlane();
}

function handleCanvasClick(e) {
    if (!selectedR) return alert('Сначала выберите R');

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 25;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mathX = (clickX - centerX) / scale;
    const mathY = (centerY - clickY) / scale;

    const x = Math.round(mathX * 10) / 10;
    const y = Math.round(mathY * 10) / 10;

    if (x < -5 || x > 5 || y < -5 || y > 5) {
        return alert('Координаты должны быть от -5 до 5');
    }

    document.getElementById('y-input').value = y;
    selectX(x.toString());
    validateY();
}

function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(name + '='));
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