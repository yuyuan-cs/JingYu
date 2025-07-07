-- 修复用户注册时的 RLS 策略问题
-- 解决 "new row violates row-level security policy for table 'users'" 错误

-- 1. 删除现有的用户表策略
DROP POLICY IF EXISTS "用户只能查看和编辑自己的资料" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can manage own data" ON users;

-- 2. 创建新的策略集合

-- 策略1：允许用户查看自己的数据
CREATE POLICY "users_select_own" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- 策略2：允许用户插入自己的数据（注册时）
CREATE POLICY "users_insert_own" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 策略3：允许用户更新自己的数据
CREATE POLICY "users_update_own" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 策略4：允许用户删除自己的数据（可选）
CREATE POLICY "users_delete_own" ON users
  FOR DELETE 
  USING (auth.uid() = id);

-- 3. 验证策略是否生效
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 4. 检查 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- 5. 确保 users 表结构正确
-- 检查是否有 phone 字段
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT UNIQUE;
  END IF;
END $$;

-- 6. 更新约束，确保至少有邮箱或手机号之一
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

-- 7. 创建手机号索引（如果不存在）
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- 8. 显示最终的表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 