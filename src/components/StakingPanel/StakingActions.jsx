import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StakingService from '../../services/stakingService/index.js';
import StakingRewardsService from '../../services/stakingRewardsService.js';
import { notify } from '../ui/Notification';

const StakingActions = ({
  isStaking,
  setIsStaking,
  stakeAmount,
  setStakeAmount,
  loading,
  setLoading,
  cfxBalance,
  hasStakeAccount,
  userStakeInfo,
  canWithdraw,
  withdrawalClicked,
  setWithdrawalClicked,
  rewardsInfo,
  claimingRewards,
  setClaimingRewards,
  user,
  address,
  stakingService,
  loadData,
  loadRewardsInfo
}) => {
  // 检查是否有未领取的奖励
  const hasUnclaimedRewards = () => {
    return rewardsInfo &&
           rewardsInfo.is_eligible &&
           rewardsInfo.available_rewards > 0 &&
           user &&
           address;
  };

  // 自动领取奖励的辅助函数
  const autoClaimRewards = async () => {
    if (!hasUnclaimedRewards()) {
      return { success: true, message: 'No rewards to claim' };
    }

    try {
      console.log('🎯 Auto-claiming rewards before withdrawal request...');
      const result = await StakingRewardsService.claimStakingRewards(address);

      if (result.success) {
        notify.success(`Auto-claimed ${StakingRewardsService.formatRewardsAmount(result.data.claimed_amount)} Credits before withdrawal!`);
        // 重新加载奖励信息
        await loadRewardsInfo();
        return { success: true, claimedAmount: result.data.claimed_amount };
      } else {
        console.error('Auto-claim failed:', result);
        return { success: false, error: result.message || 'Failed to auto-claim rewards' };
      }
    } catch (error) {
      console.error('Auto-claim error:', error);
      return { success: false, error: error.message || 'Failed to auto-claim rewards' };
    }
  };
  // Handle stake form submission
  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakingService || !stakeAmount) return;

    setLoading(true);
    try {
      // Convert to smallest unit using StakingService helper
      const amount = StakingService.parseCfxAmount(stakeAmount);

      // Check CFX balance first
      if (!cfxBalance || cfxBalance <= 0) {
        notify.error('Insufficient CFX balance. Please ensure you have CFX tokens in your wallet.');
        return;
      }

      // Validate minimum amount
      const MIN_STAKE_AMOUNT = 10000000000; // 10,000 CFX in smallest units
      if (parseInt(amount) < MIN_STAKE_AMOUNT) {
        notify.error('Minimum stake amount is 10,000 CFX');
        return;
      }

      // Check if user has enough balance
      const stakeAmountNum = parseFloat(stakeAmount);
      if (stakeAmountNum > cfxBalance) {
        notify.error(`Insufficient balance. You have ${cfxBalance.toFixed(4)} CFX but trying to stake ${stakeAmount} CFX.`);
        return;
      }

      const result = await stakingService.stake(amount);
      if (result.success) {
        if (result.accountCreated) {
          notify.success('Stake account created and tokens staked successfully!');
        } else {
          notify.success(`Successfully staked ${stakeAmount} CFX!`);
        }
        setIsStaking(false);
        setStakeAmount('');
        await loadData(); // Reload data
      } else {
        const errorMessage = result.error || result.message || 'Failed to stake tokens';

        // 检查是否是用户取消交易
        if (errorMessage.includes('用户取消了交易') ||
            errorMessage.includes('User rejected') ||
            errorMessage.includes('User denied') ||
            errorMessage.includes('User cancelled')) {
          // 用户取消交易时不显示错误消息，只是静默恢复按钮状态
        } else {
          // 其他错误才显示错误消息
          notify.error(errorMessage);
        }
      }
    } catch (error) {
      // 检查是否是用户取消相关的错误
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('User rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('User cancelled') ||
          errorMessage.includes('用户取消')) {
        // 用户取消交易时不显示错误消息
      } else {
        notify.error('Failed to stake tokens');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal request
  const handleRequestWithdrawal = async () => {
    if (!stakingService) {
      notify.error('Staking service not available');
      return;
    }

    setLoading(true);
    try {
      // 🔒 第一重保护：检查是否有未领取的奖励，如果有则自动领取
      if (hasUnclaimedRewards()) {
        notify.info('You have unclaimed rewards. Auto-claiming before withdrawal request...');

        const claimResult = await autoClaimRewards();
        if (!claimResult.success) {
          notify.error(`Failed to claim rewards before withdrawal: ${claimResult.error}`);
          return;
        }
      }

      // 执行提取请求
      const result = await stakingService.requestWithdrawal();
      if (result.success) {
        notify.success('Withdrawal requested successfully!');
        await loadData(); // Reload data
      } else {
        const errorMessage = result.error || result.message || 'Failed to request withdrawal';

        // 检查是否是用户取消交易
        if (errorMessage.includes('用户取消了交易') ||
            errorMessage.includes('User rejected') ||
            errorMessage.includes('User denied') ||
            errorMessage.includes('User cancelled')) {
          // 用户取消交易时不显示错误消息，只是静默恢复按钮状态
        } else {
          // 其他错误才显示错误消息
          notify.error(errorMessage);
        }
      }
    } catch (error) {
      // 检查是否是用户取消相关的错误
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('User rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('User cancelled') ||
          errorMessage.includes('用户取消')) {
        // 用户取消交易时不显示错误消息
      } else {
        notify.error('Failed to request withdrawal');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!stakingService) {
      notify.error('Staking service not available');
      return;
    }

    // 立即设置按钮为已点击状态，防止重复点击
    setWithdrawalClicked(true);
    setLoading(true);

    try {
      // 🔒 第二重保护：在最终提取前再次检查并自动领取未领取的奖励
      if (hasUnclaimedRewards()) {
        notify.info('You have unclaimed rewards. Auto-claiming before final withdrawal...');

        const claimResult = await autoClaimRewards();
        if (!claimResult.success) {
          notify.error(`Failed to claim rewards before withdrawal: ${claimResult.error}`);
          // 如果自动领取失败，仍然继续提取流程，但给用户警告
          notify.warning('Continuing with withdrawal despite claim failure. Please manually claim rewards later if needed.');
        }
      }

      const result = await stakingService.withdraw();
      if (result.success) {
        notify.success('Withdrawal completed successfully!');
        // 提取成功后立即刷新数据
        await loadData();
      } else {
        const errorMessage = result.error || result.message || 'Failed to withdraw tokens';

        // 检查是否是用户取消交易
        if (errorMessage.includes('用户取消了交易') ||
            errorMessage.includes('User rejected') ||
            errorMessage.includes('User denied') ||
            errorMessage.includes('User cancelled')) {
          // 用户取消交易时不显示错误消息，只是静默恢复按钮状态
        } else {
          // 其他错误才显示错误消息
          notify.error(errorMessage);
        }

        // 如果提取失败，也要刷新数据以获取最新状态
        await loadData();
      }
    } catch (error) {
      // 检查是否是用户取消相关的错误
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('User rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('User cancelled') ||
          errorMessage.includes('用户取消')) {
        // 用户取消交易时不显示错误消息
      } else {
        notify.error('Failed to withdraw tokens');
      }

      // 发生错误时也要刷新数据
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  // Handle claim rewards
  const handleClaimRewards = async () => {
    // Check wallet connection first
    if (!address) {
      notify.error('Wallet not connected');
      return;
    }

    // Check Supabase authentication
    if (!user) {
      notify.error('Please log in to claim rewards');
      return;
    }

    setClaimingRewards(true);
    try {
      const result = await StakingRewardsService.claimStakingRewards(address);

      if (result.success) {
        notify.success(`Successfully claimed ${StakingRewardsService.formatRewardsAmount(result.data.claimed_amount)} points!`);
        // 重新加载奖励信息
        await loadRewardsInfo();
      } else {
        // 根据错误类型显示不同的错误消息
        let errorMessage = 'Failed to claim rewards';

        switch (result.error) {
          case 'AUTHENTICATION_REQUIRED':
            errorMessage = 'Please log in to claim rewards';
            break;
          case 'WALLET_NOT_VERIFIED':
            errorMessage = 'Wallet not verified. Please verify your wallet first.';
            break;
          case 'NO_STAKING_ACCOUNT':
            errorMessage = 'No staking account found';
            break;
          case 'WITHDRAWAL_REQUESTED':
            errorMessage = 'Cannot claim rewards after withdrawal request';
            break;
          case 'NO_REWARDS_AVAILABLE':
            errorMessage = 'No rewards available to claim at this time';
            break;
          case 'CLAIM_TOO_FREQUENT':
            errorMessage = 'Please wait before claiming again';
            break;
          default:
            errorMessage = result.message || 'Failed to claim rewards';
        }

        notify.error(errorMessage);
      }
    } catch (error) {
      notify.error('Failed to claim rewards');
    } finally {
      setClaimingRewards(false);
    }
  };

  return (
    <>
      {/* Staking Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Staking Information
        </h3>

        <p className="text-gray-300 mb-4">
          Stake your CFX tokens to participate in the Chain-Fox ecosystem and earn Credits rewards.
          <br/>
          <span className="text-yellow-300 text-sm">Note: You stake CFX tokens to earn Credits. CFX and Credits are different assets.</span>
        </p>

        {/* 未领取奖励警告 */}
        {hasUnclaimedRewards() && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⚠️</span>
              <div>
                <p className="text-yellow-300 font-medium text-sm">
                  Unclaimed Rewards Available
                </p>
                <p className="text-yellow-200 text-xs mt-1">
                  You have {StakingRewardsService.formatRewardsAmount(rewardsInfo.available_rewards)} Credits ready to claim.
                  These will be automatically claimed if you request withdrawal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staking Actions */}
      <div className="flex flex-wrap gap-4">
        {!isStaking && (
          <>
            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              onClick={() => setIsStaking(true)}
              disabled={loading}
            >
              {hasStakeAccount ? 'Stake' : 'Start Staking'}
            </motion.button>

            {userStakeInfo && parseInt(userStakeInfo.stakedAmount.toString()) > 0 && (
              <motion.button
                whileHover={!userStakeInfo.withdrawalRequested && !loading ? { scale: 1.05 } : {}}
                whileTap={!userStakeInfo.withdrawalRequested && !loading ? { scale: 0.95 } : {}}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  userStakeInfo.withdrawalRequested
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-orange-600 hover:bg-orange-500'
                } disabled:opacity-50`}
                onClick={userStakeInfo.withdrawalRequested ? undefined : handleRequestWithdrawal}
                disabled={loading || userStakeInfo.withdrawalRequested}
                title={
                  userStakeInfo.withdrawalRequested
                    ? 'Withdrawal already requested'
                    : 'Request withdrawal'
                }
              >
                {loading && !userStakeInfo.withdrawalRequested
                  ? 'Processing...'
                  : userStakeInfo.withdrawalRequested
                  ? 'UnStaked'
                  : 'UnStake'
                }
              </motion.button>
            )}

            {userStakeInfo?.withdrawalRequested && canWithdraw && (
              <motion.button
                whileHover={!loading && !withdrawalClicked ? { scale: 1.05 } : {}}
                whileTap={!loading && !withdrawalClicked ? { scale: 0.95 } : {}}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  withdrawalClicked
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : hasUnclaimedRewards()
                    ? 'bg-yellow-600 hover:bg-yellow-500'
                    : 'bg-green-600 hover:bg-green-500'
                } disabled:opacity-50`}
                onClick={withdrawalClicked ? undefined : handleWithdraw}
                disabled={loading || withdrawalClicked}
                title={
                  withdrawalClicked
                    ? 'Withdrawal button has been clicked, please refresh page to try again'
                    : 'Withdraw your staked CFX tokens'
                }
              >
                {loading ? 'Withdrawing...' :
                 withdrawalClicked ? 'Withdrawal Clicked' :
                `Withdraw ${StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString())} CFX`}
              </motion.button>
            )}

            {/* Claim Rewards Button */}
            {rewardsInfo && rewardsInfo.is_eligible && rewardsInfo.available_rewards > 0 && (
              <motion.button
                whileHover={!claimingRewards && user ? { scale: 1.05 } : {}}
                whileTap={!claimingRewards && user ? { scale: 0.95 } : {}}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  !user
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
                onClick={handleClaimRewards}
                disabled={claimingRewards || !user}
                title={!user ? 'Please log in to claim rewards' : ''}
              >
                {claimingRewards ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Claiming...
                  </span>
                ) : !user ? (
                  'Login Required to Claim'
                ) : (
                  `Claim ${StakingRewardsService.formatRewardsAmount(rewardsInfo.available_rewards)} Credits`
                )}
              </motion.button>
            )}
          </>
        )}

        {/* Stake Form */}
        {isStaking && (
          <div className="w-full">
            <form onSubmit={handleStake} className="bg-blue-900/30 rounded-lg p-4 border border-white/10">

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Amount</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="10000"
                    max={cfxBalance && cfxBalance > 0 ? cfxBalance : undefined}
                    step="0.01"
                    className="w-full bg-blue-950/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="10000.00"
                    required
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-300">CFX</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Balance: {cfxBalance?.toFixed(4) || '0.0000'} CFX
                </p>
                {(!cfxBalance || cfxBalance <= 0) ? (
                  <p className="text-xs text-red-400 mt-1">
                    Insufficient CFX balance
                  </p>
                ) : (
                  <p className="text-xs text-yellow-400 mt-1">
                    Minimum stake: 10,000 CFX
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={!loading && cfxBalance > 0 ? { scale: 1.05 } : {}}
                  whileTap={!loading && cfxBalance > 0 ? { scale: 0.95 } : {}}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading || !cfxBalance || cfxBalance <= 0}
                >
                  {loading ? 'Staking...' :
                   (!cfxBalance || cfxBalance <= 0) ? 'Insufficient Balance' :
                   'Confirm Stake'}
                </motion.button>

                <motion.button
                  whileHover={!loading ? { scale: 1.05 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setIsStaking(false)}
                  disabled={loading}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default StakingActions;
