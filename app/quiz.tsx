import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, Award, RotateCcw, CheckCircle, XCircle, ArrowRight, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { idioms } from '@/data/idioms';

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
    id: 'meaning',
    title: '释义选择',
    description: '根据成语选择正确释义',
    icon: '📖',
    color: '#4ECDC4',
    difficulty: 'easy',
  },
  {
    id: 'pinyin',
    title: '拼音匹配',
    description: '选择成语的正确拼音',
    icon: '🔤',
    color: '#FFE66D',
    difficulty: 'medium',
  },
  {
    id: 'complete',
    title: '成语补全',
    description: '补全缺失的成语字符',
    icon: '🧩',
    color: '#FF6B6B',
    difficulty: 'hard',
  },
  {
    id: 'origin',
    title: '出处典故',
    description: '选择成语的正确出处',
    icon: '📚',
    color: '#96CEB4',
    difficulty: 'expert',
  },
];

// Generate quiz questions
const generateQuestions = (type: string, count: number = 5) => {
  const shuffledIdioms = [...idioms].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < Math.min(count, shuffledIdioms.length); i++) {
    const correct = shuffledIdioms[i];
    const others = shuffledIdioms.filter(item => item.id !== correct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    let question;
    switch (type) {
      case 'meaning':
        question = {
          id: i + 1,
          question: `"${correct.idiom}"的释义是？`,
          options: [correct.meaning, ...others.map(item => item.meaning)]
            .sort(() => Math.random() - 0.5),
          correctAnswer: correct.meaning,
          explanation: correct.origin,
        };
        break;
      case 'pinyin':
        question = {
          id: i + 1,
          question: `"${correct.idiom}"的拼音是？`,
          options: [correct.pinyin, ...others.map(item => item.pinyin)]
            .sort(() => Math.random() - 0.5),
          correctAnswer: correct.pinyin,
          explanation: `${correct.idiom} - ${correct.meaning}`,
        };
        break;
      case 'complete':
        const chars = correct.idiom.split('');
        const hiddenIndex = Math.floor(Math.random() * chars.length);
        const incomplete = chars.map((char, index) => 
          index === hiddenIndex ? '？' : char
        ).join('');
        question = {
          id: i + 1,
          question: `请补全成语："${incomplete}"`,
          options: [chars[hiddenIndex], ...others.map(item => 
            item.idiom.split('')[hiddenIndex]
          )].sort(() => Math.random() - 0.5),
          correctAnswer: chars[hiddenIndex],
          explanation: `${correct.idiom} - ${correct.meaning}`,
        };
        break;
      case 'origin':
        question = {
          id: i + 1,
          question: `"${correct.idiom}"出自哪里？`,
          options: [correct.origin.split('》')[0] + '》', 
            ...others.map(item => item.origin.split('》')[0] + '》')]
            .sort(() => Math.random() - 0.5),
          correctAnswer: correct.origin.split('》')[0] + '》',
          explanation: correct.meaning,
        };
        break;
    }
    questions.push(question);
  }

  return questions;
};

