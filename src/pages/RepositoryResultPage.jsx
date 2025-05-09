import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { repositories } from '../services/supabase';
import AuthRequired from '../components/AuthRequired';
import SafeExternalLink from '../components/common/SafeExternalLink';

const RepositoryResultPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch repository details on component mount
  useEffect(() => {
    const fetchRepository = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await repositories.getRepositoryById(id);

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(t('repositoryResult.error.notFound'));
        }

        setRepository(data);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError(err.message || t('repositoryResult.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id, t]);

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render repository details
  const renderRepositoryDetails = () => {
    if (!repository) return null;

    return (
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {repository.repository_owner}/{repository.repository_name}
            </h2>
            <SafeExternalLink
              href={repository.repository_url}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              allowedDomains={['github.com']}
              warningMessage={t('common:externalLink.generalWarning')}
            >
              {repository.repository_url}
            </SafeExternalLink>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-gray-400">
              Completed: {formatDate(repository.completed_at || repository.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render audit results
  const renderAuditResults = () => {
    if (!repository || !repository.audit_result) {
      return (
        <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No Audit Results Available</h3>
              <p className="text-gray-300">The audit for this repository has not been completed yet or no results were found.</p>
            </div>
          </div>
        </div>
      );
    }

    const { meta, summary } = repository.audit_result;

    // 风险评分卡片已隐藏
    const renderRiskScoreCard = () => {
      // 返回空元素，不显示风险评分
      return null;
    };

    // 渲染问题统计卡片
    const renderIssueStatsCards = () => {
      const stats = [
        { label: 'Critical', count: meta.issueStats.critical, color: 'text-red-500', bg: 'bg-red-900/20', border: 'border-red-500/30', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { label: 'High', count: meta.issueStats.high, color: 'text-orange-500', bg: 'bg-orange-900/20', border: 'border-orange-500/30', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Medium', count: meta.issueStats.medium, color: 'text-yellow-500', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { label: 'Low', count: meta.issueStats.low, color: 'text-blue-500', bg: 'bg-blue-900/20', border: 'border-blue-500/30', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Info', count: meta.issueStats.info, color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-500/30', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
      ];

      return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`p-4 rounded-lg ${stat.bg} border ${stat.border} flex flex-col items-center justify-center`}>
              <div className="flex items-center justify-center mb-2">
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* 风险评分 */}
        {renderRiskScoreCard()}

        {/* 问题统计 */}
        {renderIssueStatsCards()}

        {/* 审计摘要 - 默认收起状态 */}
        <details className="p-6 rounded-lg bg-blue-900/20 border border-blue-500/30 mb-6 group">
          <summary className="flex items-center cursor-pointer">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Audit Summary</h3>
            <svg className="w-5 h-5 ml-2 text-blue-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="prose prose-invert prose-sm max-w-none bg-black/20 p-4 rounded-lg border border-blue-500/10 mt-4">
            <div dangerouslySetInnerHTML={{
              __html: summary
                .replace(/\n## /g, '<h2 class="text-xl font-semibold text-blue-400 mt-4 mb-2">')
                .replace(/\n### /g, '<h3 class="text-lg font-medium text-blue-300 mt-3 mb-2">')
                .replace(/\n- /g, '<li class="ml-4">')
                // 处理 Markdown 表格 - 在替换其他内容之前先处理表格
                .replace(/\|([^|\r\n]*)\|([^|\r\n]*)\|/g, function(match) {
                  // 检测是否是表格分隔行 (---|---)
                  if (match.match(/\|[\s\-:]+\|[\s\-:]+\|/)) {
                    return ''; // 删除分隔行，HTML表格不需要
                  }
                  // 转换为表格行
                  return match
                    .replace(/^\||\|$/g, '') // 移除开头和结尾的 |
                    .replace(/\|/g, '</td><td class="p-2">') // 将 | 替换为 </td><td>
                    .replace(/^/, '<tr class="bg-black/20 hover:bg-black/40 transition-colors"><td class="p-2">') // 添加开始标签
                    .replace(/$/, '</td></tr>'); // 添加结束标签
                })
                // 将表格标记转换为完整的HTML表格
                .replace(/(<tr.*?<\/tr>)\s*(<tr.*?<\/tr>)/, '<table class="w-full text-sm border-collapse"><thead class="bg-gray-800">$1</thead><tbody class="divide-y divide-gray-700">$2')
                .replace(/(<\/tr>)\s*(?!<\/tbody>|<\/thead>)(?=<tr)/, '$1')
                .replace(/(<tr.*?<\/tr>)\s*$/, '$1</tbody></table>')
                // 继续处理其他Markdown元素
                .replace(/\n/g, '<br>')
                .replace(/<li class="ml-4">/g, '<ul class="list-disc pl-5 my-2"><li class="ml-4">')
                .replace(/\.<br>/g, '.</li></ul>')
                // 美化已转换的表格
                .replace(/<table>/g, '<table class="w-full text-sm border-collapse">')
                .replace(/<thead>/g, '<thead class="bg-gray-800">')
                .replace(/<th>/g, '<th class="p-2 text-left font-medium text-gray-300">')
                .replace(/<tbody>/g, '<tbody class="divide-y divide-gray-700">')
                .replace(/<tr>/g, '<tr class="bg-black/20 hover:bg-black/40 transition-colors">')
                .replace(/<td>/g, '<td class="p-2">')
                .replace(/<td class="p-2">\*\*(.*?)\*\*<\/td>/g, '<td class="p-2 font-bold">$1</td>')
                .replace(/<td class="p-2">Critical<\/td>/g, '<td class="p-2"><span class="flex items-center"><span class="inline-flex w-3 h-3 mr-2 bg-red-500 rounded-full"></span>Critical</span></td>')
                .replace(/<td class="p-2">High<\/td>/g, '<td class="p-2"><span class="flex items-center"><span class="inline-flex w-3 h-3 mr-2 bg-orange-500 rounded-full"></span>High</span></td>')
                .replace(/<td class="p-2">Medium<\/td>/g, '<td class="p-2"><span class="flex items-center"><span class="inline-flex w-3 h-3 mr-2 bg-yellow-500 rounded-full"></span>Medium</span></td>')
                .replace(/<td class="p-2">Low<\/td>/g, '<td class="p-2"><span class="flex items-center"><span class="inline-flex w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>Low</span></td>')
                .replace(/<td class="p-2">Informational<\/td>/g, '<td class="p-2"><span class="flex items-center"><span class="inline-flex w-3 h-3 mr-2 bg-gray-500 rounded-full"></span>Informational</span></td>')
                .replace(/<tr class="bg-black\/20 hover:bg-black\/40 transition-colors"><td class="p-2 font-bold">Total<\/td>/g, '<tr class="bg-gray-800/50"><td class="p-2 font-medium">Total</td>')
            }} />
          </div>
        </details>

        {/* 详细问题报告 - 简化版 */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Detailed Issue Report</h3>
          </div>

          {/* 命令行风格的问题输出 */}
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-black/90">
            {/* 命令行窗口顶部栏 */}
            <div className="bg-gray-800 px-4 py-2 flex items-center border-b border-gray-700">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-gray-400 text-xs font-medium">audit-report - Terminal</div>
            </div>
            {/* 命令行内容 */}
            <div className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              <div className="mb-3">
                <span className="text-green-400">chainfox@audit</span>
                <span className="text-gray-400">:</span>
                <span className="text-blue-400">~/security-audit</span>
                <span className="text-gray-400">$ </span>
                <span className="text-white">run-audit-report {repository.repository_owner}/{repository.repository_name}</span>
              </div>

              {/* 文件列表信息 */}
              <div className="text-gray-400 mb-3">
                Files with Issues: {Object.keys(repository.audit_result.issuesByFile || {}).length}
              </div>

              {Object.entries(repository.audit_result.issuesByFile || {}).map(([file, fileIssues], fileIndex) => (
                <div key={fileIndex} id={`file-${fileIndex}`} className="mb-6">
                  {/* 文件标题行 - 命令行风格 */}
                  <div className="text-gray-500 mb-2 font-bold">
                    # File: {file}
                  </div>

                  {/* 该文件的所有问题 - 命令行风格输出 */}
                  {fileIssues.map((issue, issueIndex) => {
                    // 根据严重性添加不同的前缀颜色
                    const severityColors = {
                      critical: 'text-red-400',
                      high: 'text-orange-400',
                      medium: 'text-yellow-400',
                      low: 'text-blue-400',
                      info: 'text-gray-400'
                    };

                    const severityColor = severityColors[issue.severity] || severityColors.info;

                    // 处理描述和代码中的换行符和其他转义字符
                    const processText = (text) => {
                      if (!text) return '';

                      // 直接替换常见的转义序列
                      return text
                        .replace(/\\n/g, '\n')
                        .replace(/\\t/g, '\t')
                        .replace(/\\r/g, '\r')
                        .replace(/\\\\/g, '\\')
                        .replace(/\\"/g, '"')
                        .replace(/\\'/g, "'");
                    };

                    const description = processText(issue.description || 'No description provided');
                    const code = processText(issue.code || '');

                    return (
                      <div key={issueIndex} className="mb-4">
                        <div className={`${severityColor} mb-1`}>
                          [{issue.severity.toUpperCase()}] {issue.title || issue.name || 'Unnamed Issue'} - {issue.location || 'Unspecified'}
                        </div>
                        <pre className="text-gray-300 text-xs overflow-x-auto pl-4 border-l border-gray-700">
                          {description}
                          {code && '\n\n' + code}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
      <div className="max-w-4xl mx-auto">
        <AuthRequired>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Link
                to="/repository-status"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Repository List
              </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">Repository Audit Result</h1>
            <p className="text-gray-400">Detailed security audit report for the repository</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300"
            >
              <h3 className="font-semibold mb-1">Error</h3>
              <p>{error}</p>
              <Link
                to="/repository-status"
                className="mt-3 inline-block text-red-400 hover:text-red-300 transition-colors"
              >
                Back to Repository List
              </Link>
            </motion.div>
          )}

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
                {renderRepositoryDetails()}
                {renderAuditResults()}
              </>
            )}
          </motion.div>
        </AuthRequired>
      </div>
    </motion.div>
  );
};

export default RepositoryResultPage;
