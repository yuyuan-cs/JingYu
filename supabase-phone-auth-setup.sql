-- 更新用户表，添加手机号字段
-- 如果 users 表不存在，先创建它
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保至少有邮箱或手机号之一
  CONSTRAINT users_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- 如果 users 表已存在，添加手机号字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT UNIQUE;
  END IF;
END $$;

-- 更新约束，确保至少有邮箱或手机号之一
DO $$
BEGIN
  -- 删除旧约束（如果存在）
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_contact_check' AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_contact_check;
  END IF;
  
  -- 添加新约束
  ALTER TABLE users ADD CONSTRAINT users_contact_check 
    CHECK (email IS NOT NULL OR phone IS NOT NULL);
END $$;

-- 更新 email 字段为可选
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 创建手机号索引
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- 启用行级安全 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "用户只能查看和编辑自己的资料" ON users;

-- 创建 RLS 策略
CREATE POLICY "用户只能查看和编辑自己的资料" ON users
  FOR ALL USING (auth.uid() = id);

-- 创建更新时间戳触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 在 Supabase 中启用手机号认证
-- 注意：以下设置需要在 Supabase Dashboard 中手动配置

/*
手机号认证配置步骤：

1. 在 Supabase Dashboard 中：
   - 前往 Authentication > Settings
   - 在 "Auth Providers" 部分启用 "Phone"
   - 配置 SMS 提供商（推荐使用 Twilio）

2. SMS 提供商配置（Twilio 示例）：
   - 注册 Twilio 账户
   - 获取 Account SID 和 Auth Token
   - 在 Supabase 中配置：
     * Provider: Twilio
     * Account SID: 你的 Twilio Account SID
     * Auth Token: 你的 Twilio Auth Token
     * Phone Number: 你的 Twilio 手机号

3. 中国大陆用户注意事项：
   - 由于网络限制，可能需要使用国内 SMS 服务
   - 可以考虑使用阿里云短信、腾讯云短信等
   - 或者配置代理服务器

4. 测试配置：
   - 在 Authentication > Users 中测试发送验证码
   - 确认能正常接收短信验证码

5. 生产环境配置：
   - 设置合理的速率限制
   - 配置短信模板
   - 监控短信发送量和费用
*/

-- 验证配置
SELECT 
  'users 表结构' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 检查约束
SELECT 
  'users 表约束' as check_type,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'users';

-- 检查 RLS 状态
SELECT 
  'RLS 状态' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users'; 