export default function QuizScreen() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'quiz' | 'result'>('menu');
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    let timer;
    if (currentScreen === 'quiz' && timeLeft > 0 && !showExplanation) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentScreen === 'quiz') {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, currentScreen, showExplanation]);

  const startQuiz = (quizType) => {
    const quizQuestions = generateQuestions(quizType.id);
    setSelectedQuizType(quizType);
    setQuestions(quizQuestions);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setTimeLeft(60);
    setCurrentScreen('quiz');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = {
      selected: selectedAnswer,
      correct: questions[currentQuestion].correctAnswer,
      isCorrect: selectedAnswer === questions[currentQuestion].correctAnswer,
    };
    setUserAnswers(newUserAnswers);

    if (!showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCurrentScreen('result');
    }
  };

  const handleTimeUp = () => {
    Alert.alert('时间到', '测试时间已结束', [
      { text: '查看结果', onPress: () => setCurrentScreen('result') }
    ]);
  };

  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentScreen('menu');
    setSelectedQuizType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setTimeLeft(60);
    setShowExplanation(false);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#96CEB4', '#4ECDC4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Award size={28} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.headerTitle}>知识测试</Text>
          <Text style={styles.headerSubtitle}>检验你的学习成果</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderQuizMenu = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>选择测试类型</Text>
        <Text style={styles.menuSubtitle}>选择适合你的难度级别</Text>
        
        <View style={styles.quizTypesContainer}>
          {quizTypes.map((quizType) => (
            <TouchableOpacity
              key={quizType.id}
              style={[styles.quizTypeCard, { borderColor: `${quizType.color}40` }]}
              onPress={() => startQuiz(quizType)}
              activeOpacity={0.8}
            >
              <View style={[styles.quizTypeIcon, { backgroundColor: `${quizType.color}15` }]}>
                <Text style={styles.quizTypeEmoji}>{quizType.icon}</Text>
              </View>
              
              <View style={styles.quizTypeInfo}>
                <Text style={styles.quizTypeTitle}>{quizType.title}</Text>
                <Text style={styles.quizTypeDescription}>{quizType.description}</Text>
                
                <View style={styles.quizTypeMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: quizType.color }]}>
                    <Text style={styles.difficultyText}>
                      {quizType.difficulty === 'easy' ? '简单' : 
                       quizType.difficulty === 'medium' ? '中等' :
                       quizType.difficulty === 'hard' ? '困难' : '专家'}
                    </Text>
                  </View>
                  <View style={styles.quizMeta}>
                    <Clock size={14} color="#6C757D" strokeWidth={2} />
                    <Text style={styles.quizMetaText}>5题 · 1分钟</Text>
                  </View>
                </View>
              </View>
              
              <ArrowRight size={20} color="#ADB5BD" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 测试提示</Text>
          <Text style={styles.tipsText}>• 每次测试包含5道题目</Text>
          <Text style={styles.tipsText}>• 建议在安静环境下进行测试</Text>
          <Text style={styles.tipsText}>• 测试结果会记录到学习统计中</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderQuizScreen = () => {
    const question = questions[currentQuestion];
    const isAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === question?.correctAnswer;

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestion + 1}/{questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.timerContainer}>
            <Clock size={16} color={timeLeft <= 10 ? '#FF6B6B' : '#6C757D'} strokeWidth={2} />
            <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextUrgent]}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.questionScrollView}>
          <Text style={styles.questionText}>{question?.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question?.options.map((option, index) => {
              let optionStyle = [styles.optionButton];
              let textStyle = [styles.optionText];
              
              if (showExplanation) {
                if (option === question.correctAnswer) {
                  optionStyle.push(styles.optionCorrect);
                  textStyle.push(styles.optionTextCorrect);
                } else if (option === selectedAnswer && option !== question.correctAnswer) {
                  optionStyle.push(styles.optionIncorrect);
                  textStyle.push(styles.optionTextIncorrect);
                }
              } else if (selectedAnswer === option) {
                optionStyle.push(styles.optionSelected);
                textStyle.push(styles.optionTextSelected);
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => !showExplanation && handleAnswerSelect(option)}
                  disabled={showExplanation}
                >
                  <Text style={textStyle}>{option}</Text>
                  {showExplanation && option === question.correctAnswer && (
                    <CheckCircle size={20} color="#28A745" strokeWidth={2} />
                  )}
                  {showExplanation && option === selectedAnswer && option !== question.correctAnswer && (
                    <XCircle size={20} color="#DC3545" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
              </Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={handleNextQuestion}
          disabled={!isAnswered}
        >
          <Text style={[styles.nextButtonText, !isAnswered && styles.nextButtonTextDisabled]}>
            {showExplanation 
              ? (currentQuestion < questions.length - 1 ? '下一题' : '查看结果')
              : '确认答案'
            }
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderResultScreen = () => {
    const score = calculateScore();
    const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
    
    return (
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.resultContainer}>
          <View style={styles.scoreContainer}>
            <LinearGradient
              colors={score >= 80 ? ['#28A745', '#20C997'] : 
                     score >= 60 ? ['#FFE66D', '#FF8A80'] : 
                     ['#FF6B6B', '#DC3545']}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreText}>{score}分</Text>
            </LinearGradient>
            
            <Text style={styles.scoreTitle}>
              {score >= 80 ? '🎉 优秀！' : 
               score >= 60 ? '👍 良好！' : 
               '💪 继续努力！'}
            </Text>
            <Text style={styles.scoreSubtitle}>
              答对 {correctCount}/{questions.length} 题
            </Text>
          </View>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatNumber}>{correctCount}</Text>
              <Text style={styles.resultStatLabel}>正确</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatNumber}>{questions.length - correctCount}</Text>
              <Text style={styles.resultStatLabel}>错误</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatNumber}>{60 - timeLeft}</Text>
              <Text style={styles.resultStatLabel}>用时(秒)</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => startQuiz(selectedQuizType)}
            >
              <RotateCcw size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>重新测试</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.homeButton]}
              onPress={resetQuiz}
            >
              <Home size={20} color="#495057" strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: '#495057' }]}>返回首页</Text>
            </TouchableOpacity>
          </View>

          {score >= 80 && (
            <View style={styles.achievementContainer}>
              <Text style={styles.achievementTitle}>🏆 解锁成就</Text>
              <Text style={styles.achievementText}>学霸表现 - 测试得分超过80分</Text>
            </View>
          )}
        </View>
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
  headerContainer: {
    marginBottom: SPACING.md,
  },
  headerGradient: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  menuContainer: {
    paddingHorizontal: SPACING.md,
  },
  menuTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quizTypesContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quizTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: SPACING.xs / 2,
    elevation: 2,
  },
  quizTypeIcon: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  quizTypeEmoji: {
    fontSize: 24,
  },
  quizTypeInfo: {
    flex: 1,
  },
  quizTypeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  quizTypeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: SPACING.xs,
  },
  quizTypeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  quizMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '400',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tipsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: SPACING.xs / 2,
  },
  quizContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  progressContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
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
  timerTextUrgent: {
    color: '#FF6B6B',
  },
  questionScrollView: {
    flex: 1,
  },
  questionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  optionSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC415',
  },
  optionCorrect: {
    borderColor: '#28A745',
    backgroundColor: '#28A74515',
  },
  optionIncorrect: {
    borderColor: '#DC3545',
    backgroundColor: '#DC354515',
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#4ECDC4',
  },
  optionTextCorrect: {
    color: '#28A745',
  },
  optionTextIncorrect: {
    color: '#DC3545',
  },
  explanationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: SPACING.sm,
  },
  explanationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
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
  nextButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  nextButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#ADB5BD',
  },
  resultContainer: {
    paddingHorizontal: SPACING.md,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scoreTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  scoreSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
  },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  resultStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  resultActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  achievementContainer: {
    backgroundColor: '#FFE66D15',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE66D40',
    alignItems: 'center',
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  achievementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
    textAlign: 'center',
  },
});