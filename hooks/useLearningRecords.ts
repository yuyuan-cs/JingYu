import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthContext } from './useAuth';

export interface LearningRecord {
  id: string;
  user_id: string;
  idiom_id: string;
  action: 'view' | 'study' | 'test' | 'favorite';
  duration: number;
  source: 'search' | 'browse' | 'random' | 'test' | 'favorite' | 'study';
  metadata: Record<string, any>;
  created_at: string;
}

export interface LearningStats {
  total_learning_time: number;
  idioms_learned: number;
  favorite_count: number;
  test_count: number;
  streak_days: number;
  last_learning_date: string;
}

export function useLearningRecords() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 记录学习行为
  const recordLearning = useCallback(async (
    idiomId: string,
    action: LearningRecord['action'],
    duration: number = 0,
    metadata: Record<string, any> = {},
    source: LearningRecord['source'] = 'browse'
  ) => {
    if (!user) {
      console.warn('用户未登录，无法记录学习行为');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('learning_records')
        .insert({
          user_id: user.id,
          idiom_id: idiomId,
          action,
          duration,
          source,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      setError(err.message || '记录学习行为失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取学习记录
  const getLearningRecords = useCallback(async (
    limit: number = 50,
    offset: number = 0
  ) => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('learning_records')
        .select(`
          *,
          idiom:ChengYu!inner(
            idiom,
            pinyin,
            meaning,
            derivation
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message || '获取学习记录失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取学习统计
  const getLearningStats = useCallback(async (): Promise<LearningStats | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      // 获取基础统计数据
      const { data: records, error: recordsError } = await supabase
        .from('learning_records')
        .select('action, duration, created_at, idiom_id')
        .eq('user_id', user.id);

      if (recordsError) throw recordsError;

      // 获取收藏数量
      const { count: favoriteCount, error: favoriteError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (favoriteError) throw favoriteError;

      // 计算统计数据
      const totalLearningTime = records.reduce((sum, record) => sum + (record.duration || 0), 0);
      const uniqueIdioms = new Set(records.map(r => r.idiom_id)).size;
      const testCount = records.filter(r => r.action === 'test').length;

      // 计算连续学习天数
      const learningDates = records
        .map(r => new Date(r.created_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streakDays = 0;
      const today = new Date().toDateString();
      
      if (learningDates.length > 0) {
        const lastLearningDate = learningDates[0];
        const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastLearningDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          streakDays = 1;
          for (let i = 1; i < learningDates.length; i++) {
            const currentDate = new Date(learningDates[i - 1]);
            const nextDate = new Date(learningDates[i]);
            const diff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
              streakDays++;
            } else {
              break;
            }
          }
        }
      }

      return {
        total_learning_time: totalLearningTime,
        idioms_learned: uniqueIdioms,
        favorite_count: favoriteCount || 0,
        test_count: testCount,
        streak_days: streakDays,
        last_learning_date: learningDates[0] || '',
      };
    } catch (err: any) {
      setError(err.message || '获取学习统计失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取今日学习记录
  const getTodayLearningRecords = useCallback(async () => {
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('learning_records')
        .select(`
          *,
          idiom:ChengYu!inner(
            idiom,
            pinyin,
            meaning
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message || '获取今日学习记录失败');
      return [];
    }
  }, [user]);

  // 获取学习热力图数据
  const getLearningHeatmap = useCallback(async (days: number = 365) => {
    if (!user) return [];

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await supabase
        .from('learning_records')
        .select('created_at, duration')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // 按日期分组统计
      const heatmapData = data.reduce((acc, record) => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, count: 0, duration: 0 };
        }
        acc[date].count += 1;
        acc[date].duration += record.duration || 0;
        return acc;
      }, {} as Record<string, { date: string; count: number; duration: number }>);

      return Object.values(heatmapData);
    } catch (err: any) {
      setError(err.message || '获取学习热力图数据失败');
      return [];
    }
  }, [user]);

  return {
    loading,
    error,
    recordLearning,
    getLearningRecords,
    getLearningStats,
    getTodayLearningRecords,
    getLearningHeatmap,
  };
}

// 快捷记录函数
export function useQuickLearningRecord() {
  const { recordLearning } = useLearningRecords();

  const recordView = useCallback((idiomId: string, source: LearningRecord['source'] = 'browse') => {
    return recordLearning(idiomId, 'view', 0, { timestamp: Date.now() }, source);
  }, [recordLearning]);

  const recordStudy = useCallback((idiomId: string, duration: number, source: LearningRecord['source'] = 'study') => {
    return recordLearning(idiomId, 'study', duration, { 
      timestamp: Date.now(),
      study_duration: duration 
    }, source);
  }, [recordLearning]);

  const recordTest = useCallback((idiomId: string, correct: boolean, duration: number) => {
    return recordLearning(idiomId, 'test', duration, { 
      timestamp: Date.now(),
      correct,
      test_duration: duration 
    }, 'test');
  }, [recordLearning]);

  const recordFavorite = useCallback((idiomId: string, action: 'add' | 'remove') => {
    return recordLearning(idiomId, 'favorite', 0, { 
      timestamp: Date.now(),
      favorite_action: action 
    }, 'favorite');
  }, [recordLearning]);

  return {
    recordView,
    recordStudy,
    recordTest,
    recordFavorite,
  };
} 