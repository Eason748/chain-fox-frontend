import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import SafeExternalLink from '../common/SafeExternalLink';

/**
 * RepositoryCard - Component for displaying a single repository with its audit findings
 * Shows repository details, challenges, approach, findings, and outcome
 */
const RepositoryCard = ({ repository, index }) => {
  const { t, i18n } = useTranslation(['exploration']);
  const currentLang = i18n.language || 'en';
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format date for better readability
  const formattedDate = new Date(repository.auditDate).toLocaleDateString(
    currentLang === 'zh' ? 'zh-CN' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden"
    >
      {/* Repository Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-0">
            {repository.name}
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-400">{formattedDate}</span>
            <SafeExternalLink 
              href={repository.url}
              className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 text-sm rounded-md transition-colors flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{t('viewRepository')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </SafeExternalLink>
          </div>
        </div>
        <p className="text-gray-300">
          {repository.description[currentLang]}
        </p>
        <div className="flex justify-end mt-4">
          <button
            className="text-sm text-blue-400 flex items-center"
            onClick={toggleExpand}
          >
            {expanded ? 'Show Less' : 'Show More'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">{t('importance')}</h4>
                  <p className="text-gray-300">{repository.importance[currentLang]}</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">{t('challenges')}</h4>
                  <p className="text-gray-300">{repository.challenges[currentLang]}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">{t('approach')}</h4>
                  <p className="text-gray-300">{repository.approach[currentLang]}</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-4">{t('findings')}</h4>
                <div className="space-y-4">
                  {repository.findings.map((finding) => (
                    <div 
                      key={finding.id}
                      className="bg-black/30 rounded-lg p-4 border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-white">{finding.title[currentLang]}</h5>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{finding.description[currentLang]}</p>
                      <div className="flex flex-wrap gap-2">
                        <SafeExternalLink 
                          href={finding.issueLink}
                          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors flex items-center"
                        >
                          <span>{t('viewIssue')}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </SafeExternalLink>
                        <SafeExternalLink 
                          href={finding.prLink}
                          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors flex items-center"
                        >
                          <span>{t('viewPR')}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </SafeExternalLink>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">{t('outcome')}</h4>
                  <p className="text-gray-300">{repository.outcome[currentLang]}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

RepositoryCard.propTypes = {
  repository: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    description: PropTypes.object.isRequired,
    auditDate: PropTypes.string.isRequired,
    importance: PropTypes.object.isRequired,
    challenges: PropTypes.object.isRequired,
    approach: PropTypes.object.isRequired,
    findings: PropTypes.array.isRequired,
    outcome: PropTypes.object.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

export default RepositoryCard;
