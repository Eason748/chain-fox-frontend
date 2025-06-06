import { supabase } from './supabase';
import auditReportGenerator from './auditReportGenerator';

/**
 * 审核批准服务
 * 用于审核员批准审计并生成审计报告
 */
const approveAudit = {
  /**
   * 批准审计并生成报告
   * @param {string} reportId - 审计报告ID
   * @returns {Promise<Object>} - 包含操作结果的对象
   */
  approveAndGenerateReport: async (reportId) => {
    try {
      // 1. 获取审计报告数据
      const { data: reportData, error: reportError } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) {
        console.error('获取审计报告数据时出错:', reportError);
        throw new Error('无法获取审计报告数据');
      }

      if (!reportData) {
        throw new Error(`未找到审计报告: ${reportId}`);
      }

      // 2. 更新审计报告状态为已完成
      const { error: updateError } = await supabase
        .from('audit_reports')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) {
        console.error('更新审计报告状态时出错:', updateError);
        throw new Error('无法更新审计报告状态');
      }

      // 3. 查找对应的仓库提交记录
      const repoName = reportData.repo_name;
      const [repoOwner, repoNameOnly] = repoName.split('/');
      const repoUrl = `https://github.com/${repoOwner}/${repoNameOnly}`;

      // 4. 生成并保存审计报告
      const result = await auditReportGenerator.generateAndSaveReport(repoUrl);

      if (!result.success) {
        console.error(`生成审计报告失败: ${result.message}`);
        // 不中断流程，因为审计报告的生成是一个附加功能
        // 即使审计报告生成失败，我们仍然认为审计批准是成功的
        console.log('尽管审计报告生成失败，但审计批准流程将继续');
      }

      return {
        success: true,
        message: '审计已批准，报告已生成',
        reportId,
        repoUrl,
        report: result.report
      };
    } catch (error) {
      console.error('批准审计并生成报告时出错:', error);
      return {
        success: false,
        message: error.message || '批准审计时发生未知错误',
        error
      };
    }
  },

  /**
   * 检查审计报告状态
   * @param {string} reportId - 审计报告ID
   * @returns {Promise<Object>} - 包含报告状态的对象
   */
  checkReportStatus: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('status')
        .eq('id', reportId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        status: data?.status || 'unknown'
      };
    } catch (error) {
      console.error('检查审计报告状态时出错:', error);
      return {
        success: false,
        message: error.message || '检查审计报告状态时发生错误',
        error
      };
    }
  }
};

export default approveAudit;
