import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthContext } from './useAuth';
import { useQuickLearningRecord } from './useLearningRecords';

export interface QuizQuestion {
  id: string;
  idiom_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  type: 'meaning' | 'pinyin' | 'complete' | 'origin' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number; // 秒
}

export interface QuizAnswer {
  question_id: string;
  selected_answer: number;
  correct_answer: number;
  correct: boolean;
  time_spent: number;
}

export interface QuizResult {
  id: string;
  user_id: string;
  type: string;
  score: number;
  correct_count: number;
  total_questions: number;
  time_spent: number;
  answers: QuizAnswer[];
  created_at: string;
}

export interface QuizStats {
  total_quizzes: number;
  average_score: number;
  best_score: number;
  total_questions: number;
  correct_answers: number;
  accuracy_rate: number;
  total_time: number;
  favorite_type: string;
}

export function useQuiz() {
  const { user } = useAuthContext();
  const { recordTest } = useQuickLearningRecord();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // 生成测试题目
  const generateQuiz = useCallback(async (
    type: QuizQuestion['type'] = 'mixed',
    difficulty: QuizQuestion['difficulty'] = 'medium',
    count: number = 10
  ): Promise<QuizQuestion[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data: idioms, error: idiomsError } = await supabase
        .from('ChengYu')
        .select('*')
        .limit(count * 2);

      if (idiomsError) throw idiomsError;

      if (!idioms || idioms.length === 0) {
        throw new Error('没有找到成语数据');
      }

      const selectedIdioms = idioms
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      const questions: QuizQuestion[] = selectedIdioms.map((idiom, index) => {
        const questionType = type === 'mixed' ? 
          (['meaning', 'pinyin', 'complete', 'origin'] as const)[Math.floor(Math.random() * 4)] : 
          type;

        return generateQuestion(idiom, questionType, difficulty, index);
      });

      setCurrentQuiz(questions);
      return questions;
    } catch (err: any) {
      setError(err.message || '生成测试失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 生成单个题目
  const generateQuestion = (
    idiom: any,
    type: QuizQuestion['type'],
    difficulty: QuizQuestion['difficulty'],
    index: number
  ): QuizQuestion => {
    const timeLimit = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15;
    let question = '';
    let options: string[] = [];

    switch (type) {
      case 'meaning':
        question = `"${idiom.word}" 的意思是？`;
        options = [
          idiom.explanation || '暂无解释',
          '形容事物发展迅速',
          '比喻做事谨慎小心',
          '指代时间过得很快'
        ];
        break;

      case 'pinyin':
        question = `"${idiom.word}" 的拼音是？`;
        options = [
          idiom.pinyin || '暂无拼音',
          'kuài sù fā zhǎn',
          'jǐn shèn xiǎo xīn',
          'shí jiān fēi shì'
        ];
        break;

      case 'complete':
        const words = idiom.word?.split('') || [];
        if (words.length > 0) {
          const hiddenIndex = Math.floor(Math.random() * words.length);
          const hiddenWord = words[hiddenIndex];
          words[hiddenIndex] = '_';
          question = `请完成成语：${words.join('')}`;
          options = [hiddenWord, '一', '二', '三'];
        } else {
          question = `请完成成语：___`;
          options = ['无', '一', '二', '三'];
        }
        break;

      case 'origin':
        question = `"${idiom.word}" 的出处或典故是？`;
        options = [
          idiom.derivation || '暂无出处',
          '《论语》',
          '《孟子》',
          '《庄子》'
        ];
        break;

      default:
        question = `关于 "${idiom.word}" 的描述，哪个是正确的？`;
        options = [
          idiom.explanation || '暂无解释',
          '形容事物发展迅速',
          '比喻做事谨慎小心',
          '指代时间过得很快'
        ];
    }

    // 随机打乱选项，但保持正确答案在第一个位置的索引
    const correctAnswer = 0;
    const shuffledOptions = [...options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return {
      id: `q_${index}_${Date.now()}`,
      idiom_id: idiom.derivation,
      question,
      options: shuffledOptions,
      correct_answer: correctAnswer,
      type,
      difficulty,
      time_limit: timeLimit,
    };
  };

  // 提交测试结果
  const submitQuizResult = useCallback(async (
    type: string,
    answers: QuizAnswer[],
    totalTime: number
  ): Promise<QuizResult | null> => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setLoading(true);
    setError(null);

    try {
      const correctCount = answers.filter(a => a.correct).length;
      const totalQuestions = answers.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          type,
          score,
          correct_count: correctCount,
          total_questions: totalQuestions,
          time_spent: totalTime,
          answers,
        })
        .select()
        .single();

      if (error) throw error;

      // 记录测试行为
      for (const answer of answers) {
        await recordTest(answer.question_id, answer.correct, 1);
      }

      setQuizResults(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message || '提交测试结果失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, recordTest]);

  // 获取测试历史
  const getQuizHistory = useCallback(async (
    limit: number = 20,
    offset: number = 0
  ): Promise<QuizResult[]> => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const results = data || [];
      setQuizResults(results);
      return results;
    } catch (err: any) {
      setError(err.message || '获取测试历史失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取测试统计
  const getQuizStats = useCallback(async (): Promise<QuizStats | null> => {
    if (!user) return null;

    try {
      const { data: results, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!results || results.length === 0) {
        return {
          total_quizzes: 0,
          average_score: 0,
          best_score: 0,
          total_questions: 0,
          correct_answers: 0,
          accuracy_rate: 0,
          total_time: 0,
          favorite_type: '',
        };
      }

      const totalQuizzes = results.length;
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const averageScore = Math.round(totalScore / totalQuizzes);
      const bestScore = Math.max(...results.map(r => r.score));
      const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
      const correctAnswers = results.reduce((sum, r) => sum + r.correct_count, 0);
      const accuracyRate = Math.round((correctAnswers / totalQuestions) * 100);
      const totalTime = results.reduce((sum, r) => sum + r.time_spent, 0);

      // 找出最常用的测试类型
      const typeCounts: Record<string, number> = {};
      results.forEach(r => {
        typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
      });
      
      const favoriteType = Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return {
        total_quizzes: totalQuizzes,
        average_score: averageScore,
        best_score: bestScore,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        accuracy_rate: accuracyRate,
        total_time: totalTime,
        favorite_type: favoriteType,
      };
    } catch (err: any) {
      setError(err.message || '获取测试统计失败');
      return null;
    }
  }, [user]);

  // 初始化加载测试历史
  useEffect(() => {
    if (user) {
      getQuizHistory();
    } else {
      setQuizResults([]);
    }
  }, [user, getQuizHistory]);

  return {
    loading,
    error,
    currentQuiz,
    quizResults,
    generateQuiz,
    submitQuizResult,
    getQuizHistory,
    getQuizStats,
  };
}

// 辅助函数：生成假的解释
function generateFakeExplanation(): string {
  const fakeExplanations = [
    '形容事物发展迅速',
    '比喻做事谨慎小心',
    '指代时间过得很快',
    '形容人品德高尚',
    '比喻学习刻苦努力',
    '形容景色美丽动人',
    '指代友情深厚',
    '比喻工作认真负责',
  ];
  return fakeExplanations[Math.floor(Math.random() * fakeExplanations.length)];
}

// 辅助函数：生成假的拼音
function generateFakePinyin(): string {
  const fakePinyins = [
    'kuài sù fā zhǎn',
    'jǐn shèn xiǎo xīn',
    'shí jiān fēi shì',
    'pǐn dé gāo shàng',
    'xué xí kè kǔ',
    'jǐng sè měi lì',
    'yǒu qíng shēn hòu',
    'gōng zuò rèn zhēn',
  ];
  return fakePinyins[Math.floor(Math.random() * fakePinyins.length)];
}

// 辅助函数：生成随机汉字
function generateRandomChar(): string {
  const chars = '一二三四五六七八九十百千万亿东西南北上下左右前后内外大小多少高低长短新旧好坏美丑';
  return chars[Math.floor(Math.random() * chars.length)];
}

// 辅助函数：生成假的出处
function generateFakeOrigin(): string {
  const fakeOrigins = [
    '《论语》',
    '《孟子》',
    '《庄子》',
    '《史记》',
    '《诗经》',
    '《易经》',
    '《左传》',
    '《战国策》',
  ];
  return fakeOrigins[Math.floor(Math.random() * fakeOrigins.length)];
} 