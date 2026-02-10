# Cloudflare D1 + Workers 部署指南 ☁️

完整的云端同步解决方案！使用 Cloudflare D1 数据库 + Workers API。

---

## 🎯 方案优势

✅ **完全免费**（每天10万次读取，5万次写入）  
✅ **全球CDN**，国内访问稳定快速  
✅ **无需额外注册**，使用现有Cloudflare账号  
✅ **数据安全**，SQL数据库存储  
✅ **自动备份**，数据永不丢失  

---

## 📋 部署步骤

### 第一步：创建 D1 数据库

1. **登录 Cloudflare**  
   访问 https://dash.cloudflare.com

2. **进入 Workers & Pages**  
   左侧菜单 → Workers & Pages

3. **创建 D1 数据库**  
   - 点击 "D1" 标签页
   - 点击 "Create database"
   - 数据库名称：`mood-diary-db`
   - 点击 "Create"

4. **初始化数据库**  
   - 进入刚创建的数据库
   - 点击 "Console" 标签
   - 复制粘贴 `workers/schema.sql` 的内容
   - 点击 "Execute"

5. **获取数据库 ID**  
   - 在数据库详情页面，复制 "Database ID"
   - 类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

### 第二步：部署 Workers API

#### 方式A：使用 Wrangler CLI（推荐）

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 进入 workers 目录
cd workers

# 4. 编辑 wrangler.toml，填入你的数据库 ID
# 修改 database_id 为你的实际 ID

# 5. 部署 Worker
wrangler deploy

# 6. 记录 Worker URL
# 部署成功后会显示类似：https://mood-diary-api.YOUR_SUBDOMAIN.workers.dev
```

#### 方式B：通过网页界面

1. **访问** Workers & Pages → Create application → Create Worker
2. **Worker 名称**：`mood-diary-api`
3. **复制** `workers/api.js` 的全部代码
4. **粘贴** 到编辑器中
5. **点击** "Save and Deploy"
6. **配置 D1 绑定**：
   - 进入 Worker 设置
   - Settings → Variables → D1 Database Bindings
   - Variable name: `DB`
   - D1 database: 选择 `mood-diary-db`
   - 保存

7. **获取 Worker URL**  
   类似：`https://mood-diary-api.YOUR_SUBDOMAIN.workers.dev`

---

### 第三步：配置前端

1. **编辑 `cloud-storage.js`**  
   找到第4行：
   ```javascript
   const API_BASE_URL = 'https://YOUR_WORKER_URL_HERE/api';
   ```
   
   替换为你的 Worker URL：
   ```javascript
   const API_BASE_URL = 'https://mood-diary-api.YOUR_SUBDOMAIN.workers.dev/api';
   ```

2. **保存并推送到 GitHub**
   ```bash
   git add .
   git commit -m "配置Cloudflare D1云端存储"
   git push
   ```

3. **等待部署**  
   GitHub Pages 和 Cloudflare Pages 会自动重新部署（1-2分钟）

---

### 第四步：测试

1. **访问网站**  
   - GitHub Pages: https://kevin1207.github.io/mood-diary/
   - Cloudflare Pages: https://mood-diary.pages.dev

2. **注册账号**  
   点击"立即注册"，填写信息

3. **记录心情**  
   选择心情，添加笔记，保存

4. **验证同步**  
   - 在 Cloudflare Dashboard → D1 → mood-diary-db → Console
   - 执行：`SELECT * FROM moods;`
   - 应该能看到你刚才的记录！

5. **跨设备测试**  
   - 在另一台设备打开网站
   - 用同一账号登录
   - 看到所有记录！✨

---

## 🔧 常见问题

### 1. Worker部署后404错误？

检查 Worker 的路由配置：
- Worker 设置 → Triggers → Routes
- 确保没有冲突的路由

### 2. 数据库连接失败？

检查 D1 绑定：
- Worker 设置 → Variables → D1 Database Bindings
- 确保 Variable name 是 `DB`
- 确保选择了正确的数据库

### 3. CORS错误？

Workers API 已包含 CORS 头，如果还有问题：
- 检查 Worker 代码中的 CORS 设置
- 确保前端使用正确的 API URL

### 4. 未配置时能用吗？

可以！未配置时会使用本地存储（localStorage）：
- ✅ 数据保存在浏览器
- ❌ 无法跨设备同步
- ❌ 清除缓存会丢失数据

---

## 💰 费用说明

**完全免费！**

Cloudflare 免费额度：
- ✅ D1: 每天 100,000 次读取，50,000 次写入
- ✅ Workers: 每天 100,000 次请求
- ✅ 5 GB 存储空间

对于个人心情日记应用，完全够用！

---

## 📊 监控数据

在 Cloudflare Dashboard 可以查看：
- Workers 请求次数
- D1 数据库查询统计
- 错误日志

---

## 🎉 完成！

配置完成后，你就拥有了：
- ✅ 云端同步的心情日记
- ✅ 跨设备数据一致
- ✅ 安全的用户认证
- ✅ 永久免费的云存储

**开始记录你的心情吧！** 🌈✨

---

## 📝 项目结构

```
mood-diary/
├── index.html              # 主页面
├── style.css               # 样式
├── script.js               # 前端逻辑
├── cloud-storage.js        # 云端存储模块
├── config.js               # API配置
└── workers/
    ├── api.js              # Workers API代码
    ├── schema.sql          # 数据库架构
    └── wrangler.toml       # Wrangler配置
```

有问题随时提出！💪
