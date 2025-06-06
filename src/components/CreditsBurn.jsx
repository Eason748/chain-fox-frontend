import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { notify } from './ui/Notification';
import { supabase } from '../services/supabase';
import {
  checkCanSubmitBurnRequest,
  createBurnRequest,
  getUserBurnRequests,
  calculateExpectedCfx
} from '../services/creditsBurnService';

/**
 * CreditsBurn component
 * Allows users to burn credits to receive CFX tokens
 */
const CreditsBurn = ({ onClose }) => {
  const { t } = useTranslation(['profile', 'common']);
  const { user, userCredits, refreshUserCredits } = useAuth();
  const { address: walletAddress } = useWallet();

  const [burnAmount, setBurnAmount] = useState('');
  // Remove targetWalletAddress state since we'll use the connected wallet directly
  const [isBurning, setIsBurning] = useState(false);
  const [burnError, setBurnError] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequestInfo, setPendingRequestInfo] = useState(null);
  const [exchangeRate] = useState(10); // Fixed rate: 1 credit = 10 CFX
  const [burnHistory, setBurnHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Default to show history

  // Check eligibility on component mount
  useEffect(() => {
    checkEligibility();
    loadBurnHistory();
  }, []);

  // Re-check eligibility when wallet connection changes
  useEffect(() => {
    checkEligibility();
  }, [walletAddress]);

  const checkEligibility = async () => {
    try {
      // First check if wallet is connected
      if (!walletAddress) {
        setCanSubmit(false);
        setEligibilityMessage('Please connect your wallet to burn credits');
        setBurnError('Please connect your wallet to burn credits');
        setHasPendingRequest(false);
        setPendingRequestInfo(null);
        return;
      }

      const result = await checkCanSubmitBurnRequest();
      setCanSubmit(result.canSubmit);
      setEligibilityMessage(result.message);

      // Check if user has pending request
      if (!result.canSubmit && result.reason === 'PENDING_REQUEST_EXISTS') {
        setHasPendingRequest(true);
        setPendingRequestInfo({
          pendingRequestId: result.pendingRequestId,
          message: result.message
        });
        setBurnError(''); // Don't show as error, show as info instead
      } else if (!result.canSubmit) {
        setHasPendingRequest(false);
        setPendingRequestInfo(null);
        setBurnError(result.message);
      } else {
        setHasPendingRequest(false);
        setPendingRequestInfo(null);
        setBurnError('');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setCanSubmit(false);
      setEligibilityMessage('Failed to check eligibility');
      setBurnError('Failed to check eligibility');
      setHasPendingRequest(false);
      setPendingRequestInfo(null);
    }
  };

  const loadBurnHistory = async () => {
    setLoadingHistory(true);
    try {
      // Also try direct RPC call for debugging
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Current user ID:', user.id);

        // Check if user is in whitelist
        const { data: whitelistData, error: whitelistError } = await supabase
          .from('whitelist_users')
          .select('*')
          .eq('user_id', user.id);
        console.log('Whitelist check:', { whitelistData, whitelistError });

        // Check if credits_burn_requests table exists and user can access it
        const { data: tableData, error: tableError } = await supabase
          .from('credits_burn_requests')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        console.log('Table access check:', { tableData, tableError });

        // Direct RPC call for debugging
        const { data: directData, error: directError } = await supabase.rpc('get_user_burn_requests', {
          p_user_id: user.id,
          p_limit: 10,
          p_offset: 0
        });
        console.log('Direct RPC result:', { directData, directError });
      }

      const result = await getUserBurnRequests(10, 0);
      console.log('Burn history result:', result); // Debug log
      if (result.success) {
        setBurnHistory(result.requests);
        console.log('Set burn history:', result.requests); // Debug log
      } else {
        console.error('Failed to load burn history:', result.error);
        setBurnHistory([]);
      }
    } catch (error) {
      console.error('Error loading burn history:', error);
      setBurnHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleBurnSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) {
      setBurnError(eligibilityMessage);
      return;
    }

    setBurnError('');
    setIsBurning(true);

    try {
      const amount = parseInt(burnAmount, 10);
      
      // Validate inputs
      if (isNaN(amount) || amount < 100 || amount > 10000) {
        setBurnError('Burn amount must be between 100 and 10,000 credits');
        setIsBurning(false);
        return;
      }

      if (!walletAddress || !walletAddress.trim()) {
        setBurnError('Please connect your wallet first');
        setIsBurning(false);
        return;
      }

      if (amount > userCredits) {
        setBurnError(`Insufficient credits. You have ${userCredits} credits.`);
        setIsBurning(false);
        return;
      }

      const expectedCfx = calculateExpectedCfx(amount);

      // Confirm burn
      const confirmMessage = t('credits.burn.confirm', {
        amount,
        expectedCfx,
        wallet: walletAddress,
        defaultValue: `Are you sure you want to burn ${amount} credits to receive ${expectedCfx} CFX at wallet ${walletAddress}? This action cannot be undone.`
      });

      if (!window.confirm(confirmMessage)) {
        setIsBurning(false);
        return;
      }

      // Execute burn
      const result = await createBurnRequest(amount, walletAddress);

      if (!result.success) {
        setBurnError(result.message || 'Failed to create burn request');
        setIsBurning(false);
        return;
      }

      // Success
      notify.success(t('credits.burn.success', {
        amount,
        expectedCfx,
        defaultValue: `Successfully burned ${amount} credits. You will receive ${expectedCfx} CFX once processed by admin.`
      }));

      // Reset form
      setBurnAmount('');

      // Refresh user credits and check eligibility
      await refreshUserCredits();
      await checkEligibility();
      await loadBurnHistory();

    } catch (error) {
      console.error('Error burning credits:', error);
      setBurnError(error.message || 'Failed to burn credits');
    } finally {
      setIsBurning(false);
    }
  };

  const getExpectedCfx = () => {
    return calculateExpectedCfx(burnAmount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
            Pending Payment
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/20 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {t('credits.burn.title', { defaultValue: 'Burn Credits' })}
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

      {/* Exchange Rate Info */}
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center text-blue-300 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Burn: 1 Credit, Reward {exchangeRate} CFX</span>
        </div>
      </div>

      {/* Error Message */}
      {burnError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center text-red-300 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{burnError}</span>
          </div>
        </div>
      )}

      {/* Wallet Connection Warning */}
      {!walletAddress && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center text-yellow-300 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{t('credits.burn.connectWallet', { defaultValue: 'Please connect your wallet to burn credits and receive CFX' })}</span>
          </div>
        </div>
      )}

      {/* Pending Request Info */}
      {hasPendingRequest && pendingRequestInfo && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center text-blue-300 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('credits.burn.pendingRequest', { defaultValue: 'You have a pending burn request. Please check your burn history below for details.' })}</span>
          </div>
        </div>
      )}

      {/* Burn Form */}
      {canSubmit && walletAddress && (
        <form onSubmit={handleBurnSubmit} className="space-y-4">
          {/* Current Credits Display */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.burn.currentCredits', { defaultValue: 'Current Credits' })}
            </label>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-green-300 text-sm">
              {userCredits !== null ? userCredits : '--'}
            </div>
          </div>

          {/* Burn Amount Input */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.burn.amount', { defaultValue: 'Burn Amount (100-10,000)' })}
            </label>
            <input
              type="number"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder={t('credits.burn.amountPlaceholder', { defaultValue: 'Enter amount to burn' })}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 text-sm
                backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              min="100"
              max="10000"
              disabled={isBurning}
              required
            />
          </div>

          {/* Expected CFX Display */}
          {burnAmount && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                {t('credits.burn.expectedCfx', { defaultValue: 'Expected CFX' })}
              </label>
              <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-purple-300 text-sm">
                {getExpectedCfx().toLocaleString()} CFX
              </div>
            </div>
          )}

          {/* Wallet Address Display */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              {t('credits.burn.walletAddress', { defaultValue: 'Connected Wallet Address' })}
            </label>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-blue-300 text-sm">
              {walletAddress || t('credits.burn.noWallet', { defaultValue: 'No wallet connected' })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isBurning || !canSubmit}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isBurning || !canSubmit
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300'
            }`}
          >
            {isBurning ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('credits.burn.processing', { defaultValue: 'Processing...' })}
              </span>
            ) : (
              t('credits.burn.submit', { defaultValue: 'Burn Credits' })
            )}
          </button>
        </form>
      )}

      {/* History Section */}
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 transition-transform ${showHistory ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {t('credits.burn.history', { defaultValue: 'Burn History' })} ({burnHistory.length})
          </button>

          {/* Show pending request indicator */}
          {hasPendingRequest && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
              {t('credits.burn.hasPending', { defaultValue: 'Has Pending Request' })}
            </span>
          )}
        </div>

        {/* History List */}
        {showHistory && (
          <div className="mt-3 space-y-2">
            {loadingHistory ? (
              <div className="text-center text-gray-400 text-sm py-4">
                {t('common.loading', { defaultValue: 'Loading...' })}
              </div>
            ) : burnHistory.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                {t('credits.burn.noHistory', { defaultValue: 'No burn history found' })}
              </div>
            ) : (
              burnHistory.map((request) => {
                const isPending = request.status === 'pending_payment';
                return (
                  <div
                    key={request.id}
                    className={`rounded-lg p-3 border ${
                      isPending
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-black/20 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm">
                        <span className="text-orange-300 font-medium">{request.burn_amount} Credits</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-purple-300 font-medium">{Number(request.expected_cfx_amount).toLocaleString()} CFX</span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-xs text-gray-400">
                      <div>Wallet: {request.wallet_address}</div>
                      <div>Created: {new Date(request.created_at).toLocaleDateString()}</div>
                      {request.completed_at && (
                        <div>Completed: {new Date(request.completed_at).toLocaleDateString()}</div>
                      )}
                      {request.admin_notes && (
                        <div className="mt-1 text-blue-300">Note: {request.admin_notes}</div>
                      )}
                      {isPending && (
                        <div className="mt-2 text-yellow-300 text-xs">
                          {t('credits.burn.pendingNote', {
                            defaultValue: 'Your credits have been deducted. Admin will process CFX payment soon.'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsBurn;
