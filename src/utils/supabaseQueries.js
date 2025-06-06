import { supabase } from '../services/supabase';

/**
 * 检查用户是否在白名单中
 * @param {string} userId - 用户ID
 * @returns {Promise<boolean>} 如果用户在白名单中返回 true，否则返回 false
 */
export const isWhitelistUser = async (userId) => {
  if (!userId) return false;

  // 验证userId格式，防止SQL注入
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    console.error('无效的用户ID格式:', userId);
    return false;
  }

  try {
    const { data, error } = await supabase
      .rpc('is_whitelist_user', { user_id: userId });

    if (error) {
      console.error('检查白名单用户时出错:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('检查白名单用户时出错:', error);
    return false;
  }
};

/**
 * 获取当前登录用户的ID
 * @returns {Promise<string|null>} 用户ID或null
 */
export const getCurrentUserId = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('获取当前用户ID时出错:', error);
    return null;
  }
};

/**
 * 检查当前用户是否在白名单中
 * @returns {Promise<boolean>} 如果当前用户在白名单中返回 true，否则返回 false
 */
export const checkCurrentUserWhitelist = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  return await isWhitelistUser(userId);
};

export default {
  isWhitelistUser,
  getCurrentUserId,
  checkCurrentUserWhitelist
};
