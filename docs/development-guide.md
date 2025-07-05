# 开发指南

## 开发环境设置

### 系统要求

- **操作系统**: macOS, Windows, Linux
- **Node.js**: 18.0.0 或更高版本
- **包管理器**: npm 或 yarn
- **开发工具**: VS Code (推荐)

### 必需软件

#### 1. Node.js 和 npm
```bash
# 检查版本
node --version
npm --version

# 如果未安装，请从 https://nodejs.org 下载安装
```

#### 2. Expo CLI
```bash
# 全局安装 Expo CLI
npm install -g @expo/cli

# 检查版本
expo --version
```

#### 3. 开发工具

##### VS Code 扩展推荐
- **TypeScript Importer**: 自动导入 TypeScript 模块
- **Prettier**: 代码格式化
- **ESLint**: 代码质量检查
- **React Native Tools**: React Native 开发支持
- **Auto Rename Tag**: 自动重命名标签

##### 移动端开发工具
- **iOS**: Xcode (仅 macOS)
- **Android**: Android Studio
- **模拟器**: iOS Simulator 或 Android Emulator

### 项目初始化

#### 1. 克隆项目
```bash
git clone <repository-url>
cd JingYu
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 启动开发服务器
```bash
npm run dev
```

#### 4. 运行应用
- **iOS**: 按 `i` 键或扫描二维码
- **Android**: 按 `a` 键或扫描二维码
- **Web**: 按 `w` 键或访问 http://localhost:8081

## 项目结构说明

### 目录结构
```
JingYu/
├── app/                    # 应用页面 (Expo Router)
│   ├── (tabs)/            # 底部标签页
│   ├── idiom/             # 成语详情页
│   ├── _layout.tsx        # 根布局
│   └── +not-found.tsx     # 404 页面
├── components/            # 可复用组件
│   └── IdiomCard.tsx      # 成语卡片组件
├── data/                  # 静态数据
│   └── idioms.ts          # 成语数据
├── hooks/                 # 自定义 Hooks
│   └── useFrameworkReady.ts
├── assets/                # 静态资源
│   └── images/            # 图片资源
├── docs/                  # 项目文档
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── app.json               # Expo 配置
```

### 文件命名规范

#### 组件文件
- 使用 PascalCase: `IdiomCard.tsx`
- 页面组件使用小写: `index.tsx`, `search.tsx`

#### 工具文件
- 使用 camelCase: `useFrameworkReady.ts`
- 常量文件使用 UPPER_SNAKE_CASE: `CONSTANTS.ts`

## 开发流程

### 1. 功能开发流程

#### 创建新功能
1. **创建功能分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **开发功能**
   - 编写组件代码
   - 添加类型定义
   - 实现业务逻辑

3. **测试功能**
   - 在模拟器中测试
   - 检查不同屏幕尺寸
   - 验证交互逻辑

4. **代码审查**
   - 运行代码检查
   - 格式化代码
   - 提交代码

#### 代码提交规范
```bash
# 提交信息格式
git commit -m "feat: 添加成语收藏功能"

# 提交类型
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 代码格式调整
# refactor: 代码重构
# test: 测试相关
# chore: 构建过程或辅助工具的变动
```

### 2. 组件开发流程

#### 创建新组件
1. **创建组件文件**
   ```typescript
   // components/NewComponent.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   interface NewComponentProps {
     // 定义组件属性
   }

   export default function NewComponent({ }: NewComponentProps) {
     return (
       <View style={styles.container}>
         <Text>新组件</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       // 样式定义
     },
   });
   ```

2. **添加类型定义**
   ```typescript
   // 在组件文件中定义接口
   interface NewComponentProps {
     title: string;
     onPress?: () => void;
     disabled?: boolean;
   }
   ```

3. **实现组件逻辑**
   - 添加状态管理
   - 实现事件处理
   - 添加样式

4. **测试组件**
   - 创建测试用例
   - 验证不同状态
   - 检查可访问性

### 3. 页面开发流程

#### 创建新页面
1. **创建页面文件**
   ```typescript
   // app/new-page.tsx
   import React from 'react';
   import { View, Text, SafeAreaView } from 'react-native';

   export default function NewPage() {
     return (
       <SafeAreaView style={{ flex: 1 }}>
         <View>
           <Text>新页面</Text>
         </View>
       </SafeAreaView>
     );
   }
   ```

2. **配置路由**
   - 在 `app/_layout.tsx` 中添加路由
   - 配置页面选项

3. **实现页面功能**
   - 添加业务逻辑
   - 实现数据获取
   - 添加错误处理

## 代码规范

### TypeScript 规范

#### 类型定义
```typescript
// 使用接口定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// 使用类型别名定义联合类型
type Status = 'loading' | 'success' | 'error';

// 使用泛型提高复用性
interface ApiResponse<T> {
  data: T;
  status: Status;
  message: string;
}
```

#### 函数类型
```typescript
// 函数类型定义
type EventHandler = (event: Event) => void;

// 组件属性类型
interface ComponentProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### React Native 规范

#### 组件结构
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  // 属性定义
}

