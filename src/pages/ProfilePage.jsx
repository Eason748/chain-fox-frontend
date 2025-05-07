import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import AuthRequired from '../components/AuthRequired';
import CustomSelect from '../components/ui/CustomSelect';
import StakingPanel from '../components/StakingPanel';

/**
 * ProfilePage component - Displays user profile information and account linking options
 */
const ProfilePage = () => {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const [forceUpdate, setForceUpdate] = useState(false);
  const { showRightPanel } = useLayout();

  // Ensure profile namespace is loaded
  useEffect(() => {
    console.log('ProfilePage: Current language', i18n.language);
    console.log('ProfilePage: Has profile namespace', i18n.hasResourceBundle(i18n.language, 'profile'));

    // Force reload namespaces to ensure translations are available
    i18n.loadNamespaces(['profile', 'common']).then(() => {
      console.log('ProfilePage: Namespaces loaded');
      // Force a reload of the translations
      const profileTranslations = i18n.getResourceBundle(i18n.language, 'profile');
      console.log('Profile translations:', profileTranslations);
    });
  }, [i18n, forceUpdate]);
  const {
    user,
    loading,
    signInWithGithub,
    signInWithGoogle,
    signInWithDiscord
  } = useAuth();

  // State for showing staking panel
  const [showStakingPanel, setShowStakingPanel] = useState(false);

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

  // Get raw provider name (not translated)
  const getRawProviderName = () => {
    return localStorage.getItem('auth_provider') || 'unknown';
  };

  // Render account linking section
  const renderAccountLinking = () => {
    const currentProvider = getRawProviderName();

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('linkAccounts', { ns: 'profile' })}
        </h3>

        <p className="text-gray-300 mb-6">
          {isWeb3User
            ? t('linkAccountsDescWeb3', { ns: 'profile' })
            : t('linkAccountsDesc', { ns: 'profile' })}
        </p>

        {/* GitHub */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div>
              <div className="font-medium text-white">{t('auth.continueWithGithub', { ns: 'common' })}</div>
              <div className="text-sm text-gray-400">
                {currentProvider === 'github'
                  ? t('currentProvider', { ns: 'profile' })
                  : t('connectProvider', { ns: 'profile' })}
              </div>
            </div>
          </div>
          <button
            onClick={signInWithGithub}
            disabled={currentProvider === 'github' || loading}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${currentProvider === 'github'
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-white'}
              transition-colors`}
          >
            {currentProvider === 'github'
              ? t('connected', { ns: 'profile' })
              : t('connect', { ns: 'profile' })}
          </button>
        </div>

        {/* Google */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div>
              <div className="font-medium text-white">{t('auth.continueWithGoogle', { ns: 'common' })}</div>
              <div className="text-sm text-gray-400">
                {currentProvider === 'google'
                  ? t('currentProvider', { ns: 'profile' })
                  : t('connectProvider', { ns: 'profile' })}
              </div>
            </div>
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={currentProvider === 'google' || loading}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${currentProvider === 'google'
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-white'}
              transition-colors`}
          >
            {currentProvider === 'google'
              ? t('connected', { ns: 'profile' })
              : t('connect', { ns: 'profile' })}
          </button>
        </div>

        {/* Discord */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <div>
              <div className="font-medium text-white">{t('auth.continueWithDiscord', { ns: 'common' })}</div>
              <div className="text-sm text-gray-400">
                {currentProvider === 'discord'
                  ? t('currentProvider', { ns: 'profile' })
                  : t('connectProvider', { ns: 'profile' })}
              </div>
            </div>
          </div>
          <button
            onClick={signInWithDiscord}
            disabled={currentProvider === 'discord' || loading}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${currentProvider === 'discord'
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-white'}
              transition-colors`}
          >
            {currentProvider === 'discord'
              ? t('connected', { ns: 'profile' })
              : t('connect', { ns: 'profile' })}
          </button>
        </div>

        {/* Web3 authentication has been completely removed */}
      </div>
    );
  };

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
            className={showRightPanel ? "lg:col-span-1" : "lg:col-span-3 max-w-md mx-auto"}
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

              {/* Web3 wallet functionality has been completely removed */}



              {/* Navigation tabs - Only showing accounts tab */}
              <div className="border-t border-white/10 pt-4 mt-2">
                <nav className="space-y-1">
                  <div className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-500/20 text-blue-300">
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {t('tabs.accounts', { ns: 'profile' })}
                  </div>
                </nav>
              </div>



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

            </div>
          </motion.div>



          {/* Right column - Tab content */}
          {showRightPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* Show staking panel or account linking based on state */}
              {showStakingPanel && isWeb3User ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">{t('staking.title', { ns: 'profile' })}</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowStakingPanel(false)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      ← {t('tabs.accounts', { ns: 'profile' })}
                    </motion.button>
                  </div>
                  <StakingPanel cfxBalance={cfxBalance} />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/10 backdrop-blur-md rounded-xl border border-white/10 p-6">
                  {/* Account linking content */}
                  {renderAccountLinking()}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </AuthRequired>
  );
};

export default ProfilePage;
