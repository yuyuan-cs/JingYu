import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Volume2, 
  BookOpen, 
  AlertTriangle,
  Shuffle,
  Eye,
  Target,
  CheckCircle
} from 'lucide-react-native';

import { useGaoPin } from '../../hooks/useGaoPin';
import { useLearningRecords } from '../../hooks/useLearningRecords';
import { ChengYuGaoPinApiRecord } from '../../services/supabase';

export default function GaoPinDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    fetchGaoPinById, 
    toggleFavorite, 
    loading, 
    error,
    favoriteIds 
  } = useGaoPin();
  const { recordLearning } = useLearningRecords();

  const [gaoPin, setGaoPin] = useState<ChengYuGaoPinApiRecord | null>(null);
  const [isStudied, setIsStudied] = useState(false);

  useEffect(() => {
    if (id) {
      loadGaoPinDetail();
    }
  }, [id]);

  const loadGaoPinDetail = async () => {
    try {
      const data = await fetchGaoPinById(id);
      if (data) {
        setGaoPin(data);
        // 记录学习行为
        await recordLearning(id, 'view', 0, {
          type: 'gaopin',
          source: 'detail_page',
        }, 'browse');
      } else {
        Alert.alert('错误', '未找到该高频词语');
        router.back();
      }
    } catch (error) {
      console.error('加载详情失败:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = async () => {
    if (!gaoPin) return;
    
    try {
      toggleFavorite(gaoPin.id);
      
      // 记录收藏行为
      await recordLearning(gaoPin.id, 'favorite', 0, {
        type: 'gaopin',
        source: 'detail_page',
        action: favoriteIds.includes(gaoPin.id) ? 'remove' : 'add',
      }, 'favorite');
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  const handleShare = async () => {
    if (!gaoPin) return;

    try {
      const shareContent = `【高频词语】${gaoPin.word}\n\n${gaoPin.explanation}\n\n${gaoPin.example ? `例句：${gaoPin.example}` : ''}\n\n来自智语APP`;
      
      await Share.share({
        message: shareContent,
        title: `分享高频词语：${gaoPin.word}`,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handlePronunciation = () => {
    if (!gaoPin) return;
    // TODO: 实现发音功能
    Alert.alert('发音', `正在播放：${gaoPin.word}`);
  };

  const markAsStudied = async () => {
    if (!gaoPin || isStudied) return;
    
    try {
      setIsStudied(true);
      
      // 记录学习行为
      await recordLearning(gaoPin.id, 'study', 30, {
        type: 'gaopin',
        source: 'detail_page',
        difficulty: gaoPin.difficulty,
        category: gaoPin.category,
      }, 'study');
      
      Alert.alert('学习完成', '已标记为已学习！');
    } catch (error) {
      console.error('标记学习失败:', error);
      setIsStudied(false);
    }
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>加载中...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载详情...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !gaoPin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>错误</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '未找到该高频词语'}</Text>
          <TouchableOpacity onPress={loadGaoPinDetail} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>高频词语</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavorite} style={styles.headerAction}>
            <Heart 
              size={24} 
              color={favoriteIds.includes(gaoPin.id) ? '#ff4757' : '#666'} 
              fill={favoriteIds.includes(gaoPin.id) ? '#ff4757' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
            <Share2 size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 主要信息卡片 */}
        <View style={styles.mainCard}>
          <View style={styles.wordHeader}>
            <View style={styles.wordInfo}>
              <Text style={styles.word}>{gaoPin.word}</Text>
              <View style={styles.wordMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(gaoPin.difficulty) }]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(gaoPin.difficulty)}
                  </Text>
                </View>
                {gaoPin.category !== '未分类' && (
                  <View style={styles.categoryBadge}>
                    <BookOpen size={12} color="#666" />
                    <Text style={styles.categoryText}>{gaoPin.category}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={handlePronunciation} style={styles.pronunciationButton}>
              <Volume2 size={20} color="#3498db" />
            </TouchableOpacity>
          </View>

          {/* 解释 */}
          {gaoPin.explanation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>释义</Text>
              <Text style={styles.explanation}>{gaoPin.explanation}</Text>
            </View>
          )}

          {/* 例句 */}
          {gaoPin.example && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>例句</Text>
              <Text style={styles.example}>{gaoPin.example}</Text>
            </View>
          )}
        </View>

        {/* 易混淆词语 */}
        {gaoPin.confusableWord && gaoPin.confusableWord.trim() !== '' && gaoPin.confusableWord.trim() !== '无' && (
          <View style={styles.confusionCard}>
            <View style={styles.confusionHeader}>
              <Shuffle size={16} color="#ff6b6b" />
              <Text style={styles.confusionTitle}>易混淆词语</Text>
            </View>
            <View style={styles.confusionContent}>
              <Text style={styles.confusableWord}>{gaoPin.confusableWord}</Text>
              {gaoPin.confusionExplanation && gaoPin.confusionExplanation.trim() !== '' && gaoPin.confusionExplanation.trim() !== '无' && (
                <Text style={styles.confusionExplanation}>
                  {gaoPin.confusionExplanation}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* 易错场景 */}
        {gaoPin.errorProneScenario && gaoPin.errorProneScenario.trim() !== '' && gaoPin.errorProneScenario.trim() !== '无' && (
          <View style={styles.errorProneCard}>
            <View style={styles.errorProneHeader}>
              <AlertTriangle size={16} color="#ffa502" />
              <Text style={styles.errorProneTitle}>易错场景</Text>
            </View>
            <Text style={styles.errorProneText}>
              {gaoPin.errorProneScenario}
            </Text>
          </View>
        )}

        {/* 标签 */}
        {gaoPin.tags.length > 0 && (
          <View style={styles.tagsCard}>
            <Text style={styles.tagsTitle}>标签</Text>
            <View style={styles.tagsContainer}>
              {gaoPin.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 学习操作 */}
        <View style={styles.actionCard}>
          <TouchableOpacity 
            style={[styles.studyButton, isStudied && styles.studiedButton]}
            onPress={markAsStudied}
            disabled={isStudied}
          >
            {isStudied ? (
              <>
                <CheckCircle size={20} color="#2ed573" />
                <Text style={styles.studiedButtonText}>已学习</Text>
              </>
            ) : (
              <>
                <Eye size={20} color="#fff" />
                <Text style={styles.studyButtonText}>标记为已学习</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/quiz')}
          >
            <Target size={20} color="#fff" />
            <Text style={styles.testButtonText}>开始测试</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
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
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  mainCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  wordInfo: {
    flex: 1,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  wordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  pronunciationButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  example: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  confusionCard: {
    backgroundColor: '#ffeaa7',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fdcb6e',
  },
  confusionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confusionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d63031',
    marginLeft: 8,
  },
  confusionContent: {
    marginLeft: 24,
  },
  confusableWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  confusionExplanation: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  errorProneCard: {
    backgroundColor: '#fdcb6e',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e17055',
  },
  errorProneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorProneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e17055',
    marginLeft: 8,
  },
  errorProneText: {
    fontSize: 14,
    color: '#2d3436',
    lineHeight: 20,
    marginLeft: 24,
  },
  tagsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e74c3c',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studyButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  studiedButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#2ed573',
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  studiedButtonText: {
    color: '#2ed573',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 