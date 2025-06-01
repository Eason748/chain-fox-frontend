import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import StakingService, { MIN_STAKE_AMOUNT, MAX_TOTAL_POOL_SIZE } from '../services/stakingService/index.js';
import { notify } from './ui/Notification';
import solanaRpcService from '../services/solanaRpcService';
import programIds from '../data/program-ids.json';

// Helper function: Format time display
const formatTimeDisplay = (timeFormat) => {
  if (!timeFormat) return '';

  switch (timeFormat.type) {
    case 'immediate':
      return 'Available now';
    case 'daysHours':
      // If seconds are available, show more precise time
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.days}d ${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.days} days ${timeFormat.hours} hours`;
    case 'days':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.days}d ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.days} days`;
    case 'hoursMinutes':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.hours} hours ${timeFormat.minutes} minutes`;
    case 'hours':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.hours} hours`;
    case 'minutes':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.minutes} minutes`;
    case 'seconds':
      return `${timeFormat.seconds} seconds`;
    case 'lessThanMinute':
      return 'Less than a minute';
    default:
      return '';
  }
};

// 辅助函数：基于时间戳计算剩余时间
const calculateTimeRemainingFromTimestamp = (endTimestamp) => {
  if (!endTimestamp) return null;

  const now = Date.now();
  const timeRemaining = Math.max(0, endTimestamp - now);

  if (timeRemaining === 0) {
    return { canWithdraw: true, type: 'immediate' };
  }

  const secondsRemaining = Math.ceil(timeRemaining / 1000);
  const days = Math.floor(secondsRemaining / (24 * 60 * 60));
  const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
  const seconds = secondsRemaining % 60;

  if (days > 0) {
    if (hours > 0) {
      return { canWithdraw: false, type: 'daysHours', days, hours, minutes, seconds };
    } else {
      return { canWithdraw: false, type: 'days', days, minutes, seconds };
    }
  } else if (hours > 0) {
    if (minutes > 0) {
      return { canWithdraw: false, type: 'hoursMinutes', hours, minutes, seconds };
    } else {
      return { canWithdraw: false, type: 'hours', hours, minutes, seconds };
    }
  } else if (minutes > 0) {
    return { canWithdraw: false, type: 'minutes', minutes, seconds };
  } else if (seconds > 0) {
    return { canWithdraw: false, type: 'seconds', seconds };
  } else {
    return { canWithdraw: true, type: 'immediate' };
  }
};

// 辅助函数：计算质押时长
const calculateStakingDuration = async (userStakeInfo, stakingService) => {
  if (!userStakeInfo?.lastStakeSlot || !stakingService) return null;

  try {
    const connection = await solanaRpcService.getConnection();
    const currentSlot = await connection.getSlot();
    const lastStakeSlot = parseInt(userStakeInfo.lastStakeSlot);

    // 计算已质押的 slots
    const stakedSlots = Math.max(0, currentSlot - lastStakeSlot);

    // 使用 StakingService 的时间格式化方法
    return StakingService.formatTimeFromSlots(stakedSlots);
  } catch (error) {
    return null;
  }
};

/**
 * StakingPanel component - Displays CFX staking information and controls
 *
 * @param {Object} props - Component props
 * @param {number} props.cfxBalance - User's CFX balance
 * @returns {React.ReactElement}
 */
const StakingPanel = ({ cfxBalance }) => {
  const { isConnected, address, walletService } = useWallet();

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
          // 用户取消交易，静默处理
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
        // 用户取消交易，静默处理
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
          // 用户取消交易，静默处理
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
        // 用户取消交易，静默处理
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
          // 用户取消交易，静默处理
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
        // 用户取消交易，静默处理
      } else {
        notify.error('Failed to withdraw tokens');
      }

      // 发生错误时也要刷新数据
      await loadData();
    } finally {
      setLoading(false);
    }
  };



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
      <h2 className="text-2xl font-bold text-white mb-4">
        CFX Staking
      </h2>

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

      {/* Pool Statistics - Public Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
          <span className="mr-2">🏛️</span>
          Pool Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-purple-300 mb-1">Total Staked</p>
            <p className="text-xl font-bold text-white">
              {stakePoolInfo ? StakingService.formatCfxAmount(stakePoolInfo.totalStaked.toString()) : '--'} CFX
            </p>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-purple-300 mb-1">Vault Balance</p>
            <p className="text-xl font-bold text-white">
              {tokenVaultBalance !== null ? tokenVaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'} CFX
            </p>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-purple-300 mb-1">Lock Duration</p>
            <p className="text-xl font-bold text-white">
              {stakePoolInfo ? formatTimeDisplay(StakingService.formatTimeFromSlots(parseInt(stakePoolInfo.lockDurationSlots))) : '--'}
            </p>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-purple-300 mb-1">Pool Utilization</p>
            <p className="text-xl font-bold text-white">
              {stakePoolInfo ? (
                (() => {
                  const totalStaked = parseInt(stakePoolInfo.totalStaked);
                  const maxCapacity = MAX_TOTAL_POOL_SIZE;
                  const utilization = ((totalStaked / maxCapacity) * 100).toFixed(1);
                  return `${utilization}%`;
                })()
              ) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Your Staking - Personal Information */}
      {userStakeInfo && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Your Staking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <p className="text-sm text-blue-300 mb-1">Your Stake</p>
              <p className="text-xl font-bold text-white">
                {StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString())} CFX
              </p>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <p className="text-sm text-blue-300 mb-1">Staking Duration</p>
              <p className="text-xl font-bold text-white">
                {stakingDuration ? formatTimeDisplay(stakingDuration) : '--'}
              </p>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <p className="text-sm text-blue-300 mb-1">Status</p>
              <p className="text-xl font-bold text-white flex items-center">
                {userStakeInfo.withdrawalRequested ? (
                  canWithdraw ? (
                    <>
                      <span className="text-green-400 mr-2">✅</span>
                      <span className="text-green-400 text-sm">Ready</span>
                    </>
                  ) : (
                    <>
                      <span className="text-orange-400 mr-2">⏳</span>
                      <span className="text-orange-400 text-sm">Pending</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="text-blue-400 mr-2">🔒</span>
                    <span className="text-blue-400 text-sm">Staked</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Status - Compact */}
      {userStakeInfo?.withdrawalRequested && (
        <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-orange-400 font-medium mr-2">🔓</span>
              <span className="text-orange-400 font-medium">
                Withdrawal Requested
              </span>
            </div>

            {(dynamicTimeRemaining || withdrawalTimeInfo) && (
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  (dynamicTimeRemaining?.canWithdraw || withdrawalTimeInfo?.canWithdraw) ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {(dynamicTimeRemaining?.canWithdraw || withdrawalTimeInfo?.canWithdraw) ? (
                    <span className="flex items-center">
                      <span className="mr-1">✅</span>
                      Available Now
                    </span>
                  ) : (
                    formatTimeDisplay(dynamicTimeRemaining || withdrawalTimeInfo?.timeFormat)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staking Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Staking Information
        </h3>

        <p className="text-gray-300 mb-4">
          Stake your CFX tokens to participate in the Chain-Fox ecosystem and earn rewards.
        </p>
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
              {hasStakeAccount ? 'Stake More' : 'Start Staking'}
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
                title={userStakeInfo.withdrawalRequested ? 'Withdrawal already requested' : ''}
              >
                {loading && !userStakeInfo.withdrawalRequested
                  ? 'Processing...'
                  : userStakeInfo.withdrawalRequested
                  ? 'Withdrawal Requested'
                  : 'Request Withdrawal'
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
                    : 'bg-green-600 hover:bg-green-500'
                } disabled:opacity-50`}
                onClick={withdrawalClicked ? undefined : handleWithdraw}
                disabled={loading || withdrawalClicked}
                title={withdrawalClicked ? 'Withdrawal button has been clicked, please refresh page to try again' : ''}
              >
                {loading ? 'Withdrawing...' :
                 withdrawalClicked ? 'Withdrawal Clicked' :
                 `Withdraw ${StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString())} CFX`}
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

    </div>
  );
};

export default StakingPanel;
