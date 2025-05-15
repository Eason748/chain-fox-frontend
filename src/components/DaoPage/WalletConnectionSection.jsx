import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import WalletConnectButton from '../WalletConnectButton';
import { useWallet } from '../../contexts/WalletContext';

/**
 * WalletConnectionSection - Component for handling wallet connection in the DAO page
 * Provides wallet connection interface and displays connected wallet information
 * Uses the project's existing wallet connection functionality
 */
const WalletConnectionSection = () => {
  const { t } = useTranslation(['dao', 'common']);
  const { isConnected, address, balance, cfxBalance } = useWallet();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-12 bg-gradient-to-b from-indigo-900/30 to-purple-900/20 p-6 md:p-8 rounded-xl shadow-xl border border-indigo-500/20"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-indigo-300">
        {t('walletSectionTitle', '连接钱包')}
      </h2>
      
      <p className="text-gray-300 mb-6">
        {t('walletConnectionDescription', '连接您的Solana钱包以参与Chain-Fox DAO治理与质押。您需要持有SOL用于支付交易费用及CFX代币用于质押。')}
      </p>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/30 p-4 rounded-lg">
        <div>
          {isConnected ? (
            <div>
              <p className="text-green-400 font-semibold">{t('walletConnected', '钱包已连接')}</p>
              {balance !== null && (
                <p className="text-sm text-gray-300 mt-1">
                  {t('common:wallet.solBalance', 'SOL Balance')}: <span className="text-blue-300">{balance.toFixed(4)} SOL</span>
                </p>
              )}
              {cfxBalance !== null && (
                <p className="text-sm text-gray-300 mt-1">
                  {t('common:wallet.cfxBalance', 'CFX Balance')}: <span className="text-purple-300">{cfxBalance.toFixed(2)} CFX</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-yellow-400">{t('walletNotConnected', '请连接钱包以继续')}</p>
          )}
        </div>
        
        {/* 使用项目已有的钱包连接按钮 */}
        <WalletConnectButton 
          variant="auth"
        />
      </div>
      
      {isConnected && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400">
            {t('walletReadyForDao', '您的钱包已准备就绪，可以参与DAO活动')}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnectionSection;
