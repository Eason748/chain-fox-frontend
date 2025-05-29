import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import StakingService, { MIN_STAKE_AMOUNT } from '../services/stakingService';
import { notify } from './ui/Notification';
import solanaRpcService from '../services/solanaRpcService';

/**
 * StakingPanel component - Displays CFX staking information and controls
 *
 * @param {Object} props - Component props
 * @param {number} props.cfxBalance - User's CFX balance
 * @returns {React.ReactElement}
 */
const StakingPanel = ({ cfxBalance }) => {
  const { t, i18n, ready } = useTranslation(['profile', 'common']);
  const { isConnected, address, walletService } = useWallet();

  // UI state
  const [isStaking, setIsStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Data state
  const [stakingService, setStakingService] = useState(null);
  const [stakePoolInfo, setStakePoolInfo] = useState(null);
  const [userStakeInfo, setUserStakeInfo] = useState(null);
  const [hasStakeAccount, setHasStakeAccount] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawalTimeInfo, setWithdrawalTimeInfo] = useState(null);

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
          console.error('Failed to initialize staking service:', error);
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

        // Check if withdrawal is available
        const canWithdrawResult = await stakingService.canWithdraw();
        setCanWithdraw(canWithdrawResult);

        // Get withdrawal time information
        const timeInfo = await stakingService.getWithdrawalTimeRemaining();
        setWithdrawalTimeInfo(timeInfo);
      } else {
        setUserStakeInfo(null);
        setCanWithdraw(false);
        setWithdrawalTimeInfo(null);
      }
    } catch (error) {
      console.error('Failed to load staking data:', error);
      notify.error('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  };

  // Debug i18n loading and force reload if needed
  useEffect(() => {
    console.log('StakingPanel: i18n status', {
      ready,
      language: i18n.language,
      hasLoadedProfile: i18n.hasResourceBundle(i18n.language, 'profile'),
      hasLoadedCommon: i18n.hasResourceBundle(i18n.language, 'common')
    });

    // Always force reload profile namespace to ensure translations are loaded
    console.log('StakingPanel: Loading profile namespace');
    i18n.loadNamespaces(['profile', 'common']).then(() => {
      console.log('StakingPanel: Profile namespace loaded');

      // Force a reload of the translations
      const profileTranslations = i18n.getResourceBundle(i18n.language, 'profile');
      console.log('Profile translations:', profileTranslations);

      // Check if points translations exist
      if (profileTranslations &&
          profileTranslations.staking &&
          profileTranslations.staking.points) {
        console.log('Points translations found');
      } else {
        console.error('Points translations missing!');
      }

      setTranslationsLoaded(true);
    });
  }, [i18n, ready]);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      console.log(`StakingPanel: Language changed to ${lng}, reloading translations`);
      setTranslationsLoaded(false);

      // Force reload all namespaces
      i18n.loadNamespaces(['profile', 'common']).then(() => {
        console.log('StakingPanel: Namespaces reloaded after language change');

        // Log the points description translation to verify it's loaded correctly
        const pointsDesc = t('staking.points.description', { ns: 'profile' });
        console.log(`Points description after language change: "${pointsDesc}"`);

        // Get the resource bundle directly to verify
        const profileBundle = i18n.getResourceBundle(lng, 'profile');
        if (profileBundle && profileBundle.staking && profileBundle.staking.points) {
          console.log('Points description from bundle after language change:',
                      profileBundle.staking.points.description);
        } else {
          console.error('Profile bundle missing or incomplete after language change');
        }

        setTranslationsLoaded(true);
      });
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, t]);



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
        notify.error(result.error || 'Failed to stake tokens');
      }
    } catch (error) {
      console.error('Stake error:', error);
      notify.error('Failed to stake tokens');
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
        notify.error(result.error || 'Failed to request withdrawal');
      }
    } catch (error) {
      console.error('Request withdrawal error:', error);
      notify.error('Failed to request withdrawal');
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

    setLoading(true);
    try {
      const result = await stakingService.withdraw();
      if (result.success) {
        notify.success('Withdrawal completed successfully!');
        await loadData(); // Reload data
      } else {
        notify.error(result.error || 'Failed to withdraw tokens');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      notify.error('Failed to withdraw tokens');
    } finally {
      setLoading(false);
    }
  };



  // 调试方法
  const handleDebugInfo = async () => {
    if (!stakingService) {
      console.log('StakingService 未初始化');
      notify.error('StakingService 未初始化');
      return;
    }

    try {
      const debugInfo = await stakingService.debugAccountInfo();
      console.log('🔍 调试信息:', debugInfo);
      notify.success('调试信息已输出到控制台，请查看开发者工具');
    } catch (error) {
      console.error('获取调试信息失败:', error);
      notify.error('获取调试信息失败');
    }
  };

  // Add additional debug logging for translations
  useEffect(() => {
    // Log the points description translation to debug
    const pointsDesc = t('staking.points.description', { ns: 'profile' });
    console.log(`Points description translation: "${pointsDesc}"`);

    // Log the current language and resource bundle
    console.log(`Current language: ${i18n.language}`);
    const profileBundle = i18n.getResourceBundle(i18n.language, 'profile');
    if (profileBundle && profileBundle.staking && profileBundle.staking.points) {
      console.log('Points description from bundle:', profileBundle.staking.points.description);
    }
  }, [i18n.language, t]);

  // Show loading state
  if (!translationsLoaded || loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            {t('staking.title', { ns: 'profile' })}
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
        {t('staking.title', { ns: 'profile' })}
      </h2>

      <p className="text-gray-300 mb-6">
        {t('staking.description', { ns: 'profile' })}
      </p>

      {/* Info about automatic account creation */}
      {!hasStakeAccount && (
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            {t('staking.readyToStake', { ns: 'profile' })}
          </h3>
          <p className="text-gray-300">
            {t('staking.accountCreationInfo', { ns: 'profile' })}
          </p>
        </div>
      )}

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <p className="text-sm text-gray-400 mb-1">{t('staking.yourStake', { ns: 'profile' })}</p>
          <p className="text-2xl font-bold text-white">
            {userStakeInfo ? StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString()) : '0.00'} CFX
          </p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <p className="text-sm text-gray-400 mb-1">{t('staking.totalStaked', { ns: 'profile' })}</p>
          <p className="text-2xl font-bold text-white">
            {stakePoolInfo ? StakingService.formatCfxAmount(stakePoolInfo.totalStaked.toString()) : '--'} CFX
          </p>
        </div>
      </div>



      {/* Withdrawal Status */}
      {userStakeInfo?.withdrawalRequested && (
        <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/20 mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-2">
            {t('staking.withdrawal.requested', { ns: 'profile' })}
          </h3>
          <p className="text-gray-300 mb-2">
            {t('staking.withdrawal.pending', { ns: 'profile' })}
          </p>

          {withdrawalTimeInfo && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{t('staking.withdrawal.timeRemaining', { ns: 'profile' })}</span>
                <span className={`text-sm font-medium ${withdrawalTimeInfo.canWithdraw ? 'text-green-400' : 'text-orange-400'}`}>
                  {withdrawalTimeInfo.canWithdraw ?
                    t('staking.withdrawal.availableNow', { ns: 'profile' }) :
                    withdrawalTimeInfo.estimatedTimeRemaining
                  }
                </span>
              </div>

              {withdrawalTimeInfo.canWithdraw && (
                <p className="text-sm text-green-400 mt-2 flex items-center">
                  <span className="mr-1">✅</span>
                  {t('staking.withdrawal.available', { ns: 'profile' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Staking Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('staking.stakingInformation', { ns: 'profile' })}
        </h3>

        <p className="text-gray-300 mb-4">
          {t('staking.stakingInfoDescription', { ns: 'profile' })}
        </p>

        {/* Lock Duration Info */}
        {stakePoolInfo && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5 mb-4">
            <p className="text-sm text-gray-400 mb-2">{t('staking.lockDuration', { ns: 'profile' })}</p>
            <p className="text-lg font-semibold text-blue-400">
              {parseInt(stakePoolInfo.lockDurationSlots).toLocaleString()} slots
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('staking.approximatelyMinutes', {
                ns: 'profile',
                minutes: Math.round(parseInt(stakePoolInfo.lockDurationSlots) / 2.5 / 60)
              })}
            </p>
          </div>
        )}
      </div>

      {/* Staking Actions */}
      <div className="flex flex-wrap gap-4">
        {!isStaking && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              onClick={() => setIsStaking(true)}
              disabled={loading}
            >
              {hasStakeAccount ? t('staking.stakeMore', { ns: 'profile' }) : t('staking.startStaking', { ns: 'profile' })}
            </motion.button>

            {/* 调试按钮 - 仅在开发环境显示 */}
            {import.meta.env.DEV && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
                onClick={handleDebugInfo}
                disabled={loading}
              >
                🔍 调试信息
              </motion.button>
            )}

            {userStakeInfo && parseInt(userStakeInfo.stakedAmount.toString()) > 0 && !userStakeInfo.withdrawalRequested && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
                onClick={handleRequestWithdrawal}
                disabled={loading}
              >
                {t('staking.requestWithdrawal', { ns: 'profile' })}
              </motion.button>
            )}

            {userStakeInfo?.withdrawalRequested && canWithdraw && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {t('staking.withdrawTokens', { ns: 'profile' })}
              </motion.button>
            )}
          </>
        )}

        {/* Stake Form */}
        {isStaking && (
          <div className="w-full">
            <form onSubmit={handleStake} className="bg-blue-900/30 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                {hasStakeAccount ? t('staking.stakeMore', { ns: 'profile' }) : t('staking.stakeCfxTokens', { ns: 'profile' })}
              </h3>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">{t('staking.amount', { ns: 'profile' })}</label>
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
                  {t('balance', { ns: 'profile' })}: {cfxBalance?.toFixed(4) || '0.0000'} CFX
                </p>
                {(!cfxBalance || cfxBalance <= 0) ? (
                  <p className="text-xs text-red-400 mt-1">
                    {t('staking.insufficientCfxBalance', { ns: 'profile' })}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-400 mt-1">
                    {t('staking.minimumStake', { ns: 'profile' })}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading || !cfxBalance || cfxBalance <= 0}
                >
                  {loading ? t('staking.staking', { ns: 'profile' }) :
                   (!cfxBalance || cfxBalance <= 0) ? t('staking.insufficientBalance', { ns: 'profile' }) :
                   t('staking.confirm', { ns: 'profile' })}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setIsStaking(false)}
                  disabled={loading}
                >
                  {t('staking.cancel', { ns: 'profile' })}
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
