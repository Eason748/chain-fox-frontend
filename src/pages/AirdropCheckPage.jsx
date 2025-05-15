import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';
import { notify } from '../components/ui/Notification';

/**
 * FaqItem - Component for displaying a single FAQ item with collapsible answer
 * Optimized for performance with simpler animations
 */
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle newlines in the answer text
  const formattedAnswer = answer.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < answer.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div
      className={`bg-gradient-to-r ${
        isOpen
          ? 'from-blue-900/30 to-purple-900/20 border-blue-500/30'
          : 'from-gray-800/30 to-gray-900/20 border-gray-700/30 hover:border-blue-500/20'
      } border rounded-lg transition-colors duration-200`}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-medium ${isOpen ? 'text-blue-300' : 'text-white'}`}>
          {question}
        </span>
        <span
          className={`text-2xl transition-transform duration-200 text-white ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          +
        </span>
      </button>

      {isOpen && (
        <div
          className="px-4 pb-4 text-gray-300 overflow-hidden"
          style={{
            animation: isOpen ? 'faqSlideDown 0.2s ease-out forwards' : 'none'
          }}
        >
          <p>{formattedAnswer}</p>
        </div>
      )}
    </div>
  );
};

/**
 * AirdropCheckPage - Allows users to check wallet address eligibility for airdrop and potential credits amount
 */
const AirdropCheckPage = () => {
  const { t, i18n } = useTranslation(['common', 'airdrop']);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Validate wallet address format
  const isValidWalletAddress = (address) => {
    // Solana wallet addresses are base58 encoded, typically 32-44 characters
    return typeof address === 'string' &&
           /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  // Handle check button click
  const handleCheck = async () => {
    // Reset previous results and errors
    setResult(null);
    setError('');

    // Validate wallet address
    if (!walletAddress.trim()) {
      setError(t('errors.emptyWallet', { ns: 'airdrop' }));
      return;
    }

    if (!isValidWalletAddress(walletAddress.trim())) {
      setError(t('errors.invalidWallet', { ns: 'airdrop' }));
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API to check airdrop eligibility
      const { data, error: apiError } = await supabase.rpc('check_airdrop_eligibility', {
        p_wallet_address: walletAddress.trim()
      });

      if (apiError) {
        throw apiError;
      }

      // Set result
      setResult(data);
    } catch (err) {
      console.error('Error checking airdrop eligibility:', err);
      setError(t('errors.checkFailed', {
        ns: 'airdrop',
        error: err.message
      }));
      notify.error(t('errors.checkFailed', { ns: 'airdrop' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Render result card
  const renderResultCard = () => {
    if (!result) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 rounded-lg bg-gradient-to-br from-purple-900/40 to-blue-900/20 backdrop-blur-md border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('result.title', { ns: 'airdrop' })}
        </h3>

        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="text-gray-400">{t('result.walletAddress', { ns: 'airdrop' })}</div>
            <div className="font-mono text-sm text-white break-all">{walletAddress}</div>
          </div>

          {/* Eligibility Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="text-gray-400">{t('result.eligibility', { ns: 'airdrop' })}</div>
            <div className={`font-medium ${result.is_eligible ? 'text-green-400' : 'text-red-400'}`}>
              {result.is_eligible
                ? t('result.eligible', { ns: 'airdrop' })
                : t('result.notEligible', { ns: 'airdrop' })}
            </div>
          </div>

          {/* Credits Amount */}
          {result.is_eligible && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="text-gray-400">{t('result.amount', { ns: 'airdrop' })}</div>
              <div className="font-medium text-xl text-green-300">{result.amount}</div>
            </div>
          )}

          {/* Reason */}
          {!result.is_eligible && result.reason && (
            <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
              <div className="text-gray-400">{t('result.reason', { ns: 'airdrop' })}</div>
              <div className="text-red-300">{result.reason}</div>
            </div>
          )}

          {/* Notes */}
          {result.notes && (
            <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
              <div className="text-gray-400">{t('result.notes', { ns: 'airdrop' })}</div>
              <div className="text-blue-300">{result.notes}</div>
            </div>
          )}
        </div>

        {/* If eligible, show next steps */}
        {result.is_eligible && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300 text-sm">
              {t('result.nextSteps', { ns: 'airdrop' })}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-8 pt-16 md:pt-24"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('title', { ns: 'airdrop' })}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('description', { ns: 'airdrop' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
        >
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-300 mb-1">
                {t('form.walletAddress', { ns: 'airdrop' })}
              </label>
              <input
                id="wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={t('form.walletPlaceholder', { ns: 'airdrop' })}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300
                  backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Check Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCheck}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('form.checking', { ns: 'airdrop' })}
                  </div>
                ) : (
                  t('form.check', { ns: 'airdrop' })
                )}
              </button>
            </div>
          </div>

          {/* Check Results */}
          {renderResultCard()}
        </motion.div>

        {/* Credits System Information as FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-lg bg-blue-900/10 border border-blue-500/20"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">
            {t('info.title', { ns: 'airdrop' })}
          </h3>

          <div className="space-y-4">
            {t('info.faqItems', { ns: 'airdrop', returnObjects: true }).map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AirdropCheckPage;
