import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SafeExternalLink from '../components/common/SafeExternalLink';

function WhitePaperPage() {
  const { t } = useTranslation(['whitepaper', 'common']);

  return (
    <div className="min-h-screen py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          {t('title')}
        </h1>

        <div className="text-center mb-10">
          <p className="text-xl text-gray-300">
            {t('comingSoon')}
          </p>
        </div>

        <div className="space-y-6 text-gray-300">
          <div className="mt-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all max-w-2xl mx-auto"
            >
              <div className="flex flex-col space-y-4">
                <SafeExternalLink
                  href="https://chain-fox.github.io/white-paper/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full text-white font-medium transition-colors"
                  allowedDomains={['chain-fox.github.io']}
                  warningMessage={t('common:externalLink.generalWarning')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t('readWhitepaper')}
                </SafeExternalLink>
                <div className="mt-4 p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
                  <p className="text-sm text-blue-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('mobileNote')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WhitePaperPage;
