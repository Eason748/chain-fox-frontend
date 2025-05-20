import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { openDexScreenerSafe } from '../../utils/safeExternalLink';

function TokenomicsSection() {
  const { t } = useTranslation(['home', 'common']);
  const [copied, setCopied] = useState(false);

  // 硬编码合约地址，防止被篡改
  const contractAddress = "RhFVq1Zt81VvcoSEMSyCGZZv5SwBdA8MV7w4HEMpump";

  // 使用安全的外部链接处理函数
  const openDexScreener = (e) => {
    // 使用自定义的国际化消息
    const warningMessage = t('common:externalLink.dexscreenerWarning',
      '您将被重定向到DexScreener查看合约信息。是否继续？');

    // 使用安全的链接打开函数
    openDexScreenerSafe(contractAddress, {
      warningMessage,
      onError: (error) => console.error('DexScreener链接错误:', error)
    }, e);
  };

  const tokenomicsData = [
    { key: 'openSourceIncentives', percentage: 30, color: 'from-blue-500 to-blue-600' },
    { key: 'stakingRewards', percentage: 25, color: 'from-green-500 to-green-600' },
    { key: 'teamAdvisors', percentage: 15, color: 'from-yellow-500 to-yellow-600' },
    { key: 'liquidityReserves', percentage: 15, color: 'from-red-500 to-red-600' },
    { key: 'communityTreasury', percentage: 10, color: 'from-teal-500 to-teal-600' },
    { key: 'initialInvestors', percentage: 5, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <section id="tokenomics" className="py-20 bg-black/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('tokenomics.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('tokenomics.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-start justify-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-80 h-80 relative mb-10 md:mb-0 md:mr-10"
              >
                {/* Pie chart visualization */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90"> {/* Rotate to start from top */}
                  {(() => {
                    const radius = 30;
                    const circumference = 2 * Math.PI * radius;
                    let accumulatedPercentage = 0;
                    const segments = [];

                    // Tailwind color mapping (using the 'from' color)
                    const colorMap = {
                      openSourceIncentives: 'stroke-blue-500',
                      stakingRewards: 'stroke-green-500',
                      teamAdvisors: 'stroke-yellow-500',
                      liquidityReserves: 'stroke-red-500',
                      communityTreasury: 'stroke-teal-500',
                      initialInvestors: 'stroke-purple-500'
                    };

                    // First pass: create the pie segments
                    tokenomicsData.forEach((item) => {
                      const percentage = item.percentage / 100;
                      const offset = circumference * (1 - percentage);
                      const rotation = accumulatedPercentage * 360;

                      // Get stroke color class
                      const strokeClass = colorMap[item.key] || 'stroke-gray-500'; // Fallback color

                      segments.push({
                        key: item.key,
                        percentage: item.percentage,
                        startAngle: accumulatedPercentage * 2 * Math.PI,
                        endAngle: (accumulatedPercentage + percentage) * 2 * Math.PI,
                        strokeClass,
                        offset,
                        rotation
                      });

                      accumulatedPercentage += percentage;
                    });

                    // Render segments and labels
                    return (
                      <>
                        {/* Center circle (black background for the donut hole) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="20"
                          fill="#111"
                          className="opacity-80"
                        />

                        {segments.map((segment) => (
                          <circle
                            key={segment.key}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            strokeWidth="20" // Adjust for donut thickness
                            className={segment.strokeClass} // Apply solid color stroke
                            strokeDasharray={circumference}
                            strokeDashoffset={segment.offset}
                            transform={`rotate(${segment.rotation} 50 50)`}
                          />
                        ))}


                      </>
                    );
                  })()}
                </svg>
              </motion.div>

              <div className="flex flex-col space-y-4">
                {tokenomicsData.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color} mr-3`}></div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {t(`tokenomics.distribution.${item.key}.title`)} - {item.percentage}%
                      </p>
                      <p className="text-sm text-gray-400">
                        {t(`tokenomics.distribution.${item.key}.description`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contract Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 pt-6 border-t border-white/10 text-center"
            >
              <div
                className="inline-flex flex-wrap items-center justify-center px-4 py-2 bg-blue-900/30 backdrop-blur-sm rounded-full border border-blue-500/30 cursor-pointer hover:bg-blue-800/40 transition-colors duration-300 group"
                onClick={openDexScreener}
              >
                <svg className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H11V18H13V16Z" fill="currentColor" />
                  <path d="M13 12H11V14H13V12Z" fill="currentColor" />
                  <path d="M13 8H11V10H13V8Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM6 4H18V20H6V4Z" fill="currentColor" />
                </svg>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-xs text-blue-300 w-full">{t('tokenomics.contractAddress')}</span>
                  <span className="text-sm font-mono text-white truncate max-w-[180px] sm:max-w-[250px] md:max-w-full">{contractAddress}</span>
                </div>
                <div className="ml-3 flex items-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-400">
                {t('tokenomics.clickToView')}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TokenomicsSection;
