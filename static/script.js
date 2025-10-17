let selectedX = null, selectedR = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    drawCoordinatePlane();
    loadHistory();
});

function initializeEventListeners() {
    document.querySelectorAll('.x-btn').forEach(btn => btn.onclick = () => selectX(btn.dataset.value));
    document.querySelectorAll('input[name="r"]').forEach(radio => radio.onchange = () => {
        selectedR = +radio.value;
        updateCurrentPoint();
        drawCoordinatePlane();
    });

    document.getElementById('y-input').oninput = validateY;
    document.getElementById('pointForm').onsubmit = handleSubmit;
    document.getElementById('coordinatePlane').onclick = handleCanvasClick;
    document.getElementById('clearAll').onclick = clearAllResults;
    document.getElementById('clearSelected').onclick = clearSelectedResults;
    document.getElementById('selectAll').onchange = function() {
        document.querySelectorAll('.result-checkbox').forEach(cb => cb.checked = this.checked);
    };
}

function selectX(value) {
    selectedX = +value;
    document.getElementById('x-input').value = selectedX;
    document.querySelectorAll('.x-btn').forEach(btn => btn.classList.toggle('selected', btn.dataset.value === value));
    updateCurrentPoint();
}

function validateY() {
    const input = document.getElementById('y-input');
    const error = document.getElementById('y-error');
    const value = input.value.trim();

    if (!value) return error.textContent = '', true;
    if (!/^-?\d*\.?\d*$/.test(value)) return error.textContent = 'Только числа', false;

    const num = +value;
    if (isNaN(num) || num < -5 || num > 5) return error.textContent = 'Значение от -5 до 5', false;

    error.textContent = '';
    updateCurrentPoint();
    return true;
}

function updateCurrentPoint() {
    const display = document.getElementById('currentPoint');
    const x = selectedX ?? '—';
    const y = document.getElementById('y-input').value || '—';
    const r = selectedR ?? '—';
    const text = `X: ${x}   Y: ${y}   R: ${r}`;
    display.textContent = display.title = text;
}

function handleSubmit(e) {
    e.preventDefault();
    const yInput = document.getElementById('y-input').value.trim();

    if (!selectedX) return alert('Выберите X');
    if (!validateY() || !yInput) return alert('Введите корректное Y');
    if (!selectedR) return alert('Выберите R');

    const start = performance.now();
    fetch('/calculate', {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({x: selectedX, y: yInput, r: selectedR})
    })
        .then(r => r.json())
        .then(data => {
            if (data.reason) throw new Error(data.reason);
            addResultRow({
                x: selectedX, y: yInput, r: selectedR,
                hit: !!data.result,
                time: data.now || new Date().toLocaleString(),
                duration: data.serverTotalMs ? `${data.serverTotalMs} ms` : `${(performance.now() - start).toFixed(3)} ms`
            }, true);
            drawCoordinatePlane();
        })
        .catch(err => alert(`Ошибка: ${err.message}`));
}

function addResultRow(result, save = false) {
    const div = document.createElement('div');
    div.className = `result-row ${result.hit ? 'hit' : 'miss'}`;
    div.innerHTML = `<input type="checkbox" class="result-checkbox">
        <div title="X: ${result.x}">X: ${result.x}</div>
        <div title="Y: ${result.y}">Y: ${result.y}</div>
        <div title="R: ${result.r}">R: ${result.r}</div>
        <div>${result.hit ? 'Попадание' : 'Промах'}</div>
        <div title="${result.time}">${result.time}</div>
        <div title="${result.duration}">${result.duration}</div>`;

    document.getElementById('results').prepend(div);

    if (save) {
        const results = getResults();
        results.unshift(result);
        if (results.length > 100) results.length = 100;
        setResults(results);
    }
}

const loadHistory = () => getResults().reverse().forEach(r => addResultRow(r));

const clearAllResults = () => {
    document.getElementById('results').innerHTML = '';
    setResults([]);
    drawCoordinatePlane();
};

function clearSelectedResults() {
    document.querySelectorAll('.result-checkbox:checked').forEach(cb => cb.closest('.result-row').remove());

    const remaining = [...document.querySelectorAll('.result-row')].map(row => {
        const cells = row.querySelectorAll('div');
        return {
            x: +cells[0].textContent.split(': ')[1],
            y: +cells[1].textContent.split(': ')[1],
            r: +cells[2].textContent.split(': ')[1],
            hit: cells[3].textContent === 'Попадание',
            time: cells[4].textContent,
            duration: cells[5].textContent
        };
    });
    setResults(remaining);
    drawCoordinatePlane();
}

function handleCanvasClick(e) {
    if (!selectedR) return alert('Сначала выберите R');

    const rect = e.target.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left - 200) / 25) * 10) / 10;
    const y = Math.round(((200 - (e.clientY - rect.top)) / 25) * 10) / 10;

    if (x < -5 || x > 5 || y < -5 || y > 5) return alert('Координаты от -5 до 5');

    document.getElementById('y-input').value = y;
    selectX(x.toString());
    validateY();
}

const setCookie = (name, value) => document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=Lax`;
const getCookie = name => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};
const setResults = results => setCookie('results', JSON.stringify(results));
const getResults = () => {
    try { return JSON.parse(getCookie('results')) || []; }
    catch { return []; }
};