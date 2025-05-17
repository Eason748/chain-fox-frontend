import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import AuditReportDetail from '../components/ReportPage/AuditReportDetail';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits } from '../services/creditsService';


/**
 * Audit Report Detail Page
 * Displays a full page view of an audit report
 */
const AuditReportDetailPage = () => {
  const { t } = useTranslation();
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  const [checkingCredits, setCheckingCredits] = useState(true);

  // 定义查看报告所需的最低积分
  const MINIMUM_CREDITS_REQUIRED = 10;

  // 获取用户积分
  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          setCheckingCredits(true);
          const { credits, error } = await getUserCredits(user.id);

          if (error) {
            console.error('Error getting user credits:', error);
            setUserCredits(0); // Default to 0 on error
            setInsufficientCredits(true);
            setLoading(false); // Set loading to false on error
          } else {
            // console.log('User credits retrieved:', credits);
            // Set user credits first to avoid flickering due to asynchronous state updates
            setUserCredits(credits);

            // Then check if credits are sufficient
            if (credits < MINIMUM_CREDITS_REQUIRED) {
              // console.log(`Insufficient credits: ${credits} < ${MINIMUM_CREDITS_REQUIRED}`);
              setInsufficientCredits(true);
              setLoading(false); // Set loading to false when credits are insufficient
            } else {
              // console.log(`Sufficient credits: ${credits} >= ${MINIMUM_CREDITS_REQUIRED}`);
              setInsufficientCredits(false);
              // Don't set loading state here, let the data loading useEffect handle it
            }
          }
        } catch (err) {
          console.error('Error getting user credits:', err);
          setUserCredits(0); // Default to 0 on error
          setInsufficientCredits(true);
          setLoading(false); // Set loading to false on error
        } finally {
          setCheckingCredits(false);
        }
      } else {
        setUserCredits(0);
        setInsufficientCredits(true);
        setLoading(false); // Set loading to false when user is not logged in
        setCheckingCredits(false);
      }
    };

    fetchCredits();
  }, [user, MINIMUM_CREDITS_REQUIRED]);

  useEffect(() => {
    // 如果还在检查积分，则不执行
    if (checkingCredits) {
      return;
    }

    // 如果积分不足，则不需要加载报告数据
    if (userCredits !== null && userCredits < MINIMUM_CREDITS_REQUIRED) {
      setInsufficientCredits(true);
      setLoading(false);
      return;
    }

    const fetchReportData = async () => {
      try {
        setLoading(true);
        // Ensure we don't show the insufficient credits message while loading
        setInsufficientCredits(false);

        // Use database function to get complete report data
        const { data: completeReportData, error: reportError } = await supabase
          .rpc('get_complete_audit_report', { p_report_id: parseInt(reportId) });

        if (reportError) {
          console.error('Error fetching complete report data:', reportError);
          throw reportError;
        }

        if (!completeReportData || !completeReportData.report) {
          throw new Error('Report not found');
        }

        // Set report data
        setReport(completeReportData.report);

        // Set issues data
        setIssues(completeReportData.issues || []);

        // Log information for debugging
        console.log('Report data loaded successfully');
        console.log('Severity counts:', completeReportData.severity_counts);
        console.log('Issues by file:', Object.keys(completeReportData.issues_by_file || {}).length, 'files');
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err.message);
        // No longer redirecting, just show error message
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId, userCredits, checkingCredits, MINIMUM_CREDITS_REQUIRED]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // 首先检查是否正在加载或检查积分
  if (loading || checkingCredits) {
    return (
      <div className="min-h-screen text-white p-8">
        {/* Background gradient */}
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            zIndex: -10
          }}
        />

        {/* Grid background */}
        <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-gray-400">
              {checkingCredits
                ? t('points.checkingCredits', 'Checking credits...')
                : t('common.loading', 'Loading...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 只有在不再加载时才检查积分是否不足
  if (insufficientCredits) {
    return (
      <div className="min-h-screen text-white p-8">
        {/* Background gradient */}
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            zIndex: -10
          }}
        />

        {/* Grid background */}
        <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

        <div className="max-w-7xl mx-auto">
          <div className="bg-purple-900/30 border border-purple-500/50 backdrop-blur-sm rounded-lg p-6 text-center">
            <p className="text-white/80 mb-4">
              Credits insufficient, cannot view the audit report.
            </p>
            {/* 移除返回按钮，用户可以使用浏览器的导航或页面上的其他链接 */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-8">
        {/* Background gradient */}
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            zIndex: -10
          }}
        />

        {/* Grid background */}
        <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/30 border border-red-500/50 backdrop-blur-sm rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">
              {t('common.error', 'Error')}
            </h2>
            <p className="text-white/80">{error}</p>
            {/* 移除返回按钮，用户可以使用浏览器的导航或页面上的其他链接 */}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen text-white p-8">
        {/* Background gradient */}
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            zIndex: -10
          }}
        />

        {/* Grid background */}
        <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-900/30 border border-yellow-500/50 backdrop-blur-sm rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">
              {t('reportPage.notFound', 'Report Not Found')}
            </h2>
            <p className="text-white/80">
              {t('reportPage.reportNotFoundMessage', 'The requested audit report could not be found.')}
            </p>
            {/* 移除返回按钮，用户可以使用浏览器的导航或页面上的其他链接 */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Background gradient */}
      <div
        className="fixed top-0 left-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          zIndex: -10
        }}
      />

      {/* Grid background */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

      {/* Header with back button */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="px-3 py-2 bg-black/40 hover:bg-black/60 rounded-md transition-colors flex items-center"
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
      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-0">
        <div className="overflow-hidden">
          <AuditReportDetail report={report} issues={issues} />
        </div>
      </div>
    </div>
  );
};

export default AuditReportDetailPage;
