import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/**
 * StakingPanel component - Displays CFX staking information and controls
 *
 * @param {Object} props - Component props
 * @param {number} props.cfxBalance - User's CFX balance
 * @returns {React.ReactElement}
 */
const StakingPanel = ({ cfxBalance }) => {
  const { t, i18n, ready } = useTranslation(['profile', 'common']);
  const [isStaking, setIsStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // State to force re-render when translations are loaded
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

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

  // Mock data for staking information
  const mockStakingData = {
    yourStake: 500,
    totalStaked: 25000,
    totalStakers: 42,
    priority: 'medium', // none, low, medium, high
    points: {
      balance: 12580,
      ratePerBlock: 0.05,
      ratePerDay: 7.2,
      earned: 15000,
      used: 2420,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      recentActivity: [
        {
          type: 'earned',
          amount: 50,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          type: 'used',
          amount: 200,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
          type: 'earned',
          amount: 150,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
        }
      ]
    }
  };

  // Handle stake form submission
  const handleStake = (e) => {
    e.preventDefault();
    // Mock implementation - would connect to blockchain in real implementation
    console.log(`Staking ${stakeAmount} CFX`);
    setIsStaking(false);
    setStakeAmount('');
    // In a real implementation, we would update the staking data
  };

  // Handle unstake form submission
  const handleUnstake = (e) => {
    e.preventDefault();
    // Mock implementation - would connect to blockchain in real implementation
    console.log(`Unstaking ${unstakeAmount} CFX`);
    setIsUnstaking(false);
    setUnstakeAmount('');
    // In a real implementation, we would update the staking data
  };

  // Get priority level text and color
  const getPriorityDisplay = (level) => {
    const colors = {
      none: 'text-gray-400',
      low: 'text-yellow-400',
      medium: 'text-blue-400',
      high: 'text-green-400'
    };

    return {
      text: t(`staking.priorityLevels.${level}`, { ns: 'profile' }),
      color: colors[level] || 'text-gray-400'
    };
  };

  const priority = getPriorityDisplay(mockStakingData.priority);

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

  // If translations are not loaded yet, show loading state
  if (!translationsLoaded) {
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

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        {t('staking.title', { ns: 'profile' })}
      </h2>

      <p className="text-gray-300 mb-6">
        {t('staking.description', { ns: 'profile' })}
      </p>

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <p className="text-sm text-gray-400 mb-1">{t('staking.yourStake', { ns: 'profile' })}</p>
          <p className="text-2xl font-bold text-white">{mockStakingData.yourStake.toFixed(2)} CFX</p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <p className="text-sm text-gray-400 mb-1">{t('staking.totalStaked', { ns: 'profile' })}</p>
          <p className="text-2xl font-bold text-white">{mockStakingData.totalStaked.toLocaleString()} CFX</p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <p className="text-sm text-gray-400 mb-1">{t('staking.totalStakers', { ns: 'profile' })}</p>
          <p className="text-2xl font-bold text-white">{mockStakingData.totalStakers}</p>
        </div>
      </div>

      {/* Priority Level */}
      <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5 mb-6">
        <p className="text-sm text-gray-400 mb-1">{t('staking.priority', { ns: 'profile' })}</p>
        <p className={`text-xl font-bold ${priority.color}`}>{priority.text}</p>
      </div>

      {/* Points Rewards Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('staking.points.title', { ns: 'profile' })}
        </h3>

        <p className="text-gray-300 mb-4">
          {t('staking.points.description', { ns: 'profile' })}
        </p>

        {/* Points Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
            <p className="text-sm text-gray-400 mb-1">{t('staking.points.yourPoints', { ns: 'profile' })}</p>
            <p className="text-2xl font-bold text-white">{mockStakingData.points.balance.toLocaleString()}</p>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
            <p className="text-sm text-gray-400 mb-1">{t('staking.points.earned', { ns: 'profile' })}</p>
            <p className="text-2xl font-bold text-green-400">{mockStakingData.points.earned.toLocaleString()}</p>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
            <p className="text-sm text-gray-400 mb-1">{t('staking.points.used', { ns: 'profile' })}</p>
            <p className="text-2xl font-bold text-yellow-400">{mockStakingData.points.used.toLocaleString()}</p>
          </div>
        </div>

        {/* Reward Rate */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5 mb-4">
          <p className="text-sm text-gray-400 mb-2">{t('staking.points.rate', { ns: 'profile' })}</p>
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-400">{t('staking.points.perBlock', { ns: 'profile' })}</p>
              <p className="text-lg font-semibold text-blue-400">+{mockStakingData.points.ratePerBlock.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('staking.points.perDay', { ns: 'profile' })}</p>
              <p className="text-lg font-semibold text-blue-400">+{mockStakingData.points.ratePerDay.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('staking.points.lastUpdated', { ns: 'profile' })}</p>
              <p className="text-sm text-gray-300">{mockStakingData.points.lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-white">{t('staking.points.recentActivity', { ns: 'profile' })}</p>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {t('staking.points.viewAll', { ns: 'profile' })}
            </button>
          </div>

          <div className="space-y-3">
            {mockStakingData.points.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    activity.type === 'earned' ? 'bg-green-400' :
                    activity.type === 'used' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}></div>
                  <span className="text-sm text-gray-300">
                    {t(`staking.points.activities.${activity.type}`, { ns: 'profile' })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium ${
                    activity.type === 'earned' ? 'text-green-400' :
                    activity.type === 'used' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {activity.type === 'earned' ? '+' : '-'}{activity.amount}
                  </span>
                  <span className="text-xs text-gray-400">
                    {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="flex flex-wrap gap-4">
        {!isStaking && !isUnstaking && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              onClick={() => setIsStaking(true)}
            >
              {t('staking.stakeMore', { ns: 'profile' })}
            </motion.button>

            {mockStakingData.yourStake > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600/30 hover:bg-red-500/40 text-white rounded-lg transition-colors"
                onClick={() => setIsUnstaking(true)}
              >
                {t('staking.unstake', { ns: 'profile' })}
              </motion.button>
            )}
          </>
        )}

        {/* Stake Form */}
        {isStaking && (
          <div className="w-full">
            <form onSubmit={handleStake} className="bg-blue-900/30 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">{t('staking.stakeMore', { ns: 'profile' })}</h3>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">{t('staking.amount', { ns: 'profile' })}</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    max={cfxBalance}
                    step="0.01"
                    className="w-full bg-blue-950/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="0.00"
                    required
                  />
                  <span className="ml-2 text-gray-300">CFX</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t('balance', { ns: 'profile' })}: {cfxBalance.toFixed(4)} CFX
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  {t('staking.confirm', { ns: 'profile' })}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setIsStaking(false)}
                >
                  {t('staking.cancel', { ns: 'profile' })}
                </motion.button>
              </div>
            </form>
          </div>
        )}

        {/* Unstake Form */}
        {isUnstaking && (
          <div className="w-full">
            <form onSubmit={handleUnstake} className="bg-blue-900/30 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">{t('staking.unstake', { ns: 'profile' })}</h3>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">{t('staking.amount', { ns: 'profile' })}</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    min="0"
                    max={mockStakingData.yourStake}
                    step="0.01"
                    className="w-full bg-blue-950/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="0.00"
                    required
                  />
                  <span className="ml-2 text-gray-300">CFX</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t('staking.yourStake', { ns: 'profile' })}: {mockStakingData.yourStake.toFixed(2)} CFX
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  {t('staking.confirm', { ns: 'profile' })}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setIsUnstaking(false)}
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
