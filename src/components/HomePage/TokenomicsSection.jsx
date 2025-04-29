import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function TokenomicsSection() {
  const { t } = useTranslation(['home']);

  const tokenomicsData = [
    { key: 'public', percentage: 90, color: 'from-blue-500 to-blue-600' },
    { key: 'marketing', percentage: 3, color: 'from-purple-500 to-purple-600' },
    { key: 'team', percentage: 2, color: 'from-teal-500 to-teal-600' }, // Changed pink to teal for legend
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
                {/* Pie chart visualization using stroke-dasharray */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90"> {/* Rotate to start from top */}
                  {(() => {
                    const radius = 30;
                    const circumference = 2 * Math.PI * radius;
                    let accumulatedPercentage = 0;

                    // Tailwind color mapping (using the 'from' color)
                    const colorMap = {
                      public: 'stroke-blue-500',
                      marketing: 'stroke-purple-500',
                      team: 'stroke-teal-500', // Changed pink to teal for SVG stroke
                      development: 'stroke-indigo-500'
                    };

                    return tokenomicsData.map((item) => {
                      const percentage = item.percentage / 100;
                      const offset = circumference * (1 - percentage);
                      const rotation = accumulatedPercentage * 360;
                      
                      // Get stroke color class
                      const strokeClass = colorMap[item.key] || 'stroke-gray-500'; // Fallback color

                      accumulatedPercentage += percentage;

                      return (
                        <circle
                          key={item.key}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          strokeWidth="20" // Adjust for donut thickness
                          className={strokeClass} // Apply solid color stroke
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          transform={`rotate(${rotation} 50 50)`}
                        />
                      );
                    });
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default TokenomicsSection;
