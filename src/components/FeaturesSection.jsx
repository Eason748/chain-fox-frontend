import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function FeaturesSection() {
  const { t } = useTranslation(['home']);

  const featureItems = [
    {
      key: 'expertTools',
      icon: '🛠️',
      delay: 0
    },
    {
      key: 'multiPlatform',
      icon: '🔄',
      delay: 0.1
    },
    {
      key: 'oneClickReport',
      icon: '📝',
      delay: 0.2
    },
    {
      key: 'latestResearch',
      icon: '🔬',
      delay: 0.3
    },
    {
      key: 'openSource',
      icon: '🌐',
      delay: 0.4
    },
    {
      key: 'security',
      icon: '🔒',
      delay: 0.5
    }
  ];

  return (
    <section id="features" className="py-20 bg-black/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featureItems.map((item) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + item.delay }}
              className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 h-full"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                {t(`features.items.${item.key}.title`)}
              </h3>
              <p className="text-gray-400">
                {t(`features.items.${item.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
