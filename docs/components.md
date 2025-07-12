# 组件文档

## 概述

本文档详细描述了境语应用中所有组件的功能、接口和使用方法。

## 核心组件

### IdiomCard 组件

#### 功能描述
`IdiomCard` 是应用的核心展示组件，用于在列表中展示成语信息。它采用传统中国风设计，包含成语文本、拼音、释义预览和收藏功能。

#### 组件接口

```typescript
interface IdiomCardProps {
  idiom: Idiom;              // 成语数据对象
  onPress: () => void;       // 卡片点击事件回调
  onFavorite?: () => void;   // 收藏按钮点击事件回调（可选）
  isFavorited?: boolean;     // 收藏状态（可选，默认为 false）
}
```

#### 使用示例

```typescript
import IdiomCard from '@/components/IdiomCard';
import { idioms } from '@/data/idioms';

// 基本使用
<IdiomCard
  idiom={idioms[0]}
  onPress={() => handleIdiomPress(idioms[0].id)}
/>

// 带收藏功能
<IdiomCard
  idiom={idioms[0]}
  onPress={() => handleIdiomPress(idioms[0].id)}
  onFavorite={() => toggleFavorite(idioms[0].id)}
  isFavorited={favorites.has(idioms[0].id)}
/>
```

#### 设计特性

##### 视觉设计
- **传统中国风**: 使用思源宋体字体，体现传统文化特色
- **卡片式布局**: 白色背景，圆角边框，阴影效果
- **成语展示**: 大字体居中显示，带有装饰性边框
- **分类标签**: 使用红色主题色，体现中国文化元素

##### 交互设计
- **点击反馈**: 支持点击高亮效果
- **收藏功能**: 心形图标，支持填充/未填充状态切换
- **触摸区域**: 合理的触摸区域设计，提升用户体验

#### 样式结构

```typescript
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  // ... 其他样式
});
```

#### 子组件

##### 成语展示区域
- **idiomContainer**: 成语文本容器
- **idiomText**: 成语文本样式
- **idiomFrame**: 装饰性边框

##### 信息展示区域
- **pinyinText**: 拼音文本
- **meaningText**: 释义预览文本

##### 底部操作区域
- **footer**: 底部容器
- **stickerContainer**: 分类标签容器
- **favoriteButton**: 收藏按钮

#### 性能优化

1. **避免重复渲染**: 使用 `React.memo` 包装组件
2. **事件优化**: 使用 `hitSlop` 扩大触摸区域
3. **样式优化**: 使用 `StyleSheet.create` 创建样式

### GaoPinInfo 组件

#### 功能描述
`GaoPinInfo` 是高频词信息展示组件，用于在成语详情页面中显示该成语的高频词相关信息，包括分类、易混淆词汇、易错场景等。

#### 组件接口

```typescript
interface GaoPinInfoProps {
  gaoPinInfo: ChengYuGaoPinApiRecord;  // 高频词数据对象
  themeColors?: [string, string];      // 主题色配置（可选，默认红黄渐变）
}
```

#### 使用示例

```typescript
import GaoPinInfo from '@/components/GaoPinInfo';

// 基本使用
<GaoPinInfo gaoPinInfo={gaoPinData} />

// 自定义主题色
<GaoPinInfo 
  gaoPinInfo={gaoPinData} 
  themeColors={['#FF6B6B', '#FFE66D']} 
/>
```

#### 功能模块

##### 高频词标识区域
- **高频词徽章**: 星形图标 + "高频词汇" 文字
- **难度标识**: 根据difficulty属性显示颜色编码的难度等级

##### 分类信息
- **分类标签**: 显示高频词的使用分类（如商务用语、学术用语等）
- **图标搭配**: 使用书籍图标增强视觉识别

##### 详细信息展示
- **易混淆词语**: 显示容易与当前成语混淆的词语
- **混淆解释**: 解释为什么容易混淆及如何区分
- **易错场景**: 描述使用该成语时容易出错的场景

##### 标签系统
- **动态标签**: 基于高频词数据自动生成标签
- **智能分类**: 自动提取分类、易混淆、易错等标签

#### 设计特性

##### 视觉层次
- **颜色编码**: 不同信息类型使用不同颜色背景
- **图标系统**: 统一的图标语言提升识别度
- **间距设计**: 合理的间距保证可读性

##### 交互体验
- **渐进展示**: 只显示有内容的信息模块
- **主题适配**: 支持自定义主题色配色

#### 样式配置

