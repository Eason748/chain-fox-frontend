// ===============================
// 质押积分奖励服务
// ===============================

import { supabase } from './supabase';

/**
 * 积分奖励服务类
 */
class StakingRewardsService {
  /**
   * 计算质押奖励
   * @param {string} walletAddress - 钱包地址
   * @returns {Promise<Object>} 奖励计算结果
   */
  static async calculateStakingRewards(walletAddress) {
    try {
      if (!walletAddress) {
        return {
          success: false,
          error: 'INVALID_WALLET_ADDRESS',
          message: 'Wallet address is required'
        };
      }

      // 调用边缘函数
      const { data, error } = await supabase.functions.invoke('calculate-staking-rewards', {
        body: {
          wallet_address: walletAddress
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          success: false,
          error: 'EDGE_FUNCTION_ERROR',
          message: error.message || 'Failed to calculate staking rewards',
          details: error
        };
      }

      return data;
    } catch (error) {
      console.error('Calculate staking rewards error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error occurred while calculating rewards',
        details: error.message
      };
    }
  }

  /**
   * 领取质押奖励
   * @param {string} walletAddress - 钱包地址
   * @returns {Promise<Object>} 领取结果
   */
  static async claimStakingRewards(walletAddress) {
    try {
      if (!walletAddress) {
        return {
          success: false,
          error: 'INVALID_WALLET_ADDRESS',
          message: 'Wallet address is required'
        };
      }

      // 检查用户是否已登录
      console.log('StakingRewardsService - 开始获取 session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('StakingRewardsService - Session 检查结果:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        hasAccessToken: !!session?.access_token,
        sessionError: sessionError
      });

      if (sessionError || !session || !session.user) {
        console.error('用户未登录或 session 无效:', {
          sessionError,
          session,
          hasSession: !!session,
          hasUser: !!session?.user
        });
        return {
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to claim staking rewards'
        };
      }

      console.log('StakingRewardsService - 用户已登录，用户ID:', session.user.id);
      console.log('StakingRewardsService - 调用 claim 函数，钱包地址:', walletAddress);
      console.log('StakingRewardsService - Session access_token 长度:', session.access_token?.length || 0);

      // 调用统一的边缘函数，使用 action: 'claim' 参数
      // 明确传递 JWT token
      const { data, error } = await supabase.functions.invoke('calculate-staking-rewards', {
        body: {
          action: 'claim',
          wallet_address: walletAddress
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          success: false,
          error: 'EDGE_FUNCTION_ERROR',
          message: error.message || 'Failed to claim staking rewards',
          details: error
        };
      }

      return data;
    } catch (error) {
      console.error('Claim staking rewards error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error occurred while claiming rewards',
        details: error.message
      };
    }
  }

  /**
   * 获取用户积分奖励历史
   * @param {string} walletAddress - 钱包地址
   * @param {number} page - 页码（从1开始）
   * @param {number} limit - 每页数量
   * @returns {Promise<Object>} 历史记录
   */
  static async getStakingRewardsHistory(walletAddress, page = 1, limit = 10) {
    try {
      if (!walletAddress) {
        return {
          success: false,
          error: 'INVALID_WALLET_ADDRESS',
          message: 'Wallet address is required'
        };
      }

      // 获取当前用户的 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to view rewards history'
        };
      }

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 查询积分奖励历史
      const { data, error } = await supabase
        .from('staking_rewards_claims')
        .select(`
          id,
          claimed_amount,
          staked_amount,
          staking_duration_seconds,
          claim_timestamp,
          claim_slot
        `)
        .eq('wallet_address', walletAddress)
        .eq('user_id', session.user.id)
        .order('claim_timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database query error:', error);
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch rewards history',
          details: error.message
        };
      }

      // 获取总数
      const { count, error: countError } = await supabase
        .from('staking_rewards_claims')
        .select('*', { count: 'exact', head: true })
        .eq('wallet_address', walletAddress)
        .eq('user_id', session.user.id);

      if (countError) {
        console.error('Count query error:', countError);
      }

      return {
        success: true,
        data: {
          records: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }
      };
    } catch (error) {
      console.error('Get staking rewards history error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error occurred while fetching rewards history',
        details: error.message
      };
    }
  }

  /**
   * 格式化积分数量显示
   * @param {number} amount - 积分数量
   * @returns {string} 格式化后的字符串
   */
  static formatRewardsAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0';
    }
    
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * 格式化质押时长显示
   * @param {number} seconds - 秒数
   * @returns {string} 格式化后的时长字符串
   */
  static formatStakingDuration(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) {
      return '0s';
    }

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  /**
   * 验证钱包地址格式
   * @param {string} walletAddress - 钱包地址
   * @returns {boolean} 是否有效
   */
  static validateWalletAddress(walletAddress) {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    
    // Solana 钱包地址使用 Base58 编码，长度通常在32-44字符之间
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(walletAddress);
  }
}

export default StakingRewardsService;
