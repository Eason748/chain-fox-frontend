import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import deepseekService from '../services/deepseek';
import AuthRequired from '../components/AuthRequired';

// Mock data generator for reports
const generateMockReportData = (type = 'daily') => {
  const today = new Date();
  const startDate = type === 'daily' ? today : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  const chains = ['Ethereum', 'Solana', 'Polygon', 'BSC'];
  const categories = ['Smart Contract', 'Protocol', 'DeFi', 'NFT'];
  
  // Generate daily statistics
  const generateStatistics = () => ({
    totalScans: Math.floor(Math.random() * 50) + 30,
    totalIssues: Math.floor(Math.random() * 100) + 50,
    resolvedIssues: Math.floor(Math.random() * 40) + 10,
    averageResponseTime: Math.floor(Math.random() * 120) + 60,
    criticalVulnerabilities: Math.floor(Math.random() * 5),
    highVulnerabilities: Math.floor(Math.random() * 10) + 5,
    mediumVulnerabilities: Math.floor(Math.random() * 15) + 10,
    lowVulnerabilities: Math.floor(Math.random() * 20) + 15,
  });

  // Generate trend data
  const generateTrendData = () => {
    const data = [];
    const days = type === 'daily' ? 1 : 7;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        issues: Math.floor(Math.random() * 20) + 10,
        resolved: Math.floor(Math.random() * 15),
        criticalCount: Math.floor(Math.random() * 3),
        highCount: Math.floor(Math.random() * 5),
      });
    }
    return data;
  };

  // Generate vulnerability breakdown
  const generateVulnerabilities = () => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 5 }, (_, i) => ({
      id: `VULN-${Date.now()}-${i}`,
      name: `Vulnerability ${i + 1}`,
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      chain: chains[Math.floor(Math.random() * chains.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      status: Math.random() > 0.5 ? 'resolved' : 'open',
      detectedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      description: `Detailed description of vulnerability ${i + 1}`,
      impact: `Impact analysis of vulnerability ${i + 1}`,
      recommendation: `Recommendation for fixing vulnerability ${i + 1}`,
    }));
  };

  return {
    reportId: `${type.toUpperCase()}-${Date.now()}`,
    type: type,
    period: {
      start: startDate.toISOString(),
      end: today.toISOString(),
    },
    statistics: generateStatistics(),
    trends: generateTrendData(),
    vulnerabilities: generateVulnerabilities(),
    riskScore: Math.floor(Math.random() * 40) + 60,
    chainDistribution: chains.map(chain => ({
      chain,
      percentage: Math.floor(Math.random() * 100),
      issueCount: Math.floor(Math.random() * 20),
    })),
    categoryDistribution: categories.map(category => ({
      category,
      count: Math.floor(Math.random() * 30),
    })),
  };
};

function ReportPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedChain, setSelectedChain] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, [activeTab, timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // In the future, replace with actual API call
      const mockData = generateMockReportData(activeTab);
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="mb-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('reportPage.title')}
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            {activeTab === 'daily' 
              ? t('reportPage.dailySubtitle')
              : t('reportPage.weeklySubtitle')}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 focus:outline-none focus:border-purple-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="polygon">Polygon</option>
            <option value="bsc">BSC</option>
          </select>
        </div>
      </motion.div>
    </div>
  );

  const renderTabs = () => (
    <div className="mb-8 border-b border-white/20">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {['daily', 'weekly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === tab
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t(`reportPage.tabs.${tab}`)}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderStatisticsCards = () => {
    if (!reportData) return null;

    const { statistics } = reportData;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">{t('reportPage.stats.totalScans')}</h3>
            <span className="text-2xl font-bold text-purple-400">{statistics.totalScans}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            +{Math.floor(Math.random() * 20)}% vs last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">{t('reportPage.stats.criticalIssues')}</h3>
            <span className="text-2xl font-bold text-red-400">{statistics.criticalVulnerabilities}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {statistics.criticalVulnerabilities > 0 ? 'Immediate attention required' : 'No critical issues'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">{t('reportPage.stats.resolvedIssues')}</h3>
            <span className="text-2xl font-bold text-green-400">{statistics.resolvedIssues}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Resolution rate: {Math.round((statistics.resolvedIssues / statistics.totalIssues) * 100)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-lg bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">{t('reportPage.stats.avgResponse')}</h3>
            <span className="text-2xl font-bold text-blue-400">{statistics.averageResponseTime}m</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Target: &lt;120m
          </div>
        </motion.div>
      </div>
    );
  };

  const renderVulnerabilityTable = () => {
    if (!reportData) return null;

    const { vulnerabilities } = reportData;

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('reportPage.vulnerabilities.title')}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-black/20">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Chain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {vulnerabilities.map((vuln) => (
                <motion.tr
                  key={vuln.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setSelectedVulnerability(vuln)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {vuln.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {vuln.chain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {vuln.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vuln.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {vuln.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(vuln.detectedAt).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVulnerabilityDetails = () => {
    if (!selectedVulnerability) return null;

    const vuln = selectedVulnerability;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedVulnerability(null)}
      >
        <div 
          className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white">{vuln.name}</h3>
            <button
              onClick={() => setSelectedVulnerability(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {vuln.severity.toUpperCase()}
              </span>
              <span className="text-gray-400">{vuln.chain}</span>
              <span className="text-gray-400">{vuln.category}</span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
              <p className="text-white">{vuln.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Impact</h4>
              <p className="text-white">{vuln.impact}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendation</h4>
              <p className="text-white">{vuln.recommendation}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBetaNotice = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-4 rounded-lg bg-blue-900/30 border border-blue-500/30 backdrop-blur-sm"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-blue-300">
            {t('reportPage.betaNotice')}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-8 pt-16 md:pt-24"
    >
      <div className="max-w-7xl mx-auto">
        <AuthRequired redirectToLogin={false}>
          {renderHeader()}
          {renderTabs()}
          {renderBetaNotice()}
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                {renderStatisticsCards()}
                {renderVulnerabilityTable()}
              </>
            )}
          </motion.div>

          {selectedVulnerability && renderVulnerabilityDetails()}
        </AuthRequired>
      </div>
    </motion.div>
  );
}

export default ReportPage;