import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DaoProgressBars from './DaoProgressBars';

/**
 * DaoWelcome - Welcome screen component for the DAO page
 * Displays a large title, brief description, progress bars, and an "Enter DAO" button
 */
const DaoWelcome = ({ onEnterDao }) => {
  const { t } = useTranslation(['dao', 'common']);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl z-10"
      >
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Chain-Fox DAO
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
          {t('welcomeDescription', '参与项目治理与决策，通过质押CFX代币成为DAO成员，共同建设Chain-Fox的去中心化未来')}
        </p>

        {/* Progress Bars */}
        <DaoProgressBars />

        {/* <motion.button
          onClick={onEnterDao}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="px-10 py-5 text-xl font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          {t('enterDao', '了解 DAO')}
        </motion.button> */}
      </motion.div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Larger, more prominent gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-pink-500/15 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Grid overlay for cyberpunk feel */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black/20"></div>
      </div>
    </motion.div>
  );
};

export default DaoWelcome;
