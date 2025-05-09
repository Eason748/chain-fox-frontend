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
    // 不使用克隆元素，而是直接使用原始元素
    // 配置html2canvas以避免CSP问题
    const canvas = await html2canvas(element, {
      scale: 1.5, // 降低缩放比例以减少内存使用
      useCORS: true, // 启用CORS以加载跨域图像
      allowTaint: true, // 允许加载可能被污染的图像
      logging: false, // 禁用日志记录
      backgroundColor: '#FFFFFF', // 设置白色背景
      imageTimeout: 5000, // 减少图像加载超时时间
      letterRendering: true, // 改进文本渲染
      foreignObjectRendering: false, // 禁用foreignObject渲染，避免CSP问题
      removeContainer: true, // 移除临时创建的容器
      ignoreElements: (element) => {
        // 忽略可能导致CSP问题的元素
        if (!element) return false;

        const tagName = element.tagName ? element.tagName.toUpperCase() : '';

        // 忽略SVG元素和iframe元素
        if (tagName === 'SVG' || tagName === 'IFRAME') {
          return true;
        }

        // 忽略带有data URI背景的元素
        if (element.style && element.style.backgroundImage &&
            (element.style.backgroundImage.includes('data:') ||
             element.style.backgroundImage.includes('url('))) {
          return true;
        }

        // 忽略带有特定属性的图像元素
        if (tagName === 'IMG') {
          const src = element.getAttribute('src') || '';
          if (src.startsWith('data:') || !src.startsWith('http')) {
            return true;
          }
        }

        return false;
      },
      onclone: (documentClone, element) => {
        try {
          // 在克隆的文档中处理可能导致CSP问题的元素

          // 处理SVG元素
          const svgs = documentClone.querySelectorAll('svg');
          svgs.forEach(svg => {
            try {
              if (svg.parentNode) {
                // 替换SVG为一个简单的占位符div
                const placeholder = documentClone.createElement('div');
                placeholder.style.width = svg.getAttribute('width') || '24px';
                placeholder.style.height = svg.getAttribute('height') || '24px';
                placeholder.style.display = 'inline-block';
                placeholder.style.backgroundColor = '#f0f0f0';
                placeholder.style.borderRadius = '4px';
                svg.parentNode.replaceChild(placeholder, svg);
              }
            } catch (e) {
              console.warn('Error processing SVG:', e);
            }
          });

          // 移除所有iframe
          const iframes = documentClone.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            try {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            } catch (e) {
              console.warn('Error removing iframe:', e);
            }
          });

          // 处理所有图像元素
          const images = documentClone.querySelectorAll('img');
          images.forEach(img => {
            try {
              const src = img.getAttribute('src') || '';
              // 如果图像源是data URI或不是http(s)开头，替换为空白图像
              if (src.startsWith('data:') || (!src.startsWith('http') && !src.startsWith('/'))) {
                img.setAttribute('src', '');
                img.style.backgroundColor = '#f0f0f0';
              }
            } catch (e) {
              console.warn('Error processing image:', e);
            }
          });

          // 处理所有带有内联样式的元素
          const allElements = documentClone.querySelectorAll('*');
          allElements.forEach(el => {
            try {
              // 移除可能包含data URI的背景图像
              if (el.style && el.style.backgroundImage) {
                if (el.style.backgroundImage.includes('data:') ||
                    el.style.backgroundImage.includes('url(')) {
                  el.style.backgroundImage = 'none';
                  el.style.backgroundColor = '#ffffff';
                }
              }

              // 移除可能导致CSP问题的其他内联样式
              if (el.style && el.style.content && el.style.content.includes('url(')) {
                el.style.content = 'none';
              }
            } catch (e) {
              console.warn('Error processing element style:', e);
            }
          });
        } catch (e) {
          console.error('Error in onclone function:', e);
        }

        return documentClone;
      },
      ...options.canvasOptions
    });

    // Calculate PDF dimensions based on the component's aspect ratio
    const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
    const imgWidth = 210; // A4 width in mm (210mm)
    const pageHeight = 297; // A4 height in mm (297mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF instance with better text rendering
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling']
    });

    // Split into pages if content is too long
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    // Set margins for better readability
    const margin = 5; // 5mm margin
    const effectiveWidth = imgWidth - (margin * 2);

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, effectiveWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, effectiveWidth, imgHeight);
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

    // 提供更详细的错误信息
    let errorMessage = error.message || 'Unknown error occurred during PDF generation';
    let errorDetails = '';

    // 检查是否是CSP错误
    if (error.message && error.message.includes('Content Security Policy')) {
      errorMessage = 'Content Security Policy violation detected';
      errorDetails = 'The PDF generation process was blocked by the browser\'s Content Security Policy. We\'ve implemented a fix to handle this issue.';

      // 尝试使用更简单的方法生成PDF
      try {
        console.log('Attempting alternative PDF generation method...');

        // 创建一个简单的PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        // 添加标题和基本信息
        pdf.setFontSize(16);
        pdf.text('Security Audit Report', 20, 20);
        pdf.setFontSize(12);
        pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, 30);
        pdf.text('Note: Full report content could not be rendered due to browser restrictions.', 20, 40);
        pdf.text('Please try exporting as Markdown instead.', 20, 50);

        // 保存PDF
        pdf.save(filename);

        // 调用成功回调
        if (options.onComplete) {
          options.onComplete();
        }

        return true;
      } catch (fallbackError) {
        console.error('Alternative PDF generation also failed:', fallbackError);
        errorDetails += ' Alternative generation method also failed.';
      }
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Security restriction prevented PDF generation';
      errorDetails = 'A browser security restriction prevented the PDF from being generated. This might be related to cross-origin resources.';
    } else if (error.message && error.message.includes('image')) {
      errorMessage = 'Image processing error';
      errorDetails = 'There was an issue processing images during PDF generation. Some images may not appear in the PDF.';
    } else if (error.message && error.message.includes('PNG')) {
      errorMessage = 'PNG processing error';
      errorDetails = 'There was an issue processing the PNG image during PDF generation. This may be due to Content Security Policy restrictions.';
    } else {
      errorDetails = 'This may be due to Content Security Policy restrictions or issues with image loading';
    }

    console.error('PDF generation failed with message:', errorMessage);
    console.error('Error details:', errorDetails);

    // 调用错误回调（如果提供）
    if (options.onError) {
      options.onError({
        message: errorMessage,
        originalError: error,
        details: errorDetails
      });
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
