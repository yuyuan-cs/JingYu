# 智语 - Supabase API 文档

## 数据库连接信息

**项目ID：** mazslkagknzmoccafzfl  
**API URL：** https://mazslkagknzmoccafzfl.supabase.co  
**Supabase Dashboard：** https://supabase.com/dashboard/project/mazslkagknzmoccafzfl/api  

### API 密钥

**匿名密钥 (anon public api key)：**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1henNsa2Fna256bW9jY2FmemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjQzMTAsImV4cCI6MjA2NzMwMDMxMH0.2-tXHiz01ll_Us86R3qW_ymDxf-ppA-x2hH20t7W6ns
```

**服务密钥 (service_role secret api key)：**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1henNsa2Fna256bW9jY2FmemZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcyNDMxMCwiZXhwIjoyMDY3MzAwMzEwfQ.A79Ks128YgbYaSn9KTRZR2SVoXRZcn4nf8sHjJt3CzE
```

## 📦 已集成的 Supabase 服务

项目已经完成了 Supabase 的集成，包括以下文件：

### 核心文件
- `services/supabase.ts` - Supabase 客户端配置和类型定义
- `services/supabaseService.ts` - 数据库服务类（增删改查）
- `services/supabaseApi.ts` - 统一的 API 服务接口
- `hooks/useSupabaseApi.ts` - React Hook 集成

### 数据库表结构

```sql
-- 成语表
CREATE TABLE ChengYu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idiom TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  meaning TEXT NOT NULL,
  origin TEXT NOT NULL,
  example TEXT NOT NULL,
  derivation TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 学习记录表
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  idiom_id UUID REFERENCES ChengYu(id),
  action TEXT CHECK (action IN ('view', 'study', 'test', 'favorite')),
  duration INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  idiom_id UUID REFERENCES ChengYu(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, idiom_id)
);
```

## 🚀 使用方法

### 1. 基本初始化

```typescript
import { supabase } from './services/supabase';

// 直接使用 Supabase 客户端
const { data, error } = await supabase
  .from('ChengYu')
  .select('*')
  .limit(10);
```

### 2. 使用服务类

```typescript
import { ChengYuService } from './services/supabaseService';

// 获取成语列表
const idioms = await ChengYuService.getIdioms({
  page: 1,
  limit: 20,
  category: '历史典故',
  difficulty: 'easy'
});

// 搜索成语
const searchResult = await ChengYuService.searchIdioms({
  q: '一心',
  type: 'idiom',
  page: 1,
  limit: 10
});
```

### 3. 使用统一 API

```typescript
import { supabaseApi } from './services/supabaseApi';

// 获取成语列表
const response = await supabaseApi.idioms.list({
  page: 1,
  limit: 20,
  category: '历史典故'
});

if (response.success) {
  console.log(response.data);
}
```

### 4. 使用 React Hook

```typescript
import { useSupabaseIdioms, useSupabaseIdiom } from './hooks/useSupabaseApi';

function IdiomList() {
  const { data: idioms, loading, error, loadMore } = useSupabaseIdioms({
    category: '历史典故',
    difficulty: 'easy'
  });

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {idioms.map(idiom => (
        <div key={idiom.id}>{idiom.idiom}</div>
      ))}
      <button onClick={loadMore}>加载更多</button>
    </div>
  );
}
```

## 🛠️ 可用的 API 方法

### 成语相关
- `supabaseApi.idioms.list()` - 获取成语列表
- `supabaseApi.idioms.get(id)` - 获取单个成语
- `supabaseApi.idioms.search()` - 搜索成语
- `supabaseApi.idioms.random()` - 获取随机成语
- `supabaseApi.idioms.categories()` - 获取分类列表

### 用户相关
- `supabaseApi.users.create()` - 创建用户
- `supabaseApi.users.get()` - 获取用户信息
- `supabaseApi.users.update()` - 更新用户信息

### 学习记录
- `supabaseApi.learning.record()` - 记录学习行为
- `supabaseApi.learning.statistics()` - 获取学习统计
- `supabaseApi.learning.progress()` - 获取学习进度

### 收藏功能
- `supabaseApi.favorites.add()` - 添加收藏
- `supabaseApi.favorites.remove()` - 移除收藏
- `supabaseApi.favorites.list()` - 获取收藏列表
- `supabaseApi.favorites.check()` - 检查收藏状态

### 测试相关
- `supabaseApi.quiz.generate()` - 生成测试题目
- `supabaseApi.quiz.submit()` - 提交测试结果
- `supabaseApi.quiz.history()` - 获取测试历史
- `supabaseApi.quiz.statistics()` - 获取测试统计

## 📋 API 响应格式

所有 API 都返回统一的响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 🔧 错误处理

```typescript
try {
  const response = await supabaseApi.idioms.list();
  if (response.success) {
    // 成功处理
    console.log(response.data);
  } else {
    // 错误处理
    console.error(response.error?.message);
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

## 🎯 下一步

1. 在 Supabase 控制台中添加成语数据
2. 配置数据库安全规则
3. 添加用户认证
4. 优化查询性能
5. 添加实时订阅功能