export default function Component({ }: ComponentProps) {
  // 状态定义
  // 事件处理函数
  // 渲染函数

  return (
    <View style={styles.container}>
      {/* JSX 内容 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 样式定义
  },
});
```

#### 样式规范
```typescript
const styles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  
  // 文本样式
  title: {
    fontFamily: 'NotoSerifSC-SemiBold',
    fontSize: 24,
    color: '#1A1A1A',
  },
  
  // 按钮样式
  button: {
    backgroundColor: '#C93F3F',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
```

### 命名规范

#### 变量命名
```typescript
// 使用 camelCase
const userName = 'John';
const isVisible = true;
const handlePress = () => {};

// 常量使用 UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
```

#### 组件命名
```typescript
// 组件使用 PascalCase
export default function UserProfile() {}
export default function NavigationBar() {}

// 文件名与组件名一致
// UserProfile.tsx
// NavigationBar.tsx
```

## 调试技巧

### 1. 开发工具调试

#### React Native Debugger
- 安装 React Native Debugger
- 连接调试器到应用
- 使用 Chrome DevTools 调试

#### Flipper
- 安装 Flipper 桌面应用
- 连接设备或模拟器
- 查看网络请求、日志等

### 2. 控制台调试

#### 日志输出
```typescript
// 使用 console.log 输出调试信息
console.log('Debug info:', data);

// 使用 console.warn 输出警告
console.warn('Warning message');

// 使用 console.error 输出错误
console.error('Error message');
```

#### 性能监控
```typescript
// 性能监控
console.time('operation');
// 执行操作
console.timeEnd('operation');
```

### 3. 设备调试

#### iOS 调试
- 使用 Xcode 调试器
- 查看设备日志
- 使用 Instruments 分析性能

#### Android 调试
- 使用 Android Studio 调试器
- 查看 Logcat 日志
- 使用 Profiler 分析性能

## 测试策略

### 1. 单元测试

#### 测试框架
```bash
# 安装测试依赖
npm install --save-dev jest @testing-library/react-native

# 运行测试
npm test
```

#### 测试示例
```typescript
// __tests__/IdiomCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import IdiomCard from '../components/IdiomCard';

describe('IdiomCard', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <IdiomCard
        idiom={mockIdiom}
        onPress={jest.fn()}
      />
    );
    
    expect(getByText('画龙点睛')).toBeTruthy();
  });
});
```

### 2. 集成测试

#### 页面测试
```typescript
// 测试页面交互
it('navigates to detail page when card is pressed', () => {
  const mockNavigate = jest.fn();
  const { getByTestId } = render(<HomeScreen />);
  
  fireEvent.press(getByTestId('idiom-card'));
  expect(mockNavigate).toHaveBeenCalledWith('/idiom/1');
});
```

### 3. 端到端测试

#### 用户流程测试
- 测试完整的用户操作流程
- 验证页面跳转和数据流
- 检查错误处理

## 性能优化

### 1. 渲染优化

#### 使用 React.memo
```typescript
const IdiomCard = React.memo(({ idiom, onPress }: IdiomCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{idiom.idiom}</Text>
    </TouchableOpacity>
  );
});
```

#### 使用 useMemo 和 useCallback
```typescript
const filteredIdioms = useMemo(() => {
  return idioms.filter(idiom => 
    idiom.category === selectedCategory
  );
}, [selectedCategory]);

const handlePress = useCallback((id: string) => {
  router.push(`/idiom/${id}`);
}, []);
```

### 2. 列表优化

#### FlatList 优化
```typescript
<FlatList
  data={idioms}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 3. 图片优化

#### 图片加载优化
```typescript
// 使用适当的图片格式
// 实现懒加载
// 使用缓存机制
```

## 部署流程

### 1. 构建配置

#### Expo 构建
```bash
# 构建 Android APK
expo build:android

# 构建 iOS IPA
expo build:ios

# 构建 Web 版本
expo build:web
```

#### 环境配置
```json
// app.json
{
  "expo": {
    "name": "境语",
    "slug": "jingyu",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

### 2. 发布流程

#### 应用商店发布
1. **准备发布材料**
   - 应用图标
   - 截图
   - 描述文案

2. **构建发布版本**
   ```bash
   expo build:android --release-channel production
   expo build:ios --release-channel production
   ```

3. **提交审核**
   - 上传到应用商店
   - 等待审核通过
   - 发布上线

### 3. 版本管理

#### 版本号规范
- **主版本号**: 重大功能更新
- **次版本号**: 新功能添加
- **修订版本号**: Bug 修复

#### 更新策略
- 使用 Expo Updates 进行 OTA 更新
- 配置自动更新检查
- 提供更新提示

## 常见问题

### 1. 开发环境问题

#### 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 模拟器连接问题
```bash
# 重启 Metro 服务器
npm start -- --reset-cache

# 检查设备连接
expo devices
```

### 2. 代码问题

#### TypeScript 错误
- 检查类型定义
- 确保导入正确
- 验证接口实现

#### 样式问题
- 检查样式属性
- 验证颜色值
- 确认字体加载

### 3. 性能问题

#### 内存泄漏
- 检查事件监听器
- 验证组件卸载
- 使用性能分析工具

#### 渲染性能
- 优化列表渲染
- 减少不必要的重渲染
- 使用性能监控工具 