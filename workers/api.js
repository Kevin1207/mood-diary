// Cloudflare Workers API for Mood Diary
// 这是后端API，用于处理用户认证和数据存储

import bcrypt from 'bcryptjs';

export default {
  async fetch(request, env) {
    // 处理CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 路由处理
      if (path === '/api/register' && request.method === 'POST') {
        return await handleRegister(request, env);
      } else if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      } else if (path === '/api/moods' && request.method === 'GET') {
        return await handleGetMoods(request, env);
      } else if (path === '/api/moods' && request.method === 'POST') {
        return await handleSaveMood(request, env);
      } else if (path.startsWith('/api/moods/') && request.method === 'DELETE') {
        return await handleDeleteMood(request, env, path);
      } else {
        return jsonResponse({ error: 'Not found' }, 404);
      }
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

// 用户注册
async function handleRegister(request, env) {
  const { username, email, password } = await request.json();

  // 验证输入
  if (!username || !email || !password) {
    return jsonResponse({ error: '请填写所有字段' }, 400);
  }

  if (username.length < 3 || username.length > 20) {
    return jsonResponse({ error: '用户名需要3-20个字符' }, 400);
  }

  if (password.length < 6) {
    return jsonResponse({ error: '密码至少需要6位' }, 400);
  }

  // 检查用户是否已存在
  const existingUser = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ? OR email = ?'
  ).bind(username, email).first();

  if (existingUser) {
    return jsonResponse({ error: '用户名或邮箱已被使用' }, 400);
  }

  // 创建用户
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, username, email, passwordHash, new Date().toISOString()).run();

  // 生成token
  const token = await generateToken(userId);

  return jsonResponse({
    success: true,
    user: { id: userId, username, email },
    token,
  });
}

// 用户登录
async function handleLogin(request, env) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return jsonResponse({ error: '请填写用户名和密码' }, 400);
  }

  // 查找用户
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ? OR email = ?'
  ).bind(username, username).first();

  if (!user) {
    return jsonResponse({ error: '用户名或密码错误' }, 401);
  }

  // 验证密码
  const passwordMatch = await verifyPassword(password, user.password_hash);
  if (!passwordMatch) {
    return jsonResponse({ error: '用户名或密码错误' }, 401);
  }

  // 生成token
  const token = await generateToken(user.id);

  return jsonResponse({
    success: true,
    user: { id: user.id, username: user.username, email: user.email },
    token,
  });
}

// 获取用户的所有心情记录
async function handleGetMoods(request, env) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return jsonResponse({ error: '未授权' }, 401);
  }

  const moods = await env.DB.prepare(
    'SELECT * FROM moods WHERE user_id = ? ORDER BY date DESC'
  ).bind(userId).all();

  return jsonResponse({ moods: moods.results || [] });
}

// 保存心情记录
async function handleSaveMood(request, env) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return jsonResponse({ error: '未授权' }, 401);
  }

  const { date, mood, note } = await request.json();

  if (!date || !mood) {
    return jsonResponse({ error: '日期和心情不能为空' }, 400);
  }

  // 检查是否已存在该日期的记录
  const existing = await env.DB.prepare(
    'SELECT * FROM moods WHERE user_id = ? AND date = ?'
  ).bind(userId, date).first();

  if (existing) {
    // 更新
    await env.DB.prepare(
      'UPDATE moods SET mood = ?, note = ?, updated_at = ? WHERE user_id = ? AND date = ?'
    ).bind(mood, note || '', new Date().toISOString(), userId, date).run();
  } else {
    // 创建
    const moodId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO moods (id, user_id, date, mood, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(moodId, userId, date, mood, note || '', new Date().toISOString(), new Date().toISOString()).run();
  }

  return jsonResponse({ success: true });
}

// 删除心情记录
async function handleDeleteMood(request, env, path) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return jsonResponse({ error: '未授权' }, 401);
  }

  const date = path.split('/').pop();

  await env.DB.prepare(
    'DELETE FROM moods WHERE user_id = ? AND date = ?'
  ).bind(userId, date).run();

  return jsonResponse({ success: true });
}

// 辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function hashPassword(password) {
  // 简化版密码哈希（生产环境应使用更安全的方法）
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

async function generateToken(userId) {
  // 简单的token生成（生产环境应使用JWT）
  const data = `${userId}:${Date.now()}:${Math.random()}`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getUserIdFromRequest(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  
  // 简化版token验证（生产环境应该验证JWT）
  // 这里我们从token解析出userId（实际应该从数据库验证）
  const token = auth.substring(7);
  // 暂时从header中获取userId（客户端需要发送）
  const userId = request.headers.get('X-User-Id');
  return userId;
}
