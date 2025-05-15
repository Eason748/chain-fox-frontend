import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ExplorationHeader from './ExplorationHeader';
import ExplorationTimeline from './ExplorationTimeline';
import RepositoryList from './RepositoryList';
import NarrativeSection from './NarrativeSection';
import explorationData from '../../data/explorationData.json';

/**
 * ExplorationPageContent - Main content component for the Exploration page
 * Displays a narrative journey of blockchain security exploration through audits and patches
 */
const ExplorationPageContent = () => {
  const { t, i18n } = useTranslation(['exploration', 'common']);
  const currentLang = i18n.language || 'en';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-4 md:p-8 pt-16 md:pt-24 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <ExplorationHeader 
          title={explorationData.pageTitle[currentLang] || t('pageTitle')}
          description={explorationData.pageDescription[currentLang] || t('pageDescription')}
        />

        {/* Narrative Introduction */}
        <NarrativeSection 
          content={explorationData.introNarrative[currentLang] || t('introNarrative')}
        />

        {/* Timeline Section */}
        <ExplorationTimeline 
          milestones={explorationData.journeyMilestones}
          title={t('timelineTitle')}
          subtitle={t('timelineSubtitle')}
        />

        {/* Repository List */}
        <RepositoryList 
          repositories={explorationData.repositories}
          title={t('repositoriesTitle')}
          subtitle={t('repositoriesSubtitle')}
        />

        {/* Conclusion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 mb-12 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('conclusionTitle')}
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {explorationData.conclusion[currentLang] || t('conclusion')}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ExplorationPageContent;
