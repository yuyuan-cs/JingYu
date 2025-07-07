-- 简化的 RLS 策略修复
-- 解决用户注册时的权限问题

-- 1. 删除现有的所有用户表策略
DROP POLICY IF EXISTS "用户只能查看和编辑自己的资料" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- 2. 创建一个统一的策略，允许用户管理自己的数据
CREATE POLICY "users_manage_own_data" ON users
  FOR ALL 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. 验证策略
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 4. 确保 RLS 已启用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. 检查表结构
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 