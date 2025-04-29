import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function CaseStudiesSection() {
  const { t } = useTranslation(['home']);

  const caseStudies = [
    { key: 'solana', delay: 0, logo: '🌞' },
    { key: 'ethereum', delay: 0.1, logo: '💎' },
    { key: 'polkadot', delay: 0.2, logo: '🔴' },
    { key: 'foundry', delay: 0.3, logo: '🏗️' },
    { key: 'conflux', delay: 0.4, logo: '🔄' },
    { key: 'grin', delay: 0.5, logo: '😁' }
  ];

  return (
    <section id="case-studies" className="py-20 bg-black/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('caseStudies.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('caseStudies.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
          {caseStudies.map((study) => (
            <motion.div
              key={study.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + study.delay }}
              whileHover={{ scale: 1.05 }}
              className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center"
            >
              <div className="text-4xl mb-4">{study.logo}</div>
              <h3 className="text-xl font-bold gradient-text">
                {t(`caseStudies.projects.${study.key}`)}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CaseStudiesSection;
