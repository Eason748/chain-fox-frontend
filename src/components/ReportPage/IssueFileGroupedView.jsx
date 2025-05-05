import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getSeverityStyle } from './utils/constants';

const IssueFileGroupedView = ({
  issues,
  issuesByFile,
  onIssueClick,
  onToggleFalsePositive,
  isWhitelistUser = false
}) => {
  const { t } = useTranslation('common');

  if (issuesByFile.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {issues.length === 0
          ? t('reportPage.noIssuesFound', 'No issues found for this report.')
          : t('reportPage.noMatchingIssues', 'No issues match the current filters.')}
      </div>
    );
  }

  // Calculate total issues in file view
  const totalIssuesInFileView = issuesByFile.reduce((total, fileGroup) => total + fileGroup.issues.length, 0);

  return (
    <div className="space-y-6">
      {/* Display record count */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-400">
          {t('reportPage.recordCount', 'Showing')} <span className="font-medium text-purple-400">{totalIssuesInFileView}</span> {t('reportPage.recordsOf', 'of')} <span className="font-medium text-gray-300">{issues.length}</span> {t('reportPage.records', 'records')} {t('reportPage.inFiles', 'in')} <span className="font-medium text-blue-400">{issuesByFile.length}</span> {t('reportPage.files', 'files')}
        </div>
      </div>

      {issuesByFile.map((fileGroup, index) => (
        <motion.div
          key={fileGroup.filePath}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="bg-black/30 rounded-lg border border-white/10 overflow-hidden"
        >
          <div className="p-4 bg-black/40 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex-grow">
              <h3 className="text-white font-mono text-sm md:text-base break-all">
                {fileGroup.filePath}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(fileGroup.severityCounts).map(([severity, count]) => (
                  <span
                    key={severity}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(severity)}`}
                  >
                    {severity.toUpperCase()}: {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm">
                {fileGroup.count} {fileGroup.count === 1
                  ? t('reportPage.issue', 'issue')
                  : t('reportPage.issues', 'issues')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-black/20">
                <tr>

                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.severity', 'Severity')}</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.category', 'Category')}</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.line', 'Line')}</th>
                  {isWhitelistUser && (
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.feedback', 'Feedback')}</th>
                  )}
                  <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.details', 'Details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {fileGroup.issues.map((issue) => (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >

                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => onIssueClick(issue)}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(issue.severity)}`}>
                        {issue.severity?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400" onClick={() => onIssueClick(issue)}>
                      {issue.issue_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400" onClick={() => onIssueClick(issue)}>
                      {issue.line_number || '-'}
                    </td>
                    {isWhitelistUser && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm" onClick={() => onIssueClick(issue)}>
                        {issue.feedback ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700`}>
                            {issue.feedback}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          className="p-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors"
                          onClick={() => onIssueClick(issue)}
                          title={t('reportPage.table.viewDetails', 'View Details')}
                        >
                          <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {isWhitelistUser && (
                          <button
                            className={`p-1 rounded-full ${issue.false_positive ? 'bg-red-600/50 text-red-300' : 'bg-gray-600/30 hover:bg-red-600/30 text-gray-300 hover:text-red-300'} transition-colors`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFalsePositive(issue);
                            }}
                            title={issue.false_positive ? t('reportPage.table.markedAsFalsePositive', 'Marked as False Positive') : t('reportPage.table.markAsFalsePositive', 'Mark as False Positive')}
                          >
                            <span className="text-xs font-bold">FP</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default IssueFileGroupedView;
