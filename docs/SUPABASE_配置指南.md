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

1. **生产环境**：
   - 保持 RLS 开启
   - 只为需要的操作创建策略
   - 定期审查策略

2. **开发环境**：
   - 可以暂时禁用 RLS 以便测试
   - 在部署前重新启用并配置正确的策略

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