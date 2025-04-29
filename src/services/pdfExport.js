/**
 * PDF Export Service
 * Provides functionality to export React components to PDF
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a React component to PDF
 * @param {React.RefObject} componentRef - Reference to the component to export
 * @param {string} filename - Name of the PDF file to download
 * @param {Object} options - Additional options for PDF generation
 * @returns {Promise<void>}
 */
export const exportComponentToPDF = async (componentRef, filename = 'report.pdf', options = {}) => {
  if (!componentRef.current) {
    console.error('Component reference is not available');
    return;
  }

  try {
    // Show loading state if provided
    if (options.onStart) {
      options.onStart();
    }

    const element = componentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: '#FFFFFF',
      ...options.canvasOptions
    });

    // Calculate PDF dimensions based on the component's aspect ratio
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm (210mm)
    const pageHeight = 297; // A4 height in mm (297mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Split into pages if content is too long
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;
    }

    // Add metadata
    pdf.setProperties({
      title: filename.replace('.pdf', ''),
      subject: 'Security Audit Report',
      author: 'Chain Fox',
      keywords: 'security, audit, blockchain, smart contract',
      creator: 'Chain Fox Security Audit Platform'
    });

    // Save the PDF
    pdf.save(filename);

    // Call success callback if provided
    if (options.onComplete) {
      options.onComplete();
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Call error callback if provided
    if (options.onError) {
      options.onError(error);
    }
    
    return false;
  }
};

/**
 * Generates a filename for the audit report
 * @param {string} scanId - The scan ID
 * @param {string} target - The target of the audit
 * @returns {string} - The generated filename
 */
export const generateReportFilename = (scanId, target) => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedTarget = target
    .replace(/https?:\/\//g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  
  return `ChainFox_Audit_${sanitizedTarget}_${date}.pdf`;
};

export default {
  exportComponentToPDF,
  generateReportFilename
};
