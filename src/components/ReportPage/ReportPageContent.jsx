import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../services/supabase';
import { formatDateCode, groupIssuesByFile, extractCategories } from './utils/helpers';
import { defaultSeverityFilters } from './utils/constants';
import { usePermission } from '../../hooks/usePermission';
import { notify } from '../../components/ui/Notification';
import { enhancedQuery } from '../../utils/requestUtils';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/loadingAnimation.css';

// Import components
import PageHeader from './PageHeader';
import DateStatistics from './DateStatistics';
import SearchFilter from './SearchFilter';
import ReportList from './ReportList';
import ReportStatistics from './ReportStatistics';
import IssueFilters from './IssueFilters';
import IssuesTable from './IssuesTable';
import IssueDetailsModal from './IssueDetailsModal';

const ReportPageContent = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { isWhitelistUser } = usePermission(); // 使用权限钩子
  const { user, loading: authLoading } = useAuth(); // 获取认证状态
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingDateStats, setLoadingDateStats] = useState(false);
  const [error, setError] = useState(null);

  // 全局加载状态
  const isLoading = authLoading || loadingDates || loadingReports || loadingIssues || loadingDateStats;

  const [availableDates, setAvailableDates] = useState([]); // [{ date_code: 'YYYYMMDD', formatted_date: 'YYYY-MM-DD' }]
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYYMMDD'
  const [dateStatistics, setDateStatistics] = useState(null); // Data from audit_dates for selectedDate

  const [reports, setReports] = useState([]); // Full list of reports for selectedDate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null); // Selected report object for detail view

  const [issues, setIssues] = useState([]); // Issues for selectedReport

  // Filter states
  const [severityFilters, setSeverityFilters] = useState(defaultSeverityFilters); // Default all selected
  const [categoryFilters, setCategoryFilters] = useState([]); // Will be set after loading issues
  const [showFeedback, setShowFeedback] = useState(false); // Default don't show feedback data
  const [showFalsePositives, setShowFalsePositives] = useState(false); // Default don't show false positives

  const [selectedIssue, setSelectedIssue] = useState(null); // For modal view
  const [issueViewMode, setIssueViewMode] = useState('file-grouped'); // 'list' or 'file-grouped'

  // Fetch available dates on mount
  useEffect(() => {
    // 如果认证尚未完成，不执行数据获取
    if (authLoading) return;

    const fetchDates = async () => {
      setLoadingDates(true);
      setError(null);

      try {
        // 使用增强的查询函数，带缓存、重试和超时机制
        const { data, error: dbError } = await enhancedQuery(
          () => supabase
            .from('audit_dates')
            .select('date_code, formatted_date')
            .order('formatted_date', { ascending: false }),
          {
            withCacheOptions: {
              cacheKey: 'audit_dates_list',
              ttl: 5 * 60 * 1000 // 缓存5分钟
            },
            withRetryOptions: {
              maxRetries: 3,
              retryDelay: 1000,
              onRetry: (attempt) => {
                console.log(`重试获取日期列表 (${attempt}/3)...`);
              }
            },
            withTimeoutOptions: {
              timeoutMs: 10000 // 10秒超时
            }
          }
        );

        if (dbError) {
          throw dbError;
        }

        if (data && data.length > 0) {
          setAvailableDates(data);
          setSelectedDate(data[0].date_code); // Select the latest date by default
        } else {
          setAvailableDates([]);
          setSelectedDate('');
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError(t('reportPage.errors.fetchDates', 'Failed to load available dates.'));
        notify.error(t('reportPage.errors.fetchDates', '加载日期列表失败，请刷新页面重试。'));
      } finally {
        setLoadingDates(false);
      }
    };

    fetchDates();
  }, [t, authLoading]);

  // Fetch date statistics when selectedDate changes
  useEffect(() => {
    // 如果认证尚未完成或没有选择日期，不执行数据获取
    if (authLoading || !selectedDate) {
      setDateStatistics(null);
      return;
    }

    const fetchStats = async () => {
      setLoadingDateStats(true);
      setError(null);

      try {
        // 使用增强的查询函数，带缓存、重试和超时机制
        const { data, error: dbError } = await enhancedQuery(
          () => supabase
            .from('audit_dates')
            .select('*')
            .eq('date_code', selectedDate)
            .single(),
          {
            withCacheOptions: {
              cacheKey: `audit_date_stats_${selectedDate}`,
              ttl: 5 * 60 * 1000 // 缓存5分钟
            },
            withRetryOptions: {
              maxRetries: 3,
              retryDelay: 1000,
              onRetry: (attempt) => {
                console.log(`重试获取日期统计 (${attempt}/3)...`);
              }
            },
            withTimeoutOptions: {
              timeoutMs: 10000 // 10秒超时
            }
          }
        );

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
        notify.error(t('reportPage.errors.fetchDateStats', '加载日期统计信息失败，请刷新页面重试。'));
        setDateStatistics(null);
      } finally {
        setLoadingDateStats(false);
      }
    };

    fetchStats();
  }, [selectedDate, t, authLoading]);

  // Fetch reports when selectedDate changes
  useEffect(() => {
    // 如果认证尚未完成或没有选择日期，不执行数据获取
    if (authLoading || !selectedDate) {
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
        // 使用增强的查询函数，带缓存、重试和超时机制
        const { data, error: dbError } = await enhancedQuery(
          () => supabase
            .from('audit_reports')
            .select('*')
            .eq('date_code', selectedDate)
            .order('risk_score', { ascending: true }) // Sort by risk score ascending (lower scores first)
            .order('user_name')
            .order('repo_name'),
          {
            withCacheOptions: {
              cacheKey: `audit_reports_${selectedDate}`,
              ttl: 5 * 60 * 1000 // 缓存5分钟
            },
            withRetryOptions: {
              maxRetries: 3,
              retryDelay: 1000,
              onRetry: (attempt) => {
                console.log(`重试获取报告列表 (${attempt}/3)...`);
              }
            },
            withTimeoutOptions: {
              timeoutMs: 15000 // 15秒超时
            }
          }
        );

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} reports for date ${selectedDate}`);
          setReports(data);
        } else {
          console.log(`No reports found for date ${selectedDate}`);
          setReports([]);
        }
      } catch (err) {
        console.error(`Error fetching reports for date ${selectedDate}:`, err);
        setError(t('reportPage.errors.fetchReports', 'Failed to load reports for the selected date.'));
        notify.error(t('reportPage.errors.fetchReports', '加载报告列表失败，请刷新页面重试。'));
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReportsData();
  }, [selectedDate, t, authLoading]);

  // Fetch issues when selectedReport changes
  useEffect(() => {
    // 如果认证尚未完成或没有选择报告，不执行数据获取
    if (authLoading || !selectedReport) {
      setIssues([]);
      return;
    }

    const fetchIssuesData = async () => {
      setLoadingIssues(true);
      setError(null);

      try {
        // 使用增强的查询函数，带缓存、重试和超时机制
        const { data, error: dbError } = await enhancedQuery(
          () => supabase
            .from('audit_issues')
            .select('*')
            .eq('report_id', selectedReport.id)
            .order('severity')
            .order('file_path')
            .order('line_number'),
          {
            withCacheOptions: {
              cacheKey: `audit_issues_${selectedReport.id}`,
              ttl: 5 * 60 * 1000 // 缓存5分钟
            },
            withRetryOptions: {
              maxRetries: 3,
              retryDelay: 1000,
              onRetry: (attempt) => {
                console.log(`重试获取问题列表 (${attempt}/3)...`);
              }
            },
            withTimeoutOptions: {
              timeoutMs: 15000 // 15秒超时
            }
          }
        );

        if (dbError) throw dbError;

        setIssues(data || []);

        // Set available category filters when issues are loaded
        if (data && data.length > 0) {
          const categories = [...new Set(data.map(issue => issue.issue_type))];
          setCategoryFilters(categories); // Default select all categories
        }
      } catch (err) {
        console.error(`Error fetching issues for report ${selectedReport.id}:`, err);
        setError(t('reportPage.errors.fetchIssues', 'Failed to load issues for the selected report.'));
        notify.error(t('reportPage.errors.fetchIssues', '加载问题列表失败，请刷新页面重试。'));
        setIssues([]);
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchIssuesData();
  }, [selectedReport, t, authLoading]);

  // Memoized filtered reports based on searchTerm
  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return reports.filter(report =>
      report.repo_name?.toLowerCase().includes(lowerSearchTerm) ||
      report.user_name?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [reports, searchTerm]);

  // Memoized filtered issues based on severity, category, feedback filters, and false_positive flag
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // 处理误报标记的问题
      if (issue.false_positive && !showFalsePositives) {
        // 如果是误报且不显示误报，则过滤掉
        return false;
      }

      // Filter by severity - show if severity is in selected filters
      const severityMatch = severityFilters.includes(issue.severity?.toLowerCase());

      // Filter by category - show if category is in selected filters or if no filters are selected
      const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(issue.issue_type);

      // Filter by feedback
      let feedbackMatch = false;

      // If showFeedback is true, show all issues
      if (showFeedback) {
        feedbackMatch = true;
      } else {
        // If showFeedback is false, only show issues without feedback
        feedbackMatch = !issue.feedback;
      }

      return severityMatch && categoryMatch && feedbackMatch;
    });
  }, [issues, severityFilters, categoryFilters, showFeedback, showFalsePositives]);

  // Group issues by file name
  const issuesByFile = useMemo(() => {
    return groupIssuesByFile(filteredIssues);
  }, [filteredIssues]);

  // Memoized available categories from the fetched issues
  const availableCategories = useMemo(() => {
    return extractCategories(issues);
  }, [issues]);

  // Handlers
  const handleDateChange = (newDateCode) => {
    setSelectedDate(newDateCode);
  };

  const handleReportClick = useCallback(async (report) => {
    // 白名单用户（审计员）点击行时进入审计界面，而不是直接查看报告
    if (isWhitelistUser) {
      // 进入审计模式，显示报告详情
      setSelectedReport(report);
      setView('detail');
      return;
    }

    // 以下是普通用户查看报告的逻辑，只有已完成的报告可以查看
    if (report.status !== 'completed' && report.status !== 'archived') {
      notify.warning(t('reportPage.pendingReportNotice', { defaultValue: '此报告尚未完成审计，无法查看详情' }));
      return;
    }

    // 直接导航到报告详情页面
    navigate(`/reports/${report.id}?confirmed=true`);

  }, [isWhitelistUser, t, navigate, setSelectedReport, setView]);

  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedReport(null);
    setIssues([]);
    setError(null);
    // Keep current view mode, don't reset to list view
  }, []);

  const handleIssueClick = useCallback((issue) => {
    // Show details modal
    setSelectedIssue(issue);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  // Handle issue update from modal
  const handleUpdateIssue = useCallback((updatedIssue) => {
    // Update the issue in the issues array
    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  }, []);

  // Handle toggling false positive flag
  const handleToggleFalsePositive = useCallback(async (issue) => {
    if (!isWhitelistUser || !issue || !issue.id) return;

    try {
      // 使用 RPC 函数检查权限
      const { data: hasPermission, error: permError } = await supabase
        .rpc('is_whitelist_user', { user_id: (await supabase.auth.getSession()).data.session?.user?.id });

      if (permError || !hasPermission) {
        console.error('权限检查失败或权限不足:', permError || '用户不在白名单中');
        return;
      }

      // 更新 false_positive 标记
      const newValue = !issue.false_positive;
      const { error } = await supabase
        .from('audit_issues')
        .update({ false_positive: newValue })
        .eq('id', issue.id);

      if (error) {
        console.error('更新 false_positive 标记失败:', error);
        return;
      }

      // 更新本地状态
      setIssues(prevIssues =>
        prevIssues.map(item =>
          item.id === issue.id ? { ...item, false_positive: newValue } : item
        )
      );

      console.log(`Issue ${issue.id} 已${newValue ? '标记为' : '取消标记'}误报`);
    } catch (error) {
      console.error('处理误报标记时出错:', error);
    }
  }, [isWhitelistUser]);

  // Handle report status change
  const handleReportStatusChange = useCallback((updatedReport) => {
    // Update the report in the reports array
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
  }, []);



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-4 md:p-8 pt-16 md:pt-24 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* 全局加载指示器 */}
        {isLoading && (
          <>
            <div className="loading-indicator"></div>
            <div className="loading-text">
              {loadingDates ? '加载日期列表...' :
               loadingDateStats ? '加载日期统计...' :
               loadingReports ? '加载报告列表...' :
               loadingIssues ? '加载问题列表...' :
               authLoading ? '验证身份...' : '加载中...'}
            </div>
          </>
        )}

        <PageHeader
          view={view}
          onBackToList={handleBackToList}
          selectedReport={selectedReport}
          selectedDate={selectedDate}
          availableDates={availableDates}
          onDateChange={handleDateChange}
          loadingDates={loadingDates}
          error={error}
        />

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
                <DateStatistics
                  dateStatistics={dateStatistics}
                  isLoading={loadingDateStats}
                />
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
                <ReportList
                  reports={filteredReports}
                  isLoading={loadingReports}
                  searchTerm={searchTerm}
                  onReportClick={handleReportClick}
                  onReportStatusChange={handleReportStatusChange}
                />
              </motion.div>
            ) : (
              <motion.div
                key="detail-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ReportStatistics report={selectedReport} />
                <IssueFilters
                  severityFilters={severityFilters}
                  onSeverityFiltersChange={setSeverityFilters}
                  categoryFilters={categoryFilters}
                  onCategoryFiltersChange={setCategoryFilters}
                  availableCategories={availableCategories}
                  showFeedback={showFeedback}
                  onShowFeedbackChange={setShowFeedback}
                  showFalsePositives={showFalsePositives}
                  onShowFalsePositivesChange={setShowFalsePositives}
                  issueViewMode={issueViewMode}
                  onIssueViewModeChange={setIssueViewMode}
                  isWhitelistUser={isWhitelistUser} // 传递白名单用户状态
                />

                <IssuesTable
                  isLoading={loadingIssues}
                  issues={issues}
                  filteredIssues={filteredIssues}
                  issuesByFile={issuesByFile}
                  issueViewMode={issueViewMode}
                  isMultiSelectMode={false}
                  selectedIssueIds={[]}
                  onIssueClick={handleIssueClick}
                  onToggleFalsePositive={handleToggleFalsePositive}
                  onToggleSelectAll={() => {}}
                  onToggleIssueSelection={() => {}}
                  onToggleFileSelection={() => {}}
                  isWhitelistUser={isWhitelistUser}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <IssueDetailsModal
          issue={selectedIssue}
          report={selectedReport}
          onClose={handleCloseModal}
          onUpdateIssue={handleUpdateIssue}
          isWhitelistUser={isWhitelistUser} // 传递白名单用户状态
        />
      </div>
    </motion.div>
  );
};

export default ReportPageContent;
