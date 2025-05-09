import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, supabase } from '../services/supabase';

// Create authentication context
const AuthContext = createContext(null);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 会话检查状态跟踪
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check user session on initialization - 优化会话检查，减少不必要的日志
  useEffect(() => {
    // 防止重复检查会话
    if (sessionChecked) return;

    const checkUser = async () => {
      try {
        setLoading(true);
        // 移除日志输出，减少控制台噪音

        // Check Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // 只在开发环境中输出错误
          if (import.meta.env.DEV) {
            console.error('Error getting session:', error);
          }
          setError(error);
          return;
        }

        // 移除会话数据日志

        if (data.session) {
          // 移除用户登录日志
          setUser(data.session.user);
        } else {
          // 移除用户未登录日志
          setUser(null);
        }

        // 标记会话已检查，避免重复检查
        setSessionChecked(true);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error checking auth state:', err);
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Check current user
    checkUser();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        // 使用下划线忽略未使用的参数
        setUser(session?.user || null);
      }
    );

    // Clean up listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [sessionChecked]);

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      // 移除不必要的日志输出
      if (import.meta.env.DEV) {
        // 仅在开发环境中保留最基本的日志
        console.log("AuthContext: Starting GitHub login flow");
      }

      // Record current login provider
      localStorage.setItem('auth_provider', 'github');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=github`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: GitHub login error", error);
        }
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: Failed to get OAuth URL");
        }
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Force redirect to OAuth URL - 无需延迟和额外日志
      window.location.href = data.url;

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error signing in with GitHub:', err);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // 移除不必要的日志输出
      if (import.meta.env.DEV) {
        // 仅在开发环境中保留最基本的日志
        console.log("AuthContext: Starting Google login flow");
      }

      // Record current login provider
      localStorage.setItem('auth_provider', 'google');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=google`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: Google login error", error);
        }
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: Failed to get OAuth URL");
        }
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Force redirect to OAuth URL - 无需延迟和额外日志
      window.location.href = data.url;

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error signing in with Google:', err);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      // 移除不必要的日志输出
      if (import.meta.env.DEV) {
        // 仅在开发环境中保留最基本的日志
        console.log("AuthContext: Starting Discord login flow");
      }

      // Record current login provider
      localStorage.setItem('auth_provider', 'discord');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=discord`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: Discord login error", error);
        }
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        if (import.meta.env.DEV) {
          console.error("AuthContext: Failed to get OAuth URL");
        }
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Force redirect to OAuth URL - 无需延迟和额外日志
      window.location.href = data.url;

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error signing in with Discord:', err);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Web3 authentication has been completely removed

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);

      // Web3 authentication is disabled, only sign out from Supabase
      const { error } = await auth.signOut();
      if (error) setError(error);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Values provided to the context
  const value = {
    user,
    loading,
    error,
    // Auth methods
    signInWithGithub,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
