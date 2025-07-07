import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthContext } from './useAuth';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'quiz' | 'favorite' | 'special';
  type: 'count' | 'streak' | 'score' | 'special';
  target_value: number;
  reward_points: number;
  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
  achievement?: Achievement;
}

export interface AchievementStats {
  total_achievements: number;
  unlocked_achievements: number;
  total_points: number;
  completion_rate: number;
  recent_unlocks: UserAchievement[];
  categories: {
    [key: string]: {
      total: number;
      unlocked: number;
      completion_rate: number;
    };
  };
}

export function useAchievements() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);

  // 获取所有成就
  const getAllAchievements = useCallback(async (): Promise<Achievement[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      const achievementList = data || [];
      setAchievements(achievementList);
      return achievementList;
    } catch (err: any) {
      setError(err.message || '获取成就列表失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户成就
  const getUserAchievements = useCallback(async (): Promise<UserAchievement[]> => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userAchievementList = data || [];
      setUserAchievements(userAchievementList);
      return userAchievementList;
    } catch (err: any) {
      setError(err.message || '获取用户成就失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 更新成就进度
  const updateAchievementProgress = useCallback(async (
    achievementId: string,
    progress: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // 检查是否已存在记录
      const { data: existingData, error: existingError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      // 获取成就信息
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (achievementError) throw achievementError;

      const isUnlocked = progress >= achievement.target_value;
      const currentTime = new Date().toISOString();

      if (existingData) {
        // 更新现有记录
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({
            progress,
            is_unlocked: isUnlocked,
            unlocked_at: isUnlocked && !existingData.is_unlocked ? currentTime : existingData.unlocked_at,
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // 创建新记录
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId,
            progress,
            is_unlocked: isUnlocked,
            unlocked_at: isUnlocked ? currentTime : null,
          });

        if (insertError) throw insertError;
      }

      // 刷新用户成就
      await getUserAchievements();

      return isUnlocked && (!existingData || !existingData.is_unlocked);
    } catch (err: any) {
      setError(err.message || '更新成就进度失败');
      return false;
    }
  }, [user, getUserAchievements]);

  // 检查学习相关成就
  const checkLearningAchievements = useCallback(async (
    learningTime: number,
    idiomsLearned: number,
    streakDays: number
  ) => {
    if (!user || achievements.length === 0) return;

    const learningAchievements = achievements.filter(a => a.category === 'learning');
    
    for (const achievement of learningAchievements) {
      let progress = 0;
      
      switch (achievement.id) {
        case 'first_study':
          progress = idiomsLearned > 0 ? 1 : 0;
          break;
        case 'study_10':
          progress = idiomsLearned;
          break;
        case 'study_50':
          progress = idiomsLearned;
          break;
        case 'study_100':
          progress = idiomsLearned;
          break;
        case 'study_500':
          progress = idiomsLearned;
          break;
        case 'study_time_1h':
          progress = Math.floor(learningTime / 3600); // 转换为小时
          break;
        case 'study_time_10h':
          progress = Math.floor(learningTime / 3600);
          break;
        case 'study_time_50h':
          progress = Math.floor(learningTime / 3600);
          break;
      }

      if (progress > 0) {
        await updateAchievementProgress(achievement.id, progress);
      }
    }

    // 检查连续学习成就
    const streakAchievements = achievements.filter(a => a.category === 'streak');
    for (const achievement of streakAchievements) {
      await updateAchievementProgress(achievement.id, streakDays);
    }
  }, [user, achievements, updateAchievementProgress]);

  // 检查测试相关成就
  const checkQuizAchievements = useCallback(async (
    totalQuizzes: number,
    averageScore: number,
    bestScore: number
  ) => {
    if (!user || achievements.length === 0) return;

    const quizAchievements = achievements.filter(a => a.category === 'quiz');
    
    for (const achievement of quizAchievements) {
      let progress = 0;
      
      switch (achievement.id) {
        case 'first_quiz':
          progress = totalQuizzes > 0 ? 1 : 0;
          break;
        case 'quiz_10':
          progress = totalQuizzes;
          break;
        case 'quiz_50':
          progress = totalQuizzes;
          break;
        case 'quiz_100':
          progress = totalQuizzes;
          break;
        case 'perfect_score':
          progress = bestScore >= 100 ? 1 : 0;
          break;
        case 'high_scorer':
          progress = averageScore >= 90 ? 1 : 0;
          break;
        case 'quiz_master':
          progress = averageScore >= 95 ? 1 : 0;
          break;
      }

      if (progress > 0) {
        await updateAchievementProgress(achievement.id, progress);
      }
    }
  }, [user, achievements, updateAchievementProgress]);

  // 检查收藏相关成就
  const checkFavoriteAchievements = useCallback(async (favoriteCount: number) => {
    if (!user || achievements.length === 0) return;

    const favoriteAchievements = achievements.filter(a => a.category === 'favorite');
    
    for (const achievement of favoriteAchievements) {
      let progress = 0;
      
      switch (achievement.id) {
        case 'first_favorite':
          progress = favoriteCount > 0 ? 1 : 0;
          break;
        case 'favorite_10':
          progress = favoriteCount;
          break;
        case 'favorite_50':
          progress = favoriteCount;
          break;
        case 'favorite_100':
          progress = favoriteCount;
          break;
      }

      if (progress > 0) {
        await updateAchievementProgress(achievement.id, progress);
      }
    }
  }, [user, achievements, updateAchievementProgress]);

  // 获取成就统计
  const getAchievementStats = useCallback(async (): Promise<AchievementStats | null> => {
    if (!user) return null;

    try {
      const [allAchievements, userAchievements] = await Promise.all([
        getAllAchievements(),
        getUserAchievements()
      ]);

      const totalAchievements = allAchievements.length;
      const unlockedAchievements = userAchievements.filter(ua => ua.is_unlocked).length;
      const totalPoints = userAchievements
        .filter(ua => ua.is_unlocked)
        .reduce((sum, ua) => sum + (ua.achievement?.reward_points || 0), 0);
      const completionRate = Math.round((unlockedAchievements / totalAchievements) * 100);

      // 最近解锁的成就
      const recentUnlocks = userAchievements
        .filter(ua => ua.is_unlocked && ua.unlocked_at)
        .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
        .slice(0, 5);

      // 按类别统计
      const categories = allAchievements.reduce((acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) {
          acc[category] = { total: 0, unlocked: 0, completion_rate: 0 };
        }
        acc[category].total++;
        
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        if (userAchievement?.is_unlocked) {
          acc[category].unlocked++;
        }
        
        acc[category].completion_rate = Math.round((acc[category].unlocked / acc[category].total) * 100);
        return acc;
      }, {} as Record<string, { total: number; unlocked: number; completion_rate: number }>);

      return {
        total_achievements: totalAchievements,
        unlocked_achievements: unlockedAchievements,
        total_points: totalPoints,
        completion_rate: completionRate,
        recent_unlocks: recentUnlocks,
        categories,
      };
    } catch (err: any) {
      setError(err.message || '获取成就统计失败');
      return null;
    }
  }, [user, getAllAchievements, getUserAchievements]);

  // 获取推荐成就
  const getRecommendedAchievements = useCallback(async (): Promise<UserAchievement[]> => {
    if (!user) return [];

    try {
      const userAchievements = await getUserAchievements();
      
      // 找出未解锁但有进度的成就
      const inProgressAchievements = userAchievements
        .filter(ua => !ua.is_unlocked && ua.progress > 0)
        .sort((a, b) => {
          const aCompletion = a.progress / (a.achievement?.target_value || 1);
          const bCompletion = b.progress / (b.achievement?.target_value || 1);
          return bCompletion - aCompletion;
        })
        .slice(0, 3);

      // 如果进度中的成就不够，添加一些简单的未开始成就
      if (inProgressAchievements.length < 3) {
        const allAchievements = await getAllAchievements();
        const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
        
        const easyAchievements = allAchievements
          .filter(a => !unlockedIds.has(a.id) && a.target_value <= 10)
          .slice(0, 3 - inProgressAchievements.length)
          .map(a => ({
            id: '',
            user_id: user.id,
            achievement_id: a.id,
            progress: 0,
            is_unlocked: false,
            created_at: new Date().toISOString(),
            achievement: a,
          }));

        inProgressAchievements.push(...easyAchievements);
      }

      return inProgressAchievements;
    } catch (err: any) {
      setError(err.message || '获取推荐成就失败');
      return [];
    }
  }, [user, getUserAchievements, getAllAchievements]);

  // 初始化加载
  useEffect(() => {
    getAllAchievements();
    if (user) {
      getUserAchievements();
    }
  }, [user, getAllAchievements, getUserAchievements]);

  return {
    loading,
    error,
    achievements,
    userAchievements,
    getAllAchievements,
    getUserAchievements,
    updateAchievementProgress,
    checkLearningAchievements,
    checkQuizAchievements,
    checkFavoriteAchievements,
    getAchievementStats,
    getRecommendedAchievements,
  };
} 