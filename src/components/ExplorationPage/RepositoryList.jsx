import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import RepositoryCard from './RepositoryCard';

/**
 * RepositoryList - Component for displaying the list of audited repositories
 * Shows important repositories that have been audited with their findings
 */
const RepositoryList = ({ repositories, title, subtitle }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-8">
        {repositories.map((repo, index) => (
          <RepositoryCard 
            key={repo.id} 
            repository={repo} 
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

RepositoryList.propTypes = {
  repositories: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired
};

export default RepositoryList;
