/**
 * Credits Service
 * Provides functionality related to user credits
 */

import supabase from './supabase';

// Default credits configuration
const DEFAULT_CREDITS = {
  VIEW_REPORT: 10,  // Credits needed to view a report
  SUBMIT_REPOSITORY: 100  // Credits needed to submit a repository
};

/**
 * Get user credits
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{credits: number, error: Error}>} User credits information
 */
export const getUserCredits = async (userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { credits: null, error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Call database function to get user credits
    const { data, error } = await supabase.rpc('get_user_points', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting user credits:', error);
      return { credits: null, error };
    }

    return { credits: data, error: null };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return { credits: null, error };
  }
};

/**
 * Get user credit transactions
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @param {number} limit - Limit the number of returned records
 * @param {number} offset - Pagination offset
 * @returns {Promise<{transactions: Array, error: Error}>} User credit transactions
 */
export const getCreditTransactions = async (userId = null, limit = 10, offset = 0) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { transactions: [], error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Query user credit transactions
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting user credit transactions:', error);
      return { transactions: [], error };
    }

    return { transactions: data, error: null };
  } catch (error) {
    console.error('Error getting user credit transactions:', error);
    return { transactions: [], error };
  }
};

/**
 * Check if user has enough credits
 * @param {number} amount - Amount of credits needed
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{hasEnough: boolean, currentCredits: number, error: Error}>} Check result
 */
export const hasEnoughCredits = async (amount, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasEnough: false, currentCredits: 0, error: new Error('User not logged in') };
      }
      userId = user.id;
    }

    // Get user's current credits
    const { credits, error } = await getUserCredits(userId);

    if (error) {
      return { hasEnough: false, currentCredits: 0, error };
    }

    return {
      hasEnough: credits >= amount,
      currentCredits: credits,
      error: null
    };
  } catch (error) {
    console.error('Error checking user credits:', error);
    return { hasEnough: false, currentCredits: 0, error };
  }
};

/**
 * Deduct user credits
 * @param {number} amount - Amount of credits to deduct
 * @param {string} description - Transaction description
 * @param {string} transactionType - Transaction type
 * @param {number} referenceId - Reference ID (optional)
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{success: boolean, message: string, remainingCredits: number, error: Error}>} Deduction result
 */
export const deductCredits = async (amount, description, transactionType, referenceId = null, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'User not logged in',
          remainingCredits: 0,
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
      console.error('Error deducting credits:', error);
      return {
        success: false,
        message: error.message || 'Failed to deduct credits',
        remainingCredits: 0,
        error
      };
    }

    // 解析返回的JSON结果
    const result = data || {};

    return {
      success: result.success || false,
      message: result.message || 'Credits deducted',
      remainingCredits: result.remaining_points || 0,
      error: null
    };
  } catch (error) {
    console.error('Error deducting user credits:', error);
    return {
      success: false,
      message: error.message || 'Failed to deduct credits',
      remainingCredits: 0,
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
 * Transfer credits to another user
 * @param {string} targetUserId - Target user ID to transfer credits to
 * @param {number} amount - Amount of credits to transfer
 * @param {string} description - Transaction description (optional)
 * @returns {Promise<{success: boolean, message: string, remainingCredits: number, error: Error}>} Transfer result
 */
export const transferCredits = async (targetUserId, amount, description = 'Credits transfer') => {
  try {
    // Validate inputs
    if (!targetUserId) {
      return {
        success: false,
        message: 'Target user ID is required',
        remainingCredits: 0,
        error: new Error('Target user ID is required')
      };
    }

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return {
        success: false,
        message: 'Amount must be a positive integer',
        remainingCredits: 0,
        error: new Error('Amount must be a positive integer')
      };
    }

    // Get current user to check if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not logged in',
        remainingCredits: 0,
        error: new Error('User not logged in')
      };
    }

    // Check if trying to transfer to self
    if (user.id === targetUserId) {
      return {
        success: false,
        message: 'Cannot transfer credits to yourself',
        remainingCredits: 0,
        error: new Error('Cannot transfer credits to yourself')
      };
    }

    // 调用数据库函数转移积分
    const { data, error } = await supabase.rpc('transfer_user_points', {
      p_target_user_id: targetUserId,
      p_amount: amount,
      p_description: description
    });

    if (error) {
      console.error('Error transferring credits:', error);
      return {
        success: false,
        message: error.message || 'Failed to transfer credits',
        remainingCredits: 0,
        error
      };
    }

    // 解析返回的JSON结果
    const result = data || {};

    return {
      success: result.success || false,
      message: result.message || 'Credits transferred successfully',
      remainingCredits: result.remaining_points || 0,
      error: null
    };
  } catch (error) {
    console.error('Error transferring credits:', error);
    return {
      success: false,
      message: error.message || 'Failed to transfer credits',
      remainingCredits: 0,
      error
    };
  }
};

// Export default credits configuration
export const CREDITS_CONFIG = DEFAULT_CREDITS;

// Export default object
export default {
  getUserCredits,
  getCreditTransactions,
  hasEnoughCredits,
  deductCredits,
  isReportSubmitter,
  transferCredits,
  CREDITS_CONFIG
};
