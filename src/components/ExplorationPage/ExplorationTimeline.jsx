import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * ExplorationTimeline - Component for displaying the journey timeline
 * Shows key milestones in the exploration journey
 */
const ExplorationTimeline = ({ milestones, title, subtitle }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500/50 to-purple-500/50 rounded-full"></div>

        {/* Timeline items */}
        {milestones.map((milestone, index) => (
          <motion.div
            key={`milestone-${index}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className={`relative flex flex-col md:flex-row items-center md:items-start mb-12 ${
              index % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 rounded-full bg-blue-500 border-4 border-blue-900 z-10"></div>

            {/* Content */}
            <div className={`w-full md:w-5/12 pl-10 md:pl-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
              <div className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg border border-white/10">
                <div className="text-sm text-blue-400 mb-2">{milestone.date}</div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {milestone.title[currentLang]}
                </h3>
                <p className="text-gray-300">
                  {milestone.description[currentLang]}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

ExplorationTimeline.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      title: PropTypes.object.isRequired,
      description: PropTypes.object.isRequired
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired
};

export default ExplorationTimeline;
