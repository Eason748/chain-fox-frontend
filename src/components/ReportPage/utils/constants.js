// Severity mapping for styling
export const severityMap = {
  critical: { color: 'red', label: 'CRITICAL' },
  high: { color: 'orange', label: 'HIGH' },
  medium: { color: 'yellow', label: 'MEDIUM' },
  low: { color: 'blue', label: 'LOW' },
  info: { color: 'gray', label: 'INFO' },
};

// Get severity style based on severity level
export const getSeverityStyle = (severity) => {
  const style = severityMap[severity?.toLowerCase()] || severityMap.info;
  return `bg-${style.color}-500/20 text-${style.color}-400`;
};

// Feedback options for dropdown
export const feedbackOptions = [
  { value: '', label: 'Select FB' },
  { value: 'safety', label: 'Safety' },
  { value: 'performance', label: 'Performance' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'dependency', label: 'Dependency' },
  { value: null, label: 'Clear' },
];

// Default severity filters
export const defaultSeverityFilters = ['critical', 'high', 'medium', 'low', 'info'];
