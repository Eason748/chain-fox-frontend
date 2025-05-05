import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDateCode } from './utils/helpers';
import DateSelector from './DateSelector';
import ErrorDisplay from './ErrorDisplay';

const PageHeader = ({
  view,
  onBackToList,
  selectedReport,
  selectedDate,
  availableDates,
  onDateChange,
  loadingDates,
  error
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="mb-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center">
          {view === 'detail' && (
            <button
              onClick={onBackToList}
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('common.back', 'Back')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {view === 'list'
                ? t('reportPage.title', 'Audit Reports')
                : selectedReport?.repo_name || t('reportPage.detailTitle', 'Report Details')}
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              {view === 'list'
                ? t('reportPage.listSubtitle', 'Browse daily audit reports.')
                : `${t('reportPage.detailSubtitle', 'Detailed view for report on')} ${formatDateCode(selectedReport?.date_code)}`}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            availableDates={availableDates}
            disabled={view === 'detail'}
            isLoading={loadingDates}
          />
        </div>
      </motion.div>
      <ErrorDisplay error={error} />
    </div>
  );
};

export default PageHeader;
