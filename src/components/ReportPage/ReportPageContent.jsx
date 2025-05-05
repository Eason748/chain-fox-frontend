import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../services/supabase';
import { formatDateCode, groupIssuesByFile, extractCategories } from './utils/helpers';
import { defaultSeverityFilters } from './utils/constants';

// Import components
import PageHeader from './PageHeader';
import DateStatistics from './DateStatistics';
import SearchFilter from './SearchFilter';
import ReportList from './ReportList';
import ReportStatistics from './ReportStatistics';
import IssueFilters from './IssueFilters';
import MultiSelectToolbar from './MultiSelectToolbar';
import IssuesTable from './IssuesTable';
import IssueDetailsModal from './IssueDetailsModal';

const ReportPageContent = () => {
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

  // Filter states
  const [severityFilters, setSeverityFilters] = useState(defaultSeverityFilters); // Default all selected
  const [categoryFilters, setCategoryFilters] = useState([]); // Will be set after loading issues
  const [showFeedback, setShowFeedback] = useState(false); // Default don't show feedback data

  const [selectedIssue, setSelectedIssue] = useState(null); // For modal view
  const [issueViewMode, setIssueViewMode] = useState('file-grouped'); // 'list' or 'file-grouped'
  const [selectedIssueIds, setSelectedIssueIds] = useState([]); // For multi-select
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // Toggle multi-select mode
  const [bulkFeedbackValue, setBulkFeedbackValue] = useState(''); // Value for bulk feedback update

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
      } finally {
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
          .order('risk_score', { ascending: true }) // Sort by risk score ascending (lower scores first)
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

        // Set available category filters when issues are loaded
        if (data && data.length > 0) {
          const categories = [...new Set(data.map(issue => issue.issue_type))];
          setCategoryFilters(categories); // Default select all categories
        }
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

  // Memoized filtered issues based on severity, category, and feedback filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
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
  }, [issues, severityFilters, categoryFilters, showFeedback]);

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

  const handleReportClick = useCallback((report) => {
    setSelectedReport(report);
    setView('detail');
    // Reset filters to default state
    setSeverityFilters(defaultSeverityFilters);
    setCategoryFilters([]); // Will be set after loading issues
    setShowFeedback(false); // Default don't show feedback data
  }, []);

  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedReport(null);
    setIssues([]);
    setError(null);
    // Keep current view mode, don't reset to list view
    setIsMultiSelectMode(false); // Exit multi-select mode
    setSelectedIssueIds([]); // Clear selected issues
  }, []);

  const handleIssueClick = useCallback((issue) => {
    if (isMultiSelectMode) {
      // In multi-select mode, clicking toggles selection
      setSelectedIssueIds(prev => {
        if (prev.includes(issue.id)) {
          return prev.filter(id => id !== issue.id);
        } else {
          return [...prev, issue.id];
        }
      });
    } else {
      // Normal mode, show details modal
      setSelectedIssue(issue);
    }
  }, [isMultiSelectMode]);

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

  // Toggle multi-select mode
  const toggleMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(prev => !prev);
    if (isMultiSelectMode) {
      // Clear selections when exiting multi-select mode
      setSelectedIssueIds([]);
    }
  }, [isMultiSelectMode]);

  // Select/deselect all visible issues
  const toggleSelectAll = useCallback(() => {
    if (selectedIssueIds.length === filteredIssues.length) {
      // If all are selected, deselect all
      setSelectedIssueIds([]);
    } else {
      // Otherwise, select all visible issues
      setSelectedIssueIds(filteredIssues.map(issue => issue.id));
    }
  }, [selectedIssueIds, filteredIssues]);

  // Toggle selection for a file group
  const toggleFileSelection = useCallback((fileGroup) => {
    const allSelected = fileGroup.issues.every(issue => selectedIssueIds.includes(issue.id));
    if (allSelected) {
      // Deselect all in this file
      setSelectedIssueIds(prev => prev.filter(id => !fileGroup.issues.some(issue => issue.id === id)));
    } else {
      // Select all in this file
      const newIds = fileGroup.issues.map(issue => issue.id);
      setSelectedIssueIds(prev => [...prev, ...newIds.filter(id => !prev.includes(id))]);
    }
  }, [selectedIssueIds]);

  // Toggle selection for a single issue
  const toggleIssueSelection = useCallback((issueId) => {
    setSelectedIssueIds(prev => {
      if (prev.includes(issueId)) {
        return prev.filter(id => id !== issueId);
      } else {
        return [...prev, issueId];
      }
    });
  }, []);

  // Apply bulk feedback update
  const applyBulkFeedback = useCallback(async (feedbackValue) => {
    if (selectedIssueIds.length === 0) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('audit_issues')
        .update({ feedback: feedbackValue })
        .in('id', selectedIssueIds);

      if (error) throw error;

      // Update local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          selectedIssueIds.includes(issue.id)
            ? { ...issue, feedback: feedbackValue }
            : issue
        )
      );

      // Clear selections after successful update
      setSelectedIssueIds([]);
      setBulkFeedbackValue('');

      // Show success message (you could add a toast notification here)
      console.log(`Successfully updated ${selectedIssueIds.length} issues with feedback: ${feedbackValue}`);
    } catch (err) {
      console.error('Error updating feedback:', err);
      setError(t('reportPage.errors.updateFeedback', 'Failed to update feedback for selected issues.'));
    }
  }, [selectedIssueIds, t]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-4 md:p-8 pt-16 md:pt-24 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
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
                  issueViewMode={issueViewMode}
                  onIssueViewModeChange={setIssueViewMode}
                  isMultiSelectMode={isMultiSelectMode}
                  onMultiSelectModeChange={toggleMultiSelectMode}
                />
                <MultiSelectToolbar
                  isMultiSelectMode={isMultiSelectMode}
                  selectedIssueIds={selectedIssueIds}
                  bulkFeedbackValue={bulkFeedbackValue}
                  onBulkFeedbackValueChange={setBulkFeedbackValue}
                  onApplyBulkFeedback={applyBulkFeedback}
                  onClearSelection={() => setSelectedIssueIds([])}
                />
                <IssuesTable
                  isLoading={loadingIssues}
                  issues={issues}
                  filteredIssues={filteredIssues}
                  issuesByFile={issuesByFile}
                  issueViewMode={issueViewMode}
                  isMultiSelectMode={isMultiSelectMode}
                  selectedIssueIds={selectedIssueIds}
                  onIssueClick={handleIssueClick}
                  onToggleSelectAll={toggleSelectAll}
                  onToggleIssueSelection={toggleIssueSelection}
                  onToggleFileSelection={toggleFileSelection}
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
        />
      </div>
    </motion.div>
  );
};

export default ReportPageContent;
