import { supabase, TABLES } from './supabase';
import { 
  ChengYuGaoPinRecord, 
  ChengYuGaoPinApiRecord, 
  transformGaoPinRecord, 
  transformGaoPinRecords,
  PaginationParams,
  PaginatedResult,
  calculatePagination,
  formatPaginatedResult,
  handleSupabaseError,
  GaoPinCategory,
  GaoPinLearningMode
} from './supabase';

// 高频成语查询参数
export interface GaoPinQueryParams extends PaginationParams {
  category?: string;
  difficulty?: 'high' | 'medium' | 'low';
  hasConfusion?: boolean;
  hasErrorProne?: boolean;
  search?: string;
  tags?: string[];
}

// 高频成语学习参数
export interface GaoPinLearningParams {
  mode: GaoPinLearningMode;
  category?: string;
  difficulty?: 'high' | 'medium' | 'low';
  count?: number;
  excludeIds?: string[];
}

// 高频成语统计信息
export interface GaoPinStats {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  withConfusion: number;
  withErrorProne: number;
}

// 高频成语API服务类
export class GaoPinApiService {
  // 获取高频成语列表
  static async getGaoPinList(params: GaoPinQueryParams = {}): Promise<PaginatedResult<ChengYuGaoPinApiRecord>> {
    try {
      const { page = 1, limit = 20, category, difficulty, hasConfusion, hasErrorProne, search, tags } = params;
      const { from, to } = calculatePagination(page, limit);

      let query = supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*', { count: 'exact' });

      // 分类筛选
      if (category) {
        query = query.eq('Category', category);
      }

      // 易混淆词语筛选
      if (hasConfusion !== undefined) {
        if (hasConfusion) {
          query = query.not('Confusable_Word', 'is', null);
        } else {
          query = query.is('Confusable_Word', null);
        }
      }

      // 易错场景筛选
      if (hasErrorProne !== undefined) {
        if (hasErrorProne) {
          query = query.not('Error Prone Scenario', 'is', null);
        } else {
          query = query.is('Error Prone Scenario', null);
        }
      }

      // 搜索筛选
      if (search) {
        query = query.or(`word.ilike.%${search}%,explanation.ilike.%${search}%,example.ilike.%${search}%`);
      }

      // 分页
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const records = data as ChengYuGaoPinRecord[];
      let transformedRecords = transformGaoPinRecords(records);

      // 难度筛选（在转换后进行，因为难度是计算出来的）
      if (difficulty) {
        transformedRecords = transformedRecords.filter(record => record.difficulty === difficulty);
      }

      // 标签筛选
      if (tags && tags.length > 0) {
        transformedRecords = transformedRecords.filter(record => 
          tags.some(tag => record.tags.includes(tag))
        );
      }

      return formatPaginatedResult(transformedRecords, count, page, limit);
    } catch (error: any) {
      throw new Error(error.message || '获取高频成语列表失败');
    }
  }

