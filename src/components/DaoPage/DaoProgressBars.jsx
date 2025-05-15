import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDaoProgress } from '../../contexts/DaoProgressContext';

/**
 * DaoProgressBars - Component for displaying DAO progress
 * Shows a single progress bar with current progress percentage
 */
const DaoProgressBars = () => {
  const { t } = useTranslation(['dao', 'common']);
  const { progress, stage, PROGRESS_STATES } = useDaoProgress();

  // Get stage label based on progress value
  const getStageLabel = () => {
    return t(`progressStages.${stage}`, stage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto mb-12"
    >
      {/* DAO Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-purple-300 font-medium">
              {t('daoProgress', '完成度')}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-purple-300 font-medium mr-2">
              {getStageLabel()}
            </span>
            <span className="text-purple-400 font-bold">
              {progress}%
            </span>
          </div>
        </div>
        <div className="h-6 w-full bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DaoProgressBars;
