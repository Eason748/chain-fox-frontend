/**
 * Wallet Points Service
 * Provides functionality related to wallet points operations
 */

import { supabase } from './supabase';

/**
 * Get points by wallet address
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<{points: number, error: Error}>} Wallet points information
 */
export const getPointsByWallet = async (walletAddress) => {
  try {
    if (!walletAddress) {
      return { points: null, error: new Error('Wallet address is required') };
    }

    // Call database function to get wallet points
    const { data, error } = await supabase.rpc('get_user_points_by_wallet', {
      p_wallet_address: walletAddress
    });

    if (error) {
      console.error('Error getting wallet points:', error);
      return { points: null, error };
    }

    return { points: data, error: null };
  } catch (error) {
    console.error('Error getting wallet points:', error);
    return { points: null, error };
  }
};

/**
 * Get point transactions by wallet address
 * @param {string} walletAddress - Wallet address
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of transactions per page
 * @returns {Promise<{transactions: Array, error: Error}>} Wallet point transactions
 */
export const getWalletPointTransactions = async (walletAddress, page = 1, limit = 10) => {
  try {
    if (!walletAddress) {
      return { transactions: [], error: new Error('Wallet address is required') };
    }

    const offset = (page - 1) * limit;

    // Query wallet point transactions
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting wallet point transactions:', error);
      return { transactions: [], error };
    }

    return { transactions: data, error: null };
  } catch (error) {
    console.error('Error getting wallet point transactions:', error);
    return { transactions: [], error };
  }
};

/**
 * Transfer points from one wallet to another
 * @param {string} sourceWalletAddress - Source wallet address
 * @param {string} targetWalletAddress - Target wallet address
 * @param {number} amount - Amount to transfer
 * @param {string} description - Transfer description
 * @returns {Promise<{success: boolean, message: string, remainingPoints: number, error: Error}>} Transfer result
 */
export const transferPointsByWallet = async (sourceWalletAddress, targetWalletAddress, amount, description = 'Wallet transfer') => {
  try {
    if (!sourceWalletAddress) {
      return {
        success: false,
        message: 'Source wallet address is required',
        remainingPoints: 0,
        error: new Error('Source wallet address is required')
      };
    }

    if (!targetWalletAddress) {
      return {
        success: false,
        message: 'Target wallet address is required',
        remainingPoints: 0,
        error: new Error('Target wallet address is required')
      };
    }

    // Validate amount
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        success: false,
        message: 'Amount must be a positive number',
        remainingPoints: 0,
        error: new Error('Invalid amount')
      };
    }

    // Call database function to transfer points
    const { data, error } = await supabase.rpc('transfer_points_by_wallet', {
      p_source_wallet_address: sourceWalletAddress,
      p_target_wallet_address: targetWalletAddress,
      p_amount: parsedAmount,
      p_description: description
    });

    if (error) {
      console.error('Error transferring points by wallet:', error);
      return {
        success: false,
        message: error.message || 'Failed to transfer points',
        remainingPoints: 0,
        error
      };
    }

    return {
      success: data.success,
      message: data.message,
      remainingPoints: data.remaining_points,
      targetPoints: data.target_points,
      error: null
    };
  } catch (error) {
    console.error('Error transferring points by wallet:', error);
    return {
      success: false,
      message: error.message || 'Failed to transfer points',
      remainingPoints: 0,
      error
    };
  }
};

export default {
  getPointsByWallet,
  getWalletPointTransactions,
  transferPointsByWallet
};
