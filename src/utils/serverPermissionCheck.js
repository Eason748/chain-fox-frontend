import supabase from '../services/supabase';
import { isWhitelistUser } from './supabaseQueries';

/**
 * 服务器端权限检查函数，用于验证用户是否有权限执行特定操作
 *
 * @param {Object} options - 权限检查选项
 * @param {boolean} options.requireWhitelist - 是否需要白名单权限
 * @param {string} options.reportId - 报告ID（如果操作与特定报告相关）
 * @param {string} options.action - 操作类型（'read', 'update', 'delete'）
 * @returns {Promise<Object>} 包含权限检查结果的对象
 */
export const checkPermission = async (options = {}) => {
  const { requireWhitelist = false, reportId = null, action = 'read' } = options;

  try {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return {
        allowed: false,
        error: 'User not authenticated',
        status: 401
      };
    }

    // 如果需要白名单权限，使用数据库函数检查用户是否在白名单中
    if (requireWhitelist) {
      const isWhitelisted = await isWhitelistUser(session.user.id);

      if (!isWhitelisted) {
        return {
          allowed: false,
          error: 'Permission denied: Only whitelist users can perform this action',
          status: 403
        };
      }
    }

    // 如果操作与特定报告相关，检查报告状态
    if (reportId && action !== 'read') {
      const { data: report, error: reportError } = await supabase
        .from('audit_reports')
        .select('status')
        .eq('id', reportId)
        .single();

      if (reportError) {
        console.error('Error fetching report status:', reportError);
        return {
          allowed: false,
          error: 'Error checking report status',
          status: 500
        };
      }

      // 如果报告状态为 archived，不允许任何编辑操作
      if (report.status === 'archived') {
        return {
          allowed: false,
          error: 'This report is archived and cannot be modified',
          status: 403
        };
      }
    }

    // 所有检查都通过
    return { allowed: true };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      allowed: false,
      error: 'Error checking permissions',
      status: 500
    };
  }
};

export default checkPermission;
