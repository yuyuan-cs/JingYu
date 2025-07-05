# API 集成示例

本文档展示如何在境语应用中集成和使用 API 接口。

## 1. API 客户端使用示例

### 基本用法

```typescript
import api from '@/services/api';

// 获取成语列表
const response = await api.idioms.list({
  page: 1,
  limit: 20,
  category: '艺术创作'
});

if (response.success) {
  console.log('成语列表:', response.data.items);
} else {
  console.error('请求失败:', response.error?.message);
}
```

### 错误处理

```typescript
import { handleApiError } from '@/services/api';

try {
  const response = await api.idioms.get('idiom_1');
  // 处理成功响应
} catch (error) {
  const errorMessage = handleApiError(error);
  Alert.alert('错误', errorMessage);
}
```

## 2. React Hooks 使用示例

### 成语列表组件

```typescript
import React from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useIdioms } from '@/hooks/useApi';
import IdiomCard from '@/components/IdiomCard';

export default function IdiomsListScreen() {
  const { data, loading, error, pagination, loadMore } = useIdioms({
    category: '艺术创作',
    difficulty: 'medium'
  });

  const renderIdiom = ({ item }) => (
    <IdiomCard
      idiom={item}
      onPress={() => console.log('Navigate to:', item.id)}
    />
  );

  const renderFooter = () => {
    if (!pagination?.hasMore) return null;
    return <ActivityIndicator size="small" color="#FF6B6B" />;
  };

  if (loading && data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderIdiom}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
    />
  );
}
```

### 成语详情组件

```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useIdiom, useLearningRecord, useFavoriteAction } from '@/hooks/useApi';

interface IdiomDetailProps {
  idiomId: string;
}

export default function IdiomDetail({ idiomId }: IdiomDetailProps) {
  const { data: idiom, loading, error } = useIdiom(idiomId);
  const { record } = useLearningRecord();
  const { addFavorite, removeFavorite } = useFavoriteAction();

  useEffect(() => {
    if (idiom) {
      // 记录查看行为
      record({
        idiomId: idiom.id,
        action: 'view',
        duration: 0,
        metadata: { source: 'detail_page' }
      });
    }
  }, [idiom, record]);

  const handleFavorite = async () => {
    if (!idiom) return;
    
    const success = await addFavorite(idiom.id);
    if (success) {
      // 可以显示成功提示或更新 UI
      console.log('收藏成功');
    }
  };

  if (loading) {
    return <Text>加载中...</Text>;
  }

  if (error || !idiom) {
    return <Text>加载失败: {error}</Text>;
  }

  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>
          {idiom.idiom}
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 8 }}>
          {idiom.pinyin}
        </Text>
        <Text style={{ fontSize: 14, marginTop: 16 }}>
          {idiom.meaning}
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B6B',
            padding: 12,
            borderRadius: 8,
            marginTop: 20,
            alignItems: 'center'
          }}
          onPress={handleFavorite}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            收藏成语
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

### 测试组件

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useQuizQuestions, useQuizSubmit } from '@/hooks/useApi';

export default function QuizScreen() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());

  const { data: quizData, loading } = useQuizQuestions({
    type: 'meaning',
    difficulty: 'medium',
    count: 5
  });

  const { submit, loading: submitting } = useQuizSubmit();

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (!quizData) return;

    const answers = quizData.questions.map(question => ({
      questionId: question.id,
      selectedAnswer: selectedAnswers[question.id] || 0,
      timeSpent: Math.floor((Date.now() - startTime) / quizData.questions.length)
    }));

    const result = await submit({
      quizId: quizData.quizId,
      answers,
      totalTime: Math.floor((Date.now() - startTime) / 1000)
    });

    if (result) {
      Alert.alert('测试完成', `得分: ${result.score}分`);
    }
  };

  if (loading) {
    return <Text>加载题目中...</Text>;
  }

  if (!quizData) {
    return <Text>加载失败</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      {quizData.questions.map((question, index) => (
        <View key={question.id} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            {index + 1}. {question.question}
          </Text>
          
          {question.options.map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              style={{
                padding: 12,
                backgroundColor: selectedAnswers[question.id] === optionIndex ? '#FF6B6B' : '#f0f0f0',
                borderRadius: 8,
                marginBottom: 8
              }}
              onPress={() => handleAnswerSelect(question.id, optionIndex)}
            >
              <Text style={{
                color: selectedAnswers[question.id] === optionIndex ? 'white' : 'black'
              }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={{
          backgroundColor: '#4ECDC4',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20
        }}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {submitting ? '提交中...' : '提交答案'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 学习统计组件

```typescript
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLearningStatistics } from '@/hooks/useApi';

