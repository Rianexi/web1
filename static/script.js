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
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        setTimeout(() => {
            drawCoordinatePlane();
        }, 150);
    });
}

function initializeEventListeners() {
    // Кнопки X
    document.querySelectorAll('.x-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectX(this.dataset.value);
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

    // Кнопки очистки
    document.getElementById('clearAll').addEventListener('click', clearAllResults);
    document.getElementById('clearSelected').addEventListener('click', clearSelectedResults);

    // Чекбокс выбрать все
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.result-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
}

function selectX(value) {
    selectedX = parseFloat(value);
    document.getElementById('x-input').value = selectedX;

    // Обновляем состояние кнопок
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

// Функция для сокращения длинных чисел
function truncateNumber(value, maxLength = 8) {
    const str = String(value);
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength) + '...';
}

function updateCurrentPoint() {
    const yValue = document.getElementById('y-input').value;
    const pointDisplay = document.getElementById('currentPoint');

    // Создаем сокращенную версию для отображения
    const displayX = selectedX !== null ? truncateNumber(selectedX) : '—';
    const displayY = yValue ? truncateNumber(yValue) : '—';
    const displayR = selectedR !== null ? truncateNumber(selectedR) : '—';

    const displayText = `X: ${displayX}   Y: ${displayY}   R: ${displayR}`;
    const fullText = `X: ${selectedX ?? '—'}   Y: ${yValue || '—'}   R: ${selectedR ?? '—'}`;

    pointDisplay.textContent = displayText;
    pointDisplay.title = fullText; // Полный текст в tooltip
}

function handleSubmit(e) {
    e.preventDefault();

    const yInput = document.getElementById('y-input').value.trim();

    if (selectedX === null) {
        showToast('Выберите значение X', 'error');
        return;
    }

    if (!validateY() || !yInput) {
        showToast('Введите корректное значение Y', 'error');
        return;
    }

    if (selectedR === null) {
        showToast('Выберите значение R', 'error');
        return;
    }

    const url = `/fcgi-bin/labwork1.jar?action=calc&x=${encodeURIComponent(selectedX)}&y=${encodeURIComponent(yInput)}&r=${encodeURIComponent(selectedR)}`;
    const startTime = performance.now();

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(async (response) => {
            const duration = (performance.now() - startTime).toFixed(2);

            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error('Некорректный ответ сервера');
            }

            if (!response.ok) {
                const reason = data?.reason || `HTTP ${response.status}`;
                throw new Error(reason);
            }

            addResultRow({
                x: selectedX,
                y: yInput,
                r: selectedR,
                hit: Boolean(data.result),
                time: data.now || new Date().toLocaleString(),
                duration: data.timeMs ? `${data.timeMs} ms` : `${duration} ms`
            });

            drawCoordinatePlane();
            showToast('Результат добавлен', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(`Ошибка: ${error.message}`, 'error');
        });
}

function handleCanvasClick(e) {
    if (!selectedR) {
        showToast('Сначала выберите значение R', 'error');
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

    // Найти ближайшее допустимое X (из старого кода)
    const validX = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
    const nearestX = validX.reduce((prev, curr) =>
        Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
    );

    if (y >= -5 && y <= 5) {
        selectX(nearestX.toString());
        document.getElementById('y-input').value = y.toFixed(2);
        validateY();
    }
}

function loadHistory() {
    // Используем оригинальный endpoint из старого кода
    fetch('/fcgi-bin/labwork1.jar?action=history', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(items => {
            if (Array.isArray(items)) {
                items.forEach(item => addResultRow({
                    x: item.x,
                    y: String(item.y),
                    r: item.r,
                    hit: Boolean(item.result),
                    time: item.now,
                    duration: item.timeMs ? `${item.timeMs} ms` : ''
                }));
            }
        })
        .catch(error => {
            console.log('Could not load history:', error);
        });
}

function clearAllResults() {
    showConfirmDialog('Очистить всю таблицу результатов?', () => {
        // Используем оригинальный endpoint из старого кода
        fetch('/fcgi-bin/labwork1.jar?action=clear', { method: 'POST' })
            .then(() => {
                document.getElementById('resultsBody').innerHTML = '';
                drawCoordinatePlane();
                showToast('Таблица очищена', 'success');
            })
            .catch(() => {
                document.getElementById('resultsBody').innerHTML = '';
                drawCoordinatePlane();
                showToast('Таблица очищена (локально)', 'success');
            });
    });
}

function clearSelectedResults() {
    const checkboxes = document.querySelectorAll('.result-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Выберите результаты для удаления', 'error');
        return;
    }

    showConfirmDialog(`Удалить ${checkboxes.length} выбранных результатов?`, () => {
        const selectedIds = [];
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const rowIndex = Array.from(row.parentNode.children).indexOf(row);
            selectedIds.push(rowIndex);
        });

        // Используем оригинальный endpoint из старого кода
        fetch(`/fcgi-bin/labwork1.jar?action=clearSelected&ids=${selectedIds.join(',')}`, { method: 'POST' })
            .then(() => {
                checkboxes.forEach(checkbox => {
                    checkbox.closest('tr').remove();
                });
                drawCoordinatePlane();
                showToast('Выбранные результаты удалены', 'success');
            })
            .catch(() => {
                checkboxes.forEach(checkbox => {
                    checkbox.closest('tr').remove();
                });
                drawCoordinatePlane();
                showToast('Выбранные результаты удалены (локально)', 'success');
            });
    });
}

