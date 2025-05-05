import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import MultiSelectFilter from '../ui/MultiSelectFilter';

const IssueFilters = ({
  severityFilters,
  onSeverityFiltersChange,
  categoryFilters,
  onCategoryFiltersChange,
  availableCategories,
  showFeedback,
  onShowFeedbackChange,
  issueViewMode,
  onIssueViewModeChange,
  isMultiSelectMode,
  onMultiSelectModeChange
}) => {
  const { t } = useTranslation('common');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col md:flex-row gap-4"
    >
      <div className="w-full md:w-48">
        <MultiSelectFilter
          selectedValues={severityFilters}
          onChange={onSeverityFiltersChange}
          options={[
            { value: 'critical', label: t('reportPage.severity.critical', 'Critical') },
            { value: 'high', label: t('reportPage.severity.high', 'High') },
            { value: 'medium', label: t('reportPage.severity.medium', 'Medium') },
            { value: 'low', label: t('reportPage.severity.low', 'Low') },
            { value: 'info', label: t('reportPage.severity.info', 'Info') },
          ]}
          label={t('reportPage.filters.allSeverities', 'All Severities')}
        />
      </div>
      <div className="w-full md:w-64">
        <MultiSelectFilter
          selectedValues={categoryFilters}
          onChange={onCategoryFiltersChange}
          options={availableCategories.map(cat => ({
            value: cat,
            label: cat
          }))}
          label={t('reportPage.filters.allCategories', 'All Categories')}
          disabled={availableCategories.length === 0}
        />
      </div>
      <div className="w-full md:w-64">
        <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 backdrop-blur-sm flex items-center justify-between">
          <span>{t('reportPage.filters.showFeedback', 'Show Feedback')}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showFeedback}
              onChange={() => onShowFeedbackChange(!showFeedback)}
            />
            <div className={`w-11 h-6 rounded-full peer ${showFeedback ? 'bg-purple-600' : 'bg-gray-700'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>
      <div className="flex-grow flex justify-end gap-2">
        <button
          onClick={onMultiSelectModeChange}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            isMultiSelectMode
              ? 'bg-purple-600/50 text-white'
              : 'bg-black/30 text-gray-400 hover:bg-white/5 border border-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isMultiSelectMode
                ? "M5 13l4 4L19 7" // Checkmark
                : "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"} // Checkbox
            />
          </svg>
          {isMultiSelectMode
            ? t('reportPage.exitMultiSelect', 'Exit Selection')
            : t('reportPage.multiSelect', 'Multi-Select')}
        </button>

        <div className="flex items-center bg-black/30 rounded-lg border border-white/10 p-1">
          <button
            onClick={() => onIssueViewModeChange('list')}
            className={`px-3 py-1 rounded-md text-sm ${issueViewMode === 'list'
              ? 'bg-purple-600/50 text-white'
              : 'text-gray-400 hover:bg-white/5'}`}
          >
            {t('reportPage.viewModes.list', 'List View')}
          </button>
          <button
            onClick={() => onIssueViewModeChange('file-grouped')}
            className={`px-3 py-1 rounded-md text-sm ${issueViewMode === 'file-grouped'
              ? 'bg-purple-600/50 text-white'
              : 'text-gray-400 hover:bg-white/5'}`}
          >
            {t('reportPage.viewModes.fileGrouped', 'File View')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueFilters;
