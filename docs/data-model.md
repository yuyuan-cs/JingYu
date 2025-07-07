# 数据模型文档

## 概述

本文档详细描述了境语应用的数据结构、数据管理策略和数据流设计。

## 核心数据模型

### 成语数据模型 (Idiom)

#### 数据结构定义

```typescript
export interface Idiom {
  id: string;                                    // 唯一标识符
  idiom: string;                                 // 成语文本
  pinyin: string;                                // 拼音
  meaning: string;                               // 释义
  origin: string;                                // 出处
  example: string;                               // 例句
  similar: string[];                             // 相似成语列表
  category: string;                              // 分类
  difficulty: 'easy' | 'medium' | 'hard';        // 难度等级
}
```

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | `string` | 是 | 成语的唯一标识符，用于路由和状态管理 |
| `idiom` | `string` | 是 | 成语的汉字文本，通常为四字成语 |
| `pinyin` | `string` | 是 | 成语的拼音标注，包含声调 |
| `meaning` | `string` | 是 | 成语的详细释义和含义解释 |
| `origin` | `string` | 是 | 成语的历史出处和典故来源 |
| `example` | `string` | 是 | 成语在现代语境中的使用例句 |
| `similar` | `string[]` | 否 | 与当前成语意思相近的其他成语列表 |
| `category` | `string` | 是 | 成语的分类标签，如"艺术创作"、"学习教育"等 |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | 是 | 成语的学习难度等级 |

#### 数据示例

```typescript
{
  id: '1',
  idiom: '画龙点睛',
  pinyin: 'huà lóng diǎn jīng',
  meaning: '原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。',
  origin: '唐·张彦远《历代名画记·张僧繇》："金陵安乐寺四白龙不点眼睛，每云：\'点睛即飞去。\'人以为妄诞，固请点之。须臾，雷电破壁，两龙乘云腾去上天，二龙未点眼者见在。"',
  example: '这篇文章的结尾很精彩，真是画龙点睛之笔。',
  similar: ['锦上添花', '妙笔生花'],
  category: '艺术创作',
  difficulty: 'medium'
}
```

## 数据分类体系

### 成语分类

应用中的成语按主题进行分类，便于用户查找和学习：

#### 主要分类

1. **艺术创作** - 与文学、绘画、音乐等艺术相关的成语
   - 示例：画龙点睛、妙笔生花、锦上添花

2. **学习教育** - 与学习、教育、知识相关的成语
   - 示例：温故知新、学而时习之、举一反三

3. **志向理想** - 与抱负、理想、志向相关的成语
   - 示例：鸿鹄之志、志存高远、胸怀大志

4. **坚持努力** - 与毅力、坚持、努力相关的成语
   - 示例：水滴石穿、滴水穿石、铁杵磨针

5. **医术技艺** - 与技能、技艺、专业相关的成语
   - 示例：妙手回春、起死回生、华佗再世

### 难度等级

成语按学习难度分为三个等级：

#### 难度定义

- **简单 (easy)**: 字面意思明确，容易理解的成语
- **中等 (medium)**: 有一定典故背景，需要一定文化知识的成语
- **困难 (hard)**: 典故复杂，需要较深文化底蕴的成语

## 数据存储策略

### 静态数据存储

#### 本地文件存储
- **位置**: `data/idioms.ts`
- **格式**: TypeScript 模块
- **特点**: 
  - 编译时加载
  - 类型安全
  - 易于维护和更新

#### 数据结构组织

```typescript
// data/idioms.ts
export interface Idiom {
  // ... 接口定义
}

export const idioms: Idiom[] = [
  // ... 成语数据数组
];
```

### 动态数据存储

#### 本地状态管理
- **技术**: React Hooks (useState, useReducer)
- **用途**: 用户交互状态、UI 状态
- **生命周期**: 组件级别

#### 持久化存储
- **技术**: AsyncStorage (计划中)
- **用途**: 用户收藏、设置、学习进度
- **生命周期**: 应用级别

## 数据流设计

### 数据流向图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   静态数据源     │    │   组件状态      │    │   用户界面      │
│  (idioms.ts)    │───▶│  (useState)     │───▶│  (Components)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   用户交互      │    │   事件处理      │
         │              │  (User Input)   │    │  (Event Handlers)│
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   数据过滤      │    │   状态更新      │    │   界面更新      │
│  (Filtering)    │    │  (State Update) │    │  (UI Update)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据流说明

#### 1. 数据加载流程
1. 应用启动时加载静态成语数据
2. 数据通过 props 传递给子组件
3. 组件根据数据渲染界面

