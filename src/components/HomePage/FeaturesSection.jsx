import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  WrenchScrewdriverIcon,
  CpuChipIcon,
  DocumentTextIcon,
  BeakerIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

function FeaturesSection() {
  const { t } = useTranslation(['home']);

  const featureItems = [
    {
      key: 'expertTools',
      icon: WrenchScrewdriverIcon,
      delay: 0
    },
    {
      key: 'multiPlatform',
      icon: CpuChipIcon,
      delay: 0.1
    },
    {
      key: 'oneClickReport',
      icon: DocumentTextIcon,
      delay: 0.2
    },
    {
      key: 'latestResearch',
      icon: BeakerIcon,
      delay: 0.3
    },
    {
      key: 'openSource',
      icon: GlobeAltIcon,
      delay: 0.4
    },
    {
      key: 'security',
      icon: LockClosedIcon,
      delay: 0.5
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-blue-900/10 to-purple-900/10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            {t('features.title')}
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
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
              className="floating bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/20 h-full hover:shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col"
            >
              <item.icon className="w-10 h-10 mb-4 text-purple-300" />
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                {t(`features.items.${item.key}.title`)}
              </h3>
              <p className="text-white/70">
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
