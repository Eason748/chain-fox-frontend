import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import deepseekService from '../services/deepseek';
import AuditReport from '../components/AuditReport/AuditReport';
import AuthRequired from '../components/AuthRequired';

// Enhanced mock API with more detailed security audit results
const mockDetectApi = async (type, data) => {
  console.log(`Mock API call for ${type}:`, data);

  // Simulate different stages of analysis with delays
  const updateProgress = (progress, callback) => {
    return new Promise(resolve => {
      setTimeout(() => {
        callback(progress);
        resolve();
      }, 800);
    });
  };

  // Generate realistic mock vulnerabilities based on type
  const generateMockVulnerabilities = (type) => {
    const commonVulns = [
      {
        id: `VULN-${Date.now()}-1`,
        severity: 'critical',
        name: 'Reentrancy Vulnerability',
        description: 'Contract state changes after external calls can lead to reentrancy attacks.',
        location: type === 'code' ? 'Line 42-57' : 'contracts/Token.sol',
        recommendation: 'Implement checks-effects-interactions pattern and consider using ReentrancyGuard.'
      },
      {
        id: `VULN-${Date.now()}-2`,
        severity: 'high',
        name: 'Unchecked Return Values',
        description: 'External call return values are not checked, which may lead to silent failures.',
        location: type === 'code' ? 'Line 78-92' : 'contracts/Marketplace.sol',
        recommendation: 'Always check return values from external calls or use SafeERC20 library.'
      },
      {
        id: `VULN-${Date.now()}-3`,
        severity: 'medium',
        name: 'Integer Overflow/Underflow',
        description: 'Arithmetic operations can overflow/underflow without proper checks.',
        location: type === 'code' ? 'Line 103-115' : 'contracts/Staking.sol',
        recommendation: 'Use SafeMath library or Solidity 0.8.x built-in overflow checks.'
      }
    ];

    // Add some randomness to the results
    const randomVulns = [
      {
        id: `VULN-${Date.now()}-4`,
        severity: 'medium',
        name: 'Centralization Risk',
        description: 'Contract has privileged roles that can control critical functions.',
        location: type === 'code' ? 'Line 15-28' : 'contracts/Governance.sol',
        recommendation: 'Consider implementing a multi-signature scheme or DAO governance.'
      },
      {
        id: `VULN-${Date.now()}-5`,
        severity: 'low',
        name: 'Gas Optimization',
        description: 'Contract uses inefficient storage patterns that consume excessive gas.',
        location: type === 'code' ? 'Line 132-145' : 'contracts/NFTMarket.sol',
        recommendation: 'Pack storage variables and optimize loops to reduce gas costs.'
      },
      {
        id: `VULN-${Date.now()}-6`,
        severity: 'info',
        name: 'Compiler Version Not Fixed',
        description: 'Solidity pragma is not locked to a specific version.',
        location: type === 'code' ? 'Line 1' : 'Multiple files',
        recommendation: 'Lock pragma to a specific version to ensure consistent compilation.'
      }
    ];

    // Randomly select some vulnerabilities
    const selectedRandomVulns = randomVulns.filter(() => Math.random() > 0.3);
    return [...commonVulns, ...selectedRandomVulns];
  };

  // Generate mock metrics
  const generateMockMetrics = () => {
    return {
      codeQuality: Math.floor(Math.random() * 40) + 60, // 60-100
      securityScore: Math.floor(Math.random() * 50) + 50, // 50-100
      gasEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100
      testCoverage: Math.floor(Math.random() * 60) + 40, // 40-100
      scanDuration: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
    };
  };

  // Return a more comprehensive result
  return new Promise(async (resolve) => {
    // Simulate a multi-stage analysis process
    await new Promise(r => setTimeout(r, 1500)); // Initial delay

    const vulnerabilities = generateMockVulnerabilities(type);
    const metrics = generateMockMetrics();

    resolve({
      success: true,
      scanId: `SCAN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      target: type === 'code' ? 'Code Snippet' : data,
      vulnerabilities: vulnerabilities,
      issuesFound: vulnerabilities.length,
      metrics: metrics,
      reportUrl: `/report/${type}/${Date.now()}`,
      summary: `Detected ${vulnerabilities.length} potential issues across ${vulnerabilities.filter(v => v.severity === 'critical').length} critical, ${vulnerabilities.filter(v => v.severity === 'high').length} high, and ${vulnerabilities.filter(v => v.severity === 'medium').length} medium severity levels.`
    });
  });
};

function DetectionPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('code');
  const [codeContent, setCodeContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [showFullReport, setShowFullReport] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [useAI, setUseAI] = useState(true); // Whether to use AI for analysis
  const [showAIThinking, setShowAIThinking] = useState(true); // Whether to show AI thinking process
  const [codeLanguage, setCodeLanguage] = useState('solidity'); // Default language
  const [streamingThinking, setStreamingThinking] = useState(''); // Streaming thinking process
  const [isStreaming, setIsStreaming] = useState(false); // Whether streaming is in progress
  const [showReport, setShowReport] = useState(false); // Whether to show the report modal
  const reportRef = useRef(null); // Reference to the report component

  // Reset state when changing tabs
  useEffect(() => {
    setResult(null);
    setError('');
    setScanProgress(0);
    setScanStage('');
    setShowFullReport(false);
    setSelectedVulnerability(null);
    setShowReport(false);
  }, [activeTab]);

  // Handle generating and showing the report
  const handleGenerateReport = () => {
    if (!result) return;
    setShowReport(true);
  };

  // Sample code snippets for different languages
  const sampleCodes = {
    solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private _value;
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    function store(uint256 value) public {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }

    function withdraw() public {
        require(msg.sender == _owner);
        payable(msg.sender).transfer(address(this).balance);
    }
}`,
    rust: `use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    msg!("Instruction executed successfully");
    Ok(())
}`
  };

  // Load sample code
  const loadSampleCode = (language) => {
    setCodeContent(sampleCodes[language] || '');
    setCodeLanguage(language);
  };

  // Enhanced detection process with updates
  const handleDetect = async () => {
    setIsLoading(true);
    setResult(null);
    setError('');
    setScanProgress(0);
    setScanStage('initializing');
    setShowAIThinking(false);

    try {
      let response;

      // Update scan status with progress animation
      const updateScanStatus = async (stage, progressStart, progressEnd) => {
        setScanStage(stage);

        // Animate progress from start to end
        const steps = 10;
        const increment = (progressEnd - progressStart) / steps;

        for (let i = 0; i < steps; i++) {
          await new Promise(r => setTimeout(r, 200));
          setScanProgress(progressStart + increment * (i + 1));
        }
      };

      if (activeTab === 'code') {
        if (!codeContent.trim()) {
          setError(t('detectionPage.error.emptyCode'));
          setIsLoading(false);
          setScanProgress(0);
          setScanStage('');
          return;
        }

        if (useAI) {
          // Use DeepSeek AI for code analysis
          try {
            // AI-specific scanning stages
            await updateScanStatus(t('detectionPage.ai.progress.initializing'), 0, 20);
            await updateScanStatus(t('detectionPage.ai.progress.analyzing'), 20, 40);

            // Reset streaming thinking content
            setStreamingThinking('');

            // Enable streaming if AI thinking is enabled
            if (showAIThinking) {
              setIsStreaming(true);
            }

            // Define callback for streaming updates
            const handleThinkingUpdate = (newThinking) => {
              if (showAIThinking) {
                setStreamingThinking(prev => prev + newThinking);
              }
            };

            // Define callback for progress updates
            const handleProgressUpdate = (progress) => {
              setScanProgress(progress);
            };

            // Call DeepSeek API with streaming support
            response = await deepseekService.auditCode(
              codeContent,
              codeLanguage,
              showAIThinking ? handleThinkingUpdate : null,
              handleProgressUpdate
            );

            // Ensure we reach 95% progress before finalizing
            setScanProgress(95);
          } catch (aiError) {
            // Reset streaming state
            setIsStreaming(false);
            console.error("AI analysis error:", aiError);

            // Fallback to mock API if AI fails
            console.log("Falling back to mock API due to AI error");

            // Standard scanning stages
            await updateScanStatus('parsing', 0, 15);
            await updateScanStatus('analyzing', 15, 40);
            await updateScanStatus('vulnerabilityDetection', 40, 70);
            await updateScanStatus('gasAnalysis', 70, 85);
            await updateScanStatus('reportGeneration', 85, 95);

            response = await mockDetectApi('code', codeContent);
          }
        } else {
          // Use mock API for code analysis
          await updateScanStatus('parsing', 0, 15);
          await updateScanStatus('analyzing', 15, 40);
          await updateScanStatus('vulnerabilityDetection', 40, 70);
          await updateScanStatus('gasAnalysis', 70, 85);
          await updateScanStatus('reportGeneration', 85, 95);

          response = await mockDetectApi('code', codeContent);
        }
      } else if (activeTab === 'github') {
        if (!githubUrl.trim() || !/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(githubUrl)) {
          setError(t('detectionPage.error.invalidGithubUrl'));
          setIsLoading(false);
          setScanProgress(0);
          setScanStage('');
          return;
        }

        // GitHub repos always use mock API for now
        await updateScanStatus('cloning', 0, 20);
        await updateScanStatus('parsing', 20, 35);
        await updateScanStatus('analyzing', 35, 60);
        await updateScanStatus('vulnerabilityDetection', 60, 80);
        await updateScanStatus('reportGeneration', 80, 95);

        response = await mockDetectApi('github', githubUrl);
      }

      // Final stage
      setScanProgress(100);
      setScanStage('complete');
      setResult(response);

    } catch (err) {
      console.error("Detection error:", err);
      setError(t('detectionPage.error.apiError'));
      setScanStage('error');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Reusable input/textarea classes
  const inputBaseClasses = "w-full p-3 border border-white/20 rounded-md bg-black/30 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 placeholder-gray-500";

  // Render the scan progress indicator
  const renderScanProgress = () => {
    if (!isLoading && scanProgress === 0) return null;

    const getStageLabel = (stage) => {
      switch (stage) {
        case 'initializing': return t('detectionPage.progress.initializing');
        case 'cloning': return t('detectionPage.progress.cloning');
        case 'parsing': return t('detectionPage.progress.parsing');
        case 'analyzing': return t('detectionPage.progress.analyzing');
        case 'vulnerabilityDetection': return t('detectionPage.progress.vulnerabilityDetection');
        case 'gasAnalysis': return t('detectionPage.progress.gasAnalysis');
        case 'reportGeneration': return t('detectionPage.progress.reportGeneration');
        case 'complete': return t('detectionPage.progress.complete');
        case 'error': return t('detectionPage.progress.error');
        default: return t('detectionPage.progress.processing');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-4"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-300">{getStageLabel(scanStage)}</span>
          <span className="text-sm font-medium text-blue-300">{Math.round(scanProgress)}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Live Streaming Thinking Process */}
        {isStreaming && streamingThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-lg bg-black/40 border border-purple-500/20"
          >
            <div className="flex items-center mb-3">
              <div className="mr-3 h-4 w-4 relative">
                <span className="animate-ping absolute h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative rounded-full h-3 w-3 bg-purple-500"></span>
              </div>
              <h3 className="text-md font-semibold text-purple-300">
                {t('detectionPage.ai.liveThinking', 'AI Thinking Process (Live)')}
              </h3>
            </div>

            <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
              <TypewriterEffect text={streamingThinking} />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Typewriter effect component for streaming text
  const TypewriterEffect = ({ text }) => {
    // We don't need to implement actual typewriter animation here
    // since the text is already being streamed in chunks
    // Just display the text as it comes in
    return (
      <div className="border-l-2 border-purple-500/30 pl-3 py-1">
        {text}
      </div>
    );
  };

  // Render vulnerability details
  const renderVulnerabilityDetails = (vuln) => {
    if (!vuln) return null;

    const severityColors = {
      critical: 'text-red-500 border-red-500 bg-red-500/10',
      high: 'text-orange-500 border-orange-500 bg-orange-500/10',
      medium: 'text-yellow-500 border-yellow-500 bg-yellow-500/10',
      low: 'text-blue-400 border-blue-400 bg-blue-400/10',
      info: 'text-gray-400 border-gray-400 bg-gray-400/10',
      informational: 'text-gray-400 border-gray-400 bg-gray-400/10'
    };

    const severityColor = severityColors[vuln.severity] || severityColors.info;
    const vulnTitle = vuln.title || vuln.name; // Support both formats

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 rounded-lg border bg-black/40 backdrop-blur-sm"
        style={{ borderColor: `rgba(${vuln.severity === 'critical' ? '239,68,68' : vuln.severity === 'high' ? '249,115,22' : '234,179,8'}, 0.3)` }}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-semibold text-white">{vulnTitle}</h4>
          <span className={`px-2 py-1 rounded text-xs font-medium ${severityColor}`}>
            {vuln.severity.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400 mb-1">{t('detectionPage.vulnerability.description')}:</p>
            <p className="text-white">{vuln.description}</p>
          </div>

          <div>
            <p className="text-gray-400 mb-1">{t('detectionPage.vulnerability.location')}:</p>
            <p className="text-white font-mono bg-black/30 px-2 py-1 rounded">{vuln.location}</p>
          </div>

          <div>
            <p className="text-gray-400 mb-1">{t('detectionPage.vulnerability.recommendation')}:</p>
            <p className="text-white">{vuln.recommendation}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSelectedVulnerability(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t('detectionPage.vulnerability.close')}
          </button>
        </div>
      </motion.div>
    );
  };

  // Render the scan results
  const renderResults = () => {
    if (!result) return null;

    const { vulnerabilities, metrics, summary, scanId, timestamp, target, thinking, rawAnalysis } = result;

    // Count vulnerabilities by severity
    const severityCounts = {
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      info: vulnerabilities.filter(v => v.severity === 'info' || v.severity === 'informational').length
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8"
      >
        {/* Summary Card */}
        <div className="p-6 rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('detectionPage.result.title')}
              </h3>
              <p className="text-gray-300 mt-1 text-sm">
                {t('detectionPage.result.scanId')}: <span className="font-mono">{scanId}</span>
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                className="px-3 py-1 text-sm rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
              >
                {showFullReport ? t('detectionPage.result.hideDetails') : t('detectionPage.result.showDetails')}
              </button>

              <button
                onClick={handleGenerateReport}
                className="px-3 py-1 text-sm rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('detectionPage.result.generateReport')}
              </button>
            </div>
          </div>

          {/* Target Info */}
          <div className="mt-4 p-3 rounded bg-black/30 text-sm">
            <p className="text-gray-400">
              {t('detectionPage.result.target')}: <span className="text-white">{target}</span>
            </p>
          </div>

          {/* Summary */}
          <div className="mt-4">
            <p className="text-white">{summary}</p>
          </div>

          {/* Severity Distribution */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            {Object.entries(severityCounts).map(([severity, count]) => (
              <div key={severity} className="text-center">
                <div className={`text-lg font-bold ${
                  severity === 'critical' ? 'text-red-500' :
                  severity === 'high' ? 'text-orange-500' :
                  severity === 'medium' ? 'text-yellow-500' :
                  severity === 'low' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {count}
                </div>
                <div className="text-xs text-gray-400 capitalize">{severity}</div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([key, value]) => {
              // Skip scan duration in the grid
              if (key === 'scanDuration') return null;

              // Determine color based on score
              const getScoreColor = (score) => {
                if (score >= 90) return 'text-green-400';
                if (score >= 70) return 'text-blue-400';
                if (score >= 50) return 'text-yellow-500';
                return 'text-red-500';
              };

              const scoreColor = getScoreColor(value);

              return (
                <div key={key} className="text-center p-2 rounded-lg bg-black/20">
                  <div className={`text-xl font-bold ${scoreColor}`}>
                    {value}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {t(`detectionPage.metrics.${key}`)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {t('detectionPage.result.scanDuration')}: {metrics.scanDuration} {t('detectionPage.result.seconds')}
          </div>
        </div>

        {/* AI Thinking Process */}
        {thinking && thinking.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">
                {t('detectionPage.ai.thinking')}
              </h3>
              <button
                onClick={() => setShowAIThinking(!showAIThinking)}
                className="px-3 py-1 text-sm rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
              >
                {showAIThinking ? t('detectionPage.ai.result.hideThinking') : t('detectionPage.ai.result.showThinking')}
              </button>
            </div>

            <AnimatePresence>
              {showAIThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-lg bg-black/40 border border-purple-500/20 text-gray-300 space-y-4 font-mono text-sm">
                    {thinking.map((step, index) => (
                      <div key={index} className="border-l-2 border-purple-500/30 pl-3 py-1">
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 rounded bg-purple-900/20 border border-purple-500/20">
                    <p className="text-sm text-purple-300">
                      <span className="font-semibold">{t('detectionPage.ai.disclaimer')}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Detailed Vulnerabilities List */}
        <AnimatePresence>
          {showFullReport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('detectionPage.vulnerability.listTitle')}
              </h3>

              {selectedVulnerability ? (
                renderVulnerabilityDetails(selectedVulnerability)
              ) : (
                <div className="space-y-3">
                  {vulnerabilities.map((vuln) => {
                    const severityColors = {
                      critical: 'border-red-500/30 hover:border-red-500/50',
                      high: 'border-orange-500/30 hover:border-orange-500/50',
                      medium: 'border-yellow-500/30 hover:border-yellow-500/50',
                      low: 'border-blue-400/30 hover:border-blue-400/50',
                      info: 'border-gray-400/30 hover:border-gray-400/50',
                      informational: 'border-gray-400/30 hover:border-gray-400/50'
                    };

                    return (
                      <motion.div
                        key={vuln.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 border rounded-lg cursor-pointer bg-black/20 backdrop-blur-sm transition-colors ${severityColors[vuln.severity]}`}
                        onClick={() => setSelectedVulnerability(vuln)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-white">{vuln.title || vuln.name}</h4>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{vuln.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            vuln.severity === 'critical' ? 'text-red-500 bg-red-500/10' :
                            vuln.severity === 'high' ? 'text-orange-500 bg-orange-500/10' :
                            vuln.severity === 'medium' ? 'text-yellow-500 bg-yellow-500/10' :
                            vuln.severity === 'low' ? 'text-blue-400 bg-blue-400/10' :
                            'text-gray-400 bg-gray-400/10'
                          }`}>
                            {vuln.severity.toUpperCase()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'code':
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-white/80">{t('detectionPage.code.title')}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadSampleCode('solidity')}
                  className="px-2 py-1 text-xs rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                >
                  Solidity Example
                </button>
                <button
                  onClick={() => loadSampleCode('rust')}
                  className="px-2 py-1 text-xs rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
                >
                  Rust Example
                </button>
              </div>
            </div>

            <div className="relative code-editor-container">
              <textarea
                className={`${inputBaseClasses} h-60 md:h-72 resize-none font-mono text-sm code-editor`}
                placeholder={t('detectionPage.code.placeholder')}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                disabled={isLoading}
                spellCheck="false"
              />

              {/* Line numbers overlay (visual enhancement) */}
              <div className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none">
                <div className="h-full py-3 px-2 text-gray-500 font-mono text-sm text-right">
                  {codeContent.split('\n').map((_, i) => (
                    <div key={i} className="h-6">{i + 1}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-gray-400">
                {t('detectionPage.code.supportedLanguages')}: Solidity, Rust, Move, Go
              </div>

              {/* AI Analysis Toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{t('detectionPage.ai.title')}</span>
                  <button
                    onClick={() => setUseAI(!useAI)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${useAI ? 'bg-purple-600' : 'bg-gray-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {/* AI Thinking Process Toggle - Only visible when AI is enabled */}
                {useAI && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{t('detectionPage.ai.showThinking', 'Show Thinking')}</span>
                    <button
                      onClick={() => setShowAIThinking(!showAIThinking)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${showAIThinking ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAIThinking ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'github':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3 text-white/80">{t('detectionPage.github.title')}</h3>

            <div className="space-y-4">
              <input
                type="url"
                className={inputBaseClasses}
                placeholder={t('detectionPage.github.placeholder')}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isLoading}
              />

              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <h4 className="text-sm font-medium text-blue-300 mb-2">{t('detectionPage.github.features')}</h4>
                <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                  <li>{t('detectionPage.github.feature1')}</li>
                  <li>{t('detectionPage.github.feature2')}</li>
                  <li>{t('detectionPage.github.feature3')}</li>
                  <li>{t('detectionPage.github.feature4')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3 text-white/80">{t('detectionPage.upload.title')}</h3>
            <p className="text-gray-400 mb-4">{t('detectionPage.upload.description')}</p>

            <div className="mt-4 p-8 border-2 border-dashed rounded-lg border-white/20 text-center bg-black/20 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 mb-2">{t('detectionPage.upload.placeholder')}</p>
              <p className="text-gray-500 text-sm">{t('detectionPage.upload.supportedFormats')}</p>

              <button
                className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md transition-colors"
                disabled
              >
                {t('detectionPage.upload.selectFiles')}
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-300">{t('detectionPage.upload.comingSoon')}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-8 pt-16 md:pt-24"
    >
      {/* Professional header with security theme */}
      <div className="max-w-5xl mx-auto mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('detectionPage.title')}
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              {t('detectionPage.subtitle')}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex items-center space-x-1 text-green-400 bg-green-900/20 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{t('detectionPage.secureConnection')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-5xl mx-auto bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-10 rounded-xl shadow-2xl border border-white/10"
      >
        <AuthRequired redirectToLogin={false}>
          {/* Security stats banner */}
          <div className="mb-8 grid grid-cols-3 gap-4 p-4 rounded-lg bg-blue-900/10 border border-blue-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-xs text-gray-400">{t('detectionPage.stats.monitoring')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">99.9%</div>
              <div className="text-xs text-gray-400">{t('detectionPage.stats.accuracy')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">500+</div>
              <div className="text-xs text-gray-400">{t('detectionPage.stats.vulnerabilities')}</div>
            </div>
          </div>

        {/* Styled Tabs */}
        <div className="mb-8 border-b border-white/20">
          <nav className="-mb-px flex space-x-6 md:space-x-8 justify-center" aria-label="Tabs">
            {['code', 'github', 'upload'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-base transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-gray-100 hover:border-purple-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-2">
                  {tab === 'code' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  )}
                  {tab === 'github' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  {tab === 'upload' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  <span>{t(`detectionPage.tabs.${tab}`)}</span>
                </div>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="mt-6 min-h-[300px]">
          {renderContent()}
        </div>

        {/* Scan Progress Indicator */}
        {renderScanProgress()}

        {/* Detect Button (only if not upload tab) */}
        {activeTab !== 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center"
          >
            <motion.button
              onClick={handleDetect}
              disabled={isLoading || (activeTab === 'code' && !codeContent.trim()) || (activeTab === 'github' && !githubUrl.trim())}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('detectionPage.button.loading')}
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('detectionPage.button.detect')}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Error Message Area */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-900/50 border border-red-700/70 text-red-200 rounded-lg shadow-md"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        {renderResults()}

        {/* Security Features */}
        {!isLoading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 border-t border-white/10 pt-8"
          >
            <h3 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('detectionPage.features.title')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-white">{t('detectionPage.features.feature1.title')}</h4>
                </div>
                <p className="text-sm text-gray-400">{t('detectionPage.features.feature1.description')}</p>
              </div>

              <div className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-white">{t('detectionPage.features.feature2.title')}</h4>
                </div>
                <p className="text-sm text-gray-400">{t('detectionPage.features.feature2.description')}</p>
              </div>

              <div className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-green-500/30 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-white">{t('detectionPage.features.feature3.title')}</h4>
                </div>
                <p className="text-sm text-gray-400">{t('detectionPage.features.feature3.description')}</p>
              </div>
            </div>
          </motion.div>
        )}
        </AuthRequired>
      </motion.div>

      {/* Footer with trust indicators */}
      <div className="max-w-5xl mx-auto mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">{t('detectionPage.footer.trusted')}</p>
        <div className="flex justify-center space-x-8 opacity-50">
          <div className="text-gray-400 font-medium">Ethereum</div>
          <div className="text-gray-400 font-medium">Solana</div>
          <div className="text-gray-400 font-medium">Binance</div>
          <div className="text-gray-400 font-medium">Polygon</div>
          <div className="text-gray-400 font-medium">Avalanche</div>
        </div>
      </div>

      {/* Audit Report Modal */}
      {showReport && result && (
        <AuditReport
          data={{
            scanId: result.scanId,
            timestamp: result.timestamp,
            target: result.target,
            vulnerabilities: result.vulnerabilities,
            metrics: result.metrics,
            summary: result.summary,
            codeContent: activeTab === 'code' ? codeContent : null,
            thinking: result.thinking || []
          }}
          onClose={() => setShowReport(false)}
        />
      )}
    </motion.div>
  );
}

export default DetectionPage;