#### 2. 用户交互流程
1. 用户触发交互事件（点击、搜索等）
2. 事件处理器更新组件状态
3. 状态变化触发界面重新渲染

#### 3. 数据过滤流程
1. 用户输入搜索关键词
2. 使用 `useMemo` 过滤数据
3. 过滤结果更新界面显示

## 状态管理

### 组件级状态

#### 收藏状态管理

```typescript
// 使用 Set 数据结构管理收藏状态
const [favorites, setFavorites] = useState<Set<string>>(new Set());

// 切换收藏状态
const toggleFavorite = (idiomId: string) => {
  setFavorites(prev => {
    const newFavorites = new Set(prev);
    if (newFavorites.has(idiomId)) {
      newFavorites.delete(idiomId);
    } else {
      newFavorites.add(idiomId);
    }
    return newFavorites;
  });
};
```

#### 搜索状态管理

```typescript
// 搜索查询状态
const [searchQuery, setSearchQuery] = useState('');

// 过滤结果计算
const filteredIdioms = useMemo(() => {
  if (!searchQuery.trim()) return idioms;
  
  const query = searchQuery.toLowerCase().trim();
  return idioms.filter(idiom => 
    idiom.idiom.toLowerCase().includes(query) ||
    idiom.pinyin.toLowerCase().includes(query) ||
    idiom.meaning.toLowerCase().includes(query) ||
    idiom.category.toLowerCase().includes(query)
  );
}, [searchQuery]);
```

### 全局状态管理

#### 应用级状态（计划中）
- 用户设置
- 学习进度
- 收藏数据持久化
- 主题设置

## 数据验证

### 类型验证

#### TypeScript 类型检查
- 编译时类型检查
- 接口定义确保数据结构一致性
- 泛型提供类型安全

#### 运行时验证

```typescript
// 数据验证函数（示例）
function validateIdiom(data: any): data is Idiom {
  return (
    typeof data.id === 'string' &&
    typeof data.idiom === 'string' &&
    typeof data.pinyin === 'string' &&
    typeof data.meaning === 'string' &&
    typeof data.origin === 'string' &&
    typeof data.example === 'string' &&
    Array.isArray(data.similar) &&
    typeof data.category === 'string' &&
    ['easy', 'medium', 'hard'].includes(data.difficulty)
  );
}
```

### 数据完整性检查

#### 必填字段验证
- 确保所有必填字段存在
- 检查字段类型正确性
- 验证数据格式

#### 业务规则验证
- 成语长度检查
- 拼音格式验证
- 分类有效性检查

## 性能优化

### 数据查询优化

#### 搜索优化
- 使用 `useMemo` 缓存搜索结果
- 实现防抖搜索
- 支持多字段搜索

#### 列表渲染优化
- 使用 `FlatList` 虚拟化渲染
- 实现 `keyExtractor` 优化重渲染
- 分页加载（计划中）

### 内存管理

#### 数据缓存策略
- 合理使用 `useMemo` 和 `useCallback`
- 避免不必要的状态更新
- 及时清理事件监听器

## 数据扩展性

### 未来扩展计划

#### 数据源扩展
- 支持远程 API 数据源
- 实现数据同步机制
- 支持用户自定义数据

#### 功能扩展
- 学习进度跟踪
- 个性化推荐
- 社交功能（评论、分享）

#### 数据格式扩展
- 支持多媒体内容（音频、图片）
- 增加更多元数据字段
- 支持国际化数据

## 数据安全

### 数据保护措施

#### 本地数据安全
- 敏感数据加密存储
- 用户隐私数据保护
- 数据备份和恢复

#### 数据完整性
- 数据校验和检查
- 防止数据损坏
- 错误恢复机制 

## 用户数据库设计

### 🎯 设计目标

为境语应用设计一个完整的用户数据存储系统，支持：
- 用户认证与个人信息管理
- 学习进度跟踪与统计
- 收藏成语管理
- 测试记录与成绩分析
- 成就系统与用户激励
- 个性化推荐与设置

### 📊 数据库表结构设计

#### 1. 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  full_name TEXT,
  bio TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  location TEXT,
  
  -- 学习偏好
  preferred_difficulty TEXT CHECK (preferred_difficulty IN ('easy', 'medium', 'hard')),
  preferred_categories TEXT[] DEFAULT '{}',
  daily_goal INTEGER DEFAULT 10,
  
  -- 系统字段
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

#### 2. 学习记录表 (learning_records)

