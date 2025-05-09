import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import AuditReportPDF from './AuditReportPDF';

/**
 * Audit Report Modal Component
 * Displays a modal with the audit report
 */
const AuditReportModal = ({ report, issues, onClose }) => {
  const { t } = useTranslation();
  const reportRef = useRef(null);

  if (!report) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-auto"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              {t('reportPage.pdfExport.title', 'Security Audit Report')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                title={t('common.close', 'Close')}
                aria-label={t('common.close', 'Close')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Report Content (Scrollable) */}
          <div className="flex-1 overflow-auto p-4 bg-white">
            <AuditReportPDF ref={reportRef} report={report} issues={issues} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuditReportModal;
