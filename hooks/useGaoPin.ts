import { useState, useEffect, useCallback } from 'react';
import { 
  GaoPinApiService, 
  GaoPinQueryParams, 
  GaoPinLearningParams, 
  GaoPinStats 
} from '../services/gaoPinApi';
import { 
  ChengYuGaoPinApiRecord, 
  PaginatedResult, 
  GaoPinLearningMode 
} from '../services/supabase';

// 高频成语Hook状态
interface GaoPinState {
  // 数据状态
  gaoPinList: ChengYuGaoPinApiRecord[];
  currentGaoPin: ChengYuGaoPinApiRecord | null;
  stats: GaoPinStats | null;
  categories: string[];
  confusablePairs: { word: string; confusableWord: string; explanation: string }[];
  
  // UI状态
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // 分页状态
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  
  // 学习状态
  learningMode: GaoPinLearningMode;
  currentCategory: string | null;
  currentDifficulty: 'high' | 'medium' | 'low' | null;
  studiedIds: string[];
  favoriteIds: string[];
}

// 高频成语Hook
export function useGaoPin() {
  const [state, setState] = useState<GaoPinState>({
    gaoPinList: [],
    currentGaoPin: null,
    stats: null,
    categories: [],
    confusablePairs: [],
    loading: false,
    error: null,
    refreshing: false,
    pagination: null,
    learningMode: GaoPinLearningMode.RANDOM,
    currentCategory: null,
    currentDifficulty: null,
    studiedIds: [],
    favoriteIds: [],
  });

  // 设置加载状态
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // 设置错误状态
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // 获取高频成语列表
  const fetchGaoPinList = useCallback(async (params: GaoPinQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await GaoPinApiService.getGaoPinList(params);
      
      setState(prev => ({
        ...prev,
        gaoPinList: params.page === 1 ? result.data : [...prev.gaoPinList, ...result.data],
        pagination: result.pagination,
        loading: false,
      }));

      return result;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  // 刷新高频成语列表
  const refreshGaoPinList = useCallback(async (params: GaoPinQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, refreshing: true }));
      
      const result = await GaoPinApiService.getGaoPinList({ ...params, page: 1 });
      
      setState(prev => ({
        ...prev,
        gaoPinList: result.data,
        pagination: result.pagination,
        refreshing: false,
        error: null,
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        refreshing: false, 
        error: error.message 
      }));
      throw error;
    }
  }, []);

  // 加载更多高频成语
  const loadMoreGaoPin = useCallback(async (params: GaoPinQueryParams = {}) => {
    if (!state.pagination?.hasMore || state.loading) return;

    const nextPage = (state.pagination.page || 0) + 1;
    return fetchGaoPinList({ ...params, page: nextPage });
  }, [state.pagination, state.loading, fetchGaoPinList]);

  // 获取高频成语详情
  const fetchGaoPinById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const gaoPin = await GaoPinApiService.getGaoPinById(id);
      
      setState(prev => ({
        ...prev,
        currentGaoPin: gaoPin,
        loading: false,
      }));

      return gaoPin;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  // 获取随机高频成语
  const fetchRandomGaoPin = useCallback(async (count: number = 10, excludeIds: string[] = []) => {
    try {
      setLoading(true);
      setError(null);

      const gaoPinList = await GaoPinApiService.getRandomGaoPin(count, excludeIds);
      
      setState(prev => ({
        ...prev,
        gaoPinList,
        loading: false,
      }));

      return gaoPinList;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  // 按学习模式获取高频成语
  const fetchGaoPinByLearningMode = useCallback(async (params: GaoPinLearningParams) => {
    try {
      setLoading(true);
      setError(null);

      const gaoPinList = await GaoPinApiService.getGaoPinByLearningMode(params);
      
      setState(prev => ({
        ...prev,
        gaoPinList,
        learningMode: params.mode,
        currentCategory: params.category || null,
        currentDifficulty: params.difficulty || null,
        loading: false,
      }));

      return gaoPinList;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const stats = await GaoPinApiService.getGaoPinStats();
      
      setState(prev => ({
        ...prev,
        stats,
      }));

      return stats;
    } catch (error: any) {
      console.error('获取统计信息失败:', error);
      throw error;
    }
  }, []);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await GaoPinApiService.getCategories();
      
      setState(prev => ({
        ...prev,
        categories,
      }));

      return categories;
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }, []);

  // 获取易混淆词语对
  const fetchConfusablePairs = useCallback(async () => {
    try {
      const pairs = await GaoPinApiService.getConfusablePairs();
      
      setState(prev => ({
        ...prev,
        confusablePairs: pairs,
      }));

      return pairs;
    } catch (error: any) {
      console.error('获取易混淆词语对失败:', error);
      throw error;
    }
  }, []);

  // 搜索高频成语
  const searchGaoPin = useCallback(async (keyword: string, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);

      const results = await GaoPinApiService.searchGaoPin(keyword, limit);
      
      setState(prev => ({
        ...prev,
        gaoPinList: results,
        loading: false,
      }));

      return results;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  // 标记为已学习
  const markAsStudied = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      studiedIds: [...new Set([...prev.studiedIds, id])],
    }));
  }, []);

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    setState(prev => {
      const isFavorite = prev.favoriteIds.includes(id);
      const favoriteIds = isFavorite
        ? prev.favoriteIds.filter(fId => fId !== id)
        : [...prev.favoriteIds, id];
      
      return {
        ...prev,
        favoriteIds,
      };
    });
  }, []);

  // 重置学习状态
  const resetLearningState = useCallback(() => {
    setState(prev => ({
      ...prev,
      studiedIds: [],
      currentGaoPin: null,
    }));
  }, []);

  // 设置学习模式
  const setLearningMode = useCallback((mode: GaoPinLearningMode) => {
    setState(prev => ({
      ...prev,
      learningMode: mode,
    }));
  }, []);

  // 设置当前分类
  const setCurrentCategory = useCallback((category: string | null) => {
    setState(prev => ({
      ...prev,
      currentCategory: category,
    }));
  }, []);

  // 设置当前难度
  const setCurrentDifficulty = useCallback((difficulty: 'high' | 'medium' | 'low' | null) => {
    setState(prev => ({
      ...prev,
      currentDifficulty: difficulty,
    }));
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // 初始化数据
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  return {
    // 状态
    ...state,
    
    // 操作方法
    fetchGaoPinList,
    refreshGaoPinList,
    loadMoreGaoPin,
    fetchGaoPinById,
    fetchRandomGaoPin,
    fetchGaoPinByLearningMode,
    fetchStats,
    fetchCategories,
    fetchConfusablePairs,
    searchGaoPin,
    markAsStudied,
    toggleFavorite,
    resetLearningState,
    setLearningMode,
    setCurrentCategory,
    setCurrentDifficulty,
    clearError,
  };
}

// 高频成语学习Hook（专门用于学习场景）
export function useGaoPinLearning() {
  const {
    gaoPinList,
    currentGaoPin,
    loading,
    error,
    learningMode,
    currentCategory,
    currentDifficulty,
    studiedIds,
    fetchGaoPinByLearningMode,
    markAsStudied,
    resetLearningState,
    setLearningMode,
    setCurrentCategory,
    setCurrentDifficulty,
  } = useGaoPin();

  // 开始学习会话
  const startLearningSession = useCallback(async (params: GaoPinLearningParams) => {
    resetLearningState();
    return fetchGaoPinByLearningMode(params);
  }, [resetLearningState, fetchGaoPinByLearningMode]);

  // 获取下一个学习项目
  const getNextGaoPin = useCallback(() => {
    const unstudiedItems = gaoPinList.filter(item => !studiedIds.includes(item.id));
    return unstudiedItems.length > 0 ? unstudiedItems[0] : null;
  }, [gaoPinList, studiedIds]);

  // 完成当前项目学习
  const completeCurrentGaoPin = useCallback((id: string) => {
    markAsStudied(id);
  }, [markAsStudied]);

  // 获取学习进度
  const getLearningProgress = useCallback(() => {
    if (gaoPinList.length === 0) return 0;
    return (studiedIds.length / gaoPinList.length) * 100;
  }, [gaoPinList.length, studiedIds.length]);

  // 检查是否完成学习
  const isLearningComplete = useCallback(() => {
    return gaoPinList.length > 0 && studiedIds.length >= gaoPinList.length;
  }, [gaoPinList.length, studiedIds.length]);

  return {
    // 学习状态
    gaoPinList,
    currentGaoPin,
    loading,
    error,
    learningMode,
    currentCategory,
    currentDifficulty,
    studiedIds,
    
    // 学习操作
    startLearningSession,
    getNextGaoPin,
    completeCurrentGaoPin,
    getLearningProgress,
    isLearningComplete,
    resetLearningState,
    setLearningMode,
    setCurrentCategory,
    setCurrentDifficulty,
  };
} 