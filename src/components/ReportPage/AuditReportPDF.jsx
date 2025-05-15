import React from 'react';
import { useTranslation } from 'react-i18next';
// 导入logo2.png作为静态资源
import logo from '/public/logo2.png';

/**
 * Audit Report PDF Template Component
 * This component renders a professional security audit report based on the provided data
 * It is designed to be exported as PDF
 */
const AuditReportPDF = React.forwardRef(({ report, issues }, ref) => {
  const { t } = useTranslation();

  if (!report) return null;

  // Format date for better readability
  const auditDate = new Date(report.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const completedDate = new Date(report.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate a unique report reference number
  const reportId = String(report.id || ''); // Ensure id is a string
  const reportRef = `CF-${reportId.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  // Count issues by severity (excluding false positives)
  const filteredIssues = issues.filter(issue => !issue.false_positive);
  const severityCounts = {
    critical: filteredIssues.filter(issue => issue.severity === 'critical').length,
    high: filteredIssues.filter(issue => issue.severity === 'high').length,
    medium: filteredIssues.filter(issue => issue.severity === 'medium').length,
    low: filteredIssues.filter(issue => issue.severity === 'low').length,
    info: filteredIssues.filter(issue => issue.severity === 'info' || issue.severity === 'informational').length
  };

  // Group issues by file
  const issuesByFile = {};
  filteredIssues.forEach(issue => {
    const filePath = issue.file_path || 'Unknown File';
    if (!issuesByFile[filePath]) {
      issuesByFile[filePath] = [];
    }
    issuesByFile[filePath].push(issue);
  });

  // Process text to convert escape sequences to actual characters
  const processText = (text) => {
    if (!text) return '';

    // Directly replace common escape sequences
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  };

  // Format code snippet for better display with terminal-like appearance
  // Only show a summary of the code to keep the report concise
  const formatCodeSnippet = (snippet, issue) => {
    if (!snippet) return '';

    const processedSnippet = processText(snippet);

    // Split the snippet into lines
    const allLines = processedSnippet.split('\n');

    // Maximum number of lines to show in the summary
    const MAX_LINES = 10;

    // If we have a line number for the issue, try to center the code around that line
    let startLine = 0;
    let endLine = Math.min(allLines.length, MAX_LINES);

    if (issue && issue.line_number) {
      // Try to parse the line number
      const lineNum = parseInt(issue.line_number, 10);
      if (!isNaN(lineNum) && lineNum > 0) {
        // Calculate a window around the issue line
        const contextLines = Math.floor(MAX_LINES / 2);
        startLine = Math.max(0, lineNum - contextLines - 1); // -1 because line numbers are 1-based
        endLine = Math.min(allLines.length, startLine + MAX_LINES);

        // Adjust if we're near the end of the file
        if (endLine - startLine < MAX_LINES && startLine > 0) {
          startLine = Math.max(0, endLine - MAX_LINES);
        }
      }
    }

    // Extract the lines we want to show
    const linesToShow = allLines.slice(startLine, endLine);

    // Get the issue line number for highlighting
    let issueLineNum = -1;
    if (issue && issue.line_number) {
      issueLineNum = parseInt(issue.line_number, 10);
    }

    // Add line numbers and format the code with the issue line highlighted
    const formattedLines = linesToShow.map((line, index) => {
      const currentLineNum = startLine + index + 1; // +1 because line numbers are 1-based
      const isIssueLine = currentLineNum === issueLineNum;

      return (
        <div
          key={index}
          style={{
            backgroundColor: isIssueLine ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
            display: 'flex'
          }}
        >
          <span style={{
            color: '#6c7280',
            minWidth: '2rem',
            textAlign: 'right',
            marginRight: '0.5rem',
            userSelect: 'none'
          }}>
            {currentLineNum}
          </span>
          <span style={{ flex: 1 }}>
            {line}
          </span>
        </div>
      );
    });

    // Add ellipsis indicators if we're not showing all lines
    const ellipsisStyle = { color: '#6c7280', fontStyle: 'italic' };

    // Add a note about the total number of lines
    const totalLinesNote = `// Showing ${linesToShow.length} of ${allLines.length} total lines`;

    return (
      <pre className="font-mono text-xs overflow-x-auto w-full"
           style={{
             whiteSpace: 'pre-wrap',
             wordBreak: 'break-all',
             lineHeight: 1.5,
             fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
           }}>
        <div className="text-gray-500 text-xs mb-1">{totalLinesNote}</div>

        {startLine > 0 && <div style={ellipsisStyle}>...</div>}

        {formattedLines}

        {endLine < allLines.length && <div style={ellipsisStyle}>...</div>}
      </pre>
    );
  };

  // Severity descriptions for the report
  const severityDescriptions = {
    critical: 'The issue puts a large number of users\' sensitive information at risk, or is reasonably likely to lead to catastrophic impact for clients\' reputations or serious financial implications for clients and users.',
    high: 'The issue puts a subset of users\' sensitive information at risk, would be detrimental to the client\'s reputation if exploited, or is reasonably likely to lead to moderate financial impact.',
    medium: 'The risk is relatively small and could not be exploited on a recurring basis, or is a risk that the client has indicated is low impact in view of the client\'s business circumstances.',
    low: 'The risk is relatively small and limited in scope, unlikely to pose significant danger to the system or its users in its current implementation.',
    info: 'The issue does not pose an immediate risk, but is relevant to security best practices or defense in depth.'
  };

  // Severity color classes are now directly used in the component

  // Get severity badge class
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical': return 'text-white bg-red-600';
      case 'high': return 'text-white bg-orange-600';
      case 'medium': return 'text-white bg-yellow-600';
      case 'low': return 'text-white bg-blue-600';
      default: return 'text-white bg-gray-600';
    }
  };

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans max-w-5xl mx-auto" style={{ lineHeight: 1.5 }}>
      {/* Report Cover Page */}
      <div className="mb-12 text-center">
        {/* 使用logo2.png */}
        <div className="h-20 mx-auto mb-6 flex items-center justify-center">
          <img src={logo} alt="Chain-Fox" className="h-16" />
          <span className="ml-2 text-2xl font-bold text-gray-800">Chain-Fox</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          CODE SECURITY ASSESSMENT
        </h1>
        <p className="text-xl mb-8">{report.repo_name}</p>
        <div className="bg-gray-100 inline-block px-6 py-3 rounded-lg">
          <p className="text-gray-600">Report Reference: {reportRef}</p>
          <p className="text-gray-600">Completed: {completedDate}</p>
        </div>
      </div>

      {/* Report Header */}
      <div className="flex justify-between items-center border-b border-gray-300 pb-6 mb-6">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('reportPage.pdfExport.title', 'Security Audit Report')}
            </h1>
            <p className="text-gray-600">{completedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{t('reportPage.pdfExport.reportId', 'Report ID')}: {reportRef}</p>
          <p className="text-sm text-gray-600">{t('reportPage.pdfExport.generatedBy', 'Generated by')}: Chain-Fox</p>
        </div>
      </div>

      {/* Project Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
          {t('reportPage.pdfExport.overview', 'Overview')}
        </h2>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">{t('reportPage.pdfExport.projectSummary', 'Project Summary')}</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>{t('reportPage.pdfExport.repository', 'Repository')}:</strong> https://github.com/{report.repo_name}</li>
            <li><strong>{t('reportPage.pdfExport.owner', 'Owner')}:</strong> {report.user_name}</li>
            <li><strong>{t('reportPage.pdfExport.auditDate', 'Audit Date')}:</strong> {auditDate}</li>
            <li><strong>{t('reportPage.pdfExport.completedDate', 'Completed Date')}:</strong> {completedDate}</li>
          </ul>
        </div>

        {/* Risk Level Description */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">Risk Level Description</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <tbody>
                <tr>
                  <td className="border px-4 py-2 bg-red-50">
                    <span className="font-medium text-red-600">High Risk</span>
                  </td>
                  <td className="border px-4 py-2">
                    {severityDescriptions.critical}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 bg-orange-50">
                    <span className="font-medium text-orange-600">Medium Risk</span>
                  </td>
                  <td className="border px-4 py-2">
                    {severityDescriptions.high}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 bg-yellow-50">
                    <span className="font-medium text-yellow-600">Low Risk</span>
                  </td>
                  <td className="border px-4 py-2">
                    {severityDescriptions.medium}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 bg-blue-50">
                    <span className="font-medium text-blue-600">Informational</span>
                  </td>
                  <td className="border px-4 py-2">
                    {severityDescriptions.info}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">{t('reportPage.pdfExport.vulnerabilitySummary', 'Vulnerability Summary')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-300 text-left">{t('reportPage.pdfExport.severity', 'Severity')}</th>
                  <th className="px-4 py-2 border-b border-gray-300 text-center">{t('reportPage.pdfExport.count', 'Count')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b border-gray-300 text-red-600 font-medium">{t('reportPage.stats.critical', 'Critical')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center">{severityCounts.critical}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-gray-300 text-orange-600 font-medium">{t('reportPage.stats.high', 'High')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center">{severityCounts.high}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-gray-300 text-yellow-600 font-medium">{t('reportPage.stats.medium', 'Medium')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center">{severityCounts.medium}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-gray-300 text-blue-600 font-medium">{t('reportPage.stats.low', 'Low')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center">{severityCounts.low}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-gray-300 text-gray-600 font-medium">{t('reportPage.stats.info', 'Informational')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center">{severityCounts.info}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-4 py-2 border-b border-gray-300 font-bold">{t('reportPage.pdfExport.total', 'Total')}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-center font-bold">{filteredIssues.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">{t('reportPage.pdfExport.riskScore', 'Risk Score')}</h3>
          <div className="bg-gray-100 p-4 rounded-lg text-center inline-block">
            <div className={`text-2xl font-bold ${
              report.risk_score >= 90 ? 'text-green-600' :
              report.risk_score >= 70 ? 'text-blue-600' :
              report.risk_score >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {report.risk_score}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t('reportPage.pdfExport.securityScore', 'Security Score')}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Findings */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
          {t('reportPage.pdfExport.detailedFindings', 'Detailed Findings')}
        </h2>

        {Object.entries(issuesByFile).length === 0 ? (
          <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-center">
            <div className="text-green-500 font-medium text-lg mb-2">
              {t('reportPage.pdfExport.noIssues', 'No issues detected.')}
            </div>
            <p className="text-gray-500">
              Scan completed successfully. No security vulnerabilities found.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(issuesByFile).map(([filePath, fileIssues]) => (
              <div key={filePath} className="mb-8">
                {/* Simple File Header - Light Theme */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-blue-700 font-mono font-bold text-base">
                      {t('reportPage.pdfExport.file', 'File')}: {filePath}
                    </h3>
                    <div className="text-gray-600 text-sm">
                      Found {fileIssues.length} {fileIssues.length === 1 ? 'issue' : 'issues'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {fileIssues.map((issue, index) => (
                    <div key={issue.id} className="p-4">
                      {/* Mac Terminal Style Card - Light Theme */}
                      <div className="overflow-hidden rounded-lg border border-gray-300 bg-gray-100 mb-4 shadow-lg">
                        {/* Terminal Window Header */}
                        <div className="bg-gradient-to-b from-gray-200 to-gray-300 px-4 py-2 flex items-center border-b border-gray-300">
                          <div className="flex space-x-2 mr-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                          </div>
                          <div className="text-gray-700 text-xs font-medium text-center flex-1">
                            {issue.issue_type || t('reportPage.pdfExport.issue', 'Issue')} {index + 1} - Terminal
                          </div>
                          <div className="ml-auto">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadgeClass(issue.severity)}`}>
                              {issue.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Terminal Content */}
                        <div className="p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          <div className="mb-3">
                            <span className="text-green-600">chain-fox@audit</span>
                            <span className="text-gray-600">:</span>
                            <span className="text-blue-600">~/security-audit</span>
                            <span className="text-gray-600">$ </span>
                            <span className="text-gray-800">cargo audit {filePath}</span>
                          </div>

                          {issue.line_number && (
                            <div className="text-gray-600 mb-2">
                              {t('reportPage.pdfExport.line', 'Line')}: {issue.line_number}
                            </div>
                          )}

                          <div className="border-l-2 border-gray-500 pl-4 py-2 mb-3">
                            <pre className="whitespace-pre-wrap font-mono text-sm" style={{
                              lineHeight: 1.5,
                              pageBreakInside: 'avoid',
                              breakInside: 'avoid'
                            }}>
                              {processText(issue.message)}
                            </pre>
                          </div>

                          {issue.code_snippet && (
                            <>
                              <div className="text-yellow-600 mb-2">$ cat code_snippet.rs</div>
                              <div className="mt-2 overflow-hidden rounded-md border border-gray-400 bg-gray-50">
                                {/* Terminal content */}
                                <div className="p-3 overflow-x-auto border-l-2 border-gray-500"
                                  style={{
                                    display: 'block',
                                    pageBreakInside: 'avoid',
                                    breakInside: 'avoid',
                                    maxHeight: '400px', // Limit height to ensure it fits well in PDF
                                    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
                                  }}>
                                  {formatCodeSnippet(issue.code_snippet, issue)}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="mt-4 text-gray-600">
                            <span className="text-yellow-600">Recommendation:</span> Review the identified issue and implement appropriate fixes following secure coding practices.
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Appendix */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
          Appendix
        </h2>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">Disclaimer</h3>
          <p className="text-gray-700 mb-3">
            This audit report is not an endorsement or indictment of any particular project or team, and the report
            does not guarantee the security of any particular project. This audit report represents a limited review
            of the code at a point in time and is not comprehensive in scope.
          </p>
          <p className="text-gray-700">
            Security assessments cannot uncover all vulnerabilities and are not guarantees of software security.
            Projects should always implement thorough testing and auditing practices beyond this report.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">Methodology</h3>
          <p className="text-gray-700 mb-3">
            Our security assessment was conducted using a combination of manual code review and automated tools.
            The audit focused on identifying security vulnerabilities, code quality issues, and adherence to best practices.
          </p>
          <p className="text-gray-700">
            Areas of focus included but were not limited to: access control, input validation, error handling,
            authorization, authentication, data protection, and contract interactions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>{t('reportPage.pdfExport.disclaimer', 'This report is provided for informational purposes only and does not constitute professional advice. Chain-Fox is not liable for any damages arising from the use of this report.')}</p>
        <p className="mt-2">© {new Date().getFullYear()} Chain-Fox. {t('reportPage.pdfExport.allRightsReserved', 'All rights reserved.')}</p>
      </footer>
    </div>
  );
});

export default AuditReportPDF;