function drawCoordinatePlane() {
    const canvas = document.getElementById('coordinatePlane');
    const ctx = canvas.getContext('2d');
    const scale = 25;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Получаем текущую тему
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    // Очищаем canvas с фоном в зависимости от темы
    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем область если R выбран
    if (selectedR) {
        ctx.fillStyle = isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        ctx.strokeStyle = isDark ? '#00d4ff' : '#3b82f6';
        ctx.lineWidth = 2;

        // Прямоугольник (первая четверть)
        ctx.fillRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);
        ctx.strokeRect(centerX, centerY - selectedR * scale, (selectedR/2) * scale, selectedR * scale);

        // Треугольник (четвертая четверть)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + selectedR * scale, centerY);
        ctx.lineTo(centerX, centerY + selectedR * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Четверть круга (третья четверть)
        ctx.beginPath();
        ctx.arc(centerX, centerY, (selectedR/2) * scale, Math.PI/2, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Рисуем сетку
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

    // Рисуем оси
    ctx.strokeStyle = isDark ? '#666' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Рисуем стрелки
    ctx.strokeStyle = isDark ? '#00d4ff' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Стрелка X
    ctx.moveTo(canvas.width - 10, centerY - 5);
    ctx.lineTo(canvas.width - 2, centerY);
    ctx.lineTo(canvas.width - 10, centerY + 5);
    // Стрелка Y
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 2);
    ctx.lineTo(centerX + 5, 10);
    ctx.stroke();

    // Рисуем подписи
    ctx.fillStyle = isDark ? '#b0b0b0' : '#475569';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    for (let i = -6; i <= 6; i++) {
        if (i !== 0) {
            ctx.fillText(i, centerX + i * scale, centerY + 15);
            ctx.fillText(i, centerX - 15, centerY - i * scale + 4);
        }
    }

    // Подписи осей
    ctx.fillStyle = isDark ? '#00d4ff' : '#3b82f6';
    ctx.font = 'bold 14px JetBrains Mono';
    ctx.fillText('X', canvas.width - 15, centerY - 10);
    ctx.fillText('Y', centerX + 10, 15);
}

function addResultRow(result) {
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow(0);

    const hitColor = result.hit ? 'var(--success)' : 'var(--error)';
    const hitText = result.hit ? 'Попадание' : 'Промах';

    // Создаем сокращенные версии для отображения, но полные для tooltip
    const displayX = truncateNumber(result.x, 6);
    const displayY = truncateNumber(result.y, 8);
    const displayR = truncateNumber(result.r, 6);
    const displayTime = result.time.length > 15 ? result.time.substring(0, 12) + '...' : result.time;
    const displayDuration = result.duration.length > 10 ? result.duration.substring(0, 7) + '...' : result.duration;

    row.innerHTML = `
        <td><input type="checkbox" class="result-checkbox"></td>
        <td title="${result.x}">${displayX}</td>
        <td title="${result.y}">${displayY}</td>
        <td title="${result.r}">${displayR}</td>
        <td style="color: ${hitColor}; font-weight: 600;" title="${hitText}">${hitText}</td>
        <td title="${result.time}">${displayTime}</td>
        <td title="${result.duration}">${displayDuration}</td>
    `;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showConfirmDialog(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    dialog.innerHTML = `
        <div class="confirm-message">${message}</div>
        <div class="confirm-buttons">
            <button class="confirm-btn confirm-cancel">Отмена</button>
            <button class="confirm-btn confirm-ok">Подтвердить</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const cancelBtn = dialog.querySelector('.confirm-cancel');
    const okBtn = dialog.querySelector('.confirm-ok');

    const close = () => document.body.removeChild(overlay);

    cancelBtn.addEventListener('click', close);
    okBtn.addEventListener('click', () => {
        close();
        onConfirm();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    cancelBtn.focus();
}