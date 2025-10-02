let selectedX = null;
let selectedR = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    drawCoordinatePlane();
    // Подгружаем историю с сервера при загрузке
    fetch('/history', { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(items => {
            if (Array.isArray(items)) {
                items.forEach(item => addResultRow({
                    x: item.x,
                    y: String(item.y),
                    r: item.r,
                    hit: Boolean(item.result),
                    time: item.now,
                    duration: (typeof item.timeMs === 'number') ? `${item.timeMs} ms` : ''
                }));
            }
        })
        .catch(() => {});
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

    // Кнопки очистки таблицы (без сохранения состояния на клиенте)
    const clearAllBtn = document.getElementById('clearAll');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllResults);
    const clearSelectedBtn = document.getElementById('clearSelected');
    if (clearSelectedBtn) clearSelectedBtn.addEventListener('click', clearSelectedResults);
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

    // Пустое значение
    if (value === '') {
        error.textContent = '';
        return true;
    }

    // Проверка на допустимые символы
    if (!/^-?\d*\.?\d*$/.test(value)) {
        error.textContent = 'Только числа';
        return false;
    }

    // Без ограничения на количество знаков после точки

    // Проверка на попадание в диапазон
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
    const text = `X: ${selectedX || '-'}   Y: ${y || '-'}   R: ${selectedR || '-'}`;
    pointDisplay.textContent = text;
    pointDisplay.title = text; // полный текст в подсказке
}

function handleSubmit(e) {
    e.preventDefault();

    const yInput = document.getElementById('y-input').value.trim();

    if (selectedX === null) return showToast('Выберите X');
    // X может быть дробным (как раньше). Проверка диапазона выполняется на сервере.
    if (!validateY() || !yInput) return showToast('Введите корректное Y');
    if (selectedR === null) return showToast('Выберите R');

    const url = `/calculate?x=${encodeURIComponent(selectedX)}&y=${encodeURIComponent(yInput)}&r=${encodeURIComponent(selectedR)}`;
    const start = performance.now();
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    }).then(async (res) => {
        const durationMs = (performance.now() - start).toFixed(2);
        let data;
        try {
            data = await res.json();
        } catch (_) {
            throw new Error('Некорректный ответ сервера');
        }

        if (!res.ok) {
            const reason = data?.reason ? data.reason : `HTTP ${res.status}`;
            throw new Error(reason);
        }

        addResultRow({
            x: selectedX,
            y: yInput,
            r: selectedR,
            hit: Boolean(data.result),
            time: data.now || new Date().toLocaleString(),
            duration: (typeof data.timeMs === 'number') ? `${data.timeMs} ms` : (data.time ? `${data.time} ns` : `${durationMs} ms`)
        });
        drawCoordinatePlane();
    }).catch(err => showToast(`Ошибка: ${err.message}`));
}

// Упрощённая валидация только формата Y на клиенте (без вычислений попадания)
function validateInputFormat(x, y, r) {
    if (typeof x !== 'number' && isNaN(parseFloat(x))) return false;
    if (typeof r !== 'number' && isNaN(parseFloat(r))) return false;
    if (typeof y !== 'string' || !/^-?\d+(\.\d+)?$/.test(y)) return false;
    const numY = parseFloat(y);
    return !(isNaN(numY) || numY < -3 || numY > 5);
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

    // Найти ближайшее допустимое X (шаг 0.5 как было раньше)
    const validX = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    const nearestX = validX.reduce((prev, curr) =>
        Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
    );

    if (y >= -3 && y <= 5) {
        selectX(nearestX);
        const btn = document.querySelector(`[data-value="${nearestX}"]`);
        if (btn) btn.classList.add('selected');
        document.querySelectorAll('.x-btn').forEach(b => { if (b !== btn) b.classList.remove('selected'); });

        document.getElementById('y-input').value = y.toString();
        validateY();
    }
}

// НОВЫЕ ФУНКЦИИ ОЧИСТКИ
function clearAllResults() {
    showConfirmDialog('Очистить таблицу результатов?', () => {
        // Очищаем на сервере через /calculate с параметром clear=true
        fetch('/calculate?clear=true', { method: 'POST' })
            .then(() => {
                // Очищаем на клиенте
                document.getElementById('resultsBody').innerHTML = '';
                drawCoordinatePlane();
            })
            .catch(() => {
                // Если сервер недоступен, очищаем только на клиенте
                document.getElementById('resultsBody').innerHTML = '';
                drawCoordinatePlane();
            });
    });
}

function clearSelectedResults() {
    const checkboxes = document.querySelectorAll('.result-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Выберите результаты для удаления!');
        return;
    }
    showConfirmDialog(`Удалить ${checkboxes.length} выбранных результатов?`, () => {
        // Собираем ID выбранных строк для удаления на сервере
        const selectedIds = [];
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const rowIndex = Array.from(row.parentNode.children).indexOf(row);
            selectedIds.push(rowIndex);
        });
        
        // Отправляем запрос на сервер для удаления выбранных записей
        fetch(`/calculate?clearSelected=${selectedIds.join(',')}`, { method: 'POST' })
            .then(() => {
                // Удаляем на клиенте
                checkboxes.forEach(checkbox => {
                    checkbox.closest('tr').remove();
                });
                drawCoordinatePlane();
            })
            .catch(() => {
                // Если сервер недоступен, удаляем только на клиенте
                checkboxes.forEach(checkbox => {
                    checkbox.closest('tr').remove();
                });
                drawCoordinatePlane();
            });
    });
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

    // Точки результатов убраны с клиента, т.к. вычисления делает сервер
}

function addResultRow(result) {
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow(0);
    row.innerHTML = `
		<td><input type="checkbox" class="result-checkbox"></td>
		<td title="${result.x}">${result.x}</td>
		<td title="${result.y}">${result.y}</td>
		<td title="${result.r}">${result.r}</td>
		<td style="color: ${result.hit ? '#4caf50' : '#f44336'}; font-weight: bold">${result.hit ? 'Попадание' : 'Промах'}</td>
		<td title="${result.time}">${result.time}</td>
		<td title="${result.duration}">${result.duration}</td>
	`;
}

// Простые toast-уведомления вместо alert
let toastTimer = null;
function showToast(message) {
    let el = document.getElementById('app-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'app-toast';
        el.className = 'toast';
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.title = message;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
    return false;
}

// Красивое диалоговое окно подтверждения
function showConfirmDialog(message, onConfirm) {
    // Создаем overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    
    // Создаем диалог
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    
    dialog.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-icon">⚠️</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-cancel">Отмена</button>
                <button class="confirm-btn confirm-ok">OK</button>
            </div>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Обработчики событий
    const cancelBtn = dialog.querySelector('.confirm-cancel');
    const okBtn = dialog.querySelector('.confirm-ok');
    
    const close = () => {
        document.body.removeChild(overlay);
    };
    
    cancelBtn.addEventListener('click', close);
    okBtn.addEventListener('click', () => {
        close();
        onConfirm();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    
    // Фокус на кнопке отмены
    cancelBtn.focus();
}