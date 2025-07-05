# 智语 - Supabase 实际集成文档

## 📊 实际数据库表结构

根据您提供的 Supabase 数据库表结构，我们已经完成了对应的集成：

```sql
create table public."ChengYu" (
  derivation text not null,      -- 典故/来源 (主键)
  example text null,             -- 例子
  explanation text null,         -- 解释
  pinyin text null,              -- 拼音
  word text null,                -- 成语
  abbreviation text null,        -- 缩写
  pinyin_r text null,            -- 拼音（另一种）
  first text null,               -- 首字
  last text null                 -- 末字
) TABLESPACE pg_default;

create index IF not exists "ChengYu_derivation_idx" on public."ChengYu" 
using btree (derivation) TABLESPACE pg_default;
```

## 🔄 数据转换

我们创建了数据转换层，将数据库字段映射到统一的API格式：

```typescript
// 数据库原始格式
interface ChengYuRecord {
  derivation: string;        // 典故/来源 (主键)
  example: string | null;    // 例子
  explanation: string | null; // 解释
  pinyin: string | null;     // 拼音
  word: string | null;       // 成语
  abbreviation: string | null; // 缩写
  pinyin_r: string | null;   // 拼音（另一种）
  first: string | null;      // 首字
  last: string | null;       // 末字
}

// API 统一格式
interface ChengYuApiRecord {
  id: string;          // 使用 derivation 作为 id
  idiom: string;       // 对应 word
  pinyin: string;      // 对应 pinyin
  meaning: string;     // 对应 explanation
  origin: string;      // 对应 derivation
  example: string;     // 对应 example
  abbreviation: string; // 缩写
  pinyin_r: string;    // 拼音（另一种）
  first: string;       // 首字
  last: string;        // 末字
}
```

## 🚀 使用方法

### 1. 基本查询

```typescript
import { ChengYuService } from './services/supabaseService';

// 获取成语列表
const idioms = await ChengYuService.getIdioms({
  page: 1,
  limit: 20,
  search: '一心'  // 可选搜索关键词
});

// 获取单个成语（通过 derivation 作为 id）
const idiom = await ChengYuService.getIdiom('某个典故描述');
```

### 2. 搜索功能

```typescript
// 搜索成语
const searchResult = await ChengYuService.searchIdioms({
  q: '一心',
  type: 'word',  // 'word' | 'pinyin' | 'explanation' | 'derivation'
  page: 1,
  limit: 10
});

// 支持的搜索类型：
// - 'word': 按成语内容搜索
// - 'pinyin': 按拼音搜索（包括 pinyin 和 pinyin_r）
// - 'explanation': 按解释搜索
// - 'derivation': 按典故搜索
```

### 3. 按首字查询

```typescript
// 获取所有首字
const firstChars = await ChengYuService.getFirstCharacters();

// 根据首字获取成语
const idiomsByFirst = await ChengYuService.getIdiomsByFirstChar('一');
```

### 4. 随机成语

```typescript
// 获取随机成语
const randomIdioms = await ChengYuService.getRandomIdioms(10);
```

### 5. 使用统一 API

```typescript
import { supabaseApi } from './services/supabaseApi';

// 获取成语列表
const response = await supabaseApi.idioms.list({
  page: 1,
  limit: 20,
  search: '历史'
});

// 搜索成语
const searchResponse = await supabaseApi.idioms.search({
  q: '一心',
  type: 'word',
  page: 1,
  limit: 10
});

// 获取首字列表
const firstCharsResponse = await supabaseApi.idioms.firstCharacters();

// 根据首字获取成语
const byFirstCharResponse = await supabaseApi.idioms.byFirstChar('一');

// 获取随机成语
const randomResponse = await supabaseApi.idioms.random(10);
```

### 6. 使用 React Hook

