import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Settings, BarChart3, Star, Award, ChevronRight, User, LogOut, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/useAuth';
import { useLearningRecords, LearningStats } from '@/hooks/useLearningRecords';

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

interface ProfileItem {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  route: string;
  requireAuth: boolean;
}

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuthContext();
  const { getLearningStats } = useLearningRecords();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 加载学习统计数据
  useEffect(() => {
    if (user) {
      setStatsLoading(true);
      getLearningStats().then(data => {
        setStats(data);
        setStatsLoading(false);
      }).catch(() => {
        setStatsLoading(false);
      });
    }
  }, [user, getLearningStats]);

  const profileItems: ProfileItem[] = [
    {
      icon: BarChart3,
      title: '学习统计',
      subtitle: '查看学习进度',
      color: '#4ECDC4',
      route: '/statistics',
      requireAuth: true,
    },
    {
      icon: Star,
      title: '成就系统',
      subtitle: '解锁学习徽章',
      color: '#FFE66D',
      route: '/achievements',
      requireAuth: true,
    },
    {
      icon: Award,
      title: '知识测试',
      subtitle: '检验学习成果',
      color: '#96CEB4',
      route: '/quiz',
      requireAuth: false,
    },
    {
      icon: Settings,
      title: '设置',
      subtitle: '应用偏好设置',
      color: '#6C757D',
      route: '/settings',
      requireAuth: false,
    },
  ];

  const handleItemPress = (route: string, requireAuth: boolean) => {
    if (requireAuth && !user) {
      Alert.alert(
        '需要登录',
        '此功能需要登录后才能使用',
        [
          { text: '取消', style: 'cancel' },
          { text: '去登录', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }
    router.push(route as any);
  };

  const handleSignOut = async () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 用户确认退出登录...');
              const result = await signOut();
              
              if (result.success) {
                console.log('✅ 退出登录成功');
                // 不需要手动导航，useAuth Hook 会自动处理
                // Alert.alert('成功', '已退出登录');
              } else {
                console.error('❌ 退出登录失败:', result.error);
                Alert.alert('错误', result.error || '退出失败');
              }
            } catch (error: any) {
              console.error('❌ 退出登录异常:', error);
              Alert.alert('错误', '退出失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 格式化学习时长
  const formatLearningTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  const renderProfileItem = (item: ProfileItem, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.profileItem}
      onPress={() => handleItemPress(item.route, item.requireAuth)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <item.icon size={20} color={item.color} strokeWidth={2} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        {item.requireAuth && !user && (
          <Text style={styles.authRequired}>需要登录</Text>
        )}
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

        {/* User Section */}
        <View style={styles.userSection}>
          {user ? (
            <View style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <User size={24} color="#fff" />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.full_name || user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {stats && (
                    <Text style={styles.userStats}>
                      学习 {stats.idioms_learned} 个成语 • 连续 {stats.streak_days} 天
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push('/profile')}
                >
                  <Text style={styles.editButtonText}>编辑资料</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                  disabled={loading}
                >
                  <LogOut size={16} color="#e74c3c" />
                  <Text style={styles.signOutButtonText}>退出</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.authPrompt}>
              <LogIn size={32} color="#3498db" />
              <Text style={styles.authPromptTitle}>登录后体验完整功能</Text>
              <Text style={styles.authPromptSubtitle}>
                保存学习进度，解锁更多功能
              </Text>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.authButtonText}>立即登录</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Card */}
        {user && (
          <View style={styles.statsCard}>
            {statsLoading ? (
              <View style={styles.statsLoading}>
                <Text style={styles.statsLoadingText}>加载统计数据...</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.idioms_learned || 0}</Text>
                  <Text style={styles.statLabel}>已学成语</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.favorite_count || 0}</Text>
                  <Text style={styles.statLabel}>收藏数量</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.streak_days || 0}</Text>
                  <Text style={styles.statLabel}>连续天数</Text>
                </View>
              </View>
            )}
            {stats && stats.total_learning_time > 0 && (
              <View style={styles.learningTimeContainer}>
                <Text style={styles.learningTimeLabel}>总学习时长</Text>
                <Text style={styles.learningTimeValue}>
                  {formatLearningTime(stats.total_learning_time)}
                </Text>
              </View>
            )}
          </View>
        )}

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
  userSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  userStats: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  signOutButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  authPrompt: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  authPromptSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  authButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  statsLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  statsLoadingText: {
    fontSize: 14,
    color: '#7f8c8d',
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
  learningTimeContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  learningTimeLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  learningTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
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
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#495057',
    marginBottom: 2,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '400',
  },
  authRequired: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  quoteText: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },
});