import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, Award, RotateCcw, CheckCircle, XCircle, ArrowRight, Home, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/useAuth';
import { useQuiz, QuizQuestion, QuizAnswer, QuizStats } from '@/hooks/useQuiz';

const { width } = Dimensions.get('window');

// 8px grid system constants
const GRID = 8;
const SPACING = {
  xs: GRID,      // 8px
  sm: GRID * 2,  // 16px
  md: GRID * 3,  // 24px
  lg: GRID * 4,  // 32px
  xl: GRID * 5,  // 40px
  xxl: GRID * 6, // 48px
};

// Quiz types
const quizTypes = [
  {
    id: 'meaning' as const,
    title: '释义选择',
    description: '根据成语选择正确释义',
    icon: '📖',
    color: '#4ECDC4',
    difficulty: 'easy' as const,
  },
  {
    id: 'pinyin' as const,
    title: '拼音匹配',
    description: '选择成语的正确拼音',
    icon: '🔤',
    color: '#FFE66D',
    difficulty: 'medium' as const,
  },
  {
    id: 'complete' as const,
    title: '成语补全',
    description: '补全缺失的成语字符',
    icon: '🧩',
    color: '#FF6B6B',
    difficulty: 'hard' as const,
  },
  {
    id: 'origin' as const,
    title: '出处典故',
    description: '选择成语的正确出处',
    icon: '📚',
    color: '#96CEB4',
    difficulty: 'hard' as const,
  },
  {
    id: 'mixed' as const,
    title: '综合测试',
    description: '混合多种题型的综合测试',
    icon: '🎯',
    color: '#9B59B6',
    difficulty: 'medium' as const,
  },
];

