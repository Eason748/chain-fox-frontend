/**
 * 提案管理组件
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllProposals, signProposal, executeAdminWithdraw, ProposalStatus, isMultisigSigner, MULTISIG_SIGNERS } from '../../services/multisigService';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import solanaRpcService from '../../services/solanaRpcService';
import { useWallet } from '../../contexts/WalletContext';

const ProposalManagement = ({ walletAddress, multisigConfig }) => {
  const { wallet } = useWallet();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingProposal, setProcessingProposal] = useState(null);

  useEffect(() => {
    loadProposals();
  }, [multisigConfig]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!multisigConfig) {
        setProposals([]);
        return;
      }

      // Load all proposals
      const proposalsData = await getAllProposals();
      setProposals(proposalsData);
    } catch (err) {
      console.error('Failed to load proposals:', err);
      setError('Failed to load proposals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignProposal = async (proposalId) => {
    try {
      setProcessingProposal(proposalId);
      setError(null);

      // 检查权限
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      if (!isMultisigSigner(walletAddress)) {
        throw new Error(`Access denied: Your wallet is not authorized for multisig operations.\n\nAuthorized addresses:\n${MULTISIG_SIGNERS.filter(addr => addr !== 'TBD').map((addr, index) => `${index + 1}. ${addr}`).join('\n')}\n\nYour address: ${walletAddress}`);
      }

      if (!wallet || !wallet.publicKey) {
        throw new Error('Wallet connection error: Please reconnect your wallet and try again');
      }

      const instruction = await signProposal({
        walletAddress,
        proposalId
      });
      
      // 创建交易 - 按照 stakingService 的模式
      const connection = await solanaRpcService.getConnection();
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;

      // 获取最新的区块哈希
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      // 签名并发送交易
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // 等待确认
      await connection.confirmTransaction(signature, 'confirmed');
      
      // 刷新提案列表
      await loadProposals();
      
      alert('Proposal signed successfully!');
    } catch (err) {
      console.error('Failed to sign proposal:', err);
      alert('Failed to sign proposal: ' + err.message);
    } finally {
      setProcessingProposal(null);
    }
  };

  const handleExecuteProposal = async (proposalId, recipientTokenAccount) => {
    try {
      setProcessingProposal(proposalId);
      setError(null);

      // 检查权限
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      if (!isMultisigSigner(walletAddress)) {
        throw new Error(`Access denied: Your wallet is not authorized for multisig operations.\n\nAuthorized addresses:\n${MULTISIG_SIGNERS.filter(addr => addr !== 'TBD').map((addr, index) => `${index + 1}. ${addr}`).join('\n')}\n\nYour address: ${walletAddress}`);
      }

      if (!wallet || !wallet.publicKey) {
        throw new Error('Wallet connection error: Please reconnect your wallet and try again');
      }

      const instruction = await executeAdminWithdraw({
        walletAddress,
        proposalId,
        recipientTokenAccount
      });
      
      // 创建交易 - 按照 stakingService 的模式
      const connection = await solanaRpcService.getConnection();
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;

      // 获取最新的区块哈希
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      // 签名并发送交易
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // 等待确认
      await connection.confirmTransaction(signature, 'confirmed');
      
      // 刷新提案列表
      await loadProposals();
      
      alert('Proposal executed successfully!');
    } catch (err) {
      console.error('Failed to execute proposal:', err);
      alert('Failed to execute proposal: ' + err.message);
    } finally {
      setProcessingProposal(null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const addr = address.toString ? address.toString() : address;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return (Number(amount) / 1_000_000).toLocaleString() + ' CFX';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ProposalStatus.Pending:
        return 'bg-yellow-900/30 text-yellow-400';
      case ProposalStatus.Approved:
        return 'bg-green-900/30 text-green-400';
      case ProposalStatus.Executed:
        return 'bg-blue-900/30 text-blue-400';
      case ProposalStatus.Rejected:
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ProposalStatus.Pending:
        return 'Pending';
      case ProposalStatus.Approved:
        return 'Approved';
      case ProposalStatus.Executed:
        return 'Executed';
      case ProposalStatus.Rejected:
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title and refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Proposal Management</h2>
        <button
          onClick={loadProposals}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <div className="text-red-400 font-medium flex items-center">
            <span className="mr-2">❌</span>
            {error.includes('Access denied') ? 'Permission Denied' : 'Error'}
          </div>
          <div className="text-red-300 text-sm mt-2 whitespace-pre-line">{error}</div>
          {error.includes('Access denied') && (
            <div className="mt-3 text-xs text-red-200 bg-red-800/20 p-2 rounded">
              💡 <strong>Tip:</strong> Only authorized multisig members can sign or execute proposals. If you believe this is an error, please contact the team administrator.
            </div>
          )}
        </div>
      )}

      {/* 提案列表 */}
      <div className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        {proposals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">No Proposals</div>
            <div className="text-gray-500 text-sm">
              No proposals have been created yet. Go to the "Create Proposal" tab to get started
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Proposal #{proposal.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Proposer: {formatAddress(proposal.proposer)}</div>
                      <div>Created: {new Date(proposal.createdAt).toLocaleString()}</div>
                      {proposal.executedAt && (
                        <div>Executed: {new Date(proposal.executedAt).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Signature Progress</div>
                    <div className="text-white font-mono">
                      {proposal.signatureCount} / {multisigConfig?.threshold || 2}
                    </div>
                  </div>
                </div>

                {/* Proposal Details */}
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Proposal Type: Admin Withdraw</div>
                  {proposal.data && proposal.data.length >= 40 && (
                    <div className="space-y-2 text-sm">
                      <div className="text-white">
                        Withdraw Amount: {formatAmount(proposal.data.slice(0, 8))}
                      </div>
                      <div className="text-white">
                        Recipient: {formatAddress(proposal.data.slice(8, 40))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature Status */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Signature Status</div>
                  <div className="flex space-x-2">
                    {proposal.signatures.map((signed, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          signed 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  {proposal.status === ProposalStatus.Pending && (
                    <button
                      onClick={() => handleSignProposal(proposal.id)}
                      disabled={processingProposal === proposal.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      {processingProposal === proposal.id ? 'Signing...' : 'Sign Proposal'}
                    </button>
                  )}

                  {proposal.status === ProposalStatus.Approved && (
                    <button
                      onClick={() => {
                        const recipientAccount = prompt('Please enter recipient token account address:');
                        if (recipientAccount) {
                          handleExecuteProposal(proposal.id, recipientAccount);
                        }
                      }}
                      disabled={processingProposal === proposal.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      {processingProposal === proposal.id ? 'Executing...' : 'Execute Proposal'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProposalManagement;
