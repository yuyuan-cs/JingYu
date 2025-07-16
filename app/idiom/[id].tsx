import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated, Dimensions, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Volume2, BookOpen, Sparkles, Share, Star } from 'lucide-react-native';
import { idioms } from '@/data/idioms';
import { GaoPinApiService } from '@/services/gaoPinApi';
import { ChengYuGaoPinApiRecord, ChengYuApiRecord } from '@/services/supabase';
import { ChengYuService } from '@/services/supabaseService';
import { CacheService } from '@/services/cacheService';
import GaoPinInfo from '@/components/GaoPinInfo';

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

// Enhanced sticker outline text component
const OutlinedText = ({ children, style, outlineColor = '#FFFFFF', outlineWidth = 1 }: {
  children: React.ReactNode;
  style?: any;
  outlineColor?: string;
  outlineWidth?: number;
}) => {
  const outlineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

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
      <Text style={style}>{children}</Text>
    </View>
  );
};

export default function IdiomDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorited, setIsFavorited] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [gaoPinInfo, setGaoPinInfo] = useState<ChengYuGaoPinApiRecord | null>(null);
  const [isLoadingGaoPin, setIsLoadingGaoPin] = useState(false);
  const [idiom, setIdiom] = useState<ChengYuApiRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 首先尝试从本地数据查找
  const localIdiom = idioms.find(item => item.id === id);

  // 加载成语数据
  useEffect(() => {
    const loadIdiom = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 首先尝试从本地数据查找
        if (localIdiom) {
          setIdiom({
            id: localIdiom.id,
            idiom: localIdiom.idiom,
            pinyin: localIdiom.pinyin,
            meaning: localIdiom.meaning,
            origin: localIdiom.origin,
            example: localIdiom.example,
            abbreviation: '',
            pinyin_r: '',
            first: '',
            last: '',
            category: localIdiom.category,
            similar: localIdiom.similar,
            difficulty: localIdiom.difficulty,
          } as any);
          return;
        }
        
        // 尝试从缓存获取
        const cached = await CacheService.get<ChengYuApiRecord>('idiom_details', { id });
        if (cached) {
          setIdiom({
            ...cached,
            category: '传统成语', // 默认分类
            similar: [], // 默认空数组
            difficulty: 'medium' as const, // 默认难度
          } as any);
          return;
        }
        
        // 如果本地数据没有找到，尝试从 Supabase 获取
        const supabaseIdiom = await ChengYuService.getIdiom(id as string);
        const idiomWithDefaults = {
          ...supabaseIdiom,
          category: '传统成语', // 默认分类
          similar: [], // 默认空数组
          difficulty: 'medium' as const, // 默认难度
        } as any;
        
        setIdiom(idiomWithDefaults);
        
        // 缓存结果
        await CacheService.set('idiom_details', { id }, supabaseIdiom);
      } catch (error: any) {
        console.error('加载成语失败:', error);
        setError(error.message || '成语未找到');
      } finally {
        setIsLoading(false);
      }
    };

    loadIdiom();
  }, [id, localIdiom]);

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 查询高频词信息
  useEffect(() => {
    const fetchGaoPinInfo = async () => {
      if (!idiom?.idiom) return;
      
      try {
        setIsLoadingGaoPin(true);
        
        // 尝试从缓存获取高频词信息
        const cached = await CacheService.get<ChengYuGaoPinApiRecord>('gaopin_info', { 
          idiom: idiom.idiom 
        });
        
        if (cached) {
          setGaoPinInfo(cached);
          return;
        }
        
        const gaoPinData = await GaoPinApiService.getGaoPinByIdiomName(idiom.idiom);
        setGaoPinInfo(gaoPinData);
        
        // 缓存高频词信息（即使为空也缓存，避免重复查询）
        await CacheService.set('gaopin_info', { 
          idiom: idiom.idiom 
        }, gaoPinData);
      } catch (error) {
        console.error('查询高频词信息失败:', error);
        // 不显示错误信息，因为大多数成语可能都不是高频词
      } finally {
        setIsLoadingGaoPin(false);
      }
    };

    fetchGaoPinInfo();
  }, [idiom?.idiom]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>🔄 加载中...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!idiom || error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>🤔 成语未找到</Text>
          <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.back()}>
            <Text style={styles.backToHomeText}>返回首页</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const toggleFavorite = () => {
    // 收藏动画
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
    
    setIsFavorited(!isFavorited);
  };

  const getCategoryColor = (category: string): [string, string] => {
    const colors: { [key: string]: [string, string] } = {
      '艺术创作': ['#FF6B6B', '#FFE66D'],
      '学习教育': ['#4ECDC4', '#45B7D1'],
      '志向理想': ['#96CEB4', '#FFEAA7'],
      '坚持努力': ['#DDA0DD', '#98D8C8'],
      '医术技艺': ['#F7DC6F', '#BB8FCE'],
    };
    return colors[category] || ['#FF8A80', '#FFD54F'];
  };

  const categoryColors = getCategoryColor((idiom as any).category);

  const renderHeader = () => {
    const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
    
    return (
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={categoryColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: statusBarHeight + SPACING.sm }]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Share size={18} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
                <Heart 
                  size={18} 
                  color="#FFFFFF" 
                  fill={isFavorited ? '#FFFFFF' : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderMainIdiom = () => (
    <View style={styles.mainIdiomContainer}>
      <View style={styles.mainIdiomCard}>
        <View style={styles.idiomTextContainer}>
          <OutlinedText 
            style={[styles.idiomText, { color: categoryColors[0] }]}
            outlineColor="#FFFFFF"
            outlineWidth={1}
          >
            {idiom.idiom}
          </OutlinedText>
          <View style={[styles.idiomUnderline, { backgroundColor: categoryColors[1] }]} />
        </View>

        <View style={styles.pinyinContainer}>
          <Text style={styles.pinyinText}>{idiom.pinyin}</Text>
          <TouchableOpacity 
            style={[styles.pronunciationButton, { backgroundColor: `${categoryColors[0]}15` }]}
            onPress={() => console.log('播放发音:', idiom.idiom)}
          >
            <Volume2 size={16} color={categoryColors[0]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryBadgeContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColors[0]}15`, borderColor: `${categoryColors[0]}40` }]}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColors[0] }]} />
            <Text style={[styles.categoryBadgeText, { color: categoryColors[0] }]}>{(idiom as any).category}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContentSection = (title: string, content: string, emoji: string) => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  const renderSimilarIdioms = () => {
    const similar = (idiom as any).similar || [];
    if (!similar.length) return null;

    return (
      <View style={styles.similarSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>相似成语</Text>
        </View>
        <View style={styles.similarContainer}>
          {similar.map((similarItem: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[styles.similarTag, { backgroundColor: `${categoryColors[0]}10`, borderColor: `${categoryColors[0]}30` }]}
              onPress={() => console.log('Navigate to:', similarItem)}
              activeOpacity={0.7}
            >
              <Text style={[styles.similarText, { color: categoryColors[0] }]}>
                {similarItem}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDifficultyLevel = () => {
    const difficultyColors = {
      easy: '#4ECDC4',
      medium: '#FFE66D',
      hard: '#FF6B6B'
    };
    
    const difficultyLabels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };

    return (
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>难度等级</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[((idiom as any).difficulty || 'medium') as keyof typeof difficultyColors] }]}>
          <Text style={styles.difficultyText}>{difficultyLabels[((idiom as any).difficulty || 'medium') as keyof typeof difficultyLabels]}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={categoryColors[0]} />
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderMainIdiom()}
        
        <View style={styles.contentContainer}>
          {/* 高频词信息 */}
          {gaoPinInfo && (
            <GaoPinInfo 
              gaoPinInfo={gaoPinInfo} 
              themeColors={categoryColors}
            />
          )}
          
          {renderContentSection(
            '释义', 
            idiom.meaning, 
            '📖'
          )}
          
          {renderContentSection(
            '出处', 
            idiom.origin, 
            '📚'
          )}
          
          {renderContentSection(
            '例句', 
            idiom.example, 
            '💡'
          )}

          {renderDifficultyLevel()}
          {renderSimilarIdioms()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  mainIdiomContainer: {
    marginTop: -SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    zIndex: 5,
  },
  mainIdiomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: SPACING.sm,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  idiomTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  idiomText: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 36,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '800',
  },
  idiomUnderline: {
    height: 3,
    width: '60%',
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  pinyinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pinyinText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6C757D',
    letterSpacing: 1,
    fontWeight: '500',
  },
  pronunciationButton: {
    padding: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryBadgeContainer: {
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  categoryDot: {
    width: SPACING.xs,
    height: SPACING.xs,
    borderRadius: SPACING.xs / 2,
  },
  categoryBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
  },
  sectionContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    fontWeight: '400',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  difficultyLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  difficultyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  similarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  similarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  similarTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
  },
  similarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  backToHomeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backToHomeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});