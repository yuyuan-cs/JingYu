import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Star, Trophy, Crown, Target, Calendar, BookOpen, Flame, Lock, Check, LogIn, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/useAuth';
import { useAchievements, Achievement, UserAchievement, AchievementStats } from '@/hooks/useAchievements';

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

const categories = [
  { id: 'all', name: '全部', icon: Star },
  { id: 'learning', name: '学习', icon: BookOpen },
  { id: 'streak', name: '连击', icon: Flame },
  { id: 'quiz', name: '测试', icon: Target },
  { id: 'favorite', name: '收藏', icon: Award },
  { id: 'special', name: '特殊', icon: Crown },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'learning': return BookOpen;
    case 'streak': return Flame;
    case 'quiz': return Target;
    case 'favorite': return Award;
    case 'special': return Crown;
    default: return Star;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'learning': return '#4ECDC4';
    case 'streak': return '#FF8A80';
    case 'quiz': return '#45B7D1';
    case 'favorite': return '#FFE66D';
    case 'special': return '#DDA0DD';
    default: return '#96CEB4';
  }
};

export default function AchievementsScreen() {
  const { user } = useAuthContext();
  const { 
    loading, 
    error, 
    achievements, 
    userAchievements, 
    getAchievementStats,
    getRecommendedAchievements 
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [recommendedAchievements, setRecommendedAchievements] = useState<UserAchievement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 加载数据
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [stats, recommended] = await Promise.all([
        getAchievementStats(),
        getRecommendedAchievements()
      ]);
      
      setAchievementStats(stats);
      setRecommendedAchievements(recommended);
    } catch (error) {
      console.error('加载成就数据失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 合并成就数据
  const mergedAchievements = achievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      is_unlocked: userAchievement?.is_unlocked || false,
      unlocked_at: userAchievement?.unlocked_at,
    };
  });

  const filteredAchievements = selectedCategory === 'all' 
    ? mergedAchievements 
    : mergedAchievements.filter(achievement => achievement.category === selectedCategory);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FFE66D', '#FF8A80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Award size={28} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>成就系统</Text>
          <Text style={styles.headerSubtitle}>解锁学习徽章，展示你的进步</Text>
          
          {user && achievementStats && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {achievementStats.unlocked_achievements}/{achievementStats.total_achievements} 已解锁
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${achievementStats.completion_rate}%` }
                  ]} 
                />
              </View>
              <Text style={styles.pointsText}>
                🏆 {achievementStats.total_points} 积分
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderAuthPrompt = () => (
    <View style={styles.authPrompt}>
      <LogIn size={48} color="#FFE66D" />
      <Text style={styles.authPromptTitle}>登录查看成就</Text>
      <Text style={styles.authPromptSubtitle}>
        登录账户，解锁成就系统，记录你的学习成果
      </Text>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => router.push('/auth')}
      >
        <Text style={styles.authButtonText}>立即登录</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsOverview = () => {
    if (!user || !achievementStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>成就概览</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{achievementStats.completion_rate}%</Text>
            <Text style={styles.statLabel}>完成率</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{achievementStats.total_points}</Text>
            <Text style={styles.statLabel}>总积分</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{achievementStats.recent_unlocks.length}</Text>
            <Text style={styles.statLabel}>近期解锁</Text>
          </View>
        </View>

        {/* 分类统计 */}
        <View style={styles.categoryStats}>
          {Object.entries(achievementStats.categories).map(([category, stats]) => (
            <View key={category} style={styles.categoryStatItem}>
              <View style={[styles.categoryStatIcon, { backgroundColor: getCategoryColor(category) + '20' }]}>
                {React.createElement(getCategoryIcon(category), {
                  size: 16,
                  color: getCategoryColor(category),
                })}
              </View>
              <View style={styles.categoryStatInfo}>
                <Text style={styles.categoryStatName}>
                  {categories.find(c => c.id === category)?.name || category}
                </Text>
                <Text style={styles.categoryStatProgress}>
                  {stats.unlocked}/{stats.total} ({stats.completion_rate}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommended = () => {
    if (!user || recommendedAchievements.length === 0) return null;

    return (
      <View style={styles.recommendedContainer}>
        <Text style={styles.recommendedTitle}>推荐成就</Text>
        <Text style={styles.recommendedSubtitle}>继续努力，即将解锁</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedScrollContent}
        >
          {recommendedAchievements.map((userAchievement, index) => {
            const achievement = userAchievement.achievement;
            if (!achievement) return null;

            const progress = userAchievement.progress;
            const target = achievement.target_value;
            const progressPercentage = Math.min((progress / target) * 100, 100);

            return (
              <View key={index} style={styles.recommendedCard}>
                <View style={[styles.recommendedIcon, { backgroundColor: getCategoryColor(achievement.category) + '20' }]}>
                  {React.createElement(getCategoryIcon(achievement.category), {
                    size: 24,
                    color: getCategoryColor(achievement.category),
                  })}
                </View>
                <Text style={styles.recommendedCardTitle}>{achievement.name}</Text>
                <Text style={styles.recommendedCardDescription}>{achievement.description}</Text>
                
                <View style={styles.recommendedProgress}>
                  <Text style={styles.recommendedProgressText}>
                    {progress}/{target}
                  </Text>
                  <View style={styles.recommendedProgressBar}>
                    <View 
                      style={[
                        styles.recommendedProgressFill, 
                        { 
                          width: `${progressPercentage}%`,
                          backgroundColor: getCategoryColor(achievement.category)
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <category.icon 
              size={16} 
              color={selectedCategory === category.id ? '#FFFFFF' : '#6C757D'} 
              strokeWidth={2} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievementCard = (achievement: Achievement & { progress: number; is_unlocked: boolean; unlocked_at?: string }) => {
    const IconComponent = getCategoryIcon(achievement.category);
    const color = getCategoryColor(achievement.category);
    const progressPercentage = Math.min((achievement.progress / achievement.target_value) * 100, 100);

    return (
      <View key={achievement.id} style={styles.achievementCard}>
        <LinearGradient
          colors={achievement.is_unlocked 
            ? [color + '15', color + '08'] 
            : ['#F8F9FA', '#F1F3F4']
          }
          style={styles.achievementGradient}
        >
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIcon,
              { 
                backgroundColor: achievement.is_unlocked ? color + '20' : '#E9ECEF',
              }
            ]}>
              {achievement.is_unlocked ? (
                <IconComponent size={24} color={color} strokeWidth={2} />
              ) : (
                <Lock size={24} color="#ADB5BD" strokeWidth={2} />
              )}
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                { color: achievement.is_unlocked ? '#495057' : '#ADB5BD' }
              ]}>
                {achievement.name}
              </Text>
              <Text style={[
                styles.achievementDescription,
                { color: achievement.is_unlocked ? '#6C757D' : '#ADB5BD' }
              ]}>
                {achievement.description}
              </Text>
            </View>

            {achievement.is_unlocked && (
              <View style={styles.achievementBadge}>
                <Check size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
            )}
          </View>

          <View style={styles.achievementProgress}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>
                进度: {achievement.progress}/{achievement.target_value}
              </Text>
              <Text style={[styles.progressPercentage, { color }]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBarFill,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: achievement.is_unlocked ? color : '#E9ECEF'
                }
              ]} />
            </View>
          </View>

          {achievement.is_unlocked && achievement.unlocked_at && (
            <View style={styles.achievementReward}>
              <Gift size={14} color={color} />
              <Text style={[styles.rewardText, { color }]}>
                奖励 {achievement.reward_points} 积分
              </Text>
              <Text style={styles.unlockedDate}>
                {new Date(achievement.unlocked_at).toLocaleDateString('zh-CN')} 解锁
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFE66D']}
          />
        }
      >
        {!user && renderAuthPrompt()}
        
        {user && (
          <>
            {renderStatsOverview()}
            {renderRecommended()}
            {renderCategorySelector()}
            
            <View style={styles.achievementsContainer}>
              {filteredAchievements.map(renderAchievementCard)}
              
              {filteredAchievements.length === 0 && (
                <View style={styles.emptyState}>
                  <Star size={48} color="#ADB5BD" />
                  <Text style={styles.emptyStateTitle}>暂无成就</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {selectedCategory === 'all' ? '开始学习解锁第一个成就' : '此分类暂无成就'}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  headerIcon: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: '80%',
    height: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: SPACING.xs / 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.xs / 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  statsContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: SPACING.xs,
  },
  categoryButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  achievementsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: SPACING.xs / 2,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementIcon: {
    width: SPACING.xl,
    height: SPACING.xl,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  achievementTitleLocked: {
    color: '#ADB5BD',
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
  },
  achievementBadge: {
    width: SPACING.md,
    height: SPACING.md,
    borderRadius: SPACING.sm,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementProgress: {
    marginBottom: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  progressPercentage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  achievementProgressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementReward: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.xs,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  rewardLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  rewardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#495057',
    fontWeight: '400',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  authPromptTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  authPromptSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#4ECDC4',
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
  },
  authButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recommendedContainer: {
    marginBottom: SPACING.md,
  },
  recommendedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  recommendedSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  recommendedScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  recommendedCard: {
    width: 200,
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginRight: SPACING.sm,
  },
  recommendedIcon: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendedCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  recommendedCardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
  },
  recommendedProgress: {
    marginBottom: SPACING.sm,
  },
  recommendedProgressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  recommendedProgressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  recommendedProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryStats: {
    marginBottom: SPACING.md,
  },
  categoryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryStatIcon: {
    width: SPACING.xl,
    height: SPACING.xl,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  categoryStatInfo: {
    flex: 1,
  },
  categoryStatName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
  },
  categoryStatProgress: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  pointsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFE66D',
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementGradient: {
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFE66D',
    borderRadius: SPACING.xs / 2,
  },
  unlockedDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '400',
    marginTop: SPACING.xs / 2,
  },
});