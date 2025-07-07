# 智语 - Supabase 配置指南

## 🚨 问题诊断

您的 Supabase 连接正常，但无法获取数据是因为 **RLS（Row Level Security）策略** 阻止了数据访问。

## 🔧 解决方案

### 方法一：在 Supabase 控制台中配置（推荐）

1. **打开 Supabase 控制台**
   - 访问：https://supabase.com/dashboard
   - 选择您的项目

2. **进入 SQL 编辑器**
   - 在左侧导航栏中点击 "SQL Editor"
   - 点击 "New query"

3. **执行配置脚本**
   - 复制以下 SQL 代码：

```sql
-- 为 ChengYu 表创建读取策略
CREATE POLICY "Allow anonymous read access to ChengYu" 
ON public."ChengYu" 
FOR SELECT 
USING (true);
```

4. **运行脚本**
   - 点击 "Run" 按钮执行

### 方法二：使用图形界面配置

1. **进入 Authentication > Policies**
   - 在左侧导航栏点击 "Authentication"
   - 点击 "Policies" 标签

2. **找到 ChengYu 表**
   - 在表列表中找到 "ChengYu" 表
   - 点击 "New Policy"

3. **创建策略**
   - 选择 "Get started quickly"
   - 选择 "Enable read access for all users"
   - 点击 "Review"
   - 点击 "Save policy"

### 方法三：临时禁用 RLS（仅用于测试）

⚠️ **注意：此方法仅用于开发测试，不推荐在生产环境使用**

```sql
-- 临时禁用 RLS
ALTER TABLE public."ChengYu" DISABLE ROW LEVEL SECURITY;
```

## 🎯 配置完成后的验证

运行以下命令验证配置是否成功：

```bash
node debug-supabase.js
```

如果看到类似以下输出，说明配置成功：

```
✅ 计数成功！总记录数: 30895
✅ 分页查询成功！获取到 5 条记录
```

## 📋 完整的数据库架构配置

如果您需要完整的数据库架构（包括用户、收藏、学习记录等功能），请在 SQL 编辑器中运行 `supabase-rls-setup.sql` 文件中的所有代码。

## 🔒 安全建议

1. **生产环境配置**：
   - 使用强密码和双因素认证
   - 定期轮换 API 密钥
   - 监控数据库访问日志

2. **RLS 策略**：
   - 始终为用户数据表启用 RLS
   - 定期审查和更新安全策略
   - 测试策略的有效性

3. **数据备份**：
   - 设置自动备份计划
   - 定期测试数据恢复流程

## 📱 手机号注册配置

### 启用手机号认证

1. **在 Supabase Dashboard 中配置**：
   - 前往 **Authentication** → **Settings**
   - 在 **Auth Providers** 部分启用 **Phone**
   - 配置 SMS 提供商

2. **SMS 提供商配置（Twilio 推荐）**：
   ```
   Provider: Twilio
   Account SID: 你的 Twilio Account SID
   Auth Token: 你的 Twilio Auth Token
   Phone Number: 你的 Twilio 手机号
   ```

3. **运行数据库更新脚本**：
   在 Supabase SQL 编辑器中运行 `supabase-phone-auth-setup.sql` 文件

4. **中国大陆用户注意事项**：
   - 由于网络限制，可能需要使用国内 SMS 服务
   - 推荐使用阿里云短信、腾讯云短信等
   - 或者配置代理服务器

### 手机号注册流程

1. **用户填写信息**：手机号、用户名、密码
2. **发送验证码**：系统发送6位数字验证码
3. **验证手机号**：用户输入验证码完成注册
4. **自动登录**：验证成功后自动登录

### 功能特性

- ✅ **双重认证方式**：支持邮箱和手机号两种注册方式
- ✅ **验证码发送**：自动发送6位数字验证码
- ✅ **重发机制**：60秒冷却时间，支持重新发送
- ✅ **格式验证**：自动验证手机号格式
- ✅ **用户体验**：美观的UI界面，实时反馈

## 🎯 下一步

配置完成后，您可以：
1. 在应用中测试 Supabase 连接
2. 开始实现用户认证功能
3. 集成学习记录和收藏功能
4. 测试手机号注册功能

如果遇到问题，请检查：
- Supabase 项目状态
- RLS 策略配置
- API 密钥是否正确
- 网络连接是否正常

## 📋 完整用户数据库配置

### 🚀 扩展数据库架构

如果您需要完整的用户数据库功能（包括用户认证、学习统计、成就系统等），请按以下步骤操作：

#### 1. 运行完整架构脚本

在 Supabase SQL 编辑器中运行完整的 `supabase-rls-setup.sql` 文件，该文件包含：

**核心表结构：**
- `users` - 用户信息表（扩展）
- `learning_records` - 学习记录表（扩展）
- `favorites` - 收藏表（扩展）
- `quiz_results` - 测试记录表
- `achievements` - 成就定义表
- `user_achievements` - 用户成就关联表
- `learning_sessions` - 学习会话表
- `user_settings` - 用户设置表
- `learning_statistics` - 学习统计表

