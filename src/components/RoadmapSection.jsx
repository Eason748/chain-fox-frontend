import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function RoadmapSection() {
  const { t } = useTranslation(['home']);

  const roadmapItems = [
    { key: '2020_06', delay: 0 },
    { key: '2021_03', delay: 0.1 },
    { key: '2022_09', delay: 0.2 },
    { key: '2023_10', delay: 0.3 },
    { key: '2024_11', delay: 0.4 },
    { key: '2025_03', delay: 0.5 },
    { key: '2025_06', delay: 0.6 },
    { key: '2025_10', delay: 0.7 }
  ];

  return (
    <section id="roadmap" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('roadmap.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('roadmap.subtitle')}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + item.delay }}
              className={`flex mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                <div className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-2 gradient-text">
                    {t(`roadmap.items.${item.key}.date`)}
                  </h3>
                  <p className="text-gray-400">
                    {t(`roadmap.items.${item.key}.description`)}
                  </p>
                </div>
              </div>
              <div className="w-1/2 relative">
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full z-10"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;
