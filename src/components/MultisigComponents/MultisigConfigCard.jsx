/**
 * 多签配置信息卡片
 */

import React from 'react';
import { motion } from 'framer-motion';
import programIds from '../../data/program-ids.json';

const MultisigConfigCard = ({ config, loading, onRefresh }) => {

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const addr = address.toString ? address.toString() : address;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const getSignerRole = (address) => {
    const addr = address.toString ? address.toString() : address;

    if (addr === programIds.deployed_accounts.authority_wallet.address) {
      return 'Admin Wallet';
    }
    if (addr === programIds.deployed_accounts.team_wallet.address) {
      return 'Team Wallet';
    }
    return 'Multisig Member';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 多签配置概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Multisig Configuration</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Signature Threshold</label>
              <div className="text-white font-mono text-lg">
                {config?.threshold || 0} / {config?.signers?.length || 0}
              </div>
              <div className="text-xs text-gray-500">
                Requires {config?.threshold || 0} signatures to execute proposals
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Total Proposals</label>
              <div className="text-white font-mono text-lg">
                {config?.proposalCount || 0}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Associated Stake Pool</label>
              <div className="text-white font-mono text-sm break-all">
                {formatAddress(config?.stakePool || programIds.deployed_accounts.stake_pool.address)}
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Configuration Status</label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                config ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {config ? '✅ Configured' : '❌ Not Configured'}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Token Vault</label>
              <div className="text-white font-mono text-sm break-all">
                {formatAddress(programIds.deployed_accounts.token_vault.address)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Multisig Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">Multisig Members</h3>

        <div className="space-y-3">
          {(config?.signers || []).map((signer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-mono text-sm">
                    {formatAddress(signer)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSignerRole(signer)}
                  </div>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full text-xs bg-green-900/30 text-green-400">
                Configured
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <div className="text-blue-400 text-sm font-medium mb-1">
            ℹ️ Multisig Information
          </div>
          <div className="text-blue-300 text-xs space-y-1">
            <div>• Any multisig member can create proposals</div>
            <div>• Requires at least {config?.threshold || 2} member signatures to execute proposals</div>
            <div>• Only AdminWithdraw type proposals can withdraw funds</div>
            <div>• All operations are recorded on the blockchain, completely transparent</div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default MultisigConfigCard;