export default function QuizScreen() {
  const { user } = useAuthContext();
  const { 
    loading, 
    error, 
    currentQuiz, 
    generateQuiz, 
    submitQuizResult,
    getQuizStats 
  } = useQuiz();

  const [currentScreen, setCurrentScreen] = useState<'menu' | 'quiz' | 'result'>('menu');
  const [selectedQuizType, setSelectedQuizType] = useState<typeof quizTypes[0] | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  // 加载测试统计
  useEffect(() => {
    if (user) {
      getQuizStats().then(setQuizStats);
    }
  }, [user, getQuizStats]);

  // 计时器
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (currentScreen === 'quiz' && timeLeft > 0 && !showExplanation) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentScreen === 'quiz') {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, currentScreen, showExplanation]);

  const startQuiz = async (quizType: typeof quizTypes[0]) => {
    if (!user) {
      Alert.alert(
        '需要登录',
        '测试功能需要登录后才能使用',
        [
          { text: '取消', style: 'cancel' },
          { text: '去登录', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    try {
      const questions = await generateQuiz(quizType.id, quizType.difficulty, 10);
      if (questions.length === 0) {
        Alert.alert('错误', '生成测试题目失败，请稍后重试');
        return;
      }

      setSelectedQuizType(quizType);
      setQuestions(questions);
      setCurrentQuestion(0);
      setUserAnswers([]);
      setTimeLeft(questions[0]?.time_limit || 30);
      setQuizStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setCurrentScreen('quiz');
    } catch (error) {
      Alert.alert('错误', '生成测试失败，请稍后重试');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQ.correct_answer;

    const answer: QuizAnswer = {
      question_id: currentQ.id,
      selected_answer: selectedAnswer || 0,
      correct_answer: currentQ.correct_answer,
      correct: isCorrect,
      time_spent: timeSpent,
    };

    const newUserAnswers = [...userAnswers, answer];
    setUserAnswers(newUserAnswers);

    if (!showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(questions[currentQuestion + 1]?.time_limit || 30);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz(newUserAnswers);
    }
  };

  const finishQuiz = async (answers: QuizAnswer[]) => {
    if (!user || !selectedQuizType) return;

    try {
      const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
      await submitQuizResult(selectedQuizType.id, answers, totalTime);
      
      // 刷新统计数据
      const newStats = await getQuizStats();
      setQuizStats(newStats);
      
      setCurrentScreen('result');
    } catch (error) {
      Alert.alert('错误', '提交测试结果失败');
      setCurrentScreen('result');
    }
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setSelectedAnswer(0); // 默认选择第一个选项
    }
    handleNextQuestion();
  };

  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(answer => answer.correct).length;
    return Math.round((correctAnswers / userAnswers.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentScreen('menu');
    setSelectedQuizType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setTimeLeft(30);
    setShowExplanation(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>知识测试</Text>
      <Text style={styles.subtitle}>检验成语学习成果</Text>
      
      {user && quizStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{quizStats.total_quizzes}</Text>
            <Text style={styles.statLabel}>已完成</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{quizStats.average_score}%</Text>
            <Text style={styles.statLabel}>平均分</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{quizStats.best_score}%</Text>
            <Text style={styles.statLabel}>最高分</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderAuthPrompt = () => (
    <View style={styles.authPrompt}>
      <LogIn size={48} color="#3498db" />
      <Text style={styles.authPromptTitle}>登录后开始测试</Text>
      <Text style={styles.authPromptSubtitle}>
        登录账户，保存测试记录和成绩
      </Text>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => router.push('/auth')}
      >
        <Text style={styles.authButtonText}>立即登录</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuizMenu = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {!user && renderAuthPrompt()}
      
      <View style={styles.quizTypesContainer}>
        {quizTypes.map((quizType, index) => (
          <TouchableOpacity
            key={quizType.id}
            style={[
              styles.quizTypeCard,
              { borderColor: quizType.color + '30' }
            ]}
            onPress={() => startQuiz(quizType)}
            disabled={!user || loading}
          >
            <LinearGradient
              colors={[quizType.color + '10', quizType.color + '05']}
              style={styles.quizTypeGradient}
            >
              <View style={styles.quizTypeHeader}>
                <Text style={styles.quizTypeIcon}>{quizType.icon}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: quizType.color + '20' }]}>
                  <Text style={[styles.difficultyText, { color: quizType.color }]}>
                    {quizType.difficulty === 'easy' ? '简单' : 
                     quizType.difficulty === 'medium' ? '中等' : '困难'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.quizTypeTitle}>{quizType.title}</Text>
              <Text style={styles.quizTypeDescription}>{quizType.description}</Text>
              
              <View style={styles.quizTypeActions}>
                <View style={[styles.startButton, { backgroundColor: quizType.color }]}>
                  <Play size={16} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>开始测试</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderQuizScreen = () => {
    if (questions.length === 0) return null;
    
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <View style={styles.quizContainer}>
        {/* Progress Header */}
        <View style={styles.quizHeader}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentQuestion + 1} / {questions.length}
            </Text>
          </View>
          
          <View style={styles.timerContainer}>
            <Clock size={16} color={timeLeft <= 5 ? '#FF6B6B' : '#666666'} />
            <Text style={[
              styles.timerText,
              { color: timeLeft <= 5 ? '#FF6B6B' : '#666666' }
            ]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Question */}
        <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.selectedOption,
                  showExplanation && index === currentQ.correct_answer && styles.correctOption,
                  showExplanation && selectedAnswer === index && index !== currentQ.correct_answer && styles.wrongOption,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.selectedOptionText,
                    showExplanation && index === currentQ.correct_answer && styles.correctOptionText,
                    showExplanation && selectedAnswer === index && index !== currentQ.correct_answer && styles.wrongOptionText,
                  ]}>
                    {option}
                  </Text>
                </View>
                
                {showExplanation && (
                  <View style={styles.optionIcon}>
                    {index === currentQ.correct_answer ? (
                      <CheckCircle size={20} color="#27AE60" />
                    ) : selectedAnswer === index ? (
                      <XCircle size={20} color="#E74C3C" />
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {userAnswers[userAnswers.length - 1]?.correct ? '回答正确！' : '回答错误'}
              </Text>
              <Text style={styles.explanationText}>
                正确答案：{currentQ.options[currentQ.correct_answer]}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Next Button */}
        <View style={styles.quizActions}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedAnswer === null && !showExplanation && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null && !showExplanation}
          >
            <Text style={styles.nextButtonText}>
              {showExplanation ? 
                (currentQuestion === questions.length - 1 ? '完成测试' : '下一题') : 
                '确认答案'
              }
            </Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResultScreen = () => {
    const score = calculateScore();
    const correctCount = userAnswers.filter(a => a.correct).length;
    const totalQuestions = userAnswers.length;
    
    let performanceLevel = '';
    let performanceColor = '';
    let performanceIcon = '';
    
    if (score >= 90) {
      performanceLevel = '优秀';
      performanceColor = '#27AE60';
      performanceIcon = '🏆';
    } else if (score >= 80) {
      performanceLevel = '良好';
      performanceColor = '#F39C12';
      performanceIcon = '🥈';
    } else if (score >= 60) {
      performanceLevel = '及格';
      performanceColor = '#3498DB';
      performanceIcon = '🥉';
    } else {
      performanceLevel = '需要努力';
      performanceColor = '#E74C3C';
      performanceIcon = '📚';
    }

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreIcon}>{performanceIcon}</Text>
          <Text style={styles.scoreTitle}>测试完成</Text>
          <Text style={[styles.scoreValue, { color: performanceColor }]}>{score}分</Text>
          <Text style={[styles.performanceLevel, { color: performanceColor }]}>{performanceLevel}</Text>
          
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreDetailText}>
              答对 {correctCount} 题，共 {totalQuestions} 题
            </Text>
            <Text style={styles.scoreDetailText}>
              正确率：{Math.round((correctCount / totalQuestions) * 100)}%
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetQuiz}
          >
            <RotateCcw size={20} color="#3498DB" />
            <Text style={styles.actionButtonText}>重新测试</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => router.push('/(tabs)')}
          >
            <Home size={20} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>返回首页</Text>
          </TouchableOpacity>
        </View>

        {/* Updated Stats */}
        {user && quizStats && (
          <View style={styles.updatedStatsContainer}>
            <Text style={styles.updatedStatsTitle}>更新后的统计</Text>
            <View style={styles.updatedStatsGrid}>
              <View style={styles.updatedStatItem}>
                <Text style={styles.updatedStatNumber}>{quizStats.total_quizzes}</Text>
                <Text style={styles.updatedStatLabel}>总测试数</Text>
              </View>
              <View style={styles.updatedStatItem}>
                <Text style={styles.updatedStatNumber}>{quizStats.average_score}%</Text>
                <Text style={styles.updatedStatLabel}>平均分</Text>
              </View>
              <View style={styles.updatedStatItem}>
                <Text style={styles.updatedStatNumber}>{quizStats.accuracy_rate}%</Text>
                <Text style={styles.updatedStatLabel}>正确率</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {currentScreen === 'menu' && renderQuizMenu()}
      {currentScreen === 'quiz' && renderQuizScreen()}
      {currentScreen === 'result' && renderResultScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: SPACING.md,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#495057',
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E9ECEF',
  },
  authPrompt: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  authPromptTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  authPromptSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
  },
  authButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quizTypesContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  quizTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quizTypeGradient: {
    flex: 1,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
  },
  quizTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizTypeIcon: {
    fontSize: 24,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: SPACING.xs,
  },
  difficultyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quizTypeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  quizTypeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: SPACING.xs,
  },
  quizTypeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
  },
  quizContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  progressContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  timerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },
  selectedOption: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC415',
  },
  correctOption: {
    borderColor: '#28A745',
    backgroundColor: '#28A74515',
  },
  wrongOption: {
    borderColor: '#DC3545',
    backgroundColor: '#DC354515',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
    marginRight: SPACING.sm,
    width: 30,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#4ECDC4',
  },
  correctOptionText: {
    color: '#28A745',
  },
  wrongOptionText: {
    color: '#DC3545',
  },
  optionIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  explanationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    lineHeight: 20,
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  nextButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultContainer: {
    paddingHorizontal: SPACING.md,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scoreIcon: {
    fontSize: 48,
    marginBottom: SPACING.xs,
  },
  scoreTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#495057',
    fontWeight: '700',
  },
  performanceLevel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  scoreDetails: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  scoreDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: SPACING.xs / 2,
  },
  resultActions: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  primaryActionButton: {
    backgroundColor: '#495057',
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
  },
  updatedStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  updatedStatsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  updatedStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  updatedStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  updatedStatNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  updatedStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
});