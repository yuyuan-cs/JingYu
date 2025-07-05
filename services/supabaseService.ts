import { supabase, TABLES, ChengYuRecord, ChengYuApiRecord, UserRecord, LearningRecord, FavoriteRecord, QuizResultRecord, AchievementRecord, UserAchievementRecord, handleSupabaseError, PaginationParams, PaginatedResult, calculatePagination, formatPaginatedResult, transformChengYuRecord, transformChengYuRecords } from './supabase';

// 成语服务
export class ChengYuService {
  // 获取成语列表
  static async getIdioms(params?: PaginationParams & {
    search?: string;
  }): Promise<PaginatedResult<ChengYuApiRecord>> {
    try {
      const { page = 1, limit = 20, search } = params || {};
      const { from, to } = calculatePagination(page, limit);

      let query = supabase
        .from(TABLES.CHENGYU)
        .select('*', { count: 'exact' });

      // 添加搜索条件
      if (search) {
        query = query.or(`word.ilike.%${search}%,explanation.ilike.%${search}%,pinyin.ilike.%${search}%,derivation.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(from, to)
        .order('derivation', { ascending: true });

      if (error) throw error;

      // 转换数据格式
      const transformedData = transformChengYuRecords(data || []);
      return formatPaginatedResult(transformedData, count, page, limit);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取单个成语（通过 derivation 作为 id）
  static async getIdiom(id: string): Promise<ChengYuApiRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU)
        .select('*')
        .eq('derivation', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('成语不存在');

      return transformChengYuRecord(data);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 搜索成语
  static async searchIdioms(params: {
    q: string;
    type?: 'word' | 'pinyin' | 'explanation' | 'derivation';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ChengYuApiRecord>> {
    try {
      const { q, type, page = 1, limit = 20 } = params;

      let query = supabase
        .from(TABLES.CHENGYU)
        .select('*', { count: 'exact' });

      // 根据搜索类型构建查询
      switch (type) {
        case 'word':
          query = query.ilike('word', `%${q}%`);
          break;
        case 'pinyin':
          query = query.or(`pinyin.ilike.%${q}%,pinyin_r.ilike.%${q}%`);
          break;
        case 'explanation':
          query = query.ilike('explanation', `%${q}%`);
          break;
        case 'derivation':
          query = query.ilike('derivation', `%${q}%`);
          break;
        default:
          query = query.or(`word.ilike.%${q}%,explanation.ilike.%${q}%,pinyin.ilike.%${q}%,derivation.ilike.%${q}%,pinyin_r.ilike.%${q}%`);
      }

      // 获取所有匹配的数据进行排序
      const { data, error, count } = await query;

      if (error) throw error;

      // 转换数据格式
      let transformedData = transformChengYuRecords(data || []);
      
      // 智能排序算法
      transformedData = this.sortSearchResults(transformedData, q, type);
      
      // 修正：使用排序后的总数，而不是数据库原始count
      const totalResults = transformedData.length;
      
      // 分页处理
      const { from, to } = calculatePagination(page, limit);
      const paginatedData = transformedData.slice(from, to + 1);
      
      return formatPaginatedResult(paginatedData, totalResults, page, limit);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 智能搜索结果排序
  private static sortSearchResults(
    results: ChengYuApiRecord[], 
    query: string, 
    type?: 'word' | 'pinyin' | 'explanation' | 'derivation'
  ): ChengYuApiRecord[] {
    const q = query.toLowerCase();
    
    return results.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, q, type);
      const scoreB = this.calculateRelevanceScore(b, q, type);
      
      // 分数高的排在前面
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // 分数相同时，按成语长度排序（短的优先）
      const lengthDiff = (a.idiom?.length || 0) - (b.idiom?.length || 0);
      if (lengthDiff !== 0) {
        return lengthDiff;
      }
      
      // 最后按字典序排序
      return (a.idiom || '').localeCompare(b.idiom || '');
    });
  }

  // 计算相关性分数
  private static calculateRelevanceScore(
    item: ChengYuApiRecord, 
    query: string, 
    type?: 'word' | 'pinyin' | 'explanation' | 'derivation'
  ): number {
    let score = 0;
    const q = query.toLowerCase();
    
    const word = (item.idiom || '').toLowerCase();
    const pinyin = (item.pinyin || '').toLowerCase();
    const pinyinR = (item.pinyin_r || '').toLowerCase();
    const explanation = (item.meaning || '').toLowerCase();
    const derivation = (item.origin || '').toLowerCase();

    // 成语匹配权重
    if (word === q) score += 1000; // 完全匹配
    else if (word.startsWith(q)) score += 800; // 开头匹配
    else if (word.includes(q)) score += 600; // 包含匹配
    
    // 拼音匹配权重
    if (pinyin === q || pinyinR === q) score += 500; // 拼音完全匹配
    else if (pinyin.startsWith(q) || pinyinR.startsWith(q)) score += 400; // 拼音开头匹配
    else if (pinyin.includes(q) || pinyinR.includes(q)) score += 300; // 拼音包含匹配
    
    // 解释匹配权重
    if (explanation.includes(q)) {
      // 解释中的关键词匹配
      const words = q.split('');
      let explanationScore = 100;
      for (const char of words) {
        if (explanation.includes(char)) {
          explanationScore += 50;
        }
      }
      score += explanationScore;
    }
    
    // 出处匹配权重
    if (derivation.includes(q)) score += 50;

    // 特定类型搜索加权
    if (type) {
      switch (type) {
        case 'word':
          if (word.includes(q)) score += 200;
          break;
        case 'pinyin':
          if (pinyin.includes(q) || pinyinR.includes(q)) score += 200;
          break;
        case 'explanation':
          if (explanation.includes(q)) score += 200;
          break;
        case 'derivation':
          if (derivation.includes(q)) score += 200;
          break;
      }
    }

    // 查询长度奖励（更精确的查询获得更高分数）
    if (q.length >= 2) {
      score += q.length * 10;
    }

    return score;
  }

  // 获取随机成语
  static async getRandomIdioms(count: number = 10): Promise<ChengYuApiRecord[]> {
    try {
      // 由于没有随机函数，我们先获取总数，然后随机选择
      const { count: totalCount, error: countError } = await supabase
        .from(TABLES.CHENGYU)
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const total = totalCount || 0;
      if (total === 0) return [];

      // 随机偏移量
      const randomOffset = Math.floor(Math.random() * Math.max(0, total - count));

      const { data, error } = await supabase
        .from(TABLES.CHENGYU)
        .select('*')
        .range(randomOffset, randomOffset + count - 1);

      if (error) throw error;

      // 转换数据格式
      return transformChengYuRecords(data || []);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取成语首字统计
  static async getFirstCharacters(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU)
        .select('first')
        .not('first', 'is', null);

      if (error) throw error;

      // 去重并返回首字列表
      const firstChars = [...new Set(data?.map(item => item.first).filter(Boolean) || [])];
      return firstChars.sort();
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 根据首字获取成语
  static async getIdiomsByFirstChar(firstChar: string): Promise<ChengYuApiRecord[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU)
        .select('*')
        .eq('first', firstChar)
        .order('derivation', { ascending: true });

      if (error) throw error;

      // 转换数据格式
      return transformChengYuRecords(data || []);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 用户服务
export class UserService {
  // 创建用户
  static async createUser(userData: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<UserRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取用户信息
  static async getUser(id: string): Promise<UserRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('用户不存在');

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 更新用户信息
  static async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 学习记录服务
export class LearningService {
  // 记录学习行为
  static async recordLearning(record: Omit<LearningRecord, 'id' | 'created_at'>): Promise<LearningRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LEARNING_RECORDS)
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取学习统计
  static async getLearningStatistics(userId: string, period?: 'day' | 'week' | 'month' | 'year'): Promise<{
    totalStudied: number;
    totalTime: number;
    averageTime: number;
    streakDays: number;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'day':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString();
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateFilter = yearAgo.toISOString();
          break;
      }

      const { data, error } = await supabase
        .rpc('get_learning_statistics', { 
          user_id: userId, 
          date_filter: dateFilter 
        });

      if (error) throw error;

      return data || {
        totalStudied: 0,
        totalTime: 0,
        averageTime: 0,
        streakDays: 0,
        categoryBreakdown: {},
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取学习进度
  static async getLearningProgress(userId: string): Promise<{
    totalIdioms: number;
    studiedIdioms: number;
    masteredIdioms: number;
    progressPercentage: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_learning_progress', { user_id: userId });

      if (error) throw error;

      return data || {
        totalIdioms: 0,
        studiedIdioms: 0,
        masteredIdioms: 0,
        progressPercentage: 0,
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 收藏服务
export class FavoriteService {
  // 添加收藏
  static async addFavorite(userId: string, idiomId: string): Promise<FavoriteRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .insert({ user_id: userId, idiom_id: idiomId })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 移除收藏
  static async removeFavorite(userId: string, idiomId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.FAVORITES)
        .delete()
        .eq('user_id', userId)
        .eq('idiom_id', idiomId);

      if (error) throw error;

      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取收藏列表
  static async getFavorites(userId: string, params?: PaginationParams): Promise<PaginatedResult<ChengYuRecord>> {
    try {
      const { page = 1, limit = 20 } = params || {};
      const { from, to } = calculatePagination(page, limit);

      const { data, error, count } = await supabase
        .from(TABLES.FAVORITES)
        .select(`
          *,
          idiom:${TABLES.CHENGYU}(*)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const idioms = data?.map(item => item.idiom).filter(Boolean) || [];
      return formatPaginatedResult(idioms, count, page, limit);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 检查是否已收藏
  static async isFavorite(userId: string, idiomId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .select('id')
        .eq('user_id', userId)
        .eq('idiom_id', idiomId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 测试服务
export class QuizService {
  // 提交测试结果
  static async submitQuizResult(result: Omit<QuizResultRecord, 'id' | 'created_at'>): Promise<QuizResultRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.QUIZ_RESULTS)
        .insert(result)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取测试历史
  static async getQuizHistory(userId: string, params?: PaginationParams): Promise<PaginatedResult<QuizResultRecord>> {
    try {
      const { page = 1, limit = 20 } = params || {};
      const { from, to } = calculatePagination(page, limit);

      const { data, error, count } = await supabase
        .from(TABLES.QUIZ_RESULTS)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return formatPaginatedResult(data || [], count, page, limit);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取测试统计
  static async getQuizStatistics(userId: string): Promise<{
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
    categoryPerformance: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_statistics', { user_id: userId });

      if (error) throw error;

      return data || {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        categoryPerformance: {},
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 成就服务
export class AchievementService {
  // 获取所有成就
  static async getAchievements(category?: 'learning' | 'streak' | 'test' | 'social'): Promise<AchievementRecord[]> {
    try {
      let query = supabase
        .from(TABLES.ACHIEVEMENTS)
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query
        .order('difficulty', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 获取用户成就
  static async getUserAchievements(userId: string): Promise<UserAchievementRecord[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .select(`
          *,
          achievement:${TABLES.ACHIEVEMENTS}(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 更新成就进度
  static async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievementRecord> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          progress,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 推荐服务
export class RecommendationService {
  // 获取推荐成语
  static async getRecommendations(userId: string, type?: 'daily' | 'similar' | 'difficulty' | 'category'): Promise<ChengYuRecord[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_recommendations', { 
          user_id: userId, 
          recommendation_type: type || 'daily' 
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// 统计服务
export class StatisticsService {
  // 获取应用统计
  static async getAppStatistics(): Promise<{
    totalIdioms: number;
    totalUsers: number;
    totalLearningRecords: number;
    totalQuizzes: number;
    popularCategories: Array<{ category: string; count: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_app_statistics');

      if (error) throw error;

      return data || {
        totalIdioms: 0,
        totalUsers: 0,
        totalLearningRecords: 0,
        totalQuizzes: 0,
        popularCategories: [],
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
} 