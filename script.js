// 心情数据
const moodEmojis = {
    excited: '😄',
    happy: '😊',
    calm: '😌',
    tired: '😫',
    sad: '😢',
    angry: '😠'
};

const moodLabels = {
    excited: '非常开心',
    happy: '开心',
    calm: '平静',
    tired: '疲惫',
    sad: '难过',
    angry: '生气'
};

// 状态
let currentDate = new Date();
let selectedMood = null;
let selectedDate = null;
let moodData = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePicker();
    loadMoodData();
    renderCalendar();
    attachEventListeners();
});

// 初始化日期选择器
function initializeDatePicker() {
    const datePicker = document.getElementById('date-picker');
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    datePicker.max = today;
    selectedDate = today;
}

// 加载心情数据
function loadMoodData() {
    const saved = localStorage.getItem('moodData');
    if (saved) {
        moodData = JSON.parse(saved);
    }
}

// 保存心情数据
function saveMoodData() {
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

// 绑定事件监听器
function attachEventListeners() {
    // 日期选择
    document.getElementById('date-picker').addEventListener('change', (e) => {
        selectedDate = e.target.value;
        loadDayMood();
    });

    // 心情选择
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });

    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveMood);

    // 月份导航
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 弹窗关闭
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('mood-modal').addEventListener('click', (e) => {
        if (e.target.id === 'mood-modal') closeModal();
    });

    // 删除按钮
    document.getElementById('delete-btn').addEventListener('click', deleteMood);
}

// 加载某天的心情
function loadDayMood() {
    const data = moodData[selectedDate];
    
    // 清除选择
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('mood-note').value = '';
    selectedMood = null;

    if (data) {
        selectedMood = data.mood;
        const moodBtn = document.querySelector(`[data-mood="${data.mood}"]`);
        if (moodBtn) moodBtn.classList.add('selected');
        document.getElementById('mood-note').value = data.note || '';
    }
}

// 保存心情
function saveMood() {
    if (!selectedMood) {
        alert('请选择今天的心情！😊');
        return;
    }

    const note = document.getElementById('mood-note').value.trim();
    
    moodData[selectedDate] = {
        mood: selectedMood,
        note: note,
        timestamp: new Date().toISOString()
    };

    saveMoodData();
    renderCalendar();
    
    showNotification('心情保存成功！💾');
}

// 删除心情
function deleteMood() {
    const dateToDelete = document.getElementById('modal-date').dataset.date;
    if (confirm('确定要删除这条心情记录吗？')) {
        delete moodData[dateToDelete];
        saveMoodData();
        closeModal();
        renderCalendar();
        if (selectedDate === dateToDelete) {
            loadDayMood();
        }
        showNotification('记录已删除');
    }
}

// 渲染日历
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 更新标题
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                        '七月', '八月', '九月', '十月', '十一月', '十二月'];
    document.getElementById('current-month').textContent = `${year}年 ${monthNames[month]}`;

    // 获取月份信息
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // 星期标题
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    weekDays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day empty';
        header.innerHTML = `<strong>${day}</strong>`;
        header.style.cursor = 'default';
        calendar.appendChild(header);
    });

    // 空白天数
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }

    // 日期
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // 今天高亮
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // 显示日期
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // 显示心情
        if (moodData[dateStr]) {
            dayElement.classList.add('has-mood');
            const moodEmoji = document.createElement('div');
            moodEmoji.className = 'mood-emoji';
            moodEmoji.textContent = moodEmojis[moodData[dateStr].mood];
            dayElement.appendChild(moodEmoji);
        }

        dayElement.addEventListener('click', () => showMoodDetail(dateStr));
        calendar.appendChild(dayElement);
    }
}

// 显示心情详情
function showMoodDetail(dateStr) {
    const data = moodData[dateStr];
    
    if (!data) {
        // 如果没有记录，跳转到记录页面
        document.getElementById('date-picker').value = dateStr;
        selectedDate = dateStr;
        loadDayMood();
        // 滚动到输入区域
        document.querySelector('.mood-input-section').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // 显示弹窗
    const modal = document.getElementById('mood-modal');
    const modalDate = document.getElementById('modal-date');
    const modalMood = document.getElementById('modal-mood');
    const modalNote = document.getElementById('modal-note');

    const date = new Date(dateStr);
    const dateDisplay = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    
    modalDate.textContent = dateDisplay;
    modalDate.dataset.date = dateStr;
    
    modalMood.innerHTML = `
        <div>${moodEmojis[data.mood]}</div>
        <div style="font-size: 1.5rem; margin-top: 10px; color: #6366f1;">${moodLabels[data.mood]}</div>
    `;
    
    modalNote.textContent = data.note || '没有留下更多记录';
    if (!data.note) {
        modalNote.style.fontStyle = 'italic';
        modalNote.style.color = '#9ca3af';
    } else {
        modalNote.style.fontStyle = 'normal';
        modalNote.style.color = '#6b7280';
    }

    modal.style.display = 'block';
}

// 关闭弹窗
function closeModal() {
    document.getElementById('mood-modal').style.display = 'none';
}

// 显示通知
function showNotification(message) {
    // 创建简单通知
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
