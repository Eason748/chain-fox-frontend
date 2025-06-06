/**
 * Credits Burn Service
 * Provides functionality for burning credits to receive CFX tokens
 */

import { supabase } from './supabase';

/**
 * Check if user can submit a new burn request
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{canSubmit: boolean, reason: string, message: string, currentBalance: number, exchangeRate: number, error: Error}>}
 */
export const checkCanSubmitBurnRequest = async (userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          canSubmit: false, 
          reason: 'NOT_LOGGED_IN',
          message: 'User not logged in',
          currentBalance: 0,
          exchangeRate: 10,
          error: new Error('User not logged in') 
        };
      }
      userId = user.id;
    }

    // Call database function to check if user can submit request
    const { data, error } = await supabase.rpc('check_user_can_submit_request', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error checking burn request eligibility:', error);
      return { 
        canSubmit: false, 
        reason: 'DATABASE_ERROR',
        message: error.message || 'Failed to check eligibility',
        currentBalance: 0,
        exchangeRate: 10,
        error 
      };
    }

    const result = data || {};
    const resultData = result.data || {};

    return {
      canSubmit: resultData.can_submit || false,
      reason: resultData.reason || 'UNKNOWN',
      message: resultData.message || 'Unknown status',
      currentBalance: resultData.current_balance || 0,
      exchangeRate: resultData.exchange_rate || 10,
      pendingRequestId: resultData.pending_request_id || null,
      error: null
    };
  } catch (error) {
    console.error('Error checking burn request eligibility:', error);
    return { 
      canSubmit: false, 
      reason: 'EXCEPTION',
      message: error.message || 'Failed to check eligibility',
      currentBalance: 0,
      exchangeRate: 10,
      error 
    };
  }
};

/**
 * Create a burn request and immediately deduct credits
 * @param {number} burnAmount - Amount of credits to burn (100-10000)
 * @param {string} walletAddress - Target wallet address for CFX
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{success: boolean, message: string, data: Object, error: Error}>}
 */
export const createBurnRequest = async (burnAmount, walletAddress, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'User not logged in',
          data: null,
          error: new Error('User not logged in')
        };
      }
      userId = user.id;
    }

    // Validate inputs
    const parsedAmount = parseInt(burnAmount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 100 || parsedAmount > 10000) {
      return {
        success: false,
        message: 'Burn amount must be between 100 and 10,000 credits',
        data: null,
        error: new Error('Invalid burn amount')
      };
    }

    if (!walletAddress || walletAddress.trim().length === 0) {
      return {
        success: false,
        message: 'Wallet address is required',
        data: null,
        error: new Error('Invalid wallet address')
      };
    }

    // Call database function to create burn request
    const { data, error } = await supabase.rpc('create_burn_request_immediate', {
      p_user_id: userId,
      p_burn_amount: parsedAmount,
      p_wallet_address: walletAddress.trim()
    });

    if (error) {
      console.error('Error creating burn request:', error);
      return {
        success: false,
        message: error.message || 'Failed to create burn request',
        data: null,
        error
      };
    }

    const result = data || {};

    return {
      success: result.success || false,
      message: result.message || (result.success ? 'Burn request created successfully' : 'Failed to create burn request'),
      data: result.data || null,
      error: result.success ? null : new Error(result.message || 'Unknown error')
    };
  } catch (error) {
    console.error('Error creating burn request:', error);
    return {
      success: false,
      message: error.message || 'Failed to create burn request',
      data: null,
      error
    };
  }
};

/**
 * Get user's burn request history
 * @param {number} limit - Number of requests to fetch (default: 20)
 * @param {number} offset - Offset for pagination (default: 0)
 * @param {string} userId - User ID, if not provided, uses the current logged-in user
 * @returns {Promise<{success: boolean, requests: Array, totalCount: number, error: Error}>}
 */
export const getUserBurnRequests = async (limit = 20, offset = 0, userId = null) => {
  try {
    // If userId is not provided, get the current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          requests: [],
          totalCount: 0,
          error: new Error('User not logged in')
        };
      }
      userId = user.id;
    }

    // Call database function to get user burn requests
    const { data, error } = await supabase.rpc('get_user_burn_requests', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset
    });

    console.log('RPC call result:', { data, error, userId }); // Debug log

    if (error) {
      console.error('Error getting user burn requests:', error);
      return {
        success: false,
        requests: [],
        totalCount: 0,
        error
      };
    }

    const result = data || {};

    // Check if the database function returned an error in the JSON response
    if (result.success === false) {
      console.error('Database function returned error:', result);
      return {
        success: false,
        requests: [],
        totalCount: 0,
        error: new Error(result.message || result.error || 'Database function failed')
      };
    }

    const resultData = result.data || {};

    console.log('Parsed result:', { result, resultData }); // Debug log

    return {
      success: result.success || false,
      requests: resultData.requests || [],
      totalCount: resultData.total_count || 0,
      limit: resultData.limit || limit,
      offset: resultData.offset || offset,
      error: null
    };
  } catch (error) {
    console.error('Error getting user burn requests:', error);
    return {
      success: false,
      requests: [],
      totalCount: 0,
      error
    };
  }
};

/**
 * Calculate expected CFX amount for a given burn amount
 * @param {number} burnAmount - Amount of credits to burn
 * @returns {number} Expected CFX amount (burnAmount * 10)
 */
export const calculateExpectedCfx = (burnAmount) => {
  const parsedAmount = parseInt(burnAmount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return 0;
  }
  return parsedAmount * 10; // Fixed exchange rate: 1 credit = 10 CFX
};

// Export default object
export default {
  checkCanSubmitBurnRequest,
  createBurnRequest,
  getUserBurnRequests,
  calculateExpectedCfx
};