**功能特性：**
- 🔒 完整的 RLS 安全策略
- 📈 性能优化索引
- 🎯 示例成就数据
- ⚡ 自动触发器（成就进度更新）
- 📊 统计函数（学习报告、连续天数计算）

#### 2. 启用用户认证

在 Supabase 控制台中：

1. **进入 Authentication > Settings**
2. **启用 Email 认证**：
   ```
   Enable email confirmations: true
   Enable email change confirmations: true
   ```

3. **配置 Email 模板**（可选）：
   - 自定义注册确认邮件
   - 自定义密码重置邮件

#### 3. 验证配置

运行以下 SQL 验证配置：

```sql
-- 检查表是否创建成功
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'learning_records', 'favorites', 'quiz_results', 'achievements', 'user_achievements', 'learning_sessions', 'user_settings', 'learning_statistics');

-- 检查 RLS 是否启用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'learning_records', 'favorites', 'quiz_results', 'achievements', 'user_achievements', 'learning_sessions', 'user_settings', 'learning_statistics');

-- 检查示例成就数据
SELECT name, category, condition_type, condition_value 
FROM achievements 
ORDER BY difficulty, points;
```

#### 4. 应用端集成

在您的应用中，现在可以使用以下功能：

**用户认证：**
```typescript
// 用户注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      username: 'username',
      full_name: 'Full Name'
    }
  }
});

// 用户登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

**学习记录：**
```typescript
// 记录学习行为
const { data, error } = await supabase
  .from('learning_records')
  .insert({
    user_id: userId,
    idiom_id: 'idiom_123',
    action: 'study',
    duration: 120,
    source: 'search'
  });
```

**收藏管理：**
```typescript
// 添加收藏
const { data, error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    idiom_id: 'idiom_123',
    tags: ['重要', '常用'],
    notes: '这个成语很有用'
  });
```

**成就查询：**
```typescript
// 获取用户成就
const { data, error } = await supabase
  .from('user_achievements')
  .select(`
    *,
    achievement:achievements(*)
  `)
  .eq('user_id', userId)
  .eq('is_unlocked', true);
```

#### 5. 数据迁移（如果需要）

如果您有现有的本地数据需要迁移：

```typescript
// 迁移本地收藏数据到 Supabase
async function migrateFavorites(localFavorites: string[]) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return;

  const favoritesToInsert = localFavorites.map(idiomId => ({
    user_id: userId,
    idiom_id: idiomId
  }));

  const { error } = await supabase
    .from('favorites')
    .insert(favoritesToInsert);
  
  if (!error) {
    // 清除本地数据
    await AsyncStorage.removeItem('favorites');
  }
}
```

### 🎯 功能亮点

完整配置后，您的应用将支持：

- ✅ **用户系统**：注册、登录、个人资料管理
- ✅ **学习追踪**：详细的学习行为记录和统计
- ✅ **智能收藏**：支持标签、笔记、复习计划
- ✅ **测试系统**：完整的测试记录和分析
- ✅ **成就系统**：自动解锁成就，激励学习
- ✅ **个性化设置**：通知、主题、学习偏好
- ✅ **数据分析**：学习报告、进度统计
- ✅ **离线同步**：支持离线使用和数据同步

### 📞 技术支持

如果在配置过程中遇到问题：

1. **检查 Supabase 项目状态**
2. **确认 RLS 策略正确配置**
3. **验证用户认证设置**
4. **查看数据库日志**

需要帮助时，请提供：
- 错误信息截图
- 相关的 SQL 查询
- Supabase 项目配置

## 🚀 配置后的使用

配置完成后，您就可以正常使用我们的 API 了：

```typescript
import { supabaseApi } from './services/supabaseApi';

// 获取成语列表
const idioms = await supabaseApi.idioms.list();
console.log(idioms.data); // 应该显示成语数据

