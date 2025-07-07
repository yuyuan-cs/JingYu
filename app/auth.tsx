import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, TouchableOpacity } from 'react-native';
import { AuthScreen } from '../components/AuthScreen';
import { useAuthContext } from '../hooks/useAuth';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function AuthPage() {
  const { user, loading, error } = useAuthContext();
  const router = useRouter();

  // 如果用户已登录，自动跳转到主页
  useEffect(() => {
    if (user && !loading) {
      // 延迟一下让用户看到成功信息
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // 如果用户已登录，显示成功信息
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color="#4CAF50" />
          <Text style={styles.successTitle}>登录成功！</Text>
          <Text style={styles.successMessage}>
            欢迎回来，{user.username || user.email}！
          </Text>
          <Text style={styles.hint}>
            正在为您跳转到主页...
          </Text>
          
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.returnButtonText}>立即返回主页</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#666" />
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Text style={styles.errorHint}>
              如果遇到邮件速率限制，请稍后再试，或联系管理员。
            </Text>
          </View>
        )}
        
        <AuthScreen />
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>开发环境说明</Text>
          <Text style={styles.infoText}>
            • 当前为开发环境，如遇到邮件速率限制会自动使用管理员模式创建用户
          </Text>
          <Text style={styles.infoText}>
            • 注册成功后会自动登录，无需邮件验证
          </Text>
          <Text style={styles.infoText}>
            • 如果仍然无法注册，请检查网络连接或联系开发者
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Inter-SemiBold',
  },
  successMessage: {
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  hint: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  returnButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  errorHint: {
    color: '#d32f2f',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
}); 