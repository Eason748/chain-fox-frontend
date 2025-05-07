import React from 'react';

/**
 * WalletAvatar component - DISABLED
 * Wallet functionality has been temporarily removed for security testing
 *
 * @returns {React.ReactElement}
 */
const WalletAvatar = () => {
  // Return a placeholder avatar instead of wallet-based avatar
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
      <span className="text-sm">U</span>
    </div>
  );
};

export default WalletAvatar;