```sql
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idiom_id TEXT NOT NULL, -- 对应 ChengYu.derivation
  
  -- 学习行为
  action TEXT CHECK (action IN ('view', 'study', 'practice', 'test', 'favorite', 'unfavorite')) NOT NULL,
  duration INTEGER DEFAULT 0, -- 学习时长（秒）
  
  -- 学习效果
  mastery_level INTEGER CHECK (mastery_level BETWEEN 0 AND 100) DEFAULT 0,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  
  -- 上下文信息
  source TEXT, -- 学习来源：search, browse, random, recommendation
  session_id UUID, -- 学习会话ID
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_idiom_id ON learning_records(idiom_id);
CREATE INDEX idx_learning_records_action ON learning_records(action);
CREATE INDEX idx_learning_records_created_at ON learning_records(created_at);
```

#### 3. 收藏表 (favorites)

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idiom_id TEXT NOT NULL, -- 对应 ChengYu.derivation
  
  -- 收藏信息
  tags TEXT[] DEFAULT '{}', -- 用户自定义标签
  notes TEXT, -- 个人笔记
  priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  
  -- 复习信息
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, idiom_id)
);

-- 索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_idiom_id ON favorites(idiom_id);
CREATE INDEX idx_favorites_next_review ON favorites(next_review_at);
```

#### 4. 测试记录表 (quiz_results)

```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 测试基本信息
  quiz_type TEXT CHECK (quiz_type IN ('meaning', 'pinyin', 'complete', 'origin', 'mixed')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')) NOT NULL,
  category TEXT,
  
  -- 测试结果
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL, -- 得分百分比
  time_spent INTEGER NOT NULL, -- 总用时（秒）
  
  -- 详细数据
  questions_data JSONB NOT NULL, -- 题目和答案详情
  performance_analysis JSONB DEFAULT '{}', -- 性能分析
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_quiz_type ON quiz_results(quiz_type);
CREATE INDEX idx_quiz_results_score ON quiz_results(score);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at);
```

#### 5. 成就系统表 (achievements)

```sql
CREATE TABLE achievements (
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

-- 用户成就关联表
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
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

-- 索引
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(is_unlocked);
```

#### 6. 学习会话表 (learning_sessions)

```sql
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 会话信息
  session_type TEXT CHECK (session_type IN ('casual', 'focused', 'test', 'review')) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER, -- 总时长（秒）
  
  -- 会话统计
  idioms_studied INTEGER DEFAULT 0,
  idioms_mastered INTEGER DEFAULT 0,
  tests_taken INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  
  -- 会话数据
  activity_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_start_time ON learning_sessions(start_time);
```

#### 7. 用户设置表 (user_settings)

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
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

-- 索引
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

#### 8. 学习统计表 (learning_statistics)

```sql
CREATE TABLE learning_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 统计周期
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 学习统计
  total_study_time INTEGER DEFAULT 0, -- 总学习时长（秒）
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

-- 索引
CREATE INDEX idx_learning_statistics_user_id ON learning_statistics(user_id);
CREATE INDEX idx_learning_statistics_period ON learning_statistics(period_type, period_start);
```

### 🔒 行级安全策略 (RLS)

```sql
-- 启用所有表的 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_statistics ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can manage own data" ON users FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can manage own learning records" ON learning_records FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz results" ON quiz_results FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON learning_sessions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own statistics" ON learning_statistics FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 成就表允许所有已认证用户读取
CREATE POLICY "Authenticated users can read achievements" ON achievements FOR SELECT TO authenticated USING (true);
```

### 🎯 核心功能实现

#### 1. 用户认证与管理

```typescript
// 用户注册
interface UserRegistration {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  dailyGoal?: number;
}

// 用户资料更新
interface UserProfile {
  fullName?: string;
  bio?: string;
  avatar?: string;
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  preferredCategories?: string[];
  dailyGoal?: number;
}
```

#### 2. 学习进度跟踪

```typescript
// 学习记录
interface LearningRecord {
  userId: string;
  idiomId: string;
  action: 'view' | 'study' | 'practice' | 'test' | 'favorite';
  duration: number;
  masteryLevel?: number;
  source?: string;
  sessionId?: string;
}

// 学习统计查询
interface LearningStats {
  totalStudyTime: number;
  idiomsStudied: number;
  idiomsMastered: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  categoryBreakdown: Record<string, number>;
}
```

#### 3. 收藏管理

```typescript
// 收藏操作
interface FavoriteAction {
  userId: string;
  idiomId: string;
  tags?: string[];
  notes?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
}

// 复习计划
interface ReviewSchedule {
  favoriteId: string;
  nextReviewAt: Date;
  reviewInterval: number; // 天数
  difficulty: number; // 基于用户表现调整
}
```

#### 4. 测试系统

```typescript
// 测试结果
interface QuizResult {
  userId: string;
  quizType: 'meaning' | 'pinyin' | 'complete' | 'origin' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  questionsData: QuestionResult[];
}

// 单题结果
interface QuestionResult {
  idiomId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  timeSpent: number;
  isCorrect: boolean;
}
```

#### 5. 成就系统

```typescript
// 成就定义
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'learning' | 'streak' | 'test' | 'social' | 'collection';
  conditionType: 'count' | 'streak' | 'score' | 'time';
  conditionValue: number;
  rewardType: 'points' | 'badge' | 'title' | 'feature';
  difficulty: 1 | 2 | 3 | 4 | 5;
}