```typescript
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'high': return '#ff4757';    // 高难度 - 红色
    case 'medium': return '#ffa502';  // 中等 - 橙色
    case 'low': return '#2ed573';     // 简单 - 绿色
    default: return '#747d8c';        // 未知 - 灰色
  }
};
```

#### 数据驱动渲染
组件会根据传入的高频词数据自动判断需要显示的内容模块，实现智能化的信息展示。

## 页面组件

### 首页组件 (index.tsx)

#### 功能描述
应用的主页面，展示成语列表，提供浏览和收藏功能。

#### 主要功能
- 成语列表展示
- 收藏状态管理
- 页面导航
- 头部标题展示

#### 状态管理

```typescript
const [favorites, setFavorites] = useState<Set<string>>(new Set());
```

#### 核心方法

```typescript
// 处理成语点击
const handleIdiomPress = (idiomId: string) => {
  router.push(`/idiom/${idiomId}`);
};

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

### 搜索页面组件 (search.tsx)

#### 功能描述
提供成语搜索功能，支持多字段搜索和实时过滤。

#### 主要功能
- 实时搜索
- 多字段搜索（成语、拼音、含义、分类）
- 搜索结果统计
- 空状态展示

#### 搜索逻辑

```typescript
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

#### 搜索输入组件

```typescript
<View style={styles.searchContainer}>
  <SearchIcon size={20} color="#666666" strokeWidth={2} />
  <TextInput
    style={styles.searchInput}
    placeholder="输入成语、拼音或含义"
    placeholderTextColor="#999999"
    value={searchQuery}
    onChangeText={setSearchQuery}
    autoCorrect={false}
    autoCapitalize="none"
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
      <X size={18} color="#666666" strokeWidth={2} />
    </TouchableOpacity>
  )}
</View>
```

### 成语详情页面组件 ([id].tsx)

#### 功能描述
展示成语的详细信息，包括释义、出处、例句和相似成语。

#### 页面结构
1. **头部导航**: 返回按钮和收藏按钮
2. **成语展示**: 大字体展示成语和拼音
3. **分类标签**: 显示成语分类
4. **详细信息**: 释义、出处、例句
5. **相似成语**: 相关成语推荐

#### 路由参数处理

```typescript
const { id } = useLocalSearchParams();
const idiom = idioms.find(item => item.id === id);
```

#### 错误处理

```typescript
if (!idiom) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>成语未找到</Text>
      </View>
    </SafeAreaView>
  );
}
```

## 布局组件

### 根布局组件 (_layout.tsx)

#### 功能描述
应用的根布局，负责全局配置和字体加载。

#### 主要功能
- 字体加载管理
- 启动屏幕控制
- 路由配置
- 状态栏配置

#### 字体配置

```typescript
const [fontsLoaded, fontError] = useFonts({
  'NotoSerifSC-Regular': NotoSerifSC_400Regular,
  'NotoSerifSC-Medium': NotoSerifSC_500Medium,
  'NotoSerifSC-SemiBold': NotoSerifSC_600SemiBold,
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
});
```

### 标签页布局组件 ((tabs)/_layout.tsx)

#### 功能描述
配置底部导航栏，定义四个主要功能页面。

#### 标签配置

```typescript
<Tabs.Screen
  name="index"
  options={{
    title: '首页',
    tabBarIcon: ({ size, color }) => (
      <Home size={size} color={color} strokeWidth={2} />
    ),
  }}
/>
```

#### 样式配置

```typescript
screenOptions={{
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabelStyle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  tabBarActiveTintColor: '#C93F3F',
  tabBarInactiveTintColor: '#666666',
}}
```

## 自定义 Hooks

### useFrameworkReady Hook

#### 功能描述
确保应用框架正确初始化的自定义 Hook。

#### 实现

```typescript
export function useFrameworkReady() {
  useEffect(() => {
    // 框架初始化逻辑
  }, []);
}
```

#### 使用场景
- 应用启动时的初始化
- 框架依赖的加载
- 全局配置的设置

## 组件最佳实践

### 1. 类型安全
- 使用 TypeScript 定义组件接口
- 提供完整的类型注解
- 使用泛型提高组件复用性

### 2. 性能优化
- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 优化计算
- 合理使用 `key` 属性

### 3. 可访问性
- 提供合适的 `accessibilityLabel`
- 支持屏幕阅读器
- 确保足够的颜色对比度

### 4. 错误处理
- 提供错误边界
- 处理异常情况
- 显示友好的错误信息

### 5. 测试友好
- 使用语义化的组件名称
- 提供测试 ID
- 保持组件的纯函数特性 