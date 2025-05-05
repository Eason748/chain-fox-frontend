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
  showFalsePositives,
  onShowFalsePositivesChange,
  issueViewMode,
  onIssueViewModeChange,
  isWhitelistUser // 直接从父组件接收白名单用户状态
}) => {
  const { t } = useTranslation('common');


  console.log("isWhitelistUser", isWhitelistUser)

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

      <div className="flex-grow flex justify-end gap-2">
        {isWhitelistUser && (
          <div className="flex items-center bg-black/30 rounded-lg border border-white/10 p-1 mr-2">
            <button
              onClick={() => onShowFalsePositivesChange(!showFalsePositives)}
              className={`px-3 py-1 rounded-md text-sm ${
                showFalsePositives
                  ? 'bg-red-600/50 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
              title={showFalsePositives ? t('reportPage.hideFalsePositives', 'Hide False Positives') : t('reportPage.showFalsePositives', 'Show False Positives')}
            >
              {t('reportPage.showFP', 'Show FP')}
            </button>
          </div>
        )}

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
