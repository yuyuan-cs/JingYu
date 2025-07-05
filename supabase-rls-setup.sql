-- 智语 (JingYu) - Supabase RLS 策略配置
-- 此脚本用于配置 ChengYu 表的行级安全策略

-- 1. 启用 RLS （如果尚未启用）
ALTER TABLE public."ChengYu" ENABLE ROW LEVEL SECURITY;

-- 2. 为匿名用户和已认证用户创建读取策略
CREATE POLICY "Allow anonymous read access to ChengYu" 
ON public."ChengYu" 
FOR SELECT 
USING (true);

-- 3. 为已认证用户创建读取策略（如果需要更细粒度控制）
CREATE POLICY "Allow authenticated read access to ChengYu" 
ON public."ChengYu" 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. 可选：为特定操作创建策略
-- 如果您需要用户能够添加收藏等功能，可以创建其他表的策略

-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 启用用户表的 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能访问自己的数据
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 创建收藏表（如果不存在）
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  idiom_id TEXT NOT NULL, -- 对应 ChengYu.derivation
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, idiom_id)
);

-- 启用收藏表的 RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 收藏表策略：用户只能管理自己的收藏
CREATE POLICY "Users can manage own favorites" 
ON public.favorites 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 创建学习记录表（如果不存在）
CREATE TABLE IF NOT EXISTS public.learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  idiom_id TEXT NOT NULL, -- 对应 ChengYu.derivation
  action TEXT CHECK (action IN ('view', 'study', 'test', 'favorite')),
  duration INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 启用学习记录表的 RLS
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;

-- 学习记录表策略：用户只能访问自己的学习记录
CREATE POLICY "Users can manage own learning records" 
ON public.learning_records 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 验证策略是否生效
-- 运行此脚本后，您应该能够无需登录即可查询 ChengYu 表的数据

-- 可选：如果您想要完全开放 ChengYu 表的访问（不推荐生产环境）
-- 可以禁用 RLS：
-- ALTER TABLE public."ChengYu" DISABLE ROW LEVEL SECURITY;

-- 建议：为了安全起见，建议保持 RLS 开启，只为需要的操作创建策略 