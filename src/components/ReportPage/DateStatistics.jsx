import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LoadingIndicator from './LoadingIndicator';

const DateStatistics = ({ dateStatistics, isLoading }) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return <LoadingIndicator text={t('reportPage.loadingStats', 'Loading statistics...')} />;
  }

  if (!dateStatistics) {
    return (
      <div className="text-center py-6 text-gray-500">
        {t('reportPage.noStatsForDate', 'No statistics available for this date.')}
      </div>
    );
  }

  const stats = [
    { label: t('reportPage.stats.totalRepos', 'Total Repos'), value: dateStatistics.total_repos, color: 'purple' },
    { label: t('reportPage.stats.criticalIssues', 'Critical Issues'), value: dateStatistics.critical_issues, color: 'red' },
    { label: t('reportPage.stats.highIssues', 'High Issues'), value: dateStatistics.high_issues, color: 'orange' },
    { label: t('reportPage.stats.totalIssues', 'Total Issues'), value: dateStatistics.total_issues, color: 'blue' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-lg bg-gradient-to-br from-${stat.color}-900/40 to-${stat.color}-800/20 border border-${stat.color}-500/20`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">{stat.label}</h3>
            <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value ?? 0}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DateStatistics;
