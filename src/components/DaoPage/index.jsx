import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import DaoIntroduction from './DaoIntroduction';
import StakingProcess from './StakingProcess';
import GovernanceSection from './GovernanceSection';
import RewardsSection from './RewardsSection';
import FAQSection from './FAQSection';
import DaoWelcome from './DaoWelcome';

/**
 * DaoPageContent - Main content component for the DAO page
 * Displays information about Chain-Fox DAO governance and staking mechanisms
 */
const DaoPageContent = () => {
  const { t } = useTranslation(['dao', 'common']);
  const [showWelcome, setShowWelcome] = useState(true);

  // Always show welcome screen by default
  // No need to check localStorage anymore

  // Handle entering the DAO
  const handleEnterDao = () => {
    setShowWelcome(false);
    // Don't save to localStorage so welcome screen shows on refresh
  };

  // Handle returning to welcome screen
  const handleReturnToWelcome = () => {
    setShowWelcome(true);
    // Make sure we remove any stored value in localStorage
    localStorage.removeItem('daoWelcomeSeen');
  };

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <>
          <DaoWelcome key="welcome" onEnterDao={handleEnterDao} />
        </>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-white p-4 md:p-8 pt-16 md:pt-24 min-h-screen"
        >
          <div className="max-w-7xl mx-auto">
            {/* Return to welcome button */}
            <div className="flex justify-end mb-6">
              <motion.button
                onClick={handleReturnToWelcome}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
              >
                {t('returnToWelcome', '返回欢迎页面')}
              </motion.button>
            </div>

            {/* DAO Introduction */}
            <DaoIntroduction />

            {/* Staking Process */}
            <StakingProcess />

            {/* Rewards Section */}
            <RewardsSection />

            {/* Governance Section */}
            <GovernanceSection />

            {/* FAQ Section */}
            <FAQSection />

            {/* Conclusion */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-16 mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {t('conclusionTitle', '加入Chain-Fox DAO')}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {t('conclusion', '通过质押CFX代币，成为Chain-Fox DAO的一员，参与项目治理并获得相应权益。我们欢迎每一位社区成员积极参与，共同建设Chain-Fox的去中心化未来。')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DaoPageContent;
