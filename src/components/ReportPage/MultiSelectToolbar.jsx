import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CustomSelect from '../ui/CustomSelect';
import { feedbackOptions } from './utils/constants';

const MultiSelectToolbar = ({
  isMultiSelectMode,
  selectedIssueIds,
  bulkFeedbackValue,
  onBulkFeedbackValueChange,
  onApplyBulkFeedback,
  onClearSelection
}) => {
  const { t } = useTranslation('common');

  if (!isMultiSelectMode || selectedIssueIds.length === 0) return null;

  const translatedOptions = feedbackOptions.map(option => ({
    ...option,
    label: option.value === '' 
      ? t('reportPage.selectFeedback', 'Select FB') 
      : option.value === null 
        ? t('reportPage.clearFeedback', 'Clear')
        : option.label
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg flex flex-wrap items-center gap-3"
    >
      <span className="text-purple-300 font-medium">
        {selectedIssueIds.length} {t('reportPage.selected', 'selected')}
      </span>

      <div className="flex-grow"></div>

      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{t('reportPage.bulkSetFeedback', 'Set feedback:')}</span>
        <CustomSelect
          value={bulkFeedbackValue}
          onChange={onBulkFeedbackValueChange}
          options={translatedOptions}
          className="w-40"
        />

        <button
          onClick={() => onApplyBulkFeedback(bulkFeedbackValue)}
          disabled={bulkFeedbackValue === ''}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('reportPage.apply', 'Apply')}
        </button>

        <button
          onClick={onClearSelection}
          className="p-1 rounded-full hover:bg-white/10"
          title={t('reportPage.clearSelection', 'Clear selection')}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default MultiSelectToolbar;
