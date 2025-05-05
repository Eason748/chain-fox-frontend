import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getSeverityStyle } from './utils/constants';

const IssueListView = ({
  issues,
  filteredIssues,
  isMultiSelectMode,
  selectedIssueIds,
  onIssueClick,
  onToggleSelectAll,
  onToggleIssueSelection
}) => {
  const { t } = useTranslation('common');

  if (filteredIssues.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {issues.length === 0
          ? t('reportPage.noIssuesFound', 'No issues found for this report.')
          : t('reportPage.noMatchingIssues', 'No issues match the current filters.')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Display record count */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-400">
          {t('reportPage.recordCount', 'Showing')} <span className="font-medium text-purple-400">{filteredIssues.length}</span> {t('reportPage.recordsOf', 'of')} <span className="font-medium text-gray-300">{issues.length}</span> {t('reportPage.records', 'records')}
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-black/20">
          <tr>
            {isMultiSelectMode && (
              <th scope="col" className="px-6 py-3 text-center w-10">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                    checked={filteredIssues.length > 0 && selectedIssueIds.length === filteredIssues.length}
                    onChange={onToggleSelectAll}
                  />
                </div>
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.severity', 'Severity')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.category', 'Category')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.file', 'File')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.line', 'Line')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.feedback', 'Feedback')}</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.details', 'Details')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {filteredIssues.map((issue) => (
            <motion.tr
              key={issue.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`hover:bg-white/5 transition-colors ${selectedIssueIds.includes(issue.id) ? 'bg-purple-900/20' : ''}`}
            >
              {isMultiSelectMode && (
                <td className="px-6 py-4 whitespace-nowrap w-10">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      checked={selectedIssueIds.includes(issue.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleIssueSelection(issue.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap" onClick={() => !isMultiSelectMode && onIssueClick(issue)}>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(issue.severity)}`}>
                  {issue.severity?.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400" onClick={() => !isMultiSelectMode && onIssueClick(issue)}>
                {issue.issue_type}
              </td>
              <td className="px-6 py-4 text-sm text-gray-400 font-mono" onClick={() => !isMultiSelectMode && onIssueClick(issue)}>
                <div className="max-w-xs truncate hover:text-white transition-colors" title={issue.file_path}>
                  {issue.file_path || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400" onClick={() => !isMultiSelectMode && onIssueClick(issue)}>
                {issue.line_number || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={() => !isMultiSelectMode && onIssueClick(issue)}>
                {issue.feedback ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700`}>
                    {issue.feedback}
                  </span>
                ) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button
                  className="p-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors"
                  onClick={() => onIssueClick(issue)}
                >
                  <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueListView;
