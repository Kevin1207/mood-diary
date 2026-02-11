-- 快速执行版本（无注释，适合直接粘贴）

CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS moods (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, date TEXT NOT NULL, mood TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(user_id, date));

CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);

CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
