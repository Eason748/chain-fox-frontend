import { checkPermission } from '../utils/serverPermissionCheck';

/**
 * 权限中间件 - 用于在服务器端API路由中强制执行权限检查
 * 
 * @param {Object} options - 权限检查选项
 * @returns {Function} Express中间件函数
 */
export const permissionMiddleware = (options = {}) => {
  return async (req, res, next) => {
    try {
      // 执行权限检查
      const { allowed, error, status } = await checkPermission(options);
      
      if (!allowed) {
        // 如果权限检查失败，返回错误响应
        return res.status(status || 403).json({
          error: error || 'Permission denied',
          success: false
        });
      }
      
      // 权限检查通过，继续处理请求
      next();
    } catch (err) {
      console.error('Permission middleware error:', err);
      return res.status(500).json({
        error: 'Internal server error during permission check',
        success: false
      });
    }
  };
};

export default permissionMiddleware;
