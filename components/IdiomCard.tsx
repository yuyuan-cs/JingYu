import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { Heart, Volume2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Idiom } from '@/data/idioms';
import { ChengYuApiRecord } from '@/services/supabaseApi';

interface IdiomCardProps {
  idiom: Idiom | ChengYuApiRecord;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

const { width } = Dimensions.get('window');

// 8px grid system constants
const GRID = 8;
const SPACING = {
  xs: GRID,      // 8px
  sm: GRID * 2,  // 16px
  md: GRID * 3,  // 24px
  lg: GRID * 4,  // 32px
  xl: GRID * 5,  // 40px
};

// Enhanced sticker outline text component
const OutlinedText = ({ children, style, outlineColor = '#FFFFFF', outlineWidth = 2 }: any) => {
  const outlineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  // Generate multiple shadow offsets for a complete outline
  const shadowOffsets = [];
  for (let i = -outlineWidth; i <= outlineWidth; i++) {
    for (let j = -outlineWidth; j <= outlineWidth; j++) {
      if (i !== 0 || j !== 0) {
        shadowOffsets.push({ x: i, y: j });
      }
    }
  }

  return (
    <View style={{ position: 'relative' }}>
      {/* Render outline layers */}
      {shadowOffsets.map((offset, index) => (
        <Text
          key={index}
          style={[
            style,
            outlineStyle,
            {
              color: outlineColor,
              textShadowColor: outlineColor,
              textShadowOffset: { width: offset.x, height: offset.y },
              textShadowRadius: 0,
            }
          ]}
        >
          {children}
        </Text>
      ))}
      {/* Main text on top */}
      <Text style={style}>{children}</Text>
    </View>
  );
};

// 类型保护函数
const isSupabaseIdiom = (idiom: Idiom | ChengYuApiRecord): idiom is ChengYuApiRecord => {
  return 'origin' in idiom && !('category' in idiom);
};

// 统一数据格式的辅助函数
const normalizeIdiom = (idiom: Idiom | ChengYuApiRecord) => {
  if (isSupabaseIdiom(idiom)) {
    return {
      id: idiom.id,
      idiom: idiom.idiom,
      pinyin: idiom.pinyin,
      meaning: idiom.meaning,
      origin: idiom.origin,
      example: idiom.example,
      category: '传统成语', // 默认分类
      similar: [] as string[], // 默认空数组
      difficulty: 'medium' as const,
    };
  }
  return idiom;
};

export default function IdiomCard({ idiom, onPress, onFavorite, isFavorited = false }: IdiomCardProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // 统一数据格式
  const normalizedIdiom = normalizeIdiom(idiom);

  const handlePress = () => {
    // 添加点击动画
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const handleFavorite = () => {
    if (onFavorite) {
      // 添加收藏动画
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      onFavorite();
    }
  };

  const renderMinimalCategory = () => {
    const categoryColors: { [key: string]: string } = {
      '艺术创作': '#FF6B6B',
      '学习教育': '#4ECDC4',
      '志向理想': '#96CEB4',
      '坚持努力': '#DDA0DD',
      '医术技艺': '#F7DC6F',
      '传统成语': '#FF8A80',
    };

    const color = categoryColors[normalizedIdiom.category] || '#FF8A80';
    
    return (
      <View style={[styles.categoryBadge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
        <View style={[styles.categoryDot, { backgroundColor: color }]} />
        <Text style={[styles.categoryText, { color }]}>{normalizedIdiom.category}</Text>
      </View>
    );
  };



  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.card}>
          {/* 顶部分类标签 */}
          <View style={styles.topSection}>
            {renderMinimalCategory()}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.pronunciationButton}
                onPress={() => {
                  // TODO: 实现发音功能
                  console.log('播放发音:', idiom.idiom);
                }}
              >
                <Volume2 size={20} color="#FF6B6B" strokeWidth={2} />
              </TouchableOpacity>
              
              {onFavorite && (
                <TouchableOpacity 
                  style={styles.favoriteButton} 
                  onPress={handleFavorite}
                >
                  <Heart 
                    size={20} 
                    color={isFavorited ? '#FF6B6B' : '#CCCCCC'} 
                    fill={isFavorited ? '#FF6B6B' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 成语主体展示 */}
          <View style={styles.idiomMainSection}>
            <View style={styles.idiomContainer}>
              <OutlinedText 
                style={styles.idiomTextWithOutline}
                outlineColor="#FFFFFF"
                outlineWidth={1}
              >
                {normalizedIdiom.idiom}
              </OutlinedText>
            </View>
            <Text style={styles.pinyinText}>{normalizedIdiom.pinyin}</Text>
          </View>

          {/* 解释区域 - 放在第一位 */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>💡 解释</Text>
            <Text style={styles.meaningText}>{normalizedIdiom.meaning}</Text>
          </View>

          {/* 出处区域 */}
          {normalizedIdiom.origin && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>📚 出处</Text>
              <Text style={styles.detailText}>{normalizedIdiom.origin}</Text>
            </View>
          )}

          {/* 例句区域 */}
          {normalizedIdiom.example && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>📝 例句</Text>
              <Text style={styles.detailText}>{normalizedIdiom.example}</Text>
            </View>
          )}

          {/* 其他信息区域 */}
          {(isSupabaseIdiom(idiom) && (idiom.abbreviation || idiom.pinyin_r || idiom.first || idiom.last)) && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>ℹ️ 其他信息</Text>
              {idiom.abbreviation && (
                <Text style={styles.infoText}>缩写：{idiom.abbreviation}</Text>
              )}
              {idiom.pinyin_r && idiom.pinyin_r !== idiom.pinyin && (
                <Text style={styles.infoText}>拼音2：{idiom.pinyin_r}</Text>
              )}
              {idiom.first && (
                <Text style={styles.infoText}>首字：{idiom.first} | 末字：{idiom.last}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  categoryDot: {
    width: SPACING.xs,
    height: SPACING.xs,
    borderRadius: SPACING.xs / 2,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  pronunciationButton: {
    backgroundColor: '#F8F8F8',
    padding: SPACING.xs,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  favoriteButton: {
    backgroundColor: '#F8F8F8',
    padding: SPACING.xs,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  idiomMainSection: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: '#FAFAFA',
    borderRadius: SPACING.sm,
  },
  idiomContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  idiomTextWithOutline: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 32,
    color: '#1A1A1A',
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '800',
    // Enhanced sticker outline effect using multiple shadows for full contour
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: -2, height: -2 },
    textShadowRadius: 0,
    // Additional shadow layers to create full outline
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
      },
    }),
  },
  pinyinText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
    letterSpacing: 1,
    fontWeight: '500',
  },
  meaningSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  meaningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontWeight: '400',
  },
  detailSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    fontWeight: '400',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 16,
    fontWeight: '400',
    marginBottom: SPACING.xs,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    gap: SPACING.xs,
  },
  expandButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  originSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  exampleSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  similarSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#495057',
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  originText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    fontWeight: '400',
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  similarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  similarTag: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  similarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
});