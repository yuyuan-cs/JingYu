import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://mazslkagknzmoccafzfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1henNsa2Fna256bW9jY2FmemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjQzMTAsImV4cCI6MjA2NzMwMDMxMH0.2-tXHiz01ll_Us86R3qW_ymDxf-ppA-x2hH20t7W6ns';

// Service Role Key (仅用于开发环境的管理员操作)
// 注意：在生产环境中，这应该通过环境变量或安全的后端服务来使用
// 当前密钥无效，需要从 Supabase Dashboard 获取正确的密钥
const supabaseServiceRoleKey = 'INVALID_KEY_PLEASE_UPDATE_FROM_DASHBOARD';

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 创建管理员客户端实例（仅用于开发环境）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 数据库表名
export const TABLES = {
  CHENGYU: 'ChengYu',
  CHENGYU_GAOPIN: 'ChengYu_GaoPin',
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
  email?: string;
  phone?: string;
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

// 高频成语数据类型（基于Supabase ChengYu_GaoPin表的实际结构）
export interface ChengYuGaoPinRecord {
  word: string;  // 成语/词语 (主键)
  Category: string | null;  // 分类
  Confusable_Word: string | null;  // 易混淆词语
  Confusion_Explanation: string | null;  // 混淆解释
  "Error Prone Scenario": string | null;  // 易错场景
  explanation: string | null;  // 解释
  example: string | null;  // 例子
  id: string[] | null;  // ID数组
}

// 高频成语API记录格式
export interface ChengYuGaoPinApiRecord {
  id: string;  // 使用 word 作为 id
  word: string;  // 成语/词语
  category: string;  // 分类
  confusableWord: string;  // 易混淆词语
  confusionExplanation: string;  // 混淆解释
  errorProneScenario: string;  // 易错场景
  explanation: string;  // 解释
  example: string;  // 例子
  difficulty: 'high' | 'medium' | 'low';  // 难度等级（根据易错程度）
  tags: string[];  // 标签（从分类和易错场景提取）
}

// 高频成语分类枚举
export enum GaoPinCategory {
  BUSINESS = '商务用语',
  ACADEMIC = '学术用语',
  DAILY = '日常用语',
  LITERARY = '文学用语',
  FORMAL = '正式用语',
  COLLOQUIAL = '口语用语',
  WRITTEN = '书面用语',
  TECHNICAL = '专业用语',
}

// 高频成语学习模式
export enum GaoPinLearningMode {
  CATEGORY = 'category',  // 按分类学习
  CONFUSION = 'confusion',  // 易混淆词语学习
  ERROR_PRONE = 'error_prone',  // 易错场景学习
  RANDOM = 'random',  // 随机学习
  REVIEW = 'review',  // 复习模式
}

// 数据转换函数：将高频成语数据库记录转换为API记录格式
export const transformGaoPinRecord = (record: ChengYuGaoPinRecord): ChengYuGaoPinApiRecord => {
  // 根据易错场景和混淆词语判断难度
  const getDifficulty = (): 'high' | 'medium' | 'low' => {
    if (record.Confusable_Word && record["Error Prone Scenario"]) return 'high';
    if (record.Confusable_Word || record["Error Prone Scenario"]) return 'medium';
    return 'low';
  };

  // 提取标签
  const getTags = (): string[] => {
    const tags: string[] = [];
    if (record.Category) tags.push(record.Category);
    if (record.Confusable_Word) tags.push('易混淆');
    if (record["Error Prone Scenario"]) tags.push('易错');
    return tags;
  };

  return {
    id: record.word, // 使用 word 作为唯一标识
    word: record.word,
    category: record.Category || '未分类',
    confusableWord: record.Confusable_Word || '',
    confusionExplanation: record.Confusion_Explanation || '',
    errorProneScenario: record["Error Prone Scenario"] || '',
    explanation: record.explanation || '',
    example: record.example || '',
    difficulty: getDifficulty(),
    tags: getTags(),
  };
};

// 批量转换高频成语函数
export const transformGaoPinRecords = (records: ChengYuGaoPinRecord[]): ChengYuGaoPinApiRecord[] => {
  return records.map(transformGaoPinRecord);
}; 