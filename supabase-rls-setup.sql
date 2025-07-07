-- 智语 (JingYu) - Supabase RLS 策略配置
-- 此脚本用于配置 ChengYu 表的行级安全策略

-- 1. 启用 RLS （如果尚未启用）
ALTER TABLE public."ChengYu" ENABLE ROW LEVEL SECURITY;

-- 2. 删除可能存在的旧策略，然后创建新策略
DROP POLICY IF EXISTS "Allow anonymous read access to ChengYu" ON public."ChengYu";
CREATE POLICY "Allow anonymous read access to ChengYu" 
ON public."ChengYu" 
FOR SELECT 
USING (true);

-- 3. 为已认证用户创建读取策略（如果需要更细粒度控制）
DROP POLICY IF EXISTS "Allow authenticated read access to ChengYu" ON public."ChengYu";
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
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
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
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
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
DROP POLICY IF EXISTS "Users can manage own learning records" ON public.learning_records;
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

-- ========================================
-- 完整用户数据库架构 (Extended User Database Schema)
-- ========================================

-- 扩展用户表结构
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_difficulty TEXT CHECK (preferred_difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 10;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- 扩展学习记录表结构
ALTER TABLE public.learning_records ADD COLUMN IF NOT EXISTS mastery_level INTEGER CHECK (mastery_level BETWEEN 0 AND 100) DEFAULT 0;
ALTER TABLE public.learning_records ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5);
ALTER TABLE public.learning_records ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.learning_records ADD COLUMN IF NOT EXISTS session_id UUID;

-- 扩展收藏表结构
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 创建测试记录表
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 测试基本信息
  quiz_type TEXT CHECK (quiz_type IN ('meaning', 'pinyin', 'complete', 'origin', 'mixed')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')) NOT NULL,
  category TEXT,
  
  -- 测试结果
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  time_spent INTEGER NOT NULL,
  
  -- 详细数据
  questions_data JSONB NOT NULL,
  performance_analysis JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 成就基本信息
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('learning', 'streak', 'test', 'social', 'collection')) NOT NULL,
  
  -- 成就条件
  condition_type TEXT CHECK (condition_type IN ('count', 'streak', 'score', 'time', 'custom')) NOT NULL,
  condition_value INTEGER NOT NULL,
  condition_data JSONB DEFAULT '{}',
  
  -- 成就奖励
  reward_type TEXT CHECK (reward_type IN ('points', 'badge', 'title', 'feature')) NOT NULL,
  reward_value INTEGER DEFAULT 0,
  reward_data JSONB DEFAULT '{}',
  
  -- 成就属性
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 1,
  points INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户成就关联表
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  
  -- 进度信息
  progress INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP,
  
  -- 展示设置
  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- 创建学习会话表
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 会话信息
  session_type TEXT CHECK (session_type IN ('casual', 'focused', 'test', 'review')) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER,
  
  -- 会话统计
  idioms_studied INTEGER DEFAULT 0,
  idioms_mastered INTEGER DEFAULT 0,
  tests_taken INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  
  -- 会话数据
  activity_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户设置表
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 通知设置
  notifications_enabled BOOLEAN DEFAULT true,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '09:00:00',
  study_streak_reminder BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  
  -- 学习设置
  auto_play_pronunciation BOOLEAN DEFAULT false,
  show_pinyin_by_default BOOLEAN DEFAULT true,
  preferred_font_size INTEGER DEFAULT 16,
  dark_mode_enabled BOOLEAN DEFAULT false,
  
  -- 隐私设置
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'friends', 'private')) DEFAULT 'public',
  show_learning_stats BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  
  -- 其他设置
  language TEXT DEFAULT 'zh-CN',
  timezone TEXT DEFAULT 'Asia/Shanghai',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 创建学习统计表
