# API 参考文档

## 概述

本文档详细描述了境语应用中使用的所有 API、函数、接口和配置选项。

## 核心接口

### Idiom 接口

#### 定义
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

#### 使用示例
```typescript
import { Idiom } from '@/data/idioms';

const idiom: Idiom = {
  id: '1',
  idiom: '画龙点睛',
  pinyin: 'huà lóng diǎn jīng',
  meaning: '原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。',
  origin: '唐·张彦远《历代名画记·张僧繇》："金陵安乐寺四白龙不点眼睛，每云：\'点睛即飞去。\'人以为妄诞，固请点之。须臾，雷电破壁，两龙乘云腾去上天，二龙未点眼者见在。"',
  example: '这篇文章的结尾很精彩，真是画龙点睛之笔。',
  similar: ['锦上添花', '妙笔生花'],
  category: '艺术创作',
  difficulty: 'medium'
};
```

### IdiomCardProps 接口

#### 定义
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

<IdiomCard
  idiom={idiomData}
  onPress={() => handleIdiomPress(idiomData.id)}
  onFavorite={() => toggleFavorite(idiomData.id)}
  isFavorited={favorites.has(idiomData.id)}
/>
```

## 数据 API

### 成语数据

#### 获取所有成语
```typescript
import { idioms } from '@/data/idioms';

// 获取所有成语数据
const allIdioms = idioms;
```

#### 根据 ID 查找成语
```typescript
import { idioms } from '@/data/idioms';

function findIdiomById(id: string): Idiom | undefined {
  return idioms.find(idiom => idiom.id === id);
}

// 使用示例
const idiom = findIdiomById('1');
```

#### 根据分类过滤成语
```typescript
import { idioms } from '@/data/idioms';

function filterIdiomsByCategory(category: string): Idiom[] {
  return idioms.filter(idiom => idiom.category === category);
}

// 使用示例
const artIdioms = filterIdiomsByCategory('艺术创作');
```

#### 根据难度过滤成语
```typescript
import { idioms } from '@/data/idioms';

function filterIdiomsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Idiom[] {
  return idioms.filter(idiom => idiom.difficulty === difficulty);
}

// 使用示例
const easyIdioms = filterIdiomsByDifficulty('easy');
```

#### 搜索成语
```typescript
import { idioms } from '@/data/idioms';

function searchIdioms(query: string): Idiom[] {
  if (!query.trim()) return idioms;
  
  const searchTerm = query.toLowerCase().trim();
  return idioms.filter(idiom => 
    idiom.idiom.toLowerCase().includes(searchTerm) ||
    idiom.pinyin.toLowerCase().includes(searchTerm) ||
    idiom.meaning.toLowerCase().includes(searchTerm) ||
    idiom.category.toLowerCase().includes(searchTerm)
  );
}

// 使用示例
const searchResults = searchIdioms('画龙');
```

## 路由 API

### Expo Router

#### 导航函数
```typescript
import { router } from 'expo-router';

// 导航到成语详情页
router.push(`/idiom/${idiomId}`);

// 返回上一页
router.back();

// 导航到首页
router.push('/');

// 导航到搜索页
router.push('/search');

// 导航到收藏页
router.push('/favorites');

// 导航到个人页
router.push('/profile');
```

#### 路由参数
```typescript
import { useLocalSearchParams } from 'expo-router';

// 在动态路由页面中获取参数
export default function IdiomDetailScreen() {
  const { id } = useLocalSearchParams();
  // id 是字符串类型
}
```

### 路由配置

#### 根布局配置
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="idiom/[id]" />
  <Stack.Screen name="+not-found" />
</Stack>
```

#### 标签页配置
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

<Tabs screenOptions={{
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
}}>
  <Tabs.Screen name="index" options={{ title: '首页' }} />
  <Tabs.Screen name="search" options={{ title: '搜索' }} />
  <Tabs.Screen name="favorites" options={{ title: '收藏' }} />
  <Tabs.Screen name="profile" options={{ title: '我的' }} />
