import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuditReportTemplate from './AuditReportTemplate';
import { exportComponentToPDF, generateReportFilename } from '../../services/pdfExport';

/**
 * Audit Report Component
 * Handles the display and export of the audit report
 */
const AuditReport = ({ data, onClose }) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!data) return;
    
    setIsExporting(true);
    
    try {
      const filename = generateReportFilename(data.scanId, data.target);
      
      await exportComponentToPDF(reportRef, filename, {
        onStart: () => setIsExporting(true),
        onComplete: () => {
          setIsExporting(false);
          // Show success message or notification here if needed
        },
        onError: (error) => {
          console.error('Export failed:', error);
          setIsExporting(false);
          // Show error message or notification here if needed
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
    }
  };

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
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('report.exporting', 'Exporting...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {t('report.exportPDF', 'Export PDF')}
                </>
              )}
            </button>
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
