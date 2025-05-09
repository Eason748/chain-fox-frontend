import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

/**
 * WalletConnectButton component - Button to connect/disconnect Solana wallet
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'auth')
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
const WalletConnectButton = ({ variant = 'primary', className = '' }) => {
  const { t } = useTranslation(['profile', 'common']);
  const {
    isConnected,
    address,
    loading,
    error,
    signature,
    connectWallet,
    disconnectWallet,
    formatWalletAddress
  } = useWallet();

  // Button variants
  const variants = {
    primary: {
      container: 'w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
      connect: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
      disconnect: 'bg-red-500/20 hover:bg-red-500/30 text-red-300',
      loading: 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
    },
    secondary: {
      container: 'px-4 py-2 rounded-md text-sm font-medium transition-colors',
      connect: 'bg-blue-600 hover:bg-blue-500 text-white',
      disconnect: 'bg-red-600 hover:bg-red-500 text-white',
      loading: 'bg-gray-600 text-gray-300 cursor-not-allowed'
    },
    auth: {
      container: 'w-full flex items-center justify-center px-6 py-3 rounded-full text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
      connect: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40',
      disconnect: 'bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg hover:shadow-red-500/40',
      loading: 'bg-gradient-to-r from-gray-700 to-gray-900'
    }
  };

  // Get the appropriate classes based on variant and state
  const getButtonClasses = () => {
    const variantClasses = variants[variant] || variants.primary;
    let stateClass = loading ? variantClasses.loading :
                    isConnected ? variantClasses.disconnect :
                    variantClasses.connect;

    return `${variantClasses.container} ${stateClass} ${className}`;
  };

  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.5 }
  };

  // Handle button click
  const handleClick = async () => {
    if (loading) return;

    if (isConnected) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  return (
    <div className="wallet-connect-button">
      <motion.button
        onClick={handleClick}
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        animate={loading ? "disabled" : ""}
        className={getButtonClasses()}
      >
        {/* Solana wallet icon */}
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V5zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-3zm1 5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-14z"/>
        </svg>

        {/* Button text */}
        <span className="text-base font-medium">
          {loading ? t('auth.loading', { ns: 'common' }) :
           isConnected ? `${formatWalletAddress(address)} · ${t('wallet.disconnect', { ns: 'profile' })}` :
           t('wallet.connect', { ns: 'profile' })}
        </span>
      </motion.button>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Signature status */}
      {isConnected && signature && (
        <div className="mt-2 text-xs">
          <div className="text-green-400 flex items-center">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('wallet.secureConnection', { ns: 'profile', defaultValue: 'Secure connection verified' })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
