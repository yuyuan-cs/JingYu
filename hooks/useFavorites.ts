import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthContext } from './useAuth';
import { useQuickLearningRecord } from './useLearningRecords';

export interface FavoriteRecord {
  id: string;
  user_id: string;
  idiom_id: string;
  tags: string[];
  notes: string;
  review_date: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface FavoriteWithIdiom extends FavoriteRecord {
  idiom: {
    id: string;
    idiom: string;
    pinyin: string;
    meaning: string;
    derivation: string;
    origin: string;
    example: string;
    abbreviation: string;
    pinyin_r: string;
    first: string;
    last: string;
  };
}

export function useFavorites() {
  const { user } = useAuthContext();
  const { recordFavorite } = useQuickLearningRecord();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteWithIdiom[]>([]);

  // 获取用户收藏列表
  const getFavorites = useCallback(async (
    limit: number = 50,
    offset: number = 0,
    tags?: string[]
  ) => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('favorites')
        .select(`
          *,
          idiom:ChengYu!inner(
            id,
            idiom,
            pinyin,
            meaning,
            derivation,
            origin,
            example
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // 如果指定了标签，则过滤
      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      const { data, error } = await query;

      if (error) throw error;

      const result = data || [];
      setFavorites(result);
      return result;
    } catch (err: any) {
      setError(err.message || '获取收藏列表失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 添加收藏
  const addFavorite = useCallback(async (
    idiomId: string,
    tags: string[] = [],
    notes: string = '',
    priority: FavoriteRecord['priority'] = 'medium'
  ) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          idiom_id: idiomId,
          tags,
          notes,
          priority,
        })
        .select(`
          *,
          idiom:ChengYu!inner(
            id,
            idiom,
            pinyin,
            meaning,
            derivation,
            origin,
            example
          )
        `)
        .single();

      if (error) throw error;

      // 记录收藏行为
      await recordFavorite(idiomId, 'add');

      // 更新本地状态
      setFavorites(prev => [data, ...prev]);

      return data;
    } catch (err: any) {
      setError(err.message || '添加收藏失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, recordFavorite]);

  // 移除收藏
  const removeFavorite = useCallback(async (idiomId: string) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('idiom_id', idiomId);

      if (error) throw error;

      // 记录取消收藏行为
      await recordFavorite(idiomId, 'remove');

      // 更新本地状态
      setFavorites(prev => prev.filter(fav => fav.idiom_id !== idiomId));

      return true;
    } catch (err: any) {
      setError(err.message || '移除收藏失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, recordFavorite]);

  // 检查是否已收藏
  const isFavorited = useCallback(async (idiomId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('idiom_id', idiomId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, [user]);

  // 更新收藏信息
  const updateFavorite = useCallback(async (
    favoriteId: string,
    updates: Partial<Pick<FavoriteRecord, 'tags' | 'notes' | 'priority' | 'review_date'>>
  ) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('favorites')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', favoriteId)
        .eq('user_id', user.id)
        .select(`
          *,
          idiom:ChengYu!inner(
            id,
            idiom,
            pinyin,
            meaning,
            derivation,
            origin,
            example
          )
        `)
        .single();

      if (error) throw error;

      // 更新本地状态
      setFavorites(prev => 
        prev.map(fav => fav.id === favoriteId ? data : fav)
      );

      return data;
    } catch (err: any) {
      setError(err.message || '更新收藏失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取收藏统计
  const getFavoriteStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('tags, priority, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // 统计标签使用情况
      const tagCounts = favorites.reduce((acc, fav) => {
        fav.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      // 统计优先级分布
      const priorityCounts = favorites.reduce((acc, fav) => {
        acc[fav.priority] = (acc[fav.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 统计收藏趋势
      const monthlyStats = favorites.reduce((acc, fav) => {
        const month = new Date(fav.created_at).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: favorites.length,
        tagCounts,
        priorityCounts,
        monthlyStats,
      };
    } catch (err: any) {
      setError(err.message || '获取收藏统计失败');
      return null;
    }
  }, [user]);

  // 获取需要复习的收藏
  const getReviewFavorites = useCallback(async () => {
    if (!user) return [];

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          idiom:ChengYu!inner(
            id,
            idiom,
            pinyin,
            meaning,
            derivation,
            origin,
            example
          )
        `)
        .eq('user_id', user.id)
        .lte('review_date', today)
        .not('review_date', 'is', null)
        .order('review_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message || '获取复习列表失败');
      return [];
    }
  }, [user]);

  // 设置复习日期
  const setReviewDate = useCallback(async (favoriteId: string, reviewDate: string) => {
    return updateFavorite(favoriteId, { review_date: reviewDate });
  }, [updateFavorite]);

  // 获取所有使用的标签
  const getAllTags = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('tags')
        .eq('user_id', user.id);

      if (error) throw error;

      const allTags = data.reduce((acc, fav) => {
        fav.tags.forEach((tag: string) => {
          if (!acc.includes(tag)) {
            acc.push(tag);
          }
        });
        return acc;
      }, [] as string[]);

      return allTags.sort();
    } catch (err: any) {
      setError(err.message || '获取标签列表失败');
      return [];
    }
  }, [user]);

  // 初始化加载收藏列表
  useEffect(() => {
    if (user) {
      getFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, getFavorites]);

  return {
    loading,
    error,
    favorites,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    updateFavorite,
    getFavoriteStats,
    getReviewFavorites,
    setReviewDate,
    getAllTags,
  };
}

// 快捷收藏操作 Hook
export function useQuickFavorite() {
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});

  const toggleFavorite = useCallback(async (idiomId: string) => {
    try {
      const isCurrentlyFavorited = await isFavorited(idiomId);
      
      if (isCurrentlyFavorited) {
        await removeFavorite(idiomId);
        setFavoriteStates(prev => ({ ...prev, [idiomId]: false }));
      } else {
        await addFavorite(idiomId);
        setFavoriteStates(prev => ({ ...prev, [idiomId]: true }));
      }
      
      return !isCurrentlyFavorited;
    } catch (error) {
      throw error;
    }
  }, [addFavorite, removeFavorite, isFavorited]);

  const checkFavoriteStatus = useCallback(async (idiomId: string) => {
    const status = await isFavorited(idiomId);
    setFavoriteStates(prev => ({ ...prev, [idiomId]: status }));
    return status;
  }, [isFavorited]);

  return {
    favoriteStates,
    toggleFavorite,
    checkFavoriteStatus,
  };
} 