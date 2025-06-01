import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import AuthRequired from '../components/AuthRequired';
import StakingPanel from '../components/StakingPanel';

/**
 * StakePage component - Dedicated page for CFX staking functionality
 */
const StakePage = () => {
  const { t } = useTranslation(['profile', 'common']);
  const navigate = useNavigate();
  const { cfxBalance } = useWallet();

  return (
    <AuthRequired>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('staking.title', { ns: 'profile' })}
              </h1>
              <p className="text-gray-300">
                {t('staking.description', { ns: 'profile' })}
              </p>
            </div>
            
            {/* Back to Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToProfile', { defaultValue: 'Back to Profile', ns: 'profile' })}
            </button>
          </div>
        </motion.div>

        {/* Staking Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StakingPanel cfxBalance={cfxBalance || 0} />
        </motion.div>
      </div>
    </AuthRequired>
  );
};

export default StakePage;
