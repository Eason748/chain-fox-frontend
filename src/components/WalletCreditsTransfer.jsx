import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { notify } from './ui/Notification';
import { getCreditsByWallet, transferCreditsByWallet } from '../services/walletCreditsService';

/**
 * WalletCreditsTransfer component
 * Allows users to transfer credits between wallet addresses
 */
const WalletCreditsTransfer = ({ sourceWalletAddress, onClose }) => {
  const { t } = useTranslation(['profile', 'common']);
  const [targetWalletAddress, setTargetWalletAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [walletCredits, setWalletCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallet credits on component mount
  useEffect(() => {
    const loadWalletCredits = async () => {
      if (!sourceWalletAddress) return;

      setIsLoading(true);
      try {
        const { credits, error } = await getCreditsByWallet(sourceWalletAddress);
        if (error) {
          console.error('Error loading wallet credits:', error);
          notify.error(t('wallet.credits.loadError', { defaultValue: 'Failed to load wallet credits' }));
          return;
        }

        setWalletCredits(credits);
      } catch (error) {
        console.error('Error loading wallet credits:', error);
        notify.error(t('wallet.credits.loadError', { defaultValue: 'Failed to load wallet credits' }));
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletCredits();
  }, [sourceWalletAddress, t]);

  // Handle transfer credits
  const handleTransferCredits = async (e) => {
    e.preventDefault();
    setTransferError('');
    setIsTransferring(true);

    try {
      // Validate inputs
      if (!targetWalletAddress.trim()) {
        setTransferError(t('wallet.credits.transfer.errorNoWallet', { defaultValue: 'Please enter a target wallet address' }));
        setIsTransferring(false);
        return;
      }

      const amount = parseInt(transferAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        setTransferError(t('wallet.credits.transfer.errorInvalidAmount', { defaultValue: 'Please enter a valid amount (positive integer)' }));
        setIsTransferring(false);
        return;
      }

      // Confirm transfer
      if (!window.confirm(t('wallet.credits.transfer.confirm', {
        amount,
        wallet: targetWalletAddress,
        defaultValue: `Are you sure you want to transfer ${amount} credits to wallet ${targetWalletAddress}?`
      }))) {
        setIsTransferring(false);
        return;
      }

      // Execute transfer
      const result = await transferCreditsByWallet(
        sourceWalletAddress,
        targetWalletAddress,
        amount,
        transferDescription || t('wallet.credits.transfer.defaultDescription', { defaultValue: 'Wallet credits transfer' })
      );

      if (!result.success) {
        setTransferError(result.message || t('wallet.credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' }));
        setIsTransferring(false);
        return;
      }

      // Success
      notify.success(t('wallet.credits.transfer.success', {
        amount,
        remaining: result.remainingCredits,
        defaultValue: `Successfully transferred ${amount} credits. Remaining: ${result.remainingCredits}`
      }));

      // Reset form
      setTargetWalletAddress('');
      setTransferAmount('');
      setTransferDescription('');
      setWalletCredits(result.remainingCredits);

      // Close the form if requested
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error transferring credits:', error);
      setTransferError(error.message || t('wallet.credits.transfer.errorGeneral', { defaultValue: 'Failed to transfer credits' }));
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/20 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {t('wallet.credits.transfer.title', { defaultValue: 'Transfer Credits from Wallet' })}
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
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">{t('wallet.credits.sourceWallet', { defaultValue: 'Source Wallet' })}</div>
          <div className="text-sm font-medium text-blue-300">{sourceWalletAddress}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">{t('wallet.credits.available', { defaultValue: 'Available Credits' })}</div>
          <div className="text-sm font-medium text-green-300">
            {isLoading ? (
              <span className="text-gray-400 flex items-center">
                <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('auth.loading', { ns: 'common' })}
              </span>
            ) : (
              walletCredits !== null ? walletCredits : '--'
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <form onSubmit={handleTransferCredits}>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('wallet.credits.transfer.targetWallet', { defaultValue: 'Target Wallet Address' })}
            </label>
            <input
              type="text"
              value={targetWalletAddress}
              onChange={(e) => setTargetWalletAddress(e.target.value)}
              placeholder={t('wallet.credits.transfer.targetWalletPlaceholder', { defaultValue: 'Enter wallet address' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              disabled={isTransferring || isLoading}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('wallet.credits.transfer.amount', { defaultValue: 'Amount' })}
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder={t('wallet.credits.transfer.amountPlaceholder', { defaultValue: 'Enter amount' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              min="1"
              disabled={isTransferring || isLoading}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              {t('wallet.credits.transfer.description', { defaultValue: 'Description (Optional)' })}
            </label>
            <input
              type="text"
              value={transferDescription}
              onChange={(e) => setTransferDescription(e.target.value)}
              placeholder={t('wallet.credits.transfer.descriptionPlaceholder', { defaultValue: 'Enter description' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              disabled={isTransferring || isLoading}
            />
          </div>

          {transferError && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 text-red-300 text-xs rounded">
              {transferError}
            </div>
          )}

          <button
            type="submit"
            disabled={isTransferring || isLoading}
            className="w-full px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('wallet.credits.transfer.processing', { defaultValue: 'Processing...', ns: 'profile' })}
              </span>
            ) : (
              t('wallet.credits.transfer.submit', { defaultValue: 'Transfer Credits', ns: 'profile' })
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalletCreditsTransfer;
