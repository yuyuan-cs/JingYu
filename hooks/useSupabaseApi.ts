import { useState, useEffect, useCallback } from 'react';
import { supabaseApi, ApiResponse, ChengYuRecord, ChengYuApiRecord, UserRecord, LearningRecord, FavoriteRecord, QuizResultRecord, AchievementRecord, UserAchievementRecord, PaginatedResult, handleApiError } from '../services/supabaseApi';
import { CacheService } from '../services/cacheService';

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
function useSupabaseApi<T>(
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
function usePaginatedSupabaseApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<PaginatedResult<T>>>,
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
        const newData = response.data.data;
        setData(prev => append ? [...prev, ...newData] : newData);
        setPagination(response.data.pagination);
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
export function useSupabaseIdioms(params?: {
  search?: string;
}) {
  return usePaginatedSupabaseApi(
    (page, limit) => supabaseApi.idioms.list({ page, limit, ...params }),
    20
  );
}

export function useSupabaseIdiom(id: string) {
  return useSupabaseApi(
    () => supabaseApi.idioms.get(id),
    [id]
  );
}

export function useSupabaseIdiomSearch(query: string, type?: 'word' | 'pinyin' | 'explanation' | 'derivation') {
  const [data, setData] = useState<ChengYuApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaginatedState<ChengYuApiRecord>['pagination']>(null);
  const [currentQuery, setCurrentQuery] = useState('');

  const fetchData = useCallback(async (searchQuery: string, searchType: typeof type, pageNum: number, append: boolean = false) => {
    // 如果查询为空，清空状态
    if (!searchQuery || searchQuery.trim() === '') {
      setData([]);
      setLoading(false);
      setError(null);
      setPagination(null);
      setCurrentQuery('');
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      setCurrentQuery(searchQuery);
      
      // 尝试从缓存获取
      const cacheKey = `search_${searchQuery}_${searchType}_${pageNum}`;
      const cached = await CacheService.get<{data: ChengYuApiRecord[], pagination: any}>('search_results', {
        query: searchQuery,
        type: searchType,
        page: pageNum
      });
      
      if (cached && !append) {
        setData(cached.data);
        setPagination(cached.pagination);
        setLoading(false);
        return;
      }
      
      const response = await supabaseApi.idioms.search({ 
        q: searchQuery.trim(), 
        type: searchType, 
        page: pageNum, 
        limit: 20 
      });
      
      if (response.success && response.data) {
        const newData = response.data.data;
        setData(prev => append ? [...prev, ...newData] : newData);
        setPagination(response.data.pagination);
        
        // 缓存结果（只缓存第一页）
        if (!append) {
          await CacheService.set('search_results', {
            query: searchQuery,
            type: searchType,
            page: pageNum
          }, {
            data: newData,
            pagination: response.data.pagination
          });
        }
      } else {
        setError(response.error?.message || '搜索失败');
        setData([]);
        setPagination(null);
      }
    } catch (err) {
      setError(handleApiError(err));
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData(query, type, 1, false);
  }, [fetchData, query, type]);

  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasMore && currentQuery === query) {
      await fetchData(query, type, pagination.page + 1, true);
    }
  }, [fetchData, query, type, pagination, currentQuery]);

  const setPage = useCallback(async (page: number) => {
    await fetchData(query, type, page, false);
  }, [fetchData, query, type]);

  // 只在query或type变化时重新搜索
  useEffect(() => {
    // 添加延迟以避免竞态条件
    const timeoutId = setTimeout(() => {
      fetchData(query, type, 1, false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [query, type, fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    refresh,
    loadMore,
    setPage,
  };
}

export function useSupabaseRandomIdioms(count: number = 10) {
  return useSupabaseApi(
    () => supabaseApi.idioms.random(count),
    [count]
  );
}

export function useSupabaseFirstCharacters() {
  return useSupabaseApi(() => supabaseApi.idioms.firstCharacters());
}

export function useSupabaseIdiomsByFirstChar(firstChar: string) {
  return useSupabaseApi(
    () => supabaseApi.idioms.byFirstChar(firstChar),
    [firstChar]
  );
}

// 用户相关 Hooks
export function useSupabaseUser(id: string) {
  return useSupabaseApi(
    () => supabaseApi.users.get(id),
    [id]
  );
}

export function useSupabaseUserActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.users.create(userData);
      if (!response.success) {
        setError(response.error?.message || '创建用户失败');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<UserRecord>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.users.update(id, updates);
      if (!response.success) {
        setError(response.error?.message || '更新用户失败');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createUser, updateUser, loading, error };
}

// 学习记录相关 Hooks
export function useSupabaseLearningStatistics(userId: string, period?: 'day' | 'week' | 'month' | 'year') {
  return useSupabaseApi(
    () => supabaseApi.learning.statistics({ userId, period }),
    [userId, period]
  );
}

export function useSupabaseLearningProgress(userId: string) {
  return useSupabaseApi(
    () => supabaseApi.learning.progress(userId),
    [userId]
  );
}

export function useSupabaseLearningRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordLearning = useCallback(async (record: Omit<LearningRecord, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.learning.record(record);
      if (!response.success) {
        setError(response.error?.message || '记录学习失败');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { recordLearning, loading, error };
}

// 收藏相关 Hooks
export function useSupabaseFavorites(userId: string) {
  return usePaginatedSupabaseApi(
    (page, limit) => supabaseApi.favorites.list({ userId, page, limit }),
    20
  );
}

export function useSupabaseFavoriteActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavorite = useCallback(async (userId: string, idiomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.favorites.add(userId, idiomId);
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

  const removeFavorite = useCallback(async (userId: string, idiomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.favorites.remove(userId, idiomId);
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

  const checkFavorite = useCallback(async (userId: string, idiomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.favorites.check(userId, idiomId);
      if (!response.success) {
        setError(response.error?.message || '检查收藏状态失败');
        return false;
      }
      return response.data || false;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addFavorite, removeFavorite, checkFavorite, loading, error };
}

// 测试相关 Hooks
export function useSupabaseQuizQuestions(params: {
  type: 'meaning' | 'pinyin' | 'complete' | 'origin';
  count?: number;
  firstChar?: string;
}) {
  return useSupabaseApi(
    () => supabaseApi.quiz.generate(params),
    [params.type, params.count, params.firstChar]
  );
}

export function useSupabaseQuizHistory(userId: string) {
  return usePaginatedSupabaseApi(
    (page, limit) => supabaseApi.quiz.history({ userId, page, limit }),
    20
  );
}

export function useSupabaseQuizStatistics(userId: string) {
  return useSupabaseApi(
    () => supabaseApi.quiz.statistics(userId),
    [userId]
  );
}

export function useSupabaseQuizSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuiz = useCallback(async (result: Omit<QuizResultRecord, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.quiz.submit(result);
      if (!response.success) {
        setError(response.error?.message || '提交测试失败');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitQuiz, loading, error };
}

// 成就相关 Hooks
export function useSupabaseAchievements(category?: 'learning' | 'streak' | 'test' | 'social') {
  return useSupabaseApi(
    () => supabaseApi.achievements.list(category),
    [category]
  );
}

export function useSupabaseUserAchievements(userId: string) {
  return useSupabaseApi(
    () => supabaseApi.achievements.user(userId),
    [userId]
  );
}

export function useSupabaseAchievementActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(async (userId: string, achievementId: string, progress: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseApi.achievements.updateProgress(userId, achievementId, progress);
      if (!response.success) {
        setError(response.error?.message || '更新成就进度失败');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProgress, loading, error };
}

// 推荐相关 Hooks
export function useSupabaseRecommendations(userId: string, type?: 'daily' | 'similar' | 'difficulty' | 'category') {
  return useSupabaseApi(
    () => supabaseApi.recommendations.get({ userId, type }),
    [userId, type]
  );
}

// 统计相关 Hooks
export function useSupabaseAppStatistics() {
  return useSupabaseApi(() => supabaseApi.statistics.app());
}

// 健康检查 Hook
export function useSupabaseHealthCheck() {
  return useSupabaseApi(() => supabaseApi.health.check());
} 