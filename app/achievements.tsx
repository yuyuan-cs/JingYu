import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Star, Trophy, Crown, Target, Calendar, BookOpen, Flame, Lock, Check } from 'lucide-react-native';

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

// Mock achievement data
const achievements = [
  {
    id: 1,
    title: '初学乍练',
    description: '学习第1个成语',
    icon: BookOpen,
    color: '#4ECDC4',
    unlocked: true,
    progress: 1,
    total: 1,
    category: 'learning',
    reward: '获得称号：初学者',
  },
  {
    id: 2,
    title: '学有小成',
    description: '累计学习10个成语',
    icon: Star,
    color: '#FFE66D',
    unlocked: true,
    progress: 10,
    total: 10,
    category: 'learning',
    reward: '解锁统计功能',
  },
  {
    id: 3,
    title: '勤学苦练',
    description: '累计学习50个成语',
    icon: Award,
    color: '#FF6B6B',
    unlocked: true,
    progress: 50,
    total: 50,
    category: 'learning',
    reward: '获得称号：勤学者',
  },
  {
    id: 4,
    title: '博学多识',
    description: '累计学习100个成语',
    icon: Trophy,
    color: '#96CEB4',
    unlocked: false,
    progress: 73,
    total: 100,
    category: 'learning',
    reward: '解锁高级测试',
  },
  {
    id: 5,
    title: '学富五车',
    description: '累计学习200个成语',
    icon: Crown,
    color: '#DDA0DD',
    unlocked: false,
    progress: 73,
    total: 200,
    category: 'learning',
    reward: '获得称号：学者',
  },
  {
    id: 6,
    title: '持之以恒',
    description: '连续学习7天',
    icon: Calendar,
    color: '#F7DC6F',
    unlocked: true,
    progress: 7,
    total: 7,
    category: 'streak',
    reward: '获得学习奖励',
  },
  {
    id: 7,
    title: '坚持不懈',
    description: '连续学习30天',
    icon: Flame,
    color: '#FF8A80',
    unlocked: false,
    progress: 7,
    total: 30,
    category: 'streak',
    reward: '获得称号：坚持者',
  },
  {
    id: 8,
    title: '精益求精',
    description: '测试满分3次',
    icon: Target,
    color: '#45B7D1',
    unlocked: false,
    progress: 1,
    total: 3,
    category: 'test',
    reward: '解锁专家模式',
  },
];

const categories = [
  { id: 'all', name: '全部', icon: Star },
  { id: 'learning', name: '学习', icon: BookOpen },
  { id: 'streak', name: '连击', icon: Flame },
  { id: 'test', name: '测试', icon: Target },
];

export default function AchievementsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

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
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{unlockedCount}/{totalCount} 已解锁</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(unlockedCount / totalCount) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

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

  const renderAchievementCard = (achievement) => {
    const progressPercentage = (achievement.progress / achievement.total) * 100;
    
    return (
      <View key={achievement.id} style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={[
            styles.achievementIcon, 
            { 
              backgroundColor: achievement.unlocked ? `${achievement.color}15` : '#F8F9FA',
              borderColor: achievement.unlocked ? `${achievement.color}40` : '#E9ECEF'
            }
          ]}>
            {achievement.unlocked ? (
              <achievement.icon 
                size={24} 
                color={achievement.color} 
                strokeWidth={2} 
              />
            ) : (
              <Lock size={24} color="#ADB5BD" strokeWidth={2} />
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.achievementTitleLocked
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
          
          {achievement.unlocked && (
            <View style={styles.achievementBadge}>
              <Check size={16} color="#FFFFFF" strokeWidth={2} />
            </View>
          )}
        </View>
        
        <View style={styles.achievementProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>
              进度: {achievement.progress}/{achievement.total}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          
          <View style={styles.achievementProgressBar}>
            <View 
              style={[
                styles.achievementProgressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: achievement.unlocked ? achievement.color : '#E9ECEF'
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.achievementReward}>
          <Text style={styles.rewardLabel}>奖励</Text>
          <Text style={styles.rewardText}>{achievement.reward}</Text>
        </View>
      </View>
    );
  };

  const renderStatsOverview = () => {
    const categoryStats = categories.slice(1).map(category => {
      const categoryAchievements = achievements.filter(a => a.category === category.id);
      const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
      return {
        ...category,
        unlocked: unlockedInCategory,
        total: categoryAchievements.length,
      };
    });

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>分类统计</Text>
        <View style={styles.statsGrid}>
          {categoryStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <stat.icon size={20} color="#495057" strokeWidth={2} />
              <Text style={styles.statNumber}>{stat.unlocked}/{stat.total}</Text>
              <Text style={styles.statLabel}>{stat.name}</Text>
            </View>
          ))}
        </View>
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
      >
        {renderStatsOverview()}
        {renderCategorySelector()}
        
        <View style={styles.achievementsContainer}>
          {filteredAchievements.map(renderAchievementCard)}
        </View>
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
});