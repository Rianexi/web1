let selectedX = null;
let selectedR = null;
let results = []; // <- ЗДЕСЬ хранятся данные в оперативной памяти

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    drawCoordinatePlane();
    loadResults(); // Загружаем из localStorage при старте
});

function initializeEventListeners() {
    // Кнопки X
    document.querySelectorAll('.x-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectX(this.dataset.value);
            this.classList.add('selected');
            document.querySelectorAll('.x-btn').forEach(b => {
                if (b !== this) b.classList.remove('selected');
            });
        });
    });

    // Радио-кнопки R
    document.querySelectorAll('input[name="r"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedR = parseFloat(this.value);
            updateCurrentPoint();
            drawCoordinatePlane();
        });
    });

    // Поле Y
    document.getElementById('y-input').addEventListener('input', validateY);

    // Форма
    document.getElementById('pointForm').addEventListener('submit', handleSubmit);

    // Клик по canvas
    document.getElementById('coordinatePlane').addEventListener('click', handleCanvasClick);

    // НОВЫЕ кнопки очистки
    document.getElementById('clearAll').addEventListener('click', clearAllResults);
    document.getElementById('clearSelected').addEventListener('click', clearSelectedResults);
}

function selectX(value) {
    selectedX = parseFloat(value);
    document.getElementById('x-input').value = selectedX;
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
    if (isNaN(num) || num < -3 || num > 5) {
        error.textContent = 'От -3 до 5';
        return false;
    }

    error.textContent = '';
    updateCurrentPoint();
    return true;
}

function updateCurrentPoint() {
    const y = document.getElementById('y-input').value;
    const pointDisplay = document.getElementById('currentPoint');
    pointDisplay.textContent = `X: ${selectedX || '-'} \u00A0\u00A0\u00A0 Y: ${y || '-'} \u00A0\u00A0\u00A0 R: ${selectedR || '-'}`;
}

function handleSubmit(e) {
    e.preventDefault();

    const y = parseFloat(document.getElementById('y-input').value);

    if (!selectedX) {
        alert('Выберите X');
        return;
    }
    if (!validateY() || !y) {
        alert('Введите корректное Y');
        return;
    }
    if (!selectedR) {
        alert('Выберите R');
        return;
    }

    sendRequest(selectedX, y, selectedR);
}

function sendRequest(x, y, r) {
    const startTime = performance.now();

    // Имитация AJAX запроса (замените на реальный)
    setTimeout(() => {
        const hit = checkHit(x, y, r);
        const endTime = performance.now();

        addResult({
            x, y, r, hit,
            time: new Date().toLocaleString(),
            duration: `${(endTime - startTime).toFixed(2)} мс`,
            id: Date.now() // Добавляем уникальный ID для каждой точки
        });
    }, 100);
}

function checkHit(x, y, r) {
    // Прямоугольник (1-я четверть)
    if (x >= 0 && y >= 0 && x <= r/2 && y <= r) return true;

    // Треугольник (4-я четверть)
    if (x >= 0 && y <= 0 && x <= r && y >= -r && y >= x - r) return true;

    // Четверть круга (2-я четверть)
    if (x <= 0 && y >= 0 && (x*x + y*y <= (r/2)*(r/2))) return true;

    return false;
}

function addResult(result) {
    results.unshift(result); // Добавляем в начало массива
    saveResults(); // Сохраняем в localStorage

    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow(0);

    row.innerHTML = `
        <td><input type="checkbox" class="result-checkbox" data-id="${result.id}"></td>
        <td>${result.x}</td>
        <td>${result.y}</td>
        <td>${result.r}</td>
        <td style="color: ${result.hit ? '#4caf50' : '#f44336'}; font-weight: bold">
            ${result.hit ? 'Попадание' : 'Промах'}
        </td>
        <td>${result.time}</td>
        <td>${result.duration}</td>
    `;

    drawCoordinatePlane();
}

