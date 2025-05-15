import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * GovernanceSection - Component for displaying DAO governance information
 * Showcases proposal types, voting process, and governance mechanisms
 */
const GovernanceSection = () => {
  const { t } = useTranslation(['dao', 'common']);
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals', 'process', 'voting'

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {t('governanceTitle', 'DAO投票治理机制')}
      </h2>

      <p className="text-gray-300 mb-6 leading-relaxed">
        {t('governanceDesc', 'Chain-Fox DAO采用去中心化投票机制，让CFX持有者能够直接参与项目决策和发展方向。通过质押CFX代币，用户获得与质押数量成正比的投票权，从而能够对项目的关键决策进行投票。')}
      </p>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'proposals'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => setActiveTab('proposals')}
        >
          {t('proposalTypesTab', '提案类型')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'process'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => setActiveTab('process')}
        >
          {t('proposalProcessTab', '提案流程')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'voting'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => setActiveTab('voting')}
        >
          {t('votingMechanismTab', '投票机制')}
        </button>
      </div>

      {/* Proposal Types Content */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">
            {t('proposalTypesTitle', '提案类型')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-900/10 p-5 rounded-lg border border-indigo-500/20">
              <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-indigo-300 mb-2">
                {t('parameterAdjustmentTitle', '协议参数调整提案')}
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>{t('parameterAdjustment1', '修改质押锁定期')}</li>
                <li>{t('parameterAdjustment2', '调整流动性分配比例')}</li>
                <li>{t('parameterAdjustment3', '更新奖励计算公式')}</li>
              </ul>
            </div>

            <div className="bg-purple-900/10 p-5 rounded-lg border border-purple-500/20">
              <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-purple-300 mb-2">
                {t('fundingProposalTitle', '资金分配提案')}
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>{t('fundingProposal1', '决定团队资金的使用方向')}</li>
                <li>{t('fundingProposal2', '批准生态系统发展基金的分配')}</li>
                <li>{t('fundingProposal3', '投票决定合作伙伴关系')}</li>
              </ul>
            </div>

            <div className="bg-cyan-900/10 p-5 rounded-lg border border-cyan-500/20">
              <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-cyan-300 mb-2">
                {t('techUpgradeTitle', '技术升级提案')}
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>{t('techUpgrade1', '投票决定新功能的开发优先级')}</li>
                <li>{t('techUpgrade2', '批准重大技术架构变更')}</li>
                <li>{t('techUpgrade3', '决定集成新的区块链或协议')}</li>
              </ul>
            </div>

            <div className="bg-pink-900/10 p-5 rounded-lg border border-pink-500/20">
              <div className="w-12 h-12 bg-pink-500/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-pink-300 mb-2">
                {t('communityInitiativeTitle', '社区倡议提案')}
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>{t('communityInitiative1', '市场营销活动')}</li>
                <li>{t('communityInitiative2', '社区活动和奖励计划')}</li>
                <li>{t('communityInitiative3', '教育和培训项目')}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-5 bg-gray-800/40 rounded-lg">
            <h4 className="text-xl font-semibold text-blue-300 mb-3">
              {t('governanceExamplesTitle', 'DAO治理实例')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t('proposalTypeHeader', '提案类型')}</th>
                    <th scope="col" className="px-4 py-3">{t('exampleHeader', '示例')}</th>
                    <th scope="col" className="px-4 py-3">{t('impactHeader', '影响范围')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 font-medium text-blue-400">{t('parameterAdjustmentType', '协议参数调整')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('parameterAdjustmentExample', '将锁定期从30天调整为15天')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('parameterAdjustmentImpact', '所有质押用户')}</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 font-medium text-purple-400">{t('fundingType', '资金分配')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('fundingExample', '分配100万CFX用于市场推广')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('fundingImpact', '项目发展和知名度')}</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 font-medium text-cyan-400">{t('techUpgradeType', '技术升级')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('techUpgradeExample', '集成新的DEX协议以提高流动性收益')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('techUpgradeImpact', '奖励率和系统稳定性')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-pink-400">{t('communityType', '社区倡议')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('communityExample', '启动开发者激励计划')}</td>
                    <td className="px-4 py-3 text-gray-300">{t('communityImpact', '生态系统扩展')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Process Content */}
      {activeTab === 'process' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">
            {t('proposalProcessTitle', '提案流程')}
          </h3>

          <div className="p-4 bg-gray-800/50 rounded-lg overflow-auto mb-6">
            <svg width="100%" height="280" viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">
              {/* 节点 */}
              <circle cx="100" cy="50" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="300" cy="50" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="500" cy="50" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="700" cy="50" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="700" cy="150" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="500" cy="150" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />
              <circle cx="700" cy="250" r="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" />

              {/* 连接线 */}
              <line x1="130" y1="50" x2="270" y2="50" stroke="#3b82f6" strokeWidth="2" />
              <line x1="330" y1="50" x2="470" y2="50" stroke="#3b82f6" strokeWidth="2" />
              <line x1="530" y1="50" x2="670" y2="50" stroke="#3b82f6" strokeWidth="2" />
              <line x1="700" y1="80" x2="700" y2="120" stroke="#3b82f6" strokeWidth="2" />
              <line x1="670" y1="150" x2="530" y2="150" stroke="#3b82f6" strokeWidth="2" />
              <line x1="700" y1="180" x2="700" y2="220" stroke="#3b82f6" strokeWidth="2" />

              {/* 边标签和箭头 */}
              <polygon points="270,50 260,45 260,55" fill="#3b82f6" />
              <polygon points="470,50 460,45 460,55" fill="#3b82f6" />
              <polygon points="670,50 660,45 660,55" fill="#3b82f6" />
              <polygon points="700,120 695,110 705,110" fill="#3b82f6" />
              <polygon points="530,150 540,145 540,155" fill="#3b82f6" />
              <polygon points="700,220 695,210 705,210" fill="#3b82f6" />

              <text x="200" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">{t('proposalCreation.minStake', '需要最低质押量')}</text>
              <text x="400" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">{t('proposalCreation.days7', '7天')}</text>
              <text x="600" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">{t('proposalCreation.days5', '5天')}</text>
              <text x="730" y="100" textAnchor="middle" fill="#94a3b8" fontSize="12">{t('proposalCreation.pass', '通过')}</text>
              <text x="600" y="170" textAnchor="middle" fill="#94a3b8" fontSize="12">{t('proposalCreation.notPass', '未通过')}</text>

              {/* 节点文本 */}
              <text x="100" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.create', '提案创建')}</text>
              <text x="300" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.discuss', '讨论期')}</text>
              <text x="500" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.vote', '投票期')}</text>
              <text x="700" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.result', '结果统计')}</text>
              <text x="700" y="155" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.execute', '执行期')}</text>
              <text x="500" y="155" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.archive', '提案归档')}</text>
              <text x="700" y="255" textAnchor="middle" fill="#e2e8f0" fontSize="14">{t('proposalCreation.implement', '提案实施')}</text>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                <h4 className="text-blue-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">1</span>
                  {t('proposalCreationTitle', '提案创建')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('proposalCreation1', '任何质押超过100,000 CFX的用户可以创建提案')}</li>
                  <li>{t('proposalCreation2', '提案需包含详细描述、目标和实施计划')}</li>
                  <li>{t('proposalCreation3', '创建提案需支付少量手续费，防止垃圾提案')}</li>
                </ul>
              </div>

              <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                <h4 className="text-indigo-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">2</span>
                  {t('discussionPeriodTitle', '提案讨论期')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('discussionPeriod1', '提案创建后进入为期7天的讨论期')}</li>
                  <li>{t('discussionPeriod2', '社区成员可以在论坛和社交媒体上讨论提案')}</li>
                  <li>{t('discussionPeriod3', '提案创建者可以根据反馈修改提案细节')}</li>
                </ul>
              </div>

              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                <h4 className="text-purple-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs mr-2">3</span>
                  {t('votingPeriodTitle', '投票期')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('votingPeriod1', '讨论期结束后进入为期5天的投票期')}</li>
                  <li>{t('votingPeriod2', '所有质押用户可以按照其质押权重进行投票')}</li>
                  <li>{t('votingPeriod3', '投票选项包括：赞成、反对、弃权')}</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/20">
                <h4 className="text-cyan-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs mr-2">4</span>
                  {t('resultCalculationTitle', '结果统计')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('resultCalculation1', '投票期结束后自动统计结果')}</li>
                  <li>{t('resultCalculation2', '提案通过需满足两个条件：')}</li>
                  <ul className="list-circle list-inside pl-4 text-xs text-gray-400 space-y-1">
                    <li>{t('resultCalculation2a', '赞成票超过总投票的66%')}</li>
                    <li>{t('resultCalculation2b', '投票参与率超过总质押量的40%')}</li>
                  </ul>
                </ul>
              </div>

              <div className="bg-teal-900/20 p-4 rounded-lg border border-teal-500/20">
                <h4 className="text-teal-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs mr-2">5</span>
                  {t('executionPeriodTitle', '执行期')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('executionPeriod1', '通过的提案进入执行期')}</li>
                  <li>{t('executionPeriod2', '技术团队根据提案内容实施变更')}</li>
                  <li>{t('executionPeriod3', '实施进度在DAO平台上公开透明')}</li>
                </ul>
              </div>

              <div className="bg-pink-900/20 p-4 rounded-lg border border-pink-500/20">
                <h4 className="text-pink-400 font-medium flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs mr-2">6</span>
                  {t('implementationTitle', '提案实施')}
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm pl-2">
                  <li>{t('implementation1', '根据提案内容执行具体实施')}</li>
                  <li>{t('implementation2', '定期发布实施进度报告')}</li>
                  <li>{t('implementation3', '完成后发布最终实施报告')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Mechanism Content */}
      {activeTab === 'voting' && (
        <div className="space-y-6">
          <div className="bg-blue-900/10 p-5 rounded-lg border border-blue-500/20">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              {t('votingWeightTitle', '投票权重计算')}
            </h3>
            <p className="text-gray-300 mb-4">
              {t('votingWeightDesc', '投票权重基于用户的质押数量和质押时长，计算公式如下：')}
            </p>
            <div className="bg-gray-800/50 p-3 rounded-lg mb-4">
              <code className="text-green-300">
                {t('votingWeightFormula', '投票权重 = 质押数量 × (1 + 质押时长系数)')}
              </code>
            </div>

            <h4 className="text-lg font-medium text-blue-300 mt-5 mb-3">
              {t('stakingDurationFactorTitle', '质押时长系数：')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t('stakingDurationHeader', '质押时长')}</th>
                    <th scope="col" className="px-4 py-3">{t('durationFactorHeader', '时长系数')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 text-gray-300">{t('durationPeriod1', '1-30天')}</td>
                    <td className="px-4 py-3 text-green-400">0</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 text-gray-300">{t('durationPeriod2', '31-90天')}</td>
                    <td className="px-4 py-3 text-green-400">0.1</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-4 py-3 text-gray-300">{t('durationPeriod3', '91-180天')}</td>
                    <td className="px-4 py-3 text-green-400">0.2</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-300">{t('durationPeriod4', '>180天')}</td>
                    <td className="px-4 py-3 text-green-400">0.3</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm italic mt-4">
              {t('stakingDurationNote', '这意味着长期质押者在治理决策中拥有更大的话语权，鼓励用户长期持有并参与项目治理。')}
            </p>
          </div>

          <div className="bg-purple-900/10 p-5 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">
              {t('votingIncentivesTitle', '投票激励机制')}
            </h3>
            <p className="text-gray-300 mb-4">
              {t('votingIncentivesDesc', '为鼓励用户积极参与治理投票，Chain-Fox DAO设立了投票激励机制：')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-medium text-purple-300 mb-2">
                  {t('votingRewardTitle', '投票奖励')}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t('votingRewardDesc', '参与投票的用户将获得额外的奖励积分，通过程序自动计算和分发')}
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-medium text-purple-300 mb-2">
                  {t('proposalCreationRewardTitle', '提案创建奖励')}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t('proposalCreationRewardDesc', '成功通过的提案创建者将获得特别奖励，直接发送到其钱包')}
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h4 className="text-lg font-medium text-purple-300 mb-2">
                  {t('activityBonusTitle', '活跃度加成')}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t('activityBonusDesc', '连续参与投票的用户将获得活跃度加成，提高奖励比例，数据存储在用户的链上账户中')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800/40 rounded-lg">
            <h4 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {t('participationGuide', '参与指南')}
            </h4>
            <p className="text-gray-400 text-sm mt-2">
              {t('participationGuideDesc', '如何参与DAO治理：质押CFX后，您将自动获得与质押数量成正比的投票权。您可以在Chain-Fox DAO平台的"治理"页面参与提案投票和讨论。')}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GovernanceSection;
