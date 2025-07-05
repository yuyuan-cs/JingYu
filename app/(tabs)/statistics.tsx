import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, TrendingUp, Award, Clock, Target, BookOpen, Flame, BarChart3, PieChart } from 'lucide-react-native';

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

// Mock data for statistics
const learningStats = {
  totalDays: 45,
  totalIdioms: 128,
  currentStreak: 7,
  longestStreak: 15,
  averageDaily: 3.2,
  weeklyProgress: [2, 5, 3, 4, 6, 3, 5], // Last 7 days
  categoryProgress: [
    { name: '艺术创作', learned: 25, total: 40, color: '#FF6B6B' },
    { name: '学习教育', learned: 18, total: 30, color: '#4ECDC4' },
    { name: '志向理想', learned: 15, total: 25, color: '#96CEB4' },
    { name: '坚持努力', learned: 12, total: 20, color: '#DDA0DD' },
    { name: '医术技艺', learned: 8, total: 15, color: '#F7DC6F' },
  ],
  monthlyData: [
    { month: '9月', idioms: 32 },
    { month: '10月', idioms: 45 },
    { month: '11月', idioms: 38 },
    { month: '12月', idioms: 13 }, // Current month
  ]
};

export default function StatisticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#4ECDC4', '#45B7D1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>学习统计</Text>
          <Text style={styles.headerSubtitle}>追踪你的学习进步</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewRow}>
        <View style={[styles.overviewCard, { backgroundColor: '#FF6B6B15' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#FF6B6B' }]}>
            <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.overviewNumber}>{learningStats.totalDays}</Text>
          <Text style={styles.overviewLabel}>学习天数</Text>
        </View>
        
        <View style={[styles.overviewCard, { backgroundColor: '#4ECDC415' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#4ECDC4' }]}>
            <BookOpen size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.overviewNumber}>{learningStats.totalIdioms}</Text>
          <Text style={styles.overviewLabel}>已学成语</Text>
        </View>
      </View>

      <View style={styles.overviewRow}>
        <View style={[styles.overviewCard, { backgroundColor: '#FFE66D15' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#FFE66D' }]}>
            <Flame size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.overviewNumber}>{learningStats.currentStreak}</Text>
          <Text style={styles.overviewLabel}>连续天数</Text>
        </View>
        
        <View style={[styles.overviewCard, { backgroundColor: '#96CEB415' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#96CEB4' }]}>
            <Target size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.overviewNumber}>{learningStats.averageDaily}</Text>
          <Text style={styles.overviewLabel}>日均学习</Text>
        </View>
      </View>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === 'week' ? '本周' : period === 'month' ? '本月' : '本年'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <BarChart3 size={20} color="#495057" strokeWidth={2} />
        <Text style={styles.chartTitle}>每日学习量</Text>
      </View>
      
      <View style={styles.weeklyChart}>
        {learningStats.weeklyProgress.map((count, index) => {
          const days = ['一', '二', '三', '四', '五', '六', '日'];
          const maxHeight = 80;
          const height = (count / Math.max(...learningStats.weeklyProgress)) * maxHeight;
          
          return (
            <View key={index} style={styles.chartBar}>
              <View 
                style={[
                  styles.chartBarFill, 
                  { 
                    height: height,
                    backgroundColor: index === days.length - 1 ? '#FF6B6B' : '#4ECDC4'
                  }
                ]} 
              />
              <Text style={styles.chartBarLabel}>{days[index]}</Text>
              <Text style={styles.chartBarValue}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCategoryProgress = () => (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <PieChart size={20} color="#495057" strokeWidth={2} />
        <Text style={styles.categoryTitle}>分类进度</Text>
      </View>
      
      {learningStats.categoryProgress.map((category, index) => {
        const progress = (category.learned / category.total) * 100;
        return (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.learned}/{category.total}</Text>
            </View>
            <View style={styles.categoryProgressBar}>
              <View 
                style={[
                  styles.categoryProgressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: category.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.categoryPercentage}>{Math.round(progress)}%</Text>
          </View>
        );
      })}
    </View>
  );

  const renderStreakSection = () => (
    <View style={styles.streakContainer}>
      <View style={styles.streakHeader}>
        <View style={[styles.streakIcon, { backgroundColor: '#FF6B6B' }]}>
          <Flame size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>学习连击</Text>
          <Text style={styles.streakSubtitle}>保持学习习惯</Text>
        </View>
      </View>
      
      <View style={styles.streakStats}>
        <View style={styles.streakStat}>
          <Text style={styles.streakStatNumber}>{learningStats.currentStreak}</Text>
          <Text style={styles.streakStatLabel}>当前连击</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakStat}>
          <Text style={styles.streakStatNumber}>{learningStats.longestStreak}</Text>
          <Text style={styles.streakStatLabel}>最长记录</Text>
        </View>
      </View>
    </View>
  );

  const renderMonthlyTrend = () => (
    <View style={styles.trendContainer}>
      <View style={styles.trendHeader}>
        <TrendingUp size={20} color="#495057" strokeWidth={2} />
        <Text style={styles.trendTitle}>月度趋势</Text>
      </View>
      
      <View style={styles.trendChart}>
        {learningStats.monthlyData.map((month, index) => {
          const maxValue = Math.max(...learningStats.monthlyData.map(m => m.idioms));
          const height = (month.idioms / maxValue) * 60;
          
          return (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendBar}>
                <View 
                  style={[
                    styles.trendBarFill, 
                    { 
                      height: height,
                      backgroundColor: index === learningStats.monthlyData.length - 1 ? '#FF6B6B' : '#96CEB4'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.trendLabel}>{month.month}</Text>
              <Text style={styles.trendValue}>{month.idioms}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderOverviewCards()}
        {renderPeriodSelector()}
        {selectedPeriod === 'week' && renderWeeklyChart()}
        {renderCategoryProgress()}
        {renderStreakSection()}
        {renderMonthlyTrend()}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  overviewContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  overviewIcon: {
    width: SPACING.lg,
    height: SPACING.lg,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  overviewNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  overviewLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.xs,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  periodButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chartTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: SPACING.sm,
  },
  chartBar: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chartBarFill: {
    width: 20,
    borderRadius: 4,
    minHeight: 8,
  },
  chartBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  chartBarValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  categoryContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  categoryItem: {
    marginBottom: SPACING.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryDot: {
    width: SPACING.xs,
    height: SPACING.xs,
    borderRadius: SPACING.xs / 2,
    marginRight: SPACING.xs,
  },
  categoryName: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  categoryCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    marginBottom: SPACING.xs / 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#6C757D',
    textAlign: 'right',
    fontWeight: '600',
  },
  streakContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  streakIcon: {
    width: SPACING.xl,
    height: SPACING.xl,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  streakSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakStatNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FF6B6B',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  streakStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  streakDivider: {
    width: 1,
    height: SPACING.lg,
    backgroundColor: '#E9ECEF',
    marginHorizontal: SPACING.sm,
  },
  trendContainer: {
    marginHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  trendTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
  },
  trendItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trendBar: {
    height: 60,
    width: 30,
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 8,
  },
  trendLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  trendValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
});