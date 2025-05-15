import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * StakingProcess - Component for displaying the staking and unstaking processes
 * Visualizes the steps involved in staking and unstaking CFX tokens
 */
const StakingProcess = () => {
  const { t } = useTranslation(['dao', 'common']);
  const [activeTab, setActiveTab] = useState('stake'); // 'stake' or 'unstake'

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
        {t('stakingProcessTitle', '质押流程')}
      </h2>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        {t('stakingProcessDesc', 'Chain-Fox DAO质押协议是一个在Solana区块链上运行的去中心化应用（DApp），允许用户质押CFX代币以获得治理权和潜在收益。该协议采用智能合约技术，确保整个过程安全、透明且不可篡改。')}
      </p>
      
      {/* Tab Switcher */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'stake'
              ? 'bg-green-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => setActiveTab('stake')}
        >
          {t('stakeTab', '质押')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'unstake'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => setActiveTab('unstake')}
        >
          {t('unstakeTab', '解除质押')}
        </button>
      </div>
      
      {/* Staking Process Content */}
      {activeTab === 'stake' && (
        <div className="space-y-6">
          <div className="bg-green-900/10 p-4 rounded-lg border border-green-500/20">
            <h3 className="text-xl font-semibold text-green-400 mb-4">
              {t('preparationTitle', '准备工作')}
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>{t('preparation1', '拥有Solana钱包（如Phantom、Solflare等）')}</li>
              <li>{t('preparation2', '持有一定数量的SOL（用于支付交易费用）')}</li>
              <li>{t('preparation3', '持有CFX代币（用于质押）')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">
              {t('stakingStepsTitle', '质押步骤')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
                <h4 className="text-green-400 font-medium mb-2">{t('step1Title', '连接钱包')}</h4>
                <p className="text-gray-400 text-sm">{t('step1Desc', '访问Chain-Fox DAO平台，连接您的Solana钱包。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
                <h4 className="text-green-400 font-medium mb-2">{t('step2Title', '创建质押账户')}</h4>
                <p className="text-gray-400 text-sm">{t('step2Desc', '首次使用时，系统会为您创建一个专属的质押账户。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
                <h4 className="text-green-400 font-medium mb-2">{t('step3Title', '选择质押金额')}</h4>
                <p className="text-gray-400 text-sm">{t('step3Desc', '输入您想要质押的CFX代币数量。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">4</div>
                <h4 className="text-green-400 font-medium mb-2">{t('step4Title', '确认交易')}</h4>
                <p className="text-gray-400 text-sm">{t('step4Desc', '在钱包中确认质押交易。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">5</div>
                <h4 className="text-green-400 font-medium mb-2">{t('step5Title', '完成质押')}</h4>
                <p className="text-gray-400 text-sm">{t('step5Desc', '交易确认后，您的代币将被锁定在质押池中。')}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg overflow-auto">
            <svg width="100%" height="220" viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
              {/* 节点 */}
              <circle cx="50" cy="50" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="200" cy="50" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="200" cy="120" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="350" cy="50" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="350" cy="120" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="500" cy="120" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              <circle cx="500" cy="190" r="25" fill="#4ade80" opacity="0.2" stroke="#4ade80" />
              
              {/* 连接线 */}
              <line x1="75" y1="50" x2="175" y2="50" stroke="#4ade80" strokeWidth="2" />
              <line x1="200" y1="75" x2="200" y2="95" stroke="#4ade80" strokeWidth="2" />
              <line x1="225" y1="50" x2="325" y2="50" stroke="#4ade80" strokeWidth="2" />
              <line x1="225" y1="120" x2="325" y2="120" stroke="#4ade80" strokeWidth="2" />
              <line x1="375" y1="120" x2="475" y2="120" stroke="#4ade80" strokeWidth="2" />
              <line x1="500" y1="145" x2="500" y2="165" stroke="#4ade80" strokeWidth="2" />
              
              {/* 箭头 */}
              <polygon points="175,50 165,45 165,55" fill="#4ade80" />
              <polygon points="200,95 195,85 205,85" fill="#4ade80" />
              <polygon points="325,50 315,45 315,55" fill="#4ade80" />
              <polygon points="325,120 315,115 315,125" fill="#4ade80" />
              <polygon points="475,120 465,115 465,125" fill="#4ade80" />
              <polygon points="500,165 495,155 505,155" fill="#4ade80" />
              
              {/* 文本 */}
              <text x="50" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('user')}</text>
              <text x="200" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('platform')}</text>
              <text x="200" y="125" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('account')}</text>
              <text x="350" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('amount')}</text>
              <text x="350" y="125" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('confirm')}</text>
              <text x="500" y="125" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('lock')}</text>
              <text x="500" y="195" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('active')}</text>
              
              {/* 边标签 */}
              <text x="125" y="40" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('connectWallet')}</text>
              <text x="215" y="85" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('firstUse')}</text>
              <text x="275" y="40" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('existingAccount')}</text>
              <text x="275" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('selectAmount')}</text>
              <text x="425" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('confirmTx')}</text>
              <text x="515" y="155" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('startReward')}</text>
            </svg>
          </div>
          
          <div className="mt-6 p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start">
              <div className="text-green-400 mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-green-400 font-medium mb-1">{t('stakingNote', '质押提示')}</h4>
                <p className="text-gray-400 text-sm">
                  {t('stakingNoteDesc', '最低质押金额为10000 CFX代币。质押后，您将立即获得与质押数量成正比的投票权重，可参与Chain-Fox DAO治理决策。')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unstaking Process Content */}
      {activeTab === 'unstake' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-orange-400 mb-4">
              {t('unstakingStepsTitle', '解除质押流程')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
                <h4 className="text-orange-400 font-medium mb-2">{t('unstakeStep1Title', '申请提取')}</h4>
                <p className="text-gray-400 text-sm">{t('unstakeStep1Desc', '在平台上申请解除质押。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
                <h4 className="text-orange-400 font-medium mb-2">{t('unstakeStep2Title', '等待锁定期')}</h4>
                <p className="text-gray-400 text-sm">{t('unstakeStep2Desc', '系统会启动锁定期计时（默认为30天）。')}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
                <h4 className="text-orange-400 font-medium mb-2">{t('unstakeStep3Title', '提取代币')}</h4>
                <p className="text-gray-400 text-sm">{t('unstakeStep3Desc', '锁定期结束后，您可以提取您的代币及获得的奖励。')}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg overflow-auto">
            <svg width="100%" height="250" viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg">
              {/* 节点 */}
              <circle cx="50" cy="50" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="200" cy="50" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="350" cy="50" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="350" cy="120" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="350" cy="190" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="500" cy="190" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              <circle cx="200" cy="190" r="25" fill="#f97316" opacity="0.2" stroke="#f97316" />
              
              {/* 连接线 */}
              <line x1="75" y1="50" x2="175" y2="50" stroke="#f97316" strokeWidth="2" />
              <line x1="225" y1="50" x2="325" y2="50" stroke="#f97316" strokeWidth="2" />
              <line x1="350" y1="75" x2="350" y2="95" stroke="#f97316" strokeWidth="2" />
              <line x1="350" y1="145" x2="350" y2="165" stroke="#f97316" strokeWidth="2" />
              <line x1="375" y1="190" x2="475" y2="190" stroke="#f97316" strokeWidth="2" />
              <line x1="325" y1="190" x2="225" y2="190" stroke="#f97316" strokeWidth="2" />
              
              {/* 箭头 */}
              <polygon points="175,50 165,45 165,55" fill="#f97316" />
              <polygon points="325,50 315,45 315,55" fill="#f97316" />
              <polygon points="350,95 345,85 355,85" fill="#f97316" />
              <polygon points="350,165 345,155 355,155" fill="#f97316" />
              <polygon points="475,190 465,185 465,195" fill="#f97316" />
              <polygon points="225,190 235,185 235,195" fill="#f97316" />
              
              {/* 文本 */}
              <text x="50" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('user')}</text>
              <text x="200" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('platform')}</text>
              <text x="350" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('requestUnstake')}</text>
              <text x="350" y="125" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('lockPeriod')}</text>
              <text x="350" y="195" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('extract')}</text>
              <text x="500" y="195" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('wallet')}</text>
              <text x="200" y="195" textAnchor="middle" fill="#e2e8f0" fontSize="12">{t('rewards')}</text>
              
              {/* 边标签 */}
              <text x="125" y="40" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('connectWallet')}</text>
              <text x="275" y="40" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('unstakeTab')}</text>
              <text x="365" y="85" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('waitPeriod30')}</text>
              <text x="365" y="155" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('txConfirm')}</text>
              <text x="425" y="180" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('returnToWallet')}</text>
              <text x="275" y="180" textAnchor="middle" fill="#94a3b8" fontSize="10">{t('rewardDistribution')}</text>
            </svg>
          </div>
          
          <div className="mt-6 p-4 bg-orange-900/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start">
              <div className="text-orange-400 mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-orange-400 font-medium mb-1">{t('lockPeriodNote', '锁定期说明')}</h4>
                <p className="text-gray-400 text-sm">
                  {t('lockPeriodNoteDesc', '当您申请解除质押时，系统会启动锁定期计时（默认30天），锁定期内无法提取代币。在锁定期内，您将失去与解锁代币相关的治理权益。')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/40 p-4 rounded-lg">
            <h4 className="text-yellow-400 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t('importantNote', '重要提示')}
            </h4>
            <p className="text-gray-400 text-sm mt-2">
              {t('importantNoteDesc', '锁定期内可以增加质押金额，但这会重置您的锁定期。锁定期机制有助于维护协议的稳定性。')}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StakingProcess;
