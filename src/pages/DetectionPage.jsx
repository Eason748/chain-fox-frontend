import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import deepseekService from '../services/deepseek';
import { repositories } from '../services/supabase';
import AuditReport from '../components/AuditReport/AuditReport';
import AuthRequired from '../components/AuthRequired';
import CustomSelect from '../components/ui/CustomSelect';


function DetectionPage() {
  const { t } = useTranslation(['common', 'repository']);
  const [activeTab, setActiveTab] = useState('github');
  const [codeContent, setCodeContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [repositoryUrls, setRepositoryUrls] = useState(['']); // For multiple repository submissions
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
  const [success, setSuccess] = useState(false); // For repository submission success
  const [submittedRepos, setSubmittedRepos] = useState([]); // For tracking submitted repositories
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
    setSuccess(false);

    // Reset repository URLs when switching to GitHub tab
    if (activeTab === 'github') {
      setRepositoryUrls(['']);
    }
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

  // Handle detect button click - this function is no longer used
  // We've removed the "Start Security Audit" button and integrated its functionality
  // directly into the repository submission form
  const handleDetect = async () => {
    // This function is kept as a placeholder to avoid breaking existing code references
    console.log("handleDetect is deprecated - using repository submission instead");
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
                    {t('common.score', 'Score')}: {value}%
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

  // Render tab content - always render GitHub tab content regardless of activeTab value
  const renderContent = () => {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3 text-white/80">{t('detectionPage.github.title')}</h3>
        <p className="text-gray-400 mb-6">
          <span className="text-yellow-400">
            {t('repository:detectionPage.github.privateRepoNotice')}
          </span>
        </p>

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-green-300"
          >
            <h3 className="font-semibold mb-2">{t('repositorySubmission.success.title', { ns: 'repository' })}</h3>
            <p>{t('repositorySubmission.success.message', { ns: 'repository' })}</p>
            <div className="mt-3">
              <p className="font-medium">{t('repositorySubmission.success.submittedRepos', { ns: 'repository' })}:</p>
              <ul className="list-disc pl-5 mt-2">
                {submittedRepos.map((repo, index) => (
                  <li key={index} className="text-sm">
                    {repo.repository_owner}/{repo.repository_name}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  to="/repository-status"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('repositoryStatus.title', { ns: 'repository' })}
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300"
          >
            <h3 className="font-semibold mb-1">{t('repositorySubmission.error.title', { ns: 'repository' })}</h3>
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Single repository mode for quick scan */}
          {!result && (
            <>
              {/* Single repository input removed - we only use the multiple repository submission form */}

              <div className="mb-6">
                {/* <h4 className="text-md font-medium text-white/80 mb-4">{t('repositorySubmission.form.title', { ns: 'repository' })}</h4> */}

                {repositoryUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const updatedUrls = [...repositoryUrls];
                          updatedUrls[index] = e.target.value;
                          setRepositoryUrls(updatedUrls);
                        }}
                        placeholder={t('repositorySubmission.form.placeholder', { ns: 'repository' })}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300
                          backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Remove button (only show if there's more than one input) */}
                    {repositoryUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedUrls = [...repositoryUrls];
                          updatedUrls.splice(index, 1);
                          setRepositoryUrls(updatedUrls);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Add repository button */}
                <div className="mb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setRepositoryUrls([...repositoryUrls, ''])}
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('repositorySubmission.form.addAnother', { ns: 'repository' })}
                  </button>
                </div>

                {/* Submit button for multiple repositories */}
                <div className="mt-4 flex justify-center">
                  <motion.button
                    onClick={async () => {
                      // Reset states
                      setError('');
                      setSuccess(false);

                      // Filter out empty URLs
                      const filteredUrls = repositoryUrls.filter(url => url.trim() !== '');

                      if (filteredUrls.length === 0) {
                        setError(t('repositorySubmission.error.noRepositories', { ns: 'repository' }));
                        return;
                      }

                      // Validate all URLs
                      const validateGithubUrl = (url) => {
                        return /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(url);
                      };

                      const invalidUrls = filteredUrls.filter(url => !validateGithubUrl(url));
                      if (invalidUrls.length > 0) {
                        setError(t('repositorySubmission.error.invalidUrls', { ns: 'repository' }));
                        return;
                      }

                      setIsLoading(true);

                      try {
                        // Submit repositories to Supabase
                        const { data, error } = await repositories.submitMultipleRepositories(filteredUrls);

                        if (error) {
                          throw error;
                        }

                        // Success
                        setSuccess(true);
                        setSubmittedRepos(data || []);
                        setRepositoryUrls(['']); // Reset form with one empty field
                      } catch (err) {
                        console.error('Error submitting repositories:', err);
                        if (err.message === 'User not authenticated') {
                          setError(t('repositorySubmission.error.notAuthenticated', { ns: 'repository' }));
                        } else {
                          setError(err.message || t('repositorySubmission.error.submissionFailed'));
                        }
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading || repositoryUrls.every(url => url.trim() === '')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('repositorySubmission.form.submitting', { ns: 'repository' })}
                      </div>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {t('repositorySubmission.form.submit', { ns: 'repository' })}
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}

          <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30 mt-8">
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
            {['github', 'code', 'upload'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => tab === 'github' ? setActiveTab(tab) : null}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-base transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-gray-100 hover:border-purple-500/50'
                } ${tab !== 'github' ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: tab === 'github' ? 1.05 : 1 }}
                whileTap={{ scale: tab === 'github' ? 0.95 : 1 }}
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
                  {tab !== 'github' && (
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full ml-1">
                      {t('common.comingSoon', 'Coming Soon')}
                    </span>
                  )}
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

        {/* Detect Button is removed - we only use the Submit Repositories button in the GitHub tab */}

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
