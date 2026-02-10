# LeanCloud 配置指南 ☁️

本应用已集成 LeanCloud 云端存储功能，支持跨设备数据同步！

## 🚀 如何配置

### 第一步：注册 LeanCloud

1. **访问** https://console.leancloud.cn
2. **注册账号**（使用手机号即可，免费）
3. **验证邮箱**（如果需要）

### 第二步：创建应用

1. 登录后，点击 **"创建应用"**
2. 应用名称：填写 `mood-diary` 或你喜欢的名字
3. 选择 **"开发版"**（免费版本，足够使用）
4. 点击 **"创建"**

### 第三步：获取配置信息

1. 进入你创建的应用
2. 点击左侧菜单 **"设置"** → **"应用凭证"**
3. 你会看到：
   - **AppID**：类似 `abc123xyz456-MdYXbMMI`
   - **AppKey**：类似 `def456uvw789`
   - **服务器地址**：类似 `https://abc123xyz.lc-cn-n1-shared.com`

### 第四步：配置应用

打开项目中的 `config.js` 文件，替换以下内容：

```javascript
const LEANCLOUD_CONFIG = {
    appId: 'YOUR_APP_ID_HERE',        // 替换为你的 AppID
    appKey: 'YOUR_APP_KEY_HERE',      // 替换为你的 AppKey
    serverURL: 'https://YOUR_APP_ID.lc-cn-n1-shared.com'  // 替换为你的服务器地址
};
```

**示例**：
```javascript
const LEANCLOUD_CONFIG = {
    appId: 'abc123xyz456-MdYXbMMI',
    appKey: 'def456uvw789',
    serverURL: 'https://abc123xyz.lc-cn-n1-shared.com'
};
```

### 第五步：推送到GitHub

```bash
git add config.js
git commit -m "配置LeanCloud云端存储"
git push
```

等待自动部署完成（1-2分钟）。

### 第六步：使用

1. 访问你的网站
2. 首次使用会看到登录界面
3. 点击 **"立即注册"** 创建账号
4. 注册后开始记录心情
5. 所有数据自动同步到云端！

---

## ✨ 功能说明

### 用户系统
- ✅ 注册新账号（用户名、邮箱、密码）
- ✅ 登录现有账号
- ✅ 安全登出

### 数据同步
- ✅ 所有心情记录自动保存到云端
- ✅ 跨设备自动同步（手机、电脑、平板）
- ✅ 实时同步，无需手动操作
- ✅ 数据永久保存，不会丢失

### 多设备使用
1. 在电脑上记录心情 → 自动同步到云端
2. 在手机上打开网站 → 用同一账号登录
3. 看到所有之前的记录！✨

---

## 🔒 安全性

- ✅ 密码加密存储
- ✅ HTTPS 安全传输
- ✅ 每个用户的数据完全隔离
- ✅ 符合数据安全规范

---

## 💰 费用说明

**完全免费！**

LeanCloud 开发版免费额度：
- ✅ 每天 3万次 API 请求
- ✅ 1GB 数据存储
- ✅ 500个并发连接

对于个人使用的心情日记应用，这个额度完全足够！

---

## ❓ 常见问题

### 1. 如果不配置 LeanCloud 会怎样？

不配置也能正常使用！数据会保存在浏览器本地（localStorage）。但是：
- ❌ 无法跨设备同步
- ❌ 清除浏览器缓存会丢失数据
- ❌ 换浏览器看不到之前的数据

### 2. 已有的本地数据会怎样？

配置 LeanCloud 并登录后：
- ✅ 本地数据会自动同步到云端
- ✅ 不会丢失任何记录
- ✅ 本地和云端数据会合并

### 3. 可以换其他云服务吗？

当前版本使用 LeanCloud，因为：
- ✅ 国内访问稳定
- ✅ 免费额度充足
- ✅ 使用简单

如果需要其他云服务（如 Firebase、Supabase），可以联系开发者定制。

### 4. 忘记密码怎么办？

LeanCloud 支持密码重置功能：
1. 在登录界面（未来版本会添加"忘记密码"链接）
2. 或访问 LeanCloud 控制台手动重置

---

## 📝 数据结构

在 LeanCloud 控制台的 **"数据存储"** → **"数据"** 中，你会看到：

### MoodRecord 表
| 字段 | 类型 | 说明 |
|------|------|------|
| user | Pointer | 用户关联 |
| date | String | 日期（YYYY-MM-DD） |
| mood | String | 心情类型 |
| note | String | 心情笔记 |
| timestamp | String | 记录时间 |

---

## 🎉 完成！

配置完成后，你就拥有了一个功能完整、支持云端同步的心情日记应用了！

有问题随时提出！💪