</Tabs>
```

## 状态管理 API

### React Hooks

#### useState
```typescript
import { useState } from 'react';

// 收藏状态管理
const [favorites, setFavorites] = useState<Set<string>>(new Set());

// 搜索查询状态
const [searchQuery, setSearchQuery] = useState('');

// 收藏状态切换
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

#### useMemo
```typescript
import { useMemo } from 'react';

// 过滤成语数据
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

#### useEffect
```typescript
import { useEffect } from 'react';

// 字体加载管理
useEffect(() => {
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError]);
```

### 自定义 Hooks

#### useFrameworkReady
```typescript
// hooks/useFrameworkReady.ts
import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // 框架初始化逻辑
  }, []);
}

// 使用示例
export default function RootLayout() {
  useFrameworkReady();
  // ...
}
```

## 字体 API

### Expo Font

#### 字体加载
```typescript
import { useFonts } from 'expo-font';
import {
  NotoSerifSC_400Regular,
  NotoSerifSC_500Medium,
  NotoSerifSC_600SemiBold,
} from '@expo-google-fonts/noto-serif-sc';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

const [fontsLoaded, fontError] = useFonts({
  'NotoSerifSC-Regular': NotoSerifSC_400Regular,
  'NotoSerifSC-Medium': NotoSerifSC_500Medium,
  'NotoSerifSC-SemiBold': NotoSerifSC_600SemiBold,
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
});
```

#### 字体使用
```typescript
// 在样式中使用字体
const styles = StyleSheet.create({
  title: {
    fontFamily: 'NotoSerifSC-SemiBold',
    fontSize: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});
```

## 图标 API

### Lucide React Native

#### 图标导入
```typescript
import { 
  Chrome as Home, 
  Search, 
  Heart, 
  User,
  ArrowLeft,
  Volume2,
  BookOpen,
  X
} from 'lucide-react-native';
```

#### 图标使用
```typescript
// 基本使用
<Home size={24} color="#1A1A1A" strokeWidth={2} />

// 在标签页中使用
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

## 样式 API

### StyleSheet

#### 样式定义
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

#### 颜色常量
```typescript
// 主题色彩
const COLORS = {
  primary: '#C93F3F',        // 主色调（红色）
  text: '#1A1A1A',          // 主文本色
  textSecondary: '#666666',  // 次要文本色
  textTertiary: '#999999',   // 第三级文本色
  background: '#F7F7F7',     // 背景色
  white: '#FFFFFF',          // 白色
  border: '#E8E8E8',         // 边框色
  shadow: '#1A1A1A',         // 阴影色
};
```

## 组件 API

### React Native 核心组件

#### View
```typescript
import { View } from 'react-native';

<View style={styles.container}>
  {/* 内容 */}
</View>
```

#### Text
```typescript
import { Text } from 'react-native';

<Text style={styles.text}>文本内容</Text>
```

#### TouchableOpacity
```typescript
import { TouchableOpacity } from 'react-native';

<TouchableOpacity 
  style={styles.button} 
  onPress={handlePress}
  activeOpacity={0.8}
>
  <Text>按钮文本</Text>
</TouchableOpacity>
```

#### FlatList
```typescript
import { FlatList } from 'react-native';

<FlatList
  data={idioms}
  renderItem={renderIdiom}
  keyExtractor={(item) => item.id}
  ListHeaderComponent={renderHeader}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.listContent}
/>
```

#### TextInput
```typescript
import { TextInput } from 'react-native';

<TextInput
  style={styles.input}
  placeholder="输入搜索内容"
  placeholderTextColor="#999999"
  value={searchQuery}
  onChangeText={setSearchQuery}
  autoCorrect={false}
  autoCapitalize="none"
/>
```

#### SafeAreaView
```typescript
import { SafeAreaView } from 'react-native';

<SafeAreaView style={styles.container}>
  {/* 页面内容 */}
</SafeAreaView>
```

#### ScrollView
```typescript
import { ScrollView } from 'react-native';

<ScrollView 
  showsVerticalScrollIndicator={false}
  style={styles.scrollContent}
>
  {/* 滚动内容 */}
</ScrollView>
```

## 工具函数 API

### 数据工具函数

#### 数据验证
```typescript
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

#### 数据过滤
```typescript
function filterIdioms(idioms: Idiom[], filters: {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  searchQuery?: string;
}): Idiom[] {
  return idioms.filter(idiom => {
    if (filters.category && idiom.category !== filters.category) {
      return false;
    }
    if (filters.difficulty && idiom.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        idiom.idiom.toLowerCase().includes(query) ||
        idiom.pinyin.toLowerCase().includes(query) ||
        idiom.meaning.toLowerCase().includes(query)
      );
    }
    return true;
  });
}
```

### 样式工具函数

#### 响应式尺寸
```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function getResponsiveSize(size: number): number {
  return (width / 375) * size; // 基于 375px 设计稿
}

