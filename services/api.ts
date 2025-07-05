// API配置
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'https://api-dev.jingyu.app/v1' 
    : 'https://api.jingyu.app/v1',
  timeout: 10000,
  retries: 3,
};

// 响应类型定义
interface ApiResponse<T = any> {
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

// 分页响应类型
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 用户类型
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 成语类型（扩展）
interface IdiomApi extends Idiom {
  tags: string[];
  audioUrl?: string;
  relatedStories?: {
    title: string;
    content: string;
  }[];
  views: number;
  favorites: number;
}

// 学习记录类型
interface LearningRecord {
  id: string;
  userId: string;
  idiomId: string;
  action: 'view' | 'study' | 'test' | 'favorite';
  duration: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// 测试结果类型
interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  type: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];
  createdAt: string;
}

// 成就类型
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'streak' | 'test' | 'social';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  reward: {
    type: 'title' | 'badge' | 'feature' | 'item';
    value: string;
    description: string;
  };
}

// HTTP客户端类
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.loadToken();
  }

  private async loadToken() {
    try {
      // 从AsyncStorage加载token
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
    } catch (error) {
      console.warn('Failed to save auth token:', error);
    }
  }

  private async removeToken() {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem('auth_token');
      this.token = null;
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  setToken(token: string) {
    this.saveToken(token);
  }

  clearToken() {
    this.removeToken();
  }
}

// API客户端类
class JingYuAPI {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient(API_CONFIG);
  }

  // 认证模块
  auth = {
    register: async (data: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const response = await this.http.post<{
        user: User;
        token: string;
      }>('/auth/register', data);
      
      if (response.success && response.data?.token) {
        this.http.setToken(response.data.token);
      }
      
      return response;
    },

    login: async (data: {
      email: string;
      password: string;
    }) => {
      const response = await this.http.post<{
        user: User;
        token: string;
        refreshToken: string;
      }>('/auth/login', data);
      
      if (response.success && response.data?.token) {
        this.http.setToken(response.data.token);
      }
      
      return response;
    },

    refresh: async (refreshToken: string) => {
      const response = await this.http.post<{
        token: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken });
      
      if (response.success && response.data?.token) {
        this.http.setToken(response.data.token);
      }
      
      return response;
    },

    logout: async () => {
      this.http.clearToken();
      return { success: true };
    },
  };

  // 成语模块
  idioms = {
    list: async (params?: {
      page?: number;
      limit?: number;
      category?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      search?: string;
    }) => {
      return this.http.get<PaginatedResponse<IdiomApi>>('/idioms', params);
    },

    get: async (id: string) => {
      return this.http.get<IdiomApi>(`/idioms/${id}`);
    },

    search: async (params: {
      q: string;
      type?: 'idiom' | 'pinyin' | 'meaning' | 'origin';
      page?: number;
      limit?: number;
    }) => {
      return this.http.get<PaginatedResponse<IdiomApi>>('/idioms/search', params);
    },
  };

  // 学习记录模块
  learning = {
    record: async (data: {
      idiomId: string;
      action: 'view' | 'study' | 'test' | 'favorite';
      duration: number;
      metadata?: Record<string, any>;
    }) => {
      return this.http.post<LearningRecord>('/learning/record', data);
    },

    statistics: async (params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    }) => {
      return this.http.get('/learning/statistics', params);
    },

    progress: async () => {
      return this.http.get('/learning/progress');
    },
  };

  // 收藏模块
  favorites = {
    add: async (idiomId: string) => {
      return this.http.post('/favorites', { idiomId });
    },

    remove: async (idiomId: string) => {
      return this.http.delete(`/favorites/${idiomId}`);
    },

    list: async (params?: {
      page?: number;
      limit?: number;
    }) => {
      return this.http.get<PaginatedResponse<{
        id: string;
        idiom: IdiomApi;
        favoritedAt: string;
      }>>('/favorites', params);
    },
  };

  // 测试模块
  quiz = {
    getQuestions: async (params: {
      type: 'meaning' | 'pinyin' | 'complete' | 'origin';
      difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
      count?: number;
      categories?: string[];
    }) => {
      return this.http.get('/quiz/questions', params);
    },

    submit: async (data: {
      quizId: string;
      answers: {
        questionId: string;
        selectedAnswer: number;
        timeSpent: number;
      }[];
      totalTime: number;
    }) => {
      return this.http.post<QuizResult>('/quiz/submit', data);
    },

    history: async (params?: {
      page?: number;
      limit?: number;
      type?: string;
    }) => {
      return this.http.get<PaginatedResponse<QuizResult>>('/quiz/history', params);
    },
  };

  // 成就模块
  achievements = {
    list: async (params?: {
      category?: 'learning' | 'streak' | 'test' | 'social';
      status?: 'unlocked' | 'locked' | 'all';
    }) => {
      return this.http.get<{
        achievements: Achievement[];
        summary: {
          total: number;
          unlocked: number;
          locked: number;
          percentage: number;
        };
      }>('/achievements', params);
    },

    get: async (id: string) => {
      return this.http.get<Achievement>(`/achievements/${id}`);
    },

    unlock: async (id: string) => {
      return this.http.post(`/achievements/${id}/unlock`);
    },
  };

  // 推荐模块
  recommendations = {
    get: async (params?: {
      type?: 'daily' | 'similar' | 'difficulty' | 'category';
      limit?: number;
    }) => {
      return this.http.get('/recommendations', params);
    },
  };

  // 设置模块
  settings = {
    get: async () => {
      return this.http.get('/settings');
    },

    update: async (data: {
      notifications?: {
        pushEnabled?: boolean;
        dailyReminder?: boolean;
        reminderTime?: string;
      };
      preferences?: {
        theme?: 'light' | 'dark';
        soundEffects?: boolean;
      };
    }) => {
      return this.http.put('/settings', data);
    },
  };

  // 数据同步模块
  sync = {
    upload: async (data: {
      lastSyncTime: string;
      data: {
        learningRecords: any[];
        favorites: any[];
        testResults: any[];
        settings: any;
      };
    }) => {
      return this.http.post('/sync', data);
    },

    download: async (since: string) => {
      return this.http.get('/sync/delta', { since });
    },
  };

  // 系统信息模块
  app = {
    info: async () => {
      return this.http.get('/app/info');
    },

    health: async () => {
      return this.http.get('/health');
    },
  };
}

// 导出API实例
export const api = new JingYuAPI();

// 导出类型
export type {
  ApiResponse,
  PaginatedResponse,
  User,
  IdiomApi,
  LearningRecord,
  QuizResult,
  Achievement,
};

// 导出API类
export { JingYuAPI };

// 错误处理辅助函数
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '网络请求失败，请稍后重试';
};

// 默认导出
export default api;