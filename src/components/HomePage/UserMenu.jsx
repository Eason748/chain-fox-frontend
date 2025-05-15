import React, { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { notify } from '../ui/Notification';

// Define the component
function UserMenu() {
  const { t } = useTranslation(['common', 'profile']);
  const { user, signOut, userCredits, creditsLoading, refreshUserCredits } = useAuth();
  const {
    isConnected: isWalletConnected,
    address: walletAddress,
    formatWalletAddress,
    balance: walletBalance,
    balanceLoading,
    refreshBalance,
    cfxBalance: walletCfxBalance,
    cfxBalanceLoading,
    refreshCfxBalance,
    connectWallet,
    disconnectWallet
  } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 跟踪上次余额刷新时间
  const [lastBalanceRefresh, setLastBalanceRefresh] = useState(0);

  // 移除自动刷新逻辑，只在用户手动点击刷新按钮时更新余额

  // If no user, return sign in button
  if (!user) {
    return (
      <Link
        to="/auth"
        className="px-4 py-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-white"
      >
        {t('buttons.signIn')}
      </Link>
    );
  }

  // Get user avatar - Wallet functionality disabled
  const getAvatar = () => {
    if (user.user_metadata?.avatar_url) {
      return (
        <img
          src={user.user_metadata.avatar_url}
          alt="User Avatar"
          className="w-9 h-9 rounded-full border-2 border-white/30"
        />
      );
    } else {
      // Default avatar with first letter of email or name
      const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User';
      const initial = name.charAt(0).toUpperCase();
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white/30">
          {initial}
        </div>
      );
    }
  };

  // Get user display name - Wallet functionality disabled
  const getUserName = () => {
    return user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User avatar button */}
      <button
        onClick={() => {
          // Only toggle menu if not already in a loading state
          if (!balanceLoading) {
            setMenuOpen(!menuOpen);
          }
        }}
        className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all"
        aria-label="User menu"
      >
        {getAvatar()}
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50 overflow-hidden"
          >
            {/* User info section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getAvatar()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Points Display */}
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                <div className="text-xs text-gray-400">{t('points.balance', { ns: 'profile', defaultValue: '积分余额' })}</div>
                <div className="flex items-center">
                  {creditsLoading ? (
                    <span className="text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t('auth.loading', { ns: 'common' })}
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-green-300">{userCredits !== null ? userCredits : '--'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (creditsLoading) return;

                          refreshUserCredits().then(() => {
                            notify.success(t('points.refreshed', { ns: 'profile', defaultValue: '积分已刷新' }));
                          }).catch(error => {
                            if (import.meta.env.DEV) {
                              console.error("Error refreshing credits:", error);
                            }
                            notify.error(t('points.refreshError', { ns: 'profile', defaultValue: '刷新积分失败' }));
                          });
                        }}
                        className={`ml-2 ${creditsLoading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`}
                        disabled={creditsLoading}
                        title={t('points.refresh', { ns: 'profile', defaultValue: '刷新积分' })}
                      >
                        <svg className={`w-3 h-3 ${creditsLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="p-3 border-b border-white/10">
              <h3 className="text-xs font-medium text-gray-400 mb-2">
                {t('walletInfo', { ns: 'profile' })}
              </h3>

              {isWalletConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">{t('address', { ns: 'profile' })}</div>
                    <div className="text-xs font-medium text-blue-300 flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V5zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-3zm1 5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-14z"/>
                      </svg>
                      {formatWalletAddress(walletAddress)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">SOL</div>
                    <div className="text-xs font-medium text-green-300 flex items-center">
                      {balanceLoading ? (
                        <span className="text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('auth.loading', { ns: 'common' })}
                        </span>
                      ) : (
                        <>
                          {walletBalance !== null && !isNaN(walletBalance) ? (
                            <span>{Number(walletBalance).toFixed(4)}</span>
                          ) : (
                            <span className="text-yellow-300">0.0000</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Prevent multiple clicks
                              if (balanceLoading) return;

                              // Update last refresh time
                              setLastBalanceRefresh(Date.now());

                              refreshBalance(true).then(result => {
                                if (result.success) {
                                  notify.success('SOL balance refreshed');
                                } else {
                                  notify.error(result.message || 'Failed to refresh SOL balance');
                                }
                              }).catch(error => {
                                if (import.meta.env.DEV) {
                                  console.error("Error refreshing SOL balance:", error);
                                }
                                notify.error('Error refreshing SOL balance');
                              });
                            }}
                            className={`ml-2 ${balanceLoading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`}
                            disabled={balanceLoading}
                            title="Refresh SOL balance"
                          >
                            <svg className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* CFX Token Balance */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-400">CFX</div>
                    <div className="text-xs font-medium text-purple-300 flex items-center">
                      {cfxBalanceLoading ? (
                        <span className="text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('auth.loading', { ns: 'common' })}
                        </span>
                      ) : (
                        <>
                          {walletCfxBalance !== null && !isNaN(walletCfxBalance) ? (
                            <span>{Number(walletCfxBalance).toFixed(4)}</span>
                          ) : (
                            <span className="text-yellow-300">0.0000</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Prevent multiple clicks
                              if (cfxBalanceLoading) return;

                              refreshCfxBalance(true).then(result => {
                                if (result.success) {
                                  notify.success('CFX balance refreshed');
                                } else {
                                  notify.error(result.message || 'Failed to refresh CFX balance');
                                }
                              }).catch(error => {
                                if (import.meta.env.DEV) {
                                  console.error("Error refreshing CFX balance:", error);
                                }
                                notify.error('Error refreshing CFX balance');
                              });
                            }}
                            className={`ml-2 ${cfxBalanceLoading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`}
                            disabled={cfxBalanceLoading}
                            title="Refresh CFX balance"
                          >
                            <svg className={`w-3 h-3 ${cfxBalanceLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      disconnectWallet().then(result => {
                        if (result.success) {
                          notify.success('Wallet disconnected successfully!');
                        } else {
                          notify.error(result.message || 'Failed to disconnect wallet');
                        }
                      });
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('wallet.disconnect', { ns: 'profile' })}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // 直接使用 WalletContext 提供的 connectWallet 函数
                    connectWallet().then(result => {
                      if (!result.success) {
                        console.error('Failed to connect wallet:', result.error || result.message);
                        notify.error(result.message || 'Failed to connect wallet');
                      } else {
                        notify.success('Wallet connected successfully!');
                      }
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V5zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-3zm1 5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-14z"/>
                  </svg>
                  {t('wallet.connect', { ns: 'profile' })}
                </button>
              )}
            </div>

            {/* User Menu Items */}
            <div className="py-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t('userMenu.profile')}
              </Link>

              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
              >
                {t('buttons.signOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// Export the component wrapped in memo to prevent unnecessary re-renders
export default memo(UserMenu);
