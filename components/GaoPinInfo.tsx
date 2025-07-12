import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, AlertTriangle, Shuffle, BookOpen } from 'lucide-react-native';
import { ChengYuGaoPinApiRecord } from '../services/supabase';

interface GaoPinInfoProps {
  gaoPinInfo: ChengYuGaoPinApiRecord;
  themeColors?: [string, string];
}

const GaoPinInfo: React.FC<GaoPinInfoProps> = ({ 
  gaoPinInfo, 
  themeColors = ['#FF6B6B', '#FFE66D'] 
}) => {
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

  const renderInfoSection = (
    title: string, 
    content: string, 
    icon: React.ReactNode, 
    backgroundColor: string,
    textColor: string = '#721c24'
  ) => {
    if (!content || content.trim() === '' || content.trim() === '无') {
      return null;
    }

    return (
      <View style={[styles.infoSection, { backgroundColor }]}>
        <View style={styles.infoHeader}>
          {icon}
          <Text style={[styles.infoTitle, { color: textColor }]}>{title}</Text>
        </View>
        <Text style={[styles.infoContent, { color: textColor }]}>{content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 高频词标识 */}
      <View style={styles.headerContainer}>
        <View style={[styles.gaoPinBadge, { backgroundColor: `${themeColors[0]}15`, borderColor: `${themeColors[0]}40` }]}>
          <Star size={16} color={themeColors[0]} fill={themeColors[0]} />
          <Text style={[styles.gaoPinBadgeText, { color: themeColors[0] }]}>高频词汇</Text>
        </View>
        
        {/* 难度标识 */}
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(gaoPinInfo.difficulty) }]}>
          <Text style={styles.difficultyText}>
            {getDifficultyText(gaoPinInfo.difficulty)}
          </Text>
        </View>
      </View>

      {/* 分类信息 */}
      {gaoPinInfo.category && gaoPinInfo.category !== '未分类' && (
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: `${themeColors[1]}20`, borderColor: `${themeColors[1]}60` }]}>
            <BookOpen size={14} color={themeColors[1]} />
            <Text style={[styles.categoryText, { color: themeColors[1] }]}>
              {gaoPinInfo.category}
            </Text>
          </View>
        </View>
      )}

      {/* 详细信息部分 */}
      <View style={styles.detailsContainer}>
        {/* 易混淆词语 */}
        {renderInfoSection(
          '易混淆词语',
          gaoPinInfo.confusableWord,
          <Shuffle size={16} color="#856404" />,
          '#fff3cd',
          '#856404'
        )}

        {/* 混淆解释 */}
        {gaoPinInfo.confusionExplanation && gaoPinInfo.confusionExplanation.trim() !== '' && gaoPinInfo.confusionExplanation.trim() !== '无' && (
          <View style={[styles.infoSection, { backgroundColor: '#fff3cd' }]}>
            <Text style={[styles.infoContent, { color: '#856404', fontStyle: 'italic' }]}>
              {gaoPinInfo.confusionExplanation}
            </Text>
          </View>
        )}

        {/* 易错场景 */}
        {renderInfoSection(
          '易错场景',
          gaoPinInfo.errorProneScenario,
          <AlertTriangle size={16} color="#721c24" />,
          '#f8d7da',
          '#721c24'
        )}
      </View>

      {/* 标签 */}
      {gaoPinInfo.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>标签：</Text>
          <View style={styles.tagsList}>
            {gaoPinInfo.tags.map((tag, index) => (
              <View 
                key={index} 
                style={[styles.tag, { backgroundColor: `${themeColors[0]}10`, borderColor: `${themeColors[0]}30` }]}
              >
                <Text style={[styles.tagText, { color: themeColors[0] }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gaoPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  gaoPinBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    gap: 12,
  },
  infoSection: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tagsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default GaoPinInfo; 