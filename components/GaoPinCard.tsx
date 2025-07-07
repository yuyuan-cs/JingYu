import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { ChengYuGaoPinApiRecord } from '../services/supabase';
import { 
  AlertTriangle, 
  BookOpen, 
  Tag, 
  Heart, 
  Star, 
  Eye,
  Shuffle
} from 'lucide-react-native';

interface GaoPinCardProps {
  gaoPin: ChengYuGaoPinApiRecord;
  onPress?: (gaoPin: ChengYuGaoPinApiRecord) => void;
  onFavorite?: (gaoPin: ChengYuGaoPinApiRecord) => void;
  isFavorite?: boolean;
  isStudied?: boolean;
  showCategory?: boolean;
  showDifficulty?: boolean;
  showTags?: boolean;
  showConfusion?: boolean;
  showErrorProne?: boolean;
  compact?: boolean;
}

export function GaoPinCard({
  gaoPin,
  onPress,
  onFavorite,
  isFavorite = false,
  isStudied = false,
  showCategory = true,
  showDifficulty = true,
  showTags = true,
  showConfusion = true,
  showErrorProne = true,
  compact = false,
}: GaoPinCardProps) {
  // 难度颜色映射
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  // 难度文本映射
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'high': return '高难度';
      case 'medium': return '中等';
      case 'low': return '简单';
      default: return '未知';
    }
  };

  const handlePress = () => {
    onPress?.(gaoPin);
  };

  const handleFavorite = () => {
    onFavorite?.(gaoPin);
  };

  if (compact) {
    return (
      <Pressable style={[styles.compactCard, isStudied && styles.studiedCard]} onPress={handlePress}>
        <View style={styles.compactHeader}>
          <Text style={[styles.compactWord, isStudied && styles.studiedText]}>
            {gaoPin.word}
          </Text>
          {showDifficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(gaoPin.difficulty) }]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(gaoPin.difficulty)}
              </Text>
            </View>
          )}
        </View>
        
        {gaoPin.explanation && (
          <Text style={[styles.compactExplanation, isStudied && styles.studiedText]} numberOfLines={2}>
            {gaoPin.explanation}
          </Text>
        )}
        
        {showCategory && gaoPin.category !== '未分类' && (
          <View style={styles.compactFooter}>
            <Tag size={12} color="#666" />
            <Text style={styles.compactCategory}>{gaoPin.category}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.card, isStudied && styles.studiedCard]} onPress={handlePress}>
      {/* 头部：词语和操作按钮 */}
      <View style={styles.header}>
        <View style={styles.wordContainer}>
          <Text style={[styles.word, isStudied && styles.studiedText]}>
            {gaoPin.word}
          </Text>
          {showDifficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(gaoPin.difficulty) }]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(gaoPin.difficulty)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actions}>
          {isStudied && (
            <View style={styles.studiedIcon}>
              <Eye size={16} color="#2ed573" />
            </View>
          )}
          <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton}>
            <Heart 
              size={20} 
              color={isFavorite ? '#ff4757' : '#ddd'} 
              fill={isFavorite ? '#ff4757' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 解释 */}
      {gaoPin.explanation && (
        <Text style={[styles.explanation, isStudied && styles.studiedText]}>
          {gaoPin.explanation}
        </Text>
      )}

      {/* 例子 */}
      {gaoPin.example && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>例句：</Text>
          <Text style={[styles.example, isStudied && styles.studiedText]}>
            {gaoPin.example}
          </Text>
        </View>
      )}

      {/* 易混淆词语 */}
      {showConfusion && gaoPin.confusableWord && gaoPin.confusableWord.trim() !== '' && gaoPin.confusableWord.trim() !== '无' && (
        <View style={styles.confusionContainer}>
          <View style={styles.confusionHeader}>
            <Shuffle size={14} color="#ff6b6b" />
            <Text style={styles.confusionLabel}>易混淆：</Text>
          </View>
          <Text style={styles.confusableWord}>
            {gaoPin.confusableWord}
          </Text>
          {gaoPin.confusionExplanation && gaoPin.confusionExplanation.trim() !== '' && gaoPin.confusionExplanation.trim() !== '无' && (
            <Text style={styles.confusionExplanation}>
              {gaoPin.confusionExplanation}
            </Text>
          )}
        </View>
      )}

      {/* 易错场景 */}
      {showErrorProne && gaoPin.errorProneScenario && gaoPin.errorProneScenario.trim() !== '' && gaoPin.errorProneScenario.trim() !== '无' && (
        <View style={styles.errorProneContainer}>
          <View style={styles.errorProneHeader}>
            <AlertTriangle size={14} color="#ffa502" />
            <Text style={styles.errorProneLabel}>易错场景：</Text>
          </View>
          <Text style={styles.errorProneText}>
            {gaoPin.errorProneScenario}
          </Text>
        </View>
      )}

      {/* 底部：分类和标签 */}
      <View style={styles.footer}>
        {showCategory && gaoPin.category !== '未分类' && (
          <View style={styles.categoryContainer}>
            <BookOpen size={12} color="#666" />
            <Text style={styles.category}>{gaoPin.category}</Text>
          </View>
        )}
        
        {showTags && gaoPin.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {gaoPin.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {gaoPin.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{gaoPin.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  studiedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.8,
  },
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 8,
  },
  compactWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  studiedText: {
    color: '#95a5a6',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studiedIcon: {
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  explanation: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 12,
  },
  compactExplanation: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleContainer: {
    marginBottom: 12,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  example: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  confusionContainer: {
    backgroundColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  confusionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  confusionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d63031',
    marginLeft: 4,
  },
  confusableWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  confusionExplanation: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  errorProneContainer: {
    backgroundColor: '#fdcb6e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorProneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorProneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e17055',
    marginLeft: 4,
  },
  errorProneText: {
    fontSize: 14,
    color: '#2d3436',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  compactCategory: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#95a5a6',
    marginLeft: 4,
  },
}); 