# 部署指南 🚀

将你的心情日记应用部署到外网，让你可以随时随地访问！

## 推荐方案对比

| 平台 | 难度 | 速度 | 费用 | 推荐度 |
|------|------|------|------|--------|
| **Vercel** | ⭐ 极简单 | ⚡️ 极快 | 💰 免费 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐ 简单 | ⚡️ 快 | 💰 免费 | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐ 中等 | ⚡️ 快 | 💰 免费 | ⭐⭐⭐⭐ |
| **Cloudflare Pages** | ⭐⭐ 中等 | ⚡️ 极快 | 💰 免费 | ⭐⭐⭐⭐ |

---

## 方案一：Vercel 部署（最推荐）⭐

### 特点
- 🚀 部署速度极快（1分钟内完成）
- 🌐 自动提供HTTPS域名
- 🔄 支持自动部署
- 📱 完美支持静态网站

### 部署步骤

#### 方式A：拖拽部署（超简单！）

1. **访问** [https://vercel.com](https://vercel.com)
2. **注册/登录** 账号（可用GitHub/Google登录）
3. **点击** "Add New Project"
4. **选择** "Deploy from GitHub" 或直接上传文件夹
5. **等待** 10秒自动部署
6. **完成！** 获得你的网址：`https://你的项目名.vercel.app`

#### 方式B：命令行部署

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 在项目目录下运行
vercel

# 3. 按提示操作，完成！
```

---

## 方案二：Netlify 部署 ⭐

### 特点
- 🎯 拖拽即可部署
- 🌐 免费HTTPS和CDN
- 🔧 功能丰富
- 📊 提供访问统计

### 部署步骤

1. **访问** [https://www.netlify.com](https://www.netlify.com)
2. **注册/登录** 账号
3. **拖拽** 整个项目文件夹到网页
4. **完成！** 获得网址：`https://随机名称.netlify.app`

#### 自定义域名（可选）
- 在Netlify设置中可以修改子域名
- 例如：`https://mood-diary.netlify.app`

---

## 方案三：GitHub Pages 部署 ⭐

### 特点
- 📦 与GitHub仓库集成
- 🆓 完全免费
- 🔒 数据在你的仓库中
- 🌐 域名格式：`username.github.io/repo-name`

### 部署步骤

#### 1. 创建GitHub仓库

```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 心情日记应用"

# 关联远程仓库（替换成你的用户名）
git remote add origin https://github.com/你的用户名/mood-diary.git

# 推送到GitHub
git push -u origin main
```

#### 2. 启用GitHub Pages

1. 打开你的GitHub仓库
2. 点击 **Settings**（设置）
3. 左侧菜单选择 **Pages**
4. Source选择 **main** 分支
5. 文件夹选择 **/ (root)**
6. 点击 **Save**
7. 等待1-2分钟，访问：`https://你的用户名.github.io/仓库名/`

---

## 方案四：Cloudflare Pages 部署 ⭐

### 特点
- ⚡️ 全球CDN加速（中国访问快）
- 🔒 免费SSL证书
- 🚀 无限带宽
- 🌍 访问速度快

### 部署步骤

1. **访问** [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. **注册/登录** Cloudflare账号
3. **创建项目** → 选择 "Direct Upload"
4. **上传** 项目文件夹
5. **完成！** 获得网址：`https://项目名.pages.dev`

---

## 快速开始推荐 🎯

### 如果你...

- **想最快部署** → 选择 **Vercel**（拖拽上传）
- **想要简单维护** → 选择 **Netlify**（拖拽上传）
- **想要代码版本控制** → 选择 **GitHub Pages**
- **在中国访问更快** → 选择 **Cloudflare Pages**

---

## 注意事项 ⚠️

### 数据存储说明

这个应用使用 `localStorage` 存储数据，意味着：

✅ **优点**
- 完全免费
- 无需后端服务器
- 数据私密（存在本地浏览器）

⚠️ **限制**
- 数据存在浏览器中，**不同设备无法同步**
- 清除浏览器缓存会丢失数据
- 不能在多个设备间共享

### 如果需要跨设备同步

如果你需要在手机、电脑等多设备同步数据，可以考虑：

1. **添加导出/导入功能**（推荐）
   - 导出为JSON文件
   - 在另一设备导入

2. **使用云存储**（需要开发）
   - 接入Firebase
   - 使用LeanCloud
   - 自建后端API

我可以帮你添加导出/导入功能，这样就能手动同步数据了！

---

## 自定义域名（可选）

所有平台都支持绑定自定义域名，例如：
- `mood.你的域名.com`
- `diary.你的域名.com`

需要：
1. 购买域名（阿里云、腾讯云、GoDaddy等）
2. 在部署平台添加自定义域名
3. 配置DNS解析

---

## 我的建议 💡

**对于新手，我强烈推荐：**

🥇 **第一选择：Vercel**
- 注册账号 → 拖拽文件夹 → 完成！
- 最快5分钟搞定

🥈 **第二选择：Netlify**  
- 同样简单，功能更多

🥉 **第三选择：GitHub Pages**
- 如果你想学习Git，选这个

---

需要我帮你执行具体的部署步骤吗？告诉我你想用哪个平台！
