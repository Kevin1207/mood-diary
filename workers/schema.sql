-- Cloudflare D1 数据库初始化脚本
-- 请在 D1 Console 中分别执行以下每条语句

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. 创建心情记录表
CREATE TABLE IF NOT EXISTS moods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    mood TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, date)
);

-- 3. 创建索引 - moods.user_id
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);

-- 4. 创建索引 - moods.date
CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date);

-- 5. 创建索引 - users.username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 6. 创建索引 - users.email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