export default function StatisticsScreen() {
  const { data: stats, loading, error } = useLearningStatistics('week');

  if (loading) {
    return <Text>加载统计数据中...</Text>;
  }

  if (error) {
    return <Text>加载失败: {error}</Text>;
  }

  if (!stats) {
    return <Text>暂无数据</Text>;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        学习统计
      </Text>

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          总体概况
        </Text>
        <Text>学习天数: {stats.overview.totalDays}</Text>
        <Text>已学成语: {stats.overview.totalIdioms}</Text>
        <Text>连续天数: {stats.overview.currentStreak}</Text>
        <Text>日均学习: {stats.overview.averageDaily.toFixed(1)}</Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          本周进度
        </Text>
        {stats.weeklyProgress.map((count, index) => (
          <Text key={index}>
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index]}: {count}个
          </Text>
        ))}
      </View>

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          分类进度
        </Text>
        {stats.categoryProgress.map((category, index) => (
          <View key={index} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{category.category}</Text>
            <Text>
              {category.learned}/{category.total} ({category.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

### 设置组件

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSettings, useSettingsUpdate } from '@/hooks/useApi';

export default function SettingsScreen() {
  const { data: settings, loading, refresh } = useSettings();
  const { updateSettings, loading: updating } = useSettingsUpdate();
  const [localSettings, setLocalSettings] = useState(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (section: string, key: string) => {
    if (!localSettings) return;

    const newSettings = {
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [key]: !localSettings[section][key]
      }
    };
    setLocalSettings(newSettings);
  };

  const handleSave = async () => {
    if (!localSettings) return;

    const success = await updateSettings({
      notifications: localSettings.notifications,
      preferences: localSettings.preferences
    });

    if (success) {
      Alert.alert('成功', '设置已保存');
      refresh();
    }
  };

  if (loading || !localSettings) {
    return <Text>加载设置中...</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        设置
      </Text>

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          通知设置
        </Text>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 12 
        }}>
          <Text>推送通知</Text>
          <Switch
            value={localSettings.notifications.pushEnabled}
            onValueChange={() => handleToggle('notifications', 'pushEnabled')}
          />
        </View>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Text>每日提醒</Text>
          <Switch
            value={localSettings.notifications.dailyReminder}
            onValueChange={() => handleToggle('notifications', 'dailyReminder')}
          />
        </View>
      </View>

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          偏好设置
        </Text>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Text>音效</Text>
          <Switch
            value={localSettings.preferences.soundEffects}
            onValueChange={() => handleToggle('preferences', 'soundEffects')}
          />
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#4ECDC4',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center'
        }}
        onPress={handleSave}
        disabled={updating}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {updating ? '保存中...' : '保存设置'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 3. 认证集成示例

### 登录组件

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/hooks/useApi';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请填写邮箱和密码');
      return;
    }

    const user = await login(email, password);
    if (user) {
      Alert.alert('成功', '登录成功');
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>
        登录
      </Text>

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16
        }}
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16
        }}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: '#FF6B6B',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center'
        }}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {loading ? '登录中...' : '登录'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 4. 离线支持和数据同步

### 数据同步 Hook

```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

export function useDataSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadLastSyncTime();
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const time = await AsyncStorage.getItem('last_sync_time');
      setLastSyncTime(time);
    } catch (error) {
      console.warn('Failed to load last sync time:', error);
    }
  };

  const saveLastSyncTime = async (time: string) => {
    try {
      await AsyncStorage.setItem('last_sync_time', time);
      setLastSyncTime(time);
    } catch (error) {
      console.warn('Failed to save last sync time:', error);
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);

      // 1. 上传本地数据
      const localData = await loadLocalData();
      if (localData) {
        await api.sync.upload({
          lastSyncTime: lastSyncTime || new Date(0).toISOString(),
          data: localData
        });
      }

      // 2. 下载服务器数据
      if (lastSyncTime) {
        const response = await api.sync.download(lastSyncTime);
        if (response.success && response.data) {
          await saveServerData(response.data);
        }
      }

      // 3. 更新同步时间
      const now = new Date().toISOString();
      await saveLastSyncTime(now);

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const loadLocalData = async () => {
    // 加载本地数据的逻辑
    return {
      learningRecords: [],
      favorites: [],
      testResults: [],
      settings: {}
    };
  };

  const saveServerData = async (data: any) => {
    // 保存服务器数据到本地的逻辑
  };

  return {
    syncing,
    lastSyncTime,
    syncData
  };
}
```

## 5. 错误处理和重试机制

### 带重试的 API 调用

```typescript
import { useState, useCallback } from 'react';

export function useApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        setLoading(false);
        return result;
      } catch (err) {
        if (attempt === maxRetries) {
          setError(`请求失败（尝试 ${attempt} 次）: ${handleApiError(err)}`);
          setLoading(false);
          return null;
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return null;
  }, [apiCall, maxRetries]);

  return { execute, loading, error };
}
```

## 6. 性能优化

### 缓存机制

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async get<T>(key: string): Promise<T | null> {
    // 先检查内存缓存
    const memoryItem = this.cache.get(key);
    if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
      return memoryItem.data;
    }

    // 检查持久化缓存
    try {
      const item = await AsyncStorage.getItem(`cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          this.cache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  async set(key: string, data: any, ttl: number = 300000): Promise<void> {
    const item = { data, timestamp: Date.now(), ttl };
    
    // 存储到内存
    this.cache.set(key, item);
    
    // 存储到持久化缓存
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
```

这些示例展示了如何在实际应用中集成和使用 API 接口，包括数据获取、状态管理、错误处理、认证、同步和性能优化等各个方面。