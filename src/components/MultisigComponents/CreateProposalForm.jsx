/**
 * 创建提案表单组件
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createAdminWithdrawProposal, isMultisigSigner, MULTISIG_SIGNERS } from '../../services/multisigService';
import { Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import solanaRpcService from '../../services/solanaRpcService';
import { useWallet } from '../../contexts/WalletContext';

const CreateProposalForm = ({ walletAddress, multisigConfig, onProposalCreated }) => {
  const { wallet } = useWallet();
  const [formData, setFormData] = useState({
    amount: '',
    recipientAddress: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除错误
    if (error) setError(null);
  };

  const validateForm = () => {
    const { amount, recipientAddress } = formData;
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      throw new Error('Please enter a valid withdrawal amount');
    }

    if (!recipientAddress) {
      throw new Error('Please enter recipient address');
    }

    try {
      new PublicKey(recipientAddress);
    } catch {
      throw new Error('Invalid recipient address format');
    }

    if (Number(amount) > 1000000) {
      throw new Error('Single withdrawal amount cannot exceed 1,000,000 CFX');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // 首先检查基本连接状态
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // 然后检查权限 - 这是最重要的检查
      if (!isMultisigSigner(walletAddress)) {
        throw new Error(`Access denied: Your wallet is not authorized for multisig operations. Only the following addresses can create proposals:\n\n${MULTISIG_SIGNERS.filter(addr => addr !== 'TBD').map((addr, index) => `${index + 1}. ${addr}`).join('\n')}\n\nYour current address: ${walletAddress}`);
      }

      // 最后检查钱包对象（这个检查可能因为权限问题而失败）
      if (!wallet || !wallet.publicKey) {
        throw new Error('Wallet connection error: Please reconnect your wallet and try again');
      }

      // 验证表单
      validateForm();

      // 转换金额为 lamports (CFX 有 6 位小数)
      const amountLamports = Math.floor(Number(formData.amount) * 1_000_000);

      // 创建提案指令
      const instruction = await createAdminWithdrawProposal({
        walletAddress,
        amount: amountLamports,
        recipientAddress: formData.recipientAddress
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
      
      // 重置表单
      setFormData({
        amount: '',
        recipientAddress: '',
        description: ''
      });
      
      // 通知父组件
      if (onProposalCreated) {
        onProposalCreated();
      }
      
      alert('Proposal created successfully!');
    } catch (err) {
      console.error('创建提案失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Create Admin Withdrawal Proposal</h2>
      
      {/* 说明信息 */}
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="text-blue-400 text-sm font-medium mb-2">
          ℹ️ Proposal Information
        </div>
        <div className="text-blue-300 text-xs space-y-1">
          <div>• After creating a proposal, at least {multisigConfig?.threshold || 2} multisig members need to sign</div>
          <div>• The proposal creator will automatically sign, other members need to sign</div>
          <div>• Once the signature threshold is reached, any multisig member can execute the proposal</div>
          <div>• Withdrawn funds will be transferred from the staking pool token vault to the specified address</div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="text-red-400 font-medium flex items-center">
            <span className="mr-2">❌</span>
            {error.includes('Access denied') ? 'Permission Denied' : 'Error'}
          </div>
          <div className="text-red-300 text-sm mt-2 whitespace-pre-line">{error}</div>
          {error.includes('Access denied') && (
            <div className="mt-3 text-xs text-red-200 bg-red-800/20 p-2 rounded">
              💡 <strong>Tip:</strong> Only authorized multisig members can create proposals. If you believe this is an error, please contact the team administrator.
            </div>
          )}
        </div>
      )}

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 提取金额 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Withdrawal Amount (CFX)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Please enter withdrawal amount"
            min="0"
            step="0.000001"
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            Minimum amount: 0.000001 CFX, Maximum amount: 1,000,000 CFX
          </div>
        </div>

        {/* 接收者地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            name="recipientAddress"
            value={formData.recipientAddress}
            onChange={handleInputChange}
            placeholder="Please enter Solana wallet address"
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            Please ensure the address is correct, funds will be transferred to this address
          </div>
        </div>

        {/* 提案描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Proposal Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please describe the purpose and use of this withdrawal"
            rows={4}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <div className="text-xs text-gray-400 mt-1">
            Description is for record keeping only, not stored on blockchain
          </div>
        </div>

        {/* 提案预览 */}
        {formData.amount && formData.recipientAddress && (
          <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-300 mb-3">Proposal Preview</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Withdrawal Amount:</span>
                <span className="text-white font-mono">
                  {Number(formData.amount).toLocaleString()} CFX
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recipient:</span>
                <span className="text-white font-mono text-xs">
                  {formData.recipientAddress.slice(0, 6)}...{formData.recipientAddress.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Proposer:</span>
                <span className="text-white font-mono text-xs">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Signatures:</span>
                <span className="text-white">
                  {multisigConfig?.threshold || 2} / {multisigConfig?.signers?.length || 3}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !formData.amount || !formData.recipientAddress}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Proposal'}
          </button>

          <button
            type="button"
            onClick={() => setFormData({ amount: '', recipientAddress: '', description: '' })}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* 风险提示 */}
      <div className="mt-6 bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
        <div className="text-yellow-400 text-sm font-medium mb-2">
          ⚠️ Risk Warning
        </div>
        <div className="text-yellow-300 text-xs space-y-1">
          <div>• Please carefully verify the recipient address, transfers cannot be reversed</div>
          <div>• Ensure withdrawal amount is reasonable to avoid affecting normal staking pool operations</div>
          <div>• All proposals are recorded on the blockchain, completely transparent and public</div>
          <div>• Malicious or inappropriate proposals may be rejected by other multisig members</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateProposalForm;
