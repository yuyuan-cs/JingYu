import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://mazslkagknzmoccafzfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1henNsa2Fna256bW9jY2FmemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjQzMTAsImV4cCI6MjA2NzMwMDMxMH0.2-tXHiz01ll_Us86R3qW_ymDxf-ppA-x2hH20t7W6ns';

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表名
export const TABLES = {
  CHENGYU: 'ChengYu',
  USERS: 'users',
  LEARNING_RECORDS: 'learning_records',
  FAVORITES: 'favorites',
  QUIZ_RESULTS: 'quiz_results',
  ACHIEVEMENTS: 'achievements',
  USER_ACHIEVEMENTS: 'user_achievements',
} as const;

// 成语数据类型（基于Supabase ChengYu表的实际结构）
export interface ChengYuRecord {
  derivation: string;  // 典故/来源 (主键)
  example: string | null;  // 例子
  explanation: string | null;  // 解释
  pinyin: string | null;  // 拼音
  word: string | null;  // 成语
  abbreviation: string | null;  // 缩写
  pinyin_r: string | null;  // 拼音（另一种）
  first: string | null;  // 首字
  last: string | null;  // 末字
}

// 为了保持API兼容性，提供一个转换后的接口
export interface ChengYuApiRecord {
  id: string;  // 使用 derivation 作为 id
  idiom: string;  // 对应 word
  pinyin: string;  // 对应 pinyin
  meaning: string;  // 对应 explanation
  origin: string;  // 对应 derivation
  example: string;  // 对应 example
  abbreviation: string;  // 缩写
  pinyin_r: string;  // 拼音（另一种）
  first: string;  // 首字
  last: string;  // 末字
}

// 用户数据类型
export interface UserRecord {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 学习记录数据类型
export interface LearningRecord {
  id: string;
  user_id: string;
  idiom_id: string;
  action: 'view' | 'study' | 'test' | 'favorite';
  duration: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// 收藏数据类型
export interface FavoriteRecord {
  id: string;
  user_id: string;
  idiom_id: string;
  created_at: string;
}

// 测试结果数据类型
export interface QuizResultRecord {
  id: string;
  user_id: string;
  type: string;
  score: number;
  correct_count: number;
  total_questions: number;
  time_spent: number;
  answers: {
    question_id: string;
    selected_answer: number;
    correct_answer: number;
    correct: boolean;
    time_spent: number;
  }[];
  created_at: string;
}

// 成就数据类型
export interface AchievementRecord {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'streak' | 'test' | 'social';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  color: string;
  reward_type: 'title' | 'badge' | 'feature' | 'item';
  reward_value: string;
  reward_description: string;
  target_value: number;
  created_at: string;
}

// 用户成就数据类型
export interface UserAchievementRecord {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
}

// Supabase错误处理
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  return '数据库操作失败';
};

// 分页参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 分页响应类型
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// 计算分页参数
export const calculatePagination = (page: number = 1, limit: number = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to, page, limit };
};

// 格式化分页结果
export const formatPaginatedResult = <T>(
  data: T[],
  count: number | null,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
};

// 数据转换函数：将数据库记录转换为API记录格式
export const transformChengYuRecord = (record: ChengYuRecord): ChengYuApiRecord => {
  return {
    id: record.derivation, // 使用 derivation 作为唯一标识
    idiom: record.word || '', // 成语
    pinyin: record.pinyin || '', // 拼音
    meaning: record.explanation || '', // 解释
    origin: record.derivation || '', // 典故来源
    example: record.example || '', // 例子
    abbreviation: record.abbreviation || '', // 缩写
    pinyin_r: record.pinyin_r || '', // 拼音（另一种）
    first: record.first || '', // 首字
    last: record.last || '', // 末字
  };
};

// 批量转换函数
export const transformChengYuRecords = (records: ChengYuRecord[]): ChengYuApiRecord[] => {
  return records.map(transformChengYuRecord);
}; 