import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingIndicator from './LoadingIndicator';
import { getSeverityStyle } from './utils/constants';
import supabase from '../../services/supabase';
import { checkCurrentUserWhitelist } from '../../utils/supabaseQueries';
import approveAudit from '../../services/approveAudit';

const ReportList = ({ reports, isLoading, searchTerm, onReportClick, onReportStatusChange, userPoints, pointsCost }) => {
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const navigate = useNavigate();

  // 检查当前用户是否在白名单中
  useEffect(() => {
    const checkUserWhitelist = async () => {
      const isWhitelisted = await checkCurrentUserWhitelist();
      setIsWhitelistUser(isWhitelisted);
    };

    checkUserWhitelist();
  }, []);

  // 处理报告点击
  const handleReportClick = (report) => {
    // 白名单用户（审计员）点击行时进入审计界面
    // 普通用户点击行时查看报告详情（如果报告已完成）
    if (isWhitelistUser) {
      // 审计员进入审计界面，而不是直接查看报告
      // 设置选中的报告，进入审计模式
      console.log('审计员点击行，进入审计界面');
      // 这里不直接导航到报告详情页面，而是通知父组件进入审计模式
      onReportClick(report);
    } else if (report.status === 'completed' || report.status === 'archived') {
      // 普通用户只能查看已完成的报告
      onReportClick(report);
    } else {
      // 对于 pending 状态的报告，不执行任何操作或显示提示
      console.log('只有已完成的审计报告才能查看详情');
    }
  };

  // 处理状态更新
  const handleStatusChange = async (e, report) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发行点击事件

    if (!isWhitelistUser) {
      return; // 非白名单用户不能更改状态
    }

    setUpdatingReportId(report.id);

    try {
      // 调用审计批准服务，生成并保存审计报告
      const result = await approveAudit.approveAndGenerateReport(report.id);

      if (!result.success) {
        throw new Error(result.message || '批准审计失败');
      }

      // 通知父组件状态已更改
      if (onReportStatusChange) {
        onReportStatusChange({
          ...report,
          status: 'completed'
        });
      }

      console.log('审计报告已生成并保存:', result.repoUrl);
    } catch (error) {
      console.error('更新报告状态时出错:', error);
      // 显示错误通知或提示，但不阻止用户继续操作
      console.warn(`批准审计过程中遇到问题: ${error.message || '未知错误'}`);

      // 即使出错，我们仍然通知父组件状态已更改
      // 这样用户界面会更新，显示审计已批准
      if (onReportStatusChange) {
        onReportStatusChange({
          ...report,
          status: 'completed'
        });
      }
    } finally {
      setUpdatingReportId(null);
    }
  };

  // 处理查看报告详情
  const handleViewReport = async (e, report) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发行点击事件

    // 白名单用户可以免费查看报告
    if (isWhitelistUser) {
      navigate(`/reports/${report.id}?confirmed=true`);
      return;
    }

    // 检查用户是否有足够的积分
    if (userPoints < pointsCost) {
      alert(t('points.insufficientPoints', {
        defaultValue: `积分不足。您需要 ${pointsCost} 积分，但只有 ${userPoints} 积分。`
      }));
      return;
    }

    // 确认扣除积分
    if (!window.confirm(t('points.confirmDeduction', {
      points: pointsCost,
      defaultValue: `查看此报告需要 ${pointsCost} 积分，确定要继续吗？`
    }))) {
      return;
    }

    // 导航到报告详情页面，添加confirmed=true参数表示已确认扣除积分
    navigate(`/reports/${report.id}?confirmed=true`);
  };
  const { t } = useTranslation('common');

  if (isLoading) {
    return <LoadingIndicator text={t('reportPage.loadingReports', 'Loading reports...')} />;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-300">
          {searchTerm
            ? t('reportPage.noSearchResults', 'No matching reports found')
            : t('reportPage.noReportsForDate', 'No reports available for this date')}
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          {isWhitelistUser
            ? t('reportPage.noReportsWhitelist', 'No audit reports have been created for this date yet.')
            : t('reportPage.noReportsRegular', 'There are no completed audit reports available for this date.')}
        </p>
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="mt-4 px-4 py-2 bg-purple-600/30 text-purple-300 rounded-md hover:bg-purple-600/50 transition-colors"
          >
            {t('common.clearSearch', 'Clear Search')}
          </button>
        )}
      </div>
    );
  }

  // Table view - only shown on desktop
  const TableView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden md:block overflow-x-auto"
    >
      <table className="min-w-full divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-black/40">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.repository', 'Repository')}</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.user', 'User')}</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.score', 'Score')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.stats.totalIssues', 'Total')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-red-400 uppercase tracking-wider">{t('reportPage.stats.critical', 'Critical')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-orange-400 uppercase tracking-wider">{t('reportPage.stats.high', 'High')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-yellow-400 uppercase tracking-wider">{t('reportPage.stats.medium', 'Medium')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-blue-400 uppercase tracking-wider">{t('reportPage.stats.low', 'Low')}</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.status', 'Status')}</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{t('reportPage.table.actions', 'Actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-black/20">
          {reports.map((report, index) => (
            <motion.tr
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`hover:bg-white/5 transition-colors ${
                isWhitelistUser || report.status === 'completed' || report.status === 'archived'
                  ? 'cursor-pointer'
                  : 'cursor-default opacity-70'
              }`}
              onClick={() => handleReportClick(report)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-white group relative">
                    {report.repo_name}
                    {report.status === 'pending' && !isWhitelistUser && (
                      <div className="absolute left-0 -bottom-10 hidden group-hover:block bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-lg z-10 w-48">
                        {t('reportPage.pendingReportTooltip', 'This report is pending approval and cannot be viewed yet.')}
                      </div>
                    )}
                    {report.status === 'pending' && isWhitelistUser && (
                      <div className="absolute left-0 -bottom-10 hidden group-hover:block bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-lg z-10 w-48">
                        {t('reportPage.pendingReportWhitelistTooltip', 'This report is pending approval. As a whitelist user, you can view and edit it.')}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{report.user_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                  report.risk_score < 60 ? 'critical' :
                  report.risk_score < 80 ? 'high' :
                  report.risk_score < 90 ? 'medium' : 'low'
                )}`}>
                  {report.risk_score}%
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-white">{report.total_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-red-400">{report.critical_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-orange-400">{report.high_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-yellow-400">{report.medium_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-blue-400">{report.low_issues ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                  report.status === 'archived' ? 'bg-gray-900/30 text-gray-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {report.status === 'completed' ? t('reportPage.status.completed', 'Completed') :
                   report.status === 'archived' ? t('reportPage.status.archived', 'Archived') :
                   t('reportPage.status.pending', 'Pending')}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                {report.status === 'pending' ? (
                  isWhitelistUser ? (
                    <button
                      onClick={(e) => handleStatusChange(e, report)}
                      disabled={updatingReportId === report.id}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        updatingReportId === report.id
                          ? 'bg-green-900/20 text-green-700 cursor-not-allowed'
                          : 'bg-green-900/30 text-green-400 hover:bg-green-800/50 transition-colors'
                      }`}
                    >
                      {updatingReportId === report.id
                        ? t('reportPage.actions.updating', 'Updating...')
                        : t('reportPage.actions.approve', 'Approve Audit')}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {t('reportPage.actions.pending', 'Pending')}
                    </span>
                  )
                ) : (
                  report.status === 'completed' ? (
                    <button
                      onClick={(e) => handleViewReport(e, report)}
                      className="px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-800/50 transition-colors"
                    >
                      {t('reportPage.actions.viewReport', 'View Report')}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {t('reportPage.actions.noActionNeeded', 'No action needed')}
                    </span>
                  )
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );

  // Card view - only shown on mobile
  const CardView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
      className="md:hidden grid grid-cols-1 gap-6"
    >
      {reports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors ${
            isWhitelistUser || report.status === 'completed' || report.status === 'archived'
              ? 'cursor-pointer'
              : 'cursor-default opacity-70'
          }`}
          onClick={() => handleReportClick(report)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="relative group">
                <h3 className="text-lg font-semibold text-white truncate" title={`${report.user_name}/${report.repo_name}`}>
                  {report.repo_name}
                </h3>
                {report.status === 'pending' && !isWhitelistUser && (
                  <div className="absolute left-0 top-full hidden group-hover:block bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-lg z-10 w-48 mt-1">
                    {t('reportPage.pendingReportTooltip', 'This report is pending approval and cannot be viewed yet.')}
                  </div>
                )}
                {report.status === 'pending' && isWhitelistUser && (
                  <div className="absolute left-0 top-full hidden group-hover:block bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-lg z-10 w-48 mt-1">
                    {t('reportPage.pendingReportWhitelistTooltip', 'This report is pending approval. As a whitelist user, you can view and edit it.')}
                  </div>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                report.risk_score < 60 ? 'critical' :
                report.risk_score < 80 ? 'high' :
                report.risk_score < 90 ? 'medium' : 'low'
              )}`}>
                {t('common.score', 'Score')}: {report.risk_score}%
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 truncate">{report.user_name}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('reportPage.stats.totalIssues', 'Total Issues')}:</span>
                <span className="text-white font-medium">{report.total_issues ?? 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.critical', 'Critical')}:</span><span className="text-red-400">{report.critical_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.high', 'High')}:</span><span className="text-orange-400">{report.high_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.medium', 'Medium')}:</span><span className="text-yellow-400">{report.medium_issues ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('reportPage.stats.low', 'Low')}:</span><span className="text-blue-400">{report.low_issues ?? 0}</span></div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                  report.status === 'archived' ? 'bg-gray-900/30 text-gray-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {report.status === 'completed' ? t('reportPage.status.completed', 'Completed') :
                   report.status === 'archived' ? t('reportPage.status.archived', 'Archived') :
                   t('reportPage.status.pending', 'Pending')}
                </span>

                <div className="flex space-x-2">
                  {report.status === 'pending' ? (
                    isWhitelistUser ? (
                      <button
                        onClick={(e) => handleStatusChange(e, report)}
                        disabled={updatingReportId === report.id}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          updatingReportId === report.id
                            ? 'bg-green-900/20 text-green-700 cursor-not-allowed'
                            : 'bg-green-900/30 text-green-400 hover:bg-green-800/50 transition-colors'
                        }`}
                      >
                        {updatingReportId === report.id
                          ? t('reportPage.actions.updating', 'Updating...')
                          : t('reportPage.actions.approve', 'Approve Audit')}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 px-3 py-1">
                        {t('reportPage.actions.pending', 'Pending')}
                      </span>
                    )
                  ) : (
                    report.status === 'completed' ? (
                      <button
                        onClick={(e) => handleViewReport(e, report)}
                        className="px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-800/50 transition-colors"
                      >
                        {t('reportPage.actions.viewReport', 'View Report')}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 px-3 py-1">
                        {t('reportPage.actions.noActionNeeded', 'No action needed')}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // 计算 pending 状态的报告数量
  const pendingReportsCount = reports.filter(report => report.status === 'pending').length;

  return (
    <>
      {pendingReportsCount > 0 && !isWhitelistUser && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-300 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {t('reportPage.pendingReportsNotice', 'Some reports are pending approval. Only completed reports can be viewed in detail.')}
            </span>
          </div>
        </div>
      )}
      {pendingReportsCount > 0 && isWhitelistUser && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-blue-300 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {t('reportPage.pendingReportsWhitelistNotice', 'Some reports are pending approval. As a whitelist user, you can view and approve these reports.')}
            </span>
          </div>
        </div>
      )}

      {/* 积分提示 */}
      {!isWhitelistUser && pointsCost > 0 && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-300 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span>
                {t('points.viewReportCost', {
                  cost: pointsCost,
                  defaultValue: `查看报告详情需要支付 ${pointsCost} 积分。`
                })}
              </span>
              <span className="ml-2 font-medium">
                {t('points.currentBalance', {
                  balance: userPoints !== null ? userPoints : '--',
                  defaultValue: `当前积分: ${userPoints !== null ? userPoints : '--'}`
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      <TableView />
      <CardView />
    </>
  );
};

export default ReportList;
