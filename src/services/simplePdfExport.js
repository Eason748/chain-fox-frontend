/**
 * Simple PDF Export Service
 * Provides basic functionality to export data directly to PDF
 * This avoids Content Security Policy issues by using a minimal approach
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Creates a simple PDF report from audit data
 * @param {Object} report - The report data
 * @param {Array} issues - The issues data
 * @param {string} filename - Name of the PDF file to download
 * @param {Object} options - Additional options for PDF generation
 * @returns {Promise<boolean>} - Whether the export was successful
 */
export const createSimplePdf = async (report, issues, filename = 'report.pdf', options = {}) => {
  if (!report) {
    console.error('Report data is not available');
    return false;
  }

  try {
    // Show loading state if provided
    if (options.onStart) {
      options.onStart();
    }
    
    console.log('Creating simple PDF report...');

    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Security Audit Report', 105, 20, { align: 'center' });
    
    // Add repository info
    doc.setFontSize(12);
    doc.text(`Repository: ${report.repo_name}`, 20, 40);
    doc.text(`Owner: ${report.user_name}`, 20, 50);
    doc.text(`Date: ${new Date(report.created_at).toLocaleDateString()}`, 20, 60);
    doc.text(`Risk Score: ${report.risk_score}%`, 20, 70);
    
    // Filter issues to exclude false positives
    const filteredIssues = issues.filter(issue => !issue.false_positive);
    
    // Count issues by severity
    const severityCounts = {
      critical: filteredIssues.filter(issue => issue.severity === 'critical').length,
      high: filteredIssues.filter(issue => issue.severity === 'high').length,
      medium: filteredIssues.filter(issue => issue.severity === 'medium').length,
      low: filteredIssues.filter(issue => issue.severity === 'low').length,
      info: filteredIssues.filter(issue => issue.severity === 'info' || issue.severity === 'informational').length
    };
    
    // Add vulnerability summary table
    doc.text('Vulnerability Summary', 20, 90);
    
    const tableData = [
      ['Critical', severityCounts.critical.toString()],
      ['High', severityCounts.high.toString()],
      ['Medium', severityCounts.medium.toString()],
      ['Low', severityCounts.low.toString()],
      ['Info', severityCounts.info.toString()],
      ['Total', filteredIssues.length.toString()]
    ];
    
    autoTable(doc, {
      startY: 100,
      head: [['Severity', 'Count']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255]
      }
    });
    
    // Group issues by file
    const issuesByFile = {};
    filteredIssues.forEach(issue => {
      const filePath = issue.file_path || 'Unknown File';
      if (!issuesByFile[filePath]) {
        issuesByFile[filePath] = [];
      }
      issuesByFile[filePath].push(issue);
    });
    
    // Add detailed findings
    let yPos = doc.previousAutoTable ? doc.previousAutoTable.finalY + 20 : 150;
    
    doc.setFontSize(16);
    doc.text('Detailed Findings', 20, yPos);
    yPos += 10;
    
    // If no issues, show a message
    if (Object.keys(issuesByFile).length === 0) {
      doc.setFontSize(12);
      doc.text('No issues detected. Scan completed successfully.', 20, yPos + 10);
    } else {
      // Process each file and its issues
      let fileIndex = 0;
      for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
        // Add new page if needed
        if (yPos > 250 && fileIndex > 0) {
          doc.addPage();
          yPos = 20;
        }
        
        // File header
        doc.setFontSize(14);
        doc.text(`File: ${filePath}`, 20, yPos);
        yPos += 10;
        
        // Create table for issues in this file
        const issueRows = fileIssues.map(issue => [
          issue.severity.toUpperCase(),
          issue.line_number || 'N/A',
          issue.issue_type || 'Issue',
          issue.message ? (issue.message.length > 50 ? issue.message.substring(0, 50) + '...' : issue.message) : 'No description'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Severity', 'Line', 'Type', 'Description']],
          body: issueRows,
          theme: 'grid',
          styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 15 },
            2: { cellWidth: 30 },
            3: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.previousAutoTable.finalY + 15;
        fileIndex++;
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text(`© ${new Date().getFullYear()} Chain Fox`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(filename);
    
    console.log('PDF created successfully');
    
    // Call success callback if provided
    if (options.onComplete) {
      options.onComplete();
    }
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Call error callback if provided
    if (options.onError) {
      options.onError({
        message: 'Failed to generate PDF: ' + (error.message || 'Unknown error'),
        originalError: error,
        details: 'An error occurred during PDF generation'
      });
    }
    
    return false;
  }
};

export default {
  createSimplePdf
};
