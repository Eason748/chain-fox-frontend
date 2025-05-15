import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * DaoIntroduction - Component for introducing the Chain-Fox DAO concept
 * Provides an overview of what Chain-Fox DAO is and its purposes
 */
const DaoIntroduction = () => {
  const { t } = useTranslation(['dao', 'common']);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        {t('introTitle', '什么是Chain-Fox DAO？')}
      </h2>

      <p className="text-gray-300 mb-6 leading-relaxed">
        {t('introDescription', 'Chain-Fox DAO是一个去中心化自治组织，通过质押机制赋予社区成员参与项目治理和决策的权力。用户可以通过锁定（质押）CFX代币成为DAO成员，获得投票权、代码审计权以及其他社区权益。在Solana生态系统中，这种DAO治理模式不仅可以帮助保障项目的去中心化发展，还能为代币持有者提供参与感和潜在收益。')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-indigo-900/20 p-5 rounded-lg border border-indigo-500/20">
          <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            {t('communityGovernance', '社区治理')}
          </h3>
          <p className="text-gray-400">
            {t('communityGovernanceDesc', '参与提案投票，直接影响项目的发展方向和重大决策。')}
          </p>
        </div>

        <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-500/20">
          <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            {t('codeAudit', '代码审计权')}
          </h3>
          <p className="text-gray-400">
            {t('codeAuditDesc', '获得参与协议代码审计的权利，确保项目安全与透明。')}
          </p>
        </div>

        <div className="bg-pink-900/20 p-5 rounded-lg border border-pink-500/20">
          <div className="w-12 h-12 bg-pink-500/30 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-pink-300 mb-2">
            {t('stakingRewards', '质押奖励')}
          </h3>
          <p className="text-gray-400">
            {t('stakingRewardsDesc', '获得流动性收益、合作伙伴空投及其他DAO生态系统收益。')}
          </p>
        </div>
      </div>

      <div className="mt-10 p-4 bg-blue-900/10 border border-blue-400/20 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-1">{t('tokenInfo', '代币信息')}</h4>
            <p className="text-gray-400 text-sm">
              {t('tokenInfoDesc', 'CFX代币地址：')}
            </p>
            <p className="mt-1 mb-2">
              <code className="bg-black/30 p-1 rounded text-xs break-all inline-block max-w-full">RhFVq1Zt81VvcoSEMSyCGZZv5SwBdA8MV7w4HEMpump</code>
            </p>
            <p className="text-gray-400 text-sm">
              {t('contractInfo', 'Stake合约地址：')}
              <span className="text-yellow-400 ml-1">{t('inDevelopment', '开发中')}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DaoIntroduction;
