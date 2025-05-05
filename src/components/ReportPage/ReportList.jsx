import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LoadingIndicator from './LoadingIndicator';
import { getSeverityStyle } from './utils/constants';

const ReportList = ({ reports, isLoading, searchTerm, onReportClick }) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return <LoadingIndicator text={t('reportPage.loadingReports', 'Loading reports...')} />;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-300">
          {searchTerm ? t('reportPage.noSearchResults', 'No matching reports found') : t('reportPage.noReportsForDate', 'No reports available for this date')}
        </h3>
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="mt-4 px-4 py-2 bg-purple-600/30 text-purple-300 rounded-md hover:bg-purple-600/50 transition-colors"
          >
            {t('common.clearSearch', 'Clear Search')}
          </button>
        )}
      </div>
    );
  }

  // Table view - only shown on desktop
  const TableView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden md:block overflow-x-auto"
    >
      <table className="min-w-full divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-black/40">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.repository', 'Repository')}</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.user', 'User')}</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.score', 'Score')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.stats.totalIssues', 'Total')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-red-400 uppercase tracking-wider">{t('reportPage.stats.critical', 'Critical')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-orange-400 uppercase tracking-wider">{t('reportPage.stats.high', 'High')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-yellow-400 uppercase tracking-wider">{t('reportPage.stats.medium', 'Medium')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-blue-400 uppercase tracking-wider">{t('reportPage.stats.low', 'Low')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-black/20">
          {reports.map((report, index) => (
            <motion.tr
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onReportClick(report)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-white">{report.repo_name}</div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{report.user_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                  report.risk_score < 60 ? 'critical' :
                  report.risk_score < 80 ? 'high' :
                  report.risk_score < 90 ? 'medium' : 'low'
                )}`}>
                  {report.risk_score}%
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-white">{report.total_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-red-400">{report.critical_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-orange-400">{report.high_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-yellow-400">{report.medium_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-blue-400">{report.low_issues ?? 0}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );

  // Card view - only shown on mobile
  const CardView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
      className="md:hidden grid grid-cols-1 gap-6"
    >
      {reports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors cursor-pointer"
          onClick={() => onReportClick(report)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white truncate" title={`${report.user_name}/${report.repo_name}`}>
                {report.repo_name}
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                report.risk_score < 60 ? 'critical' :
                report.risk_score < 80 ? 'high' :
                report.risk_score < 90 ? 'medium' : 'low'
              )}`}>
                {t('common.score', 'Score')}: {report.risk_score}%
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 truncate">{report.user_name}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('reportPage.stats.totalIssues', 'Total Issues')}:</span>
                <span className="text-white font-medium">{report.total_issues ?? 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.critical', 'Critical')}:</span><span className="text-red-400">{report.critical_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.high', 'High')}:</span><span className="text-orange-400">{report.high_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.medium', 'Medium')}:</span><span className="text-yellow-400">{report.medium_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.low', 'Low')}:</span><span className="text-blue-400">{report.low_issues ?? 0}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <>
      <TableView />
      <CardView />
    </>
  );
};

export default ReportList;
