import AsyncStorage from '@react-native-async-storage/async-storage';

// 缓存配置
const CACHE_CONFIG = {
  SEARCH_RESULTS: 'search_results',
  IDIOM_DETAILS: 'idiom_details',
  GAOPIN_INFO: 'gaopin_info',
  CACHE_EXPIRY: 30 * 60 * 1000, // 30分钟
};

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// 缓存服务类
export class CacheService {
  // 生成缓存键
  private static generateKey(prefix: string, params: any): string {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  // 设置缓存
  static async set<T>(prefix: string, params: any, data: T): Promise<void> {
    try {
      const key = this.generateKey(prefix, params);
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_CONFIG.CACHE_EXPIRY,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('缓存设置失败:', error);
    }
  }

  // 获取缓存
  static async get<T>(prefix: string, params: any): Promise<T | null> {
    try {
      const key = this.generateKey(prefix, params);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.warn('缓存获取失败:', error);
      return null;
    }
  }

  // 清除缓存
  static async clear(prefix?: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = prefix 
        ? keys.filter(key => key.startsWith(prefix))
        : keys.filter(key => key.includes(CACHE_CONFIG.SEARCH_RESULTS) || 
                           key.includes(CACHE_CONFIG.IDIOM_DETAILS) ||
                           key.includes(CACHE_CONFIG.GAOPIN_INFO));
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.warn('缓存清除失败:', error);
    }
  }

  // 获取缓存大小
  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.includes(CACHE_CONFIG.SEARCH_RESULTS) || 
                                         key.includes(CACHE_CONFIG.IDIOM_DETAILS) ||
                                         key.includes(CACHE_CONFIG.GAOPIN_INFO));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.warn('获取缓存大小失败:', error);
      return 0;
    }
  }

  // 预加载常用数据
  static async preloadCommonData(): Promise<void> {
    try {
      // 预加载一些常用搜索词的结果
      const commonSearches = ['一', '二', '三', '四', '五', '心', '家', '国', '人', '事'];
      
      // 这里可以预加载一些常用成语的详情
      // 实际实现时可以根据用户行为数据来确定预加载内容
    } catch (error) {
      console.warn('预加载数据失败:', error);
    }
  }
}

// 缓存装饰器
export function withCache<T extends any[], R>(
  prefix: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    // 尝试从缓存获取
    const cached = await CacheService.get<R>(prefix, args);
    if (cached !== null) {
      return cached;
    }
    
    // 执行原函数
    const result = await fn(...args);
    
    // 缓存结果
    await CacheService.set<R>(prefix, args, result);
    
    return result;
  };
} 