import supabase from './supabase';

/**
 * 审计报告生成服务
 * 用于生成审计报告并将其保存到 repository_submissions 表中
 */
const auditReportGenerator = {
  /**
   * 生成并保存审计报告
   * @param {string} repoUrl - 仓库URL，格式为 https://github.com/owner/repo
   * @returns {Promise<Object>} - 包含生成结果的对象
   */
  generateAndSaveReport: async (repoUrl) => {
    try {
      // 1. 验证仓库URL格式
      const urlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
      const match = repoUrl.match(urlPattern);

      if (!match || match.length < 3) {
        throw new Error('无效的GitHub仓库URL格式');
      }

      const repoOwner = match[1];
      const repoName = match[2];
      const repoFullName = `${repoOwner}/${repoName}`;

      // 2. 从 audit_reports 表中获取审计报告数据
      const { data: auditReportData, error: auditReportError } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('repo_name', repoFullName)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (auditReportError) {
        console.error('获取审计报告数据时出错:', auditReportError);
        throw new Error('无法获取审计报告数据');
      }

      if (!auditReportData) {
        throw new Error(`未找到已完成的审计报告: ${repoFullName}`);
      }

      // 3. 生成审计报告
      const report = await auditReportGenerator.createReport(auditReportData);

      // 4. 尝试更新 repository_submissions 表（如果存在对应记录）
      const { data: repoSubmission, error: repoSubmissionError } = await supabase
        .from('repository_submissions')
        .select('id')
        .eq('repository_url', repoUrl)
        .limit(1)
        .maybeSingle(); // 使用 maybeSingle 而不是 single，这样不会在没找到记录时抛出错误

      if (repoSubmissionError) {
        console.error('获取仓库提交数据时出错:', repoSubmissionError);
        // 记录错误但不中断流程
        console.log('继续处理审计报告生成...');
      }

      // 5. 如果找到了对应的 repository_submissions 记录，则更新它
      if (repoSubmission) {
        console.log(`找到对应的仓库提交记录，ID: ${repoSubmission.id}`);

        const { error: updateError } = await supabase
          .from('repository_submissions')
          .update({
            audit_result: report,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', repoSubmission.id);

        if (updateError) {
          console.error('更新仓库提交数据时出错:', updateError);
          // 记录错误但不中断流程
          console.log('继续处理审计报告生成...');
        } else {
          console.log(`成功更新仓库提交记录: ${repoSubmission.id}`);
        }
      } else {
        console.log(`未找到对应的仓库提交记录: ${repoUrl}`);
        console.log('这可能是审计员直接添加的仓库，而非用户提交的仓库');
        // 不中断流程，继续执行
      }

      // 返回成功结果

      return {
        success: true,
        message: '审计报告已成功生成并保存',
        report
      };
    } catch (error) {
      console.error('生成和保存审计报告时出错:', error);
      return {
        success: false,
        message: error.message || '生成审计报告时发生未知错误',
        error
      };
    }
  },

  /**
   * 创建审计报告
   * @param {Object} auditData - 审计数据
   * @returns {Object} - 格式化的审计报告
   */
  createReport: async (auditData) => {
    // 从审计数据中提取相关信息
    const {
      repo_name,
      risk_score,
      id: reportId,
      created_at,
      updated_at,
      user_name,
      date_code
    } = auditData;

    // 从 audit_issues 表中获取该报告的所有问题
    console.log(`正在获取报告 ID ${reportId} 的审计问题数据...`);

    const { data: issuesData, error: issuesError } = await supabase
      .from('audit_issues')
      .select('*')
      .eq('report_id', reportId)
      .eq('false_positive', false) // 排除被标记为误报的问题
      .order('severity');

    let issues = [];
    if (issuesError) {
      console.error('获取审计问题数据时出错:', issuesError);
      // 如果获取失败，使用 auditData 中的 issues
      issues = auditData.issues || [];
      console.log(`使用 auditData 中的 issues，数量: ${issues.length}`);
    } else {
      issues = issuesData || [];
      console.log(`从数据库获取到 ${issues.length} 个问题`);

      // 记录问题的字段结构
      if (issues.length > 0) {
        console.log('问题示例:', JSON.stringify(issues[0], null, 2));
      }
    }

    // 计算各类问题的数量
    const criticalCount = issues.filter(issue => issue.severity === 'critical').length;
    const highCount = issues.filter(issue => issue.severity === 'high').length;
    const mediumCount = issues.filter(issue => issue.severity === 'medium').length;
    const lowCount = issues.filter(issue => issue.severity === 'low').length;
    const infoCount = issues.filter(issue => issue.severity === 'info' || issue.severity === 'informational').length;

    // 按文件分组问题
    const issuesByFile = {};
    issues.forEach(issue => {
      // 使用 file_path 字段，如果不存在则尝试使用 file 字段，最后使用默认值
      const file = issue.file_path || issue.file || 'Unspecified File';
      if (!issuesByFile[file]) {
        issuesByFile[file] = [];
      }

      // 确保每个问题都有必要的字段
      const processedIssue = {
        ...issue,
        severity: issue.severity || 'info',
        title: issue.title || issue.name || issue.issue_type || 'Unnamed Issue',
        description: issue.description || issue.message || 'No description provided',
        location: issue.location || (issue.line_number ? `Line ${issue.line_number}` : 'Unspecified'),
        recommendation: issue.recommendation || 'No recommendation provided',
        code: issue.code_snippet || issue.code || null
      };

      issuesByFile[file].push(processedIssue);
    });

    // 生成审计报告摘要 (英文)
    const summary = `
## Security Audit Summary

This report provides a comprehensive security audit of the ${repo_name} repository. The audit began on ${new Date(created_at).toLocaleString('en-US')} and ${updated_at ? `was completed on ${new Date(updated_at).toLocaleString('en-US')}` : 'has been completed'}.

### Issue Statistics

| Severity | Count |
|----------|-------|
| Critical | ${criticalCount} |
| High | ${highCount} |
| Medium | ${mediumCount} |
| Low | ${lowCount} |
| Informational | ${infoCount} |
| **Total** | **${issues.length}** |
`;

    // 生成详细问题报告 (英文)
    const detailedReport = Object.entries(issuesByFile).map(([file, fileIssues]) => {
      // 创建表格头部
      let fileReport = `
## File: ${file}

| Severity | Issue | Line Number | Type |
|----------|-------|------------|------|
`;

      // 为每个问题添加一行表格数据
      fileIssues.forEach(issue => {
        const severity = issue.severity.toUpperCase();
        const title = issue.title || issue.name || issue.issue_type || 'Unnamed Issue';
        const lineNumber = issue.line_number || 'N/A';
        const type = issue.issue_type || 'N/A';

        fileReport += `| ${severity} | ${title} | ${lineNumber} | ${type} |\n`;
      });

      // 添加说明，告知用户点击详情查看完整信息
      fileReport += `\n*Note: Click on the issue in the UI to view full details including the message content.*\n`;

      return fileReport;
    }).join('\n');

    // 不再生成建议和最佳实践
    const recommendations = ``;

    // 组合完整报告
    const fullReport = {
      meta: {
        repository: repo_name,
        date: new Date().toISOString(),
        auditDate: created_at,
        completedDate: updated_at || new Date().toISOString(),
        riskScore: risk_score,
        issueStats: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          info: infoCount,
          total: issues.length
        }
      },
      summary,
      detailedReport,
      recommendations,
      issues: issues.map(issue => ({
        ...issue,
        severity: issue.severity || 'info',
        title: issue.title || issue.name || issue.issue_type || 'Unnamed Issue',
        description: issue.description || issue.message || 'No description provided',
        location: issue.location || (issue.line_number ? `Line ${issue.line_number}` : 'Unspecified'),
        recommendation: issue.recommendation || 'No recommendation provided',
        code: issue.code_snippet || issue.code || null,
        file: issue.file_path || issue.file || 'Unspecified File'
      })),
      issuesByFile
    };

    return fullReport;
  }
};

export default auditReportGenerator;
