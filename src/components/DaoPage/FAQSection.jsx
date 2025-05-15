import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * FAQSection - Component for displaying frequently asked questions about DAO
 * Provides collapsible Q&A pairs for common user questions
 */
const FAQSection = () => {
  const { t } = useTranslation(['dao', 'common']);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: t('minStakingQuestion', '质押有最低金额要求吗？'),
      answer: t('minStakingAnswer', '是的，最低质押金额为10000 CFX代币。')
    },
    {
      question: t('viewStakingQuestion', '如何查看我的质押状态和投票权？'),
      answer: t('viewStakingAnswer', '连接钱包后，在Chain-Fox DAO平台的"我的质押"页面可以查看您的质押状态、投票权重、奖励和解锁时间。')
    },
    {
      question: t('lockPeriodQuestion', '锁定期内可以增加质押金额吗？'),
      answer: t('lockPeriodAnswer', '可以。即使您已经申请解除质押并处于锁定期，您仍然可以增加质押金额，但这会重置您的锁定期。')
    },
    {
      question: t('rewardDistributionQuestion', '质押奖励如何发放？'),
      answer: t('rewardDistributionAnswer', '奖励将根据流动性收益和团队注入情况定期发放。当您提取质押代币时，累积的奖励将一并发放到您的钱包。')
    },
    {
      question: t('liquidityUseQuestion', '我的质押代币如何用于提供流动性？'),
      answer: t('liquidityUseAnswer', '您质押的部分代币（约40%）将用于提供Solana生态系统中去中心化交易所（如Raydium、Orca等）的流动性，产生的交易手续费将作为奖励返还给所有质押用户。这一过程通过Solana程序完全自动化，您无需进行任何额外操作。')
    },
    {
      question: t('governanceParticipationQuestion', '如何参与DAO治理？'),
      answer: t('governanceParticipationAnswer', '质押CFX后，您将自动获得与质押数量成正比的投票权。您可以在Chain-Fox DAO平台的"治理"页面参与提案投票和讨论。具体步骤如下：\n\n1. 浏览活跃提案：在"治理"页面查看当前所有活跃的提案\n2. 研究提案内容：点击提案查看详细信息、讨论和当前投票情况\n3. 参与讨论：在提案讨论区发表您的意见和建议\n4. 投票表决：在投票期内，使用您的投票权重对提案进行投票（赞成/反对/弃权）\n5. 跟踪提案进展：关注已通过提案的执行情况和项目进度更新\n\n您的投票权重与您质押的CFX数量和质押时长成正比，长期质押者在治理决策中拥有更大的话语权。')
    },
    {
      question: t('stakingSafetyQuestion', '质押安全吗？'),
      answer: t('stakingSafetyAnswer', '是的，Chain-Fox DAO的质押协议由团队自行开发并进行了全面的代码审计，确保了协议的安全性和可靠性。')
    },
    {
      question: t('contractStatusQuestion', 'Stake合约什么时候会上线？'),
      answer: t('contractStatusAnswer', '目前Stake合约正在开发中，预计将在近期完成并部署到Solana主网。具体上线时间将通过官方渠道公布，敬请关注。')
    }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        {t('faqTitle', '常见问题')}
      </h2>
      
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-r ${
              openIndex === index 
                ? 'from-violet-900/30 to-purple-900/20 border-violet-500/30' 
                : 'from-gray-800/30 to-gray-900/20 border-gray-700/30 hover:border-violet-500/20'
            } border rounded-lg transition-all duration-200`}
          >
            <button
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              onClick={() => toggleQuestion(index)}
            >
              <span className={`font-medium ${openIndex === index ? 'text-violet-300' : 'text-gray-200'}`}>
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180 text-violet-400' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-300 whitespace-pre-line">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-violet-900/10 border border-violet-500/20 rounded-lg">
        <div className="flex items-start">
          <div className="text-violet-400 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-violet-400 font-medium mb-1">{t('stakeVsUnstake', '质押与解除质押对比')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left mt-2">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t('feature', '特性')}</th>
                    <th scope="col" className="px-3 py-2">{t('staking', '质押')}</th>
                    <th scope="col" className="px-3 py-2">{t('unstaking', '解除质押')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-300">{t('processingTime', '处理时间')}</td>
                    <td className="px-3 py-2 text-green-400">{t('immediate', '即时')}</td>
                    <td className="px-3 py-2 text-yellow-400">{t('waitPeriod', '需等待30天锁定期')}</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-300">{t('transactionFee', '交易费用')}</td>
                    <td className="px-3 py-2 text-green-400">{t('low', '低')}</td>
                    <td className="px-3 py-2 text-green-400">{t('low', '低')}</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-300">{t('minAmount', '最低金额')}</td>
                    <td className="px-3 py-2">10000 CFX</td>
                    <td className="px-3 py-2">{t('noLimit', '无最低限制')}</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-300">{t('governanceRights', '治理权益')}</td>
                    <td className="px-3 py-2 text-green-400">{t('immediateEffect', '质押后立即生效')}</td>
                    <td className="px-3 py-2 text-red-400">{t('loseAfterRequest', '申请解除质押后失效')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-300">{t('rewardCalculation', '奖励计算')}</td>
                    <td className="px-3 py-2 text-green-400">{t('baseOnLiquidity', '基于流动性收益和团队注入')}</td>
                    <td className="px-3 py-2 text-yellow-400">{t('stopAfterRequest', '申请解除质押后停止')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm italic">
          {t('moreQuestions', '如有更多问题，请联系我们的社区管理员或访问官方Discord频道。')}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          {t('disclaimer', '免责声明：本文档仅供参考，不构成投资建议。')}
        </p>
      </div>
    </motion.div>
  );
};

export default FAQSection;
