import { useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabase';
import { checkCurrentUserWhitelist } from '../utils/supabaseQueries';

/**
 * 权限检查钩子 - 用于在前端组件中检查用户权限
 *
 * @returns {Object} 包含权限状态的对象
 */
export const usePermission = () => {
  const [permissions, setPermissions] = useState({
    isWhitelistUser: false,
    loading: true,
    error: null
  });

  // 刷新权限状态的函数
  const refreshPermissions = useCallback(async () => {
    try {
      setPermissions(prev => ({ ...prev, loading: true }));

      // 使用数据库函数检查用户是否在白名单中
      const isWhitelisted = await checkCurrentUserWhitelist();

      setPermissions({
        isWhitelistUser: isWhitelisted,
        loading: false,
        error: null
      });

      return isWhitelisted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions({
        isWhitelistUser: false,
        loading: false,
        error: 'Failed to check permissions'
      });
      return false;
    }
  }, []);

  // 初始化时检查权限
  useEffect(() => {
    refreshPermissions();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(async () => {
      await refreshPermissions();
    });

    return () => {
      // 清理监听器
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [refreshPermissions]);

  return {
    ...permissions,
    refreshPermissions
  };
};

export default usePermission;
