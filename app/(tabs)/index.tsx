import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions, ScrollView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Volume2, BookOpenCheck, Target, Flame, Star, RefreshCw } from 'lucide-react-native';
import IdiomCard from '@/components/IdiomCard';
import { useSupabaseRandomIdioms, useSupabaseIdioms } from '@/hooks/useSupabaseApi';
import { ChengYuApiRecord } from '@/services/supabaseApi';

const { width, height } = Dimensions.get('window');

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

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [todayIdiom, setTodayIdiom] = useState<ChengYuApiRecord | null>(null);
  const [studyStreak, setStudyStreak] = useState(5);
  const [totalLearned, setTotalLearned] = useState(12);
  const [todayProgress, setTodayProgress] = useState(3);
  const [dailyGoal] = useState(5);

  // 使用 Supabase hooks 获取数据
  const { data: randomIdioms, loading: randomLoading } = useSupabaseRandomIdioms(1);
  const { data: recentIdioms, loading: recentLoading } = useSupabaseIdioms();

  useEffect(() => {
    // 设置今日成语
    if (randomIdioms && randomIdioms.length > 0) {
      setTodayIdiom(randomIdioms[0]);
    }
  }, [randomIdioms]);

  const handleIdiomPress = (idiomId: string) => {
    router.push(`/idiom/${idiomId}`);
  };

  const toggleFavorite = (idiomId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(idiomId)) {
        newFavorites.delete(idiomId);
      } else {
        newFavorites.add(idiomId);
      }
      return newFavorites;
    });
  };

  const handleTodayIdiomPress = () => {
    if (todayIdiom) {
      router.push(`/idiom/${todayIdiom.id}`);
    }
  };

  const handleContinueStudy = () => {
    // 增加学习进度
    setTodayProgress(prev => Math.min(prev + 1, dailyGoal));
    if (todayProgress < dailyGoal - 1) {
      setTotalLearned(prev => prev + 1);
    }
    router.push('/search'); // 跳转到学习页面
  };

  const renderTodayIdiomCard = () => {
    if (!todayIdiom) {
      return (
        <View style={styles.todayCardContainer}>
          <View style={styles.todayCard}>
            <View style={styles.todayCardHeader}>
              <Text style={styles.todayLabel}>今日成语</Text>
              <TouchableOpacity 
                style={styles.pronunciationBtn}
                onPress={() => console.log('正在加载...')}
              >
                <RefreshCw size={16} color="#FF6B6B" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.todayIdiomContent}>
              <Text style={styles.todayIdiomText}>加载中...</Text>
              <Text style={styles.todayPinyinText}>Loading...</Text>
              <View style={styles.todayMeaningContainer}>
                <Text style={styles.todayMeaningText}>正在获取今日成语...</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.todayCardContainer}>
        <View style={styles.todayCard}>
          <View style={styles.todayCardHeader}>
            <Text style={styles.todayLabel}>今日成语</Text>
            <TouchableOpacity 
              style={styles.pronunciationBtn}
              onPress={() => console.log('播放发音:', todayIdiom.idiom)}
            >
              <Volume2 size={16} color="#FF6B6B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleTodayIdiomPress} activeOpacity={0.9}>
            <View style={styles.todayIdiomContent}>
              <Text style={styles.todayIdiomText}>{todayIdiom.idiom}</Text>
              <Text style={styles.todayPinyinText}>{todayIdiom.pinyin}</Text>
              
              <View style={styles.todayMeaningContainer}>
                <Text style={styles.todayMeaningText} numberOfLines={2}>
                  {todayIdiom.meaning}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProgressSection = () => (
    <View style={styles.progressSection}>
      <Text style={styles.progressTitle}>学习进度</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FF6B6B' }]}>
            <Flame size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.statNumber}>{studyStreak}</Text>
          <Text style={styles.statLabel}>连续天数</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#4ECDC4' }]}>
            <BookOpenCheck size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.statNumber}>{totalLearned}</Text>
          <Text style={styles.statLabel}>已掌握</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FFE66D' }]}>
            <Target size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.statNumber}>{todayProgress}/{dailyGoal}</Text>
          <Text style={styles.statLabel}>今日目标</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${(todayProgress / dailyGoal) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          今日进度 {todayProgress}/{dailyGoal}
        </Text>
      </View>
    </View>
  );

  const renderCentralButton = () => (
    <View style={styles.centralButtonContainer}>
      <TouchableOpacity 
        style={styles.centralButton}
        onPress={handleContinueStudy}
        activeOpacity={0.8}
      >
        <View style={styles.centralButtonContent}>
          <Star size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.centralButtonText}>继续学习</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>快速学习</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/gaopin')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B6B' }]}>
            <Flame size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.quickActionTitle}>高频词汇</Text>
          <Text style={styles.quickActionSubtitle}>精选常用成语</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/quiz')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
            <Target size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.quickActionTitle}>智能测试</Text>
          <Text style={styles.quickActionSubtitle}>检验学习成果</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>境语</Text>
          <Text style={styles.subtitle}>传承千年智慧，品味成语之美</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderRecentIdioms = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>精选成语</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Text style={styles.seeAllText}>查看更多</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={recentIdioms?.slice(0, 3) || []}
        renderItem={({ item }) => (
          <IdiomCard
            idiom={item}
            onPress={() => handleIdiomPress(item.id)}
            onFavorite={() => toggleFavorite(item.id)}
            isFavorited={favorites.has(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF8A80" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderTodayIdiomCard()}
        {renderProgressSection()}
        {renderCentralButton()}
        {renderQuickActions()}
        {renderRecentIdioms()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
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
  appTitle: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: 6,
    marginBottom: SPACING.xs,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '500',
  },
  todayCardContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  todayLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  pronunciationBtn: {
    backgroundColor: '#F8F8F8',
    padding: SPACING.xs,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  todayIdiomContent: {
    alignItems: 'center',
  },
  todayIdiomText: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 32,
    color: '#1A1A1A',
    letterSpacing: 4,
    marginBottom: SPACING.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  todayPinyinText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6C757D',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  todayMeaningContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  todayMeaningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  progressSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  progressTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {
    width: SPACING.lg,
    height: SPACING.lg,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#495057',
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  progressBarContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressBarBackground: {
    width: '100%',
    height: SPACING.xs,
    backgroundColor: '#E9ECEF',
    borderRadius: SPACING.xs / 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: SPACING.xs / 2,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  centralButtonContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  centralButton: {
    backgroundColor: '#FF6B6B',
    width: width * 0.7,
    height: SPACING.xxl + SPACING.sm,
    borderRadius: SPACING.lg,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: SPACING.sm,
    elevation: 6,
  },
  centralButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  centralButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recentSection: {
    marginHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  quickActionsSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionIcon: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
    textAlign: 'center',
  },
});