function handleCanvasClick(e) {
    if (!selectedR) {
        alert('Сначала выберите R');
        return;
    }

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scale = 25;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = (clickX - centerX) / scale;
    const y = (centerY - clickY) / scale;

    // Найти ближайшее допустимое X
    const validX = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    const nearestX = validX.reduce((prev, curr) =>
        Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
    );

    if (y >= -3 && y <= 5) {
        selectX(nearestX);
        document.querySelector(`[data-value="${nearestX}"]`).click();
        document.getElementById('y-input').value = y;
        validateY();
    }
}

// НОВЫЕ ФУНКЦИИ ОЧИСТКИ
function clearAllResults() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ результаты?')) {
        results = []; // Очищаем массив
        localStorage.removeItem('labResults'); // Удаляем из localStorage
        document.getElementById('resultsBody').innerHTML = ''; // Очищаем таблицу
        drawCoordinatePlane(); // Перерисовываем график

        alert('Все результаты удалены!');
    }
}

function clearSelectedResults() {
    const checkboxes = document.querySelectorAll('.result-checkbox:checked');

    if (checkboxes.length === 0) {
        alert('Выберите результаты для удаления!');
        return;
    }

    if (confirm(`Удалить ${checkboxes.length} выбранных результатов?`)) {
        const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

        // Удаляем из массива results
        results = results.filter(result => !idsToDelete.includes(result.id));

        // Сохраняем обновленный массив
        saveResults();

        // Удаляем строки из таблицы
        checkboxes.forEach(checkbox => {
            checkbox.closest('tr').remove();
        });

        // Перерисовываем график
        drawCoordinatePlane();

        alert(`Удалено ${checkboxes.length} результатов!`);
    }
}

function drawCoordinatePlane() {
    const canvas = document.getElementById('coordinatePlane');
    const ctx = canvas.getContext('2d');
    const scale = 25;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Область
    if (selectedR) {
        ctx.fillStyle = 'rgba(92, 107, 192, 0.3)';
        ctx.strokeStyle = '#5c6bc0';
        ctx.lineWidth = 2;

        // Прямоугольник
        ctx.fillRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);
        ctx.strokeRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);

        // Треугольник
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + selectedR * scale, centerY);
        ctx.lineTo(centerX, centerY + selectedR * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Четверть круга
        ctx.beginPath();
        ctx.arc(centerX, centerY, (selectedR/2) * scale, Math.PI/2, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Сетка
    ctx.strokeStyle = '#e0e0e0';
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

    // Оси
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Стрелки
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, centerY - 5);
    ctx.lineTo(canvas.width, centerY);
    ctx.lineTo(canvas.width - 10, centerY + 5);
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 5, 10);
    ctx.stroke();

    // Подписи
    ctx.fillStyle = '#424242';
    ctx.font = '12px Nunito';
    ctx.textAlign = 'center';
    for (let i = -6; i <= 6; i++) {
        if (i !== 0) {
            ctx.fillText(i, centerX + i * scale, centerY + 15);
            ctx.fillText(i, centerX - 15, centerY - i * scale + 4);
        }
    }

    // Точки результатов
    results.forEach(result => {
        if (result.r === selectedR) {
            const x = centerX + result.x * scale;
            const y = centerY - result.y * scale;

            ctx.fillStyle = result.hit ? '#4caf50' : '#f44336';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function saveResults() {
    // ЗДЕСЬ данные сохраняются в localStorage браузера
    localStorage.setItem('labResults', JSON.stringify(results));
}

function loadResults() {
    // ЗДЕСЬ данные загружаются из localStorage
    const saved = localStorage.getItem('labResults');
    if (saved) {
        results = JSON.parse(saved);
        results.forEach(result => addResultToTable(result));
    }
}

function addResultToTable(result) {
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow();

    row.innerHTML = `
        <td><input type="checkbox" class="result-checkbox" data-id="${result.id || Date.now()}"></td>
        <td>${result.x}</td>
        <td>${result.y}</td>
        <td>${result.r}</td>
        <td style="color: ${result.hit ? '#4caf50' : '#f44336'}; font-weight: bold">
            ${result.hit ? 'Попадание' : 'Промах'}
        </td>
        <td>${result.time}</td>
        <td>${result.duration}</td>
    `;
}