CREATE TABLE IF NOT EXISTS public.learning_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 统计周期
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 学习统计
  total_study_time INTEGER DEFAULT 0,
  idioms_studied INTEGER DEFAULT 0,
  idioms_mastered INTEGER DEFAULT 0,
  tests_taken INTEGER DEFAULT 0,
  average_test_score DECIMAL(5,2),
  
  -- 行为统计
  login_days INTEGER DEFAULT 0,
  study_sessions INTEGER DEFAULT 0,
  favorites_added INTEGER DEFAULT 0,
  
  -- 分类统计
  category_breakdown JSONB DEFAULT '{}',
  difficulty_breakdown JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, period_type, period_start)
);

-- ========================================
-- 启用所有表的 RLS
-- ========================================

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_statistics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 创建 RLS 策略
-- ========================================

-- 测试记录表策略
DROP POLICY IF EXISTS "Users can manage own quiz results" ON public.quiz_results;
CREATE POLICY "Users can manage own quiz results" 
ON public.quiz_results 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 成就表策略（所有已认证用户可读取）
DROP POLICY IF EXISTS "Authenticated users can read achievements" ON public.achievements;
CREATE POLICY "Authenticated users can read achievements" 
ON public.achievements 
FOR SELECT 
TO authenticated 
USING (true);