// 搜索成语
const searchResults = await supabaseApi.idioms.search({
  q: '一心',
  type: 'word'
});
console.log(searchResults.data); // 应该显示搜索结果
```

## 📞 故障排除

如果配置后仍然无法获取数据，请检查：

1. **策略是否生效**：
   - 在 Supabase 控制台的 "Authentication > Policies" 中查看策略
   - 确保策略状态为 "Active"

2. **表名是否正确**：
   - 确认表名为 "ChengYu"（注意大小写）
   - 检查表是否在 public schema 中

3. **网络连接**：
   - 确认能够访问 Supabase 服务
   - 检查防火墙设置

4. **API 密钥**：
   - 确认使用的是正确的 anon key
   - 检查密钥是否有效

## 📈 性能优化建议

配置完成后，建议添加以下索引以提高查询性能：

```sql
-- 为常用字段创建索引
CREATE INDEX IF NOT EXISTS idx_chengyu_word ON public."ChengYu" (word);
CREATE INDEX IF NOT EXISTS idx_chengyu_first ON public."ChengYu" (first);
CREATE INDEX IF NOT EXISTS idx_chengyu_pinyin ON public."ChengYu" (pinyin);
```

## 🎉 配置完成

按照以上步骤配置完成后，您的智语应用就可以正常从 Supabase 获取成语数据了！

## 1. 基础配置

### 1.1 项目设置
- 项目名称：JingYu（智语）
- 数据库：PostgreSQL
- 认证：启用匿名访问和用户注册

### 1.2 环境变量配置
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 2. 数据库架构部署

### 2.1 部署状态
✅ **数据库架构已成功创建** (2024-12-19)

所有核心表和策略已部署完成：
- ✅ 用户表 (users) - 用户基础信息
- ✅ 学习记录表 (learning_records) - 学习行为跟踪
- ✅ 收藏表 (favorites) - 用户收藏管理
- ✅ 测试记录表 (quiz_results) - 测试成绩记录
- ✅ 成就表 (achievements) - 成就定义
- ✅ 用户成就表 (user_achievements) - 用户成就进度
- ✅ 学习会话表 (learning_sessions) - 学习会话管理
- ✅ 用户设置表 (user_settings) - 个人设置
- ✅ 学习统计表 (learning_statistics) - 学习数据统计

### 2.2 RLS 策略状态
✅ **所有行级安全策略已配置完成**
- 用户数据隔离：每个用户只能访问自己的数据
- 成语数据开放：所有用户可读取成语内容
- 成就数据共享：已认证用户可查看所有成就定义 

## 数据库配置

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com) 并创建新项目。

### 2. 获取项目配置

在项目设置中获取以下信息：
- Project URL
- API Keys (anon/public key)
- Service Role Key (用于管理员操作)

### 3. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 邮件配置（解决速率限制）

### 问题描述
Supabase 默认邮件服务有严格的速率限制（每小时 2-4 封邮件），这会导致注册时出现 "email rate limit exceeded" 错误。

### 解决方案：配置自定义 SMTP

#### 1. Gmail SMTP 配置

1. **启用 Gmail 两步验证**
   - 登录 Gmail 账户
   - 前往 "管理您的 Google 账户" → "安全性"
   - 启用 "两步验证"

2. **生成应用专用密码**
   - 在 "安全性" 页面，找到 "应用专用密码"  
   - 选择 "邮件" 和 "其他（自定义名称）"
   - 输入 "Supabase SMTP"
   - 复制生成的 16 位密码  nmbj zftj axpe dhci

3. **在 Supabase 中配置 SMTP**
   - 前往 Supabase 项目 → Settings → Authentication
   - 滚动到 "SMTP Settings" 部分
   - 填写以下信息：
     ```
     Enable custom SMTP: 开启
     Host: smtp.gmail.com
     Port: 587
     Username: your-email@gmail.com
     Password: 生成的16位应用专用密码
     Sender email: your-email@gmail.com
     Sender name: 智语 App
     ```

4. **调整邮件速率限制**
   - 在 SMTP Settings 上方，点击 "Email rates can be adjusted here"
   - 将 "Rate limit for sending emails" 设置为合理数值（如 100/hour）
   - 保存设置

#### 2. 其他 SMTP 服务选项

**SendGrid**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your_sendgrid_api_key
```

**Mailgun**
```
Host: smtp.mailgun.org
Port: 587
Username: your_mailgun_username
Password: your_mailgun_password
```

**腾讯企业邮箱**
```
Host: smtp.exmail.qq.com
Port: 587
Username: your-email@your-domain.com
Password: your_email_password
```

### 开发环境测试方案

#### 方案 1：禁用邮件验证（仅开发环境）

在 Supabase 项目设置中：
- Settings → Authentication → General
- 关闭 "Enable email confirmations"
- 这样注册时不会发送验证邮件

#### 方案 2：使用临时邮箱测试

使用临时邮箱服务进行测试：
- [TempMail](https://tempmail.email/)
- [10MinuteMail](https://10minutemail.com/)
- [Guerrilla Mail](https://www.guerrillamail.com/)

#### 方案 3：使用 Supabase Admin SDK

```javascript
// 服务端代码，使用 Service Role Key
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 直接创建用户，跳过邮件验证
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'user@example.com',
  password: 'password123',
  email_confirm: true // 直接确认邮箱
})
```

### 验证配置

配置完成后，可以通过以下方式验证：

1. **测试邮件发送**
   - 在 Supabase Dashboard → Authentication → Users
   - 点击 "Invite user" 测试邮件发送

2. **测试注册流程**
   - 使用应用的注册功能
   - 检查是否能正常接收验证邮件

3. **监控邮件日志**
   - 在 Supabase Dashboard → Logs
   - 查看邮件发送日志

### 注意事项

1. **生产环境建议**
   - 使用专业的邮件服务（SendGrid、Mailgun 等）
   - 配置 SPF、DKIM 记录提高邮件送达率
   - 监控邮件发送状态和反弹率

2. **安全考虑**
   - 不要在代码中硬编码 SMTP 密码
   - 使用环境变量管理敏感信息
   - 定期更换 SMTP 密码

3. **速率限制**
   - 根据应用规模合理设置速率限制
   - 监控邮件发送量，避免被 SMTP 服务商限制 