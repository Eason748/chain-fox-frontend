import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import AuditReportPDF from '../components/ReportPage/AuditReportPDF';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * Audit Report Detail Page
 * Displays a full page view of an audit report
 */
const AuditReportDetailPage = () => {
  const { t } = useTranslation();
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch the report
        const { data: reportData, error: reportError } = await supabase
          .from('audit_reports')
          .select('*')
          .eq('id', reportId)
          .single();
          
        if (reportError) throw reportError;
        if (!reportData) throw new Error('Report not found');
        
        setReport(reportData);
        
        // Fetch the issues related to this report
        const { data: issuesData, error: issuesError } = await supabase
          .from('audit_issues')
          .select('*')
          .eq('report_id', reportId)
          .order('severity', { ascending: false });
          
        if (issuesError) throw issuesError;
        
        setIssues(issuesData || []);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">
              {t('common.error', 'Error')}
            </h2>
            <p className="text-white/80">{error}</p>
            <button
              onClick={handleGoBack}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('common.goBack', 'Go Back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">
              {t('reportPage.notFound', 'Report Not Found')}
            </h2>
            <p className="text-white/80">
              {t('reportPage.reportNotFoundMessage', 'The requested audit report could not be found.')}
            </p>
            <button
              onClick={handleGoBack}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('common.goBack', 'Go Back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with back button */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('common.goBack', 'Go Back')}
          </button>
          <h1 className="text-xl font-bold">
            {t('reportPage.pdfExport.title', 'Security Audit Report')}
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Report content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <AuditReportPDF report={report} issues={issues} />
        </div>
      </div>
    </div>
  );
};

export default AuditReportDetailPage;
