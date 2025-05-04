import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link

function HeroSection() {
  const { t } = useTranslation(['common', 'home']);

  return (
    <section id="about" className="container mx-auto px-6 pt-32 pb-24 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(125,95,255,0.8)]">
            {t('home:hero.title')}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-white/80 mb-12 max-w-3xl mx-auto"
        >
          {t('home:hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-6 justify-center"
        >
          <Link
            to="/detect"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all text-center"
          >
            {t('buttons.uploadProject')}
          </Link>

          <Link
            to="/whitepaper"
            className="px-8 py-4 border-2 border-purple-400/50 rounded-full text-lg font-semibold hover:bg-purple-500/10 hover:border-purple-400/80 transition-colors text-center"
          >
            {t('buttons.whitePaper')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
