# 智语 - 成语学习应用

智语是一个基于 React Native 和 Expo 的成语学习应用，集成了用户认证、学习记录、收藏系统、测试功能和成就系统。

## 🚨 注册问题快速解决方案

如果您遇到 "email rate limit exceeded" 或 "new row violates row-level security policy" 错误，请按以下步骤操作：

### 方法 1：使用手机号注册（推荐）🆕

1. 在登录页面选择 **"手机号注册"**
2. 输入中国大陆手机号（格式：1[3-9]xxxxxxxxx）
3. 设置密码和用户名
4. 点击"发送验证码"
5. 输入收到的6位验证码
6. 完成注册

**优势**：
- 无需邮件验证
- 注册速度快
- 支持短信验证码
- 避免邮件速率限制

### 方法 2：修复 RLS 权限问题

如果遇到 "new row violates row-level security policy" 错误：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 前往 **SQL Editor**
3. 运行项目中的 `supabase-rls-simple-fix.sql` 文件
4. 确保 RLS 策略正确配置

### 方法 3：临时禁用邮件验证

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 前往 **Settings** → **Authentication**
4. 找到 **General** 部分
5. **关闭** "Enable email confirmations"
6. 点击 **Save** 保存设置

**现在可以正常注册了！** 用户注册后会直接激活，无需邮件验证。

### 方法 4：配置 Gmail SMTP（推荐）

1. 启用 Gmail 两步验证
2. 生成应用专用密码
3. 在 Supabase 中配置 SMTP 设置
4. 详细步骤请参考 `docs/SUPABASE_配置指南.md`

### 方法 5：使用临时邮箱测试

- [TempMail](https://tempmail.email/)
- [10MinuteMail](https://10minutemail.com/)
- [Guerrilla Mail](https://www.guerrillamail.com/)

## 🔧 快速测试修复

运行测试脚本验证修复是否成功：

```bash
node test-auth-fix.js
```

该脚本会检查：
- 数据库连接
- RLS 策略配置
- 认证流程
- 手机号格式验证

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd JingYu
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在手机上安装 Expo Go 应用，扫描二维码

## 📱 功能特性

### 🔐 用户认证系统
- 邮箱注册/登录
- 手机号注册/登录 🆕
- 短信验证码
- 密码重置
- 用户资料管理
- 头像上传

### 📚 学习功能
- 成语浏览和学习
- **高频词关联功能** 🆕
  - 智能识别高频成语
  - 展示难度等级和分类信息
  - 提供易混淆词汇对比
  - 显示易错场景提醒
- 学习记录跟踪
- 学习时长统计
- 学习热力图

### ❤️ 收藏系统
- 成语收藏/取消收藏
- 收藏标签管理
- 收藏优先级设置
- 收藏筛选和搜索

### 🎯 测试系统
- 多种测试类型（释义、拼音、补全等）
- 实时计时
- 成绩记录和统计
- 错题回顾

### 🏆 成就系统
- 学习成就
- 连续学习奖励
- 测试成就
- 收藏成就

### 📊 统计分析
- 学习数据可视化
- 进度跟踪
- 成绩分析
- 学习报告

## 🛠️ 技术栈

- **前端**: React Native + Expo
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **状态管理**: React Hooks + Context
- **导航**: Expo Router
- **UI组件**: 自定义组件 + Lucide Icons
- **数据库**: PostgreSQL (通过 Supabase)

## 📁 项目结构

```
JingYu/
├── app/                    # 页面组件
│   ├── (tabs)/            # 底部导航页面
│   ├── auth.tsx           # 认证页面
│   ├── quiz.tsx           # 测试页面
│   └── achievements.tsx   # 成就页面
├── components/            # 可复用组件
├── hooks/                 # 自定义 Hooks
├── services/              # API 服务
├── data/                  # 数据文件
└── docs/                  # 项目文档
```

## 🔧 配置说明

### Supabase 配置

1. 创建 Supabase 项目
2. 运行 `supabase-rls-setup.sql` 创建数据库表
3. 配置环境变量或直接在代码中设置

### 数据库表

项目包含以下数据库表：
- `users` - 用户信息
- `learning_records` - 学习记录
- `favorites` - 收藏记录
- `quiz_results` - 测试结果
- `achievements` - 成就定义
- `user_achievements` - 用户成就
- `learning_sessions` - 学习会话
- `user_settings` - 用户设置
- `learning_statistics` - 学习统计

## 📖 文档

详细文档请查看 `docs/` 文件夹：

- [项目概述](docs/project-overview.md)
- [开发指南](docs/development-guide.md)
- [API 文档](docs/api-reference.md)
- [数据模型](docs/data-model.md)
- [Supabase 配置指南](docs/SUPABASE_配置指南.md)

## 🧪 功能测试指南

### 测试成语和高频词关联功能

1. **启动应用**
   ```bash
   npm start
   ```

2. **访问成语详情页面**
   - 在主页点击任意成语卡片
   - 或在搜索页面点击搜索结果
   - 正确的URL格式：`http://localhost:8081/idiom/[成语ID]`

3. **验证高频词信息显示**
   - 如果该成语存在于高频词数据库中，会在详情页面看到额外的学习信息
   - 包括：难度等级、分类、易混淆词汇、易错场景等
   - 信息以彩色卡片形式展示，与页面主题色保持一致

4. **测试导航功能**
   - 确认从不同入口点击成语都能正确跳转到详情页面
   - 验证页面参数正确传递
   - 检查返回按钮功能是否正常

### 常见问题排查

**问题**: URL 显示为 `http://localhost:8081/idiom/` 但没有成语ID
**解决**: 检查点击的成语卡片是否正确传递了ID参数

**问题**: 详情页面显示"成语未找到"
**解决**: 确认成语ID在数据库中存在，检查数据同步状态

**问题**: 高频词信息不显示
**解决**: 这是正常的，只有在高频词数据库中的成语才会显示额外信息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 常见问题

### Q: 无法注册用户？
A: 请参考上面的 "注册问题快速解决方案" 部分。

### Q: 如何重置数据库？
A: 重新运行 `supabase-rls-setup.sql` 文件。

### Q: 如何添加新的成语数据？
A: 成语数据存储在 Supabase 的 `ChengYu` 表中，可以通过 Dashboard 直接添加。

### Q: 如何自定义主题？
A: 目前主题硬编码在组件中，后续版本会支持主题切换。

---

**智语** - 让成语学习更有趣！ 🎉
