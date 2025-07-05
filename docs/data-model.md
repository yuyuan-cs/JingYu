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