```typescript
import { 
  useSupabaseIdioms, 
  useSupabaseIdiomSearch, 
  useSupabaseFirstCharacters,
  useSupabaseIdiomsByFirstChar 
} from './hooks/useSupabaseApi';

function IdiomList() {
  // 获取成语列表
  const { data: idioms, loading, error, loadMore } = useSupabaseIdioms({
    search: '历史'  // 可选搜索
  });

  // 搜索成语
  const { data: searchResults } = useSupabaseIdiomSearch('一心', 'word');

  // 获取首字列表
  const { data: firstChars } = useSupabaseFirstCharacters();

  // 根据首字获取成语
  const { data: idiomsByFirst } = useSupabaseIdiomsByFirstChar('一');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {idioms?.map(idiom => (
        <div key={idiom.id}>
          <h3>{idiom.idiom}</h3>
          <p>拼音: {idiom.pinyin}</p>
          <p>含义: {idiom.meaning}</p>
          <p>典故: {idiom.origin}</p>
          <p>例句: {idiom.example}</p>
        </div>
      ))}
      <button onClick={loadMore}>加载更多</button>
    </div>
  );
}
```

## 🎯 可用的 API 方法

### 成语相关
- `supabaseApi.idioms.list(params)` - 获取成语列表
  - 参数: `{ page?, limit?, search? }`
- `supabaseApi.idioms.get(id)` - 获取单个成语 (id = derivation)
- `supabaseApi.idioms.search(params)` - 搜索成语
  - 参数: `{ q, type?, page?, limit? }`
  - type: `'word' | 'pinyin' | 'explanation' | 'derivation'`
- `supabaseApi.idioms.random(count)` - 获取随机成语
- `supabaseApi.idioms.firstCharacters()` - 获取首字列表
- `supabaseApi.idioms.byFirstChar(firstChar)` - 根据首字获取成语

### 测试相关
- `supabaseApi.quiz.generate(params)` - 生成测试题目
  - 参数: `{ type, count?, firstChar? }`
  - type: `'meaning' | 'pinyin' | 'complete' | 'origin'`

## 🔍 搜索功能详解

### 搜索类型
1. **word**: 在成语内容中搜索
2. **pinyin**: 在拼音中搜索（同时搜索 pinyin 和 pinyin_r 字段）
3. **explanation**: 在解释中搜索
4. **derivation**: 在典故中搜索
5. **默认**: 在所有字段中搜索

### 搜索示例
```typescript
// 搜索包含"一"的成语
const wordSearch = await supabaseApi.idioms.search({
  q: '一',
  type: 'word'
});

// 搜索拼音包含"yi"的成语
const pinyinSearch = await supabaseApi.idioms.search({
  q: 'yi',
  type: 'pinyin'
});

// 全文搜索
const globalSearch = await supabaseApi.idioms.search({
  q: '心'  // 在所有字段中搜索
});
```

## 📊 数据字段说明

| 数据库字段 | API字段 | 说明 | 示例 |
|-----------|---------|------|------|
| word | idiom | 成语内容 | "一心一意" |
| pinyin | pinyin | 拼音 | "yī xīn yī yì" |
| explanation | meaning | 解释含义 | "形容专心致志..." |
| derivation | origin | 典故来源 | "《三国志·魏志...》" |
| example | example | 例句 | "他一心一意地工作" |
| abbreviation | abbreviation | 缩写 | "一心" |
| pinyin_r | pinyin_r | 拼音(另一种) | "yi1 xin1 yi1 yi4" |
| first | first | 首字 | "一" |
| last | last | 末字 | "意" |

## 🎉 集成完成状态

✅ **已完成:**
- Supabase 客户端配置
- 数据库连接测试
- 数据转换层
- 完整的服务类实现
- 统一的 API 接口
- React Hook 集成
- 示例组件

✅ **支持的功能:**
- 分页查询
- 多类型搜索
- 随机获取
- 按首字查询
- 数据转换
- 错误处理

🎯 **可以开始使用:**
您现在可以在应用中使用这些 Supabase 功能来获取和操作成语数据了！

## 🔧 注意事项

1. **主键使用**: 由于表没有传统的 id 字段，我们使用 `derivation` 作为唯一标识
2. **空值处理**: 所有字段（除了 derivation）都可能为 null，API 会自动转换为空字符串
3. **搜索性能**: 已经在 derivation 字段上创建了索引，其他字段的搜索可能较慢
4. **数据一致性**: 确保 derivation 字段的唯一性，因为它被用作主键

## 📞 技术支持

如果在使用过程中遇到问题，请检查：
- Supabase 连接状态
- 表结构是否正确
- 数据是否已录入
- API 调用参数是否正确 