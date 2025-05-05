// Helper function to format date code
export const formatDateCode = (dateCode) => {
  if (!dateCode || dateCode.length !== 8) return 'Invalid Date';
  return `${dateCode.substring(0, 4)}-${dateCode.substring(4, 6)}-${dateCode.substring(6, 8)}`;
};

// Group issues by file name
export const groupIssuesByFile = (filteredIssues) => {
  const groupedIssues = {};

  filteredIssues.forEach(issue => {
    const filePath = issue.file_path || 'Unknown File';
    if (!groupedIssues[filePath]) {
      groupedIssues[filePath] = [];
    }
    groupedIssues[filePath].push(issue);
  });

  // Convert to array of objects for easier rendering
  return Object.entries(groupedIssues).map(([filePath, issues]) => ({
    filePath,
    issues,
    count: issues.length,
    // Count issues by severity for each file
    severityCounts: issues.reduce((counts, issue) => {
      const severity = issue.severity?.toLowerCase();
      counts[severity] = (counts[severity] || 0) + 1;
      return counts;
    }, {})
  })).sort((a, b) => a.filePath.localeCompare(b.filePath));
};

// Extract unique categories from issues
export const extractCategories = (issues) => {
  const categories = new Set(issues.map(issue => issue.issue_type));
  return Array.from(categories).sort();
};
