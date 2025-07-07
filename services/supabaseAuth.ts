import { supabase, supabaseAdmin } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 开发环境配置
const DEV_CONFIG = {
  skipEmailVerification: false, // 开发环境跳过邮件验证
  autoConfirmUsers: false, // 自动确认用户
};

// 认证状态类型
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// 注册参数
export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  username: string;
  full_name?: string;
}

// 手机号注册参数
export interface PhoneSignUpData {
  phone: string;
  password: string;
  username: string;
  full_name?: string;
}

// 手机号验证参数
export interface PhoneVerificationData {
  phone: string;
  token: string;
}

// 登录参数
export interface SignInData {
  email?: string;
  phone?: string;
  password: string;
}

// 用户资料更新参数
export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

// 认证操作结果类型
export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  needsVerification?: boolean;
  message?: string;
}

// 认证服务类
export class AuthService {
  // 邮箱注册
  static async signUp(data: SignUpData) {
    try {
      // 在开发环境中，如果遇到邮件速率限制，尝试使用管理员方式创建用户
      if (DEV_CONFIG.skipEmailVerification) {
        return await this.signUpWithAdmin(data);
      }

      if (!data.email) {
        throw new Error('邮箱不能为空');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name || data.username,
          },
          // 在开发环境中禁用邮件确认
          emailRedirectTo: undefined,
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 注意：不在这里创建用户记录，因为用户还没有验证邮箱
      // 用户记录将在验证邮箱后自动创建（通过数据库触发器或认证回调）

      return {
        success: true,
        data: authData,
        needsVerification: !authData.session, // 如果没有session，说明需要邮箱验证
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '注册失败',
      };
    }
  }

  // 手机号注册
  static async signUpWithPhone(data: PhoneSignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone: data.phone,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name || data.username,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 注意：不在这里创建用户记录，因为用户还没有验证手机号
      // 用户记录将在验证手机号后创建

      return {
        success: true,
        data: authData,
        needsVerification: !authData.session, // 如果没有session，说明需要短信验证
        message: '验证码已发送到您的手机，请查收'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '注册失败',
      };
    }
  }

  // 验证手机号验证码
  static async verifyPhone(data: PhoneVerificationData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone: data.phone,
        token: data.token,
        type: 'sms'
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 验证成功后，创建用户记录
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            phone: data.phone,
            username: authData.user.user_metadata?.username || `user_${authData.user.id.slice(0, 8)}`,
            full_name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.username,
            avatar_url: authData.user.user_metadata?.avatar_url,
          });

        if (profileError) {
          console.warn('创建用户资料失败:', profileError.message);
        }
      }

      return {
        success: true,
        data: authData,
        message: '手机号验证成功！'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '验证失败',
      };
    }
  }

  // 重新发送验证码
  static async resendPhoneVerification(phone: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'sms',
        phone: phone
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: '验证码已重新发送'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '发送验证码失败',
      };
    }
  }

  // 管理员方式注册用户（开发环境）
  static async signUpWithAdmin(data: SignUpData) {
    try {
      // 注意：这需要 Service Role Key，在生产环境中不要使用
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        phone: data.phone,
        password: data.password,
        email_confirm: true, // 自动确认邮箱
        phone_confirm: true, // 自动确认手机号
        user_metadata: {
          username: data.username,
          full_name: data.full_name || data.username,
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 创建用户记录
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            phone: data.phone,
            username: data.username,
            full_name: data.full_name || data.username,
            avatar_url: authData.user.user_metadata?.avatar_url,
          });

        if (profileError) {
          console.warn('创建用户资料失败:', profileError.message);
        }

        // 自动登录用户
        const signInData = data.email 
          ? { email: data.email, password: data.password }
          : { phone: data.phone!, password: data.password };

        const { data: signInResult, error: signInError } = await supabase.auth.signInWithPassword(signInData);

        if (signInError) {
          console.warn('自动登录失败:', signInError.message);
        }

        return {
          success: true,
          data: signInResult || authData,
          needsVerification: false,
          message: '注册成功（开发模式）'
        };
      }

      return {
        success: true,
        data: authData,
        needsVerification: false,
        message: '注册成功（开发模式）'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '注册失败',
      };
    }
  }

  // 用户登录（支持邮箱和手机号）
  static async signIn(data: SignInData) {
    try {
      const signInData = data.email 
        ? { email: data.email, password: data.password }
        : { phone: data.phone!, password: data.password };

      const { data: authData, error } = await supabase.auth.signInWithPassword(signInData);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: authData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '登录失败',
      };
    }
  }

  // 用户登出
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      // 清除本地存储的用户数据
      await AsyncStorage.multiRemove([
        'user_preferences',
        'offline_favorites',
        'learning_progress'
      ]);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '登出失败',
      };
    }
  }

  // 获取当前用户
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // 获取用户详细信息
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        // 如果没有用户资料，创建一个基础的
        const basicProfile = {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone || undefined,
          username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          full_name: user.user_metadata?.full_name || user.user_metadata?.username || 'User',
          avatar_url: user.user_metadata?.avatar_url,
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        };

        // 尝试创建用户资料
        const { error: upsertError } = await supabase
          .from('users')
          .upsert(basicProfile, { onConflict: 'id' });

        if (upsertError) {
          console.warn('创建用户资料失败:', upsertError.message);
        }

        return basicProfile;
      }

      return {
        id: profile.id,
        email: profile.email,
        phone: profile.phone,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 更新用户资料
  static async updateProfile(data: UpdateProfileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('用户未登录');
      }

      // 更新用户资料表
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 如果更新了用户名，也更新 auth 的 metadata
      if (data.username || data.full_name) {
        await supabase.auth.updateUser({
          data: {
            username: data.username,
            full_name: data.full_name,
          }
        });
      }

      return {
        success: true,
        data: updatedProfile,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '更新资料失败',
      };
    }
  }

  // 重置密码
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // 根据你的应用配置
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: '密码重置邮件已发送',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '发送重置邮件失败',
      };
    }
  }

  // 更新密码
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: '密码更新成功',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '密码更新失败',
      };
    }
  }

  // 检查用户名是否可用
  static async checkUsernameAvailability(username: string, currentUserId?: string) {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username);

      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        available: data.length === 0,
      };
    } catch (error: any) {
      return {
        available: false,
        error: error.message || '检查用户名失败',
      };
    }
  }

  // 监听认证状态变化
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // 获取会话
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // 刷新会话
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }
} 