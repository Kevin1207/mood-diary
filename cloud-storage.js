// ==================== Cloudflare D1 云端存储功能 ====================

// API 配置
const API_BASE_URL = 'https://mood-diary-api.zhaolong57.workers.dev/api';
let currentUser = null;
let authToken = null;

// 检查是否已配置API
function isAPIConfigured() {
    return API_BASE_URL !== 'https://YOUR_WORKER_URL_HERE/api';
}

// 检查用户登录状态
async function checkLoginStatus() {
    // 从 localStorage 恢复登录状态
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        showUserInfo(currentUser.username);
        hideAuthOverlay();
        
        // 从云端加载数据
        if (isAPIConfigured()) {
            await loadDataFromCloud();
        } else {
            loadMoodDataLocal();
        }
        return true;
    }
    
    showAuthOverlay();
    loadMoodDataLocal(); // 加载本地缓存
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
    if (!isAPIConfigured()) {
        alert('云端服务未配置！数据将仅保存在本地。');
        // 创建本地虚拟用户
        currentUser = { id: 'local', username, email };
        authToken = 'local-token';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', authToken);
        showUserInfo(username);
        hideAuthOverlay();
        showNotification('注册成功！（本地模式）');
        return true;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '注册失败');
        }
        
        currentUser = data.user;
        authToken = data.token;
        
        // 保存到 localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', authToken);
        
        showUserInfo(username);
        hideAuthOverlay();
        showNotification('注册成功！欢迎使用心情日记！🎉');
        
        // 同步本地数据到云端
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
    if (!isAPIConfigured()) {
        alert('云端服务未配置！请先部署 Cloudflare Workers。');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '登录失败');
        }
        
        currentUser = data.user;
        authToken = data.token;
        
        // 保存到 localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', authToken);
        
        showUserInfo(currentUser.username);
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
    currentUser = null;
    authToken = null;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    hideUserInfo();
    showAuthOverlay();
    
    // 清空本地数据
    moodData = {};
    renderCalendar();
    showNotification('已安全登出！');
}

// 从云端加载数据
async function loadDataFromCloud() {
    if (!isAPIConfigured() || !currentUser || !authToken) {
        loadMoodDataLocal();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/moods`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-User-Id': currentUser.id,
            },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '加载数据失败');
        }
        
        moodData = {};
        data.moods.forEach(record => {
            moodData[record.date] = {
                mood: record.mood,
                note: record.note || '',
                timestamp: record.updated_at,
            };
        });
        
        // 同时保存到本地作为缓存
        saveMoodDataLocal();
    } catch (error) {
        console.error('从云端加载数据失败:', error);
        // 如果加载失败，尝试从本地缓存加载
        loadMoodDataLocal();
        showNotification('云端加载失败，使用本地缓存');
    }
}

// 保存单条心情到云端
async function saveMoodToCloud(date, moodInfo) {
    // 先保存到本地
    saveMoodDataLocal();
    
    if (!isAPIConfigured() || !currentUser || !authToken) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/moods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-User-Id': currentUser.id,
            },
            body: JSON.stringify({
                date,
                mood: moodInfo.mood,
                note: moodInfo.note,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '保存失败');
        }
    } catch (error) {
        console.error('保存到云端失败:', error);
        showNotification('云端同步失败，已保存到本地');
    }
}

// 从云端删除心情记录
async function deleteMoodFromCloud(date) {
    // 先从本地删除
    saveMoodDataLocal();
    
    if (!isAPIConfigured() || !currentUser || !authToken) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/moods/${date}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-User-Id': currentUser.id,
            },
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || '删除失败');
        }
    } catch (error) {
        console.error('从云端删除失败:', error);
    }
}

// 同步所有本地数据到云端
async function syncDataToCloud() {
    if (!isAPIConfigured() || !currentUser || !authToken) return;
    
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

export {
    checkLoginStatus,
    register,
    login,
    logout,
    saveMoodToCloud,
    deleteMoodFromCloud,
    loadMoodDataLocal,
    saveMoodDataLocal
};
