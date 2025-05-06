import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AuditFeaturesSection = () => {
  const { t } = useTranslation(['common', 'home']);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            {t('home:auditFeatures.title')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-300 max-w-3xl mx-auto"
          >
            {t('home:auditFeatures.subtitle')}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 自助审计 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-xl"
          >
            <div className="p-8">
              <motion.div variants={itemVariants} className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">{t('home:auditFeatures.selfAudit.title')}</h3>
              </motion.div>

              <motion.p variants={itemVariants} className="text-gray-300 mb-6">
                {t('home:auditFeatures.selfAudit.description')}
              </motion.p>

              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                {t('home:auditFeatures.selfAudit.features', { returnObjects: true }).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400">{feature}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/detect" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30">
                  {t('home:auditFeatures.selfAudit.button')}
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Sample Audit */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-xl"
          >
            <div className="p-8">
              <motion.div variants={itemVariants} className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">{t('home:auditFeatures.sampleAudit.title')}</h3>
              </motion.div>

              <motion.p variants={itemVariants} className="text-gray-300 mb-6">
                {t('home:auditFeatures.sampleAudit.description')}
              </motion.p>

              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                {t('home:auditFeatures.sampleAudit.features', { returnObjects: true }).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-purple-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400">{feature}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/reports" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-purple-500/30">
                  {t('home:auditFeatures.sampleAudit.button')}
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Audit Process */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mt-20 text-center"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold mb-12 text-white"
          >
            {t('home:auditFeatures.process.title')}
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {t('home:auditFeatures.process.steps', { returnObjects: true }).map((step, index) => {
              // Define icons for each step
              const icons = [
                "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ];

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[index]} />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-center">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuditFeaturesSection;
