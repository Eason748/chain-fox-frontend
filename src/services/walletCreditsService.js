/**
 * Wallet Credits Service
 * Provides functionality related to wallet credits operations
 */

import { supabase } from './supabase';

/**
 * Get credits by wallet address
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<{credits: number, error: Error}>} Wallet credits information
 */
export const getCreditsByWallet = async (walletAddress) => {
  try {
    if (!walletAddress) {
      return { credits: null, error: new Error('Wallet address is required') };
    }

    // Call database function to get wallet credits
    const { data, error } = await supabase.rpc('get_user_points_by_wallet', {
      p_wallet_address: walletAddress
    });

    if (error) {
      console.error('Error getting wallet credits:', error);
      return { credits: null, error };
    }

    return { credits: data, error: null };
  } catch (error) {
    console.error('Error getting wallet credits:', error);
    return { credits: null, error };
  }
};

/**
 * Get credit transactions by wallet address
 * @param {string} walletAddress - Wallet address
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of transactions per page
 * @returns {Promise<{transactions: Array, error: Error}>} Wallet credit transactions
 */
export const getWalletCreditTransactions = async (walletAddress, page = 1, limit = 10) => {
  try {
    if (!walletAddress) {
      return { transactions: [], error: new Error('Wallet address is required') };
    }

    const offset = (page - 1) * limit;

    // Query wallet credit transactions
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting wallet credit transactions:', error);
      return { transactions: [], error };
    }

    return { transactions: data, error: null };
  } catch (error) {
    console.error('Error getting wallet credit transactions:', error);
    return { transactions: [], error };
  }
};

/**
 * Transfer credits from one wallet to another
 * @param {string} sourceWalletAddress - Source wallet address
 * @param {string} targetWalletAddress - Target wallet address
 * @param {number} amount - Amount to transfer
 * @param {string} description - Transfer description
 * @returns {Promise<{success: boolean, message: string, remainingCredits: number, error: Error}>} Transfer result
 */
export const transferCreditsByWallet = async (sourceWalletAddress, targetWalletAddress, amount, description = 'Wallet transfer') => {
  try {
    if (!sourceWalletAddress) {
      return {
        success: false,
        message: 'Source wallet address is required',
        remainingCredits: 0,
        error: new Error('Source wallet address is required')
      };
    }

    if (!targetWalletAddress) {
      return {
        success: false,
        message: 'Target wallet address is required',
        remainingCredits: 0,
        error: new Error('Target wallet address is required')
      };
    }

    // Validate amount
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        success: false,
        message: 'Amount must be a positive number',
        remainingCredits: 0,
        error: new Error('Invalid amount')
      };
    }

    // Call database function to transfer credits
    const { data, error } = await supabase.rpc('transfer_points_by_wallet', {
      p_source_wallet_address: sourceWalletAddress,
      p_target_wallet_address: targetWalletAddress,
      p_amount: parsedAmount,
      p_description: description
    });

    if (error) {
      console.error('Error transferring credits by wallet:', error);
      return {
        success: false,
        message: error.message || 'Failed to transfer credits',
        remainingCredits: 0,
        error
      };
    }

    return {
      success: data.success,
      message: data.message,
      remainingCredits: data.remaining_points,
      targetCredits: data.target_points,
      error: null
    };
  } catch (error) {
    console.error('Error transferring credits by wallet:', error);
    return {
      success: false,
      message: error.message || 'Failed to transfer credits',
      remainingCredits: 0,
      error
    };
  }
};

export default {
  getCreditsByWallet,
  getWalletCreditTransactions,
  transferCreditsByWallet
};
