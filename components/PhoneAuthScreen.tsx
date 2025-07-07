import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../hooks/useAuth';
import { AuthService, PhoneSignUpData, PhoneVerificationData } from '../services/supabaseAuth';

interface PhoneAuthScreenProps {
  onBack?: () => void;
}

type AuthMode = 'register' | 'verify';

interface FormData {
  phone: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
  verificationCode: string;
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function PhoneAuthScreen({ onBack }: PhoneAuthScreenProps = {}) {
  const router = useRouter();
  const { loading } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('register');
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 格式化手机号显示
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  };

  // 验证手机号格式
  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  // 验证表单
  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.phone.trim()) {
        Alert.alert('错误', '请输入手机号');
        return false;
      }

      if (!validatePhone(formData.phone)) {
        Alert.alert('错误', '请输入正确的手机号格式');
        return false;
      }

      if (!formData.username.trim()) {
        Alert.alert('错误', '请输入用户名');
        return false;
      }

      if (formData.username.length < 2) {
        Alert.alert('错误', '用户名至少2个字符');
        return false;
      }

      if (!formData.password.trim()) {
        Alert.alert('错误', '请输入密码');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('错误', '密码至少6个字符');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('错误', '两次输入的密码不一致');
        return false;
      }
    } else {
      if (!formData.verificationCode.trim()) {
        Alert.alert('错误', '请输入验证码');
        return false;
      }

      if (formData.verificationCode.length !== 6) {
        Alert.alert('错误', '验证码应为6位数字');
        return false;
      }
    }

    return true;
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      phone: '',
      password: '',
      confirmPassword: '',
      username: '',
      full_name: '',
      verificationCode: '',
    });
  };

  // 处理手机号注册
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const signUpData: PhoneSignUpData = {
        phone: `+86${formData.phone.replace(/\D/g, '')}`, // 添加中国区号
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name || formData.username,
      };

      const result = await AuthService.signUpWithPhone(signUpData);

      if (result.success) {
        Alert.alert('成功', result.message || '验证码已发送');
        setMode('verify');
      } else {
        Alert.alert('注册失败', result.error || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('错误', '注册时发生错误');
    }
  };

  // 处理验证码验证
  const handleVerify = async () => {
    if (!validateForm()) return;

    try {
      const verifyData: PhoneVerificationData = {
        phone: `+86${formData.phone.replace(/\D/g, '')}`,
        token: formData.verificationCode,
      };

      const result = await AuthService.verifyPhone(verifyData);

      if (result.success) {
        Alert.alert('成功', result.message || '注册成功！', [
          {
            text: '确定',
            onPress: () => {
              resetForm();
              setMode('register');
              // 自动跳转到主页
              router.replace('/(tabs)');
            }
          }
        ]);
      } else {
        Alert.alert('验证失败', result.error || '请检查验证码');
      }
    } catch (error) {
      Alert.alert('错误', '验证时发生错误');
    }
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      const result = await AuthService.resendPhoneVerification(
        `+86${formData.phone.replace(/\D/g, '')}`
      );

      if (result.success) {
        Alert.alert('成功', result.message || '验证码已重新发送');
        // 设置60秒冷却时间
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('发送失败', result.error || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('错误', '发送验证码时发生错误');
    }
  };

  const renderRegisterForm = () => (
    <>
      <Text style={styles.title}>手机号注册</Text>
      <Text style={styles.subtitle}>使用手机号快速注册智语账户</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="手机号"
          placeholderTextColor="#ADB5BD"
          value={formatPhoneNumber(formData.phone)}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            if (cleaned.length <= 11) {
              setFormData(prev => ({ ...prev, phone: cleaned }));
            }
          }}
          keyboardType="phone-pad"
          maxLength={13} // 格式化后的长度
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="用户名"
          placeholderTextColor="#ADB5BD"
          value={formData.username}
          onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-circle-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="姓名（可选）"
          placeholderTextColor="#ADB5BD"
          value={formData.full_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="密码（至少6位）"
          placeholderTextColor="#ADB5BD"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#6C757D" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="确认密码"
          placeholderTextColor="#ADB5BD"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
          secureTextEntry={!showPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? '注册中...' : '获取验证码'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderVerifyForm = () => (
    <>
      <Text style={styles.title}>验证手机号</Text>
      <Text style={styles.subtitle}>
        验证码已发送至 {formatPhoneNumber(formData.phone)}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="keypad-outline" size={20} color="#6C757D" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="6位验证码"
          placeholderTextColor="#ADB5BD"
          value={formData.verificationCode}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            if (cleaned.length <= 6) {
              setFormData(prev => ({ ...prev, verificationCode: cleaned }));
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? '验证中...' : '验证并注册'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
        onPress={handleResendCode}
        disabled={resendCooldown > 0}
      >
        <Text style={[styles.resendButtonText, resendCooldown > 0 && styles.resendButtonTextDisabled]}>
          {resendCooldown > 0 ? `重新发送 (${resendCooldown}s)` : '重新发送验证码'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.backButtonText}>返回修改手机号</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              {onBack && (
                <TouchableOpacity style={styles.backToEmailButton} onPress={onBack}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  <Text style={styles.backToEmailText}>返回邮箱注册</Text>
                </TouchableOpacity>
              )}
              <View style={styles.logo}>
                <Text style={styles.logoText}>智语</Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              {mode === 'register' ? renderRegisterForm() : renderVerifyForm()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backToEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  backToEmailText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: SPACING.sm,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ADB5BD',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#ADB5BD',
  },
  backButton: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6C757D',
    fontSize: 14,
  },
}); 