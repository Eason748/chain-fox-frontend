import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getSeverityStyle } from './utils/constants';

const IssueDetailsModal = ({ issue, report, onClose }) => {
  const { t } = useTranslation('common');

  if (!issue) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 rounded-lg max-w-4xl w-full p-6 border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white">{issue.issue_type}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label={t('common.close', 'Close')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(issue.severity)}`}>
                {issue.severity?.toUpperCase()}
              </span>
              {issue.feedback && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                  {issue.feedback}
                </span>
              )}
              {report && (
                <span className="text-gray-400">{report.user_name}/{report.repo_name}</span>
              )}
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.fileInfo', 'File Information')}</h4>
              <div className="flex flex-col space-y-1">
                <div className="flex items-start">
                  <span className="text-gray-500 w-20 shrink-0 mt-1">{t('reportPage.table.file', 'File')}:</span>
                  <span className="text-white font-mono text-sm break-all bg-black/30 p-2 rounded border border-gray-800 max-h-24 overflow-y-auto w-full">{issue.file_path || 'N/A'}</span>
                </div>
                {issue.line_number && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-20 shrink-0">{t('reportPage.table.line', 'Line')}:</span>
                    <span className="text-white font-mono text-sm bg-black/30 px-2 py-1 rounded border border-gray-800">{issue.line_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.message', 'Message')}</h4>
              <pre className="text-white text-sm bg-black/30 p-4 rounded-lg border border-white/10 overflow-x-auto whitespace-pre">
                {issue.message ? issue.message.replace(/\\n/g, '\n').replace(/\\t/g, '    ').replace(/\\"/g, '"') : ''}
              </pre>
            </div>

            {issue.code_snippet && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.codeSnippet', 'Code Snippet')}</h4>
                <pre className="text-white font-mono text-sm bg-black/30 p-4 rounded-lg border border-white/10 overflow-x-auto whitespace-pre-wrap">
                  {issue.code_snippet.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < issue.code_snippet.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IssueDetailsModal;
