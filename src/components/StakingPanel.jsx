import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import StakingService from '../services/stakingService/index.js';
import StakingRewardsService from '../services/stakingRewardsService.js';
import { notify } from './ui/Notification';
import solanaRpcService from '../services/solanaRpcService';
import programIds from '../data/program-ids.json';

// Import sub-components
import PoolStatistics from './StakingPanel/PoolStatistics';
import UserStaking from './StakingPanel/UserStaking';
import RewardsStatistics from './StakingPanel/RewardsStatistics';
import UserRewards from './StakingPanel/UserRewards';
import WithdrawalStatus from './StakingPanel/WithdrawalStatus';
import StakingActions from './StakingPanel/StakingActions';

// Import utilities
import {
  calculateTimeRemainingFromTimestamp,
  calculateStakingDuration
} from './StakingPanel/utils';



/**
 * StakingPanel component - Displays CFX staking information and controls
 *
 * @param {Object} props - Component props
 * @param {number} props.cfxBalance - User's CFX balance
 * @returns {React.ReactElement}
 */
const StakingPanel = ({ cfxBalance }) => {
  const { isConnected, address, walletService } = useWallet();
  const { user } = useAuth();

  // UI state
  const [isStaking, setIsStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Data state
  const [stakingService, setStakingService] = useState(null);
  const [stakePoolInfo, setStakePoolInfo] = useState(null);
  const [userStakeInfo, setUserStakeInfo] = useState(null);
  const [hasStakeAccount, setHasStakeAccount] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawalTimeInfo, setWithdrawalTimeInfo] = useState(null);
  const [tokenVaultBalance, setTokenVaultBalance] = useState(null);

  // 动态倒计时状态
  const [dynamicTimeRemaining, setDynamicTimeRemaining] = useState(null);
  const [countdownEndTime, setCountdownEndTime] = useState(null); // 倒计时结束的时间戳

  // 简化的提取按钮状态
  const [withdrawalClicked, setWithdrawalClicked] = useState(false);

  // 质押时长状态
  const [stakingDuration, setStakingDuration] = useState(null);

  // 积分奖励状态
  const [rewardsInfo, setRewardsInfo] = useState(null);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [claimingRewards, setClaimingRewards] = useState(false);

  // 积分释放系统统计状态
  const [rewardsStatistics, setRewardsStatistics] = useState(null);

  // Initialize staking service when wallet changes
  useEffect(() => {
    const initStakingService = async () => {
      if (isConnected && address && walletService) {
        try {
          // Get connection from solana RPC service
          const connection = await solanaRpcService.getConnection();
          if (connection) {
            // Create a wallet adapter compatible object
            const walletAdapter = {
              publicKey: walletService.adapter?.publicKey,
              signTransaction: walletService.adapter?.signTransaction?.bind(walletService.adapter)
            };

            const service = new StakingService(connection, walletAdapter);
            setStakingService(service);
          }
        } catch (error) {
          setStakingService(null);
        }
      } else {
        setStakingService(null);
      }
    };

    initStakingService();
  }, [isConnected, address, walletService]);

  // Load data when staking service is available
  useEffect(() => {
    if (stakingService) {
      loadData();
    }
  }, [stakingService]);

  // Load staking data
  const loadData = async () => {
    if (!stakingService) return;

    setLoading(true);
    try {
      // Load stake pool info
      const poolResult = await stakingService.getStakePoolInfo();
      if (poolResult.success) {
        setStakePoolInfo(poolResult.data);
      }

      // Load user stake info
      const userResult = await stakingService.getUserStakeInfo();
      const hasAccount = userResult.success && userResult.data !== null;
      setHasStakeAccount(hasAccount);

      if (hasAccount && userResult.data) {
        setUserStakeInfo(userResult.data);

        // Get withdrawal time information
        const timeInfo = await stakingService.getWithdrawalTimeRemaining();
        setWithdrawalTimeInfo(timeInfo);

        // Use the canWithdraw from timeInfo for consistency
        setCanWithdraw(timeInfo.canWithdraw);

        // Calculate staking duration
        const duration = await calculateStakingDuration(userResult.data, stakingService);
        setStakingDuration(duration);
      } else {
        setUserStakeInfo(null);
        setCanWithdraw(false);
        setWithdrawalTimeInfo(null);
        setStakingDuration(null);
      }

      // Load token vault balance
      await loadTokenVaultBalance();

      // Load rewards info if user has staking, otherwise just load system statistics
      if (hasAccount && userResult.data) {
        await loadRewardsInfo();
      } else {
        setRewardsInfo(null);
        // 即使没有用户质押，也加载系统统计信息
        await loadSystemStatistics();
      }
    } catch (error) {
      notify.error('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  };

  // Load token vault balance
  const loadTokenVaultBalance = async () => {
    try {
      const connection = await solanaRpcService.getConnection();
      const tokenVaultAddress = programIds.deployed_accounts.token_vault.address;

      // Import PublicKey from web3.js
      const { PublicKey } = await import('@solana/web3.js');

      // Query token vault balance using Solana RPC
      const tokenVaultInfo = await connection.getParsedAccountInfo(
        new PublicKey(tokenVaultAddress)
      );

      if (tokenVaultInfo.value && tokenVaultInfo.value.data.parsed) {
        const tokenAmount = tokenVaultInfo.value.data.parsed.info.tokenAmount;
        setTokenVaultBalance(parseFloat(tokenAmount.uiAmount) || 0);
      } else {
        setTokenVaultBalance(0);
      }
    } catch (error) {
      // 移除生产环境日志
      setTokenVaultBalance(0);
    }
  };

  // Load rewards info
  const loadRewardsInfo = async () => {
    if (!address) return;

    setRewardsLoading(true);
    try {
      const result = await StakingRewardsService.calculateStakingRewards(address);
      if (result.success) {
        setRewardsInfo(result.data);
        // 同时保存积分释放系统统计信息
        if (result.data.rewards_statistics) {
          setRewardsStatistics(result.data.rewards_statistics);
        }
      } else {
        // 如果是没有质押账户或其他正常情况，不显示错误
        if (result.error !== 'NO_STAKING_ACCOUNT' && result.error !== 'WITHDRAWAL_REQUESTED') {
          console.error('Failed to load rewards info:', result.message);
        }
        setRewardsInfo(null);
        setRewardsStatistics(null);
      }
    } catch (error) {
      console.error('Load rewards info error:', error);
      setRewardsInfo(null);
      setRewardsStatistics(null);
    } finally {
      setRewardsLoading(false);
    }
  };

  // Load system statistics only (without user-specific rewards)
  const loadSystemStatistics = async () => {
    if (!address) return;

    try {
      // 使用一个虚拟地址来获取系统统计信息
      const result = await StakingRewardsService.calculateStakingRewards(address);
      if (result.success && result.data.rewards_statistics) {
        setRewardsStatistics(result.data.rewards_statistics);
      }
    } catch (error) {
      console.error('Load system statistics error:', error);
    }
  };



  // 初始化倒计时结束时间
  useEffect(() => {
    if (!userStakeInfo?.withdrawalRequested || !userStakeInfo?.unlockSlot) {
      setDynamicTimeRemaining(null);
      setCountdownEndTime(null);
      return;
    }

    const initializeCountdown = async () => {
      try {
        if (stakingService) {
          // 获取当前 slot
          const connection = await solanaRpcService.getConnection();
          const currentSlot = await connection.getSlot();

          // 计算剩余 slots
          const unlockSlot = parseInt(userStakeInfo.unlockSlot);
          const slotsRemaining = Math.max(0, unlockSlot - currentSlot);

          if (slotsRemaining === 0) {
            setDynamicTimeRemaining({ canWithdraw: true, type: 'immediate' });
            setCountdownEndTime(null);
            setCanWithdraw(true);
            setWithdrawalClicked(false); // 重置提取按钮状态
          } else {
            // 每个 slot 大约 400ms，计算结束时间戳
            const millisecondsRemaining = slotsRemaining * 400;
            const endTime = Date.now() + millisecondsRemaining;
            setCountdownEndTime(endTime);
          }
        }
      } catch (error) {
        // 移除生产环境日志
      }
    };

    initializeCountdown();
  }, [userStakeInfo, stakingService]);

  // 前端倒计时 - 每秒更新一次
  useEffect(() => {
    if (!countdownEndTime) {
      return;
    }

    const updateCountdown = () => {
      const timeRemaining = calculateTimeRemainingFromTimestamp(countdownEndTime);
      setDynamicTimeRemaining(timeRemaining);

      // 如果可以提取了，更新 canWithdraw 状态并重置 withdrawalClicked
      if (timeRemaining?.canWithdraw && !canWithdraw) {
        setCanWithdraw(true);
        setWithdrawalClicked(false); // 重置提取按钮状态
      }
    };

    // 立即执行一次
    updateCountdown();

    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [countdownEndTime, canWithdraw]);

  // 定期刷新积分奖励信息
  useEffect(() => {
    if (!userStakeInfo || !address || userStakeInfo.withdrawalRequested) {
      return;
    }

    // 每30秒刷新一次积分奖励信息
    const rewardsInterval = setInterval(() => {
      loadRewardsInfo();
    }, 30000); // 30秒

    return () => clearInterval(rewardsInterval);
  }, [userStakeInfo, address]);





  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            CFX Staking
          </h3>
          <p className="text-gray-300 mb-4">
            Please connect your Solana wallet to access staking features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">

      {/* Info about automatic account creation */}
      {!hasStakeAccount && (
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Ready to Stake
          </h3>
          <p className="text-gray-300">
            Your staking account will be created automatically when you make your first stake.
          </p>
        </div>
      )}

      {/* Pool Statistics */}
      <PoolStatistics
        stakePoolInfo={stakePoolInfo}
        tokenVaultBalance={tokenVaultBalance}
      />

      {/* User Staking */}
      <UserStaking
        userStakeInfo={userStakeInfo}
        stakingDuration={stakingDuration}
        canWithdraw={canWithdraw}
      />


      {/* Rewards Statistics */}
      <RewardsStatistics rewardsStatistics={rewardsStatistics} />

      {/* User Rewards */}
      <UserRewards
        userStakeInfo={userStakeInfo}
        stakePoolInfo={stakePoolInfo}
        rewardsInfo={rewardsInfo}
        rewardsStatistics={rewardsStatistics}
      />

      {/* Withdrawal Status */}
      <WithdrawalStatus
        userStakeInfo={userStakeInfo}
        canWithdraw={canWithdraw}
        dynamicTimeRemaining={dynamicTimeRemaining}
        withdrawalTimeInfo={withdrawalTimeInfo}
      />

      {/* Staking Actions */}
      <StakingActions
        isStaking={isStaking}
        setIsStaking={setIsStaking}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        loading={loading}
        setLoading={setLoading}
        cfxBalance={cfxBalance}
        hasStakeAccount={hasStakeAccount}
        userStakeInfo={userStakeInfo}
        canWithdraw={canWithdraw}
        withdrawalClicked={withdrawalClicked}
        setWithdrawalClicked={setWithdrawalClicked}
        rewardsInfo={rewardsInfo}
        claimingRewards={claimingRewards}
        setClaimingRewards={setClaimingRewards}
        user={user}
        address={address}
        stakingService={stakingService}
        loadData={loadData}
        loadRewardsInfo={loadRewardsInfo}
      />

    </div>
  );
};

export default StakingPanel;
