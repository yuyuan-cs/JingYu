import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Settings, BookOpen, Star, Award, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const profileItems = [
    {
      icon: BookOpen,
      title: '学习统计',
      subtitle: '查看学习进度',
      color: '#C93F3F',
    },
    {
      icon: Star,
      title: '成就系统',
      subtitle: '解锁学习徽章',
      color: '#FFA500',
    },
    {
      icon: Award,
      title: '知识测试',
      subtitle: '检验学习成果',
      color: '#4CAF50',
    },
    {
      icon: Settings,
      title: '设置',
      subtitle: '应用偏好设置',
      color: '#666666',
    },
  ];

  const renderProfileItem = (item, index) => (
    <TouchableOpacity key={index} style={styles.profileItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <item.icon size={24} color={item.color} strokeWidth={2} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#CCCCCC" strokeWidth={2} />
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
    backgroundColor: '#F7F7F7',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 32,
    color: '#1A1A1A',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: '#C93F3F',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },
  profileSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  quoteAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
});