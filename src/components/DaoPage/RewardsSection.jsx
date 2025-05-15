import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * RewardsSection - Component for displaying staking rewards and benefits
 * Shows information about reward sources, distribution, and expected rates
 */
const RewardsSection = () => {
  const { t } = useTranslation(['dao', 'common']);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
        {t('rewardsTitle', '质押权益与奖励机制')}
      </h2>

      <p className="text-gray-300 mb-6 leading-relaxed">
        {t('rewardsDesc', 'Chain-Fox DAO质押协议的主要目的是建立一个稳定的代币持有者社区，并为质押用户提供特定权益与奖励。')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-b from-yellow-900/20 to-amber-900/10 p-5 rounded-lg border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">
            {t('stakingBenefitsTitle', '质押权益')}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-300 font-medium">
                  {t('auditRightTitle', '代码审计权益')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('auditRightDesc', '质押用户将获得参与协议代码审计和治理提案投票的权利')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-300 font-medium">
                  {t('decisionRightTitle', '社区决策权')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('decisionRightDesc', '对未来协议发展方向的投票权重与质押数量成正比')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-300 font-medium">
                  {t('earlyAccessTitle', '早期功能访问')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('earlyAccessDesc', '优先体验Chain-Fox生态系统中的新功能和服务')}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-b from-amber-900/20 to-orange-900/10 p-5 rounded-lg border border-amber-500/20">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">
            {t('rewardSourcesTitle', '奖励来源')}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-300 font-medium">
                  {t('liquidityRewardTitle', '流动性收益')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('liquidityRewardDesc', '质押的CFX代币将部分用于提供去中心化交易所的流动性，产生的交易手续费将作为质押奖励返还给用户')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-300 font-medium">
                  {t('teamIncentiveTitle', '团队激励')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('teamIncentiveDesc', '项目团队将定期向质押池注入一定数量的CFX代币作为额外质押奖励')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-300 font-medium">
                  {t('ecosystemIncomeTitle', '生态系统收入')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('ecosystemIncomeDesc', 'Chain-Fox DAO生态系统产生的部分收入将分配给质押用户')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              <div>
                <p className="text-amber-300 font-medium">
                  {t('partnerAirdropTitle', '合作伙伴空投')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('partnerAirdropDesc', '与Chain-Fox DAO合作的项目可能会为质押用户提供专属空投')}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-b from-orange-900/20 to-red-900/10 p-5 rounded-lg border border-orange-500/20">
          <h3 className="text-xl font-semibold text-orange-400 mb-4">
            {t('liquidityManagementTitle', '流动性管理机制')}
          </h3>
          <p className="text-gray-300 mb-4">
            {t('liquidityManagementDesc', '为了平衡流动性收益和防止挤兑风险，Chain-Fox DAO采用以下机制：')}
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="text-orange-300 font-medium">
                {t('liquidityAllocationTitle', '流动性分配比例')}
              </h4>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="min-w-[4rem] ml-2 text-sm text-orange-300">60%</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {t('reservedForStaking', '保留在质押池中，确保用户随时可以提取')}
              </p>

              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="min-w-[4rem] ml-2 text-sm text-amber-300">40%</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {t('usedForLiquidity', '用于提供流动性，产生收益')}
              </p>
            </div>

            <div>
              <h4 className="text-orange-300 font-medium">
                {t('dynamicAdjustmentTitle', '动态调整机制')}
              </h4>
              <p className="text-gray-400 text-sm">
                {t('dynamicAdjustmentDesc', '系统会根据质押池的使用情况动态调整流动性分配比例，当提取请求增加时，系统会自动减少流动性分配比例；当质押池稳定时，系统会逐步恢复流动性分配比例。')}
              </p>
            </div>

            <div>
              <h4 className="text-orange-300 font-medium">
                {t('emergencyReserveTitle', '紧急储备金')}
              </h4>
              <p className="text-gray-400 text-sm">
                {t('emergencyReserveDesc', '团队将维持一定比例的CFX作为紧急储备金，以应对极端市场情况')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-red-900/20 to-rose-900/10 p-5 rounded-lg border border-red-500/20">
          <h3 className="text-xl font-semibold text-red-400 mb-4">
            {t('expectedRewardsTitle', '预期奖励率')}
          </h3>
          <p className="text-gray-300 mb-4 text-sm">
            {t('expectedRewardsDesc', '以下奖励率仅供参考，实际奖励将取决于团队注入的代币数量和生态系统收入：')}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-3 py-2">{t('stakingDuration', '质押时长')}</th>
                  <th scope="col" className="px-3 py-2">{t('basicRights', '基础权益')}</th>
                  <th scope="col" className="px-3 py-2">{t('potentialReturn', '潜在年化回报')}</th>
                  <th scope="col" className="px-3 py-2">{t('notes', '备注')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700/30">
                  <td className="px-3 py-2 font-medium text-gray-300">{t('durationPeriod1', '1-30天')}</td>
                  <td className="px-3 py-2 text-blue-400">{t('basicAuditRight', '基础审计权')}</td>
                  <td className="px-3 py-2 text-green-400">0-3%</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{t('mainlyGovernance', '主要为治理权益')}</td>
                </tr>
                <tr className="border-b border-gray-700/30">
                  <td className="px-3 py-2 font-medium text-gray-300">{t('durationPeriod2', '31-90天')}</td>
                  <td className="px-3 py-2 text-blue-400">{t('standardAuditRight', '标准审计权')}</td>
                  <td className="px-3 py-2 text-green-400">2-5%</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{t('dependsOnTeam', '取决于团队注入')}</td>
                </tr>
                <tr className="border-b border-gray-700/30">
                  <td className="px-3 py-2 font-medium text-gray-300">{t('durationPeriod3', '91-180天')}</td>
                  <td className="px-3 py-2 text-blue-400">{t('advancedAuditRight', '高级审计权')}</td>
                  <td className="px-3 py-2 text-green-400">4-7%</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{t('includesAirdrop', '包含生态空投')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-gray-300">{t('durationPeriod4', '&gt;180天')}</td>
                  <td className="px-3 py-2 text-blue-400">{t('coreMemberRight', '核心成员权')}</td>
                  <td className="px-3 py-2 text-green-400">6-10%</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{t('priorityAccess', '优先参与新项目')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start">
            <div className="text-red-400 mr-2 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-400 text-xs">
              {t('rewardsDisclaimer', '奖励率仅供参考，实际奖励可能会根据市场情况和项目发展而变化。长期质押者将获得更多权益和更高的奖励率。')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/40 p-5 rounded-lg border border-gray-600/20">
        <h3 className="text-xl font-semibold text-gray-300 mb-3">
          {t('rewardDistributionTitle', '奖励分配')}
        </h3>
        <p className="text-gray-400 mb-4">
          {t('rewardDistributionDesc', '奖励分配基于以下因素：')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/20">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-gray-300 font-medium mb-2">
              {t('stakingAmount', '质押金额')}
            </h4>
            <p className="text-gray-400 text-sm">
              {t('stakingAmountDesc', '质押的CFX代币数量越多，获得的奖励份额越大')}
            </p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/20">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-gray-300 font-medium mb-2">
              {t('stakingDuration', '质押时长')}
            </h4>
            <p className="text-gray-400 text-sm">
              {t('stakingDurationDesc', '代币被锁定的时间越长，获得的奖励和权益越多')}
            </p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/20">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-gray-300 font-medium mb-2">
              {t('participation', '参与度')}
            </h4>
            <p className="text-gray-400 text-sm">
              {t('participationDesc', '用户在社区治理中的活跃程度会影响奖励比例')}
            </p>
          </div>
        </div>

        <div className="mt-5 bg-gray-800/70 p-3 rounded-lg">
          <p className="text-gray-300 font-medium mb-1">{t('rewardFormula', '奖励计算公式：')}</p>

          <div className="my-4 p-3 bg-gray-800/50 rounded-md border border-gray-700/30">
            <div className="flex items-center">
              <div className="text-gray-300 mr-3 font-medium">{t('formula.reward', '奖励')} =</div>
              <div className="text-gray-200">
                <span className="mx-1">{t('formula.stakeRatio', '质押比例')}</span> ×
                <span className="mx-1">{t('formula.rewardPool', '奖励池')}</span> ×
                <span className="mx-1">{t('formula.durationFactor', '时长系数')}</span> ×
                <span className="mx-1">(1 + {t('formula.activityFactor', '活跃度')})</span>
              </div>
            </div>
            <div className="text-center mt-2 text-gray-400 text-sm">
              <code className="text-green-300">
                R<sub>i</sub> = (S<sub>i</sub> / ∑ S<sub>j</sub>) × P × D<sub>i</sub> × (1 + A<sub>i</sub>)
              </code>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-gray-300 font-medium mb-2">{t('durationFactorFormula', '时长系数计算：')}</h4>
            <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700/30">
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="bg-gray-700/30 p-2 rounded text-center">
                  <div className="text-gray-400 mb-1">{t('formula.stakeDays1', '质押天数')}</div>
                  <div className="text-blue-300 font-medium">≤ 30{t('formula.days', '天')}</div>
                </div>
                <div className="bg-gray-700/30 p-2 rounded text-center">
                  <div className="text-gray-400 mb-1">{t('durationPeriod2', '31-90天')}</div>
                  <div className="text-blue-300 font-medium">+10%</div>
                </div>
                <div className="bg-gray-700/30 p-2 rounded text-center">
                  <div className="text-gray-400 mb-1">{t('durationPeriod3', '91-180天')}</div>
                  <div className="text-blue-300 font-medium">+20%</div>
                </div>
                <div className="bg-gray-700/30 p-2 rounded text-center">
                  <div className="text-gray-400 mb-1">{t('durationPeriod4', '&gt;180天')}</div>
                  <div className="text-blue-300 font-medium">+30%</div>
                </div>
              </div>
              <div className="text-center mt-3 text-gray-400 text-xs">
                <code className="text-blue-300">
                  D<sub>i</sub> = {"{"}
                  0 if t<sub>i</sub> ≤ 30;
                  0.1 if 30 &lt; t<sub>i</sub> ≤ 90;
                  0.2 if 90 &lt; t<sub>i</sub> ≤ 180;
                  0.3 if t<sub>i</sub> &gt; 180
                  {"}"}
                </code>
                <p className="mt-1" dangerouslySetInnerHTML={{ __html: t('formula.tRepresents', 't<sub>i</sub> = 用户i的质押天数') }}>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-gray-300 font-medium mb-2">{t('liquidityAdjustmentFormula', '动态流动性调整公式：')}</h4>
            <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700/30">
              <div className="flex items-center flex-wrap">
                <div className="text-gray-300 mr-3 font-medium">{t('formula.liquidityRatio', '流动性比例')} =</div>
                <div className="text-gray-200">
                  <span className="mx-1">{t('formula.baseRatio', '基础比例')}</span> -
                  <span className="mx-1">{t('formula.withdrawalRatio', '提取请求比例')}</span> ×
                  <span className="mx-1">{t('formula.adjustmentRange', '调整范围')}</span>
                </div>
              </div>

              <div className="mt-3 bg-gray-700/20 p-2 rounded">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">
                    <span className="text-amber-300">{t('formula.baseRatioLabel', '基础比例')}:</span> 40%
                  </div>
                  <div className="text-gray-400">
                    <span className="text-amber-300">{t('formula.adjustmentRangeLabel', '调整范围')}:</span> 35% (40% - 5%)
                  </div>
                  <div className="text-gray-400">
                    <span className="text-amber-300">{t('formula.adjustFactorLabel', '调整因子')}:</span> 0.8
                  </div>
                </div>
              </div>

              <div className="text-center mt-3 text-gray-400 text-xs">
                <code className="text-amber-300">
                  L = L<sub>base</sub> - α × (W<sub>req</sub> / W<sub>total</sub>) × (L<sub>max</sub> - L<sub>min</sub>)
                </code>
                <p className="mt-1" dangerouslySetInnerHTML={{ __html: t('formula.liquidityExplanation', 'L = 流动性比例, α = 调整因子, W<sub>req</sub> = 提取请求, W<sub>total</sub> = 质押总量') }}>
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-xs mt-4">{t('rewardFormulaNote', '实际分配将由智能合约自动执行，确保过程公平透明')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RewardsSection;
