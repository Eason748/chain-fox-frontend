/**
 * 多签管理页面
 * 只有多签钱包用户才能访问
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import {
  isMultisigSigner,
  getMultisigConfig,
  MULTISIG_SIGNERS
} from '../services/multisigService';
import MultisigConfigCard from '../components/MultisigComponents/MultisigConfigCard';
import ProposalManagement from '../components/MultisigComponents/ProposalManagement';
import CreateProposalForm from '../components/MultisigComponents/CreateProposalForm';
import AuthRequired from '../components/AuthRequired';

const MultisigPage = () => {
  const { user } = useAuth();
  const { address: walletAddress, isConnected } = useWallet();
  const [multisigConfig, setMultisigConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 检查是否为多签用户 - 更严格的检查
  const isMultisigUser = isConnected && walletAddress && isMultisigSigner(walletAddress);

  // 调试信息
  if (import.meta.env.DEV) {
    console.log('MultisigPage Debug:', {
      isConnected,
      walletAddress,
      isMultisigUser,
      isMultisigSignerResult: walletAddress ? isMultisigSigner(walletAddress) : 'no address',
      MULTISIG_SIGNERS
    });
  }

  useEffect(() => {
    loadMultisigConfig();
  }, []);

  const loadMultisigConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await getMultisigConfig();
      setMultisigConfig(config);
    } catch (err) {
      console.error('Failed to load multisig config:', err);
      setError('Failed to load multisig config: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <AuthRequired
        redirectToLogin={false}
        fallbackMessage="Please log in to access the multisig management page"
      />
    );
  }

  // If wallet is not connected, show connection prompt
  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-8 rounded-xl border border-white/10 text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Wallet Connection Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please connect your Solana wallet to access multisig management features
            </p>
            <div className="text-sm text-gray-400">
              Only authorized multisig members can access this page
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If not a multisig user, show access denied
  if (!isMultisigUser) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-red-900/40 to-red-800/20 backdrop-blur-md p-8 rounded-xl border border-red-500/20 text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-red-400">
              Access Denied
            </h2>
            <p className="text-gray-300 mb-6">
              Your wallet address is not in the authorized multisig member list
            </p>
            <div className="text-sm text-gray-400 space-y-2">
              <div>Current wallet: {walletAddress}</div>
              <div>Authorized multisig members:</div>
              <ul className="list-disc list-inside text-left max-w-md mx-auto">
                {MULTISIG_SIGNERS.map((signer, index) => (
                  <li key={index} className="font-mono text-xs break-all">
                    {signer}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'proposals', label: 'Proposal Management', icon: '📋' },
    { id: 'create', label: 'Create Proposal', icon: '➕' }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Multisig Management
          </h1>
          <p className="text-gray-400">
            Manage multisig proposals and fund withdrawals from the staking pool
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4"
          >
            <div className="text-red-400 font-medium">Error</div>
            <div className="text-red-300 text-sm mt-1">{error}</div>
            <button
              onClick={loadMultisigConfig}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <MultisigConfigCard 
              config={multisigConfig}
              loading={loading}
              onRefresh={loadMultisigConfig}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalManagement 
              walletAddress={walletAddress}
              multisigConfig={multisigConfig}
            />
          )}

          {activeTab === 'create' && (
            <CreateProposalForm 
              walletAddress={walletAddress}
              multisigConfig={multisigConfig}
              onProposalCreated={() => {
                setActiveTab('proposals');
                loadMultisigConfig();
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MultisigPage;
