import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { router } from 'expo-router';
import { AuthService, AuthUser, AuthState, SignUpData, SignInData, UpdateProfileData, AuthResult } from '../services/supabaseAuth';

// 认证上下文
interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signIn: (data: SignInData) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  resetAuthState: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// 认证 Hook
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // 初始化认证状态
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🔄 初始化认证状态...');
        
        // 获取当前会话
        const session = await AuthService.getSession();
        
        if (session && mounted) {
          console.log('✅ 发现现有会话，获取用户信息...');
          // 获取用户信息
          const user = await AuthService.getCurrentUser();
          setState({
            user,
            session,
            loading: false,
            error: null,
          });
          console.log('✅ 用户状态已设置:', user?.username || user?.email);
        } else if (mounted) {
          console.log('ℹ️ 无现有会话，设置为未登录状态');
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error('❌ 初始化认证失败:', error);
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: error.message || '初始化认证失败',
          });
        }
      }
    };

    // 监听认证状态变化
    const setupAuthListener = () => {
      console.log('🔄 设置认证状态监听器...');
      const { data: { subscription } } = AuthService.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          console.log('🔔 认证状态变化:', event, session ? '有会话' : '无会话');

          if (event === 'SIGNED_IN' && session) {
            console.log('✅ 用户登录成功');
            try {
              const user = await AuthService.getCurrentUser();
              setState({
                user,
                session,
                loading: false,
                error: null,
              });
              console.log('✅ 登录状态已更新:', user?.username || user?.email);
            } catch (error) {
              console.error('❌ 获取用户信息失败:', error);
              setState(prev => ({ ...prev, loading: false, error: '获取用户信息失败' }));
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('✅ 用户退出登录');
            // 强制重置所有状态，确保loading状态正确
            setState({
              user: null,
              session: null,
              loading: false,
              error: null,
            });
            
            // 退出登录后自动跳转到首页
            console.log('🔄 跳转到首页...');
            try {
              router.replace('/(tabs)');
              console.log('✅ 成功跳转到首页');
            } catch (error) {
              console.warn('⚠️ 导航失败:', error);
            }
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('🔄 令牌已刷新');
            try {
              const user = await AuthService.getCurrentUser();
              setState(prev => ({
                ...prev,
                user,
                session,
                error: null,
              }));
            } catch (error) {
              console.error('❌ 刷新后获取用户信息失败:', error);
            }
          }
        }
      );
      
      authSubscription = subscription;
    };

    // 初始化
    initializeAuth().then(() => {
      setupAuthListener();
    });

    return () => {
      console.log('🔄 清理认证监听器...');
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  // 注册
  const signUp = useCallback(async (data: SignUpData) => {
    console.log('🔄 开始注册...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signUp(data);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.success ? null : (result.error || '注册失败')
      }));
      
      if (result.success) {
        console.log('✅ 注册成功');
      } else {
        console.error('❌ 注册失败:', result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ 注册异常:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || '注册失败' 
      }));
      return {
        success: false,
        error: error.message || '注册失败',
      };
    }
  }, []);

  // 登录
  const signIn = useCallback(async (data: SignInData) => {
    console.log('🔄 开始登录...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signIn(data);
      
      if (result.success) {
        console.log('✅ 登录成功，等待状态更新...');
        // 登录成功，状态会通过 onAuthStateChange 自动更新
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null 
        }));
      } else {
        console.error('❌ 登录失败:', result.error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || '登录失败' 
        }));
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ 登录异常:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || '登录失败' 
      }));
      return {
        success: false,
        error: error.message || '登录失败',
      };
    }
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    console.log('🔄 开始退出登录...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signOut();
      
      if (result.success) {
        console.log('✅ 退出登录成功，等待状态更新...');
        // 立即重置loading状态，不要等待监听器
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null 
        }));
        // 状态会通过 onAuthStateChange 进一步更新（清空user和session）
      } else {
        console.error('❌ 退出登录失败:', result.error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || '登出失败' 
        }));
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ 退出登录异常:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || '登出失败' 
      }));
      
      return {
        success: false,
        error: error.message || '登出失败',
      };
    }
  }, []);

  // 更新用户资料
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    console.log('🔄 更新用户资料...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.updateProfile(data);
      
      if (result.success && result.data) {
        console.log('✅ 用户资料更新成功');
        setState(prev => ({
          ...prev,
          user: result.data ? {
            id: result.data.id,
            email: result.data.email,
            phone: result.data.phone,
            username: result.data.username,
            full_name: result.data.full_name,
            avatar_url: result.data.avatar_url,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
          } : prev.user,
          loading: false,
          error: null,
        }));
      } else {
        console.error('❌ 用户资料更新失败:', result.error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || '更新资料失败' 
        }));
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ 更新用户资料异常:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || '更新资料失败' 
      }));
      return {
        success: false,
        error: error.message || '更新资料失败',
      };
    }
  }, []);

  // 重置密码
  const resetPassword = useCallback(async (email: string) => {
    console.log('🔄 重置密码...');
    return await AuthService.resetPassword(email);
  }, []);

  // 更新密码
  const updatePassword = useCallback(async (newPassword: string) => {
    console.log('🔄 更新密码...');
    return await AuthService.updatePassword(newPassword);
  }, []);

  // 检查用户名可用性
  const checkUsernameAvailability = useCallback(async (username: string) => {
    return await AuthService.checkUsernameAvailability(username, state.user?.id);
  }, [state.user?.id]);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    if (state.session) {
      console.log('🔄 刷新用户信息...');
      try {
        const user = await AuthService.getCurrentUser();
        setState(prev => ({ ...prev, user }));
        console.log('✅ 用户信息已刷新');
      } catch (error) {
        console.error('❌ 刷新用户信息失败:', error);
      }
    }
  }, [state.session]);

  // 重置认证状态 - 用于修复状态残留问题
  const resetAuthState = useCallback(() => {
    console.log('🔄 强制重置认证状态...');
    setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });
    console.log('✅ 认证状态已重置');
  }, []);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    checkUsernameAvailability,
    refreshUser,
    resetAuthState,
  };
}

// 获取认证上下文
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// 检查是否已登录
export function useIsAuthenticated() {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: !!user, loading };
}

// 获取当前用户
export function useCurrentUser() {
  const { user, loading } = useAuthContext();
  return { user, loading };
} 