import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ReportStatistics = ({ report }) => {
  const { t } = useTranslation('common');

  if (!report) return null;

  const stats = [
    { label: t('reportPage.stats.totalIssues', 'Total Issues'), value: report.total_issues, color: 'blue' },
    { label: t('reportPage.stats.criticalIssues', 'Critical Issues'), value: report.critical_issues, color: 'red' },
    { label: t('reportPage.stats.highIssues', 'High Issues'), value: report.high_issues, color: 'orange' },
    { label: t('reportPage.stats.mediumIssues', 'Medium Issues'), value: report.medium_issues, color: 'yellow' },
    { label: t('reportPage.stats.lowIssues', 'Low Issues'), value: report.low_issues, color: 'blue' },
    { label: t('reportPage.stats.riskScore', 'Risk Score'), value: `${report.risk_score}%`, color: 'purple' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`p-4 rounded-lg bg-gradient-to-br from-${stat.color}-900/40 to-${stat.color}-800/20 border border-${stat.color}-500/20`}
        >
          <div className="flex flex-col items-center text-center">
            <h3 className="text-gray-400 text-xs mb-1">{stat.label}</h3>
            <span className={`text-xl font-bold text-${stat.color}-400`}>{stat.value ?? 0}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ReportStatistics;
