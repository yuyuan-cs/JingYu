import { useState, useEffect, useCallback } from 'react';
import { api, ApiResponse, PaginatedResponse, IdiomApi, Achievement, handleApiError } from '../services/api';

// 通用状态类型
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// 分页状态类型
interface UsePaginatedState<T> extends UseApiState<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  loadMore: () => Promise<void>;
  setPage: (page: number) => void;
}

// 通用API Hook
function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || '请求失败');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
}

// 分页API Hook
function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<PaginatedResponse<T>>>,
  limit: number = 20
): UsePaginatedState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<UsePaginatedState<T>['pagination']>(null);

  const fetchData = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiCall(pageNum, limit);
      
      if (response.success && response.data) {
        const newData = response.data.items;
        setData(prev => append ? [...prev, ...newData] : newData);
        setPagination({
          ...response.data.pagination,
          hasMore: pageNum < response.data.pagination.totalPages,
        });
      } else {
        setError(response.error?.message || '请求失败');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [apiCall, limit]);

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchData(1, false);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchData(nextPage, true);
    }
  }, [fetchData, page, pagination]);

  const setPageNum = useCallback(async (pageNum: number) => {
    setPage(pageNum);
    await fetchData(pageNum, false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    refresh,
    loadMore,
    setPage: setPageNum,
  };
}

// 成语相关 Hooks
export function useIdioms(params?: {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
}) {
  return usePaginatedApi(
    (page, limit) => api.idioms.list({ page, limit, ...params }),
    20
  );
}

export function useIdiom(id: string) {
  return useApi(
    () => api.idioms.get(id),
    [id]
  );
}

export function useIdiomSearch(query: string, type?: 'idiom' | 'pinyin' | 'meaning' | 'origin') {
  return usePaginatedApi(
    (page, limit) => api.idioms.search({ q: query, type, page, limit }),
    20
  );
}

// 学习记录相关 Hooks
export function useLearningStatistics(period?: 'day' | 'week' | 'month' | 'year') {
  return useApi(
    () => api.learning.statistics({ period }),
    [period]
  );
}

export function useLearningProgress() {
  return useApi(() => api.learning.progress());
}

// 收藏相关 Hooks
export function useFavorites() {
  return usePaginatedApi(
    (page, limit) => api.favorites.list({ page, limit }),
    20
  );
}

export function useFavoriteAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavorite = useCallback(async (idiomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.favorites.add(idiomId);
      if (!response.success) {
        setError(response.error?.message || '收藏失败');
        return false;
      }
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = useCallback(async (idiomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.favorites.remove(idiomId);
      if (!response.success) {
        setError(response.error?.message || '取消收藏失败');
        return false;
      }
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addFavorite, removeFavorite, loading, error };
}

// 测试相关 Hooks
export function useQuizQuestions(params: {
  type: 'meaning' | 'pinyin' | 'complete' | 'origin';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  count?: number;
  categories?: string[];
}) {
  return useApi(
    () => api.quiz.getQuestions(params),
    [JSON.stringify(params)]
  );
}

export function useQuizHistory() {
  return usePaginatedApi(
    (page, limit) => api.quiz.history({ page, limit }),
    10
  );
}

export function useQuizSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: {
    quizId: string;
    answers: {
      questionId: string;
      selectedAnswer: number;
      timeSpent: number;
    }[];
    totalTime: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.quiz.submit(data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '提交失败');
        return null;
      }
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}

// 成就相关 Hooks
export function useAchievements(category?: 'learning' | 'streak' | 'test' | 'social') {
  return useApi(
    () => api.achievements.list({ category }),
    [category]
  );
}

export function useAchievement(id: string) {
  return useApi(
    () => api.achievements.get(id),
    [id]
  );
}

// 推荐相关 Hooks
export function useRecommendations(type?: 'daily' | 'similar' | 'difficulty' | 'category') {
  return useApi(
    () => api.recommendations.get({ type, limit: 10 }),
    [type]
  );
}

// 设置相关 Hooks
export function useSettings() {
  return useApi(() => api.settings.get());
}

export function useSettingsUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = useCallback(async (data: {
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
    try {
      setLoading(true);
      setError(null);
      const response = await api.settings.update(data);
      if (!response.success) {
        setError(response.error?.message || '更新失败');
        return false;
      }
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateSettings, loading, error };
}

// 学习记录 Hook
export function useLearningRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const record = useCallback(async (data: {
    idiomId: string;
    action: 'view' | 'study' | 'test' | 'favorite';
    duration: number;
    metadata?: Record<string, any>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.learning.record(data);
      if (!response.success) {
        setError(response.error?.message || '记录失败');
        return false;
      }
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { record, loading, error };
}

// 认证相关 Hooks
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.auth.login({ email, password });
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '登录失败');
        return null;
      }
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.auth.register(data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '注册失败');
        return null;
      }
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
  }, []);

  return { login, register, logout, loading, error };
}

// 应用信息 Hook
export function useAppInfo() {
  return useApi(() => api.app.info());
}

// 健康检查 Hook
export function useHealthCheck() {
  return useApi(() => api.app.health());
}