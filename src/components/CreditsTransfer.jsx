import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { notify } from './ui/Notification';
import { transferCredits } from '../services/creditsService';
import { transferCreditsByWallet } from '../services/walletCreditsService';

/**
 * CreditsTransfer component
 * Allows users to transfer credits to other users or wallet addresses
 */
const CreditsTransfer = ({ onClose }) => {
  const { t } = useTranslation(['profile', 'common']);
  const { user, userCredits, refreshUserCredits } = useAuth();
  const { isConnected: isWalletConnected, address: walletAddress } = useWallet();

  const [transferMethod, setTransferMethod] = useState('userId'); // 'userId' or 'wallet'
  const [targetId, setTargetId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');

  // Handle transfer credits
  const handleTransferCredits = async (e) => {
    e.preventDefault();
    setTransferError('');
    setIsTransferring(true);

    try {
      // Validate inputs
      if (!targetId.trim()) {
        setTransferError(
          transferMethod === 'userId'
            ? t('credits.transfer.errorNoUserId', { defaultValue: 'Please enter a target user ID' })
            : t('wallet.credits.transfer.errorNoWallet', { defaultValue: 'Please enter a target wallet address' })
        );
        setIsTransferring(false);
        return;
      }

      const amount = parseInt(transferAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        setTransferError(
          transferMethod === 'userId'
            ? t('credits.transfer.errorInvalidAmount', { defaultValue: 'Please enter a valid amount (positive integer)' })
            : t('wallet.credits.transfer.errorInvalidAmount', { defaultValue: 'Please enter a valid amount (positive integer)' })
        );
        setIsTransferring(false);
        return;
      }

      // Confirm transfer
      let confirmMessage;
      if (transferMethod === 'userId') {
        confirmMessage = t('credits.transfer.confirm', {
          amount,
          userId: targetId,
          defaultValue: `Are you sure you want to transfer ${amount} credits to user ${targetId}?`
        });
      } else {
        confirmMessage = t('wallet.credits.transfer.confirm', {
          amount,
          wallet: targetId,
          defaultValue: `Are you sure you want to transfer ${amount} credits to wallet ${targetId}?`
        });
      }

      if (!window.confirm(confirmMessage)) {
        setIsTransferring(false);
        return;
      }

      // Execute transfer based on method
      let result;
      if (transferMethod === 'userId') {
        // Transfer by user ID
        result = await transferCredits(
          targetId,
          amount,
          transferDescription || t('credits.transfer.defaultDescription', { defaultValue: 'Credits transfer' })
        );
      } else {
        // Transfer by wallet address
        if (!walletAddress) {
          setTransferError(t('wallet.credits.transfer.errorNoSourceWallet', { defaultValue: 'Your wallet is not connected' }));
          setIsTransferring(false);
          return;
        }

        result = await transferCreditsByWallet(
          walletAddress,
          targetId,
          amount,
          transferDescription || t('wallet.credits.transfer.defaultDescription', { defaultValue: 'Wallet credits transfer' })
        );
      }

      if (!result.success) {
        setTransferError(
          result.message ||
          (transferMethod === 'userId'
            ? t('credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' })
            : t('wallet.credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' })
          )
        );
        setIsTransferring(false);
        return;
      }

      // Success
      notify.success(
        transferMethod === 'userId'
          ? t('credits.transfer.success', {
              amount,
              remaining: result.remainingPoints,
              defaultValue: `Successfully transferred ${amount} credits. Remaining: ${result.remainingPoints}`
            })
          : t('wallet.credits.transfer.success', {
              amount,
              remaining: result.remainingPoints,
              defaultValue: `Successfully transferred ${amount} credits. Remaining: ${result.remainingPoints}`
            })
      );

      // Reset form
      setTargetId('');
      setTransferAmount('');
      setTransferDescription('');

      // Refresh user credits if transferring by user ID
      if (transferMethod === 'userId') {
        await refreshUserCredits();
      }

      // Close the form if requested
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error transferring credits:', error);
      setTransferError(
        error.message ||
        (transferMethod === 'userId'
          ? t('credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' })
          : t('wallet.credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' })
        )
      );
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/20 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {t('credits.transfer.title', { defaultValue: 'Transfer Credits' })}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">{t('credits.amount', { defaultValue: 'Available Credits' })}</div>
          <div className="text-sm font-medium text-green-300">{userCredits !== null ? userCredits : '--'}</div>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <form onSubmit={handleTransferCredits}>
          {/* Transfer Method Selection */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.transfer.method', { defaultValue: 'Transfer Method' })}
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setTransferMethod('userId')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transferMethod === 'userId'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'bg-black/30 text-gray-300 border border-white/20 hover:bg-black/40'
                }`}
                disabled={isTransferring}
              >
                {t('credits.transfer.methodUserId', { defaultValue: 'UID' })}
              </button>
              <button
                type="button"
                onClick={() => setTransferMethod('wallet')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transferMethod === 'wallet'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'bg-black/30 text-gray-300 border border-white/20 hover:bg-black/40'
                }`}
                disabled={isTransferring || !isWalletConnected}
              >
                {t('credits.transfer.methodWallet', { defaultValue: 'Wallet Address' })}
              </button>
            </div>
            {!isWalletConnected && transferMethod !== 'userId' && (
              <p className="mt-1 text-xs text-amber-400">
                {t('wallet.notConnected', { defaultValue: 'Wallet Not Connected', ns: 'profile' })}
              </p>
            )}
          </div>

          {/* Target Input */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {transferMethod === 'userId'
                ? t('credits.transfer.targetUserId', { defaultValue: 'Target UID' })
                : t('wallet.credits.transfer.targetWallet', { defaultValue: 'Target Wallet Address' })}
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder={
                transferMethod === 'userId'
                  ? t('credits.transfer.targetUserIdPlaceholder', { defaultValue: 'Enter UID' })
                  : t('wallet.credits.transfer.targetWalletPlaceholder', { defaultValue: 'Enter wallet address' })
              }
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              disabled={isTransferring}
              required
            />
          </div>

          {/* Amount Input */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.transfer.amount', { defaultValue: 'Amount' })}
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder={t('credits.transfer.amountPlaceholder', { defaultValue: 'Enter amount' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              min="1"
              disabled={isTransferring}
              required
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.transfer.description', { defaultValue: 'Description (Optional)' })}
            </label>
            <input
              type="text"
              value={transferDescription}
              onChange={(e) => setTransferDescription(e.target.value)}
              placeholder={t('credits.transfer.descriptionPlaceholder', { defaultValue: 'Enter description' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              disabled={isTransferring}
            />
          </div>

          {/* Error Message */}
          {transferError && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 text-red-300 text-xs rounded">
              {transferError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isTransferring || (transferMethod === 'wallet' && !isWalletConnected)}
            className="w-full px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('credits.transfer.processing', { defaultValue: 'Processing...', ns: 'profile' })}
              </span>
            ) : (
              t('credits.transfer.submit', { defaultValue: 'Transfer Credits', ns: 'profile' })
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreditsTransfer;
