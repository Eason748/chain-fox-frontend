/**
 * Points Service
 * Provides functionality related to user points
 */

import supabase from './supabase';

// Default points configuration
const DEFAULT_POINTS = {
  VIEW_REPORT: 10,  // Points needed to view a report
  SUBMIT_REPOSITORY: 100  // Points needed to submit a repository
};

/**
 * Get user points
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{points: number, error: Error}>} User points information
 */
export const getUserPoints = async (userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { points: null, error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Call database function to get user points
    const { data, error } = await supabase.rpc('get_user_points', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting user points:', error);
      return { points: null, error };
    }

    return { points: data, error: null };
  } catch (error) {
    console.error('Error getting user points:', error);
    return { points: null, error };
  }
};

/**
 * Get user point transactions
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @param {number} limit - Limit the number of returned records
 * @param {number} offset - Pagination offset
 * @returns {Promise<{transactions: Array, error: Error}>} User point transactions
 */
export const getPointTransactions = async (userId = null, limit = 10, offset = 0) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { transactions: [], error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Query user point transactions
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting user point transactions:', error);
      return { transactions: [], error };
    }

    return { transactions: data, error: null };
  } catch (error) {
    console.error('Error getting user point transactions:', error);
    return { transactions: [], error };
  }
};

/**
 * Check if user has enough points
 * @param {number} amount - Amount of points needed
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{hasEnough: boolean, currentPoints: number, error: Error}>} Check result
 */
export const hasEnoughPoints = async (amount, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasEnough: false, currentPoints: 0, error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Get user's current points
    const { points, error } = await getUserPoints(userId);

    if (error) {
      return { hasEnough: false, currentPoints: 0, error };
    }

    return {
      hasEnough: points >= amount,
      currentPoints: points,
      error: null
    };
  } catch (error) {
    console.error('Error checking user points:', error);
    return { hasEnough: false, currentPoints: 0, error };
  }
};

/**
 * Deduct user points
 * @param {number} amount - Amount of points to deduct
 * @param {string} description - Transaction description
 * @param {string} transactionType - Transaction type
 * @param {number} referenceId - Reference ID (optional)
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{success: boolean, message: string, remainingPoints: number, error: Error}>} Deduction result
 */
export const deductPoints = async (amount, description, transactionType, referenceId = null, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'User not logged in',
          remainingPoints: 0,
          error: new Error('User not logged in')
        };
      }
      userId = user.id;
    }

    // 调用数据库函数扣除积分，而不是直接插入记录
    const { data, error } = await supabase.rpc('deduct_user_points', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_transaction_type: transactionType,
      p_reference_id: referenceId
    });

    if (error) {
      console.error('Error deducting points:', error);
      return {
        success: false,
        message: error.message || 'Failed to deduct points',
        remainingPoints: 0,
        error
      };
    }

    // 解析返回的JSON结果
    const result = data || {};

    return {
      success: result.success || false,
      message: result.message || 'Points deducted',
      remainingPoints: result.remaining_points || 0,
      error: null
    };
  } catch (error) {
    console.error('Error deducting user points:', error);
    return {
      success: false,
      message: error.message || 'Failed to deduct points',
      remainingPoints: 0,
      error
    };
  }
};

/**
 * Check if user is the report submitter
 * @param {number} reportId - Report ID
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{isSubmitter: boolean, error: Error}>} Check result
 */
export const isReportSubmitter = async (reportId, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { isSubmitter: false, error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Call database function to check if user is the report submitter
    const { data, error } = await supabase.rpc('is_report_submitter', {
      p_user_id: userId,
      p_report_id: reportId
    });

    if (error) {
      console.error('Error checking if user is report submitter:', error);
      return { isSubmitter: false, error };
    }

    return { isSubmitter: data, error: null };
  } catch (error) {
    console.error('Error checking if user is report submitter:', error);
    return { isSubmitter: false, error };
  }
};

/**
 * Transfer points to another user
 * @param {string} targetUserId - Target user ID to transfer points to
 * @param {number} amount - Amount of points to transfer
 * @param {string} description - Transaction description (optional)
 * @returns {Promise<{success: boolean, message: string, remainingPoints: number, error: Error}>} Transfer result
 */
export const transferPoints = async (targetUserId, amount, description = 'Points transfer') => {
  try {
    // Validate inputs
    if (!targetUserId) {
      return {
        success: false,
        message: 'Target user ID is required',
        remainingPoints: 0,
        error: new Error('Target user ID is required')
      };
    }

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return {
        success: false,
        message: 'Amount must be a positive integer',
        remainingPoints: 0,
        error: new Error('Amount must be a positive integer')
      };
    }

    // Get current user to check if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not logged in',
        remainingPoints: 0,
        error: new Error('User not logged in')
      };
    }

    // Check if trying to transfer to self
    if (user.id === targetUserId) {
      return {
        success: false,
        message: 'Cannot transfer points to yourself',
        remainingPoints: 0,
        error: new Error('Cannot transfer points to yourself')
      };
    }

    // 调用数据库函数转移积分
    const { data, error } = await supabase.rpc('transfer_user_points', {
      p_target_user_id: targetUserId,
      p_amount: amount,
      p_description: description
    });

    if (error) {
      console.error('Error transferring points:', error);
      return {
        success: false,
        message: error.message || 'Failed to transfer points',
        remainingPoints: 0,
        error
      };
    }

    // 解析返回的JSON结果
    const result = data || {};

    return {
      success: result.success || false,
      message: result.message || 'Points transferred successfully',
      remainingPoints: result.remaining_points || 0,
      error: null
    };
  } catch (error) {
    console.error('Error transferring points:', error);
    return {
      success: false,
      message: error.message || 'Failed to transfer points',
      remainingPoints: 0,
      error
    };
  }
};

// Export default points configuration
export const POINTS_CONFIG = DEFAULT_POINTS;

// Export default object
export default {
  getUserPoints,
  getPointTransactions,
  hasEnoughPoints,
  deductPoints,
  isReportSubmitter,
  transferPoints,
  POINTS_CONFIG
};
