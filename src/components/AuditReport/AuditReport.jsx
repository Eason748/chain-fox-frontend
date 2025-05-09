import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AuditReportTemplate from './AuditReportTemplate';

/**
 * Audit Report Component
 * Handles the display of the audit report
 */
const AuditReport = ({ data, onClose }) => {
  const { t } = useTranslation();
  const reportRef = useRef(null);

  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {t('report.title', 'Security Audit Report')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>

        {/* Report Content (Scrollable) */}
        <div className="flex-1 overflow-auto p-4 bg-white">
          <AuditReportTemplate ref={reportRef} data={data} />
        </div>
      </div>
    </div>
  );
};

export default AuditReport;
