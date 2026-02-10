// ==================== LeanCloud 云端存储功能 ====================

// LeanCloud 配置（请在 config.js 中填写）
let AV;
let currentUser = null;

// 初始化 LeanCloud
function initLeanCloud() {
    // 检查配置
    const config = {
        appId: 'YOUR_APP_ID_HERE',
        appKey: 'YOUR_APP_KEY_HERE',
        serverURL: 'https://YOUR_APP_ID.lc-cn-n1-shared.com'
    };
    
    // 判断是否已配置
    if (config.appId === 'YOUR_APP_ID_HERE') {
        console.warn('请先配置 LeanCloud！访问 https://console.leancloud.cn 注册并创建应用');
        // 未配置则使用本地存储
        return false;
    }
    
    try {
        AV = window.AV;
        AV.init(config);
        return true;
    } catch (error) {
        console.error('LeanCloud 初始化失败:', error);
        return false;
    }
}

// 检查用户登录状态
async function checkLoginStatus() {
    if (!AV) return false;
    
    try {
        currentUser = AV.User.current();
        if (currentUser) {
            showUserInfo(currentUser.get('username'));
            hideAuthOverlay();
            return true;
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
    }
    
    showAuthOverlay();
    return false;
}

// 显示用户信息
function showUserInfo(username) {
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    usernameDisplay.textContent = `👤 ${username}`;
    userInfo.style.display = 'flex';
}

// 隐藏用户信息
function hideUserInfo() {
    const userInfo = document.getElementById('user-info');
    userInfo.style.display = 'none';
}

// 显示登录界面
function showAuthOverlay() {
    const authOverlay = document.getElementById('auth-overlay');
    authOverlay.style.display = 'flex';
}

// 隐藏登录界面
function hideAuthOverlay() {
    const authOverlay = document.getElementById('auth-overlay');
    authOverlay.style.display = 'none';
}

// 用户注册
async function register(username, email, password) {
    if (!AV) {
        alert('云端服务未配置，请先配置 LeanCloud！');
        return false;
    }
    
    try {
        const user = new AV.User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        
        await user.signUp();
        currentUser = user;
        showUserInfo(username);
        hideAuthOverlay();
        showNotification('注册成功！欢迎使用心情日记！🎉');
        
        // 同步数据
        await syncDataToCloud();
        return true;
    } catch (error) {
        console.error('注册失败:', error);
        alert(`注册失败：${error.message}`);
        return false;
    }
}

// 用户登录
async function login(username, password) {
    if (!AV) {
        alert('云端服务未配置，请先配置 LeanCloud！');
        return false;
    }
    
    try {
        const user = await AV.User.logIn(username, password);
        currentUser = user;
        showUserInfo(user.get('username'));
        hideAuthOverlay();
        showNotification('登录成功！正在同步数据...⏳');
        
        // 从云端加载数据
        await loadDataFromCloud();
        renderCalendar();
        showNotification('数据同步完成！✅');
        return true;
    } catch (error) {
        console.error('登录失败:', error);
        alert(`登录失败：${error.message}`);
        return false;
    }
}

// 用户登出
async function logout() {
    if (!AV || !currentUser) return;
    
    try {
        await AV.User.logOut();
        currentUser = null;
        hideUserInfo();
        showAuthOverlay();
        
        // 清空本地数据
        moodData = {};
        renderCalendar();
        showNotification('已安全登出！');
    } catch (error) {
        console.error('登出失败:', error);
        alert(`登出失败：${error.message}`);
    }
}

// 从云端加载数据
async function loadDataFromCloud() {
    if (!AV || !currentUser) return;
    
    try {
        const query = new AV.Query('MoodRecord');
        query.equalTo('user', currentUser);
        query.limit(1000); // 最多加载1000条记录
        
        const records = await query.find();
        moodData = {};
        
        records.forEach(record => {
            const date = record.get('date');
            moodData[date] = {
                mood: record.get('mood'),
                note: record.get('note') || '',
                timestamp: record.get('timestamp')
            };
        });
        
        // 同时保存到本地作为缓存
        localStorage.setItem('moodData', JSON.stringify(moodData));
    } catch (error) {
        console.error('从云端加载数据失败:', error);
        // 如果加载失败，尝试从本地缓存加载
        loadMoodDataLocal();
    }
}

// 保存单条心情到云端
async function saveMoodToCloud(date, moodInfo) {
    if (!AV || !currentUser) {
        // 未登录或未配置，仅保存到本地
        saveMoodDataLocal();
        return;
    }
    
    try {
        // 查询是否已存在该日期的记录
        const query = new AV.Query('MoodRecord');
        query.equalTo('user', currentUser);
        query.equalTo('date', date);
        
        let record = await query.first();
        
        if (record) {
            // 更新现有记录
            record.set('mood', moodInfo.mood);
            record.set('note', moodInfo.note);
            record.set('timestamp', moodInfo.timestamp);
        } else {
            // 创建新记录
            const MoodRecord = AV.Object.extend('MoodRecord');
            record = new MoodRecord();
            record.set('user', currentUser);
            record.set('date', date);
            record.set('mood', moodInfo.mood);
            record.set('note', moodInfo.note);
            record.set('timestamp', moodInfo.timestamp);
        }
        
        await record.save();
        
        // 同时保存到本地缓存
        saveMoodDataLocal();
    } catch (error) {
        console.error('保存到云端失败:', error);
        // 保存失败时至少保存到本地
        saveMoodDataLocal();
        showNotification('云端同步失败，已保存到本地');
    }
}

// 从云端删除心情记录
async function deleteMoodFromCloud(date) {
    if (!AV || !currentUser) {
        // 未登录或未配置，仅从本地删除
        saveMoodDataLocal();
        return;
    }
    
    try {
        const query = new AV.Query('MoodRecord');
        query.equalTo('user', currentUser);
        query.equalTo('date', date);
        
        const record = await query.first();
        if (record) {
            await record.destroy();
        }
        
        // 同时从本地删除
        saveMoodDataLocal();
    } catch (error) {
        console.error('从云端删除失败:', error);
        saveMoodDataLocal();
    }
}

// 同步所有本地数据到云端
async function syncDataToCloud() {
    if (!AV || !currentUser) return;
    
    try {
        for (const [date, moodInfo] of Object.entries(moodData)) {
            await saveMoodToCloud(date, moodInfo);
        }
        showNotification('数据已全部同步到云端！☁️');
    } catch (error) {
        console.error('同步数据失败:', error);
    }
}

// 本地存储功能（作为降级方案）
function loadMoodDataLocal() {
    const saved = localStorage.getItem('moodData');
    if (saved) {
        moodData = JSON.parse(saved);
    }
}

function saveMoodDataLocal() {
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

// ==================== 原有代码修改 ====================

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
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化 LeanCloud
    const cloudEnabled = initLeanCloud();
    
    if (cloudEnabled) {
        // 检查登录状态
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
            // 已登录，从云端加载数据
            await loadDataFromCloud();
        } else {
            // 未登录，从本地加载（如果有的话）
            loadMoodDataLocal();
        }
    } else {
        // 未配置云端服务，使用本地存储
        loadMoodDataLocal();
    }
    
    initializeDatePicker();
    loadBackground();
    renderCalendar();
    attachEventListeners();
    attachBackgroundListeners();
    attachAuthListeners();
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
// 移除旧的loadMoodData和saveMoodData函数，已在云端存储部分实现

// 绑定认证事件监听器
function attachAuthListeners() {
    // 切换到注册表单
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
    
    // 切换到登录表单
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    // 登录按钮
    document.getElementById('login-btn')?.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            alert('请填写用户名和密码！');
            return;
        }
        
        await login(username, password);
    });
    
    // 注册按钮
    document.getElementById('register-btn')?.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // 验证
        if (!username || !email || !password || !confirmPassword) {
            alert('请填写所有字段！');
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            alert('用户名需要3-20个字符！');
            return;
        }
        
        if (password.length < 6) {
            alert('密码至少需要6位！');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        await register(username, email, password);
    });
    
    // 登出按钮
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        if (confirm('确定要登出吗？登出后数据仍会保存在云端。')) {
            await logout();
        }
    });
    
    // 回车登录
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('login-btn').click();
        }
    });
    
    // 回车注册
    document.getElementById('register-confirm-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('register-btn').click();
        }
    });
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
async function saveMood() {
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

    // 保存到云端和本地
    await saveMoodToCloud(selectedDate, moodData[selectedDate]);
    renderCalendar();
    
    showNotification('心情保存成功！💾');
}

