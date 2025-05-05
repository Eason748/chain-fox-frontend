import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../services/supabase'; // Import Supabase client
import AuthRequired from '../components/AuthRequired';
import CustomSelect from '../components/ui/CustomSelect'; // Assuming CustomSelect exists

// Helper function to format date code
const formatDateCode = (dateCode) => {
  if (!dateCode || dateCode.length !== 8) return 'Invalid Date';
  return `${dateCode.substring(0, 4)}-${dateCode.substring(4, 6)}-${dateCode.substring(6, 8)}`;
};

// Severity mapping for styling
const severityMap = {
  critical: { color: 'red', label: 'CRITICAL' },
  high: { color: 'orange', label: 'HIGH' },
  medium: { color: 'yellow', label: 'MEDIUM' },
  low: { color: 'blue', label: 'LOW' },
  info: { color: 'gray', label: 'INFO' }, // Assuming 'info' might exist or be added
};

const getSeverityStyle = (severity) => {
  const style = severityMap[severity?.toLowerCase()] || severityMap.info;
  return `bg-${style.color}-500/20 text-${style.color}-400`;
};

function ReportPage() {
  const { t } = useTranslation('common');
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingDateStats, setLoadingDateStats] = useState(false);
  const [error, setError] = useState(null);

  const [availableDates, setAvailableDates] = useState([]); // [{ date_code: 'YYYYMMDD', formatted_date: 'YYYY-MM-DD' }]
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYYMMDD'
  const [dateStatistics, setDateStatistics] = useState(null); // Data from audit_dates for selectedDate

  const [reports, setReports] = useState([]); // Full list of reports for selectedDate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null); // Selected report object for detail view

  const [issues, setIssues] = useState([]); // Issues for selectedReport
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null); // For modal view

  // Fetch available dates on mount
  useEffect(() => {
    const fetchDates = async () => {
      setLoadingDates(true);
      setError(null);
      try {
        const { data, error: dbError, status } = await supabase
          .from('audit_dates')
          .select('date_code, formatted_date')
          .order('formatted_date', { ascending: false });

        // console.log("ReportPage: audit_dates query result", { data, dbError, status }); // Log result (Removed)

        if (dbError) {
          // console.error("ReportPage: Error during audit_dates query:", dbError); // Error is logged by catch block
          throw dbError; // Re-throw to be caught by catch block
        }

        if (data && data.length > 0) {
          // console.log(`ReportPage: Found ${data.length} dates. Setting available dates and selecting latest: ${data[0].date_code}`); // Log removed
          setAvailableDates(data);
          setSelectedDate(data[0].date_code); // Select the latest date by default
        } else {
          // console.warn("ReportPage: No available dates found in audit_dates table."); // Log removed
          setAvailableDates([]);
          setSelectedDate('');
        }
      } catch (err) {
        console.error('Error fetching available dates:', err); // Keep this error log
        setError(t('reportPage.errors.fetchDates', 'Failed to load available dates.'));
      } finally {
        // console.log("ReportPage: Finished fetchDates."); // Log end (Removed)
        setLoadingDates(false);
      }
    };
    fetchDates();
  }, [t]);

  // Fetch date statistics when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setDateStatistics(null);
      return;
    }

    const fetchStats = async () => {
      setLoadingDateStats(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('audit_dates')
          .select('*')
          .eq('date_code', selectedDate)
          .single();

        if (dbError) {
          if (dbError.code === 'PGRST116') {
            setDateStatistics(null); // No stats for this date
            console.warn(`No date statistics found for ${selectedDate}`);
          } else {
            throw dbError;
          }
        } else {
          setDateStatistics(data);
        }
      } catch (err) {
        console.error(`Error fetching date statistics for ${selectedDate}:`, err);
        setError(t('reportPage.errors.fetchDateStats', 'Failed to load statistics for the selected date.'));
        setDateStatistics(null);
      } finally {
        setLoadingDateStats(false);
      }
    };
    fetchStats();
  }, [selectedDate, t]);

  // Fetch reports when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setReports([]);
      return;
    }

    const fetchReportsData = async () => {
      setLoadingReports(true);
      setError(null);
      setView('list'); // Reset to list view when date changes
      setSelectedReport(null);
      setIssues([]);
      try {
        const { data, error: dbError } = await supabase
          .from('audit_reports')
          .select('*')
          .eq('date_code', selectedDate)
          .order('user_name')
          .order('repo_name');

        if (dbError) throw dbError;

        setReports(data || []);
      } catch (err) {
        console.error(`Error fetching reports for date ${selectedDate}:`, err);
        setError(t('reportPage.errors.fetchReports', 'Failed to load reports for the selected date.'));
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReportsData();
  }, [selectedDate, t]);

  // Fetch issues when selectedReport changes
  useEffect(() => {
    if (!selectedReport) {
      setIssues([]);
      return;
    }

    const fetchIssuesData = async () => {
      setLoadingIssues(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('audit_issues')
          .select('*')
          .eq('report_id', selectedReport.id)
          .order('severity')
          .order('file_path')
          .order('line_number');

        if (dbError) throw dbError;

        setIssues(data || []);
      } catch (err) {
        console.error(`Error fetching issues for report ${selectedReport.id}:`, err);
        setError(t('reportPage.errors.fetchIssues', 'Failed to load issues for the selected report.'));
        setIssues([]);
      } finally {
        setLoadingIssues(false);
      }
    };
    fetchIssuesData();
  }, [selectedReport, t]);

  // Memoized filtered reports based on searchTerm
  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return reports.filter(report =>
      report.repo_name?.toLowerCase().includes(lowerSearchTerm) ||
      report.user_name?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [reports, searchTerm]);

  // Memoized filtered issues based on severity and category filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const severityMatch = severityFilter === 'all' || issue.severity?.toLowerCase() === severityFilter.toLowerCase();
      const categoryMatch = categoryFilter === 'all' || issue.issue_type === categoryFilter;
      return severityMatch && categoryMatch;
    });
  }, [issues, severityFilter, categoryFilter]);

  // Memoized available categories from the fetched issues
  const availableCategories = useMemo(() => {
    const categories = new Set(issues.map(issue => issue.issue_type));
    return ['all', ...Array.from(categories).sort()];
  }, [issues]);

  // Handlers
  const handleDateChange = (newDateCode) => {
    setSelectedDate(newDateCode);
  };

  const handleReportClick = useCallback((report) => {
    setSelectedReport(report);
    setView('detail');
    setSeverityFilter('all');
    setCategoryFilter('all');
  }, []);

  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedReport(null);
    setIssues([]);
    setError(null);
  }, []);

  const handleIssueClick = useCallback((issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  // --- Rendering Functions ---

  const renderLoader = (text = t('common.loading', 'Loading...')) => (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
      {text}
    </div>
  );

  const renderError = () => (
    <div className="my-4 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300">
      <p>{error}</p>
    </div>
  );

  const renderHeader = () => (
    <div className="mb-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center">
          {view === 'detail' && (
            <button
              onClick={handleBackToList}
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('common.back', 'Back')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {view === 'list'
                ? t('reportPage.title', 'Audit Reports')
                : selectedReport?.repo_name || t('reportPage.detailTitle', 'Report Details')}
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              {view === 'list'
                ? t('reportPage.listSubtitle', 'Browse daily audit reports.')
                : `${t('reportPage.detailSubtitle', 'Detailed view for report on')} ${formatDateCode(selectedReport?.date_code)}`}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          {loadingDates ? renderLoader(t('reportPage.loadingDates', 'Loading dates...')) : (
            <CustomSelect
              value={selectedDate}
              onChange={handleDateChange}
              options={availableDates.map(date => ({
                value: date.date_code,
                label: formatDateCode(date.date_code)
              }))}
              placeholder={t('reportPage.selectDate', 'Select date')}
              disabled={view === 'detail'}
            />
          )}
        </div>
      </motion.div>
      {error && renderError()}
    </div>
  );

  const renderDateStatistics = () => {
    if (loadingDateStats) return renderLoader(t('reportPage.loadingStats', 'Loading statistics...'));
    if (!dateStatistics) return <div className="text-center py-6 text-gray-500">{t('reportPage.noStatsForDate', 'No statistics available for this date.')}</div>;

    const stats = [
      { label: t('reportPage.stats.totalRepos', 'Total Repos'), value: dateStatistics.total_repos, color: 'purple' },
      { label: t('reportPage.stats.criticalIssues', 'Critical Issues'), value: dateStatistics.critical_issues, color: 'red' },
      { label: t('reportPage.stats.highIssues', 'High Issues'), value: dateStatistics.high_issues, color: 'orange' },
      { label: t('reportPage.stats.totalIssues', 'Total Issues'), value: dateStatistics.total_issues, color: 'blue' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-lg bg-gradient-to-br from-${stat.color}-900/40 to-${stat.color}-800/20 border border-${stat.color}-500/20`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">{stat.label}</h3>
              <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value ?? 0}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderSearchFilter = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('reportPage.searchPlaceholder', 'Search by repository or user...')}
          className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </motion.div>
  );

  const renderReportsList = () => {
    if (loadingReports) return renderLoader(t('reportPage.loadingReports', 'Loading reports...'));
    if (filteredReports.length === 0) {
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
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-purple-600/30 text-purple-300 rounded-md hover:bg-purple-600/50 transition-colors"
            >
              {t('common.clearSearch', 'Clear Search')}
            </button>
          )}
        </div>
      );
    }

    // 表格视图 - 仅在宽屏设备上显示
    const tableView = (
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
            {filteredReports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => handleReportClick(report)}
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

    // 卡片视图 - 仅在移动设备上显示
    const cardView = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="md:hidden grid grid-cols-1 gap-6"
      >
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors cursor-pointer"
            onClick={() => handleReportClick(report)}
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
        {tableView}
        {cardView}
      </>
    );
  };

  const renderReportStatistics = () => {
    if (!selectedReport) return null;

    const stats = [
      { label: t('reportPage.stats.totalIssues', 'Total Issues'), value: selectedReport.total_issues, color: 'blue' },
      { label: t('reportPage.stats.criticalIssues', 'Critical Issues'), value: selectedReport.critical_issues, color: 'red' },
      { label: t('reportPage.stats.highIssues', 'High Issues'), value: selectedReport.high_issues, color: 'orange' },
      { label: t('reportPage.stats.mediumIssues', 'Medium Issues'), value: selectedReport.medium_issues, color: 'yellow' },
      { label: t('reportPage.stats.lowIssues', 'Low Issues'), value: selectedReport.low_issues, color: 'blue' },
      { label: t('reportPage.stats.riskScore', 'Risk Score'), value: `${selectedReport.risk_score}%`, color: 'purple' },
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

  const renderIssueFilters = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col md:flex-row gap-4"
    >
      <div className="w-full md:w-48">
        <CustomSelect
          value={severityFilter}
          onChange={(value) => setSeverityFilter(value)}
          options={[
            { value: 'all', label: t('reportPage.filters.allSeverities', 'All Severities') },
            { value: 'critical', label: t('reportPage.severity.critical', 'Critical') },
            { value: 'high', label: t('reportPage.severity.high', 'High') },
            { value: 'medium', label: t('reportPage.severity.medium', 'Medium') },
            { value: 'low', label: t('reportPage.severity.low', 'Low') },
            { value: 'info', label: t('reportPage.severity.info', 'Info') },
          ]}
        />
      </div>
      <div className="w-full md:w-64">
        <CustomSelect
          value={categoryFilter}
          onChange={(value) => setCategoryFilter(value)}
          options={availableCategories.map(cat => ({
            value: cat,
            label: cat === 'all' ? t('reportPage.filters.allCategories', 'All Categories') : cat
          }))}
          disabled={availableCategories.length <= 1}
        />
      </div>
    </motion.div>
  );

  const renderIssuesTable = () => {
    if (loadingIssues) return renderLoader(t('reportPage.loadingIssues', 'Loading issues...'));
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
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-black/20">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.severity', 'Severity')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.category', 'Category')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.message', 'Message')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.file', 'File')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.line', 'Line')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredIssues.map((issue) => (
              <motion.tr
                key={issue.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => handleIssueClick(issue)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(issue.severity)}`}>
                    {severityMap[issue.severity?.toLowerCase()]?.label || issue.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{issue.issue_type}</td>
                <td className="px-6 py-4 text-sm text-white max-w-md truncate" title={issue.message}>
                  {issue.message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono truncate" title={issue.file_path}>
                  {issue.file_path || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{issue.line_number || '-'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderIssueDetailsModal = () => {
    if (!selectedIssue) return null;

    const issue = selectedIssue;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
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
                onClick={handleCloseModal}
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
                  {severityMap[issue.severity?.toLowerCase()]?.label || issue.severity}
                </span>
                {selectedReport && (
                  <span className="text-gray-400">{selectedReport.user_name}/{selectedReport.repo_name}</span>
                )}
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.fileInfo', 'File Information')}</h4>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-20 shrink-0">{t('reportPage.table.file', 'File')}:</span>
                    <span className="text-white font-mono text-sm break-all">{issue.file_path || 'N/A'}</span>
                  </div>
                  {issue.line_number && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20 shrink-0">{t('reportPage.table.line', 'Line')}:</span>
                      <span className="text-white font-mono text-sm">{issue.line_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.message', 'Message')}</h4>
                <pre className="text-white text-sm bg-black/30 p-4 rounded-lg border border-white/10 overflow-x-auto whitespace-pre-wrap">
                  {issue.message}
                </pre>
              </div>

              {issue.code_snippet && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">{t('reportPage.modal.codeSnippet', 'Code Snippet')}</h4>
                  <pre className="text-white font-mono text-sm bg-black/30 p-4 rounded-lg border border-white/10 overflow-x-auto whitespace-pre-wrap">
                    {issue.code_snippet}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-4 md:p-8 pt-16 md:pt-24 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <AuthRequired redirectToLogin={true}>
          {renderHeader()}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-4 md:p-8 rounded-xl shadow-2xl border border-white/10"
          >
            <AnimatePresence mode="wait">
              {view === 'list' ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderDateStatistics()}
                  {renderSearchFilter()}
                  {renderReportsList()}
                </motion.div>
              ) : (
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderReportStatistics()}
                  {renderIssueFilters()}
                  {renderIssuesTable()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {renderIssueDetailsModal()}
        </AuthRequired>
      </div>
    </motion.div>
  );
}

export default ReportPage;
