import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, 
  Bell, 
  Moon, 
  Volume2, 
  Download, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Smartphone,
  Palette,
  Clock,
  Database
} from 'lucide-react-native';

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

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    soundEffects: true,
    autoDownload: false,
    dailyReminder: true,
    studyReminder: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: '确定' }]);
  };

  const settingsSections = [
    {
      title: '通知设置',
      items: [
        {
          id: 'notifications',
          title: '推送通知',
          subtitle: '接收学习提醒和成就通知',
          icon: Bell,
          type: 'toggle',
          value: settings.notifications,
          onToggle: (value) => updateSetting('notifications', value),
        },
        {
          id: 'dailyReminder',
          title: '每日提醒',
          subtitle: '每天定时提醒学习成语',
          icon: Clock,
          type: 'toggle',
          value: settings.dailyReminder,
          onToggle: (value) => updateSetting('dailyReminder', value),
        },
        {
          id: 'studyReminder',
          title: '学习提醒',
          subtitle: '长时间未学习时发送提醒',
          icon: Smartphone,
          type: 'toggle',
          value: settings.studyReminder,
          onToggle: (value) => updateSetting('studyReminder', value),
        },
      ] as SettingItem[],
    },
    {
      title: '界面设置',
      items: [
        {
          id: 'darkMode',
          title: '深色模式',
          subtitle: '护眼模式，适合夜间使用',
          icon: Moon,
          type: 'toggle',
          value: settings.darkMode,
          onToggle: (value) => updateSetting('darkMode', value),
        },
        {
          id: 'theme',
          title: '主题设置',
          subtitle: '选择你喜欢的界面主题',
          icon: Palette,
          type: 'navigation',
          onPress: () => showAlert('主题设置', '更多主题正在开发中，敬请期待！'),
        },
        {
          id: 'soundEffects',
          title: '音效',
          subtitle: '开启点击音效和提示音',
          icon: Volume2,
          type: 'toggle',
          value: settings.soundEffects,
          onToggle: (value) => updateSetting('soundEffects', value),
        },
      ] as SettingItem[],
    },
    {
      title: '数据设置',
      items: [
        {
          id: 'autoDownload',
          title: '自动下载',
          subtitle: '在WiFi环境下自动下载内容',
          icon: Download,
          type: 'toggle',
          value: settings.autoDownload,
          onToggle: (value) => updateSetting('autoDownload', value),
        },
        {
          id: 'dataManagement',
          title: '数据管理',
          subtitle: '查看和管理应用数据',
          icon: Database,
          type: 'navigation',
          onPress: () => showAlert('数据管理', '当前应用数据大小：约 15.2 MB\\n\\n包含：\\n• 学习记录和统计\\n• 收藏的成语\\n• 个人设置'),
        },
      ] as SettingItem[],
    },
    {
      title: '安全与隐私',
      items: [
        {
          id: 'privacy',
          title: '隐私设置',
          subtitle: '管理你的隐私偏好',
          icon: Shield,
          type: 'navigation',
          onPress: () => showAlert('隐私设置', '我们重视你的隐私安全：\\n\\n• 学习数据仅存储在本地\\n• 不会收集个人敏感信息\\n• 统计数据已匿名化处理'),
        },
      ] as SettingItem[],
    },
    {
      title: '帮助与支持',
      items: [
        {
          id: 'help',
          title: '使用帮助',
          subtitle: '查看使用指南和常见问题',
          icon: HelpCircle,
          type: 'navigation',
          onPress: () => showAlert('使用帮助', '📚 如何使用境语：\\n\\n1. 浏览和学习成语\\n2. 收藏感兴趣的成语\\n3. 参与知识测试\\n4. 查看学习统计\\n5. 解锁学习成就\\n\\n有问题？联系我们获取帮助！'),
        },
        {
          id: 'about',
          title: '关于境语',
          subtitle: '应用信息和版本',
          icon: Info,
          type: 'navigation',
          onPress: () => showAlert('关于境语', '🎋 境语 v1.0.0\\n\\n传承千年智慧，品味成语之美\\n\\n境语是一款专注于中华成语学习的应用，致力于让传统文化在现代生活中焕发新的活力。\\n\\n© 2024 境语团队'),
        },
      ] as SettingItem[],
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#6C757D', '#495057']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Settings size={28} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.headerTitle}>设置</Text>
          <Text style={styles.headerSubtitle}>个性化你的学习体验</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.type === 'navigation' ? item.onPress : undefined}
      disabled={item.type === 'toggle'}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <item.icon size={20} color="#495057" strokeWidth={2} />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      
      <View style={styles.settingControl}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E9ECEF', true: '#4ECDC480' }}
            thumbColor={item.value ? '#4ECDC4' : '#FFFFFF'}
            ios_backgroundColor="#E9ECEF"
          />
        )}
        {item.type === 'navigation' && (
          <ChevronRight size={16} color="#ADB5BD" strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  const renderAppInfo = () => (
    <View style={styles.appInfoContainer}>
      <View style={styles.appInfo}>
        <Text style={styles.appInfoTitle}>境语</Text>
        <Text style={styles.appInfoVersion}>版本 1.0.0</Text>
        <Text style={styles.appInfoDescription}>
          传承千年智慧，品味成语之美
        </Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>128</Text>
          <Text style={styles.statLabel}>收录成语</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>学习天数</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>73</Text>
          <Text style={styles.statLabel}>已学成语</Text>
        </View>
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
        {renderAppInfo()}
        {settingsSections.map(renderSection)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Chinese culture lovers
          </Text>
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
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: SPACING.xs,
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
  appInfoContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appInfoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#495057',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  appInfoVersion: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: SPACING.xs,
  },
  appInfoDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: SPACING.lg,
    backgroundColor: '#E9ECEF',
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  settingIcon: {
    width: SPACING.lg,
    height: SPACING.lg,
    borderRadius: SPACING.xs,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
    lineHeight: 16,
  },
  settingControl: {
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ADB5BD',
    fontWeight: '400',
  },
});