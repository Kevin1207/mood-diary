# 通过GitHub部署到Vercel

## 步骤一：将项目推送到GitHub

```bash
# 1. 初始化Git仓库
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: 心情日记应用"

# 4. 在GitHub上创建新仓库
# 访问 https://github.com/new
# 创建名为 mood-diary 的仓库

# 5. 关联远程仓库（替换成你的用户名）
git remote add origin https://github.com/zhaolong/mood-diary.git

# 6. 推送到GitHub
git branch -M main
git push -u origin main
```

## 步骤二：连接Vercel

1. 访问 https://vercel.com
2. 用GitHub账号登录
3. 点击 "Add New..." → "Project"
4. 选择 "Import Git Repository"
5. 找到你的 `mood-diary` 仓库
6. 点击 "Import"
7. 保持默认配置，点击 "Deploy"
8. 完成！

## 优势

✅ 每次推送到GitHub，自动重新部署
✅ 支持回滚到之前的版本
✅ 完整的部署历史记录
✅ 团队协作更方便

## 后续更新

以后只需要：
```bash
git add .
git commit -m "更新内容"
git push
```

Vercel会自动检测并重新部署！