  // 根据ID获取高频成语详情
  static async getGaoPinById(id: string): Promise<ChengYuGaoPinApiRecord | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*')
        .eq('word', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 未找到记录
        }
        throw new Error(handleSupabaseError(error));
      }

      return transformGaoPinRecord(data as ChengYuGaoPinRecord);
    } catch (error: any) {
      throw new Error(error.message || '获取高频成语详情失败');
    }
  }

  // 获取随机高频成语
  static async getRandomGaoPin(count: number = 10, excludeIds: string[] = []): Promise<ChengYuGaoPinApiRecord[]> {
    try {
      let query = supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*');

      // 排除指定ID
      if (excludeIds.length > 0) {
        query = query.not('word', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query.limit(count * 3); // 多获取一些用于随机

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const records = data as ChengYuGaoPinRecord[];
      const transformedRecords = transformGaoPinRecords(records);

      // 随机打乱并返回指定数量
      const shuffled = transformedRecords.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    } catch (error: any) {
      throw new Error(error.message || '获取随机高频成语失败');
    }
  }

  // 按学习模式获取高频成语
  static async getGaoPinByLearningMode(params: GaoPinLearningParams): Promise<ChengYuGaoPinApiRecord[]> {
    try {
      const { mode, category, difficulty, count = 10, excludeIds = [] } = params;

      let query = supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*');

      // 排除指定ID
      if (excludeIds.length > 0) {
        query = query.not('word', 'in', `(${excludeIds.join(',')})`);
      }

      // 根据学习模式应用不同的筛选条件
      switch (mode) {
        case GaoPinLearningMode.CATEGORY:
          if (category) {
            query = query.eq('Category', category);
          }
          break;

        case GaoPinLearningMode.CONFUSION:
          query = query.not('Confusable_Word', 'is', null)
                       .neq('Confusable_Word', '')
                       .neq('Confusable_Word', '无');
          break;

        case GaoPinLearningMode.ERROR_PRONE:
          query = query.not('Error Prone Scenario', 'is', null)
                       .neq('Error Prone Scenario', '')
                       .neq('Error Prone Scenario', '无');
          break;

        case GaoPinLearningMode.REVIEW:
          // 复习模式：优先选择有易混淆词语或易错场景的
          query = query.or('Confusable_Word.not.is.null,Error Prone Scenario.not.is.null');
          break;

        case GaoPinLearningMode.RANDOM:
        default:
          // 随机模式，不添加额外筛选
          break;
      }

      const { data, error } = await query.limit(count * 2); // 多获取一些用于筛选

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const records = data as ChengYuGaoPinRecord[];
      let transformedRecords = transformGaoPinRecords(records);

      // 难度筛选
      if (difficulty) {
        transformedRecords = transformedRecords.filter(record => record.difficulty === difficulty);
      }

      // 随机打乱并返回指定数量
      const shuffled = transformedRecords.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    } catch (error: any) {
      throw new Error(error.message || '按学习模式获取高频成语失败');
    }
  }

  // 获取高频成语统计信息
  static async getGaoPinStats(): Promise<GaoPinStats> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*');

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const records = data as ChengYuGaoPinRecord[];
      const transformedRecords = transformGaoPinRecords(records);

      // 统计分类
      const byCategory: Record<string, number> = {};
      transformedRecords.forEach(record => {
        byCategory[record.category] = (byCategory[record.category] || 0) + 1;
      });

      // 统计难度
      const byDifficulty: Record<string, number> = {};
      transformedRecords.forEach(record => {
        byDifficulty[record.difficulty] = (byDifficulty[record.difficulty] || 0) + 1;
      });

      // 统计特殊类型
      const withConfusion = transformedRecords.filter(record => record.confusableWord).length;
      const withErrorProne = transformedRecords.filter(record => record.errorProneScenario).length;

      return {
        total: transformedRecords.length,
        byCategory,
        byDifficulty,
        withConfusion,
        withErrorProne,
      };
    } catch (error: any) {
      throw new Error(error.message || '获取高频成语统计失败');
    }
  }

  // 获取所有分类
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('Category')
        .not('Category', 'is', null);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const categories = [...new Set(data.map(item => item.Category))].filter(Boolean);
      return categories.sort();
    } catch (error: any) {
      throw new Error(error.message || '获取分类列表失败');
    }
  }

  // 获取易混淆词语对
  static async getConfusablePairs(): Promise<{ word: string; confusableWord: string; explanation: string }[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('word, Confusable_Word, Confusion_Explanation')
        .not('Confusable_Word', 'is', null);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return data.map(item => ({
        word: item.word,
        confusableWord: item.Confusable_Word,
        explanation: item.Confusion_Explanation || '',
      }));
    } catch (error: any) {
      throw new Error(error.message || '获取易混淆词语对失败');
    }
  }

  // 搜索高频成语
  static async searchGaoPin(keyword: string, limit: number = 20): Promise<ChengYuGaoPinApiRecord[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHENGYU_GAOPIN)
        .select('*')
        .or(`word.ilike.%${keyword}%,explanation.ilike.%${keyword}%,example.ilike.%${keyword}%,Category.ilike.%${keyword}%`)
        .limit(limit);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const records = data as ChengYuGaoPinRecord[];
      return transformGaoPinRecords(records);
    } catch (error: any) {
      throw new Error(error.message || '搜索高频成语失败');
    }
  }
} 