-- 用户成就关联表策略
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
CREATE POLICY "Users can manage own achievements" 
ON public.user_achievements 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 学习会话表策略
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.learning_sessions;
CREATE POLICY "Users can manage own sessions" 
ON public.learning_sessions 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 用户设置表策略
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" 
ON public.user_settings 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 学习统计表策略
DROP POLICY IF EXISTS "Users can manage own statistics" ON public.learning_statistics;
CREATE POLICY "Users can manage own statistics" 
ON public.learning_statistics 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- ========================================
-- 创建索引以提升性能
-- ========================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 学习记录表索引
CREATE INDEX IF NOT EXISTS idx_learning_records_user_action ON public.learning_records(user_id, action);
CREATE INDEX IF NOT EXISTS idx_learning_records_created_at_desc ON public.learning_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_records_session_id ON public.learning_records(session_id);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_updated ON public.favorites(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_next_review ON public.favorites(next_review_at);
CREATE INDEX IF NOT EXISTS idx_favorites_priority ON public.favorites(user_id, priority DESC);

-- 测试记录表索引
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_score ON public.quiz_results(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_type ON public.quiz_results(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON public.quiz_results(created_at DESC);

-- 成就表索引
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON public.achievements(is_active);

-- 用户成就表索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON public.user_achievements(user_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress ON public.user_achievements(user_id, progress DESC);

-- 学习会话表索引
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_time ON public.learning_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON public.learning_sessions(session_type);

-- 学习统计表索引
CREATE INDEX IF NOT EXISTS idx_learning_statistics_period ON public.learning_statistics(user_id, period_type, period_start DESC);

-- ========================================
-- 插入示例成就数据
-- ========================================

INSERT INTO public.achievements (name, description, icon, category, condition_type, condition_value, reward_type, difficulty, points) VALUES
('初学者', '学习第一个成语', 'star', 'learning', 'count', 1, 'points', 1, 10),
('勤奋学习', '学习10个成语', 'book-open', 'learning', 'count', 10, 'points', 2, 50),
('博学多才', '学习100个成语', 'graduation-cap', 'learning', 'count', 100, 'badge', 3, 200),
('连续学习', '连续学习3天', 'calendar', 'streak', 'streak', 3, 'points', 2, 30),
('坚持不懈', '连续学习7天', 'flame', 'streak', 'streak', 7, 'badge', 3, 100),
('测试达人', '完成第一次测试', 'target', 'test', 'count', 1, 'points', 1, 15),
('收藏家', '收藏10个成语', 'heart', 'collection', 'count', 10, 'points', 2, 40)
ON CONFLICT DO NOTHING;

-- ========================================
-- 创建有用的数据库函数
-- ========================================

-- 生成用户学习周报
CREATE OR REPLACE FUNCTION generate_weekly_report(user_id UUID, week_start DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'studyTime', COALESCE(SUM(duration), 0),
    'idiomsStudied', COUNT(DISTINCT idiom_id),
    'sessionsCount', COUNT(DISTINCT session_id),
    'averageSessionTime', COALESCE(AVG(duration), 0),
    'categoryBreakdown', json_object_agg(
      COALESCE(metadata->>'category', 'unknown'), 
      COUNT(*)
    )
  ) INTO result
  FROM learning_records
  WHERE user_id = $1 
    AND created_at >= $2 
    AND created_at < $2 + INTERVAL '7 days'
    AND action IN ('study', 'practice');
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 计算用户学习连续天数
CREATE OR REPLACE FUNCTION calculate_study_streak(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM learning_records 
      WHERE user_id = $1 
        AND DATE(created_at) = check_date
        AND action IN ('study', 'practice', 'test')
    ) INTO has_activity;
    
    IF NOT has_activity THEN
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新用户成就进度
CREATE OR REPLACE FUNCTION update_achievement_progress(user_id UUID, achievement_category TEXT)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
  user_progress INTEGER;
  current_value INTEGER;
BEGIN
  FOR achievement_record IN 
    SELECT * FROM achievements 
    WHERE category = achievement_category AND is_active = true
  LOOP
    -- 根据成就类型计算当前进度
    CASE achievement_record.condition_type
      WHEN 'count' THEN
        CASE achievement_record.category
          WHEN 'learning' THEN
            SELECT COUNT(DISTINCT idiom_id) INTO current_value
            FROM learning_records 
            WHERE user_id = $1 AND action IN ('study', 'practice');
          WHEN 'test' THEN
            SELECT COUNT(*) INTO current_value
            FROM quiz_results 
            WHERE user_id = $1;
          WHEN 'collection' THEN
            SELECT COUNT(*) INTO current_value
            FROM favorites 
            WHERE user_id = $1;
          ELSE
            current_value := 0;
        END CASE;
      WHEN 'streak' THEN
        SELECT calculate_study_streak($1) INTO current_value;
      ELSE
        current_value := 0;
    END CASE;
    
    -- 更新或插入用户成就进度
    INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
    VALUES (
      $1, 
      achievement_record.id, 
      LEAST(current_value, achievement_record.condition_value),
      current_value >= achievement_record.condition_value,
      CASE WHEN current_value >= achievement_record.condition_value THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(current_value, achievement_record.condition_value),
      is_unlocked = current_value >= achievement_record.condition_value,
      unlocked_at = CASE 
        WHEN current_value >= achievement_record.condition_value AND user_achievements.unlocked_at IS NULL 
        THEN NOW() 
        ELSE user_achievements.unlocked_at 
      END,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 创建触发器自动更新成就
-- ========================================

-- 学习记录触发器
CREATE OR REPLACE FUNCTION trigger_update_learning_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_achievement_progress(NEW.user_id, 'learning');
  PERFORM update_achievement_progress(NEW.user_id, 'streak');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_achievements_trigger
  AFTER INSERT ON learning_records
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_learning_achievements();

-- 测试记录触发器
CREATE OR REPLACE FUNCTION trigger_update_test_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_achievement_progress(NEW.user_id, 'test');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_achievements_trigger
  AFTER INSERT ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_test_achievements();

-- 收藏触发器
CREATE OR REPLACE FUNCTION trigger_update_collection_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_achievement_progress(NEW.user_id, 'collection');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_achievements_trigger
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_collection_achievements();

-- ========================================
-- 完成提示
-- ========================================

-- 显示配置完成信息
DO $$
BEGIN
  RAISE NOTICE '✅ 用户数据库架构配置完成！';
  RAISE NOTICE '📊 已创建的表：';
  RAISE NOTICE '   - users (扩展)';
  RAISE NOTICE '   - learning_records (扩展)';
  RAISE NOTICE '   - favorites (扩展)';
  RAISE NOTICE '   - quiz_results';
  RAISE NOTICE '   - achievements';
  RAISE NOTICE '   - user_achievements';
  RAISE NOTICE '   - learning_sessions';
  RAISE NOTICE '   - user_settings';
  RAISE NOTICE '   - learning_statistics';
  RAISE NOTICE '🔒 RLS 策略已启用';
  RAISE NOTICE '📈 性能索引已创建';
  RAISE NOTICE '🎯 示例成就数据已插入';
  RAISE NOTICE '⚡ 自动触发器已配置';
END $$; 