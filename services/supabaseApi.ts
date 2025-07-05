import { ChengYuService, UserService, LearningService, FavoriteService, QuizService, AchievementService, RecommendationService, StatisticsService } from './supabaseService';
import { ChengYuRecord, ChengYuApiRecord, UserRecord, LearningRecord, FavoriteRecord, QuizResultRecord, AchievementRecord, UserAchievementRecord, PaginatedResult, handleSupabaseError } from './supabase';

// 统一的API响应格式
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

// 包装API响应
const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

const createErrorResponse = (error: string, code: string = 'UNKNOWN_ERROR'): ApiResponse => ({
  success: false,
  error: {
    code,
    message: error,
  },
  timestamp: new Date().toISOString(),
});

// 智语API类 - 使用Supabase作为数据源
export class JingYuSupabaseAPI {
  // 成语相关API
  idioms = {
    // 获取成语列表
    list: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<ApiResponse<PaginatedResult<ChengYuApiRecord>>> => {
      try {
        const result = await ChengYuService.getIdioms(params);
        return createApiResponse(result, '获取成语列表成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_LIST_ERROR');
      }
    },

    // 获取单个成语
    get: async (id: string): Promise<ApiResponse<ChengYuApiRecord>> => {
      try {
        const result = await ChengYuService.getIdiom(id);
        return createApiResponse(result, '获取成语详情成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_GET_ERROR');
      }
    },

    // 搜索成语
    search: async (params: {
      q: string;
      type?: 'word' | 'pinyin' | 'explanation' | 'derivation';
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<PaginatedResult<ChengYuApiRecord>>> => {
      try {
        const result = await ChengYuService.searchIdioms(params);
        return createApiResponse(result, '搜索成语成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_SEARCH_ERROR');
      }
    },

    // 获取随机成语
    random: async (count: number = 10): Promise<ApiResponse<ChengYuApiRecord[]>> => {
      try {
        const result = await ChengYuService.getRandomIdioms(count);
        return createApiResponse(result, '获取随机成语成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_RANDOM_ERROR');
      }
    },

    // 获取成语首字列表
    firstCharacters: async (): Promise<ApiResponse<string[]>> => {
      try {
        const result = await ChengYuService.getFirstCharacters();
        return createApiResponse(result, '获取成语首字列表成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_FIRST_CHARS_ERROR');
      }
    },

    // 根据首字获取成语
    byFirstChar: async (firstChar: string): Promise<ApiResponse<ChengYuApiRecord[]>> => {
      try {
        const result = await ChengYuService.getIdiomsByFirstChar(firstChar);
        return createApiResponse(result, '获取成语成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'IDIOM_BY_FIRST_CHAR_ERROR');
      }
    },
  };

  // 用户相关API
  users = {
    // 创建用户
    create: async (userData: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserRecord>> => {
      try {
        const result = await UserService.createUser(userData);
        return createApiResponse(result, '创建用户成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'USER_CREATE_ERROR');
      }
    },

    // 获取用户信息
    get: async (id: string): Promise<ApiResponse<UserRecord>> => {
      try {
        const result = await UserService.getUser(id);
        return createApiResponse(result, '获取用户信息成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'USER_GET_ERROR');
      }
    },

    // 更新用户信息
    update: async (id: string, updates: Partial<UserRecord>): Promise<ApiResponse<UserRecord>> => {
      try {
        const result = await UserService.updateUser(id, updates);
        return createApiResponse(result, '更新用户信息成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'USER_UPDATE_ERROR');
      }
    },
  };

  // 学习记录相关API
  learning = {
    // 记录学习行为
    record: async (record: Omit<LearningRecord, 'id' | 'created_at'>): Promise<ApiResponse<LearningRecord>> => {
      try {
        const result = await LearningService.recordLearning(record);
        return createApiResponse(result, '记录学习行为成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'LEARNING_RECORD_ERROR');
      }
    },

    // 获取学习统计
    statistics: async (params: {
      userId: string;
      period?: 'day' | 'week' | 'month' | 'year';
    }): Promise<ApiResponse<{
      totalStudied: number;
      totalTime: number;
      averageTime: number;
      streakDays: number;
      categoryBreakdown: Record<string, number>;
    }>> => {
      try {
        const result = await LearningService.getLearningStatistics(params.userId, params.period);
        return createApiResponse(result, '获取学习统计成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'LEARNING_STATISTICS_ERROR');
      }
    },

    // 获取学习进度
    progress: async (userId: string): Promise<ApiResponse<{
      totalIdioms: number;
      studiedIdioms: number;
      masteredIdioms: number;
      progressPercentage: number;
    }>> => {
      try {
        const result = await LearningService.getLearningProgress(userId);
        return createApiResponse(result, '获取学习进度成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'LEARNING_PROGRESS_ERROR');
      }
    },
  };

  // 收藏相关API
  favorites = {
    // 添加收藏
    add: async (userId: string, idiomId: string): Promise<ApiResponse<FavoriteRecord>> => {
      try {
        const result = await FavoriteService.addFavorite(userId, idiomId);
        return createApiResponse(result, '添加收藏成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'FAVORITE_ADD_ERROR');
      }
    },

    // 移除收藏
    remove: async (userId: string, idiomId: string): Promise<ApiResponse<boolean>> => {
      try {
        const result = await FavoriteService.removeFavorite(userId, idiomId);
        return createApiResponse(result, '移除收藏成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'FAVORITE_REMOVE_ERROR');
      }
    },

    // 获取收藏列表
    list: async (params: {
      userId: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<PaginatedResult<ChengYuRecord>>> => {
      try {
        const result = await FavoriteService.getFavorites(params.userId, {
          page: params.page,
          limit: params.limit,
        });
        return createApiResponse(result, '获取收藏列表成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'FAVORITE_LIST_ERROR');
      }
    },

    // 检查是否已收藏
    check: async (userId: string, idiomId: string): Promise<ApiResponse<boolean>> => {
      try {
        const result = await FavoriteService.isFavorite(userId, idiomId);
        return createApiResponse(result, '检查收藏状态成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'FAVORITE_CHECK_ERROR');
      }
    },
  };

  // 测试相关API
  quiz = {
    // 提交测试结果
    submit: async (result: Omit<QuizResultRecord, 'id' | 'created_at'>): Promise<ApiResponse<QuizResultRecord>> => {
      try {
        const quizResult = await QuizService.submitQuizResult(result);
        return createApiResponse(quizResult, '提交测试结果成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'QUIZ_SUBMIT_ERROR');
      }
    },

    // 获取测试历史
    history: async (params: {
      userId: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<PaginatedResult<QuizResultRecord>>> => {
      try {
        const result = await QuizService.getQuizHistory(params.userId, {
          page: params.page,
          limit: params.limit,
        });
        return createApiResponse(result, '获取测试历史成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'QUIZ_HISTORY_ERROR');
      }
    },

    // 获取测试统计
    statistics: async (userId: string): Promise<ApiResponse<{
      totalQuizzes: number;
      averageScore: number;
      bestScore: number;
      totalTimeSpent: number;
      categoryPerformance: Record<string, number>;
    }>> => {
      try {
        const result = await QuizService.getQuizStatistics(userId);
        return createApiResponse(result, '获取测试统计成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'QUIZ_STATISTICS_ERROR');
      }
    },

    // 生成测试题目
    generate: async (params: {
      type: 'meaning' | 'pinyin' | 'complete' | 'origin';
      count?: number;
      firstChar?: string;
    }): Promise<ApiResponse<any[]>> => {
      try {
        // 根据参数从成语数据库中生成测试题目
        let idioms: ChengYuApiRecord[];
        
        if (params.firstChar) {
          idioms = await ChengYuService.getIdiomsByFirstChar(params.firstChar);
        } else {
          const result = await ChengYuService.getIdioms({
            limit: params.count || 10,
          });
          idioms = result.data;
        }
        
        // 生成题目逻辑（这里简化处理）
        const questions = idioms.slice(0, params.count || 10).map((idiom, index) => ({
          id: `question_${index}`,
          type: params.type,
          idiom,
          // 根据不同类型生成不同的题目格式
          question: this.generateQuestionByType(idiom, params.type),
          options: this.generateOptions(idiom, params.type),
          correctAnswer: 0, // 正确答案索引
        }));

        return createApiResponse(questions, '生成测试题目成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'QUIZ_GENERATE_ERROR');
      }
    },
  };

  // 成就相关API
  achievements = {
    // 获取所有成就
    list: async (category?: 'learning' | 'streak' | 'test' | 'social'): Promise<ApiResponse<AchievementRecord[]>> => {
      try {
        const result = await AchievementService.getAchievements(category);
        return createApiResponse(result, '获取成就列表成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'ACHIEVEMENT_LIST_ERROR');
      }
    },

    // 获取用户成就
    user: async (userId: string): Promise<ApiResponse<UserAchievementRecord[]>> => {
      try {
        const result = await AchievementService.getUserAchievements(userId);
        return createApiResponse(result, '获取用户成就成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'ACHIEVEMENT_USER_ERROR');
      }
    },

    // 更新成就进度
    updateProgress: async (userId: string, achievementId: string, progress: number): Promise<ApiResponse<UserAchievementRecord>> => {
      try {
        const result = await AchievementService.updateAchievementProgress(userId, achievementId, progress);
        return createApiResponse(result, '更新成就进度成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'ACHIEVEMENT_UPDATE_ERROR');
      }
    },
  };

  // 推荐相关API
  recommendations = {
    // 获取推荐成语
    get: async (params: {
      userId: string;
      type?: 'daily' | 'similar' | 'difficulty' | 'category';
    }): Promise<ApiResponse<ChengYuRecord[]>> => {
      try {
        const result = await RecommendationService.getRecommendations(params.userId, params.type);
        return createApiResponse(result, '获取推荐成语成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'RECOMMENDATION_ERROR');
      }
    },
  };

  // 统计相关API
  statistics = {
    // 获取应用统计
    app: async (): Promise<ApiResponse<{
      totalIdioms: number;
      totalUsers: number;
      totalLearningRecords: number;
      totalQuizzes: number;
      popularCategories: Array<{ category: string; count: number }>;
    }>> => {
      try {
        const result = await StatisticsService.getAppStatistics();
        return createApiResponse(result, '获取应用统计成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'STATISTICS_ERROR');
      }
    },
  };

  // 健康检查
  health = {
    check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
      try {
        // 简单的健康检查
        const result = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
        };
        return createApiResponse(result, 'API健康检查成功');
      } catch (error: any) {
        return createErrorResponse(error.message, 'HEALTH_CHECK_ERROR');
      }
    },
  };

  // 私有方法：生成题目
  private generateQuestionByType(idiom: ChengYuApiRecord, type: string): string {
    switch (type) {
      case 'meaning':
        return `"${idiom.idiom}"的意思是什么？`;
      case 'pinyin':
        return `"${idiom.idiom}"的拼音是什么？`;
      case 'complete':
        return `请补全成语：${idiom.idiom.substring(0, 2)}__`;
      case 'origin':
        return `"${idiom.idiom}"的典故出处是什么？`;
      default:
        return `关于成语"${idiom.idiom}"的问题`;
    }
  }

  // 私有方法：生成选项
  private generateOptions(idiom: ChengYuApiRecord, type: string): string[] {
    const correctAnswer = this.getCorrectAnswer(idiom, type);
    const options = [correctAnswer];
    
    // 生成3个错误选项（这里简化处理）
    for (let i = 0; i < 3; i++) {
      options.push(`错误选项${i + 1}`);
    }
    
    // 随机打乱选项
    return options.sort(() => Math.random() - 0.5);
  }

  // 私有方法：获取正确答案
  private getCorrectAnswer(idiom: ChengYuApiRecord, type: string): string {
    switch (type) {
      case 'meaning':
        return idiom.meaning;
      case 'pinyin':
        return idiom.pinyin;
      case 'complete':
        return idiom.idiom;
      case 'origin':
        return idiom.origin;
      default:
        return idiom.meaning;
    }
  }
}

// 导出API实例
export const supabaseApi = new JingYuSupabaseAPI();

// 导出错误处理函数
export const handleApiError = (error: any): string => {
  return handleSupabaseError(error);
};

// 导出类型
export type { ApiResponse, ChengYuRecord, ChengYuApiRecord, UserRecord, LearningRecord, FavoriteRecord, QuizResultRecord, AchievementRecord, UserAchievementRecord, PaginatedResult }; 