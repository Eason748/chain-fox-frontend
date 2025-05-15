import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDaoProgress } from '../../contexts/DaoProgressContext';

/**
 * DaoProgressAdmin - Admin component for updating DAO progress values
 * Only visible to admin users, allows manual control of progress bar
 */
const DaoProgressAdmin = ({ isVisible = false }) => {
  const { t } = useTranslation(['dao', 'common']);
  const {
    progress,
    stage,
    updateProgress,
    setCustomProgress,
    PROGRESS_STATES
  } = useDaoProgress();

  const [customProgressValue, setCustomProgressValue] = useState(progress);

  if (!isVisible) return null;

  const handleStageChange = (e) => {
    updateProgress(e.target.value);
  };

  const handleCustomProgressChange = (e) => {
    setCustomProgressValue(Number(e.target.value));
  };

  const applyCustomProgress = () => {
    setCustomProgress(customProgressValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 p-4 bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-lg z-50 w-80"
    >
      <h3 className="text-purple-400 font-bold mb-4 text-sm">DAO Progress Admin</h3>

      {/* Progress Controls */}
      <div className="mb-4">
        <label className="block text-gray-300 text-xs mb-1">Progress Stage</label>
        <select
          value={stage}
          onChange={handleStageChange}
          className="w-full bg-gray-900/80 border border-purple-500/30 rounded px-2 py-1 text-white text-sm"
        >
          {Object.keys(PROGRESS_STATES).map(stageKey => (
            <option key={stageKey} value={stageKey}>
              {stageKey} ({PROGRESS_STATES[stageKey]}%)
            </option>
          ))}
        </select>

        <div className="mt-2 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={customProgressValue}
            onChange={handleCustomProgressChange}
            className="flex-grow mr-2"
          />
          <span className="text-white text-xs">{customProgressValue}%</span>
        </div>

        <button
          onClick={applyCustomProgress}
          className="mt-1 px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs hover:bg-purple-600/50 transition-colors"
        >
          Apply Custom
        </button>
      </div>
    </motion.div>
  );
};

export default DaoProgressAdmin;
