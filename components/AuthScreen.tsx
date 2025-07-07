import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react-native';
import { PhoneAuthScreen } from './PhoneAuthScreen';

type AuthMode = 'login' | 'register' | 'forgot' | 'phone';

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const { signIn, signUp, resetPassword, loading, error, user, resetAuthState } = useAuthContext();

  // 使用本地loading状态或全局loading状态
  const isLoading = localLoading || loading;

  // 重置表单
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      full_name: '',
      confirmPassword: '',
    });
    setLocalLoading(false); // 重置本地loading状态
  };

  // 切换模式
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
    // 切换模式时，如果有残留的loading状态，重置它
    if (loading) {
      console.log('🔄 切换模式时重置loading状态');
      resetAuthState();
    }
  };

  // 组件挂载时确保状态清理
  useEffect(() => {
    // 当组件重新挂载时，如果有残留的loading状态，这里可以添加清理逻辑
    // 但通常useAuth Hook应该自己管理好状态
    console.log('🔄 AuthScreen 组件挂载，当前loading状态:', loading);
    
    // 如果组件挂载时发现loading状态为true，但用户已经退出登录，则可能是状态残留
    // 这种情况下我们需要确保状态正确
    if (loading) {
      console.log('⚠️ 检测到loading状态残留，这可能是退出登录后的状态未正确重置');
    }
  }, [loading]);

  // 监听用户状态变化，确保退出登录后状态正确
  useEffect(() => {
    // 如果用户已经退出登录（user为null），但loading仍为true，这是不正常的
    if (!user && loading) {
      console.log('⚠️ 用户已退出但loading仍为true，可能需要手动重置状态');
      // 注意：这里我们不直接修改useAuth的状态，而是通过重新挂载组件来解决
      // 或者可以考虑添加一个专门的重置方法
    }
    
    // 如果用户登录成功，重置本地loading状态
    if (user && localLoading) {
      console.log('✅ 用户登录成功，重置本地loading状态');
      setLocalLoading(false);
    }
  }, [user, loading, localLoading]);

  // 组件卸载时重置本地状态
  useEffect(() => {
    return () => {
      setLocalLoading(false);
    };
  }, []);

  // 验证表单
  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('错误', '请输入邮箱地址');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return false;
    }

    if (mode === 'forgot') {
      return true;
    }

    if (!formData.password) {
      Alert.alert('错误', '请输入密码');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('错误', '密码长度至少为6位');
      return false;
    }

    if (mode === 'register') {
      if (!formData.username.trim()) {
        Alert.alert('错误', '请输入用户名');
        return false;
      }

      if (formData.username.length < 2) {
        Alert.alert('错误', '用户名长度至少为2位');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('错误', '两次输入的密码不一致');
        return false;
      }
    }

    return true;
  };

  // 处理登录
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLocalLoading(true);
    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        console.log('✅ AuthScreen: 登录成功，等待自动跳转...');
        // 登录成功，保持loading状态直到页面跳转
      } else {
        console.error('❌ AuthScreen: 登录失败:', result.error);
        Alert.alert('登录失败', result.error || '请检查邮箱和密码');
      }
    } catch (error) {
      console.error('❌ AuthScreen: 登录异常:', error);
      Alert.alert('错误', '登录时发生错误');
    } finally {
      setLocalLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLocalLoading(true);
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name || formData.username,
      });

      if (result.success) {
        if (result.needsVerification) {
          Alert.alert(
            '注册成功',
            '请检查您的邮箱并点击验证链接以完成注册',
            [{ text: '确定', onPress: () => switchMode('login') }]
          );
        } else {
          const message = result.message || '欢迎使用智语！';
          Alert.alert('注册成功', message, [
            {
              text: '确定',
              onPress: () => {
                console.log('✅ AuthScreen: 注册成功，等待自动跳转...');
              }
            }
          ]);
        }
      } else {
        let errorMessage = result.error || '注册时发生错误';
        
        // 处理特定错误
        if (errorMessage.includes('rate limit')) {
          errorMessage = '邮件发送频率限制，正在尝试其他方式注册...';
        } else if (errorMessage.includes('Email rate limit exceeded')) {
          errorMessage = '邮件发送次数已达上限，已自动切换到开发模式';
        }
        
        Alert.alert('注册失败', errorMessage);
      }
    } catch (error) {
      Alert.alert('错误', '注册时发生网络错误，请检查网络连接');
    } finally {
      setLocalLoading(false);
    }
  };

  // 处理忘记密码
  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setLocalLoading(true);
    try {
      const result = await resetPassword(formData.email);

      if (result.success) {
        Alert.alert(
          '邮件已发送',
          '请检查您的邮箱，按照邮件中的说明重置密码',
          [{ text: '确定', onPress: () => switchMode('login') }]
        );
      } else {
        Alert.alert('错误', result.error || '发送重置邮件失败');
      }
    } catch (error) {
      Alert.alert('错误', '发送重置邮件时发生错误');
    } finally {
      setLocalLoading(false);
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    switch (mode) {
      case 'login':
        await handleLogin();
        break;
      case 'register':
        await handleRegister();
        break;
      case 'forgot':
        await handleForgotPassword();
        break;
    }
  };

  // 如果是手机号注册模式，显示手机号注册组件
  if (mode === 'phone') {
    return <PhoneAuthScreen onBack={() => switchMode('register')} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>智语</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' && '登录您的账户'}
            {mode === 'register' && '创建新账户'}
            {mode === 'forgot' && '重置密码'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* 邮箱输入 */}
          <View style={styles.inputContainer}>
            <Mail size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="邮箱地址"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 用户名输入 (仅注册时显示) */}
          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <User size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* 姓名输入 (仅注册时显示) */}
          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <User size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="姓名 (可选)"
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* 密码输入 (忘记密码时不显示) */}
          {mode !== 'forgot' && (
            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="密码"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 确认密码输入 (仅注册时显示) */}
          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 错误信息 */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* 提交按钮 */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' && '登录'}
                {mode === 'register' && '注册'}
                {mode === 'forgot' && '发送重置邮件'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 切换模式 */}
          <View style={styles.switchContainer}>
            {mode === 'login' && (
              <>
                <TouchableOpacity onPress={() => switchMode('register')}>
                  <Text style={styles.switchText}>还没有账户？立即注册</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchMode('phone')}>
                  <Text style={styles.switchText}>使用手机号注册</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchMode('forgot')}>
                  <Text style={styles.switchText}>忘记密码？</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'register' && (
              <>
                <TouchableOpacity onPress={() => switchMode('login')}>
                  <Text style={styles.switchText}>已有账户？立即登录</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchMode('phone')}>
                  <Text style={styles.switchText}>使用手机号注册</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'forgot' && (
              <TouchableOpacity onPress={() => switchMode('login')}>
                <Text style={styles.switchText}>返回登录</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2c3e50',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchText: {
    color: '#3498db',
    fontSize: 14,
    marginVertical: 8,
  },
});

export default AuthScreen; 