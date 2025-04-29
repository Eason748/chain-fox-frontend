import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function CurrentStatusSection() {
  const { t } = useTranslation(['home']);

  return (
    <section id="current-status" className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-3xl font-bold mb-6 gradient-text text-center">
              {t('currentStatus.title')}
            </h2>

            <div className="space-y-6">
              <p className="text-gray-300">
                {t('currentStatus.description')}
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mt-8">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://x.com/ChainFoxHQ"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity flex items-center"
                >
                  <span className="mr-2">🐦</span>
                  {t('currentStatus.twitterButton')}
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="mailto:chain-fox-developer@chain-fox.com"
                  className="px-8 py-4 border-2 border-white/20 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors flex items-center"
                >
                  <span className="mr-2">📧</span>
                  {t('currentStatus.contactButton')}
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CurrentStatusSection;