// 使用示例
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getResponsiveSize(20),
  },
});
```

#### 颜色工具
```typescript
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 使用示例
const shadowColor = hexToRgba('#1A1A1A', 0.06);
```

## 错误处理 API

### 错误边界
```typescript
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>出现错误，请重试</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 错误处理函数
```typescript
function handleError(error: Error, context: string) {
  console.error(`Error in ${context}:`, error);
  
  // 可以添加错误上报逻辑
  // reportError(error, context);
}

// 使用示例
try {
  // 可能出错的代码
} catch (error) {
  handleError(error, 'searchFunction');
}
```

## 性能优化 API

### React.memo
```typescript
import React from 'react';

const IdiomCard = React.memo(({ idiom, onPress, onFavorite, isFavorited }: IdiomCardProps) => {
  return (
    // 组件内容
  );
});

export default IdiomCard;
```

### useCallback
```typescript
import { useCallback } from 'react';

const handleIdiomPress = useCallback((idiomId: string) => {
  router.push(`/idiom/${idiomId}`);
}, []);

const toggleFavorite = useCallback((idiomId: string) => {
  setFavorites(prev => {
    const newFavorites = new Set(prev);
    if (newFavorites.has(idiomId)) {
      newFavorites.delete(idiomId);
    } else {
      newFavorites.add(idiomId);
    }
    return newFavorites;
  });
}, []);
```

## 配置 API

### Expo 配置
```json
{
  "expo": {
    "name": "bolt-expo-nativewind",
    "slug": "bolt-expo-nativewind",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": ["expo-router", "expo-font", "expo-web-browser"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### TypeScript 配置
```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

## 第三方库 API

### Expo 模块

#### expo-splash-screen
```typescript
import * as SplashScreen from 'expo-splash-screen';

// 防止启动屏幕自动隐藏
SplashScreen.preventAutoHideAsync();

// 隐藏启动屏幕
SplashScreen.hideAsync();
```

#### expo-status-bar
```typescript
import { StatusBar } from 'expo-status-bar';

<StatusBar style="dark" />
```

#### expo-constants
```typescript
import Constants from 'expo-constants';

// 获取应用信息
const appVersion = Constants.expoConfig?.version;
const appName = Constants.expoConfig?.name;
```

### React Navigation

#### 导航类型
```typescript
import { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  '(tabs)': undefined;
  'idiom/[id]': { id: string };
  '+not-found': undefined;
};

type NavigationProps = NavigationProp<RootStackParamList>;
```

## 测试 API

### Jest 测试
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import IdiomCard from '../components/IdiomCard';

describe('IdiomCard', () => {
  it('renders idiom text correctly', () => {
    const { getByText } = render(
      <IdiomCard
        idiom={mockIdiom}
        onPress={jest.fn()}
      />
    );
    
    expect(getByText('画龙点睛')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <IdiomCard
        idiom={mockIdiom}
        onPress={mockOnPress}
      />
    );
    
    fireEvent.press(getByTestId('idiom-card'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
``` 