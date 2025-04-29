import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function TokenomicsSection() {
  const { t } = useTranslation(['home']);

  const tokenomicsData = [
    { key: 'public', percentage: 90, color: 'from-blue-500 to-blue-600' },
    { key: 'marketing', percentage: 3, color: 'from-purple-500 to-purple-600' },
    { key: 'team', percentage: 2, color: 'from-pink-500 to-pink-600' },
    { key: 'development', percentage: 5, color: 'from-indigo-500 to-indigo-600' }
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
            <div className="flex flex-col md:flex-row items-center justify-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-64 h-64 relative mb-10 md:mb-0 md:mr-10"
              >
                {/* Pie chart visualization */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {tokenomicsData.map((item, index) => {
                    // Calculate the slice
                    const previousPercentages = tokenomicsData
                      .slice(0, index)
                      .reduce((sum, curr) => sum + curr.percentage, 0);
                    const startAngle = (previousPercentages / 100) * 360;
                    const endAngle = ((previousPercentages + item.percentage) / 100) * 360;
                    
                    // Convert to radians and calculate coordinates
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    
                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);
                    
                    // Determine if the arc should be drawn as a large arc
                    const largeArcFlag = item.percentage > 50 ? 1 : 0;
                    
                    // Create the SVG arc path
                    const pathData = `
                      M 50 50
                      L ${x1} ${y1}
                      A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                      Z
                    `;
                    
                    return (
                      <path
                        key={item.key}
                        d={pathData}
                        className={`bg-gradient-to-r ${item.color} fill-current`}
                        style={{ fill: `url(#gradient-${item.key})` }}
                      />
                    );
                  })}
                  
                  {/* Gradients for each slice */}
                  <defs>
                    {tokenomicsData.map((item) => (
                      <linearGradient
                        key={`gradient-${item.key}`}
                        id={`gradient-${item.key}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" className={`text-${item.color.split(' ')[0]}`} style={{ stopColor: 'currentColor' }} />
                        <stop offset="100%" className={`text-${item.color.split(' ')[1]}`} style={{ stopColor: 'currentColor' }} />
                      </linearGradient>
                    ))}
                  </defs>
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default TokenomicsSection;
