import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingIndicator from './LoadingIndicator';
import IssueListView from './IssueListView';
import IssueFileGroupedView from './IssueFileGroupedView';

const IssuesTable = ({
  isLoading,
  issues,
  filteredIssues,
  issuesByFile,
  issueViewMode,
  isMultiSelectMode,
  selectedIssueIds,
  onIssueClick,
  onToggleSelectAll,
  onToggleIssueSelection,
  onToggleFileSelection
}) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return <LoadingIndicator text={t('reportPage.loadingIssues', 'Loading issues...')} />;
  }

  return (
    <AnimatePresence mode="wait">
      {issueViewMode === 'list' ? (
        <motion.div
          key="list-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IssueListView
            issues={issues}
            filteredIssues={filteredIssues}
            isMultiSelectMode={isMultiSelectMode}
            selectedIssueIds={selectedIssueIds}
            onIssueClick={onIssueClick}
            onToggleSelectAll={onToggleSelectAll}
            onToggleIssueSelection={onToggleIssueSelection}
          />
        </motion.div>
      ) : (
        <motion.div
          key="file-grouped-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IssueFileGroupedView
            issues={issues}
            issuesByFile={issuesByFile}
            isMultiSelectMode={isMultiSelectMode}
            selectedIssueIds={selectedIssueIds}
            onIssueClick={onIssueClick}
            onToggleFileSelection={onToggleFileSelection}
            onToggleIssueSelection={onToggleIssueSelection}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IssuesTable;
