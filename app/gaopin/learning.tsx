import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Volume2, 
  RotateCcw,
  CheckCircle,
  X,
  Eye,
  Target
} from 'lucide-react-native';

import { useGaoPinLearning } from '../../hooks/useGaoPin';
import { useLearningRecords } from '../../hooks/useLearningRecords';
import { ChengYuGaoPinApiRecord } from '../../services/supabase';

const { width } = Dimensions.get('window');

export default function GaoPinLearningPage() {
  const router = useRouter();
  const {
    gaoPinList,
    loading,
    error,
    studiedIds,
    getNextGaoPin,
    completeCurrentGaoPin,
    getLearningProgress,
    isLearningComplete,
    resetLearningState,
  } = useGaoPinLearning();

  const { recordLearning } = useLearningRecords();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [slideAnim] = useState(new Animated.Value(0));

  const currentGaoPin = gaoPinList[currentIndex];

  useEffect(() => {
    if (gaoPinList.length === 0) {
      Alert.alert('提示', '没有可学习的内容', [
        { text: '返回', onPress: () => router.back() }
      ]);
    }
  }, [gaoPinList]);

  useEffect(() => {
    // 重置动画
    slideAnim.setValue(0);
    setShowAnswer(false);
  }, [currentIndex]);

  const handleBack = () => {
    Alert.alert(
      '确认退出',
      '确定要退出学习吗？进度将会保存。',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => router.back() }
      ]
    );
  };

  const handleNext = async () => {
    if (!currentGaoPin) return;

    // 标记当前项目为已学习
    completeCurrentGaoPin(currentGaoPin.id);

    // 记录学习行为
    try {
      await recordLearning(currentGaoPin.id, 'study', 60, {
        type: 'gaopin',
        source: 'learning_page',
        difficulty: currentGaoPin.difficulty,
        category: currentGaoPin.category,
        showedAnswer: showAnswer,
      }, 'study');
    } catch (error) {
      console.error('记录学习失败:', error);
    }

    // 移到下一个
    if (currentIndex < gaoPinList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      animateSlide();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      animateSlide();
    }
  };

  const handleComplete = () => {
    const progress = getLearningProgress();
    Alert.alert(
      '学习完成！',
      `恭喜您完成了本次学习！\n学习进度：${progress.toFixed(1)}%`,
      [
        { text: '继续学习', onPress: resetAndContinue },
        { text: '返回主页', onPress: () => router.push('/') }
      ]
    );
  };

  const resetAndContinue = () => {
    resetLearningState();
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const animateSlide = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
  };

  const handlePronunciation = () => {
    if (!currentGaoPin) return;
    // TODO: 实现发音功能
    Alert.alert('发音', `正在播放：${currentGaoPin.word}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'high': return '高难度';
      case 'medium': return '中等';
      case 'low': return '简单';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载学习内容...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || gaoPinList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '没有可学习的内容'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backToHomeButton}>
            <Text style={styles.backToHomeButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGaoPin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>学习内容加载失败</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backToHomeButton}>
            <Text style={styles.backToHomeButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = getLearningProgress();
  const isStudied = studiedIds.includes(currentGaoPin.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {gaoPinList.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / gaoPinList.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <TouchableOpacity onPress={handleComplete} style={styles.completeButton}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 学习卡片 */}
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10],
              }),
            }],
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            }),
          }
        ]}
      >
        <View style={styles.card}>
          {/* 卡片头部 */}
          <View style={styles.cardHeader}>
            <View style={styles.wordContainer}>
              <Text style={styles.word}>{currentGaoPin.word}</Text>
              <View style={styles.wordMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentGaoPin.difficulty) }]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(currentGaoPin.difficulty)}
                  </Text>
                </View>
                {isStudied && (
                  <View style={styles.studiedBadge}>
                    <CheckCircle size={16} color="#2ed573" />
                    <Text style={styles.studiedText}>已学习</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={handlePronunciation} style={styles.actionButton}>
                <Volume2 size={20} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => toggleFavorite(currentGaoPin.id)} 
                style={styles.actionButton}
              >
                <Heart 
                  size={20} 
                  color={favoriteIds.includes(currentGaoPin.id) ? '#ff4757' : '#666'} 
                  fill={favoriteIds.includes(currentGaoPin.id) ? '#ff4757' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 卡片内容 */}
          <View style={styles.cardContent}>
            {/* 问题区域 */}
            <View style={styles.questionArea}>
              <Text style={styles.questionLabel}>这个词语的含义是什么？</Text>
              <TouchableOpacity 
                style={styles.showAnswerButton}
                onPress={toggleAnswer}
              >
                <Eye size={16} color="#3498db" />
                <Text style={styles.showAnswerText}>
                  {showAnswer ? '隐藏答案' : '显示答案'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 答案区域 */}
            {showAnswer && (
              <View style={styles.answerArea}>
                {/* 解释 */}
                {currentGaoPin.explanation && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>释义</Text>
                    <Text style={styles.answerText}>{currentGaoPin.explanation}</Text>
                  </View>
                )}

                {/* 例句 */}
                {currentGaoPin.example && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>例句</Text>
                    <Text style={styles.exampleText}>{currentGaoPin.example}</Text>
                  </View>
                )}

                {/* 易混淆词语 */}
                {currentGaoPin.confusableWord && currentGaoPin.confusableWord.trim() !== '' && currentGaoPin.confusableWord.trim() !== '无' && (
                  <View style={styles.confusionSection}>
                    <Text style={styles.confusionLabel}>易混淆：{currentGaoPin.confusableWord}</Text>
                    {currentGaoPin.confusionExplanation && currentGaoPin.confusionExplanation.trim() !== '' && currentGaoPin.confusionExplanation.trim() !== '无' && (
                      <Text style={styles.confusionExplanation}>
                        {currentGaoPin.confusionExplanation}
                      </Text>
                    )}
                  </View>
                )}

                {/* 易错场景 */}
                {currentGaoPin.errorProneScenario && currentGaoPin.errorProneScenario.trim() !== '' && currentGaoPin.errorProneScenario.trim() !== '无' && (
                  <View style={styles.errorProneSection}>
                    <Text style={styles.errorProneLabel}>易错场景</Text>
                    <Text style={styles.errorProneText}>
                      {currentGaoPin.errorProneScenario}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* 底部操作 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handlePrevious}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={20} color={currentIndex === 0 ? '#ccc' : '#333'} />
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
            上一个
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === gaoPinList.length - 1 ? '完成学习' : '下一个'}
          </Text>
          {currentIndex < gaoPinList.length - 1 && (
            <ArrowRight size={20} color="#fff" />
          )}
          {currentIndex === gaoPinList.length - 1 && (
            <Target size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  completeButton: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 400,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  wordContainer: {
    flex: 1,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  wordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  studiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2ed573',
  },
  studiedText: {
    fontSize: 12,
    color: '#2ed573',
    marginLeft: 4,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardContent: {
    flex: 1,
  },
  questionArea: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  showAnswerText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  answerArea: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 20,
  },
  answerSection: {
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  exampleText: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  confusionSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  confusionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  confusionExplanation: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  errorProneSection: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorProneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 4,
  },
  errorProneText: {
    fontSize: 14,
    color: '#721c24',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  backToHomeButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 