import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import AuthRequired from '../components/AuthRequired';
import CustomSelect from '../components/ui/CustomSelect';
import { notify } from '../components/ui/Notification';

/**
 * ProfilePage component - Displays user profile information and account linking options
 */
const ProfilePage = () => {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Ensure profile namespace is loaded
  useEffect(() => {

    // Force reload namespaces to ensure translations are available
    i18n.loadNamespaces(['profile', 'common']).then(() => {
      console.log('ProfilePage: Namespaces loaded');
      // Force a reload of the translations
      const profileTranslations = i18n.getResourceBundle(i18n.language, 'profile');
      console.log('Profile translations:', profileTranslations);
    });
  }, [i18n, forceUpdate]);
  const { user } = useAuth();

  // Get wallet state
  const {
    isConnected: isWalletConnected,
    address: walletAddress,
    loading: walletLoading,
    error: walletError,
    connectWallet,
    disconnectWallet,
    formatWalletAddress,
    balance: walletBalance,
    balanceLoading,
    refreshBalance,
    cfxBalance: walletCfxBalance,
    cfxBalanceLoading,
    refreshCfxBalance
  } = useWallet();

  // No longer using staking panel

  // No longer using tabs, showing only accounts section

  // Get user display name
  const getUserName = () => {
    return user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || 'User';
  };

  // Get user avatar
  const getUserAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return (
        <img
          src={user.user_metadata.avatar_url}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-2 border-white/30"
        />
      );
    } else {
      // Default avatar with first letter of email or name
      const name = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || 'User';
      const initial = name.charAt(0).toUpperCase();
      return (
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30">
          {initial}
        </div>
      );
    }
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email;
  };

  // Get user provider
  const getUserProvider = () => {
    // Check user metadata for provider
    const provider = localStorage.getItem('auth_provider');
    if (provider === 'github') return 'GitHub';
    if (provider === 'google') return 'Google';
    if (provider === 'discord') return 'Discord';
    return t('unknown', { ns: 'profile' });
  };

  // Raw provider name function has been removed

  // Account linking section has been completely removed

  return (
    <AuthRequired>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - User info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/20 backdrop-blur-md rounded-xl border border-white/10 p-6 sticky top-24">
              <div className="flex flex-col items-center text-center mb-6">
                {/* User avatar */}
                <div className="mb-4">
                  {getUserAvatar()}
                </div>

                {/* User name */}
                <h2 className="text-xl font-bold text-white mb-1">
                  {getUserName()}
                </h2>

                {/* User email */}
                {getUserEmail() && (
                  <p className="text-gray-400 text-sm mb-2">
                    {getUserEmail()}
                  </p>
                )}

                {/* User provider badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                  {getUserProvider()}
                </div>
              </div>

              {/* Wallet Connection Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  {t('walletInfo', { ns: 'profile' })}
                </h3>

                {isWalletConnected ? (
                  <div className="space-y-3">
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">{t('walletAddress', { ns: 'profile' })}</div>
                        <div className="text-sm font-medium text-blue-300">{formatWalletAddress(walletAddress)}</div>
                      </div>
                    </div>

                    {/* SOL Balance */}
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">SOL</div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-green-300">
                            {balanceLoading ? (
                              <span className="text-gray-400 flex items-center">
                                <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('auth.loading', { ns: 'common' })}
                              </span>
                            ) : (
                              <span>{walletBalance !== null ? Number(walletBalance).toFixed(4) : '--'}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              refreshBalance(true).then(result => {
                                if (result.success) {
                                  notify.success('SOL balance refreshed');
                                } else {
                                  notify.error(result.message || 'Failed to refresh SOL balance');
                                }
                              });
                            }}
                            disabled={balanceLoading}
                            className={`ml-2 ${balanceLoading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`}
                            title="Refresh SOL balance"
                          >
                            <svg className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CFX Balance */}
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">CFX</div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-purple-300">
                            {cfxBalanceLoading ? (
                              <span className="text-gray-400 flex items-center">
                                <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('auth.loading', { ns: 'common' })}
                              </span>
                            ) : (
                              <span>{walletCfxBalance !== null ? Number(walletCfxBalance).toFixed(4) : '--'}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              refreshCfxBalance(true).then(result => {
                                if (result.success) {
                                  notify.success('CFX balance refreshed');
                                } else {
                                  notify.error(result.message || 'Failed to refresh CFX balance');
                                }
                              });
                            }}
                            disabled={cfxBalanceLoading}
                            className={`ml-2 ${cfxBalanceLoading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`}
                            title="Refresh CFX balance"
                          >
                            <svg className={`w-4 h-4 ${cfxBalanceLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const result = await disconnectWallet();
                        if (result.success) {
                          notify.success('Wallet disconnected successfully');
                        } else {
                          notify.error(result.message || 'Failed to disconnect wallet');
                        }
                      }}
                      disabled={walletLoading}
                      className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-sm font-medium transition-colors"
                    >
                      {walletLoading ? t('auth.loading', { ns: 'common' }) : t('wallet.disconnect', { ns: 'profile' })}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const result = await connectWallet();
                      if (result.success) {
                        notify.success('Wallet connected successfully');
                      } else {
                        notify.error(result.message || 'Failed to connect wallet');
                      }
                    }}
                    disabled={walletLoading}
                    className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V5zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-3zm1 5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-14z"/>
                    </svg>
                    {walletLoading ? t('auth.loading', { ns: 'common' }) : t('wallet.connect', { ns: 'profile' })}
                  </button>
                )}

                {walletError && (
                  <div className="mt-2 text-xs text-red-400">
                    {walletError}
                  </div>
                )}
              </div>

              {/* Navigation tabs have been removed */}



              {/* Language Selector */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  {t('language', { ns: 'profile' })}
                </h3>
                <CustomSelect
                  value={i18n.language}
                  onChange={(lang) => {
                    console.log('Changing language to:', lang);
                    // Save language preference to localStorage first
                    localStorage.setItem('i18nextLng', lang);

                    // Change language and force reload resources
                    i18n.changeLanguage(lang).then(() => {
                      console.log('Language changed to:', i18n.language);

                      // Force reload all namespaces after language change
                      i18n.loadNamespaces(['profile', 'common']).then(() => {
                        console.log('Namespaces reloaded');

                        // Force a reload of the component by updating state
                        // This is a workaround to ensure the UI updates
                        setForceUpdate(prev => !prev);
                      });
                    });
                  }}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'zh', label: '中文' }
                  ]}
                  className="w-full mb-4"
                />
              </div>

              {/* Account linking section has been removed */}
            </div>
          </motion.div>
        </div>
      </div>
    </AuthRequired>
  );
};

export default ProfilePage;
