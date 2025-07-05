import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Settings, BarChart3, Star, Award, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

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

export default function ProfileScreen() {
  const profileItems = [
    {
      icon: BarChart3,
      title: '学习统计',
      subtitle: '查看学习进度',
      color: '#4ECDC4',
      route: '/statistics',
    },
    {
      icon: Star,
      title: '成就系统',
      subtitle: '解锁学习徽章',
      color: '#FFE66D',
      route: '/achievements',
    },
    {
      icon: Award,
      title: '知识测试',
      subtitle: '检验学习成果',
      color: '#96CEB4',
      route: '/quiz',
    },
    {
      icon: Settings,
      title: '设置',
      subtitle: '应用偏好设置',
      color: '#6C757D',
      route: '/settings',
    },
  ];

  const handleItemPress = (route: string) => {
    router.push(route);
  };

  const renderProfileItem = (item, index) => (
    <TouchableOpacity 
      key={index} 
      style={styles.profileItem}
      onPress={() => handleItemPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <item.icon size={20} color={item.color} strokeWidth={2} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={16} color="#ADB5BD" strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>我的学习</Text>
          <Text style={styles.subtitle}>持续精进，温故知新</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>已学成语</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>收藏数量</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        {/* Profile Items */}
        <View style={styles.profileSection}>
          {profileItems.map(renderProfileItem)}
        </View>

        {/* Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "学而时习之，不亦说乎？"
          </Text>
          <Text style={styles.quoteAuthor}>—— 论语</Text>
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
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#495057',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FF6B6B',
    marginBottom: SPACING.xs / 2,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: SPACING.sm,
  },
  profileSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: SPACING.xs / 2,
    elevation: 2,
  },
  iconContainer: {
    width: SPACING.xl,
    height: SPACING.xl,
    borderRadius: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#495057',
    marginBottom: SPACING.xs / 2,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
});