// 删除心情
async function deleteMood() {
    const dateToDelete = document.getElementById('modal-date').dataset.date;
    if (confirm('确定要删除这条心情记录吗？')) {
        delete moodData[dateToDelete];
        await deleteMoodFromCloud(dateToDelete);
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

// ==================== 背景设置功能 ====================

// 加载保存的背景
function loadBackground() {
    const savedBg = localStorage.getItem('backgroundSettings');
    if (savedBg) {
        const bgSettings = JSON.parse(savedBg);
        applyBackground(bgSettings.type, bgSettings.value);
    } else {
        // 如果没有保存的背景，应用默认背景
        const defaultBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        applyBackground('gradient', defaultBg);
    }
}

// 应用背景
function applyBackground(type, value) {
    const html = document.documentElement;
    const body = document.body;
    
    // 移除所有背景相关的内联样式
    html.style.removeProperty('background');
    html.style.removeProperty('background-color');
    html.style.removeProperty('background-image');
    html.style.removeProperty('background-size');
    html.style.removeProperty('background-position');
    html.style.removeProperty('background-attachment');
    body.style.removeProperty('background');
    body.style.removeProperty('background-color');
    
    // 使用 setProperty 设置样式，确保优先级
    if (type === 'gradient' || type === 'color') {
        html.style.setProperty('background', value, 'important');
        html.style.setProperty('background-attachment', 'fixed', 'important');
        body.style.setProperty('background', 'transparent', 'important');
    } else if (type === 'image') {
        html.style.setProperty('background-image', `url(${value})`, 'important');
        html.style.setProperty('background-size', 'cover', 'important');
        html.style.setProperty('background-position', 'center', 'important');
        html.style.setProperty('background-attachment', 'fixed', 'important');
        body.style.setProperty('background', 'transparent', 'important');
    }
}

// 保存背景设置
function saveBackground(type, value) {
    const bgSettings = { type, value };
    localStorage.setItem('backgroundSettings', JSON.stringify(bgSettings));
}

// 绑定背景设置事件
function attachBackgroundListeners() {
    const bgSettingsBtn = document.getElementById('bg-settings-btn');
    const bgModal = document.getElementById('bg-modal');
    const bgClose = document.querySelector('.bg-close');
    const bgOptions = document.querySelectorAll('.bg-option');
    const uploadBtn = document.getElementById('upload-btn');
    const bgUpload = document.getElementById('bg-upload');
    const removeBgBtn = document.getElementById('remove-bg-btn');
    const previewContainer = document.getElementById('preview-container');
    const bgPreview = document.getElementById('bg-preview');

    // 打开背景设置
    bgSettingsBtn.addEventListener('click', () => {
        bgModal.style.display = 'block';
        updateSelectedBackground();
    });

    // 关闭背景设置
    bgClose.addEventListener('click', () => {
        bgModal.style.display = 'none';
    });

    bgModal.addEventListener('click', (e) => {
        if (e.target === bgModal) {
            bgModal.style.display = 'none';
        }
    });

    // 选择预设背景
    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            const value = option.dataset.value;
            
            applyBackground(type, value);
            saveBackground(type, value);
            updateSelectedBackground();
            showNotification('背景已更换！🎨');
        });
    });

    // 上传图片按钮
    uploadBtn.addEventListener('click', () => {
        bgUpload.click();
    });

    // 处理图片上传
    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件！');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                
                // 显示预览
                bgPreview.src = imageData;
                previewContainer.style.display = 'block';
                
                // 应用背景
                applyBackground('image', imageData);
                saveBackground('image', imageData);
                showNotification('背景图片已上传！📸');
            };
            reader.readAsDataURL(file);
        }
    });

    // 移除自定义背景
    removeBgBtn.addEventListener('click', () => {
        // 恢复默认背景
        const defaultBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        applyBackground('gradient', defaultBg);
        saveBackground('gradient', defaultBg);
        
        // 隐藏预览
        previewContainer.style.display = 'none';
        bgPreview.src = '';
        bgUpload.value = '';
        
        updateSelectedBackground();
        showNotification('已恢复默认背景！');
    });

    // 加载已上传的图片预览
    const savedBg = localStorage.getItem('backgroundSettings');
    if (savedBg) {
        const bgSettings = JSON.parse(savedBg);
        if (bgSettings.type === 'image') {
            bgPreview.src = bgSettings.value;
            previewContainer.style.display = 'block';
        }
    }
}

// 更新选中状态
function updateSelectedBackground() {
    const savedBg = localStorage.getItem('backgroundSettings');
    const bgOptions = document.querySelectorAll('.bg-option');
    
    bgOptions.forEach(option => option.classList.remove('selected'));
    
    if (savedBg) {
        const bgSettings = JSON.parse(savedBg);
        bgOptions.forEach(option => {
            if (option.dataset.type === bgSettings.type && 
                option.dataset.value === bgSettings.value) {
                option.classList.add('selected');
            }
        });
    }
}

document.head.appendChild(style);
