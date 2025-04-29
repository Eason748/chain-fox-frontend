import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

/**
 * WalletInfo component - Displays wallet address and balance
 * 
 * @returns {React.ReactElement}
 */
const WalletInfo = () => {
  const { isWeb3User, address, balance, updateWalletBalance } = useAuth();
  
  // Update balance when component mounts
  useEffect(() => {
    if (isWeb3User && address) {
      updateWalletBalance();
    }
  }, [isWeb3User, address, updateWalletBalance]);
  
  // Format balance to 4 decimal places
  const formattedBalance = balance ? balance.toFixed(4) : '0.0000';
  
  // If not a web3 user, don't render anything
  if (!isWeb3User || !address) {
    return null;
  }
  
  return (
    <motion.div 
      className="bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/10 max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-medium mb-2">Wallet Information</h3>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-400">Address</p>
          <p className="text-sm font-mono break-all">{address}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Balance</p>
          <div className="flex items-center">
            <p className="text-xl font-medium">{formattedBalance}</p>
            <span className="ml-2 text-sm text-gray-400">SOL</span>
            
            {/* Refresh button */}
            <motion.button
              className="ml-auto p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={updateWalletBalance}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletInfo;