// 用户成就进度
interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}
```

### 📊 数据分析与报告

#### 1. 学习报告生成

```sql
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
$$ LANGUAGE plpgsql;
```

#### 2. 个性化推荐

```sql
-- 基于学习历史的成语推荐
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(idiom_id TEXT, recommendation_score DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.derivation as idiom_id,
    (
      -- 基于用户偏好的分类权重
      CASE WHEN c.category = ANY(u.preferred_categories) THEN 0.3 ELSE 0.0 END +
      -- 基于用户偏好的难度权重
      CASE WHEN c.difficulty = u.preferred_difficulty THEN 0.2 ELSE 0.0 END +
      -- 基于学习历史的相似度
      COALESCE(similarity_score.score, 0) * 0.5
    )::DECIMAL as recommendation_score
  FROM "ChengYu" c
  CROSS JOIN users u
  LEFT JOIN (
    -- 计算与已学成语的相似度
    SELECT 
      c2.derivation,
      AVG(0.1) as score -- 简化的相似度计算
    FROM "ChengYu" c2
    WHERE c2.derivation NOT IN (
      SELECT DISTINCT idiom_id 
      FROM learning_records 
      WHERE user_id = $1
    )
    GROUP BY c2.derivation
  ) similarity_score ON similarity_score.derivation = c.derivation
  WHERE u.id = $1
    AND c.derivation NOT IN (
      SELECT DISTINCT idiom_id 
      FROM learning_records 
      WHERE user_id = $1
    )
  ORDER BY recommendation_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### 🚀 实施建议

#### 1. 分阶段实施

**第一阶段：基础用户系统**
- 用户注册/登录
- 基本学习记录
- 收藏功能

**第二阶段：进阶功能**
- 测试系统
- 学习统计
- 基础成就

**第三阶段：智能化功能**
- 个性化推荐
- 复习计划
- 高级成就

#### 2. 性能优化

```sql
-- 创建必要的索引
CREATE INDEX idx_learning_records_user_action ON learning_records(user_id, action);
CREATE INDEX idx_learning_records_created_at_desc ON learning_records(created_at DESC);
CREATE INDEX idx_quiz_results_user_score ON quiz_results(user_id, score DESC);
CREATE INDEX idx_favorites_user_updated ON favorites(user_id, updated_at DESC);

-- 创建分区表（针对大数据量）
CREATE TABLE learning_records_y2024 PARTITION OF learning_records
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

#### 3. 数据备份与恢复

```bash
# 定期备份用户数据
pg_dump --host=your-host --port=5432 --username=postgres --dbname=your-db \
  --table=users --table=learning_records --table=favorites \
  --table=quiz_results --table=user_achievements \
  --data-only --file=user_data_backup.sql
```

### 📱 移动端集成

#### 1. 离线数据同步

```typescript
// 离线学习记录
interface OfflineLearningRecord {
  id: string;
  userId: string;
  idiomId: string;
  action: string;
  duration: number;
  timestamp: number;
  synced: boolean;
}

// 数据同步服务
class DataSyncService {
  async syncLearningRecords() {
    const offlineRecords = await this.getOfflineRecords();
    for (const record of offlineRecords) {
      try {
        await supabaseApi.learning.record(record);
        await this.markAsSynced(record.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
```

#### 2. 实时数据更新

```typescript
// 监听用户成就变化
supabase
  .channel('user-achievements')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'user_achievements',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // 显示成就解锁动画
    showAchievementUnlocked(payload.new);
  })
  .subscribe();
```

这个用户数据库设计方案提供了完整的用户数据管理能力，支持学习进度跟踪、个性化推荐、成就系统等高级功能，可以根据实际需求分阶段实施。 