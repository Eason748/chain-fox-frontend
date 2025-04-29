import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function MissionSection() {
  const { t } = useTranslation(['home']);

  return (
    <section id="mission" className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              {t('mission.title')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('mission.description')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default MissionSection;
